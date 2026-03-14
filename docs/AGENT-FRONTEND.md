# AGENT-FRONTEND — Frontend Agent Instructions

> Read `CLAUDE.md` first, then this file.

## Your Role
You own ALL user-facing pages, components, layouts, animations, responsive design, and the design system. You make this app look and feel like a $50B SaaS product. Every interaction you build is a silent sales pitch for Forge's services.

## Your Directories (YOU OWN THESE)
```
/src/app/layout.tsx                    # Root layout
/src/app/page.tsx                      # Landing page
/src/app/(audit)/                      # Wizard + results pages
/src/app/(auth)/                       # Login/callback pages
/src/app/(admin)/                      # Admin panel pages
/src/app/(payments)/                   # Checkout page
/src/app/preview/[id]/page.tsx         # Generated landing page preview
/src/app/c/[slug]/page.tsx             # Campaign link entry point
/src/components/                       # ALL components
/src/styles/                           # Global styles, Tailwind config
/design-system/                        # UI/UX Pro Max output (you generate this)
/public/fonts/                         # Web fonts
/tailwind.config.ts                    # Tailwind configuration
```

## DO NOT TOUCH
- `/src/app/api/` (Backend Agent)
- `/src/lib/db/` (Backend Agent)
- `/src/lib/audit/` (Audit Engine Agent)
- `/src/lib/ai/` (AI/Copy Agent)
- `/src/i18n/` (AI/Copy Agent)
- `/contracts/` (Master only)

## CRITICAL: Design System Setup (DO THIS FIRST)

Before writing ANY UI code, generate the design system:

### Step 1: Install UI/UX Pro Max
```bash
npm install -g uipro-cli
uipro init --ai claude
```

### Step 2: Generate master design system
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py \
  "premium SaaS digital marketing audit tool agency" \
  --design-system --persist -p "ForgeAudit"
```

### Step 3: Generate page-specific overrides
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "premium SaaS audit" --design-system --persist -p "ForgeAudit" --page "landing"
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "premium SaaS audit" --design-system --persist -p "ForgeAudit" --page "wizard"
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "premium SaaS audit" --design-system --persist -p "ForgeAudit" --page "results-dashboard"
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "premium SaaS audit" --design-system --persist -p "ForgeAudit" --page "admin"
```

### Step 4: OVERRIDE colors with Forge brand
The generated design system will suggest colors. **OVERRIDE them** with the Forge palette:

```css
/* globals.css — Forge Brand Tokens */
:root {
  /* Dark mode (DEFAULT) */
  --forge-base: #0B1120;
  --forge-surface: #0F172A;
  --forge-card: #1E293B;
  --forge-accent: #D4A537;
  --forge-accent-hover: #E5B84A;
  --forge-text: #F8FAFC;
  --forge-text-muted: #94A3B8;
  --forge-border: rgba(212, 165, 55, 0.12);
  --forge-glass: rgba(30, 41, 59, 0.5);
  --forge-glass-border: rgba(212, 165, 55, 0.12);
  --forge-pass: #22C55E;
  --forge-warning: #F59E0B;
  --forge-fail: #EF4444;
}

.light {
  --forge-base: #F8FAFC;
  --forge-surface: rgba(241, 245, 249, 0.9);
  --forge-card: rgba(255, 255, 255, 0.7);
  --forge-accent: #B8941F;
  --forge-accent-hover: #A3820E;
  --forge-text: #0F172A;
  --forge-text-muted: #64748B;
  --forge-border: rgba(184, 148, 31, 0.2);
  --forge-glass: rgba(255, 255, 255, 0.7);
  --forge-glass-border: rgba(184, 148, 31, 0.2);
}
```

Use the skill's style/typography/effects/anti-patterns recommendations. Only override colors.

## Brand Direction (Memorize This)
- **Glassmorphism:** `backdrop-filter: blur(16px)`, translucent cards, subtle glow borders
- **Colors:** Navy base, gold accents, no bright neons, no pastels
- **Dark mode default:** Toggle only available on dashboard
- **Animations:** Framer Motion, 200-300ms transitions, ease-out curves. Smooth, not flashy.
- **Typography:** Premium SaaS feel — use what UI/UX Pro Max recommends for this mood
- **NO:** Emojis as icons (use Lucide React), generic AI gradients, rounded bubbly shapes
- **YES:** Sharp corners (8-12px radius max), thin borders, generous whitespace, gold accents on hover

## Phase 1 Tasks (Foundation — Week 1)

### 1. Project Setup
```bash
npx create-next-app@latest forge-audit --typescript --tailwind --app --src-dir
npm install framer-motion @supabase/supabase-js @stripe/stripe-js lucide-react next-intl
npx shadcn@latest init
```

### 2. Root Layout + Design System
- `layout.tsx` with dark mode default, font loading, PostHog provider
- Tailwind config with Forge brand tokens
- shadcn/ui theme customized to navy+gold
- Glassmorphism utility classes

### 3. Landing Page (audit.forgedigital.com)
THE most important page. This is what converts strangers into leads.
- Hero section: bold headline (benefit-driven), subtitle, CTA button with gold glow
- Trust signals: "Trusted by X businesses" or "Join X founders" (even if starting at 0, frame as exclusive)
- How it works: 3-step visual (Enter details → AI analyzes → Get results)
- What you'll learn: preview of the 7 audit categories with icons
- FAQ section
- Footer with Forge branding
- Bilingual toggle (EN/ES) in header
- Mobile-first, buttery smooth scroll animations
- Lighthouse 95+

### 4. Routing Skeleton
```
/                      → Landing page
/audit                 → Wizard (redirects to /audit/wizard)
/audit/wizard          → 5-step wizard
/audit/results/[id]    → Results dashboard
/audit/compare/[id]    → Re-audit comparison
/c/[slug]              → Campaign link entry (redirects to wizard with campaign context)
/login                 → Auth page
/admin                 → Admin dashboard
/admin/leads           → Lead management
/admin/campaigns       → Campaign manager
/preview/[id]          → Generated landing page preview
/checkout              → Stripe Elements payment
```

## Phase 2 Tasks (Core — Week 2)

### 5. Wizard Flow (5 Steps)
Each step is a separate component with Framer Motion page transitions.

**UX Requirements:**
- Progress bar starts at 15%, uses `framer-motion` animated width
- Step labels visible in progress bar (Your Business → Socials → GBP → Goals → Launch)
- Slide transition between steps (250ms, ease-out)
- Inline validation (real-time, red border + message)
- Keyboard: Enter advances, Tab navigates fields
- Auto-save to localStorage (resume on return)
- Conditional logic: "I don't have any" skips social step
- Mobile: large inputs, thumb-friendly buttons, no horizontal scroll
- Each step: max 2-3 fields

**Components to build:**
```
/src/components/wizard/
├── WizardLayout.tsx       # Progress bar + step container
├── WizardProgress.tsx     # Animated progress bar with step labels
├── StepBusiness.tsx       # Email, name, business name, URL
├── StepSocials.tsx        # Instagram, Facebook, TikTok, LinkedIn
├── StepGBP.tsx            # Google Business Profile
├── StepGoals.tsx          # Industry, challenge, size
├── StepLaunch.tsx         # Summary + launch button
└── WizardNavigation.tsx   # Back/Next buttons
```

### 6. Results Dashboard (Streaming)
THE conversion page. This is where the "I can't do this myself" moment happens.

**UX Requirements:**
- SSE connection to `/api/audit/status/[id]`
- Categories appear one by one as they complete (staggered Framer Motion entry)
- While waiting: skeleton loaders with subtle shimmer animation
- Overall score: large animated circular progress (count up from 0 to final)
- Letter grade appears with a satisfying animation
- Category cards: expandable accordion, click to see sub-scores
- Each item: pass (green check) / fail (red X) / warning (yellow triangle) with detail text
- Action plan section: numbered list, priority tags (High/Med/Low), effort badges
- Generated landing page preview: iframe or live render section
- CTAs (sticky bottom bar on mobile):
  - "Save Your Results" → triggers OAuth (gold button, primary)
  - "Compare with Competitors" → $99 upsell (outline button)
  - "Book a Free Strategy Call" → Cal.com embed (text link)

**Components to build:**
```
/src/components/results/
├── ResultsLayout.tsx         # Overall page layout
├── OverallScore.tsx          # Animated circle + grade
├── CategoryCard.tsx          # Expandable category with sub-scores
├── AuditItem.tsx             # Individual pass/fail/warning item
├── ActionPlan.tsx            # Prioritized recommendation list
├── RecommendationItem.tsx    # Single recommendation with badges
├── LandingPagePreview.tsx    # iframe showing generated page
├── ResultsCTA.tsx            # Sticky CTA bar
├── StreamingLoader.tsx       # Skeleton shimmer while loading
└── SaveResultsModal.tsx      # OAuth prompt modal
```

## Phase 3 Tasks (Week 3)

### 7. Admin Panel
Dark mode always (no toggle needed — it's an internal tool).

**Pages:**
- Dashboard: metric cards (total audits, leads, conversions, revenue), recent activity feed
- Leads: filterable/sortable table, click to view lead detail + audit results
- Campaigns: create new campaign link, view campaign performance, copy link button
- Settings: team member management

**Components:**
```
/src/components/admin/
├── AdminLayout.tsx          # Sidebar nav + header
├── MetricCard.tsx           # Number + label + trend indicator
├── LeadTable.tsx            # Sortable, filterable data table
├── LeadDetail.tsx           # Lead profile + audit scores sidebar
├── CampaignCard.tsx         # Campaign with stats + copy link
├── CampaignCreator.tsx      # Form to create new campaign
└── TeamManager.tsx          # Team CRUD interface
```

### 8. Payments Page
- Stripe Elements embedded form
- Show what they're buying (competitor analysis or re-audit)
- Trust signals (secure payment, money-back guarantee if applicable)
- Success/error states

### 9. Cal.com Embed
- White-labeled Cal.com embed in a modal or dedicated section
- Triggered from Results page CTA
- Pre-fill lead info (name, email, business) from audit data

## Phase 4 Tasks (Week 4)

### 10. Animation Polish
- Page transitions between all routes (Framer Motion layout animations)
- Micro-interactions: button hover states, input focus glows, card hover lifts
- Loading states: skeleton shimmer on every data-dependent component
- Score count-up animation on results page
- Staggered category card entry
- Smooth dark/light mode transition on dashboard

### 11. Mobile Optimization
- Test every page at 375px, 390px, 414px widths
- Wizard: full-width inputs, large touch targets (44px minimum)
- Results: stack horizontally-laid cards, sticky CTA bar at bottom
- Admin: responsive sidebar → hamburger menu on mobile
- Landing: hero text scales down gracefully, CTA always visible

### 12. Performance
- Next.js Image component for all images
- Dynamic imports for heavy components (Cal.com embed, Stripe Elements)
- Prefetch wizard steps
- Cache design system tokens at build time

## Glassmorphism Implementation Pattern
```tsx
// Reusable glass card component
const GlassCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn(
    "backdrop-blur-xl bg-forge-glass border border-forge-glass-border rounded-xl p-6",
    "transition-all duration-200 hover:border-forge-accent/20",
    className
  )}>
    {children}
  </div>
);
```

## Data Fetching Pattern
Always call Backend API routes. Never import from `/src/lib/db/` directly.
```typescript
// ✅ CORRECT
const response = await fetch('/api/audit/results/' + id);
const data = await response.json();

// ❌ WRONG — never import backend lib in frontend
import { getAuditResults } from '@/lib/db/queries';
```

## i18n Pattern
All user-facing text uses i18n keys. Import from AI/Copy Agent's translations.
```tsx
import { useTranslations } from 'next-intl';

export function HeroSection() {
  const t = useTranslations('landing');
  return <h1>{t('hero.title')}</h1>;
}
```
