// src/lib/prompts/website-analysis.ts
// Website quality analysis — Haiku for performance, Sonnet for UX/conversion

import type { SupportedLanguage } from '../../../contracts/constants';

export interface WebsiteData {
  url: string;
  industry: string;
  businessSize: string;
  lighthouseScores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
    inp: number;
    ttfb: number;
  };
  mobileViewport: boolean;
  touchTargetIssues: number;
  screenshotBase64: string | null;
  hasContactForm: boolean;
  hasCTA: boolean;
  ctaTexts: string[];
  hasSocialProof: boolean;
  trustSignals: string[];
  navigationItems: string[];
  aboveFoldContent: string;
}

export const websitePerformancePrompt = {
  system: (language: SupportedLanguage) =>
    `You are a web performance expert. Analyze website speed and mobile metrics and return a structured JSON assessment. Always respond in ${language === 'es' ? 'Spanish' : 'English'}. Return ONLY valid JSON — no markdown fences, no commentary.`,

  user: (data: WebsiteData) =>
    `Analyze this website's performance and mobile readiness:

URL: ${data.url}
Industry: ${data.industry}

Lighthouse Scores:
- Performance: ${data.lighthouseScores.performance}
- Accessibility: ${data.lighthouseScores.accessibility}
- Best Practices: ${data.lighthouseScores.bestPractices}
- SEO: ${data.lighthouseScores.seo}

Core Web Vitals:
- LCP: ${data.coreWebVitals.lcp}ms
- FID: ${data.coreWebVitals.fid}ms
- CLS: ${data.coreWebVitals.cls}
- INP: ${data.coreWebVitals.inp}ms
- TTFB: ${data.coreWebVitals.ttfb}ms

Mobile viewport configured: ${data.mobileViewport}
Touch target issues: ${data.touchTargetIssues}

Return JSON matching this schema:
{
  "subCategories": [
    {
      "name": "Performance",
      "score": 0-100,
      "items": [
        {
          "id": "lcp",
          "label": "Largest Contentful Paint",
          "status": "pass" | "fail" | "warning",
          "detail": "Explanation",
          "value": "measured value",
          "benchmark": "< 2.5s"
        }
      ]
    },
    {
      "name": "Mobile Readiness",
      "score": 0-100,
      "items": [...]
    }
  ],
  "recommendations": [
    {
      "title": "Short action title",
      "description": "Detailed, actionable explanation with specific steps",
      "priority": "high" | "medium" | "low",
      "effort": "quick-win" | "moderate" | "major-project",
      "impact": "high" | "medium" | "low"
    }
  ]
}

Performance thresholds:
- LCP: <2.5s = pass, 2.5-4s = warning, >4s = fail
- CLS: <0.1 = pass, 0.1-0.25 = warning, >0.25 = fail
- FID: <100ms = pass, 100-300ms = warning, >300ms = fail
- INP: <200ms = pass, 200-500ms = warning, >500ms = fail
- TTFB: <800ms = pass, 800-1800ms = warning, >1800ms = fail
- Lighthouse Performance: ≥90 = pass, 50-89 = warning, <50 = fail

Mobile thresholds:
- Viewport configured: pass/fail
- Touch targets: 0 issues = pass, 1-3 = warning, >3 = fail`,
};

export const websiteUXConversionPrompt = {
  system: (language: SupportedLanguage) =>
    `You are a UX and conversion rate optimization expert. Analyze the website's user experience, navigation, and conversion elements. Always respond in ${language === 'es' ? 'Spanish' : 'English'}. Return ONLY valid JSON — no markdown fences, no commentary.`,

  user: (data: WebsiteData) =>
    `Analyze this website's UX and conversion optimization:

URL: ${data.url}
Industry: ${data.industry}
Business Size: ${data.businessSize}

Navigation items: ${data.navigationItems.join(', ')}
Above-the-fold content summary: ${data.aboveFoldContent}

Has contact form: ${data.hasContactForm}
Has CTA: ${data.hasCTA}
CTA texts found: ${data.ctaTexts.length > 0 ? data.ctaTexts.join(', ') : 'None'}
Has social proof: ${data.hasSocialProof}
Trust signals found: ${data.trustSignals.length > 0 ? data.trustSignals.join(', ') : 'None'}

Accessibility score: ${data.lighthouseScores.accessibility}

Return JSON matching this schema:
{
  "subCategories": [
    {
      "name": "User Experience",
      "score": 0-100,
      "items": [
        {
          "id": "navigation",
          "label": "Navigation Clarity",
          "status": "pass" | "fail" | "warning",
          "detail": "Assessment of navigation structure"
        }
      ]
    },
    {
      "name": "Conversion Optimization",
      "score": 0-100,
      "items": [...]
    }
  ],
  "recommendations": [
    {
      "title": "Short action title",
      "description": "Detailed, actionable explanation — specific enough to implement immediately",
      "priority": "high" | "medium" | "low",
      "effort": "quick-win" | "moderate" | "major-project",
      "impact": "high" | "medium" | "low"
    }
  ]
}

UX items to evaluate:
- Navigation clarity (logical grouping, not too many items)
- Above-the-fold content (clear value prop visible without scrolling)
- Readability (appropriate font sizes, contrast)
- Accessibility score (≥90 = pass, 70-89 = warning, <70 = fail)

Conversion items to evaluate:
- CTA presence (at least one clear CTA = pass; vague CTA = warning; none = fail)
- CTA clarity (action-oriented text like "Get Started" vs vague "Click Here")
- Contact form (present and accessible = pass; missing = fail for service businesses)
- Trust signals (testimonials, logos, certifications: ≥2 = pass, 1 = warning, 0 = fail)
- Social proof elements
- Urgency/scarcity elements (nice to have, not required)`,
};
