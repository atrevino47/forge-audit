// src/lib/analyzers/branding.ts
// Branding & Positioning Analyzer — visual identity, messaging, differentiation
// This is the most AI-heavy analyzer (uses Sonnet for deep strategic analysis)

import type { AuditItem, CategoryResult, Recommendation, SubCategory } from '../../../contracts/audit-types';
import type { AuditInputs, ScrapedPage } from '../audit/types';
import { buildSubCategory, buildCategoryResult, buildFailedCategoryResult } from '../audit/scoring';
import { scrapePage } from './utils/scraper';
import { captureMultipleScreenshots } from './utils/screenshot';
import { callAIForRecommendations } from '../audit/ai-bridge';

export async function analyzeBranding(inputs: AuditInputs): Promise<CategoryResult> {
  try {
    // ── Data Collection ────────────────────────────────────────────────────
    const [pageResult, screenshotsResult] = await Promise.allSettled([
      scrapePage(inputs.websiteUrl),
      captureMultipleScreenshots([inputs.websiteUrl], { width: 1280, height: 900 }),
    ]);

    const page = pageResult.status === 'fulfilled' ? pageResult.value : null;
    const screenshots = screenshotsResult.status === 'fulfilled' ? screenshotsResult.value : new Map();
    const homepageScreenshot = screenshots.get(inputs.websiteUrl) ?? null;

    // ── Rule-Based Checks ──────────────────────────────────────────────────
    const visualIdentity = buildVisualIdentity(page);
    const messaging = buildMessaging(page, inputs);
    const digitalPresence = buildDigitalPresence(page);

    const subCategories: SubCategory[] = [visualIdentity, messaging, digitalPresence];

    // ── Deep AI Analysis ───────────────────────────────────────────────────
    const recommendations = await generateRecommendations(
      subCategories,
      page,
      homepageScreenshot,
      inputs,
    );

    return buildCategoryResult('branding', subCategories, recommendations);
  } catch (error) {
    return buildFailedCategoryResult(
      'branding',
      `Branding analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

// ─── Sub-Category Builders ───────────────────────────────────────────────────

function buildVisualIdentity(page: ScrapedPage | null): SubCategory {
  const hasFavicon = page ? /<link[^>]*rel=["'](?:shortcut )?icon["']/i.test(page.html) : false;
  const hasOgImage = !!page?.meta.ogImage;
  const hasCustomFonts = page
    ? /<link[^>]*href=["'][^"']*(?:fonts\.googleapis|typekit|fonts\.adobe)/i.test(page.html)
      || /@font-face/i.test(page.html)
    : false;
  const hasLogo = page
    ? /logo/i.test(page.images.map((i) => `${i.src} ${i.alt ?? ''}`).join(' '))
    : false;

  const items: AuditItem[] = [
    {
      id: 'brand-visual-favicon',
      label: 'Favicon',
      status: hasFavicon ? 'pass' : 'fail',
      detail: hasFavicon
        ? 'Custom favicon detected'
        : 'No favicon found — your site uses the generic browser icon',
    },
    {
      id: 'brand-visual-og',
      label: 'Social Share Image (OG)',
      status: hasOgImage ? 'pass' : 'warning',
      detail: hasOgImage
        ? `OG image configured: ${page!.meta.ogImage!.slice(0, 60)}...`
        : 'No OG image — shared links will look generic on social media',
    },
    {
      id: 'brand-visual-fonts',
      label: 'Custom Typography',
      status: hasCustomFonts ? 'pass' : 'warning',
      detail: hasCustomFonts
        ? 'Custom web fonts detected'
        : 'No custom fonts detected — using system fonts (may look generic)',
    },
    {
      id: 'brand-visual-logo',
      label: 'Logo Presence',
      status: hasLogo ? 'pass' : 'warning',
      detail: hasLogo
        ? 'Logo image detected on the page'
        : 'No clear logo element found — brand recognition may suffer',
    },
  ];

  return buildSubCategory('Visual Identity', items);
}

function buildMessaging(page: ScrapedPage | null, inputs: AuditInputs): SubCategory {
  const h1Text = page?.headings.find((h) => h.tag === 'h1')?.text ?? '';
  const hasValueProp = h1Text.length > 10;
  const hasTagline = page?.meta.description
    ? page.meta.description.length >= 50 && page.meta.description.length <= 200
    : false;
  const hasAboutContent = page
    ? /about|our story|who we are|our mission|nuestra historia/i.test(page.textContent)
    : false;
  const mentionsBusiness = page
    ? page.textContent.toLowerCase().includes(inputs.businessName.toLowerCase())
    : false;

  const items: AuditItem[] = [
    {
      id: 'brand-msg-valueprop',
      label: 'Clear Value Proposition',
      status: hasValueProp ? 'pass' : 'fail',
      detail: hasValueProp
        ? `Hero headline: "${h1Text.slice(0, 80)}"`
        : 'No clear value proposition in the hero section',
    },
    {
      id: 'brand-msg-tagline',
      label: 'Compelling Tagline/Description',
      status: hasTagline ? 'pass' : 'warning',
      detail: hasTagline
        ? 'Meta description serves as a strong tagline'
        : 'Meta description is missing or suboptimal as a brand tagline',
    },
    {
      id: 'brand-msg-about',
      label: 'Brand Story',
      status: hasAboutContent ? 'pass' : 'warning',
      detail: hasAboutContent
        ? 'About/story content detected on the page'
        : 'No brand story content found — humanizing your brand builds trust',
    },
    {
      id: 'brand-msg-name',
      label: 'Business Name Prominent',
      status: mentionsBusiness ? 'pass' : 'warning',
      detail: mentionsBusiness
        ? `"${inputs.businessName}" mentioned in page content`
        : 'Business name not found in visible content',
    },
  ];

  return buildSubCategory('Brand Messaging', items);
}

function buildDigitalPresence(page: ScrapedPage | null): SubCategory {
  const hasSocialLinks = page
    ? /instagram\.com|facebook\.com|twitter\.com|x\.com|tiktok\.com|linkedin\.com/i.test(
        page.links.map((l) => l.href).join(' '),
      )
    : false;
  const hasPrivacyPolicy = page
    ? /privacy|privacidad/i.test(page.links.map((l) => l.text).join(' '))
    : false;
  const hasCopyright = page
    ? /©|\bcopyright\b/i.test(page.textContent)
    : false;

  const items: AuditItem[] = [
    {
      id: 'brand-digital-social-links',
      label: 'Social Media Links',
      status: hasSocialLinks ? 'pass' : 'warning',
      detail: hasSocialLinks
        ? 'Links to social media profiles found on the site'
        : 'No social media links found — cross-linking builds brand coherence',
    },
    {
      id: 'brand-digital-privacy',
      label: 'Privacy Policy',
      status: hasPrivacyPolicy ? 'pass' : 'warning',
      detail: hasPrivacyPolicy
        ? 'Privacy policy link detected'
        : 'No privacy policy link found — required for trust and compliance',
    },
    {
      id: 'brand-digital-copyright',
      label: 'Copyright Notice',
      status: hasCopyright ? 'pass' : 'info',
      detail: hasCopyright
        ? 'Copyright notice present'
        : 'No copyright notice — optional but signals professionalism',
    },
  ];

  return buildSubCategory('Digital Presence', items);
}

// ─── AI Recommendations ──────────────────────────────────────────────────────

async function generateRecommendations(
  subCategories: SubCategory[],
  page: ScrapedPage | null,
  screenshot: { imageBase64: string } | null,
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
      task: 'branding-analysis',
      data: {
        issues,
        businessName: inputs.businessName,
        industry: inputs.goals.industry,
        mainChallenge: inputs.goals.mainChallenge,
        hasScreenshot: !!screenshot,
        screenshotBase64: screenshot?.imageBase64,
        heroText: page?.headings.find((h) => h.tag === 'h1')?.text,
        metaDescription: page?.meta.description,
        textContent: page?.textContent.slice(0, 3000),
      },
      language: inputs.language,
      model: 'sonnet',
    });

    return analysis.recommendations.map((rec, i) => ({
      id: `brand-rec-${i}`,
      title: rec.title,
      description: rec.description,
      priority: rec.priority,
      effort: rec.effort,
      impact: rec.impact,
      category: 'branding' as const,
    }));
  } catch {
    return issues.slice(0, 4).map((issue, i) => ({
      id: `brand-rec-${i}`,
      title: `Improve: ${issue.label}`,
      description: issue.detail,
      priority: issue.status === 'fail' ? 'high' as const : 'medium' as const,
      effort: 'moderate' as const,
      impact: 'medium' as const,
      category: 'branding' as const,
    }));
  }
}
