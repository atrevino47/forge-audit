-- Forge Audit — Initial Database Schema
-- All tables, indexes, and RLS policies

-- =============================================================================
-- TABLES
-- =============================================================================

-- Campaigns table (created first because leads references it)
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID, -- will reference users(id) after users table exists
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  max_competitor_analyses INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  metadata JSONB
);

-- Payments table (created before audits because audits references it)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- will reference users(id) via ALTER below
  lead_id UUID, -- will reference leads(id) via ALTER below
  stripe_payment_id TEXT NOT NULL,
  stripe_customer_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  product_type TEXT NOT NULL CHECK (product_type IN ('competitor_analysis', 'reaudit')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'es')),
  source TEXT CHECK (source IN ('organic', 'campaign', 'direct')),
  campaign_id UUID REFERENCES campaigns(id),
  ip_address INET,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed'))
);

-- Users (linked to Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'team', 'admin'))
);

-- Audits
CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id),
  user_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  overall_grade TEXT,
  inputs JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  is_reaudit BOOLEAN DEFAULT FALSE,
  parent_audit_id UUID REFERENCES audits(id),
  is_paid BOOLEAN DEFAULT FALSE,
  payment_id UUID REFERENCES payments(id),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'es'))
);

-- Audit Categories (per-category results)
CREATE TABLE audit_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('seo', 'website', 'social', 'branding', 'gbp', 'ads', 'reputation')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  results JSONB,
  recommendations JSONB,
  raw_data JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(audit_id, category)
);

-- Competitor Analyses
CREATE TABLE competitor_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(id),
  competitor_url TEXT NOT NULL,
  competitor_name TEXT,
  scores JSONB,
  gaps JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Generated Landing Pages
CREATE TABLE generated_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(id),
  html_content TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign Analytics
CREATE TABLE campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('click', 'audit_started', 'audit_completed', 'call_booked', 'converted')),
  lead_id UUID REFERENCES leads(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Re-audit Windows
CREATE TABLE reaudit_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(id),
  user_id UUID NOT NULL REFERENCES users(id),
  opens_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  reminder_day3_sent BOOLEAN DEFAULT FALSE,
  reminder_day10_sent BOOLEAN DEFAULT FALSE,
  reminder_day13_sent BOOLEAN DEFAULT FALSE
);

-- Rate Limits
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET,
  email TEXT,
  audit_count INTEGER DEFAULT 0,
  last_audit_at TIMESTAMPTZ DEFAULT NOW(),
  window_start TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- DEFERRED FOREIGN KEYS (circular references)
-- =============================================================================

ALTER TABLE campaigns
  ADD CONSTRAINT fk_campaigns_team_member
  FOREIGN KEY (team_member_id) REFERENCES users(id);

ALTER TABLE payments
  ADD CONSTRAINT fk_payments_user
  FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE payments
  ADD CONSTRAINT fk_payments_lead
  FOREIGN KEY (lead_id) REFERENCES leads(id);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_campaign ON leads(campaign_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

CREATE INDEX idx_audits_lead ON audits(lead_id);
CREATE INDEX idx_audits_user ON audits(user_id);
CREATE INDEX idx_audits_status ON audits(status);
CREATE INDEX idx_audits_created_at ON audits(created_at DESC);

CREATE INDEX idx_audit_categories_audit ON audit_categories(audit_id);
CREATE INDEX idx_audit_categories_status ON audit_categories(status);

CREATE INDEX idx_competitor_analyses_audit ON competitor_analyses(audit_id);

CREATE INDEX idx_campaigns_slug ON campaigns(slug);
CREATE INDEX idx_campaigns_active ON campaigns(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_campaign_analytics_campaign ON campaign_analytics(campaign_id);
CREATE INDEX idx_campaign_analytics_event ON campaign_analytics(event_type);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_stripe ON payments(stripe_payment_id);

CREATE INDEX idx_rate_limits_ip ON rate_limits(ip_address);
CREATE INDEX idx_rate_limits_email ON rate_limits(email);

CREATE INDEX idx_reaudit_windows_user ON reaudit_windows(user_id);
CREATE INDEX idx_reaudit_windows_expires ON reaudit_windows(expires_at);
CREATE INDEX idx_reaudit_windows_unused ON reaudit_windows(used) WHERE used = FALSE;

-- =============================================================================
-- UPDATED_AT TRIGGER
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reaudit_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- LEADS: Users see their own lead record; team/admin see all
-- ---------------------------------------------------------------------------
CREATE POLICY leads_select_own ON leads
  FOR SELECT TO authenticated
  USING (
    email = (SELECT email FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('team', 'admin'))
  );

CREATE POLICY leads_insert_anon ON leads
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY leads_insert_authenticated ON leads
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY leads_update_admin ON leads
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('team', 'admin')));

-- Service role bypass for all tables (API routes use service role)
CREATE POLICY leads_service ON leads FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- USERS: Users see own record; team/admin see all
-- ---------------------------------------------------------------------------
CREATE POLICY users_select_own ON users
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('team', 'admin'))
  );

CREATE POLICY users_update_own ON users
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY users_insert ON users
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY users_service ON users FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- AUDITS: Users see own audits; team/admin see all
-- ---------------------------------------------------------------------------
CREATE POLICY audits_select_own ON audits
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR lead_id IN (SELECT id FROM leads WHERE email = (SELECT email FROM users WHERE id = auth.uid()))
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('team', 'admin'))
  );

-- Anonymous can read audit by ID (for results page before auth)
CREATE POLICY audits_select_anon ON audits
  FOR SELECT TO anon
  USING (true);

CREATE POLICY audits_insert_service ON audits
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY audits_update_service ON audits
  FOR UPDATE TO service_role
  USING (true);

CREATE POLICY audits_service ON audits FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- AUDIT_CATEGORIES: Same visibility as parent audit
-- ---------------------------------------------------------------------------
CREATE POLICY audit_categories_select_anon ON audit_categories
  FOR SELECT TO anon
  USING (true);

CREATE POLICY audit_categories_select_auth ON audit_categories
  FOR SELECT TO authenticated
  USING (
    audit_id IN (
      SELECT id FROM audits WHERE
        user_id = auth.uid()
        OR lead_id IN (SELECT id FROM leads WHERE email = (SELECT email FROM users WHERE id = auth.uid()))
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('team', 'admin'))
  );

CREATE POLICY audit_categories_service ON audit_categories FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- COMPETITOR_ANALYSES: Same as audits
-- ---------------------------------------------------------------------------
CREATE POLICY competitor_analyses_select ON competitor_analyses
  FOR SELECT TO authenticated
  USING (
    audit_id IN (SELECT id FROM audits WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('team', 'admin'))
  );

CREATE POLICY competitor_analyses_service ON competitor_analyses FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- GENERATED_PAGES: Viewable by anyone with audit access
-- ---------------------------------------------------------------------------
CREATE POLICY generated_pages_select_anon ON generated_pages
  FOR SELECT TO anon
  USING (true);

CREATE POLICY generated_pages_select_auth ON generated_pages
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY generated_pages_service ON generated_pages FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- CAMPAIGNS: Team/admin can manage; anon can read active campaigns by slug
-- ---------------------------------------------------------------------------
CREATE POLICY campaigns_select ON campaigns
  FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY campaigns_select_auth ON campaigns
  FOR SELECT TO authenticated
  USING (
    team_member_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('team', 'admin'))
  );

CREATE POLICY campaigns_insert ON campaigns
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('team', 'admin')));

CREATE POLICY campaigns_update ON campaigns
  FOR UPDATE TO authenticated
  USING (
    team_member_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY campaigns_service ON campaigns FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- CAMPAIGN_ANALYTICS: Campaign creator + admins
-- ---------------------------------------------------------------------------
CREATE POLICY campaign_analytics_select ON campaign_analytics
  FOR SELECT TO authenticated
  USING (
    campaign_id IN (SELECT id FROM campaigns WHERE team_member_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('team', 'admin'))
  );

CREATE POLICY campaign_analytics_service ON campaign_analytics FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- PAYMENTS: User who paid + admins
-- ---------------------------------------------------------------------------
CREATE POLICY payments_select ON payments
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY payments_service ON payments FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- REAUDIT_WINDOWS: Own records + admins
-- ---------------------------------------------------------------------------
CREATE POLICY reaudit_windows_select ON reaudit_windows
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY reaudit_windows_service ON reaudit_windows FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- RATE_LIMITS: Service role only
-- ---------------------------------------------------------------------------
CREATE POLICY rate_limits_service ON rate_limits FOR ALL TO service_role USING (true) WITH CHECK (true);
