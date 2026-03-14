// src/lib/prompts/seo-analysis.ts
// SEO category analysis — Haiku for technical, Sonnet for content quality

import type { SupportedLanguage } from '../../../contracts/constants';

export interface SEOData {
  url: string;
  industry: string;
  businessSize: string;
  headTags: string;
  pageSpeedData: Record<string, unknown>;
  hasSitemap: boolean;
  hasRobots: boolean;
  hasSSL: boolean;
  hasSchema: boolean;
  canonicalUrl: string | null;
  redirectChains: string[];
  h1Tags: string[];
  h2Tags: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  imageAltTexts: { src: string; alt: string | null }[];
  internalLinks: number;
  externalLinks: number;
  contentWordCount: number;
  localSchema: Record<string, unknown> | null;
}

export const seoTechnicalPrompt = {
  system: (language: SupportedLanguage) =>
    `You are an expert technical SEO auditor. Analyze the provided website data and return a structured JSON assessment of technical SEO health. Always respond in ${language === 'es' ? 'Spanish' : 'English'}. Return ONLY valid JSON — no markdown fences, no commentary.`,

  user: (data: SEOData) =>
    `Analyze this website's technical SEO:

URL: ${data.url}
Industry: ${data.industry}
Business Size: ${data.businessSize}

SSL: ${data.hasSSL}
Sitemap exists: ${data.hasSitemap}
Robots.txt exists: ${data.hasRobots}
Schema markup: ${data.hasSchema}
Canonical URL: ${data.canonicalUrl ?? 'Not set'}
Redirect chains: ${data.redirectChains.length > 0 ? data.redirectChains.join(' → ') : 'None detected'}

Page Speed Data:
${JSON.stringify(data.pageSpeedData, null, 2)}

Return JSON matching this schema:
{
  "subCategories": [
    {
      "name": "Technical SEO",
      "score": 0-100,
      "items": [
        {
          "id": "ssl",
          "label": "SSL Certificate",
          "status": "pass" | "fail" | "warning",
          "detail": "Explanation of finding",
          "value": "current value if applicable",
          "benchmark": "expected value"
        }
      ]
    }
  ],
  "recommendations": [
    {
      "title": "Short action title",
      "description": "Detailed explanation of what to do and why — be specific enough that someone could act on this immediately",
      "priority": "high" | "medium" | "low",
      "effort": "quick-win" | "moderate" | "major-project",
      "impact": "high" | "medium" | "low"
    }
  ]
}

Items to evaluate:
- SSL certificate (pass if present)
- sitemap.xml (pass if present and valid)
- robots.txt (pass if present)
- Page speed / Core Web Vitals (LCP < 2.5s = pass, < 4s = warning, else fail; CLS < 0.1 = pass, < 0.25 = warning, else fail)
- Mobile-friendliness
- Schema/structured data markup
- Canonical tags
- Redirect chains (warning if > 2 hops)

Score 0-100 based on how many items pass vs fail.`,
};

export const seoContentPrompt = {
  system: (language: SupportedLanguage) =>
    `You are an expert SEO content analyst. Evaluate on-page SEO elements and content quality. Always respond in ${language === 'es' ? 'Spanish' : 'English'}. Return ONLY valid JSON — no markdown fences, no commentary.`,

  user: (data: SEOData) =>
    `Analyze this website's on-page and local SEO:

URL: ${data.url}
Industry: ${data.industry}

Meta Title: ${data.metaTitle ?? 'Missing'}
Meta Description: ${data.metaDescription ?? 'Missing'}
H1 Tags: ${data.h1Tags.length > 0 ? data.h1Tags.join(', ') : 'None found'}
H2 Tags: ${data.h2Tags.length > 0 ? data.h2Tags.join(', ') : 'None found'}
Image Alt Texts: ${JSON.stringify(data.imageAltTexts.slice(0, 20))}
Internal Links: ${data.internalLinks}
External Links: ${data.externalLinks}
Content Word Count: ${data.contentWordCount}
Local Schema: ${data.localSchema ? JSON.stringify(data.localSchema) : 'Not found'}

Head Tags:
${data.headTags}

Return JSON matching this schema:
{
  "subCategories": [
    {
      "name": "On-Page SEO",
      "score": 0-100,
      "items": [
        {
          "id": "meta_title",
          "label": "Meta Title",
          "status": "pass" | "fail" | "warning",
          "detail": "Explanation",
          "value": "current value",
          "benchmark": "50-60 characters, includes primary keyword"
        }
      ]
    },
    {
      "name": "Local SEO",
      "score": 0-100,
      "items": [...]
    }
  ],
  "recommendations": [
    {
      "title": "Short action title",
      "description": "Detailed, actionable explanation",
      "priority": "high" | "medium" | "low",
      "effort": "quick-win" | "moderate" | "major-project",
      "impact": "high" | "medium" | "low"
    }
  ]
}

On-Page items to evaluate:
- Meta title (50-60 chars, includes keyword = pass; too long/short = warning; missing = fail)
- Meta description (150-160 chars = pass; too long/short = warning; missing = fail)
- H1 tag (exactly 1 = pass; 0 or >1 = fail)
- H2 hierarchy (proper nesting = pass)
- Image alt texts (>80% have alts = pass; 50-80% = warning; <50% = fail)
- Internal linking (>5 = pass; 1-5 = warning; 0 = fail)
- Content length (>300 words = pass; 100-300 = warning; <100 = fail)

Local SEO items:
- NAP consistency markers
- Local schema markup
- Geo-targeted content signals`,
};
