// src/lib/analyzers/website.ts
// Website Analyzer — Performance, UX, Mobile, Conversion Elements

import type { AuditItem, CategoryResult, Recommendation } from '../../../contracts/audit-types';
import type { AuditInputs, ScrapedPage } from '../audit/types';
import { buildSubCategory, buildCategoryResult, buildFailedCategoryResult } from '../audit/scoring';
import { scrapePage } from './utils/scraper';
import { fetchPageSpeedInsights } from './utils/api-clients';
import { captureScreenshot } from './utils/screenshot';
import { callAIForRecommendations } from '../audit/ai-bridge';

export async function analyzeWebsite(inputs: AuditInputs): Promise<CategoryResult> {
  try {
    const [pageResult, speedResult, screenshotResult] = await Promise.allSettled([
      scrapePage(inputs.websiteUrl),
      fetchPageSpeedInsights(inputs.websiteUrl),
      captureScreenshot(inputs.websiteUrl),
    ]);

    const page = pageResult.status === 'fulfilled' ? pageResult.value : null;
    const speed = speedResult.status === 'fulfilled' ? speedResult.value : null;
    const screenshot = screenshotResult.status === 'fulfilled' ? screenshotResult.value : null;

    // ── Performance ────────────────────────────────────────────────────────
    const perfItems: AuditItem[] = [
      {
        id: 'web-perf-score',
        label: 'Overall Performance Score',
        status: speed ? (speed.performanceScore >= 90 ? 'pass' : speed.performanceScore >= 50 ? 'warning' : 'fail') : 'warning',
        detail: speed ? `Google PageSpeed score: ${speed.performanceScore}/100` : 'PageSpeed data unavailable',
        value: speed?.performanceScore,
        benchmark: '≥ 90',
      },
      {
        id: 'web-perf-fcp',
        label: 'First Contentful Paint',
        status: speed ? (speed.metrics.fcp <= 1800 ? 'pass' : speed.metrics.fcp <= 3000 ? 'warning' : 'fail') : 'warning',
        detail: speed ? `FCP: ${(speed.metrics.fcp / 1000).toFixed(1)}s` : 'Not measured',
        value: speed ? `${(speed.metrics.fcp / 1000).toFixed(1)}s` : undefined,
        benchmark: '≤ 1.8s',
      },
      {
        id: 'web-perf-ttfb',
        label: 'Server Response Time (TTFB)',
        status: speed ? (speed.metrics.ttfb <= 800 ? 'pass' : speed.metrics.ttfb <= 1800 ? 'warning' : 'fail') : 'warning',
        detail: speed ? `TTFB: ${speed.metrics.ttfb}ms` : 'Not measured',
        value: speed ? `${speed.metrics.ttfb}ms` : undefined,
        benchmark: '≤ 800ms',
      },
      {
        id: 'web-perf-tbt',
        label: 'Total Blocking Time',
        status: speed ? (speed.metrics.tbt <= 200 ? 'pass' : speed.metrics.tbt <= 600 ? 'warning' : 'fail') : 'warning',
        detail: speed ? `TBT: ${speed.metrics.tbt}ms` : 'Not measured',
        value: speed ? `${speed.metrics.tbt}ms` : undefined,
        benchmark: '≤ 200ms',
      },
    ];

    const performance = buildSubCategory('Performance', perfItems);

    // ── UX ─────────────────────────────────────────────────────────────────
    const hasNav = page ? /<nav[\s>]/i.test(page.html) : false;
    const headingHierarchy = checkHeadingHierarchy(page);
    const readableFont = page ? /font-size/i.test(page.html) || page.meta.viewport !== undefined : false;

    const uxItems: AuditItem[] = [
      {
        id: 'web-ux-nav',
        label: 'Navigation Present',
        status: hasNav ? 'pass' : 'fail',
        detail: hasNav ? 'Navigation element found' : 'No <nav> element detected — users may struggle to find pages',
      },
      {
        id: 'web-ux-heading-hierarchy',
        label: 'Heading Hierarchy',
        status: headingHierarchy.valid ? 'pass' : 'warning',
        detail: headingHierarchy.detail,
      },
      {
        id: 'web-ux-readability',
        label: 'Readable Text',
        status: readableFont ? 'pass' : 'warning',
        detail: readableFont ? 'Font sizing appears configured' : 'No explicit font sizing found — text may be too small on some devices',
      },
      {
        id: 'web-ux-lang',
        label: 'Language Attribute',
        status: page && /<html[^>]*lang=/i.test(page.html) ? 'pass' : 'warning',
        detail: page && /<html[^>]*lang=/i.test(page.html)
          ? 'HTML lang attribute is set'
          : 'No lang attribute on <html> — affects accessibility and SEO',
      },
    ];

    const ux = buildSubCategory('User Experience', uxItems);

    // ── Mobile ─────────────────────────────────────────────────────────────
    const hasViewport = !!page?.meta.viewport;
    const viewportCorrect = page?.meta.viewport?.includes('width=device-width') ?? false;
    const hasTouchIcon = page ? /<link[^>]*apple-touch-icon/i.test(page.html) : false;

    const mobileItems: AuditItem[] = [
      {
        id: 'web-mobile-viewport',
        label: 'Viewport Meta Tag',
        status: viewportCorrect ? 'pass' : hasViewport ? 'warning' : 'fail',
        detail: viewportCorrect
          ? 'Correct viewport configuration found'
          : hasViewport
            ? 'Viewport tag exists but may not be optimal'
            : 'No viewport meta tag — site will not be responsive',
      },
      {
        id: 'web-mobile-responsive',
        label: 'Responsive Design Signals',
        status: page && (/@media/i.test(page.html) || viewportCorrect) ? 'pass' : 'warning',
        detail: page && /@media/i.test(page.html)
          ? 'Media queries detected in stylesheets'
          : 'No inline media queries found — verify external stylesheets',
      },
      {
        id: 'web-mobile-touch-icon',
        label: 'Mobile App Icon',
        status: hasTouchIcon ? 'pass' : 'info',
        detail: hasTouchIcon
          ? 'Apple touch icon configured'
          : 'No touch icon — optional but improves mobile bookmark experience',
      },
    ];

    const mobile = buildSubCategory('Mobile Readiness', mobileItems);

    // ── Conversion Elements ────────────────────────────────────────────────
    const hasCTA = page ? /class=["'][^"']*\b(cta|btn|button|action)\b/i.test(page.html) || /<button/i.test(page.html) : false;
    const hasForm = page ? /<form[\s>]/i.test(page.html) : false;
    const hasTrustSignals = page ? /testimonial|review|trust|secure|guarantee|certified/i.test(page.textContent) : false;
    const hasContact = page ? /contact|email|phone|call|schedule/i.test(page.textContent) : false;
    const hasSocialProof = page ? /client|customer|partner|featured|as seen/i.test(page.textContent) : false;

    const conversionItems: AuditItem[] = [
      {
        id: 'web-conv-cta',
        label: 'Call-to-Action Buttons',
        status: hasCTA ? 'pass' : 'fail',
        detail: hasCTA ? 'CTA buttons detected on the page' : 'No clear CTA buttons found — visitors may not know what to do next',
      },
      {
        id: 'web-conv-form',
        label: 'Lead Capture Form',
        status: hasForm ? 'pass' : 'warning',
        detail: hasForm ? 'Form element found on the page' : 'No form found — consider adding a contact or lead capture form',
      },
      {
        id: 'web-conv-trust',
        label: 'Trust Signals',
        status: hasTrustSignals ? 'pass' : 'warning',
        detail: hasTrustSignals
          ? 'Trust-related content detected (testimonials, guarantees, etc.)'
          : 'No obvious trust signals — consider adding reviews, badges, or guarantees',
      },
      {
        id: 'web-conv-contact',
        label: 'Contact Information',
        status: hasContact ? 'pass' : 'fail',
        detail: hasContact ? 'Contact-related keywords found' : 'No contact information visible — a major conversion blocker',
      },
      {
        id: 'web-conv-social-proof',
        label: 'Social Proof',
        status: hasSocialProof ? 'pass' : 'warning',
        detail: hasSocialProof
          ? 'Social proof elements detected (clients, partners, etc.)'
          : 'No social proof found — consider showcasing client logos or case studies',
      },
    ];

    const conversion = buildSubCategory('Conversion Elements', conversionItems);

    // ── AI Visual Analysis ─────────────────────────────────────────────────
    const recommendations = await generateRecommendations(
      [performance, ux, mobile, conversion],
      page,
      screenshot,
      inputs,
    );

    return buildCategoryResult('website', [performance, ux, mobile, conversion], recommendations);
  } catch (error) {
    return buildFailedCategoryResult(
      'website',
      `Website analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function checkHeadingHierarchy(page: ScrapedPage | null): { valid: boolean; detail: string } {
  if (!page || page.headings.length === 0) {
    return { valid: false, detail: 'No headings found on the page' };
  }

  const levels = page.headings.map((h) => parseInt(h.tag.replace('h', ''), 10));
  // Check that the first heading is h1 and levels don't skip
  if (levels[0] !== 1) {
    return { valid: false, detail: `First heading is ${page.headings[0].tag} instead of h1` };
  }

  for (let i = 1; i < levels.length; i++) {
    if (levels[i] > levels[i - 1] + 1) {
      return { valid: false, detail: `Heading hierarchy skips from h${levels[i - 1]} to h${levels[i]}` };
    }
  }

  return { valid: true, detail: `${page.headings.length} headings with correct hierarchy` };
}

async function generateRecommendations(
  subCategories: { name: string; score: number; items: AuditItem[] }[],
  page: ScrapedPage | null,
  screenshot: { imageBase64: string } | null,
  inputs: AuditInputs,
): Promise<Recommendation[]> {
  const issues = subCategories.flatMap((sub) =>
    sub.items
      .filter((item) => item.status === 'fail' || item.status === 'warning')
      .map((item) => ({ subCategory: sub.name, label: item.label, status: item.status, detail: item.detail })),
  );

  try {
    const analysis = await callAIForRecommendations({
      task: 'website-recommendations',
      data: {
        issues,
        industry: inputs.goals.industry,
        hasScreenshot: !!screenshot,
        screenshotBase64: screenshot?.imageBase64,
        textContent: page?.textContent.slice(0, 2000),
      },
      language: inputs.language,
      model: screenshot ? 'sonnet' : 'haiku',
    });

    return analysis.recommendations.map((rec, i) => ({
      id: `web-rec-${i}`,
      title: rec.title,
      description: rec.description,
      priority: rec.priority,
      effort: rec.effort,
      impact: rec.impact,
      category: 'website' as const,
    }));
  } catch {
    return issues.slice(0, 5).map((issue, i) => ({
      id: `web-rec-${i}`,
      title: `Fix: ${issue.label}`,
      description: issue.detail,
      priority: issue.status === 'fail' ? 'high' as const : 'medium' as const,
      effort: 'quick-win' as const,
      impact: issue.status === 'fail' ? 'high' as const : 'medium' as const,
      category: 'website' as const,
    }));
  }
}
