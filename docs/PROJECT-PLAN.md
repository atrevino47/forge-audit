# FORGE FULL ONLINE PRESENCE AUDIT — MASTER PROJECT PLAN

**Version:** 1.1
**Date:** March 13, 2026
**Author:** Adrián Treviño / Forge Digital
**Domain:** audit.forgedigital.com

---

## 1. EXECUTIVE SUMMARY

### What We're Building
A premium, AI-powered online presence audit tool that analyzes 7 dimensions of a business's digital presence — SEO, website quality, social media, branding & positioning, Google Business Profile, ads readiness, and reputation — delivering real-time streaming results with detailed scores, actionable recommendations, and a generated landing page preview.

### Why It Exists
This tool is Forge's primary lead generation machine. Every feature, every interaction, every micro-animation is engineered toward one outcome: **convert free audit users into Forge's done-for-you sales funnel packages.** The app itself IS the sales pitch — it demonstrates Forge's quality, technical sophistication, and results-oriented approach. If the audit feels cheap, prospects will assume the service is cheap.

### The Sales Funnel
```
Social Media / Ads / Organic / Outreach
            ↓
    Free Detailed Audit (lead magnet)
            ↓
    Results + Action Plan (overwhelming detail)
            ↓
   "I can't do all this myself" moment
            ↓
    Save Results → Google OAuth → Email captured
            ↓
    Free Re-Audit (7-14 day window) → Re-engagement
            ↓
    Competitor Analysis upsell ($99/competitor)
            ↓
    Book a Call CTA → Cal.com embed
            ↓
    Close into Forge done-for-you package
```

---

## 2. BUSINESS MODEL & PRICING

### Three-Tier Access Model

#### Tier 1: Free Detailed Audit (Lead Magnet)
- **Who:** Anyone from social media, ads, organic search
- **What:** Full 7-category audit with sub-scores, pass/fail items, detailed action plan, generated landing page preview
- **Capture:** Email + name in Step 1 of wizard
- **Gate:** Google OAuth or email signup required to SAVE results
- **Incentive:** Save results → unlock free re-audit within 7-14 days
- **Limit:** 1 free audit per email, rate-limited by IP (3/day)

#### Tier 2: Competitor Analysis — $99 USD/competitor
- **Who:** Self-serve upsell inside the platform
- **What:** Full diagnostic with industry benchmarks + competitor comparison (scores, gaps, opportunity analysis)
- **Payment:** Stripe Elements embedded checkout
- **Visibility:** Publicly priced on social media (Instagram, TikTok) — establishes real market value

#### Tier 3: Outreach Bundle — $990 Value, Free
- **Who:** Targeted outreach leads (LinkedIn, Google Maps, Instagram)
- **What:** Free Detailed Audit + up to 10 competitor analyses ($99 × 10 = $990)
- **Condition:** Must book a 30-minute call with Forge team
- **Mechanic:** Unique trackable link per outreach campaign
- **Why it works:** $99 price is REAL (people pay it on social), so $990 value is anchored to actual market price

### Revenue Streams
1. Competitor analysis self-serve purchases ($99/each)
2. Paid re-runs after 14-day window expires ($199-299)
3. Forge done-for-you package closes (primary goal)

---

## 3. USER JOURNEYS

### Journey A: Organic/Social Lead
1. Sees Forge content on Instagram/TikTok/LinkedIn/Google
2. Clicks link to audit.forgedigital.com
3. Lands on premium landing page with clear value prop
4. Enters 5-step wizard (email, business info, socials, GBP, goals)
5. Watches real-time streaming audit results (7 categories)
6. Sees detailed scores + action plan + generated landing page preview
7. Prompted to save results → Google OAuth / email signup
8. Saving unlocks free re-audit within 7-14 days
9. Sees competitor analysis upsell ($99/competitor)
10. Sees "Book a Call" CTA (Cal.com embed)
11. Either: buys competitor analysis, books call, or leaves with email captured
12. Re-engagement: abandoned audit emails, re-audit reminder at day 12

### Journey B: Outreach Lead
1. Forge team member identifies prospect on LinkedIn/Google Maps/Instagram
2. Generates unique trackable campaign link in admin panel
3. Sends personalized message: "We ran a preliminary look at your online presence — here's a free $990 audit"
4. Prospect clicks unique link → audit flow with competitor analyses pre-unlocked
5. Same flow as Journey A, but with 10 free competitor analyses included
6. Strong CTA to book 30-min call (the "payment" for the free bundle)

### Journey C: Forge Team Internal
1. Team member logs into admin panel
2. Generates campaign links for outreach
3. Views lead pipeline (all captured emails, audit scores, conversion status)
4. Runs audit on behalf of prospect for targeted outreach
5. Tracks campaign performance (which links converted, which team member closed)

---

## 4. FEATURE SPECIFICATION

### 4.1 Landing Page (audit.forgedigital.com)
- Premium SaaS aesthetic (Linear/Vercel/Stripe quality)
- Clear value proposition headline (benefit-driven, not feature-driven)
- Social proof / trust elements
- Risk-reversal messaging ("Free, no credit card required")
- Single CTA: "Start Your Free Audit"
- Bilingual toggle (EN/ES)
- Mobile-first responsive design
- Performance: 95+ Lighthouse score (it's an audit tool — it better be fast)

### 4.2 Wizard Input Flow (5 Steps)
**Step 1: Your Business** (progress bar starts at 15%)
- Email address (required)
- Full name (required)
- Business name (required)
- Website URL (required, validated)

**Step 2: Social Presence** (progress ~35%)
- Instagram handle (optional)
- Facebook page URL (optional)
- TikTok handle (optional)
- LinkedIn page URL (optional)
- "I don't have any" skip option

**Step 3: Google Business** (progress ~55%)
- Google Business Profile URL (optional)
- "I don't have one" skip option
- "I'm not sure" → helper tooltip with instructions

**Step 4: Your Goals** (progress ~75%)
- Industry (dropdown with common options + "Other")
- Main challenge (multiple choice: more leads, better website, social growth, brand identity, local visibility)
- Business size (solo, 2-10, 11-50, 50+)

**Step 5: Launch Audit** (progress ~90%)
- Summary of what was entered
- "Analyze My Presence" button (prominent, animated)
- Estimated time: "Results in ~60 seconds"
- Progress bar completes to 100% on click

**Wizard UX Requirements:**
- Framer Motion animations between steps (slide transitions)
- Inline validation (real-time, not on submit)
- Keyboard navigation (Enter to advance, Tab between fields)
- Mobile-optimized (large tap targets, responsive layout)
- Conditional logic: skip steps based on inputs
- Auto-save draft to localStorage (resume if they leave and come back)

### 4.3 Audit Engine (7 Categories)

Each category produces:
- Category score (0-100)
- Sub-category scores
- Individual item pass/fail/warning
- Specific recommendations with priority (high/medium/low)

#### Category 1: SEO (Technical + On-Page + Local)
**Data Sources:** Lighthouse API, site scraping, meta tag analysis
**Sub-categories:**
- Technical SEO: SSL, sitemap.xml, robots.txt, page speed, Core Web Vitals, mobile-friendliness, structured data/schema markup, canonical tags, redirect chains
- On-Page SEO: H1/H2 hierarchy, meta titles/descriptions, image alt text, keyword density, internal linking, content length
- Local SEO: NAP consistency, local schema markup, geo-targeted content

**AI Model:** Haiku for technical checks, Sonnet for content quality analysis

#### Category 2: Website (Speed, UX, Mobile, Conversion)
**Data Sources:** Lighthouse, PageSpeed Insights API, screenshot analysis
**Sub-categories:**
- Performance: load time, TTFB, LCP, CLS, FID/INP
- UX: navigation clarity, above-the-fold content, readability
- Mobile: responsive design, touch targets, viewport config
- Conversion: CTA presence/clarity, contact forms, trust signals, social proof, urgency elements

**AI Model:** Haiku for performance metrics, Sonnet for UX/conversion analysis (visual)

#### Category 3: Social Media (Content, Frequency, Engagement)
**Data Sources:** Public profile scraping, Meta Graph API (public pages), AI visual analysis
**Sub-categories:**
- Profile completeness: bio, profile picture, cover photo, contact info, links
- Content quality: visual consistency, caption quality, hashtag strategy
- Posting frequency: last 30 days activity, consistency
- Engagement: estimated engagement rate, comment quality
- Platform presence: which platforms are active vs. dormant

**AI Model:** Sonnet (visual + content analysis required)

#### Category 4: Branding & Positioning
**Data Sources:** Website screenshots, social media visuals, AI analysis
**Sub-categories:**
- Visual identity: logo quality, color consistency, typography, imagery style
- Messaging: value proposition clarity, tone consistency, differentiation
- Positioning: competitive differentiation, target audience clarity, brand story
- Cross-platform consistency: does the brand feel the same everywhere?

**AI Model:** Sonnet (deep analysis, visual understanding, strategic thinking)

#### Category 5: Google Business Profile
**Data Sources:** Google Places API, GBP scraping
**Sub-categories:**
- Profile completeness: name, address, phone, hours, website, description, categories
- Visual content: number of photos, quality, recency
- Reviews: total count, average rating, response rate, response quality, sentiment
- Activity: Google Posts frequency, Q&A section, updates

**AI Model:** Haiku for completeness checks, Sonnet for review sentiment analysis

#### Category 6: Ads Readiness
**Data Sources:** Website scraping, pixel detection, tag analysis
**Sub-categories:**
- Tracking: Meta Pixel installed, Google Analytics, Google Tag Manager, conversion tracking
- Funnel structure: landing page → thank you page flow, lead capture mechanism
- Retargeting readiness: pixel firing correctly, audience building capability
- Ad creative readiness: do they have assets suitable for ads?

**AI Model:** Haiku (mostly technical detection)

#### Category 7: Reputation & Reviews
**Data Sources:** Google Places API, social media comments, AI analysis
**Sub-categories:**
- Review volume: total reviews across platforms
- Review quality: average rating, sentiment analysis
- Response management: response rate, response quality, timeliness
- Online mentions: brand sentiment across web
- Trust signals: testimonials on website, case studies, certifications

**AI Model:** Haiku for metrics, Sonnet for sentiment analysis

### 4.4 Results Dashboard (Streaming)
- Real-time streaming: each category appears as it completes
- Overall score (weighted average of 7 categories)
- Visual score display: animated circular progress + letter grade
- Category cards: expandable with sub-scores and individual items
- Pass/fail/warning badges with color coding (green/yellow/red)
- Priority-ranked action plan (numbered, with effort/impact tags)
- "Save Results" CTA → triggers Google OAuth / email signup
- "Compare with Competitors" CTA → $99 upsell
- "Book a Free Strategy Call" → Cal.com embed
- Share results: unique URL for saved audits
- Print/export consideration (future)

### 4.5 Landing Page Generator
- Triggered after audit completes (if enough data collected)
- Generates a live, interactive landing page preview based on:
  - Business name, industry, and goals from wizard input
  - Brand colors extracted from their website
  - Content recommendations from the branding analysis
  - Best practices from Forge's conversion optimization knowledge
- User can click through the generated page in-browser
- CTA within the preview: "Want this built for real? Book a call"
- If insufficient data was provided (no website, no socials), skip this feature gracefully

### 4.6 Re-Audit System
- Users who save results (Google OAuth) get 1 free re-audit
- Re-audit window: 7-14 days from original audit
- Comparison view: original scores vs. new scores (before/after)
- Highlights improvements and remaining gaps
- Email reminders: Day 3 ("tips to improve"), Day 10 ("re-audit window closing"), Day 13 ("last chance")
- After window expires: paid re-runs ($199-299 via Stripe)

### 4.7 Admin Panel (Forge Team)
- **Dashboard:** Lead pipeline overview, conversion metrics, revenue
- **Lead Management:** All captured emails, audit scores, status (new/contacted/qualified/closed)
- **Campaign Manager:** Generate unique trackable outreach links, set competitor analysis limits per link
- **Campaign Analytics:** Click rates, audit completion rates, call bookings per campaign, per team member
- **Audit Runner:** Team can run audits on behalf of prospects
- **Settings:** Team member management, notification preferences

### 4.8 Bilingual Support (EN/ES)
- All UI text, labels, CTAs in both languages
- Language toggle in header (persistent via cookie/localStorage)
- Audit analysis output language matches selected UI language
- AI prompts include language parameter
- Default: auto-detect from browser locale, fallback to English

---

## 5. TECHNICAL ARCHITECTURE

### 5.1 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend Framework | Next.js 15 (App Router) | SSR/SSG, React Server Components, streaming |
| Styling | Tailwind CSS + shadcn/ui | Premium SaaS design system |
| Animations | Framer Motion | Page transitions, micro-interactions, loading states |
| Database | Supabase (PostgreSQL) | Data storage, Row Level Security |
| Auth | Supabase Auth | Google OAuth + magic link |
| Payments | Stripe Elements | Embedded checkout for $99 competitor + $199-299 re-runs |
| Email | Resend + React Email | Transactional emails, re-audit reminders, abandoned flows |
| Scheduling | Cal.com | Embedded, white-labeled call booking |
| AI (Deep) | Claude Sonnet 4 | Branding, positioning, action plans, landing page gen |
| AI (Simple) | Claude Haiku 3.5 | Technical checks, completeness scoring, metrics |
| Image Gen | NanoBanana2 MCP Server | AI image generation via Google Gemini (NB2/Pro/Flash tiers) |
| Design Intelligence | UI/UX Pro Max (Claude Code Skill) | Design system generation, style/color/typography reasoning |
| Analytics | PostHog + Vercel Analytics | Funnels, session replays, Web Vitals |
| Hosting | Vercel | Next.js deployment, edge functions, CDN |
| Domain | audit.forgedigital.com | Custom subdomain on Vercel |
| i18n | next-intl | Bilingual EN/ES support |

### 5.2 Database Schema (Supabase/PostgreSQL)

```sql
-- Core tables

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  language TEXT DEFAULT 'en', -- 'en' or 'es'
  source TEXT, -- 'organic', 'campaign', 'direct'
  campaign_id UUID REFERENCES campaigns(id),
  ip_address INET,
  UNIQUE(email)
);

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  lead_id UUID REFERENCES leads(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT DEFAULT 'user' -- 'user', 'team', 'admin'
);

CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id),
  user_id UUID REFERENCES users(id), -- NULL until they save/auth
  status TEXT DEFAULT 'pending', -- pending, running, completed, failed
  overall_score INTEGER, -- 0-100
  overall_grade TEXT, -- A/B/C/D/F
  inputs JSONB NOT NULL, -- wizard form data (socials, GBP, goals)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  is_reaudit BOOLEAN DEFAULT FALSE,
  parent_audit_id UUID REFERENCES audits(id), -- for re-audits
  is_paid BOOLEAN DEFAULT FALSE,
  payment_id UUID REFERENCES payments(id),
  language TEXT DEFAULT 'en'
);

CREATE TABLE audit_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'seo', 'website', 'social', 'branding', 'gbp', 'ads', 'reputation'
  score INTEGER, -- 0-100
  status TEXT DEFAULT 'pending', -- pending, running, completed, failed
  results JSONB, -- sub-scores, items, pass/fail details
  recommendations JSONB, -- prioritized action items
  raw_data JSONB, -- API responses, screenshots, etc.
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE competitor_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(id),
  competitor_url TEXT NOT NULL,
  competitor_name TEXT,
  scores JSONB, -- category-by-category comparison
  gaps JSONB, -- opportunity analysis
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE generated_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(id),
  html_content TEXT, -- the generated landing page HTML
  metadata JSONB, -- brand colors, fonts, content used
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE, -- URL-friendly identifier
  max_competitor_analyses INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  metadata JSONB -- target platform, notes, etc.
);

CREATE TABLE campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  event_type TEXT NOT NULL, -- 'click', 'audit_started', 'audit_completed', 'call_booked', 'converted'
  lead_id UUID REFERENCES leads(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  lead_id UUID REFERENCES leads(id),
  stripe_payment_id TEXT NOT NULL,
  stripe_customer_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  product_type TEXT NOT NULL, -- 'competitor_analysis', 'reaudit'
  status TEXT DEFAULT 'pending', -- pending, completed, failed, refunded
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reaudit_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(id),
  user_id UUID NOT NULL REFERENCES users(id),
  opens_at TIMESTAMPTZ NOT NULL, -- when they saved results
  expires_at TIMESTAMPTZ NOT NULL, -- opens_at + 14 days
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  reminder_day3_sent BOOLEAN DEFAULT FALSE,
  reminder_day10_sent BOOLEAN DEFAULT FALSE,
  reminder_day13_sent BOOLEAN DEFAULT FALSE
);

CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET,
  email TEXT,
  audit_count INTEGER DEFAULT 0,
  last_audit_at TIMESTAMPTZ DEFAULT NOW(),
  window_start TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_campaign ON leads(campaign_id);
CREATE INDEX idx_audits_lead ON audits(lead_id);
CREATE INDEX idx_audits_status ON audits(status);
CREATE INDEX idx_audit_categories_audit ON audit_categories(audit_id);
CREATE INDEX idx_campaigns_slug ON campaigns(slug);
CREATE INDEX idx_campaign_analytics_campaign ON campaign_analytics(campaign_id);
CREATE INDEX idx_rate_limits_ip ON rate_limits(ip_address);
CREATE INDEX idx_rate_limits_email ON rate_limits(email);
CREATE INDEX idx_reaudit_windows_expires ON reaudit_windows(expires_at);

-- Row Level Security policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- (Full RLS policies to be defined by Backend Agent)
```

### 5.3 API Routes Structure

```
/api/
├── audit/
│   ├── start          POST - Create audit, validate inputs, check rate limits
│   ├── status/[id]    GET  - SSE stream for real-time results
│   ├── results/[id]   GET  - Full results (after completion)
│   └── rerun/[id]     POST - Trigger re-audit (check window/payment)
├── competitor/
│   ├── analyze        POST - Start competitor analysis ($99 or campaign-granted)
│   └── results/[id]   GET  - Competitor analysis results
├── auth/
│   ├── callback       GET  - Google OAuth callback
│   └── save-results   POST - Link anonymous audit to authenticated user
├── payments/
│   ├── create-intent  POST - Stripe payment intent
│   ├── webhook        POST - Stripe webhook handler
│   └── verify         GET  - Verify payment status
├── campaigns/
│   ├── create         POST - Generate campaign link (admin only)
│   ├── [slug]         GET  - Validate campaign, return config
│   └── analytics      GET  - Campaign performance data
├── admin/
│   ├── leads          GET  - Lead pipeline (admin/team only)
│   ├── dashboard      GET  - Metrics overview
│   └── team           CRUD - Team member management
├── landing-page/
│   └── generate       POST - AI-generated landing page preview
└── email/
    ├── abandoned      POST - Trigger abandoned audit email
    └── reaudit-reminder POST - Trigger re-audit reminder (cron)
```

### 5.4 Real-Time Streaming Architecture

```
Client (Browser)
    ↓ POST /api/audit/start
    ← Returns audit_id
    ↓ GET /api/audit/status/{id} (SSE connection)
    
Server (Next.js API Route)
    → Dispatches 7 parallel analysis jobs
    → Each job updates audit_categories table
    → SSE pushes updates as each category completes:
       { category: "seo", status: "running" }
       { category: "seo", status: "completed", score: 72, results: {...} }
       { category: "website", status: "completed", score: 65, results: {...} }
       ...
    → After all 7 complete:
       { status: "completed", overall_score: 68, grade: "C+" }
    → Triggers landing page generation (async)
       { landing_page: "ready", preview_url: "..." }
```

---

## 6. MULTI-AGENT CLAUDE CODE ARCHITECTURE

### 6.1 Agent Overview

| Agent | Role | Owns | AI Models Used |
|-------|------|------|----------------|
| **Master Orchestrator** | Coordinates all agents, manages contracts, resolves conflicts | `/contracts/`, `/docs/`, `CLAUDE.md` | N/A |
| **Backend Agent** | Database, API routes, auth, payments, rate limiting, campaigns | `/src/app/api/`, `/src/lib/db/`, `/src/lib/auth/`, `/supabase/` | N/A |
| **Frontend Agent** | All pages, components, layouts, animations, responsive design | `/src/app/(pages)/`, `/src/components/`, `/src/styles/` | UI/UX Pro Max MCP |
| **Audit Engine Agent** | All 7 category analyzers, scoring logic, streaming coordinator | `/src/lib/audit/`, `/src/lib/analyzers/`, `/src/lib/scoring/` | Claude Sonnet 4, Haiku 3.5 |
| **AI/Copy Agent** | Action plan generation, landing page generator, all AI prompts, i18n copy | `/src/lib/ai/`, `/src/lib/prompts/`, `/src/i18n/`, `/src/lib/landing-gen/` | Claude Sonnet 4 |
| **Assets Agent** | Image generation, email templates, branded visual assets | `/src/assets/`, `/src/emails/`, `/public/images/` | NanoBanana2 MCP |

### 6.2 Monorepo Directory Structure

```
forge-audit/
├── CLAUDE.md                          # Master instructions for all agents
├── contracts/                         # SHARED - Read by all, modified by Master only
│   ├── api-contracts.ts               # API route input/output types
│   ├── database-types.ts              # Supabase generated types
│   ├── audit-types.ts                 # Audit category results interfaces
│   ├── component-props.ts             # Shared component prop interfaces
│   ├── events.ts                      # SSE event type definitions
│   └── constants.ts                   # Shared constants (scores, grades, limits)
├── design-system/                     # Generated by UI/UX Pro Max, read by Frontend Agent
│   ├── MASTER.md                      # Global design tokens (override colors with brand palette)
│   └── pages/                         # Page-specific overrides
│       ├── landing.md
│       ├── wizard.md
│       ├── results-dashboard.md
│       └── admin.md
├── .claude/skills/ui-ux-pro-max/      # UI/UX Pro Max skill installation
├── docs/                              # Project documentation
│   ├── PROJECT-PLAN.md                # This document
│   ├── AGENT-BACKEND.md               # Backend agent instructions
│   ├── AGENT-FRONTEND.md              # Frontend agent instructions
│   ├── AGENT-AUDIT.md                 # Audit engine agent instructions
│   ├── AGENT-AI-COPY.md               # AI/Copy agent instructions
│   └── AGENT-ASSETS.md                # Assets agent instructions
├── supabase/                          # Backend Agent owns
│   ├── migrations/
│   └── seed.sql
├── src/
│   ├── app/                           
│   │   ├── layout.tsx                 # Frontend Agent
│   │   ├── page.tsx                   # Frontend Agent (landing page)
│   │   ├── (audit)/                   # Frontend Agent
│   │   │   ├── wizard/page.tsx
│   │   │   ├── results/[id]/page.tsx
│   │   │   └── compare/[id]/page.tsx  # Re-audit comparison view
│   │   ├── (auth)/                    # Frontend Agent (UI) + Backend Agent (logic)
│   │   │   ├── login/page.tsx
│   │   │   └── callback/page.tsx
│   │   ├── (admin)/                   # Frontend Agent
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── leads/page.tsx
│   │   │   ├── campaigns/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── (payments)/                # Frontend Agent (UI) + Backend Agent (logic)
│   │   │   └── checkout/page.tsx
│   │   ├── preview/[id]/page.tsx      # Frontend Agent (generated landing page preview)
│   │   └── api/                       # Backend Agent owns ALL API routes
│   │       ├── audit/
│   │       ├── competitor/
│   │       ├── auth/
│   │       ├── payments/
│   │       ├── campaigns/
│   │       ├── admin/
│   │       ├── landing-page/
│   │       └── email/
│   ├── components/                    # Frontend Agent owns
│   │   ├── ui/                        # shadcn/ui base components
│   │   ├── wizard/                    # Wizard step components
│   │   ├── results/                   # Results dashboard components
│   │   ├── admin/                     # Admin panel components
│   │   ├── landing/                   # Landing page sections
│   │   └── shared/                    # Shared components (header, footer, etc.)
│   ├── lib/                           
│   │   ├── db/                        # Backend Agent
│   │   │   ├── client.ts              # Supabase client
│   │   │   ├── queries.ts             # Database query functions
│   │   │   └── types.ts               # → imports from contracts/
│   │   ├── auth/                      # Backend Agent
│   │   │   ├── config.ts
│   │   │   └── middleware.ts
│   │   ├── stripe/                    # Backend Agent
│   │   │   ├── client.ts
│   │   │   └── webhooks.ts
│   │   ├── audit/                     # Audit Engine Agent
│   │   │   ├── orchestrator.ts        # Parallel dispatch + streaming coordinator
│   │   │   ├── scoring.ts             # Score calculation + grading
│   │   │   └── rate-limiter.ts        # IP + email rate limiting
│   │   ├── analyzers/                 # Audit Engine Agent
│   │   │   ├── seo.ts
│   │   │   ├── website.ts
│   │   │   ├── social.ts
│   │   │   ├── branding.ts
│   │   │   ├── gbp.ts
│   │   │   ├── ads.ts
│   │   │   └── reputation.ts
│   │   ├── ai/                        # AI/Copy Agent
│   │   │   ├── client.ts              # Anthropic API client (Sonnet + Haiku routing)
│   │   │   ├── action-plan.ts         # Action plan generation
│   │   │   └── landing-gen.ts         # Landing page HTML generator
│   │   ├── prompts/                   # AI/Copy Agent
│   │   │   ├── seo-analysis.ts
│   │   │   ├── branding-analysis.ts
│   │   │   ├── action-plan.ts
│   │   │   ├── landing-page.ts
│   │   │   └── competitor-comparison.ts
│   │   └── email/                     # Backend Agent (sending) + AI/Copy Agent (templates)
│   │       ├── sender.ts
│   │       └── templates/
│   ├── i18n/                          # AI/Copy Agent
│   │   ├── en.json
│   │   ├── es.json
│   │   └── config.ts
│   ├── styles/                        # Frontend Agent
│   │   └── globals.css
│   ├── assets/                        # Assets Agent
│   │   ├── illustrations/
│   │   ├── icons/
│   │   └── brand/
│   └── emails/                        # Assets Agent (design) + AI/Copy Agent (content)
│       ├── audit-complete.tsx
│       ├── abandoned-audit.tsx
│       ├── reaudit-reminder.tsx
│       └── welcome.tsx
├── public/                            
│   ├── images/                        # Assets Agent
│   │   └── generated/                 # NanoBanana2 MCP output directory
│   └── fonts/                         # Frontend Agent
├── package.json
├── tailwind.config.ts                 # Frontend Agent
├── next.config.ts                     # Backend Agent
└── tsconfig.json
```

### 6.3 Agent Communication Protocol

**Rule 1: Contracts are the single source of truth.**
All shared types, interfaces, and constants live in `/contracts/`. Every agent imports from contracts — never defines shared types locally.

**Rule 2: Only Master modifies contracts.**
If an agent needs a contract change, they create a `CONTRACT_REQUEST.md` in their directory. Master reviews, updates contracts, and notifies affected agents.

**Rule 3: Strict file ownership.**
No agent modifies files outside their owned directories. If Agent A needs Agent B to make a change, they communicate through the Master or via clearly defined interface contracts.

**Rule 4: API-first integration.**
Frontend never imports from Backend's lib directly. Frontend calls API routes. Backend exposes data through API contracts. Audit Engine exposes results through the database + SSE events.

**Rule 5: Test at boundaries.**
Each agent writes tests for their own code. Integration tests (API → DB → Frontend) are owned by Master.

### 6.4 Agent Execution Order

**Phase 0: Planning (Master)**
1. Master creates all contract files with complete type definitions
2. Master creates all agent instruction files (AGENT-*.md)
3. Master creates CLAUDE.md with project-wide rules

**Phase 1: Foundation (Backend → Frontend skeleton)**
1. Backend Agent: Supabase schema migration, auth config, basic API stubs
2. Frontend Agent: Project setup (Next.js, Tailwind, shadcn), layout, routing skeleton

**Phase 2: Core Features (Parallel)**
3. Audit Engine Agent: All 7 analyzers + scoring logic + orchestrator
4. AI/Copy Agent: All prompts + action plan generator + i18n files
5. Frontend Agent: Wizard flow + results dashboard (with mock data initially)
6. Backend Agent: Full API routes, Stripe integration, campaign system

**Phase 3: Integration (Sequential)**
7. Connect Frontend → Backend APIs (replace mocks)
8. Connect Backend → Audit Engine (trigger analyses)
9. Connect Audit Engine → AI/Copy (prompts + analysis)
10. Wire SSE streaming end-to-end

**Phase 4: Polish & Assets (Parallel)**
11. Assets Agent: All illustrations, email templates, brand assets via NanoBanana2
12. Frontend Agent: Animations, micro-interactions, mobile polish, performance
13. AI/Copy Agent: Landing page generator, email copy, final prompt tuning
14. Backend Agent: Rate limiting, webhooks, cron jobs (email reminders)

**Phase 5: Admin & Launch**
15. Frontend Agent: Admin panel pages
16. Backend Agent: Admin API routes + campaign analytics
17. Master: Integration tests, final review, deployment config

---

## 7. KEY CONTRACTS (Initial Definitions)

### 7.1 Audit Result Interface

```typescript
// contracts/audit-types.ts

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
```

### 7.2 SSE Event Types

```typescript
// contracts/events.ts

export type SSEEvent =
  | { type: 'category_started'; category: AuditCategory }
  | { type: 'category_completed'; category: AuditCategory; score: number; results: CategoryResult }
  | { type: 'category_failed'; category: AuditCategory; error: string }
  | { type: 'overall_completed'; overallScore: number; grade: Grade; actionPlan: Recommendation[] }
  | { type: 'landing_page_ready'; previewUrl: string; pageId: string }
  | { type: 'error'; message: string };
```

### 7.3 API Contracts

```typescript
// contracts/api-contracts.ts

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
  streamUrl: string; // SSE endpoint
  estimatedTime: number; // seconds
}

// POST /api/competitor/analyze
export interface CompetitorAnalysisRequest {
  auditId: string;
  competitorUrl: string;
  paymentIntentId?: string; // for paid analyses
  campaignSlug?: string; // for free campaign-granted analyses
}

// POST /api/campaigns/create
export interface CreateCampaignRequest {
  name: string;
  maxCompetitorAnalyses: number;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export interface Campaign {
  id: string;
  slug: string;
  name: string;
  url: string; // full URL: audit.forgedigital.com/c/{slug}
  maxCompetitorAnalyses: number;
  isActive: boolean;
  analytics: {
    clicks: number;
    auditsStarted: number;
    auditsCompleted: number;
    callsBooked: number;
  };
}
```

---

## 8. INFRASTRUCTURE & OPERATIONS

### 8.1 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=

# Google APIs
GOOGLE_PAGESPEED_API_KEY=
GOOGLE_PLACES_API_KEY=

# NanoBanana2 (Image Generation MCP Server)
GEMINI_API_KEY=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# Cal.com
NEXT_PUBLIC_CALCOM_EMBED_URL=

# App
NEXT_PUBLIC_APP_URL=https://audit.forgedigital.com
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
```

### 8.2 Rate Limiting Rules
- Free audits: 1 per email (lifetime), 3 per IP (per 24h rolling window)
- API routes: 60 requests/minute per IP (general)
- SSE connections: 1 per audit_id (no duplicate streams)
- Competitor analysis: validated against campaign limits or payment

### 8.3 Cron Jobs (Vercel Cron)
- Re-audit reminder emails: daily at 9:00 AM UTC (check windows)
- Abandoned audit emails: hourly (audits started > 30 min ago, not completed)
- Campaign expiry: daily (deactivate expired campaign links)
- Analytics aggregation: daily (roll up campaign metrics)

### 8.4 Monitoring & Alerting
- Vercel: deployment health, function invocation metrics
- PostHog: user session replays, funnel drop-off analysis
- Sentry (recommended addition): error tracking, performance monitoring
- Supabase dashboard: database health, auth metrics

### 8.5 Security Considerations
- All API routes validate inputs (zod schemas)
- Supabase Row Level Security on all tables
- Stripe webhook signature verification
- CSRF protection on all mutation endpoints
- Rate limiting at API gateway level
- Campaign slugs: cryptographically random, non-guessable
- Audit results: accessible only via unique ID (UUID v4) or authenticated user

---

## 9. ESTIMATED MONTHLY COSTS (at 500 audits/month)

| Service | Cost | Notes |
|---------|------|-------|
| Vercel Pro | $20/mo | Hosting, edge functions, analytics |
| Supabase Pro | $25/mo | Database, auth, storage |
| Anthropic API | ~$40/mo | Sonnet + Haiku smart mix |
| Stripe | ~3% per txn | Only on paid features ($99, $199-299) |
| Resend | $0 (free tier) | Up to 3,000 emails/month |
| PostHog | $0 (free tier) | Up to 1M events/month |
| Cal.com | $15/mo | Cloud hosted, white-labeled |
| Google APIs | ~$5-10/mo | PageSpeed, Places API |
| Gemini (NanoBanana2) | ~$5-15/mo | Image generation for assets |
| Domain/DNS | ~$0 | Subdomain of existing domain |
| **TOTAL** | **~$110-130/mo** | **Before any revenue** |

**Break-even:** 2 competitor analysis sales ($198) covers monthly costs. Everything after is profit + pipeline for Forge services.

---

## 10. PHASED TIMELINE

### Week 1: Foundation
- [ ] Master: Complete all contract files, agent instructions, CLAUDE.md
- [ ] Master: Project initialization (Next.js 15, Tailwind, shadcn, Supabase)
- [ ] Backend: Database migration, Supabase config, auth setup
- [ ] Frontend: Layout, routing skeleton, design system tokens, landing page

### Week 2: Core Build (Parallel)
- [ ] Audit Engine: All 7 analyzers (API integrations + AI prompts)
- [ ] Frontend: Wizard flow (5 steps, animations, validation)
- [ ] Frontend: Results dashboard (streaming UI, score displays, category cards)
- [ ] Backend: Audit API routes, SSE streaming endpoint
- [ ] AI/Copy: All analysis prompts, action plan generator
- [ ] Assets: Hero illustrations, category icons, brand assets

### Week 3: Integration + Payments + Admin
- [ ] Integration: Wire Frontend → Backend → Audit Engine → AI end-to-end
- [ ] Backend: Stripe integration (competitor analysis + re-run payments)
- [ ] Backend: Campaign link system + analytics tracking
- [ ] Frontend: Admin panel (dashboard, leads, campaigns)
- [ ] AI/Copy: Landing page generator, i18n copy (EN/ES)
- [ ] Assets: Email templates (React Email + Resend)

### Week 4: Polish + Launch
- [ ] Frontend: Animation polish, mobile optimization, performance tuning
- [ ] Backend: Rate limiting, cron jobs, webhook handlers
- [ ] AI/Copy: Final prompt tuning, edge case handling
- [ ] QA: End-to-end testing, cross-browser, mobile
- [ ] Deployment: Vercel production setup, custom domain, SSL
- [ ] Analytics: PostHog setup, funnel tracking, session replay config
- [ ] Launch: Social media content, first outreach campaigns

---

## 11. SUCCESS METRICS

### Week 1-2 Post-Launch
- Audit completion rate: >70% of those who start
- Wizard step drop-off: <10% per step
- Email capture rate: >90% (it's Step 1)
- OAuth save rate: >30% of completed audits

### Month 1
- Total audits completed: 200+
- Competitor analysis purchases: 10+ ($990+ revenue)
- Calls booked: 20+
- Forge packages sold: 2-3 (primary goal)

### Month 3
- Total audits: 1,000+
- Monthly revenue from tool: $2,000+ (competitor analyses + re-runs)
- Forge packages closed via audit pipeline: 5-10
- Admin panel actively used by team for outreach

---

## 12. BRAND DIRECTION & DESIGN SYSTEM

### Visual Identity: Premium Authority
- **Color Direction:** Deep navy (#0B1120) base + warm gold (#D4A537) accent
- **Style:** Glassmorphism — frosted glass layers, translucent depth, glowing accents
- **Mode:** Dark mode default. Dashboard has dark/light toggle.
- **Aesthetic Reference:** Linear, Vercel, Stripe dashboard quality
- **Typography:** To be generated by UI/UX Pro Max skill (premium SaaS mood)
- **Core Palette:**

| Role | Hex | Usage |
|------|-----|-------|
| Base | #0B1120 | Page backgrounds |
| Surface | #0F172A | Navbar, elevated surfaces |
| Card | #1E293B | Glass card backgrounds (with backdrop-blur) |
| Accent/CTA | #D4A537 | Buttons, highlights, active states |
| Text Primary | #F8FAFC | Headings, body text |
| Text Muted | #94A3B8 | Secondary text, descriptions |
| Pass/Good | #22C55E | Passing audit items |
| Warning/Fair | #F59E0B | Warning audit items |
| Fail/Critical | #EF4444 | Failing audit items |
| Glass Border | rgba(212,165,55,.12) | Glassmorphism card borders |

### Light Mode Variant (Dashboard toggle)
| Role | Hex |
|------|-----|
| Base | #F8FAFC |
| Surface | rgba(241,245,249,.9) |
| Card | rgba(255,255,255,.7) |
| Accent | #B8941F |
| Text Primary | #0F172A |
| Text Muted | #64748B |

---

## 13. TOOL INTEGRATIONS (DETAILED)

### 13.1 UI/UX Pro Max — Claude Code Skill (NOT MCP Server)

**What it is:** A design intelligence engine installed as a Claude Code skill. Contains 67 UI styles, 96 color palettes, 57 font pairings, 100 industry-specific reasoning rules, and 99 UX guidelines. It runs a Python search script that analyzes project requirements and generates a complete design system.

**Installation in project:**
```bash
npm install -g uipro-cli
cd forge-audit/
uipro init --ai claude
```

**How the Frontend Agent uses it:**

Step 1 — Generate master design system BEFORE any UI code:
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "premium SaaS audit tool digital marketing agency" --design-system --persist -p "ForgeAudit"
```
This creates `design-system/MASTER.md` — the Frontend Agent's design bible.

Step 2 — Generate page-specific overrides for each major view:
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "premium SaaS audit tool" --design-system --persist -p "ForgeAudit" --page "landing"
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "premium SaaS audit tool" --design-system --persist -p "ForgeAudit" --page "wizard"
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "premium SaaS audit tool" --design-system --persist -p "ForgeAudit" --page "results-dashboard"
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "premium SaaS audit tool" --design-system --persist -p "ForgeAudit" --page "admin"
```

Step 3 — Hierarchical retrieval during development:
When building any page, the Frontend Agent first reads `design-system/MASTER.md`, then checks if a page-specific override exists in `design-system/pages/`. Page overrides take precedence for deviations only; MASTER rules apply for everything else.

**Key configuration:** Override the generated color palette with our navy+gold brand direction. The skill's style recommendation (Glassmorphism + Soft UI hybrid) is used for effects and layout, but colors come from our defined palette in Section 12.

**Directory added to monorepo:**
```
forge-audit/
├── design-system/              # Generated by UI/UX Pro Max, read by Frontend Agent
│   ├── MASTER.md               # Global design tokens, components, anti-patterns
│   └── pages/
│       ├── landing.md
│       ├── wizard.md
│       ├── results-dashboard.md
│       └── admin.md
├── .claude/skills/ui-ux-pro-max/  # Installed skill files
│   ├── scripts/search.py
│   └── data/                   # CSV databases (styles, colors, typography, etc.)
```

### 13.2 NanoBanana2 — MCP Server for AI Image Generation

**What it is:** A Python MCP server wrapping Google's Gemini image generation models. Three model tiers with intelligent auto-routing, aspect ratio control, and output path management.

**Setup:**
```bash
# Install via uvx (recommended)
uvx nanobanana-mcp-server@latest

# Or via pip
pip install nanobanana-mcp-server
```

**Claude Code MCP config:**
```json
{
  "name": "nanobanana",
  "command": "uvx",
  "args": ["nanobanana-mcp-server@latest"],
  "env": {
    "GEMINI_API_KEY": "your-gemini-api-key-here",
    "IMAGE_OUTPUT_DIR": "/path/to/forge-audit/public/images/generated"
  }
}
```

**Model tiers and when to use each:**

| Tier | Model | Speed | Max Res | Use For |
|------|-------|-------|---------|---------|
| NB2 (default) | Gemini 3.1 Flash Image | ~2-4s | 4K | Category icons, email headers, social previews, most assets |
| Pro | Gemini 3 Pro Image | ~5-8s | 4K | Hero illustrations, complex branded scenes, landing page visuals |
| Flash | Gemini 2.5 Flash Image | ~2-3s | 1024px | Rapid drafts, iteration, placeholder images |

**How the Assets Agent uses it:**

Every image prompt MUST include the Forge brand prefix:
```
BRAND PREFIX: "Premium dark navy (#0B1120) background, warm gold (#D4A537) accents, 
glassmorphism aesthetic with frosted translucent elements, sophisticated and authoritative, 
modern SaaS premium feel. "
```

Asset generation plan:
```python
# Hero illustration (landing page)
generate_image(
    prompt=BRAND_PREFIX + "Abstract digital landscape representing online presence analysis, 
    glowing data streams converging into a central golden score indicator, 
    deep navy space with subtle grid lines",
    model_tier="pro",
    resolution="4k",
    aspect_ratio="16:9",
    output_path="public/images/hero.png"
)

# Category icons (7 audit dimensions) — consistent style
for category in ["seo", "website", "social", "branding", "gbp", "ads", "reputation"]:
    generate_image(
        prompt=BRAND_PREFIX + f"Minimal geometric icon representing {category}, 
        single gold accent element on dark navy, clean vector style, icon design",
        model_tier="nb2",
        aspect_ratio="1:1",
        output_path=f"public/images/icons/{category}.png"
    )

# OG / social preview image
generate_image(
    prompt=BRAND_PREFIX + "Social media preview card showing audit dashboard mockup 
    with score 87/A displayed prominently, Forge Audit branding",
    model_tier="nb2",
    aspect_ratio="16:9",  # OG standard
    output_path="public/images/og-image.png"
)

# Email header
generate_image(
    prompt=BRAND_PREFIX + "Email header banner, subtle abstract pattern with golden 
    accent lines on deep navy, professional and clean",
    model_tier="nb2",
    aspect_ratio="3:1",
    output_path="public/images/email-header.png"
)
```

**Environment variable required:**
```env
GEMINI_API_KEY=your-google-gemini-api-key
```

---

## 14. OPEN QUESTIONS / FUTURE CONSIDERATIONS

1. **PDF export:** Future feature — downloadable branded PDF report
2. **White-label version:** Future — let other agencies use the audit tool under their brand
3. **API access:** Future — let developers integrate audit into their own tools
4. **Competitor analysis depth:** How deep should the $99 analysis go? Full audit of competitor + comparison, or just key metrics?
5. **Referral program:** "Share your audit, get a free competitor analysis" — viral loop
6. **Webhooks/integrations:** Zapier/Make integration for CRM sync (HubSpot, etc.)
