// src/lib/prompts/branding-analysis.ts
// Branding & positioning analysis — Sonnet (deep strategic reasoning)

import type { SupportedLanguage } from '../../../contracts/constants';

export interface BrandingData {
  url: string;
  industry: string;
  businessSize: string;
  businessName: string;
  extractedColors: string[];
  fonts: string[];
  logoDetected: boolean;
  tagline: string | null;
  valueProposition: string | null;
  aboutPageContent: string | null;
  socialBios: Record<string, string>;
  visualConsistencyNotes: string;
  screenshotBase64: string | null;
}

export const brandingAnalysisPrompt = {
  system: (language: SupportedLanguage) =>
    `You are a senior brand strategist and positioning expert. Analyze the business's visual identity, messaging, positioning, and cross-platform brand consistency. Provide strategic, high-value insights — not surface-level observations. Always respond in ${language === 'es' ? 'Spanish' : 'English'}. Return ONLY valid JSON — no markdown fences, no commentary.`,

  user: (data: BrandingData) =>
    `Analyze the branding and positioning of this business:

Business Name: ${data.businessName}
URL: ${data.url}
Industry: ${data.industry}
Business Size: ${data.businessSize}

VISUAL IDENTITY:
- Logo detected: ${data.logoDetected}
- Primary colors extracted: ${data.extractedColors.length > 0 ? data.extractedColors.join(', ') : 'Could not extract'}
- Fonts detected: ${data.fonts.length > 0 ? data.fonts.join(', ') : 'Could not detect'}
- Visual consistency notes: ${data.visualConsistencyNotes}

MESSAGING:
- Tagline: ${data.tagline ?? 'Not found'}
- Value proposition: ${data.valueProposition ?? 'Not clearly stated'}
- About page content: ${data.aboutPageContent ? data.aboutPageContent.slice(0, 1500) : 'Not found / not accessible'}

CROSS-PLATFORM:
- Social media bios: ${JSON.stringify(data.socialBios, null, 2)}

Return JSON matching this schema:
{
  "subCategories": [
    {
      "name": "Visual Identity",
      "score": 0-100,
      "items": [
        {
          "id": "logo_quality",
          "label": "Logo Presence & Quality",
          "status": "pass" | "fail" | "warning",
          "detail": "Assessment of logo and visual branding"
        },
        {
          "id": "color_consistency",
          "label": "Color Palette Consistency",
          "status": "pass" | "fail" | "warning",
          "detail": "Assessment of color usage"
        },
        {
          "id": "typography",
          "label": "Typography",
          "status": "pass" | "fail" | "warning",
          "detail": "Assessment of font choices and hierarchy"
        },
        {
          "id": "imagery",
          "label": "Imagery & Visual Style",
          "status": "pass" | "fail" | "warning",
          "detail": "Assessment of photography/illustration style"
        }
      ]
    },
    {
      "name": "Messaging & Voice",
      "score": 0-100,
      "items": [
        {
          "id": "value_prop",
          "label": "Value Proposition Clarity",
          "status": "pass" | "fail" | "warning",
          "detail": "Is it clear what the business does and why it matters?"
        },
        {
          "id": "tone_consistency",
          "label": "Tone Consistency",
          "status": "pass" | "fail" | "warning",
          "detail": "Does the brand voice stay consistent?"
        },
        {
          "id": "differentiation",
          "label": "Competitive Differentiation",
          "status": "pass" | "fail" | "warning",
          "detail": "What makes this brand different from competitors?"
        }
      ]
    },
    {
      "name": "Positioning & Strategy",
      "score": 0-100,
      "items": [
        {
          "id": "target_audience",
          "label": "Target Audience Clarity",
          "status": "pass" | "fail" | "warning",
          "detail": "Is the target audience clearly defined?"
        },
        {
          "id": "brand_story",
          "label": "Brand Story",
          "status": "pass" | "fail" | "warning",
          "detail": "Does the brand have a compelling narrative?"
        }
      ]
    },
    {
      "name": "Cross-Platform Consistency",
      "score": 0-100,
      "items": [
        {
          "id": "visual_match",
          "label": "Visual Consistency Across Platforms",
          "status": "pass" | "fail" | "warning",
          "detail": "Does the brand look the same on website and social media?"
        },
        {
          "id": "message_match",
          "label": "Messaging Consistency",
          "status": "pass" | "fail" | "warning",
          "detail": "Is the brand message consistent across touchpoints?"
        }
      ]
    }
  ],
  "recommendations": [
    {
      "title": "Short action title",
      "description": "Deep, strategic recommendation — explain the business impact, not just what to change. Include specific examples of what good looks like in their industry.",
      "priority": "high" | "medium" | "low",
      "effort": "quick-win" | "moderate" | "major-project",
      "impact": "high" | "medium" | "low"
    }
  ]
}

Be strategic in your analysis. Don't just check boxes — evaluate whether the brand positioning would resonate with their target market. Consider industry benchmarks and competitor expectations. Provide 4-6 recommendations that would meaningfully improve brand perception.`,
};
