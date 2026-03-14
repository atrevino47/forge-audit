// contracts/events.ts
// SSE event type definitions — Single source of truth for all agents

import type { AuditCategory, CategoryResult, Grade, Recommendation } from './audit-types';

export type SSEEvent =
  | { type: 'category_started'; category: AuditCategory }
  | { type: 'category_completed'; category: AuditCategory; score: number; results: CategoryResult }
  | { type: 'category_failed'; category: AuditCategory; error: string }
  | { type: 'overall_completed'; overallScore: number; grade: Grade; actionPlan: Recommendation[] }
  | { type: 'landing_page_ready'; previewUrl: string; pageId: string }
  | { type: 'error'; message: string };
