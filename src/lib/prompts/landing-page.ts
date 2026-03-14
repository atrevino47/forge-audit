// src/lib/prompts/landing-page.ts
// Landing page copy generation prompt — Sonnet (creative + strategic)

import type { SupportedLanguage } from '../../../contracts/constants';

export interface LandingPageCopyInput {
  businessName: string;
  industry: string;
  url: string;
  language: SupportedLanguage;
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  auditHighlights: {
    overallScore: number;
    topStrengths: string[];
    topWeaknesses: string[];
    topRecommendations: string[];
  };
  valueProposition: string | null;
}

export const landingPageCopyPrompt = {
  system: (language: SupportedLanguage) =>
    `You are an expert copywriter and conversion rate optimization specialist. Generate compelling, conversion-focused copy for a business landing page. The copy should showcase the business's strengths while addressing weaknesses identified in the audit.

Write in a professional but accessible tone. Focus on benefits over features. Include trust-building elements and clear calls to action.

Always respond in ${language === 'es' ? 'Spanish' : 'English'}. Return ONLY valid JSON — no markdown fences, no commentary.`,

  user: (data: LandingPageCopyInput) =>
    `Generate landing page copy for this business:

Business: ${data.businessName}
Industry: ${data.industry}
Website: ${data.url}
Current value proposition: ${data.valueProposition ?? 'Not clearly defined'}

Audit Highlights:
- Overall score: ${data.auditHighlights.overallScore}/100
- Strengths: ${data.auditHighlights.topStrengths.join(', ')}
- Areas to improve: ${data.auditHighlights.topWeaknesses.join(', ')}
- Key recommendations applied: ${data.auditHighlights.topRecommendations.join(', ')}

Brand Colors:
- Primary: ${data.brandColors.primary}
- Secondary: ${data.brandColors.secondary}
- Accent: ${data.brandColors.accent}

Return JSON matching this schema:
{
  "hero": {
    "headline": "Benefit-driven headline (max 10 words)",
    "subheadline": "Supporting statement that expands on the headline (max 25 words)",
    "ctaText": "Action-oriented CTA button text (max 5 words)",
    "ctaSubtext": "Risk-reversal text below CTA (e.g., 'No commitment required')"
  },
  "features": [
    {
      "title": "Feature/benefit title",
      "description": "2-3 sentence description focusing on customer benefit",
      "icon": "shield" | "zap" | "trending-up" | "users" | "star" | "check-circle"
    }
  ],
  "socialProof": {
    "headline": "Social proof section headline",
    "stats": [
      { "value": "50+", "label": "Happy Clients" }
    ]
  },
  "about": {
    "headline": "About section headline",
    "body": "2-3 paragraph description of the business — professional, trustworthy, benefit-focused"
  },
  "cta": {
    "headline": "Final CTA section headline",
    "subheadline": "Urgency or benefit reinforcement",
    "buttonText": "CTA button text",
    "contactInfo": "Phone or email placeholder"
  },
  "meta": {
    "pageTitle": "SEO-optimized page title (50-60 chars)",
    "pageDescription": "Meta description (150-160 chars)"
  }
}

Guidelines:
- Headline should address the customer's primary pain point for the industry
- Features should reflect improvements from audit recommendations
- Social proof stats should be realistic placeholders the business can customize
- CTA should create urgency without being pushy
- All copy must feel premium and trustworthy
- Include 3-4 features/benefits`,
};
