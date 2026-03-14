// contracts/audit-types.ts
// Audit result interfaces — Single source of truth for all agents

export type AuditCategory = 'seo' | 'website' | 'social' | 'branding' | 'gbp' | 'ads' | 'reputation';
export type AuditStatus = 'pending' | 'running' | 'completed' | 'failed';
export type ItemStatus = 'pass' | 'fail' | 'warning' | 'info';
export type Priority = 'high' | 'medium' | 'low';
export type Grade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'F';

export interface AuditItem {
  id: string;
  label: string;
  status: ItemStatus;
  detail: string;
  value?: string | number;
  benchmark?: string | number;
}

export interface SubCategory {
  name: string;
  score: number;
  items: AuditItem[];
}

export interface CategoryResult {
  category: AuditCategory;
  score: number;
  status: AuditStatus;
  subCategories: SubCategory[];
  recommendations: Recommendation[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  effort: 'quick-win' | 'moderate' | 'major-project';
  impact: 'high' | 'medium' | 'low';
  category: AuditCategory;
}

export interface AuditResult {
  id: string;
  overallScore: number;
  grade: Grade;
  categories: CategoryResult[];
  actionPlan: Recommendation[];
  generatedPage?: {
    id: string;
    previewUrl: string;
  };
  createdAt: string;
  completedAt: string;
}
