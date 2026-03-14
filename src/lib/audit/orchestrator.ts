// src/lib/audit/orchestrator.ts
// Parallel orchestrator — dispatches 7 analyzers, coordinates DB updates + streaming

import { createClient } from '@supabase/supabase-js';
import type { AuditCategory, CategoryResult } from '../../../contracts/audit-types';
import { AUDIT_CATEGORIES } from '../../../contracts/constants';
import type { StartAuditRequest } from '../../../contracts/api-contracts';
import type { AuditInputs, CategoryJob } from './types';
import { ANALYZER_TIMEOUT_MS } from './types';
import {
  calculateOverallScore,
  calculateGrade,
  buildActionPlan,
  buildFailedCategoryResult,
} from './scoring';
import { analyzeSEO } from '../analyzers/seo';
import { analyzeWebsite } from '../analyzers/website';
import { analyzeSocial } from '../analyzers/social';
import { analyzeBranding } from '../analyzers/branding';
import { analyzeGBP } from '../analyzers/gbp';
import { analyzeAds } from '../analyzers/ads';
import { analyzeReputation } from '../analyzers/reputation';

// ─── Analyzer Registry ──────────────────────────────────────────────────────

const ANALYZERS: Record<AuditCategory, (inputs: AuditInputs) => Promise<CategoryResult>> = {
  seo: analyzeSEO,
  website: analyzeWebsite,
  social: analyzeSocial,
  branding: analyzeBranding,
  gbp: analyzeGBP,
  ads: analyzeAds,
  reputation: analyzeReputation,
};

// ─── Supabase Admin ──────────────────────────────────────────────────────────

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Run a full audit across all 7 categories in parallel.
 *
 * Flow:
 *  1. Mark audit as "running"
 *  2. Create audit_categories rows (pending)
 *  3. Dispatch all 7 analyzers via Promise.allSettled
 *  4. As each resolves, update its audit_categories row (SSE picks up changes)
 *  5. After all settle, compute overall score + grade + action plan
 *  6. Mark audit as "completed" (or "failed" if all analyzers failed)
 */
export async function runAudit(
  auditId: string,
  request: StartAuditRequest,
): Promise<void> {
  const inputs: AuditInputs = {
    auditId,
    websiteUrl: request.websiteUrl,
    businessName: request.businessName,
    socials: request.socials,
    gbpUrl: request.gbpUrl,
    goals: request.goals,
    language: request.language,
  };

  try {
    // ── Step 1: Mark audit as running ──────────────────────────────────────
    await db()
      .from('audits')
      .update({ status: 'running' })
      .eq('id', auditId);

    // ── Step 2: Create category rows ───────────────────────────────────────
    const jobs = await initializeCategoryRows(auditId);

    // ── Step 3: Run all analyzers in parallel ──────────────────────────────
    const promises = AUDIT_CATEGORIES.map((category) => {
      const job = jobs.find((j) => j.category === category)!;
      return runAnalyzerWithTimeout(job, inputs);
    });

    const results = await Promise.allSettled(promises);

    // ── Step 4: Collect results ────────────────────────────────────────────
    const categoryResults: CategoryResult[] = results.map((result, i) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return buildFailedCategoryResult(
        AUDIT_CATEGORIES[i],
        result.reason instanceof Error ? result.reason.message : 'Unexpected failure',
      );
    });

    // ── Step 5: Calculate overall score ─────────────────────────────────────
    const overallScore = calculateOverallScore(categoryResults);
    const grade = calculateGrade(overallScore);
    buildActionPlan(categoryResults); // side-effect: sorts recommendations

    // ── Step 6: Finalize audit ─────────────────────────────────────────────
    const hasAnySuccess = categoryResults.some((r) => r.status === 'completed');

    await db()
      .from('audits')
      .update({
        status: hasAnySuccess ? 'completed' : 'failed',
        overall_score: overallScore,
        overall_grade: grade,
        completed_at: new Date().toISOString(),
      })
      .eq('id', auditId);

    console.log(
      `[orchestrator] Audit ${auditId} completed: ${overallScore}/100 (${grade}), ` +
      `${categoryResults.filter((r) => r.status === 'completed').length}/7 categories succeeded`,
    );
  } catch (error) {
    console.error(`[orchestrator] Audit ${auditId} failed:`, error);

    await db()
      .from('audits')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', auditId);
  }
}

// ─── Category Row Initialization ─────────────────────────────────────────────

interface CategoryRow {
  id: string;
  category: string;
}

async function initializeCategoryRows(auditId: string): Promise<CategoryJob[]> {
  const rows = AUDIT_CATEGORIES.map((category) => ({
    audit_id: auditId,
    category,
    status: 'pending' as const,
  }));

  const { data, error } = await db()
    .from('audit_categories')
    .insert(rows)
    .select('id, category');

  if (error) throw new Error(`Failed to initialize category rows: ${error.message}`);

  return ((data ?? []) as CategoryRow[]).map((row) => ({
    category: row.category as AuditCategory,
    categoryId: row.id,
    status: 'pending' as const,
  }));
}

// ─── Per-Analyzer Execution ──────────────────────────────────────────────────

async function runAnalyzerWithTimeout(
  job: CategoryJob,
  inputs: AuditInputs,
): Promise<CategoryResult> {
  const analyzer = ANALYZERS[job.category];

  // Mark as running
  await db()
    .from('audit_categories')
    .update({
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .eq('id', job.categoryId);

  try {
    // Race the analyzer against the timeout
    const result = await Promise.race([
      analyzer(inputs),
      timeoutPromise(job.category),
    ]);

    // Write results to DB
    await db()
      .from('audit_categories')
      .update({
        status: result.status === 'completed' ? 'completed' : 'failed',
        score: result.score,
        results: result as unknown as Record<string, unknown>,
        recommendations: result.recommendations as unknown as Record<string, unknown>[],
        completed_at: new Date().toISOString(),
      })
      .eq('id', job.categoryId);

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const failedResult = buildFailedCategoryResult(job.category, errorMessage);

    // Write failure to DB
    await db()
      .from('audit_categories')
      .update({
        status: 'failed',
        score: 0,
        results: failedResult as unknown as Record<string, unknown>,
        completed_at: new Date().toISOString(),
      })
      .eq('id', job.categoryId);

    return failedResult;
  }
}

// ─── Timeout ─────────────────────────────────────────────────────────────────

function timeoutPromise(category: AuditCategory): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error(`${category} analyzer timed out after ${ANALYZER_TIMEOUT_MS / 1000}s`)),
      ANALYZER_TIMEOUT_MS,
    );
  });
}
