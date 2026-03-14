// src/lib/analyzers/seo.ts
// SEO Analyzer — Technical SEO, On-Page SEO, Local SEO

import type { AuditItem, CategoryResult, Recommendation } from '../../../contracts/audit-types';
import type { AuditInputs, AIAnalysisResult } from '../audit/types';
import { buildSubCategory, buildCategoryResult, buildFailedCategoryResult } from '../audit/scoring';
import { scrapePage, checkSitemap, checkRobotsTxt, checkRedirectChain } from './utils/scraper';
import { fetchPageSpeedInsights } from './utils/api-clients';
import { callAIForRecommendations } from '../audit/ai-bridge';

export async function analyzeSEO(inputs: AuditInputs): Promise<CategoryResult> {
  try {
    // ── Fetch all data in parallel ─────────────────────────────────────────
    const [pageResult, speedResult, sitemapResult, robotsResult, redirectResult] =
      await Promise.allSettled([
        scrapePage(inputs.websiteUrl),
        fetchPageSpeedInsights(inputs.websiteUrl),
        checkSitemap(inputs.websiteUrl),
        checkRobotsTxt(inputs.websiteUrl),
        checkRedirectChain(inputs.websiteUrl),
      ]);

    const page = pageResult.status === 'fulfilled' ? pageResult.value : null;
    const speed = speedResult.status === 'fulfilled' ? speedResult.value : null;
    const sitemap = sitemapResult.status === 'fulfilled' ? sitemapResult.value : null;
    const robots = robotsResult.status === 'fulfilled' ? robotsResult.value : null;
    const redirects = redirectResult.status === 'fulfilled' ? redirectResult.value : null;

    // ── Technical SEO ──────────────────────────────────────────────────────
    const technicalItems: AuditItem[] = [
      {
        id: 'seo-tech-ssl',
        label: 'SSL Certificate',
        status: page?.hasSSL ? 'pass' : 'fail',
        detail: page?.hasSSL
          ? 'Site is served over HTTPS'
          : 'Site is not using HTTPS — browsers will show a security warning',
      },
      {
        id: 'seo-tech-sitemap',
        label: 'XML Sitemap',
        status: sitemap?.exists ? 'pass' : 'fail',
        detail: sitemap?.exists
          ? `Sitemap found at ${sitemap.url}`
          : 'No sitemap.xml found — search engines may not discover all pages',
      },
      {
        id: 'seo-tech-robots',
        label: 'robots.txt',
        status: robots?.exists ? 'pass' : 'warning',
        detail: robots?.exists
          ? 'robots.txt is present and valid'
          : 'No robots.txt found — recommended for controlling crawler access',
      },
      {
        id: 'seo-tech-lcp',
        label: 'Largest Contentful Paint',
        status: speed ? (speed.metrics.lcp <= 2500 ? 'pass' : speed.metrics.lcp <= 4000 ? 'warning' : 'fail') : 'warning',
        detail: speed
          ? `LCP: ${(speed.metrics.lcp / 1000).toFixed(1)}s`
          : 'Could not measure — PageSpeed API unavailable',
        value: speed ? `${(speed.metrics.lcp / 1000).toFixed(1)}s` : undefined,
        benchmark: '≤ 2.5s',
      },
      {
        id: 'seo-tech-cls',
        label: 'Cumulative Layout Shift',
        status: speed ? (speed.metrics.cls <= 0.1 ? 'pass' : speed.metrics.cls <= 0.25 ? 'warning' : 'fail') : 'warning',
        detail: speed
          ? `CLS: ${speed.metrics.cls.toFixed(3)}`
          : 'Could not measure — PageSpeed API unavailable',
        value: speed?.metrics.cls.toFixed(3),
        benchmark: '≤ 0.1',
      },
      {
        id: 'seo-tech-inp',
        label: 'Interaction to Next Paint',
        status: speed ? (speed.metrics.inp <= 200 ? 'pass' : speed.metrics.inp <= 500 ? 'warning' : 'fail') : 'warning',
        detail: speed
          ? `INP: ${speed.metrics.inp}ms`
          : 'Could not measure — PageSpeed API unavailable',
        value: speed ? `${speed.metrics.inp}ms` : undefined,
        benchmark: '≤ 200ms',
      },
      {
        id: 'seo-tech-pagespeed',
        label: 'PageSpeed Score',
        status: speed ? (speed.performanceScore >= 90 ? 'pass' : speed.performanceScore >= 50 ? 'warning' : 'fail') : 'warning',
        detail: speed
          ? `Performance score: ${speed.performanceScore}/100`
          : 'Could not measure — PageSpeed API unavailable',
        value: speed?.performanceScore,
        benchmark: '≥ 90',
      },
      {
        id: 'seo-tech-mobile',
        label: 'Mobile-Friendly',
        status: page?.meta.viewport ? 'pass' : 'fail',
        detail: page?.meta.viewport
          ? 'Viewport meta tag is set for responsive design'
          : 'No viewport meta tag found — site may not render properly on mobile',
      },
      {
        id: 'seo-tech-schema',
        label: 'Schema Markup (JSON-LD)',
        status: page && page.schemaMarkup.length > 0 ? 'pass' : 'warning',
        detail: page && page.schemaMarkup.length > 0
          ? `Found ${page.schemaMarkup.length} structured data block(s)`
          : 'No JSON-LD schema markup found — rich search results unavailable',
      },
      {
        id: 'seo-tech-canonical',
        label: 'Canonical Tag',
        status: page?.meta.canonical ? 'pass' : 'warning',
        detail: page?.meta.canonical
          ? `Canonical URL set to ${page.meta.canonical}`
          : 'No canonical tag found — may cause duplicate content issues',
      },
      {
        id: 'seo-tech-redirects',
        label: 'No Redirect Chains',
        status: redirects ? (redirects.hasChain ? 'warning' : 'pass') : 'warning',
        detail: redirects?.hasChain
          ? `Redirect chain detected: ${redirects.chain.length} hops`
          : 'No redirect chains detected',
      },
    ];

    const technicalSEO = buildSubCategory('Technical SEO', technicalItems);

    // ── On-Page SEO ────────────────────────────────────────────────────────
    const h1Tags = page?.headings.filter((h) => h.tag === 'h1') ?? [];
    const imgCount = page?.images.length ?? 0;
    const imgWithAlt = page?.images.filter((i) => i.alt && i.alt.trim().length > 0).length ?? 0;
    const altCoverage = imgCount > 0 ? imgWithAlt / imgCount : 1;
    const internalLinks = page?.links.filter((l) => l.isInternal) ?? [];
    const titleLen = page?.meta.title?.length ?? 0;
    const descLen = page?.meta.description?.length ?? 0;

    const onPageItems: AuditItem[] = [
      {
        id: 'seo-onpage-h1',
        label: 'H1 Tag',
        status: h1Tags.length === 1 ? 'pass' : h1Tags.length === 0 ? 'fail' : 'warning',
        detail: h1Tags.length === 1
          ? `H1 found: "${h1Tags[0].text.slice(0, 80)}"`
          : h1Tags.length === 0
            ? 'No H1 tag found on the page'
            : `Multiple H1 tags found (${h1Tags.length}) — should have exactly one`,
      },
      {
        id: 'seo-onpage-title',
        label: 'Meta Title',
        status: titleLen >= 50 && titleLen <= 60 ? 'pass' : titleLen > 0 ? 'warning' : 'fail',
        detail: page?.meta.title
          ? `"${page.meta.title.slice(0, 70)}" (${titleLen} chars)`
          : 'No meta title found',
        value: titleLen > 0 ? `${titleLen} chars` : undefined,
        benchmark: '50–60 chars',
      },
      {
        id: 'seo-onpage-description',
        label: 'Meta Description',
        status: descLen >= 150 && descLen <= 160 ? 'pass' : descLen > 0 ? 'warning' : 'fail',
        detail: page?.meta.description
          ? `"${page.meta.description.slice(0, 80)}..." (${descLen} chars)`
          : 'No meta description found',
        value: descLen > 0 ? `${descLen} chars` : undefined,
        benchmark: '150–160 chars',
      },
      {
        id: 'seo-onpage-alt',
        label: 'Image Alt Text Coverage',
        status: altCoverage >= 0.8 ? 'pass' : altCoverage >= 0.5 ? 'warning' : 'fail',
        detail: imgCount === 0
          ? 'No images found on the page'
          : `${imgWithAlt} of ${imgCount} images have alt text (${Math.round(altCoverage * 100)}%)`,
        value: `${Math.round(altCoverage * 100)}%`,
        benchmark: '≥ 80%',
      },
      {
        id: 'seo-onpage-internal-links',
        label: 'Internal Links',
        status: internalLinks.length >= 3 ? 'pass' : internalLinks.length > 0 ? 'warning' : 'fail',
        detail: `${internalLinks.length} internal link(s) found`,
        value: internalLinks.length,
      },
      {
        id: 'seo-onpage-content',
        label: 'Content Length',
        status: (page?.wordCount ?? 0) >= 300 ? 'pass' : (page?.wordCount ?? 0) >= 100 ? 'warning' : 'fail',
        detail: `${page?.wordCount ?? 0} words on the main page`,
        value: page?.wordCount ?? 0,
        benchmark: '≥ 300 words',
      },
    ];

    const onPageSEO = buildSubCategory('On-Page SEO', onPageItems);

    // ── Local SEO ──────────────────────────────────────────────────────────
    const hasLocalSchema = page?.schemaMarkup.some(
      (s) => s['@type'] === 'LocalBusiness' || s['@type'] === 'Organization',
    ) ?? false;
    const hasGeoContent = page ? /address|location|serving|located|near/i.test(page.textContent) : false;
    const hasNAP = page ? (/\(\d{3}\)\s?\d{3}[-.]\d{4}|\d{3}[-.]\d{3}[-.]\d{4}/.test(page.textContent)) : false;

    const localItems: AuditItem[] = [
      {
        id: 'seo-local-nap',
        label: 'NAP Info Visible',
        status: hasNAP ? 'pass' : inputs.gbpUrl ? 'warning' : 'info',
        detail: hasNAP
          ? 'Phone number pattern detected on page'
          : 'No phone number pattern found on the homepage',
      },
      {
        id: 'seo-local-schema',
        label: 'Local Business Schema',
        status: hasLocalSchema ? 'pass' : 'warning',
        detail: hasLocalSchema
          ? 'LocalBusiness or Organization schema markup found'
          : 'No local business schema markup — limits rich local search results',
      },
      {
        id: 'seo-local-geo',
        label: 'Geo-Targeted Content',
        status: hasGeoContent ? 'pass' : 'warning',
        detail: hasGeoContent
          ? 'Location-related keywords detected in content'
          : 'No clear geographic signals in content — may hurt local rankings',
      },
    ];

    const localSEO = buildSubCategory('Local SEO', localItems);

    // ── AI-Powered Recommendations ─────────────────────────────────────────
    const recommendations = await generateRecommendations(
      [technicalSEO, onPageSEO, localSEO],
      page,
      speed,
      inputs,
    );

    return buildCategoryResult('seo', [technicalSEO, onPageSEO, localSEO], recommendations);
  } catch (error) {
    return buildFailedCategoryResult(
      'seo',
      `SEO analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

// ─── AI Recommendation Generation ────────────────────────────────────────────

async function generateRecommendations(
  subCategories: { name: string; score: number; items: AuditItem[] }[],
  page: Awaited<ReturnType<typeof scrapePage>> | null,
  speed: Awaited<ReturnType<typeof fetchPageSpeedInsights>> | null,
  inputs: AuditInputs,
): Promise<Recommendation[]> {
  // Collect all failing/warning items for context
  const issues = subCategories.flatMap((sub) =>
    sub.items
      .filter((item) => item.status === 'fail' || item.status === 'warning')
      .map((item) => ({ subCategory: sub.name, label: item.label, status: item.status, detail: item.detail })),
  );

  if (issues.length === 0) {
    return [{
      id: 'seo-rec-maintain',
      title: 'Maintain Your Strong SEO Foundation',
      description: 'Your technical and on-page SEO looks solid. Continue monitoring Core Web Vitals and keep your content fresh.',
      priority: 'low',
      effort: 'quick-win',
      impact: 'medium',
      category: 'seo',
    }];
  }

  try {
    const analysis = await callAIForRecommendations({
      task: 'seo-recommendations',
      data: {
        issues,
        industry: inputs.goals.industry,
        pageSpeedScore: speed?.performanceScore,
        wordCount: page?.wordCount,
        hasSchema: page && page.schemaMarkup.length > 0,
      },
      language: inputs.language,
      model: 'haiku',
    });

    return analysis.recommendations.map((rec, i) => ({
      id: `seo-rec-${i}`,
      title: rec.title,
      description: rec.description,
      priority: rec.priority,
      effort: rec.effort,
      impact: rec.impact,
      category: 'seo' as const,
    }));
  } catch {
    // Fallback: generate rule-based recommendations from issues
    return issues.slice(0, 5).map((issue, i) => ({
      id: `seo-rec-${i}`,
      title: `Fix: ${issue.label}`,
      description: issue.detail,
      priority: issue.status === 'fail' ? 'high' as const : 'medium' as const,
      effort: 'quick-win' as const,
      impact: issue.status === 'fail' ? 'high' as const : 'medium' as const,
      category: 'seo' as const,
    }));
  }
}
