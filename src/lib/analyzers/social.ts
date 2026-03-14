// src/lib/analyzers/social.ts
// Social Media Analyzer — profile completeness, content quality, engagement

import type { AuditItem, CategoryResult, Recommendation, SubCategory } from '../../../contracts/audit-types';
import type { AuditInputs } from '../audit/types';
import { buildSubCategory, buildCategoryResult, buildFailedCategoryResult } from '../audit/scoring';
import { callAIForRecommendations } from '../audit/ai-bridge';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SocialProfile {
  platform: string;
  handle: string;
  url: string;
  accessible: boolean;
  bio?: string;
  followerCount?: number;
  postCount?: number;
  hasProfilePic?: boolean;
  isVerified?: boolean;
}

type PlatformKey = 'instagram' | 'facebook' | 'tiktok' | 'linkedin';

const PLATFORM_URLS: Record<PlatformKey, (handle: string) => string> = {
  instagram: (h) => `https://www.instagram.com/${h.replace('@', '')}/`,
  facebook: (h) => h.startsWith('http') ? h : `https://www.facebook.com/${h}/`,
  tiktok: (h) => `https://www.tiktok.com/@${h.replace('@', '')}/`,
  linkedin: (h) => h.startsWith('http') ? h : `https://www.linkedin.com/company/${h}/`,
};

// ─── Main Export ─────────────────────────────────────────────────────────────

export async function analyzeSocial(inputs: AuditInputs): Promise<CategoryResult> {
  try {
    const socials = inputs.socials;

    // If no social profiles provided, return a minimal result
    if (!socials || !Object.values(socials).some(Boolean)) {
      return buildCategoryResult('social', [
        buildSubCategory('Social Presence', [{
          id: 'social-none',
          label: 'Social Media Profiles',
          status: 'fail',
          detail: 'No social media profiles provided — a significant gap in modern marketing',
        }]),
      ], [{
        id: 'social-rec-0',
        title: 'Establish Social Media Presence',
        description: 'Create profiles on at least 2 platforms relevant to your industry. Instagram and Facebook are the most common starting points for local businesses.',
        priority: 'high',
        effort: 'moderate',
        impact: 'high',
        category: 'social',
      }]);
    }

    // ── Check each provided platform ───────────────────────────────────────
    const profiles = await fetchProfiles(socials);
    const subCategories: SubCategory[] = [];

    // Platform Presence sub-category
    const presenceItems: AuditItem[] = buildPresenceItems(profiles, socials);
    subCategories.push(buildSubCategory('Platform Presence', presenceItems));

    // Profile Completeness sub-category (for accessible profiles)
    const accessibleProfiles = profiles.filter((p) => p.accessible);
    if (accessibleProfiles.length > 0) {
      const completenessItems = buildCompletenessItems(accessibleProfiles);
      subCategories.push(buildSubCategory('Profile Completeness', completenessItems));
    }

    // Cross-Platform Consistency sub-category
    if (accessibleProfiles.length >= 2) {
      const consistencyItems = buildConsistencyItems(accessibleProfiles);
      subCategories.push(buildSubCategory('Cross-Platform Consistency', consistencyItems));
    }

    // ── AI Analysis ────────────────────────────────────────────────────────
    const recommendations = await generateRecommendations(subCategories, profiles, inputs);

    return buildCategoryResult('social', subCategories, recommendations);
  } catch (error) {
    return buildFailedCategoryResult(
      'social',
      `Social media analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

// ─── Profile Fetching ────────────────────────────────────────────────────────

async function fetchProfiles(
  socials: NonNullable<AuditInputs['socials']>,
): Promise<SocialProfile[]> {
  const entries = Object.entries(socials).filter(
    (entry): entry is [PlatformKey, string] => !!entry[1],
  );

  const results = await Promise.allSettled(
    entries.map(([platform, handle]) => fetchProfile(platform, handle)),
  );

  return results
    .map((r, i) =>
      r.status === 'fulfilled'
        ? r.value
        : { platform: entries[i][0], handle: entries[i][1], url: '', accessible: false },
    );
}

async function fetchProfile(platform: PlatformKey, handle: string): Promise<SocialProfile> {
  const url = PLATFORM_URLS[platform](handle);
  const profile: SocialProfile = {
    platform,
    handle,
    url,
    accessible: false,
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ForgeAuditBot/1.0)',
        Accept: 'text/html',
      },
      redirect: 'follow',
    });
    clearTimeout(timeout);

    if (response.ok) {
      profile.accessible = true;
      const html = await response.text();
      extractProfileData(profile, html, platform);
    }
  } catch {
    // Profile not accessible — leave accessible = false
  }

  return profile;
}

function extractProfileData(profile: SocialProfile, html: string, platform: string): void {
  // Extract what we can from public HTML — varies by platform
  // This is best-effort; many platforms block scrapers

  // Generic bio extraction from meta description
  const descMatch = html.match(/<meta[^>]*(?:name|property)=["'](?:description|og:description)["'][^>]*content=["']([^"']+)["']/i);
  if (descMatch) profile.bio = descMatch[1];

  // Platform-specific follower count patterns
  const followerPatterns: Record<string, RegExp> = {
    instagram: /(\d[\d,.]+[KkMm]?)\s*[Ff]ollower/,
    facebook: /(\d[\d,.]+[KkMm]?)\s*(?:likes?|followers?)/i,
    tiktok: /(\d[\d,.]+[KkMm]?)\s*[Ff]ollower/,
    linkedin: /(\d[\d,.]+[KkMm]?)\s*(?:followers?|employees?)/i,
  };

  const pattern = followerPatterns[platform];
  if (pattern) {
    const match = html.match(pattern);
    if (match) profile.followerCount = parseCount(match[1]);
  }

  // Check for profile picture (generic OG image check)
  const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  profile.hasProfilePic = !!ogImage;
}

function parseCount(str: string): number {
  const cleaned = str.replace(/,/g, '');
  const multiplier = /[Kk]$/.test(cleaned) ? 1_000 : /[Mm]$/.test(cleaned) ? 1_000_000 : 1;
  return Math.round(parseFloat(cleaned) * multiplier);
}

// ─── Item Builders ───────────────────────────────────────────────────────────

function buildPresenceItems(profiles: SocialProfile[], socials: NonNullable<AuditInputs['socials']>): AuditItem[] {
  const items: AuditItem[] = [];
  const platforms: PlatformKey[] = ['instagram', 'facebook', 'tiktok', 'linkedin'];

  for (const platform of platforms) {
    const handle = socials[platform];
    if (!handle) continue;

    const profile = profiles.find((p) => p.platform === platform);
    items.push({
      id: `social-presence-${platform}`,
      label: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Profile`,
      status: profile?.accessible ? 'pass' : 'fail',
      detail: profile?.accessible
        ? `Profile accessible at ${profile.url}`
        : `Could not access ${platform} profile for "${handle}"`,
    });
  }

  // Check for minimum platform coverage
  const providedCount = Object.values(socials).filter(Boolean).length;
  items.push({
    id: 'social-presence-coverage',
    label: 'Platform Coverage',
    status: providedCount >= 3 ? 'pass' : providedCount >= 2 ? 'warning' : 'fail',
    detail: `Active on ${providedCount} platform(s)`,
    value: providedCount,
    benchmark: '≥ 3',
  });

  return items;
}

function buildCompletenessItems(profiles: SocialProfile[]): AuditItem[] {
  const items: AuditItem[] = [];

  for (const profile of profiles) {
    const hasBio = !!profile.bio && profile.bio.length > 10;

    items.push({
      id: `social-complete-${profile.platform}-bio`,
      label: `${capitalize(profile.platform)} Bio`,
      status: hasBio ? 'pass' : 'warning',
      detail: hasBio
        ? `Bio detected: "${profile.bio!.slice(0, 80)}..."`
        : `No bio detected for ${capitalize(profile.platform)} profile`,
    });

    if (profile.followerCount !== undefined) {
      items.push({
        id: `social-complete-${profile.platform}-followers`,
        label: `${capitalize(profile.platform)} Followers`,
        status: profile.followerCount >= 500 ? 'pass' : profile.followerCount >= 100 ? 'warning' : 'info',
        detail: `${profile.followerCount.toLocaleString()} followers`,
        value: profile.followerCount,
      });
    }
  }

  return items;
}

function buildConsistencyItems(profiles: SocialProfile[]): AuditItem[] {
  const bios = profiles.filter((p) => p.bio).map((p) => p.bio!);

  // Check if bios share common keywords (rough consistency check)
  let bioConsistent = true;
  if (bios.length >= 2) {
    const words0 = new Set(bios[0].toLowerCase().split(/\s+/));
    const overlap = bios.slice(1).every((bio) => {
      const words = bio.toLowerCase().split(/\s+/);
      const common = words.filter((w) => words0.has(w) && w.length > 3);
      return common.length >= 2;
    });
    bioConsistent = overlap;
  }

  return [
    {
      id: 'social-consistency-bio',
      label: 'Consistent Messaging',
      status: bioConsistent ? 'pass' : 'warning',
      detail: bioConsistent
        ? 'Profile bios share consistent messaging across platforms'
        : 'Profile bios appear inconsistent — consider aligning messaging',
    },
    {
      id: 'social-consistency-pic',
      label: 'Profile Pictures Present',
      status: profiles.every((p) => p.hasProfilePic) ? 'pass' : 'warning',
      detail: profiles.every((p) => p.hasProfilePic)
        ? 'All profiles have profile pictures'
        : 'Some profiles may be missing profile pictures',
    },
  ];
}

// ─── AI Recommendations ──────────────────────────────────────────────────────

async function generateRecommendations(
  subCategories: SubCategory[],
  profiles: SocialProfile[],
  inputs: AuditInputs,
): Promise<Recommendation[]> {
  const issues = subCategories.flatMap((sub) =>
    sub.items
      .filter((item) => item.status === 'fail' || item.status === 'warning')
      .map((item) => ({ subCategory: sub.name, label: item.label, status: item.status, detail: item.detail })),
  );

  try {
    const analysis = await callAIForRecommendations({
      task: 'social-media-recommendations',
      data: {
        issues,
        profiles: profiles.map((p) => ({
          platform: p.platform,
          accessible: p.accessible,
          hasBio: !!p.bio,
          followerCount: p.followerCount,
        })),
        industry: inputs.goals.industry,
        businessSize: inputs.goals.businessSize,
      },
      language: inputs.language,
      model: 'sonnet',
    });

    return analysis.recommendations.map((rec, i) => ({
      id: `social-rec-${i}`,
      title: rec.title,
      description: rec.description,
      priority: rec.priority,
      effort: rec.effort,
      impact: rec.impact,
      category: 'social' as const,
    }));
  } catch {
    return issues.slice(0, 4).map((issue, i) => ({
      id: `social-rec-${i}`,
      title: `Improve: ${issue.label}`,
      description: issue.detail,
      priority: issue.status === 'fail' ? 'high' as const : 'medium' as const,
      effort: 'moderate' as const,
      impact: 'medium' as const,
      category: 'social' as const,
    }));
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
