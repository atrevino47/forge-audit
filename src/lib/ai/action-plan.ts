// src/lib/ai/action-plan.ts
// Unified action plan generator — collects all category recommendations,
// sends to Sonnet for prioritization, deduplication, and phasing.

import type { CategoryResult, Recommendation, AuditCategory } from '../../../contracts/audit-types';
import type { SupportedLanguage } from '../../../contracts/constants';
import { analyzeWithSonnet, parseAIJSON } from './client';
import { actionPlanPrompt } from '../prompts/action-plan';

interface ActionPlanItem extends Recommendation {
  phase: 'immediate' | 'short-term' | 'medium-term';
  estimatedHours: string;
}

interface ActionPlanResponse {
  actionPlan: ActionPlanItem[];
}

/**
 * Generate a unified, priority-ranked action plan from all category results.
 * Maximum 15-20 items, ordered by impact × ease, grouped into phases.
 */
export async function generateActionPlan(
  categoryResults: CategoryResult[],
  businessContext: { industry: string; goals: string; size: string },
  language: SupportedLanguage
): Promise<Recommendation[]> {
  const categoryRecommendations = categoryResults
    .filter((cat) => cat.status === 'completed')
    .map((cat) => ({
      category: cat.category,
      score: cat.score,
      recommendations: cat.recommendations,
    }));

  if (categoryRecommendations.length === 0) {
    return [];
  }

  const systemPrompt = actionPlanPrompt.system(language);
  const userPrompt = actionPlanPrompt.user({
    industry: businessContext.industry,
    goals: businessContext.goals,
    businessSize: businessContext.size,
    language,
    categoryRecommendations,
  });

  const raw = await analyzeWithSonnet({
    systemPrompt,
    userPrompt,
    language,
    maxTokens: 8192,
  });

  const parsed = parseAIJSON<ActionPlanResponse>(raw);

  if (!parsed?.actionPlan || !Array.isArray(parsed.actionPlan)) {
    return buildFallbackPlan(categoryRecommendations);
  }

  return parsed.actionPlan.map((item, index) => ({
    id: item.id || `action_${index + 1}`,
    title: item.title,
    description: item.description,
    priority: item.priority,
    effort: item.effort,
    impact: item.impact,
    category: item.category,
  }));
}

/**
 * Fallback: if AI fails, return top recommendations from each category
 * sorted by priority, deduped by title similarity.
 */
function buildFallbackPlan(
  categories: { category: AuditCategory; score: number; recommendations: Recommendation[] }[]
): Recommendation[] {
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

  const allRecs = categories.flatMap((cat) =>
    cat.recommendations.map((rec) => ({
      ...rec,
      category: rec.category || cat.category,
    }))
  );

  allRecs.sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2));

  // Simple dedup by title prefix (first 30 chars)
  const seen = new Set<string>();
  const deduped: Recommendation[] = [];
  for (const rec of allRecs) {
    const key = rec.title.toLowerCase().slice(0, 30);
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(rec);
    }
    if (deduped.length >= 20) break;
  }

  return deduped;
}
