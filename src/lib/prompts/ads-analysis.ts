// src/lib/prompts/ads-analysis.ts
// Ads readiness analysis — Haiku (mostly technical detection)

import type { SupportedLanguage } from '../../../contracts/constants';

export interface AdsData {
  url: string;
  industry: string;
  businessSize: string;
  tracking: {
    hasMetaPixel: boolean;
    hasGoogleAnalytics: boolean;
    hasGoogleTagManager: boolean;
    hasConversionTracking: boolean;
    pixelIds: string[];
    gaIds: string[];
  };
  funnel: {
    hasLandingPages: boolean;
    hasThankYouPage: boolean;
    hasLeadCaptureForm: boolean;
    formAction: string | null;
  };
  retargeting: {
    pixelFiring: boolean;
    customAudiences: boolean;
  };
  adCreativeReadiness: {
    hasHighQualityImages: boolean;
    hasVideo: boolean;
    imageCount: number;
    hasBrandAssets: boolean;
  };
}

export const adsAnalysisPrompt = {
  system: (language: SupportedLanguage) =>
    `You are a paid advertising and performance marketing expert. Analyze the website's readiness for running paid ad campaigns (Meta Ads, Google Ads). Focus on tracking setup, funnel structure, and creative readiness. Always respond in ${language === 'es' ? 'Spanish' : 'English'}. Return ONLY valid JSON — no markdown fences, no commentary.`,

  user: (data: AdsData) =>
    `Analyze this website's ads readiness:

URL: ${data.url}
Industry: ${data.industry}
Business Size: ${data.businessSize}

TRACKING SETUP:
- Meta Pixel installed: ${data.tracking.hasMetaPixel}${data.tracking.pixelIds.length > 0 ? ` (IDs: ${data.tracking.pixelIds.join(', ')})` : ''}
- Google Analytics: ${data.tracking.hasGoogleAnalytics}${data.tracking.gaIds.length > 0 ? ` (IDs: ${data.tracking.gaIds.join(', ')})` : ''}
- Google Tag Manager: ${data.tracking.hasGoogleTagManager}
- Conversion tracking: ${data.tracking.hasConversionTracking}

FUNNEL STRUCTURE:
- Has dedicated landing pages: ${data.funnel.hasLandingPages}
- Has thank-you / confirmation page: ${data.funnel.hasThankYouPage}
- Has lead capture form: ${data.funnel.hasLeadCaptureForm}
- Form action: ${data.funnel.formAction ?? 'N/A'}

RETARGETING:
- Pixel firing correctly: ${data.retargeting.pixelFiring}
- Custom audience capability: ${data.retargeting.customAudiences}

AD CREATIVE READINESS:
- High-quality images: ${data.adCreativeReadiness.hasHighQualityImages}
- Video content: ${data.adCreativeReadiness.hasVideo}
- Image count: ${data.adCreativeReadiness.imageCount}
- Brand assets present: ${data.adCreativeReadiness.hasBrandAssets}

Return JSON matching this schema:
{
  "subCategories": [
    {
      "name": "Tracking & Analytics",
      "score": 0-100,
      "items": [
        {
          "id": "meta_pixel",
          "label": "Meta Pixel",
          "status": "pass" | "fail" | "warning",
          "detail": "Assessment of Meta Pixel installation"
        },
        {
          "id": "google_analytics",
          "label": "Google Analytics",
          "status": "pass" | "fail" | "warning",
          "detail": "Assessment"
        },
        {
          "id": "gtm",
          "label": "Google Tag Manager",
          "status": "pass" | "fail" | "warning",
          "detail": "Assessment"
        },
        {
          "id": "conversion_tracking",
          "label": "Conversion Tracking",
          "status": "pass" | "fail" | "warning",
          "detail": "Assessment"
        }
      ]
    },
    {
      "name": "Funnel Structure",
      "score": 0-100,
      "items": [
        {
          "id": "landing_page",
          "label": "Landing Page",
          "status": "pass" | "fail" | "warning",
          "detail": "Assessment of dedicated ad landing pages"
        },
        {
          "id": "thank_you_page",
          "label": "Thank You Page",
          "status": "pass" | "fail" | "warning",
          "detail": "Needed for conversion tracking"
        },
        {
          "id": "lead_capture",
          "label": "Lead Capture Form",
          "status": "pass" | "fail" | "warning",
          "detail": "Assessment"
        }
      ]
    },
    {
      "name": "Retargeting Readiness",
      "score": 0-100,
      "items": [
        {
          "id": "pixel_firing",
          "label": "Pixel Firing",
          "status": "pass" | "fail" | "warning",
          "detail": "Is the pixel actively collecting data?"
        },
        {
          "id": "audience_building",
          "label": "Audience Building",
          "status": "pass" | "fail" | "warning",
          "detail": "Can retargeting audiences be created?"
        }
      ]
    },
    {
      "name": "Creative Readiness",
      "score": 0-100,
      "items": [
        {
          "id": "image_assets",
          "label": "Image Assets",
          "status": "pass" | "fail" | "warning",
          "detail": "Assessment of available image assets for ads"
        },
        {
          "id": "video_assets",
          "label": "Video Assets",
          "status": "pass" | "fail" | "warning",
          "detail": "Assessment"
        },
        {
          "id": "brand_assets",
          "label": "Brand Assets",
          "status": "pass" | "fail" | "warning",
          "detail": "Logo, colors, and brand elements suitable for ad creative"
        }
      ]
    }
  ],
  "recommendations": [
    {
      "title": "Short action title",
      "description": "Detailed, actionable explanation — include specific implementation steps",
      "priority": "high" | "medium" | "low",
      "effort": "quick-win" | "moderate" | "major-project",
      "impact": "high" | "medium" | "low"
    }
  ]
}

Scoring: each tracking tool present = pass. Missing Meta Pixel or GA = fail (critical). Missing GTM = warning. No conversion tracking = fail. Funnel: landing page + form + thank you page = pass. Missing any = warning/fail based on importance. Creative: ≥5 quality images = pass, video is a plus.`,
};
