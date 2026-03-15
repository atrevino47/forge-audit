import { z } from 'zod';

export const startAuditSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(100),
  businessName: z.string().min(1).max(200),
  websiteUrl: z.string().min(3),
  socials: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    tiktok: z.string().optional(),
    linkedin: z.string().optional(),
  }).optional(),
  gbpUrl: z.string().optional(),
  goals: z.object({
    industry: z.string().min(1),
    mainChallenge: z.string().min(1),
    businessSize: z.string().min(1),
  }),
  language: z.enum(['en', 'es']),
  campaignSlug: z.string().optional(),
});

export const rerunAuditSchema = z.object({
  paymentIntentId: z.string().optional(),
});

export const competitorAnalyzeSchema = z.object({
  auditId: z.string().uuid(),
  competitorUrl: z.string().url(),
  paymentIntentId: z.string().optional(),
  campaignSlug: z.string().optional(),
});

export const saveResultsSchema = z.object({
  auditId: z.string().uuid(),
});

export const createPaymentIntentSchema = z.object({
  productType: z.enum(['competitor_analysis', 'reaudit']),
  auditId: z.string().uuid(),
});

export const createCampaignSchema = z.object({
  name: z.string().min(1).max(200),
  maxCompetitorAnalyses: z.number().int().min(1).max(100),
  expiresAt: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const generateLandingPageSchema = z.object({
  auditId: z.string().uuid(),
});

export const abandonedEmailSchema = z.object({
  leadId: z.string().uuid(),
});

export const reauditReminderSchema = z.object({
  userId: z.string().uuid(),
  auditId: z.string().uuid(),
  dayNumber: z.enum(['3', '10', '13']),
});

export const adminLeadsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['new', 'contacted', 'qualified', 'closed']).optional(),
  source: z.enum(['organic', 'campaign', 'direct']).optional(),
  search: z.string().optional(),
});

export const teamMemberSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(100),
  role: z.enum(['team', 'admin']),
});

export const teamMemberUpdateSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['team', 'admin']).optional(),
  fullName: z.string().min(2).max(100).optional(),
});

export const teamMemberDeleteSchema = z.object({
  id: z.string().uuid(),
});

export const updateLeadSchema = z.object({
  leadId: z.string().uuid(),
  status: z.enum(['new', 'contacted', 'qualified', 'closed']).optional(),
});

export const addLeadNoteSchema = z.object({
  content: z.string().min(1).max(5000),
  noteType: z.enum(['note', 'call', 'email', 'meeting']).default('note'),
});

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type AddLeadNoteInput = z.infer<typeof addLeadNoteSchema>;

export type StartAuditInput = z.infer<typeof startAuditSchema>;
export type CompetitorAnalyzeInput = z.infer<typeof competitorAnalyzeSchema>;
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
