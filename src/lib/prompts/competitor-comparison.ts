// src/lib/prompts/competitor-comparison.ts
// Competitor analysis prompt — Sonnet (comparative reasoning)

import type { SupportedLanguage } from '../../../contracts/constants';
import type { AuditCategory } from '../../../contracts/audit-types';

export interface CompetitorComparisonInput {
  businessName: string;
  businessUrl: string;
  industry: string;
  language: SupportedLanguage;
  businessScores: Record<AuditCategory, number>;
  competitorName: string;
  competitorUrl: string;
  competitorScores: Record<AuditCategory, number>;
  businessHighlights: Record<AuditCategory, string[]>;
  competitorHighlights: Record<AuditCategory, string[]>;
}

export const competitorComparisonPrompt = {
  system: (language: SupportedLanguage) =>
    `You are a competitive intelligence analyst specializing in digital presence. Compare two businesses across all audit categories and identify specific gaps, advantages, and opportunities. Your analysis should be actionable — every comparison point should lead to a clear next step.

Always respond in ${language === 'es' ? 'Spanish' : 'English'}. Return ONLY valid JSON — no markdown fences, no commentary.`,

  user: (data: CompetitorComparisonInput) =>
    `Compare these two businesses' online presence:

YOUR BUSINESS:
- Name: ${data.businessName}
- URL: ${data.businessUrl}
- Scores: ${JSON.stringify(data.businessScores, null, 2)}
- Key findings by category: ${JSON.stringify(data.businessHighlights, null, 2)}

COMPETITOR:
- Name: ${data.competitorName}
- URL: ${data.competitorUrl}
- Scores: ${JSON.stringify(data.competitorScores, null, 2)}
- Key findings by category: ${JSON.stringify(data.competitorHighlights, null, 2)}

Industry: ${data.industry}

Return JSON matching this schema:
{
  "summary": {
    "headline": "One-line competitive position summary",
    "overallAdvantage": "business" | "competitor" | "tie",
    "businessTotalScore": 0-100,
    "competitorTotalScore": 0-100
  },
  "categoryComparisons": [
    {
      "category": "seo" | "website" | "social" | "branding" | "gbp" | "ads" | "reputation",
      "businessScore": 0-100,
      "competitorScore": 0-100,
      "winner": "business" | "competitor" | "tie",
      "gap": -100 to 100 (positive = business leads),
      "analysis": "2-3 sentence analysis of the competitive dynamics in this category",
      "opportunities": [
        "Specific actionable opportunity to close the gap or extend the lead"
      ]
    }
  ],
  "topOpportunities": [
    {
      "title": "Biggest competitive opportunity",
      "description": "Detailed explanation of the opportunity, what the competitor does well that can be learned from, or where the competitor is weak and can be overtaken",
      "priority": "high" | "medium" | "low",
      "effort": "quick-win" | "moderate" | "major-project",
      "impact": "high" | "medium" | "low",
      "category": "seo" | "website" | "social" | "branding" | "gbp" | "ads" | "reputation"
    }
  ],
  "competitiveEdges": [
    "Areas where the business already outperforms the competitor — reinforce these"
  ],
  "criticalGaps": [
    "Areas where the competitor significantly outperforms — address these first"
  ]
}

Rules:
1. Be honest — if the competitor is better in a category, say so clearly
2. Every comparison should lead to an actionable insight
3. Top opportunities: 5-8 items, ordered by impact
4. Be specific about WHAT the competitor does differently, not just the score gap
5. Include competitive edges to reinforce confidence
6. Critical gaps should highlight urgent areas where the business is falling behind`,
};
