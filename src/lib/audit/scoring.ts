// src/lib/audit/scoring.ts
// Score calculation, grade assignment, weighting

import type {
  AuditItem,
  CategoryResult,
  Grade,
  SubCategory,
  AuditCategory,
  Recommendation,
} from '../../../contracts/audit-types';
import { CATEGORY_WEIGHTS, GRADE_THRESHOLDS } from '../../../contracts/constants';

// ─── Points per status ──────────────────────────────────────────────────────

const STATUS_POINTS: Record<AuditItem['status'], number> = {
  pass: 100,
  warning: 50,
  fail: 0,
  info: -1, // excluded from scoring
};

// ─── Sub-Category Scoring ────────────────────────────────────────────────────

/**
 * Calculate score for a single sub-category from its audit items.
 * Items with status "info" are excluded from the calculation.
 * Returns 0–100.
 */
export function calculateSubCategoryScore(items: AuditItem[]): number {
  const scorable = items.filter((item) => item.status !== 'info');
  if (scorable.length === 0) return 100;

  const total = scorable.reduce((sum, item) => sum + STATUS_POINTS[item.status], 0);
  return Math.round(total / scorable.length);
}

// ─── Category Scoring ────────────────────────────────────────────────────────

/**
 * Calculate score for a category from its sub-categories.
 * All sub-categories are equally weighted within a category.
 * Returns 0–100.
 */
export function calculateCategoryScore(subCategories: SubCategory[]): number {
  if (subCategories.length === 0) return 0;

  const total = subCategories.reduce((sum, sub) => sum + sub.score, 0);
  return Math.round(total / subCategories.length);
}

// ─── Overall Scoring ─────────────────────────────────────────────────────────

/**
 * Calculate the overall weighted score across all completed categories.
 * Failed categories are excluded and their weights redistributed proportionally.
 * Returns 0–100.
 */
export function calculateOverallScore(categoryResults: CategoryResult[]): number {
  const completed = categoryResults.filter((r) => r.status === 'completed');
  if (completed.length === 0) return 0;

  const totalWeight = completed.reduce(
    (sum, r) => sum + CATEGORY_WEIGHTS[r.category],
    0,
  );

  if (totalWeight === 0) return 0;

  const weightedSum = completed.reduce(
    (sum, r) => sum + r.score * (CATEGORY_WEIGHTS[r.category] / totalWeight),
    0,
  );

  return Math.round(weightedSum);
}

// ─── Grade Calculation ───────────────────────────────────────────────────────

/**
 * Map a numeric score (0–100) to a letter grade.
 */
export function calculateGrade(score: number): Grade {
  for (const threshold of GRADE_THRESHOLDS) {
    if (score >= threshold.min) {
      return threshold.grade;
    }
  }
  return 'F';
}

// ─── Builder Helpers ─────────────────────────────────────────────────────────

/**
 * Build a SubCategory with its score auto-calculated from items.
 */
export function buildSubCategory(name: string, items: AuditItem[]): SubCategory {
  return {
    name,
    score: calculateSubCategoryScore(items),
    items,
  };
}

/**
 * Build a complete CategoryResult from sub-categories and recommendations.
 * Automatically computes the category score.
 */
export function buildCategoryResult(
  category: AuditCategory,
  subCategories: SubCategory[],
  recommendations: Recommendation[],
): CategoryResult {
  return {
    category,
    score: calculateCategoryScore(subCategories),
    status: 'completed',
    subCategories,
    recommendations,
  };
}

/**
 * Build a failed CategoryResult when an analyzer encounters an unrecoverable error.
 */
export function buildFailedCategoryResult(
  category: AuditCategory,
  error: string,
): CategoryResult {
  return {
    category,
    score: 0,
    status: 'failed',
    subCategories: [],
    recommendations: [{
      id: `${category}-error`,
      title: 'Analysis Error',
      description: error,
      priority: 'high',
      effort: 'quick-win',
      impact: 'high',
      category,
    }],
  };
}

// ─── Action Plan ─────────────────────────────────────────────────────────────

/**
 * Merge recommendations from all categories into a prioritized action plan.
 * Sorted by: priority (high → low), then impact (high → low).
 */
export function buildActionPlan(categoryResults: CategoryResult[]): Recommendation[] {
  const allRecs = categoryResults.flatMap((r) => r.recommendations);

  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const impactOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

  return allRecs.sort((a, b) => {
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pDiff !== 0) return pDiff;
    return impactOrder[a.impact] - impactOrder[b.impact];
  });
}
