// src/lib/audit/types.ts
// Internal types for the audit engine — extends contracts/audit-types.ts

import type { AuditCategory, CategoryResult } from '../../../contracts/audit-types';

// ─── Inputs ──────────────────────────────────────────────────────────────────

/** Inputs passed to each analyzer, derived from the API request */
export interface AuditInputs {
  auditId: string;
  websiteUrl: string;
  businessName: string;
  socials?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    linkedin?: string;
  };
  gbpUrl?: string;
  goals: {
    industry: string;
    mainChallenge: string;
    businessSize: string;
  };
  language: 'en' | 'es';
}

// ─── Scraper Types ───────────────────────────────────────────────────────────

/** Scraped page data returned by the scraper utility */
export interface ScrapedPage {
  url: string;
  html: string;
  statusCode: number;
  headers: Record<string, string>;
  meta: {
    title?: string;
    description?: string;
    canonical?: string;
    ogImage?: string;
    viewport?: string;
    charset?: string;
    robots?: string;
  };
  headings: { tag: string; text: string }[];
  images: { src: string; alt: string | null }[];
  links: { href: string; text: string; isInternal: boolean }[];
  scripts: { src?: string; content?: string }[];
  textContent: string;
  wordCount: number;
  hasSSL: boolean;
  schemaMarkup: Record<string, unknown>[];
}

// ─── API Client Types ────────────────────────────────────────────────────────

/** Google PageSpeed Insights result */
export interface PageSpeedResult {
  performanceScore: number;
  metrics: {
    lcp: number;
    cls: number;
    inp: number;
    fcp: number;
    ttfb: number;
    speedIndex: number;
    tbt: number;
  };
  isMobileFriendly: boolean;
}

/** Google Places API result */
export interface PlacesResult {
  name: string;
  rating: number;
  reviewCount: number;
  reviews: PlaceReview[];
  photoCount: number;
  categories: string[];
  address: string;
  phone?: string;
  website?: string;
  hours?: string[];
  description?: string;
}

export interface PlaceReview {
  text: string;
  rating: number;
  time: string;
  authorName: string;
}

// ─── Screenshot Types ────────────────────────────────────────────────────────

/** Screenshot result */
export interface ScreenshotResult {
  imageBase64: string;
  mimeType: 'image/png' | 'image/jpeg';
  width: number;
  height: number;
}

// ─── AI Integration Types ────────────────────────────────────────────────────

/**
 * Expected interface for AI analysis functions provided by AI/Copy agent.
 * Import the real functions from @/lib/ai/client — these types define the contract.
 */
export interface AIAnalyzeOptions {
  task: string;
  data: Record<string, unknown>;
  language: 'en' | 'es';
}

export interface AIAnalysisResult {
  findings: string[];
  recommendations: AIRecommendation[];
  scores?: Record<string, number>;
}

export interface AIRecommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'quick-win' | 'moderate' | 'major-project';
  impact: 'high' | 'medium' | 'low';
}

// ─── Orchestrator Types ──────────────────────────────────────────────────────

/** Internal category tracking during orchestration */
export interface CategoryJob {
  category: AuditCategory;
  categoryId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: CategoryResult;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

/** Analyzer function signature */
export type AnalyzerFn = (inputs: AuditInputs) => Promise<CategoryResult>;

// ─── Constants ───────────────────────────────────────────────────────────────

/** Per-analyzer timeout in milliseconds */
export const ANALYZER_TIMEOUT_MS = 30_000;

/** Overall audit timeout in milliseconds */
export const AUDIT_TIMEOUT_MS = 60_000;
