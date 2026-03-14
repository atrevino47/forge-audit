// src/lib/analyzers/ads.ts
// Ads Readiness Analyzer — tracking pixels, analytics, conversion tracking, funnel structure

import type { AuditItem, CategoryResult, Recommendation, SubCategory } from '../../../contracts/audit-types';
import type { AuditInputs, ScrapedPage } from '../audit/types';
import { buildSubCategory, buildCategoryResult, buildFailedCategoryResult } from '../audit/scoring';
import { scrapePage } from './utils/scraper';
import { callAIForRecommendations } from '../audit/ai-bridge';

export async function analyzeAds(inputs: AuditInputs): Promise<CategoryResult> {
  try {
    const page = await scrapePage(inputs.websiteUrl).catch(() => null);

    if (!page) {
      return buildFailedCategoryResult(
        'ads',
        'Could not fetch website — unable to analyze ads readiness',
      );
    }

    const allScripts = page.scripts.map((s) => `${s.src ?? ''} ${s.content ?? ''}`).join('\n');
    const fullHtml = page.html;

    // ── Tracking & Analytics ───────────────────────────────────────────────
    const hasGA4 = /gtag\(|G-[A-Z0-9]+|googletagmanager/i.test(allScripts)
      || /google-analytics|gtag\.js/i.test(fullHtml);
    const hasGTM = /googletagmanager\.com\/gtm/i.test(fullHtml)
      || /GTM-[A-Z0-9]+/i.test(fullHtml);
    const hasMetaPixel = /fbq\(|facebook\.net\/signals|connect\.facebook\.net/i.test(allScripts)
      || /facebook\.net\/en_US\/fbevents/i.test(fullHtml);
    const hasTikTokPixel = /analytics\.tiktok\.com|ttq\./i.test(allScripts);
    const hasLinkedInInsight = /snap\.licdn\.com|linkedin\.com\/insight/i.test(allScripts)
      || /linkedin-insight/i.test(fullHtml);

    const trackingItems: AuditItem[] = [
      {
        id: 'ads-track-ga',
        label: 'Google Analytics (GA4)',
        status: hasGA4 ? 'pass' : 'fail',
        detail: hasGA4
          ? 'Google Analytics tag detected'
          : 'No Google Analytics found — you cannot measure traffic or ad performance',
      },
      {
        id: 'ads-track-gtm',
        label: 'Google Tag Manager',
        status: hasGTM ? 'pass' : 'warning',
        detail: hasGTM
          ? 'GTM container detected'
          : 'No GTM found — recommended for managing multiple tracking tags',
      },
      {
        id: 'ads-track-meta',
        label: 'Meta Pixel (Facebook/Instagram)',
        status: hasMetaPixel ? 'pass' : 'warning',
        detail: hasMetaPixel
          ? 'Meta Pixel detected — ready for Facebook/Instagram ads'
          : 'No Meta Pixel — required to run Facebook/Instagram ad campaigns',
      },
      {
        id: 'ads-track-tiktok',
        label: 'TikTok Pixel',
        status: hasTikTokPixel ? 'pass' : 'info',
        detail: hasTikTokPixel
          ? 'TikTok Pixel detected'
          : 'No TikTok Pixel — install if planning TikTok ad campaigns',
      },
      {
        id: 'ads-track-linkedin',
        label: 'LinkedIn Insight Tag',
        status: hasLinkedInInsight ? 'pass' : 'info',
        detail: hasLinkedInInsight
          ? 'LinkedIn Insight Tag detected'
          : 'No LinkedIn Insight Tag — install if targeting B2B audiences',
      },
    ];

    const tracking = buildSubCategory('Tracking & Analytics', trackingItems);

    // ── Conversion Infrastructure ──────────────────────────────────────────
    const hasForm = /<form[\s>]/i.test(fullHtml);
    const hasThankYou = /thank\s*you|gracias|success|confirmation/i.test(
      page.links.map((l) => `${l.href} ${l.text}`).join(' '),
    );
    const hasConversionEvents = /gtag\(\s*['"]event['"]|fbq\(\s*['"]track['"]/i.test(allScripts);
    const hasPhoneTracking = /tel:/i.test(fullHtml)
      || /calltrackingmetrics|callrail|invoca/i.test(allScripts);
    const hasRetargeting = /remarketing|retarget|custom_audience/i.test(allScripts);

    const conversionItems: AuditItem[] = [
      {
        id: 'ads-conv-form',
        label: 'Lead Capture Form',
        status: hasForm ? 'pass' : 'fail',
        detail: hasForm
          ? 'Form element detected — can be used as a conversion point'
          : 'No form found — ads need a clear conversion action',
      },
      {
        id: 'ads-conv-thankyou',
        label: 'Thank You / Confirmation Page',
        status: hasThankYou ? 'pass' : 'warning',
        detail: hasThankYou
          ? 'Thank you / confirmation page detected'
          : 'No confirmation page found — needed for conversion tracking',
      },
      {
        id: 'ads-conv-events',
        label: 'Conversion Event Tracking',
        status: hasConversionEvents ? 'pass' : 'warning',
        detail: hasConversionEvents
          ? 'Conversion event tracking code detected'
          : 'No conversion events found — ad platforms cannot optimize without them',
      },
      {
        id: 'ads-conv-phone',
        label: 'Click-to-Call / Phone Tracking',
        status: hasPhoneTracking ? 'pass' : 'info',
        detail: hasPhoneTracking
          ? 'Phone tracking or click-to-call links detected'
          : 'No phone tracking detected',
      },
      {
        id: 'ads-conv-retarget',
        label: 'Retargeting Ready',
        status: hasRetargeting ? 'pass' : 'info',
        detail: hasRetargeting
          ? 'Retargeting/remarketing code detected'
          : 'No retargeting setup found — install after pixel setup',
      },
    ];

    const conversion = buildSubCategory('Conversion Infrastructure', conversionItems);

    // ── Landing Page Readiness ─────────────────────────────────────────────
    const hasCTA = /class=["'][^"']*\b(cta|btn|button)\b/i.test(fullHtml)
      || (page.links.some((l) => /contact|book|schedule|get started|sign up|comprar|contacto/i.test(l.text)));
    const hasHero = page.headings.some((h) => h.tag === 'h1') && page.meta.ogImage !== undefined;
    const hasTrustSignals = /testimonial|review|trust|guarantee|secure|certified|badge/i.test(page.textContent);
    const hasAboveFold = (page.headings.filter((h) => h.tag === 'h1').length > 0) && hasCTA;

    const landingItems: AuditItem[] = [
      {
        id: 'ads-landing-cta',
        label: 'Clear Call-to-Action',
        status: hasCTA ? 'pass' : 'fail',
        detail: hasCTA
          ? 'CTA elements detected'
          : 'No clear CTA — ad traffic will bounce without a next step',
      },
      {
        id: 'ads-landing-hero',
        label: 'Hero Section',
        status: hasHero ? 'pass' : 'warning',
        detail: hasHero
          ? 'Hero headline and image detected'
          : 'Missing hero section elements — first impression matters for ad traffic',
      },
      {
        id: 'ads-landing-trust',
        label: 'Trust Signals',
        status: hasTrustSignals ? 'pass' : 'warning',
        detail: hasTrustSignals
          ? 'Trust-building elements detected'
          : 'No trust signals found — ad visitors are skeptical by nature',
      },
      {
        id: 'ads-landing-abovefold',
        label: 'Above-the-Fold Impact',
        status: hasAboveFold ? 'pass' : 'warning',
        detail: hasAboveFold
          ? 'Strong above-the-fold content (headline + CTA)'
          : 'Above-the-fold content could be stronger — headline and CTA should be immediately visible',
      },
    ];

    const landing = buildSubCategory('Landing Page Readiness', landingItems);

    const subCategories: SubCategory[] = [tracking, conversion, landing];

    // ── AI Recommendations ─────────────────────────────────────────────────
    const recommendations = await generateRecommendations(subCategories, page, inputs);

    return buildCategoryResult('ads', subCategories, recommendations);
  } catch (error) {
    return buildFailedCategoryResult(
      'ads',
      `Ads analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

// ─── AI Recommendations ──────────────────────────────────────────────────────

async function generateRecommendations(
  subCategories: SubCategory[],
  page: ScrapedPage,
  inputs: AuditInputs,
): Promise<Recommendation[]> {
  const issues = subCategories.flatMap((sub) =>
    sub.items
      .filter((item) => item.status === 'fail' || item.status === 'warning')
      .map((item) => ({
        subCategory: sub.name,
        label: item.label,
        status: item.status,
        detail: item.detail,
      })),
  );

  try {
    const analysis = await callAIForRecommendations({
      task: 'ads-readiness-recommendations',
      data: {
        issues,
        industry: inputs.goals.industry,
        mainChallenge: inputs.goals.mainChallenge,
        hasSocials: !!(inputs.socials && Object.values(inputs.socials).some(Boolean)),
      },
      language: inputs.language,
      model: 'haiku',
    });

    return analysis.recommendations.map((rec, i) => ({
      id: `ads-rec-${i}`,
      title: rec.title,
      description: rec.description,
      priority: rec.priority,
      effort: rec.effort,
      impact: rec.impact,
      category: 'ads' as const,
    }));
  } catch {
    return issues.slice(0, 4).map((issue, i) => ({
      id: `ads-rec-${i}`,
      title: `Fix: ${issue.label}`,
      description: issue.detail,
      priority: issue.status === 'fail' ? 'high' as const : 'medium' as const,
      effort: 'quick-win' as const,
      impact: 'medium' as const,
      category: 'ads' as const,
    }));
  }
}
