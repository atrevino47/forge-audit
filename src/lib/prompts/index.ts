// src/lib/prompts/index.ts
// Re-exports all analysis prompts

export { seoTechnicalPrompt, seoContentPrompt } from './seo-analysis';
export type { SEOData } from './seo-analysis';

export { websitePerformancePrompt, websiteUXConversionPrompt } from './website-analysis';
export type { WebsiteData } from './website-analysis';

export { socialAnalysisPrompt } from './social-analysis';
export type { SocialData } from './social-analysis';

export { brandingAnalysisPrompt } from './branding-analysis';
export type { BrandingData } from './branding-analysis';

export { gbpCompletenessPrompt, gbpReviewSentimentPrompt } from './gbp-analysis';
export type { GBPData } from './gbp-analysis';

export { adsAnalysisPrompt } from './ads-analysis';
export type { AdsData } from './ads-analysis';

export { reputationMetricsPrompt, reputationSentimentPrompt } from './reputation-analysis';
export type { ReputationData } from './reputation-analysis';

export { actionPlanPrompt } from './action-plan';
export type { ActionPlanInput } from './action-plan';

export { landingPageCopyPrompt } from './landing-page';
export type { LandingPageCopyInput } from './landing-page';

export { competitorComparisonPrompt } from './competitor-comparison';
export type { CompetitorComparisonInput } from './competitor-comparison';
