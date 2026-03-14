// src/lib/analyzers/utils/api-clients.ts
// Google PageSpeed Insights + Places API clients

import type { PageSpeedResult, PlacesResult, PlaceReview } from '../../audit/types';

const API_TIMEOUT_MS = 10_000;

// ─── Google PageSpeed Insights ───────────────────────────────────────────────

/**
 * Fetch performance data from Google PageSpeed Insights API.
 * Returns null if the API key is missing or the request fails.
 */
export async function fetchPageSpeedInsights(
  url: string,
  strategy: 'mobile' | 'desktop' = 'mobile',
): Promise<PageSpeedResult | null> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
  if (!apiKey) {
    console.warn('[pagespeed] GOOGLE_PAGESPEED_API_KEY not configured');
    return null;
  }

  try {
    const params = new URLSearchParams({
      url,
      key: apiKey,
      strategy,
      category: 'performance',
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    const response = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`,
      { signal: controller.signal },
    );
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[pagespeed] API returned ${response.status}`);
      return null;
    }

    return parsePageSpeedResponse(await response.json());
  } catch (error) {
    console.warn('[pagespeed] Failed:', error instanceof Error ? error.message : 'Unknown');
    return null;
  }
}

function parsePageSpeedResponse(data: Record<string, unknown>): PageSpeedResult {
  const lighthouse = data.lighthouseResult as Record<string, unknown> | undefined;
  const categories = lighthouse?.categories as Record<string, { score: number }> | undefined;
  const audits = lighthouse?.audits as Record<string, { numericValue?: number }> | undefined;

  const performanceScore = Math.round((categories?.performance?.score ?? 0) * 100);

  return {
    performanceScore,
    metrics: {
      lcp: audits?.['largest-contentful-paint']?.numericValue ?? 0,
      cls: audits?.['cumulative-layout-shift']?.numericValue ?? 0,
      inp: audits?.['interaction-to-next-paint']?.numericValue ?? 0,
      fcp: audits?.['first-contentful-paint']?.numericValue ?? 0,
      ttfb: audits?.['server-response-time']?.numericValue ?? 0,
      speedIndex: audits?.['speed-index']?.numericValue ?? 0,
      tbt: audits?.['total-blocking-time']?.numericValue ?? 0,
    },
    isMobileFriendly: performanceScore >= 50,
  };
}

// ─── Google Places API ───────────────────────────────────────────────────────

/**
 * Fetch business details from Google Places API.
 * Accepts a GBP URL, place ID, or business name as query.
 */
export async function fetchPlaceDetails(
  query: string,
): Promise<PlacesResult | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.warn('[places] GOOGLE_PLACES_API_KEY not configured');
    return null;
  }

  try {
    const placeId = await findPlaceId(query, apiKey);
    if (!placeId) return null;
    return await getPlaceDetails(placeId, apiKey);
  } catch (error) {
    console.warn('[places] Failed:', error instanceof Error ? error.message : 'Unknown');
    return null;
  }
}

/**
 * Extract a usable search query from various GBP URL formats.
 */
export function extractPlaceQuery(gbpUrl: string): string {
  try {
    const url = new URL(gbpUrl);

    // maps.google.com/maps/place/Business+Name/...
    const placeMatch = url.pathname.match(/\/place\/([^/]+)/);
    if (placeMatch) return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));

    // ?cid= parameter
    const cid = url.searchParams.get('cid');
    if (cid) return cid;

    return gbpUrl;
  } catch {
    return gbpUrl;
  }
}

// ─── Internal ────────────────────────────────────────────────────────────────

async function findPlaceId(query: string, apiKey: string): Promise<string | null> {
  // Check if query already contains a place_id
  const idMatch = query.match(/place_id[=:]([A-Za-z0-9_-]+)/);
  if (idMatch) return idMatch[1];

  const params = new URLSearchParams({
    input: query,
    inputtype: 'textquery',
    fields: 'place_id',
    key: apiKey,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${params}`,
    { signal: controller.signal },
  );
  clearTimeout(timeout);

  if (!response.ok) return null;
  const data = await response.json();
  return (data.candidates as { place_id: string }[] | undefined)?.[0]?.place_id ?? null;
}

async function getPlaceDetails(
  placeId: string,
  apiKey: string,
): Promise<PlacesResult | null> {
  const fields = [
    'name', 'rating', 'user_ratings_total', 'reviews', 'photos',
    'types', 'formatted_address', 'formatted_phone_number',
    'website', 'opening_hours', 'editorial_summary',
  ].join(',');

  const params = new URLSearchParams({
    place_id: placeId,
    fields,
    key: apiKey,
    reviews_sort: 'newest',
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${params}`,
    { signal: controller.signal },
  );
  clearTimeout(timeout);

  if (!response.ok) return null;

  const data = await response.json();
  const result = data.result as Record<string, unknown> | undefined;
  if (!result) return null;

  const rawReviews = (result.reviews as Array<{
    text: string;
    rating: number;
    time: number;
    author_name: string;
  }>) ?? [];

  return {
    name: (result.name as string) ?? '',
    rating: (result.rating as number) ?? 0,
    reviewCount: (result.user_ratings_total as number) ?? 0,
    reviews: rawReviews.map((r): PlaceReview => ({
      text: r.text,
      rating: r.rating,
      time: new Date(r.time * 1000).toISOString(),
      authorName: r.author_name,
    })),
    photoCount: ((result.photos as unknown[]) ?? []).length,
    categories: (result.types as string[]) ?? [],
    address: (result.formatted_address as string) ?? '',
    phone: result.formatted_phone_number as string | undefined,
    website: result.website as string | undefined,
    hours: (result.opening_hours as { weekday_text?: string[] })?.weekday_text,
    description: (result.editorial_summary as { overview?: string })?.overview,
  };
}
