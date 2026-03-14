// src/lib/prompts/reputation-analysis.ts
// Reputation & reviews — Haiku for metrics, Sonnet for sentiment

import type { SupportedLanguage } from '../../../contracts/constants';

export interface ReputationData {
  url: string;
  industry: string;
  businessSize: string;
  businessName: string;
  reviewPlatforms: {
    google?: {
      totalReviews: number;
      averageRating: number | null;
      recentReviews: {
        rating: number;
        text: string;
        date: string;
        hasResponse: boolean;
      }[];
    };
    facebook?: {
      totalReviews: number;
      averageRating: number | null;
    };
    yelp?: {
      totalReviews: number;
      averageRating: number | null;
    };
  };
  websiteTrustSignals: {
    hasTestimonials: boolean;
    hasCaseStudies: boolean;
    hasCertifications: boolean;
    hasPartnerLogos: boolean;
    hasMediaMentions: boolean;
  };
  responseRate: number | null;
  averageResponseTime: string | null;
}

export const reputationMetricsPrompt = {
  system: (language: SupportedLanguage) =>
    `You are a reputation management expert. Analyze the business's review volume, ratings, and response patterns across platforms. Always respond in ${language === 'es' ? 'Spanish' : 'English'}. Return ONLY valid JSON — no markdown fences, no commentary.`,

  user: (data: ReputationData) =>
    `Analyze this business's online reputation metrics:

Business: ${data.businessName}
URL: ${data.url}
Industry: ${data.industry}
Business Size: ${data.businessSize}

REVIEW PLATFORMS:
${data.reviewPlatforms.google ? `Google Reviews: ${data.reviewPlatforms.google.totalReviews} reviews, ${data.reviewPlatforms.google.averageRating ?? 'N/A'} avg rating` : 'Google Reviews: Not found'}
${data.reviewPlatforms.facebook ? `Facebook Reviews: ${data.reviewPlatforms.facebook.totalReviews} reviews, ${data.reviewPlatforms.facebook.averageRating ?? 'N/A'} avg rating` : 'Facebook Reviews: Not found'}
${data.reviewPlatforms.yelp ? `Yelp Reviews: ${data.reviewPlatforms.yelp.totalReviews} reviews, ${data.reviewPlatforms.yelp.averageRating ?? 'N/A'} avg rating` : 'Yelp Reviews: Not found'}

Response rate: ${data.responseRate !== null ? `${data.responseRate}%` : 'Unknown'}
Average response time: ${data.averageResponseTime ?? 'Unknown'}

WEBSITE TRUST SIGNALS:
- Testimonials on website: ${data.websiteTrustSignals.hasTestimonials}
- Case studies: ${data.websiteTrustSignals.hasCaseStudies}
- Certifications: ${data.websiteTrustSignals.hasCertifications}
- Partner/client logos: ${data.websiteTrustSignals.hasPartnerLogos}
- Media mentions: ${data.websiteTrustSignals.hasMediaMentions}

Return JSON matching this schema:
{
  "subCategories": [
    {
      "name": "Review Volume",
      "score": 0-100,
      "items": [
        {
          "id": "google_volume",
          "label": "Google Review Count",
          "status": "pass" | "fail" | "warning",
          "detail": "Assessment",
          "value": "current count",
          "benchmark": "20+ for local businesses"
        }
      ]
    },
    {
      "name": "Review Quality",
      "score": 0-100,
      "items": [
        {
          "id": "avg_rating",
          "label": "Average Rating",
          "status": "pass" | "fail" | "warning",
          "detail": "Assessment",
          "value": "current rating",
          "benchmark": "4.0+"
        }
      ]
    },
    {
      "name": "Response Management",
      "score": 0-100,
      "items": [
        {
          "id": "response_rate",
          "label": "Response Rate",
          "status": "pass" | "fail" | "warning",
          "detail": "Assessment"
        },
        {
          "id": "response_timeliness",
          "label": "Response Timeliness",
          "status": "pass" | "fail" | "warning",
          "detail": "Assessment"
        }
      ]
    },
    {
      "name": "Trust Signals",
      "score": 0-100,
      "items": [
        {
          "id": "testimonials",
          "label": "Website Testimonials",
          "status": "pass" | "fail" | "warning",
          "detail": "Assessment"
        },
        {
          "id": "social_proof",
          "label": "Social Proof Elements",
          "status": "pass" | "fail" | "warning",
          "detail": "Assessment of certifications, logos, case studies"
        }
      ]
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

Volume thresholds: ≥20 Google reviews = pass, 5-19 = warning, <5 = fail.
Rating: ≥4.5 = pass, 4.0-4.4 = warning, <4.0 = fail.
Response rate: ≥80% = pass, 50-79% = warning, <50% = fail.
Trust signals: ≥3 types present = pass, 1-2 = warning, 0 = fail.`,
};

export const reputationSentimentPrompt = {
  system: (language: SupportedLanguage) =>
    `You are a sentiment analysis and reputation expert. Analyze the tone, themes, and patterns in customer reviews to extract actionable insights about the business's reputation. Always respond in ${language === 'es' ? 'Spanish' : 'English'}. Return ONLY valid JSON — no markdown fences, no commentary.`,

  user: (data: ReputationData) => {
    const reviews = data.reviewPlatforms.google?.recentReviews ?? [];

    if (reviews.length === 0) {
      return `No reviews available for sentiment analysis.

Business: ${data.businessName}
Industry: ${data.industry}

Return JSON with a low sentiment score and recommend strategies for generating reviews.

{
  "subCategories": [
    {
      "name": "Sentiment Analysis",
      "score": 0,
      "items": [
        {
          "id": "no_reviews",
          "label": "No Reviews Available",
          "status": "fail",
          "detail": "Cannot perform sentiment analysis without reviews"
        }
      ]
    }
  ],
  "recommendations": [
    {
      "title": "Build a review generation system",
      "description": "Implement a post-service follow-up to request reviews...",
      "priority": "high",
      "effort": "moderate",
      "impact": "high"
    }
  ]
}`;
    }

    return `Analyze the sentiment and themes in these customer reviews:

Business: ${data.businessName}
Industry: ${data.industry}

Reviews:
${JSON.stringify(reviews.slice(0, 20), null, 2)}

Return JSON matching this schema:
{
  "subCategories": [
    {
      "name": "Sentiment Analysis",
      "score": 0-100,
      "items": [
        {
          "id": "overall_sentiment",
          "label": "Overall Sentiment",
          "status": "pass" | "fail" | "warning",
          "detail": "Summary of general customer sentiment"
        },
        {
          "id": "positive_themes",
          "label": "Positive Themes",
          "status": "info",
          "detail": "List the top 3 recurring positive themes"
        },
        {
          "id": "negative_themes",
          "label": "Areas for Improvement",
          "status": "info",
          "detail": "List any recurring complaints or concerns"
        },
        {
          "id": "response_quality",
          "label": "Owner Response Quality",
          "status": "pass" | "fail" | "warning",
          "detail": "Are responses personalized, professional, and constructive?"
        }
      ]
    }
  ],
  "recommendations": [
    {
      "title": "Short action title",
      "description": "Specific advice based on sentiment patterns — reference actual review themes",
      "priority": "high" | "medium" | "low",
      "effort": "quick-win" | "moderate" | "major-project",
      "impact": "high" | "medium" | "low"
    }
  ]
}

Analyze: overall sentiment distribution, recurring positive themes (what customers love), recurring negative themes (what needs fixing), quality and personalization of owner responses. Provide 3-5 recommendations.`;
  },
};
