# AGENT-AI-COPY — AI & Copy Agent Instructions

> Read `CLAUDE.md` first, then this file.

## Your Role
You own all AI interactions, prompt engineering, content generation, the landing page generator, and all bilingual copy. You are the voice of the product and the intelligence behind the analysis.

## Your Directories (YOU OWN THESE)
```
/src/lib/ai/
├── client.ts              # Anthropic API client (Sonnet + Haiku routing)
├── action-plan.ts         # Action plan generation from audit results
└── landing-gen.ts         # Landing page HTML generator

/src/lib/prompts/
├── seo-analysis.ts        # SEO category analysis prompts
├── website-analysis.ts    # Website category analysis prompts
├── social-analysis.ts     # Social media analysis prompts
├── branding-analysis.ts   # Branding & positioning analysis prompts
├── gbp-analysis.ts        # GBP analysis prompts
├── ads-analysis.ts        # Ads readiness analysis prompts
├── reputation-analysis.ts # Reputation analysis prompts
├── action-plan.ts         # Action plan generation prompt
├── landing-page.ts        # Landing page generation prompt
└── competitor-comparison.ts # Competitor analysis prompts

/src/lib/landing-gen/
├── generator.ts           # Main landing page HTML generation logic
├── templates.ts           # HTML template fragments
└── styles.ts              # Inline CSS for generated pages

/src/i18n/
├── en.json                # English translations (ALL user-facing copy)
├── es.json                # Spanish translations
└── config.ts              # next-intl configuration
```

## DO NOT TOUCH
- `/src/app/api/` (Backend Agent)
- `/src/components/` (Frontend Agent)
- `/src/lib/audit/` (Audit Engine Agent)
- `/src/lib/analyzers/` (Audit Engine Agent)
- `/contracts/` (Master only)

## AI Client Architecture

### Model Routing
```typescript
// /src/lib/ai/client.ts

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// Use Sonnet for deep analysis requiring reasoning
export async function analyzeWithSonnet(params: {
  systemPrompt: string;
  userPrompt: string;
  data?: Record<string, any>;
  language: 'en' | 'es';
  maxTokens?: number;
}): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: params.maxTokens || 4096,
    system: params.systemPrompt,
    messages: [{ role: 'user', content: params.userPrompt }],
  });
  return response.content[0].type === 'text' ? response.content[0].text : '';
}

// Use Haiku for simple/fast checks
export async function analyzeWithHaiku(params: {
  systemPrompt: string;
  userPrompt: string;
  data?: Record<string, any>;
  language: 'en' | 'es';
  maxTokens?: number;
}): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: params.maxTokens || 2048,
    system: params.systemPrompt,
    messages: [{ role: 'user', content: params.userPrompt }],
  });
  return response.content[0].type === 'text' ? response.content[0].text : '';
}
```

### Model Assignment
| Task | Model | Why |
|------|-------|-----|
| SEO technical checks | Haiku | Formulaic, structured data |
| SEO content quality | Sonnet | Requires understanding nuance |
| Website performance | Haiku | Numbers and thresholds |
| Website UX/conversion | Sonnet | Visual + strategic analysis |
| Social media analysis | Sonnet | Visual + content understanding |
| Branding & positioning | Sonnet | Deep strategic reasoning |
| GBP completeness | Haiku | Checklist-style |
| GBP review sentiment | Sonnet | Sentiment requires nuance |
| Ads readiness | Haiku | Technical detection |
| Reputation metrics | Haiku | Numbers and counts |
| Reputation sentiment | Sonnet | Sentiment analysis |
| Action plan generation | Sonnet | Strategic prioritization |
| Landing page generation | Sonnet | Creative + strategic |
| Competitor comparison | Sonnet | Comparative reasoning |

## Prompt Engineering Guidelines

### Every analysis prompt MUST:
1. Include the language parameter: `Respond in {language}.`
2. Request structured JSON output with a defined schema
3. Include scoring criteria (what constitutes pass/fail/warning)
4. Include the business context (industry, goals, size)
5. Be specific about what to analyze and what to ignore

### Prompt Template
```typescript
export const seoAnalysisPrompt = {
  system: `You are an expert SEO analyst. Analyze the provided website data and return a structured assessment. 
Always respond in {language}. Return ONLY valid JSON matching the provided schema.`,
  
  user: (data: SEOData) => `
Analyze this website's SEO performance:

URL: ${data.url}
Industry: ${data.industry}
Business Size: ${data.businessSize}

HTML Head Tags:
${data.headTags}

Page Speed Data:
${JSON.stringify(data.pageSpeedData, null, 2)}

Sitemap exists: ${data.hasSitemap}
Robots.txt exists: ${data.hasRobots}
SSL: ${data.hasSSL}
Schema markup: ${data.hasSchema}

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
      "description": "Detailed explanation of what to do and why",
      "priority": "high" | "medium" | "low",
      "effort": "quick-win" | "moderate" | "major-project",
      "impact": "high" | "medium" | "low"
    }
  ]
}`,
};
```

## Action Plan Generator

After all 7 categories complete, generate a unified action plan:

```typescript
// /src/lib/ai/action-plan.ts

export async function generateActionPlan(
  categoryResults: CategoryResult[],
  businessContext: { industry: string; goals: string; size: string },
  language: 'en' | 'es'
): Promise<Recommendation[]> {
  // Collect all recommendations from all categories
  // Send to Sonnet for prioritization and deduplication
  // Return a unified, priority-ranked action plan
  // Maximum 15-20 items, ordered by impact × ease
}
```

The action plan should be **overwhelmingly detailed** — this is what creates the "I can't do this myself" moment that drives calls.

## Landing Page Generator

Generate a live, interactive landing page based on audit data:

```typescript
// /src/lib/ai/landing-gen.ts

export async function generateLandingPage(
  auditData: AuditResult,
  businessInfo: { name: string; industry: string; url: string },
  brandColors: { primary: string; secondary: string; accent: string },
  language: 'en' | 'es'
): Promise<string> {
  // 1. Extract brand colors from their existing website (branding analyzer data)
  // 2. Generate headline, subheadline, CTA copy via Sonnet
  // 3. Build HTML page using templates.ts with their brand colors
  // 4. Include improvements from the audit recommendations
  // 5. Return complete HTML string
}
```

Requirements:
- Self-contained HTML (inline CSS, no external dependencies)
- Responsive (works on mobile)
- Uses THEIR brand colors (extracted from branding analysis)
- Includes improvements the audit recommended (better CTA, trust signals, etc.)
- Has a visible "Built by Forge" badge with CTA

## Bilingual Copy (i18n)

### English (`/src/i18n/en.json`)
```json
{
  "landing": {
    "hero": {
      "title": "Your online presence, scored in 60 seconds",
      "subtitle": "7 dimensions. Real data. Actionable plan.",
      "cta": "Start your free audit"
    },
    "howItWorks": {
      "title": "How it works",
      "step1": "Enter your business details",
      "step2": "AI analyzes 7 dimensions",
      "step3": "Get your score & action plan"
    }
  },
  "wizard": {
    "progress": "Step {current} of {total}",
    "step1": { "title": "Your business", ... },
    "step2": { "title": "Social presence", ... },
    ...
  },
  "results": {
    "overallScore": "Overall score",
    "grade": "Grade",
    "saveCta": "Save your results",
    "compareCta": "Compare with competitors",
    "bookCta": "Book a free strategy call",
    ...
  },
  "admin": { ... },
  "common": {
    "loading": "Loading...",
    "error": "Something went wrong",
    "retry": "Try again",
    ...
  }
}
```

### Spanish (`/src/i18n/es.json`)
Mirror structure with professional Spanish translations. Use formal "usted" tone for business context. All copy must feel native, not machine-translated.

## Key Principles
1. **Gift the information, sell the implementation.** Every recommendation should be detailed enough that they COULD do it themselves — but won't want to.
2. **Language matters.** The tone is professional but accessible. No jargon without explanation. No condescension.
3. **JSON output from AI must be validated.** Always wrap AI JSON parsing in try/catch with fallback.
4. **Prompts are your product.** Invest time in prompt engineering. A/B test different approaches. The quality of prompts directly determines audit quality.
