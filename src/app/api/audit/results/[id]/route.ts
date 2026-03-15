import { NextResponse } from 'next/server';
import { errorResponse } from '@/app/api/_shared/helpers';
import { createServiceClient } from '@/lib/db/client';
import { GRADE_THRESHOLDS, CATEGORY_WEIGHTS, AUDIT_CATEGORIES } from '@contracts/constants';
import type { AuditResult, CategoryResult, Grade, AuditCategory, Recommendation, SubCategory } from '@contracts/audit-types';

/**
 * Determine the letter grade from a numeric score.
 */
function scoreToGrade(score: number): Grade {
  for (const { min, grade } of GRADE_THRESHOLDS) {
    if (score >= min) {
      return grade;
    }
  }
  return 'F';
}

/**
 * Compute the weighted overall score from individual category scores.
 */
function computeOverallScore(
  categoryScores: Partial<Record<AuditCategory, number>>
): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const cat of AUDIT_CATEGORIES) {
    const score = categoryScores[cat];
    if (score !== undefined) {
      const weight = CATEGORY_WEIGHTS[cat];
      weightedSum += score * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight === 0) return 0;
  return Math.round(weightedSum / totalWeight);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return errorResponse('INVALID_INPUT', 'Audit ID is required', 400);
    }

    const supabase = createServiceClient();

    // Fetch the audit record
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .select('id, status, overall_score, created_at, completed_at, lead_id')
      .eq('id', id)
      .single();

    if (auditError || !audit) {
      return errorResponse('NOT_FOUND', 'Audit not found', 404);
    }

    // If the audit is still running or pending, return 202
    if (audit.status === 'pending' || audit.status === 'running') {
      return NextResponse.json(
        {
          id: audit.id,
          status: audit.status,
          message: 'Audit is still in progress',
        },
        { status: 202 }
      );
    }

    // If the audit failed, return error
    if (audit.status === 'failed') {
      return errorResponse('AUDIT_FAILED', 'This audit failed to complete', 422);
    }

    // Fetch audit_categories
    const { data: categories, error: catError } = await supabase
      .from('audit_categories')
      .select('*')
      .eq('audit_id', id);

    if (catError) {
      console.error('Failed to fetch audit categories:', catError);
      return errorResponse('INTERNAL_ERROR', 'Failed to fetch audit categories', 500);
    }

    // Build category results
    const categoryScores: Partial<Record<AuditCategory, number>> = {};
    const categoryResults: CategoryResult[] = [];

    for (const cat of AUDIT_CATEGORIES) {
      const dbCat = categories?.find(
        (c) => c.category === cat
      );

      if (!dbCat) {
        // Category not yet available — skip
        continue;
      }

      const score = typeof dbCat.score === 'number' ? dbCat.score : 0;
      categoryScores[cat] = score;

      // Parse sub_categories and recommendations from JSON columns
      const subCategories: SubCategory[] = Array.isArray(dbCat.sub_categories)
        ? (dbCat.sub_categories as SubCategory[])
        : [];

      const recommendations: Recommendation[] = Array.isArray(dbCat.recommendations)
        ? (dbCat.recommendations as Recommendation[])
        : [];

      categoryResults.push({
        category: cat,
        score,
        status: (dbCat.status as CategoryResult['status']) ?? 'completed',
        subCategories,
        recommendations,
      });
    }

    // Compute overall score (use DB value if available, otherwise compute)
    const overallScore =
      typeof audit.overall_score === 'number'
        ? audit.overall_score
        : computeOverallScore(categoryScores);

    const grade = scoreToGrade(overallScore);

    // Build action plan from all high/medium priority recommendations
    const actionPlan: Recommendation[] = categoryResults
      .flatMap((c) => c.recommendations)
      .filter((r) => r.priority === 'high' || r.priority === 'medium')
      .sort((a, b) => {
        const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
        return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      });

    // Check for a generated landing page
    const { data: generatedPage } = await supabase
      .from('generated_pages')
      .select('id, preview_url')
      .eq('audit_id', id)
      .single();

    const result: AuditResult = {
      id: audit.id as string,
      overallScore,
      grade,
      categories: categoryResults,
      actionPlan,
      ...(generatedPage
        ? {
            generatedPage: {
              id: generatedPage.id as string,
              previewUrl: generatedPage.preview_url as string,
            },
          }
        : {}),
      createdAt: audit.created_at as string,
      completedAt: (audit.completed_at as string) ?? new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('GET /api/audit/results/[id] error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch audit results', 500);
  }
}
