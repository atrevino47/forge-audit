// src/lib/audit/index.ts
// Barrel exports for the audit engine

export { runAudit } from './orchestrator';
export {
  calculateSubCategoryScore,
  calculateCategoryScore,
  calculateOverallScore,
  calculateGrade,
  buildSubCategory,
  buildCategoryResult,
  buildFailedCategoryResult,
  buildActionPlan,
} from './scoring';
export { checkRateLimit, recordAuditUsage } from './rate-limiter';
export { callAIForRecommendations } from './ai-bridge';
export type { RateLimitResult } from './rate-limiter';
export type {
  AuditInputs,
  ScrapedPage,
  PageSpeedResult,
  PlacesResult,
  PlaceReview,
  ScreenshotResult,
  AIAnalyzeOptions,
  AIAnalysisResult,
  AIRecommendation,
  CategoryJob,
  AnalyzerFn,
} from './types';
export { ANALYZER_TIMEOUT_MS, AUDIT_TIMEOUT_MS } from './types';
