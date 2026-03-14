// src/lib/prompts/gbp-analysis.ts
// Google Business Profile analysis — Haiku for completeness, Sonnet for review sentiment

import type { SupportedLanguage } from '../../../contracts/constants';

export interface GBPData {
  url: string;
  industry: string;
  businessSize: string;
  gbpUrl: string | null;
  profile: {
    name: string | null;
    address: string | null;
    phone: string | null;
    website: string | null;
    hours: string | null;
    description: string | null;
    categories: string[];
    isVerified: boolean;
  } | null;
  photos: {
    total: number;
    ownerPhotos: number;
    customerPhotos: number;
    mostRecentDate: string | null;
  } | null;
  reviews: {
    totalCount: number;
    averageRating: number | null;
    recentReviews: {
      rating: number;
      text: string;
      date: string;
      hasOwnerResponse: boolean;
      ownerResponse: string | null;
    }[];
  } | null;
  posts: {
    totalCount: number;
    mostRecentDate: string | null;
  } | null;
  qAndA: {
    totalCount: number;
    answeredCount: number;
  } | null;
}

export const gbpCompletenessPrompt = {
  system: (language: SupportedLanguage) =>
    `You are a Google Business Profile optimization expert. Evaluate the completeness and quality of the provided GBP data. Always respond in ${language === 'es' ? 'Spanish' : 'English'}. Return ONLY valid JSON — no markdown fences, no commentary.`,

  user: (data: GBPData) => {
    if (!data.gbpUrl && !data.profile) {
      return `The business did not provide a Google Business Profile URL and no profile was detected.

URL: ${data.url}
Industry: ${data.industry}
Business Size: ${data.businessSize}

Return JSON matching the schema below. Score this very low (10-20) and recommend creating/claiming a GBP immediately.

{
  "subCategories": [
    {
      "name": "Profile Completeness",
      "score": 0-100,
      "items": [
        {
          "id": "gbp_exists",
          "label": "Google Business Profile",
          "status": "fail",
          "detail": "No GBP detected — critical for local visibility"
        }
      ]
    }
  ],
  "recommendations": [
    {
      "title": "Short action title",
      "description": "Detailed explanation of why GBP matters and how to set one up",
      "priority": "high",
      "effort": "moderate",
      "impact": "high"
    }
  ]
}`;
    }

    return `Analyze this Google Business Profile's completeness:

URL: ${data.url}
Industry: ${data.industry}
GBP URL: ${data.gbpUrl ?? 'Auto-detected'}

Profile Data:
- Name: ${data.profile?.name ?? 'Missing'}
- Address: ${data.profile?.address ?? 'Missing'}
- Phone: ${data.profile?.phone ?? 'Missing'}
- Website: ${data.profile?.website ?? 'Missing'}
- Hours: ${data.profile?.hours ?? 'Missing'}
- Description: ${data.profile?.description ?? 'Missing'}
- Categories: ${data.profile?.categories.join(', ') || 'None set'}
- Verified: ${data.profile?.isVerified ?? false}

Photos:
- Total: ${data.photos?.total ?? 0}
- Owner photos: ${data.photos?.ownerPhotos ?? 0}
- Customer photos: ${data.photos?.customerPhotos ?? 0}
- Most recent: ${data.photos?.mostRecentDate ?? 'Unknown'}

Reviews:
- Total count: ${data.reviews?.totalCount ?? 0}
- Average rating: ${data.reviews?.averageRating ?? 'N/A'}

Posts:
- Total: ${data.posts?.totalCount ?? 0}
- Most recent: ${data.posts?.mostRecentDate ?? 'Unknown'}

Q&A:
- Total questions: ${data.qAndA?.totalCount ?? 0}
- Answered: ${data.qAndA?.answeredCount ?? 0}

Return JSON matching this schema:
{
  "subCategories": [
    {
      "name": "Profile Completeness",
      "score": 0-100,
      "items": [
        {
          "id": "name",
          "label": "Business Name",
          "status": "pass" | "fail",
          "detail": "Assessment"
        }
      ]
    },
    {
      "name": "Visual Content",
      "score": 0-100,
      "items": [...]
    },
    {
      "name": "Activity",
      "score": 0-100,
      "items": [...]
    }
  ],
  "recommendations": [
    {
      "title": "Short action title",
      "description": "Detailed, actionable explanation",
      "priority": "high" | "medium" | "low",
      "effort": "quick-win" | "moderate" | "major-project",
      "impact": "high" | "medium" | "low"
    }
  ]
}

Completeness items: name, address, phone, website, hours, description, categories (≥2), verification status.
Photo thresholds: ≥10 owner photos = pass, 5-9 = warning, <5 = fail. Recent photos (within 3 months) = pass.
Activity: Google Posts within 7 days = pass, 7-30 days = warning, >30 days or none = fail.
Q&A: all answered = pass, some unanswered = warning.`;
  },
};

export const gbpReviewSentimentPrompt = {
  system: (language: SupportedLanguage) =>
    `You are a reputation and review analysis expert. Analyze the sentiment, patterns, and owner response quality of Google Business Profile reviews. Always respond in ${language === 'es' ? 'Spanish' : 'English'}. Return ONLY valid JSON — no markdown fences, no commentary.`,

  user: (data: GBPData) => {
    if (!data.reviews || data.reviews.totalCount === 0) {
      return `No reviews found for this business.

URL: ${data.url}
Industry: ${data.industry}

Return JSON with a low score and recommend strategies for generating reviews.

{
  "subCategories": [
    {
      "name": "Reviews",
      "score": 15,
      "items": [
        {
          "id": "review_count",
          "label": "Review Volume",
          "status": "fail",
          "detail": "No reviews found — this significantly impacts local trust and search ranking"
        }
      ]
    }
  ],
  "recommendations": [
    {
      "title": "Start collecting customer reviews",
      "description": "Implement a systematic review request process...",
      "priority": "high",
      "effort": "moderate",
      "impact": "high"
    }
  ]
}`;
    }

    return `Analyze the reviews for this business:

URL: ${data.url}
Industry: ${data.industry}

Review Summary:
- Total: ${data.reviews.totalCount}
- Average rating: ${data.reviews.averageRating}

Recent Reviews (sample):
${JSON.stringify(data.reviews.recentReviews.slice(0, 15), null, 2)}

Return JSON matching this schema:
{
  "subCategories": [
    {
      "name": "Reviews",
      "score": 0-100,
      "items": [
        {
          "id": "review_volume",
          "label": "Review Volume",
          "status": "pass" | "fail" | "warning",
          "detail": "Assessment of review count relative to industry",
          "value": "current count",
          "benchmark": "expected for industry"
        },
        {
          "id": "average_rating",
          "label": "Average Rating",
          "status": "pass" | "fail" | "warning",
          "detail": "Assessment",
          "value": "current rating",
          "benchmark": "4.0+"
        },
        {
          "id": "response_rate",
          "label": "Owner Response Rate",
          "status": "pass" | "fail" | "warning",
          "detail": "Assessment of how consistently the owner responds"
        },
        {
          "id": "response_quality",
          "label": "Response Quality",
          "status": "pass" | "fail" | "warning",
          "detail": "Assessment of response personalization and professionalism"
        },
        {
          "id": "sentiment",
          "label": "Overall Sentiment",
          "status": "pass" | "fail" | "warning",
          "detail": "Summary of positive/negative themes"
        }
      ]
    }
  ],
  "recommendations": [
    {
      "title": "Short action title",
      "description": "Specific, actionable advice based on the review patterns found",
      "priority": "high" | "medium" | "low",
      "effort": "quick-win" | "moderate" | "major-project",
      "impact": "high" | "medium" | "low"
    }
  ]
}

Rating thresholds: ≥4.5 = pass, 4.0-4.4 = warning, <4.0 = fail.
Volume: ≥20 = pass, 5-19 = warning, <5 = fail (adjust by industry).
Response rate: ≥80% = pass, 50-79% = warning, <50% = fail.
Identify recurring positive/negative themes in the review text.`;
  },
};
