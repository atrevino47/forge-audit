// contracts/api-contracts.ts
// API route input/output types — Single source of truth for all agents

// POST /api/audit/start
export interface StartAuditRequest {
  email: string;
  fullName: string;
  businessName: string;
  websiteUrl: string;
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
  campaignSlug?: string;
}

export interface StartAuditResponse {
  auditId: string;
  streamUrl: string;
  estimatedTime: number;
}

// POST /api/competitor/analyze
export interface CompetitorAnalysisRequest {
  auditId: string;
  competitorUrl: string;
  paymentIntentId?: string;
  campaignSlug?: string;
}

// POST /api/campaigns/create
export interface CreateCampaignRequest {
  name: string;
  maxCompetitorAnalyses: number;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

export interface Campaign {
  id: string;
  slug: string;
  name: string;
  url: string;
  maxCompetitorAnalyses: number;
  isActive: boolean;
  analytics: {
    clicks: number;
    auditsStarted: number;
    auditsCompleted: number;
    callsBooked: number;
  };
}

// POST /api/payments/create-intent
export interface CreatePaymentIntentRequest {
  productType: 'competitor_analysis' | 'reaudit';
  auditId: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

// POST /api/auth/save-results
export interface SaveResultsRequest {
  auditId: string;
}

export interface SaveResultsResponse {
  userId: string;
  reauditWindow: {
    opensAt: string;
    expiresAt: string;
  };
}

// GET /api/admin/dashboard
export interface AdminDashboardResponse {
  totalAudits: number;
  totalLeads: number;
  conversionRate: number;
  totalRevenue: number;
  recentActivity: AdminActivityItem[];
}

export interface AdminActivityItem {
  id: string;
  type: 'audit_completed' | 'lead_captured' | 'call_booked' | 'payment_received';
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// GET /api/admin/leads
export interface LeadListItem {
  id: string;
  email: string;
  fullName: string;
  businessName: string;
  websiteUrl: string;
  overallScore: number | null;
  grade: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  source: 'organic' | 'campaign' | 'direct';
  createdAt: string;
  campaignName?: string;
}

// POST /api/landing-page/generate
export interface GenerateLandingPageRequest {
  auditId: string;
}

export interface GenerateLandingPageResponse {
  pageId: string;
  previewUrl: string;
}
