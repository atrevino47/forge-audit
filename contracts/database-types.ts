// contracts/database-types.ts
// Supabase database types — Single source of truth for all agents
// Will be replaced by auto-generated types from `npx supabase gen types`
// Manual types matching schema in PROJECT-PLAN.md Section 5.2

export interface DbLead {
  id: string;
  email: string;
  full_name: string;
  business_name: string;
  website_url: string;
  created_at: string;
  updated_at: string;
  language: 'en' | 'es';
  source: 'organic' | 'campaign' | 'direct' | null;
  campaign_id: string | null;
  ip_address: string | null;
}

export interface DbUser {
  id: string;
  lead_id: string | null;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  role: 'user' | 'team' | 'admin';
}

export interface DbAudit {
  id: string;
  lead_id: string;
  user_id: string | null;
  status: 'pending' | 'running' | 'completed' | 'failed';
  overall_score: number | null;
  overall_grade: string | null;
  inputs: Record<string, unknown>;
  created_at: string;
  completed_at: string | null;
  is_reaudit: boolean;
  parent_audit_id: string | null;
  is_paid: boolean;
  payment_id: string | null;
  language: 'en' | 'es';
}

export interface DbAuditCategory {
  id: string;
  audit_id: string;
  category: 'seo' | 'website' | 'social' | 'branding' | 'gbp' | 'ads' | 'reputation';
  score: number | null;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results: Record<string, unknown> | null;
  recommendations: Record<string, unknown> | null;
  raw_data: Record<string, unknown> | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface DbCompetitorAnalysis {
  id: string;
  audit_id: string;
  competitor_url: string;
  competitor_name: string | null;
  scores: Record<string, unknown> | null;
  gaps: Record<string, unknown> | null;
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  completed_at: string | null;
}

export interface DbGeneratedPage {
  id: string;
  audit_id: string;
  html_content: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface DbCampaign {
  id: string;
  team_member_id: string | null;
  name: string;
  slug: string;
  max_competitor_analyses: number;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  metadata: Record<string, unknown> | null;
}

export interface DbCampaignAnalytics {
  id: string;
  campaign_id: string;
  event_type: 'click' | 'audit_started' | 'audit_completed' | 'call_booked' | 'converted';
  lead_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface DbPayment {
  id: string;
  user_id: string | null;
  lead_id: string | null;
  stripe_payment_id: string;
  stripe_customer_id: string | null;
  amount_cents: number;
  currency: string;
  product_type: 'competitor_analysis' | 'reaudit';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
}

export interface DbReauditWindow {
  id: string;
  audit_id: string;
  user_id: string;
  opens_at: string;
  expires_at: string;
  used: boolean;
  used_at: string | null;
  reminder_day3_sent: boolean;
  reminder_day10_sent: boolean;
  reminder_day13_sent: boolean;
}

export interface DbRateLimit {
  id: string;
  ip_address: string | null;
  email: string | null;
  audit_count: number;
  last_audit_at: string;
  window_start: string;
}

// Database type map for Supabase client
export interface Database {
  public: {
    Tables: {
      leads: { Row: DbLead; Insert: Omit<DbLead, 'id' | 'created_at' | 'updated_at'>; Update: Partial<DbLead> };
      users: { Row: DbUser; Insert: Omit<DbUser, 'created_at'>; Update: Partial<DbUser> };
      audits: { Row: DbAudit; Insert: Omit<DbAudit, 'id' | 'created_at'>; Update: Partial<DbAudit> };
      audit_categories: { Row: DbAuditCategory; Insert: Omit<DbAuditCategory, 'id'>; Update: Partial<DbAuditCategory> };
      competitor_analyses: { Row: DbCompetitorAnalysis; Insert: Omit<DbCompetitorAnalysis, 'id' | 'created_at'>; Update: Partial<DbCompetitorAnalysis> };
      generated_pages: { Row: DbGeneratedPage; Insert: Omit<DbGeneratedPage, 'id' | 'created_at'>; Update: Partial<DbGeneratedPage> };
      campaigns: { Row: DbCampaign; Insert: Omit<DbCampaign, 'id' | 'created_at'>; Update: Partial<DbCampaign> };
      campaign_analytics: { Row: DbCampaignAnalytics; Insert: Omit<DbCampaignAnalytics, 'id' | 'created_at'>; Update: Partial<DbCampaignAnalytics> };
      payments: { Row: DbPayment; Insert: Omit<DbPayment, 'id' | 'created_at'>; Update: Partial<DbPayment> };
      reaudit_windows: { Row: DbReauditWindow; Insert: Omit<DbReauditWindow, 'id'>; Update: Partial<DbReauditWindow> };
      rate_limits: { Row: DbRateLimit; Insert: Omit<DbRateLimit, 'id'>; Update: Partial<DbRateLimit> };
    };
  };
}
