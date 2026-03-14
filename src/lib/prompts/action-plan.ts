// src/lib/prompts/action-plan.ts
// Unified action plan generation prompt — Sonnet (strategic prioritization)

import type { SupportedLanguage } from '../../../contracts/constants';
import type { Recommendation, AuditCategory } from '../../../contracts/audit-types';

export interface ActionPlanInput {
  industry: string;
  goals: string;
  businessSize: string;
  language: SupportedLanguage;
  categoryRecommendations: {
    category: AuditCategory;
    score: number;
    recommendations: Recommendation[];
  }[];
}

export const actionPlanPrompt = {
  system: (language: SupportedLanguage) =>
    `You are a senior digital strategy consultant. Your job is to take all the recommendations from a 7-category online presence audit and produce a single, unified, priority-ranked action plan.

Your action plan must be OVERWHELMINGLY detailed — this is what creates the "I can't do this myself" moment that drives the prospect to hire professional help. Every recommendation should be specific enough that they COULD do it themselves, but won't want to.

Deduplicate similar recommendations across categories. Prioritize by (impact × ease). Group into immediate (week 1-2), short-term (month 1-2), and medium-term (month 3-6) phases.

Always respond in ${language === 'es' ? 'Spanish' : 'English'}. Return ONLY valid JSON — no markdown fences, no commentary.`,

  user: (data: ActionPlanInput) =>
    `Generate a unified action plan from this audit:

Industry: ${data.industry}
Business Goals: ${data.goals}
Business Size: ${data.businessSize}

CATEGORY SCORES & RECOMMENDATIONS:
${data.categoryRecommendations
  .map(
    (cat) => `
--- ${cat.category.toUpperCase()} (Score: ${cat.score}/100) ---
${cat.recommendations.map((r) => `• [${r.priority}] ${r.title}: ${r.description}`).join('\n')}`
  )
  .join('\n')}

Return JSON matching this schema — maximum 20 items, minimum 12:
{
  "actionPlan": [
    {
      "id": "action_1",
      "title": "Clear, actionable title",
      "description": "Extremely detailed explanation: what to do, why it matters, specific steps to implement, tools needed, expected outcome. This description should be 3-5 sentences minimum. Include specific metrics or benchmarks where relevant.",
      "priority": "high" | "medium" | "low",
      "effort": "quick-win" | "moderate" | "major-project",
      "impact": "high" | "medium" | "low",
      "category": "seo" | "website" | "social" | "branding" | "gbp" | "ads" | "reputation",
      "phase": "immediate" | "short-term" | "medium-term",
      "estimatedHours": "2-4h" | "8-16h" | "40h+" (rough estimate for professional implementation)
    }
  ]
}

Rules:
1. Order by priority descending, then by impact descending
2. First 5-7 items should be "immediate" phase (quick wins with high impact)
3. Next 5-7 items should be "short-term" phase
4. Remaining items should be "medium-term" phase
5. Deduplicate: if SEO and Website both recommend "improve page speed", merge into one item
6. Every item must reference its source category
7. Be specific to the business's industry — generic advice is worthless
8. Include estimated professional implementation time to reinforce the scope of work`,
};
