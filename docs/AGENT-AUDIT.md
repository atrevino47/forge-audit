# AGENT-AUDIT — Audit Engine Agent Instructions

> Read `CLAUDE.md` first, then this file.

## Your Role
You own the core audit logic: all 7 category analyzers, the scoring system, the parallel orchestrator, and the streaming coordinator. You are the brain of the product — your code determines the quality and accuracy of every audit.

## Your Directories (YOU OWN THESE)
```
/src/lib/audit/
├── orchestrator.ts        # Dispatches 7 parallel analyses, coordinates streaming
├── scoring.ts             # Score calculation, grade assignment, weighting
├── rate-limiter.ts        # IP + email rate limit checks
└── types.ts               # Internal types (imports from /contracts/)

/src/lib/analyzers/
├── seo.ts                 # SEO analyzer (technical + on-page + local)
├── website.ts             # Website analyzer (speed, UX, mobile, conversion)
├── social.ts              # Social media analyzer
├── branding.ts            # Branding & positioning analyzer
├── gbp.ts                 # Google Business Profile analyzer
├── ads.ts                 # Ads readiness analyzer
├── reputation.ts          # Reputation & reviews analyzer
└── utils/
    ├── scraper.ts         # Website scraping utilities
    ├── screenshot.ts      # Screenshot capture (for AI visual analysis)
    └── api-clients.ts     # Google PageSpeed, Places API clients
```

## DO NOT TOUCH
- `/src/app/api/` (Backend Agent)
- `/src/components/` (Frontend Agent)
- `/src/lib/ai/` (AI/Copy Agent — you CALL their functions, don't write prompts)
- `/src/lib/prompts/` (AI/Copy Agent)
- `/contracts/` (Master only)

## Architecture Overview

```
Backend API Route (/api/audit/start)
    ↓ calls
orchestrator.runAudit(auditId, inputs)
    ↓ dispatches 7 parallel jobs
Promise.allSettled([
    analyzeSEO(inputs),
    analyzeWebsite(inputs),
    analyzeSocial(inputs),
    analyzeBranding(inputs),
    analyzeGBP(inputs),
    analyzeAds(inputs),
    analyzeReputation(inputs),
])
    ↓ each analyzer
    1. Fetches data (APIs, scraping)
    2. Runs AI analysis (calls AI/Copy Agent's functions)
    3. Calculates sub-scores
    4. Returns CategoryResult (matches contracts/audit-types.ts)
    ↓ orchestrator
    Updates audit_categories table as each completes
    SSE picks up changes and streams to client
    After all 7 complete → calculates overall score + grade
```

## Scoring System

### Category Weights (total = 100%)
| Category | Weight | Rationale |
|----------|--------|-----------|
| SEO | 20% | Directly impacts discoverability |
| Website | 20% | First impression, conversion |
| Social Media | 15% | Modern discovery channel |
| Branding | 15% | Differentiation, perception |
| GBP | 10% | Local visibility |
| Ads Readiness | 10% | Growth infrastructure |
| Reputation | 10% | Trust and social proof |

### Grade Calculation
```typescript
function calculateGrade(score: number): Grade {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 63) return 'D';
  if (score >= 60) return 'D-';
  return 'F';
}
```

### Sub-Score Calculation
Each analyzer returns items with pass/fail/warning status. Sub-scores are calculated as:
- Pass = 100 points
- Warning = 50 points
- Fail = 0 points
- Category score = weighted average of sub-category scores

## Analyzer Specifications

### SEO Analyzer (`seo.ts`)
**Data collection:**
- Fetch website HTML (scraper.ts)
- Call Google PageSpeed Insights API for Core Web Vitals
- Parse meta tags, H1/H2 hierarchy, sitemap.xml, robots.txt
- Check for schema markup (JSON-LD)
- Check SSL certificate

**Sub-categories & items:**
```
Technical SEO:
  - SSL certificate ✓/✗
  - sitemap.xml exists ✓/✗
  - robots.txt exists ✓/✗
  - Core Web Vitals (LCP < 2.5s, CLS < 0.1, INP < 200ms)
  - Page speed score (from PageSpeed API)
  - Mobile-friendly ✓/✗
  - Schema markup present ✓/✗
  - Canonical tags ✓/✗
  - No redirect chains ✓/✗

On-Page SEO:
  - H1 tag present and unique ✓/✗
  - Meta title present (50-60 chars) ✓/✗
  - Meta description present (150-160 chars) ✓/✗
  - Image alt text coverage (>80%) ✓/✗
  - Internal links present ✓/✗
  - Content length adequate (>300 words main page) ✓/✗

Local SEO:
  - NAP consistency (if GBP provided) ✓/✗
  - Local schema markup ✓/✗
  - Geo-targeted content signals ✓/✗
```

**AI Model:** Haiku for technical checks, Sonnet for content quality assessment

### Website Analyzer (`website.ts`)
**Data collection:**
- Google PageSpeed Insights API (performance metrics)
- Screenshot of homepage (for AI visual analysis)
- HTML parsing (CTA detection, form detection, trust signals)

**Sub-categories:** Performance, UX, Mobile, Conversion Elements
**AI Model:** Haiku for metrics, Sonnet for visual UX analysis

### Social Media Analyzer (`social.ts`)
**Data collection:**
- Public profile scraping (Instagram, Facebook, TikTok, LinkedIn)
- Profile metadata: bio, followers, post count, profile pic
- Recent posts (last 10-20): visual quality, caption quality, engagement
- Only analyze platforms the user provided handles for

**AI Model:** Sonnet (visual + content analysis)

### Branding Analyzer (`branding.ts`)
**Data collection:**
- Website screenshots (homepage + 1-2 inner pages)
- Social media profile screenshots
- Extract brand colors, fonts, imagery style

**AI Model:** Sonnet (deep strategic + visual analysis). This is the most AI-heavy analyzer.

### GBP Analyzer (`gbp.ts`)
**Data collection:**
- Google Places API (if GBP URL provided)
- Profile completeness, photos, reviews, posts
- Skip entirely if user selected "I don't have one"

**AI Model:** Haiku for completeness, Sonnet for review sentiment

### Ads Analyzer (`ads.ts`)
**Data collection:**
- HTML parsing: detect Meta Pixel, Google Analytics, GTM tags
- Check for conversion tracking setup
- Analyze funnel structure (landing page → thank you page)

**AI Model:** Haiku (mostly technical detection)

### Reputation Analyzer (`reputation.ts`)
**Data collection:**
- Google Places API (reviews, rating)
- Social media comment sentiment (from social analyzer data)
- Website testimonials detection

**AI Model:** Haiku for metrics, Sonnet for sentiment analysis

## Calling AI/Copy Agent Functions

You DO NOT write AI prompts. You call functions from `/src/lib/ai/`:
```typescript
import { analyzeWithSonnet, analyzeWithHaiku } from '@/lib/ai/client';

// In your analyzer:
const brandingAnalysis = await analyzeWithSonnet({
  prompt: prompts.brandingAnalysis, // from /src/lib/prompts/
  data: { screenshots, socialProfiles, websiteHtml },
  language: inputs.language,
});
```

The AI/Copy Agent provides the prompts and the client wrapper. You provide the data and handle the results.

## Error Handling per Analyzer
Each analyzer must handle failures gracefully:
- If an API call fails → mark that sub-category as "unavailable", don't fail the entire category
- If AI analysis fails → retry once, then mark as "analysis_error"
- If website is unreachable → provide partial results based on what's available
- Never let one analyzer failure block others (Promise.allSettled, not Promise.all)

## Database Updates
After each analyzer completes, update the `audit_categories` table immediately:
```typescript
await supabase
  .from('audit_categories')
  .update({
    status: 'completed',
    score: categoryResult.score,
    results: categoryResult,
    completed_at: new Date().toISOString(),
  })
  .eq('id', categoryId);
```
The SSE endpoint polls this table — your update triggers the frontend stream.

## Performance Requirements
- All 7 analyzers run in parallel (not sequential)
- Total audit time target: < 60 seconds
- Individual analyzer timeout: 30 seconds max
- If an analyzer times out, mark it as partial/failed and continue
