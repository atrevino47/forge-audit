// src/lib/analyzers/reputation.ts
// Reputation & Reviews Analyzer — review metrics, sentiment, testimonials

import type { AuditItem, CategoryResult, Recommendation, SubCategory } from '../../../contracts/audit-types';
import type { AuditInputs, PlacesResult, ScrapedPage } from '../audit/types';
import { buildSubCategory, buildCategoryResult, buildFailedCategoryResult } from '../audit/scoring';
import { scrapePage } from './utils/scraper';
import { fetchPlaceDetails, extractPlaceQuery } from './utils/api-clients';
import { callAIForRecommendations } from '../audit/ai-bridge';

export async function analyzeReputation(inputs: AuditInputs): Promise<CategoryResult> {
  try {
    // ── Data Collection ────────────────────────────────────────────────────
    const [pageResult, placeResult] = await Promise.allSettled([
      scrapePage(inputs.websiteUrl),
      inputs.gbpUrl
        ? fetchPlaceDetails(extractPlaceQuery(inputs.gbpUrl))
        : Promise.resolve(null),
    ]);

    const page = pageResult.status === 'fulfilled' ? pageResult.value : null;
    const place = placeResult.status === 'fulfilled' ? placeResult.value : null;

    // ── Google Reviews ─────────────────────────────────────────────────────
    const reviewItems: AuditItem[] = [];

    if (place) {
      reviewItems.push(
        {
          id: 'rep-google-rating',
          label: 'Google Rating',
          status: place.rating >= 4.5 ? 'pass' : place.rating >= 4.0 ? 'warning' : 'fail',
          detail: `${place.rating}/5 stars on Google`,
          value: place.rating,
          benchmark: '≥ 4.5',
        },
        {
          id: 'rep-google-count',
          label: 'Google Review Volume',
          status: place.reviewCount >= 50 ? 'pass' : place.reviewCount >= 15 ? 'warning' : 'fail',
          detail: `${place.reviewCount} Google review(s)`,
          value: place.reviewCount,
          benchmark: '≥ 50',
        },
      );

      // Review recency
      if (place.reviews.length > 0) {
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
        const recentCount = place.reviews.filter(
          (r) => new Date(r.time).getTime() > thirtyDaysAgo,
        ).length;
        const quarterCount = place.reviews.filter(
          (r) => new Date(r.time).getTime() > ninetyDaysAgo,
        ).length;

        reviewItems.push({
          id: 'rep-google-recency',
          label: 'Review Recency',
          status: recentCount >= 2 ? 'pass' : quarterCount >= 3 ? 'warning' : 'fail',
          detail: recentCount > 0
            ? `${recentCount} review(s) in the last 30 days`
            : `${quarterCount} review(s) in the last 90 days`,
          value: recentCount || quarterCount,
        });

        // Check for negative reviews (1-2 stars)
        const negativeReviews = place.reviews.filter((r) => r.rating <= 2);
        if (negativeReviews.length > 0) {
          const negativeRatio = negativeReviews.length / place.reviews.length;
          reviewItems.push({
            id: 'rep-google-negative',
            label: 'Negative Review Ratio',
            status: negativeRatio <= 0.05 ? 'pass' : negativeRatio <= 0.15 ? 'warning' : 'fail',
            detail: `${negativeReviews.length} of ${place.reviews.length} visible reviews are 1-2 stars (${Math.round(negativeRatio * 100)}%)`,
            value: `${Math.round(negativeRatio * 100)}%`,
            benchmark: '≤ 5%',
          });
        }
      }
    } else {
      reviewItems.push({
        id: 'rep-google-none',
        label: 'Google Reviews',
        status: inputs.gbpUrl ? 'warning' : 'fail',
        detail: inputs.gbpUrl
          ? 'Could not retrieve Google review data'
          : 'No Google Business Profile — no Google reviews to analyze',
      });
    }

    const googleReviews = buildSubCategory('Google Reviews', reviewItems);

    // ── Website Testimonials ───────────────────────────────────────────────
    const testimonialItems: AuditItem[] = [];

    if (page) {
      const hasTestimonials = /testimonial|review|what .*(?:clients?|customers?) say|opiniones/i.test(page.textContent);
      const hasCaseStudies = /case stud|success stor|resultado/i.test(page.textContent);
      const hasClientLogos = /client|partner|trusted by|as seen/i.test(
        page.images.map((i) => `${i.alt ?? ''} ${i.src}`).join(' '),
      );
      const hasRatingWidget = /trustpilot|yelp|google.*review|clutch\.co|g2\.com/i.test(page.html);

      testimonialItems.push(
        {
          id: 'rep-site-testimonials',
          label: 'Testimonials on Website',
          status: hasTestimonials ? 'pass' : 'warning',
          detail: hasTestimonials
            ? 'Testimonial content detected on the website'
            : 'No testimonials found — add customer quotes to build trust',
        },
        {
          id: 'rep-site-casestudies',
          label: 'Case Studies / Success Stories',
          status: hasCaseStudies ? 'pass' : 'info',
          detail: hasCaseStudies
            ? 'Case study or success story content detected'
            : 'No case studies found — powerful for complex/expensive services',
        },
        {
          id: 'rep-site-logos',
          label: 'Client/Partner Logos',
          status: hasClientLogos ? 'pass' : 'info',
          detail: hasClientLogos
            ? 'Client or partner logo section detected'
            : 'No client logos found — social proof that builds instant credibility',
        },
        {
          id: 'rep-site-widget',
          label: 'Review Platform Widget',
          status: hasRatingWidget ? 'pass' : 'info',
          detail: hasRatingWidget
            ? 'Third-party review platform integration detected'
            : 'No review platform widget found — consider embedding Trustpilot, Yelp, or Google reviews',
        },
      );
    } else {
      testimonialItems.push({
        id: 'rep-site-unavailable',
        label: 'Website Testimonials',
        status: 'warning',
        detail: 'Could not access website to check for testimonials',
      });
    }

    const websiteTestimonials = buildSubCategory('Website Testimonials', testimonialItems);

    // ── Online Reputation ──────────────────────────────────────────────────
    const reputationItems: AuditItem[] = [];

    // Owner response rate (check if any reviews have responses)
    if (place && place.reviews.length > 0) {
      // Google Places API doesn't directly expose owner responses in the basic API,
      // so we use the presence of reviews as a proxy and let AI analyze sentiment
      reputationItems.push({
        id: 'rep-online-engagement',
        label: 'Review Engagement',
        status: place.reviewCount >= 10 ? 'pass' : 'warning',
        detail: place.reviewCount >= 10
          ? `Strong review base with ${place.reviewCount} reviews — indicates active customer engagement`
          : 'Low review count — actively request reviews from satisfied customers',
      });
    }

    // Check if business name appears on review sites (in website links)
    if (page) {
      const hasReviewSiteLinks = /yelp\.com|trustpilot\.com|bbb\.org|glassdoor/i.test(
        page.links.map((l) => l.href).join(' '),
      );
      reputationItems.push({
        id: 'rep-online-presence',
        label: 'Review Site Presence',
        status: hasReviewSiteLinks ? 'pass' : 'info',
        detail: hasReviewSiteLinks
          ? 'Links to review platforms found on website'
          : 'No links to review sites — consider linking to your best profiles',
      });
    }

    const onlineReputation = buildSubCategory('Online Reputation', reputationItems.length > 0 ? reputationItems : [{
      id: 'rep-online-baseline',
      label: 'Online Reputation',
      status: 'warning',
      detail: 'Limited data available — establish review collection processes',
    }]);

    const subCategories: SubCategory[] = [googleReviews, websiteTestimonials, onlineReputation];

    // ── AI Recommendations ─────────────────────────────────────────────────
    const recommendations = await generateRecommendations(subCategories, place, inputs);

    return buildCategoryResult('reputation', subCategories, recommendations);
  } catch (error) {
    return buildFailedCategoryResult(
      'reputation',
      `Reputation analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

// ─── AI Recommendations ──────────────────────────────────────────────────────

async function generateRecommendations(
  subCategories: SubCategory[],
  place: PlacesResult | null,
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
    const hasReviews = place && place.reviews.length > 0;

    const analysis = await callAIForRecommendations({
      task: 'reputation-recommendations',
      data: {
        issues,
        rating: place?.rating,
        reviewCount: place?.reviewCount,
        recentReviews: place?.reviews.slice(0, 5).map((r) => ({
          rating: r.rating,
          text: r.text.slice(0, 200),
        })),
        industry: inputs.goals.industry,
      },
      language: inputs.language,
      model: hasReviews ? 'sonnet' : 'haiku',
    });

    return analysis.recommendations.map((rec, i) => ({
      id: `rep-rec-${i}`,
      title: rec.title,
      description: rec.description,
      priority: rec.priority,
      effort: rec.effort,
      impact: rec.impact,
      category: 'reputation' as const,
    }));
  } catch {
    return issues.slice(0, 4).map((issue, i) => ({
      id: `rep-rec-${i}`,
      title: `Improve: ${issue.label}`,
      description: issue.detail,
      priority: issue.status === 'fail' ? 'high' as const : 'medium' as const,
      effort: 'moderate' as const,
      impact: 'medium' as const,
      category: 'reputation' as const,
    }));
  }
}
