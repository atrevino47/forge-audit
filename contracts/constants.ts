// contracts/constants.ts
// Shared constants — Single source of truth for all agents

import type { AuditCategory, Grade } from './audit-types';

// Scoring thresholds for letter grades
export const GRADE_THRESHOLDS: { min: number; grade: Grade }[] = [
  { min: 97, grade: 'A+' },
  { min: 93, grade: 'A' },
  { min: 90, grade: 'A-' },
  { min: 87, grade: 'B+' },
  { min: 83, grade: 'B' },
  { min: 80, grade: 'B-' },
  { min: 77, grade: 'C+' },
  { min: 73, grade: 'C' },
  { min: 70, grade: 'C-' },
  { min: 67, grade: 'D+' },
  { min: 63, grade: 'D' },
  { min: 60, grade: 'D-' },
  { min: 0, grade: 'F' },
];

// Category weights for overall score calculation (must sum to 1.0)
export const CATEGORY_WEIGHTS: Record<AuditCategory, number> = {
  seo: 0.20,
  website: 0.20,
  social: 0.15,
  branding: 0.15,
  gbp: 0.10,
  ads: 0.10,
  reputation: 0.10,
};

// Category display labels
export const CATEGORY_LABELS: Record<AuditCategory, { en: string; es: string }> = {
  seo: { en: 'SEO', es: 'SEO' },
  website: { en: 'Website Quality', es: 'Calidad del Sitio Web' },
  social: { en: 'Social Media', es: 'Redes Sociales' },
  branding: { en: 'Branding & Positioning', es: 'Marca y Posicionamiento' },
  gbp: { en: 'Google Business Profile', es: 'Perfil de Google Business' },
  ads: { en: 'Ads Readiness', es: 'Preparación para Anuncios' },
  reputation: { en: 'Reputation & Reviews', es: 'Reputación y Reseñas' },
};

// Rate limiting
export const RATE_LIMITS = {
  FREE_AUDITS_PER_EMAIL: 1,
  FREE_AUDITS_PER_IP_24H: 3,
  API_REQUESTS_PER_MINUTE: 60,
  MAX_SSE_CONNECTIONS_PER_AUDIT: 1,
} as const;

// Pricing (in cents)
export const PRICING = {
  COMPETITOR_ANALYSIS: 9900,
  REAUDIT_MIN: 19900,
  REAUDIT_MAX: 29900,
} as const;

// Re-audit window
export const REAUDIT_WINDOW = {
  DURATION_DAYS: 14,
  REMINDER_DAY_3: 3,
  REMINDER_DAY_10: 10,
  REMINDER_DAY_13: 13,
} as const;

// Supported languages
export const SUPPORTED_LANGUAGES = ['en', 'es'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Audit categories in display order
export const AUDIT_CATEGORIES: AuditCategory[] = [
  'seo',
  'website',
  'social',
  'branding',
  'gbp',
  'ads',
  'reputation',
];
