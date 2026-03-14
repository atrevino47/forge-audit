# AGENT-BACKEND — Backend Agent Instructions

> Read `CLAUDE.md` first, then this file.

## Your Role
You own all server-side logic: database schema, API routes, authentication, payments, rate limiting, campaign links, cron jobs, and email sending infrastructure.

## Your Directories (YOU OWN THESE)
```
/supabase/migrations/          # Database migrations
/supabase/seed.sql             # Seed data
/src/app/api/                  # ALL API route handlers
/src/lib/db/                   # Supabase client, queries, types
/src/lib/auth/                 # Auth config, middleware, guards
/src/lib/stripe/               # Stripe client, webhooks, payment logic
/src/lib/email/sender.ts       # Email sending via Resend (NOT templates)
/src/middleware.ts              # Next.js middleware (auth, rate limiting)
/next.config.ts                # Next.js configuration
```

## DO NOT TOUCH
- `/src/components/` (Frontend Agent)
- `/src/app/(pages)/` (Frontend Agent)
- `/src/lib/audit/` (Audit Engine Agent)
- `/src/lib/ai/` (AI/Copy Agent)
- `/src/lib/prompts/` (AI/Copy Agent)
- `/contracts/` (Master only)

## Phase 1 Tasks (Foundation — Week 1)

### 1. Supabase Schema Migration
Create the full database schema as defined in `docs/PROJECT-PLAN.md` Section 5.2. Include all tables, indexes, and RLS policies.

```bash
npx supabase migration new initial_schema
```

Key tables: leads, users, audits, audit_categories, competitor_analyses, generated_pages, campaigns, campaign_analytics, payments, reaudit_windows, rate_limits.

### 2. Supabase Auth Configuration
- Enable Google OAuth provider
- Enable magic link (email) provider
- Configure redirect URLs for audit.forgedigital.com
- Set up auth helpers for Next.js App Router

### 3. API Route Stubs
Create all API routes with proper input validation (Zod schemas) and error handling, returning mock data initially:
```
/api/audit/start          POST
/api/audit/status/[id]    GET (SSE)
/api/audit/results/[id]   GET
/api/audit/rerun/[id]     POST
/api/competitor/analyze    POST
/api/competitor/results/[id] GET
/api/auth/callback         GET
/api/auth/save-results     POST
/api/payments/create-intent POST
/api/payments/webhook      POST
/api/payments/verify       GET
/api/campaigns/create      POST
/api/campaigns/[slug]      GET
/api/campaigns/analytics   GET
/api/admin/leads           GET
/api/admin/dashboard       GET
/api/admin/team            CRUD
/api/landing-page/generate POST
/api/email/abandoned       POST
/api/email/reaudit-reminder POST
```

## Phase 2 Tasks (Core — Week 2)

### 4. Rate Limiting
Implement IP + email rate limiting:
- 1 free audit per email (lifetime) — check `rate_limits` table
- 3 audits per IP per 24h rolling window
- 60 requests/minute per IP (general API)
- Return 429 with retry-after header

### 5. SSE Streaming Endpoint
`/api/audit/status/[id]` must:
- Open SSE connection
- Poll `audit_categories` table for status changes
- Push events matching `contracts/events.ts` types
- Auto-close when all 7 categories complete
- Handle client disconnect gracefully
- Single connection per audit_id (reject duplicates)

### 6. Auth Flow
- Anonymous lead creation (Step 1 of wizard → creates lead record)
- Google OAuth flow (save results → creates user, links to lead)
- Magic link flow (alternative to OAuth)
- Session management via Supabase Auth helpers
- Admin/team role guards on admin routes

## Phase 3 Tasks (Integration — Week 3)

### 7. Stripe Integration
- Create Stripe products: "Competitor Analysis" ($99), "Re-Audit" ($199-$299)
- `/api/payments/create-intent` — creates Stripe PaymentIntent for embedded Elements
- `/api/payments/webhook` — handles payment confirmation, updates `payments` table
- Verify payment before unlocking competitor analysis or re-audit

### 8. Campaign Link System
- `/api/campaigns/create` — generates unique slug (crypto-random), stores in campaigns table
- `/api/campaigns/[slug]` — validates campaign, returns config (max competitor analyses, active status)
- Track events: click, audit_started, audit_completed, call_booked
- Campaign links format: `audit.forgedigital.com/c/{slug}`

### 9. Email Infrastructure
- Configure Resend client with API key
- `sender.ts` handles all email dispatch:
  - `sendAuditComplete(lead, auditId)` — audit results ready
  - `sendAbandonedAudit(lead)` — started but didn't finish
  - `sendReauditReminder(user, daysLeft)` — 3, 10, 13 day reminders
  - `sendWelcome(user)` — after OAuth save
- Email templates are React Email components owned by Assets Agent — you import and send them

## Phase 4 Tasks (Week 3-4)

### 10. Cron Jobs (Vercel Cron)
```
/api/cron/reaudit-reminders   — daily 9:00 UTC
/api/cron/abandoned-audits    — hourly
/api/cron/campaign-expiry     — daily
/api/cron/analytics-rollup    — daily
```

### 11. Admin API Routes
- `/api/admin/leads` — paginated lead list with filters (status, date, source, campaign)
- `/api/admin/dashboard` — aggregated metrics (total audits, conversion rates, revenue)
- `/api/admin/team` — CRUD team members, assign roles

### 12. Row Level Security
Implement RLS policies:
- Users can only see their own audits and lead data
- Team/admin can see all leads and audits
- Campaign analytics visible to campaign creator + admins
- Payments visible only to the user who paid + admins

## Input Validation
Use Zod for ALL API inputs. Example:
```typescript
import { z } from 'zod';

export const startAuditSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(100),
  businessName: z.string().min(1).max(200),
  websiteUrl: z.string().url(),
  socials: z.object({
    instagram: z.string().optional(),
    facebook: z.string().url().optional(),
    tiktok: z.string().optional(),
    linkedin: z.string().url().optional(),
  }).optional(),
  gbpUrl: z.string().url().optional(),
  goals: z.object({
    industry: z.string(),
    mainChallenge: z.string(),
    businessSize: z.enum(['solo', '2-10', '11-50', '50+']),
  }),
  language: z.enum(['en', 'es']),
  campaignSlug: z.string().optional(),
});
```

## Error Response Format
All API errors must follow this structure:
```typescript
{
  error: {
    code: string;       // e.g., 'RATE_LIMITED', 'INVALID_INPUT', 'NOT_FOUND'
    message: string;    // User-friendly message
    details?: any;      // Optional technical details (dev only)
  }
}
```

## Environment Variables You Need
```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
GOOGLE_PAGESPEED_API_KEY
GOOGLE_PLACES_API_KEY
NEXT_PUBLIC_APP_URL
```
