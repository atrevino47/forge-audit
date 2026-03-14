// src/lib/analyzers/gbp.ts
// Google Business Profile Analyzer — completeness, photos, reviews, posts

import type { AuditItem, CategoryResult, Recommendation, SubCategory } from '../../../contracts/audit-types';
import type { AuditInputs, PlacesResult } from '../audit/types';
import { buildSubCategory, buildCategoryResult, buildFailedCategoryResult } from '../audit/scoring';
import { fetchPlaceDetails, extractPlaceQuery } from './utils/api-clients';
import { callAIForRecommendations } from '../audit/ai-bridge';

export async function analyzeGBP(inputs: AuditInputs): Promise<CategoryResult> {
  try {
    // ── Skip if no GBP provided ────────────────────────────────────────────
    if (!inputs.gbpUrl) {
      return buildCategoryResult(
        'gbp',
        [
          buildSubCategory('Profile Status', [{
            id: 'gbp-no-profile',
            label: 'Google Business Profile',
            status: 'fail',
            detail: 'No Google Business Profile provided — critical for local visibility',
          }]),
        ],
        [{
          id: 'gbp-rec-create',
          title: 'Create a Google Business Profile',
          description: 'A GBP is essential for local search visibility. Claim your business at business.google.com to appear in Google Maps and local search results.',
          priority: 'high',
          effort: 'moderate',
          impact: 'high',
          category: 'gbp',
        }],
      );
    }

    // ── Fetch GBP Data ─────────────────────────────────────────────────────
    const query = extractPlaceQuery(inputs.gbpUrl);
    const place = await fetchPlaceDetails(query);

    if (!place) {
      return buildCategoryResult(
        'gbp',
        [
          buildSubCategory('Profile Status', [{
            id: 'gbp-not-found',
            label: 'Google Business Profile',
            status: 'warning',
            detail: 'Could not retrieve GBP data — the profile may be new, unlisted, or the URL may be incorrect',
          }]),
        ],
        [{
          id: 'gbp-rec-verify',
          title: 'Verify Your Google Business Profile',
          description: 'Ensure your GBP is verified and publicly visible. Check that the URL is correct and the listing is not suspended.',
          priority: 'high',
          effort: 'quick-win',
          impact: 'high',
          category: 'gbp',
        }],
      );
    }

    // ── Profile Completeness ───────────────────────────────────────────────
    const completenessItems: AuditItem[] = [
      {
        id: 'gbp-complete-name',
        label: 'Business Name',
        status: place.name ? 'pass' : 'fail',
        detail: place.name ? `Listed as "${place.name}"` : 'No business name set',
      },
      {
        id: 'gbp-complete-address',
        label: 'Address',
        status: place.address ? 'pass' : 'fail',
        detail: place.address || 'No address listed',
      },
      {
        id: 'gbp-complete-phone',
        label: 'Phone Number',
        status: place.phone ? 'pass' : 'warning',
        detail: place.phone ? `Phone: ${place.phone}` : 'No phone number listed',
      },
      {
        id: 'gbp-complete-website',
        label: 'Website Link',
        status: place.website ? 'pass' : 'fail',
        detail: place.website ? `Website: ${place.website}` : 'No website linked — missing a key traffic source',
      },
      {
        id: 'gbp-complete-hours',
        label: 'Business Hours',
        status: place.hours && place.hours.length > 0 ? 'pass' : 'warning',
        detail: place.hours && place.hours.length > 0
          ? `Hours listed for ${place.hours.length} days`
          : 'No business hours set — customers won\'t know when you\'re open',
      },
      {
        id: 'gbp-complete-description',
        label: 'Business Description',
        status: place.description ? 'pass' : 'warning',
        detail: place.description
          ? `Description: "${place.description.slice(0, 80)}..."`
          : 'No business description — a missed opportunity to describe your services',
      },
      {
        id: 'gbp-complete-categories',
        label: 'Business Categories',
        status: place.categories.length >= 2 ? 'pass' : place.categories.length === 1 ? 'warning' : 'fail',
        detail: place.categories.length > 0
          ? `Categories: ${place.categories.slice(0, 5).join(', ')}`
          : 'No business categories set',
        value: place.categories.length,
      },
    ];

    const completeness = buildSubCategory('Profile Completeness', completenessItems);

    // ── Photos ─────────────────────────────────────────────────────────────
    const photoItems: AuditItem[] = [
      {
        id: 'gbp-photos-count',
        label: 'Photo Count',
        status: place.photoCount >= 10 ? 'pass' : place.photoCount >= 3 ? 'warning' : 'fail',
        detail: `${place.photoCount} photo(s) on the listing`,
        value: place.photoCount,
        benchmark: '≥ 10',
      },
    ];

    const photos = buildSubCategory('Photos', photoItems);

    // ── Reviews ────────────────────────────────────────────────────────────
    const reviewItems: AuditItem[] = [
      {
        id: 'gbp-reviews-rating',
        label: 'Average Rating',
        status: place.rating >= 4.5 ? 'pass' : place.rating >= 4.0 ? 'warning' : 'fail',
        detail: `${place.rating} out of 5 stars`,
        value: place.rating,
        benchmark: '≥ 4.5',
      },
      {
        id: 'gbp-reviews-count',
        label: 'Review Count',
        status: place.reviewCount >= 25 ? 'pass' : place.reviewCount >= 10 ? 'warning' : 'fail',
        detail: `${place.reviewCount} review(s)`,
        value: place.reviewCount,
        benchmark: '≥ 25',
      },
    ];

    // Check for recent reviews (within last 3 months)
    if (place.reviews.length > 0) {
      const threeMonthsAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
      const recentReviews = place.reviews.filter((r) => new Date(r.time).getTime() > threeMonthsAgo);
      reviewItems.push({
        id: 'gbp-reviews-recent',
        label: 'Recent Reviews',
        status: recentReviews.length >= 3 ? 'pass' : recentReviews.length >= 1 ? 'warning' : 'fail',
        detail: `${recentReviews.length} review(s) in the last 3 months`,
        value: recentReviews.length,
      });
    }

    const reviews = buildSubCategory('Reviews', reviewItems);

    const subCategories: SubCategory[] = [completeness, photos, reviews];

    // ── AI Recommendations ─────────────────────────────────────────────────
    const recommendations = await generateRecommendations(subCategories, place, inputs);

    return buildCategoryResult('gbp', subCategories, recommendations);
  } catch (error) {
    return buildFailedCategoryResult(
      'gbp',
      `GBP analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

// ─── AI Recommendations ──────────────────────────────────────────────────────

async function generateRecommendations(
  subCategories: SubCategory[],
  place: PlacesResult,
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
    const hasReviewIssues = issues.some((i) => i.subCategory === 'Reviews');

    const analysis = await callAIForRecommendations({
      task: 'gbp-recommendations',
      data: {
        issues,
        rating: place.rating,
        reviewCount: place.reviewCount,
        photoCount: place.photoCount,
        recentReviews: place.reviews.slice(0, 5).map((r) => ({
          rating: r.rating,
          text: r.text.slice(0, 200),
        })),
        industry: inputs.goals.industry,
      },
      language: inputs.language,
      model: hasReviewIssues && place.reviews.length > 0 ? 'sonnet' : 'haiku',
    });

    return analysis.recommendations.map((rec, i) => ({
      id: `gbp-rec-${i}`,
      title: rec.title,
      description: rec.description,
      priority: rec.priority,
      effort: rec.effort,
      impact: rec.impact,
      category: 'gbp' as const,
    }));
  } catch {
    return issues.slice(0, 4).map((issue, i) => ({
      id: `gbp-rec-${i}`,
      title: `Fix: ${issue.label}`,
      description: issue.detail,
      priority: issue.status === 'fail' ? 'high' as const : 'medium' as const,
      effort: 'quick-win' as const,
      impact: 'medium' as const,
      category: 'gbp' as const,
    }));
  }
}
