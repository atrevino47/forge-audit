# AGENT-ASSETS — Assets Agent Instructions

> Read `CLAUDE.md` first, then this file.

## Your Role
You own all visual assets (generated via NanoBanana2 MCP), email templates (React Email), and branded design assets. You make Forge look premium across every touchpoint — from the hero image to the email footer.

## Your Directories (YOU OWN THESE)
```
/src/assets/
├── illustrations/         # Landing page hero, section illustrations
├── icons/                 # 7 audit category icons
└── brand/                 # Logo variations, favicon, OG images

/src/emails/               # React Email templates
├── audit-complete.tsx     # "Your audit is ready" email
├── abandoned-audit.tsx    # "You didn't finish" re-engagement
├── reaudit-reminder.tsx   # "X days left for free re-audit" (3 variants: day 3, 10, 13)
├── welcome.tsx            # Post-OAuth welcome email
├── competitor-ready.tsx   # "Your competitor analysis is ready"
└── components/            # Shared email components
    ├── EmailHeader.tsx    # Branded header with logo
    ├── EmailFooter.tsx    # Footer with links + unsubscribe
    ├── EmailButton.tsx    # Gold CTA button
    └── EmailCard.tsx      # Score/result card for emails

/public/images/
├── hero.png               # Landing page hero illustration
├── og-image.png           # Social sharing preview
├── email-header.png       # Email header banner
├── favicon.ico            # Favicon
├── logo-dark.svg          # Logo for dark backgrounds
├── logo-light.svg         # Logo for light backgrounds
├── icons/                 # Audit category icons
│   ├── seo.png
│   ├── website.png
│   ├── social.png
│   ├── branding.png
│   ├── gbp.png
│   ├── ads.png
│   └── reputation.png
└── generated/             # NanoBanana2 output directory
```

## DO NOT TOUCH
- `/src/app/` (Backend + Frontend Agents)
- `/src/components/` (Frontend Agent)
- `/src/lib/` (Backend, Audit Engine, AI/Copy Agents)
- `/contracts/` (Master only)

## NanoBanana2 MCP Server Setup

### Configuration
Add to Claude Code MCP settings:
```json
{
  "name": "nanobanana",
  "command": "uvx",
  "args": ["nanobanana-mcp-server@latest"],
  "env": {
    "GEMINI_API_KEY": "${GEMINI_API_KEY}",
    "IMAGE_OUTPUT_DIR": "./public/images/generated"
  }
}
```

### Brand Prompt Prefix
**EVERY image generation call MUST start with this prefix:**
```
Premium dark navy (#0B1120) background, warm gold (#D4A537) accents, 
glassmorphism aesthetic with frosted translucent elements, sophisticated 
and authoritative, modern SaaS premium feel, clean and minimal.
```

### Model Selection Guide
| Asset Type | Tier | Aspect Ratio | Why |
|-----------|------|-------------|-----|
| Hero illustration | Pro | 16:9 | Complex composition, needs reasoning |
| Category icons (7) | NB2 | 1:1 | Consistent style, simpler subjects |
| OG/social preview | NB2 | 16:9 | Standard sharing format |
| Email header | NB2 | 3:1 | Simple banner |
| Outreach assets | NB2 | varies | Volume-optimized |
| Landing page visuals | Pro | 16:9 | Needs to impress |

## Asset Generation Plan

### Phase 1: Core Brand Assets

#### 1. Hero Illustration (Landing Page)
```
generate_image(
    prompt="[BRAND PREFIX] Abstract digital landscape representing comprehensive 
    online presence analysis. Glowing data streams and metrics converging into a 
    central golden score indicator. Deep navy space with subtle geometric grid lines 
    and frosted glass panels showing different analytics dimensions. Cinematic, 
    expansive, premium technology feel.",
    model_tier="pro",
    resolution="4k",
    aspect_ratio="16:9",
    output_path="public/images/hero.png"
)
```

#### 2. Category Icons (7 audit dimensions)
Generate with CONSISTENT style. Run all 7 in sequence with identical style instructions:
```
Style prefix: "[BRAND PREFIX] Minimal geometric icon, single gold accent element 
on dark navy circle background, clean vector aesthetic, flat design with subtle 
depth, consistent with a professional icon set. Icon representing: "

Icons:
- SEO: "search engine optimization — magnifying glass with upward trend line"
- Website: "website quality — browser window with performance gauge"
- Social Media: "social media presence — connected nodes in a network pattern"
- Branding: "brand identity — abstract geometric brand mark"
- GBP: "Google Business location — map pin with star rating"
- Ads: "advertising readiness — targeted crosshair with metrics"
- Reputation: "online reputation — shield with star rating"
```

#### 3. OG Image (Social Sharing)
```
generate_image(
    prompt="[BRAND PREFIX] Social media preview card design. Shows a premium 
    audit dashboard mockup with an overall score of 87/A displayed prominently 
    in a golden circle. Seven category scores visible as small indicators. 
    Text: 'Forge Audit — Free Online Presence Score'. Professional, clean, 
    makes people want to click.",
    model_tier="nb2",
    aspect_ratio="16:9",
    output_path="public/images/og-image.png"
)
```

#### 4. Email Header Banner
```
generate_image(
    prompt="[BRAND PREFIX] Email header banner. Subtle abstract pattern with 
    thin golden accent lines and nodes on deep navy. Very clean, not busy. 
    Professional email correspondence style. No text.",
    model_tier="nb2",
    aspect_ratio="3:1",
    output_path="public/images/email-header.png"
)
```

#### 5. Favicon & Logo
Favicon: Extract/design from Forge brand (manual or NB2 1:1 generation)
Logo: Create SVG variations (dark bg / light bg) — may need manual refinement

### Phase 2: Email Templates

All emails use React Email + Resend. Must look premium and on-brand.

#### Email Design System
```tsx
// /src/emails/components/EmailHeader.tsx
import { Img, Section } from '@react-email/components';

export function EmailHeader() {
  return (
    <Section style={{ backgroundColor: '#0B1120', padding: '24px 32px' }}>
      <Img 
        src="https://audit.forgedigital.com/images/email-header.png" 
        width="100%" 
        alt="Forge Audit" 
      />
    </Section>
  );
}
```

#### Color Tokens for Emails
```typescript
export const emailColors = {
  bg: '#0B1120',
  surface: '#0F172A',
  card: '#1E293B',
  accent: '#D4A537',
  text: '#F8FAFC',
  muted: '#94A3B8',
  pass: '#22C55E',
  warning: '#F59E0B',
  fail: '#EF4444',
  border: 'rgba(212, 165, 55, 0.15)',
};
```

#### Email Templates to Build

**1. Audit Complete (`audit-complete.tsx`)**
- Subject: "Your online presence score is ready — {score}/100"
- Content: Overall score + grade prominently displayed, brief summary of top 3 findings, CTA: "View Full Results"
- Design: Dark background, gold score circle, glass cards for category previews

**2. Abandoned Audit (`abandoned-audit.tsx`)**
- Subject: "Your audit is 80% ready — come see your score"
- Content: Reminder of what they entered, emphasis on how close they are, CTA: "Complete Your Audit"
- Tone: Helpful, not pushy

**3. Re-Audit Reminder (`reaudit-reminder.tsx`)**
- 3 variants based on days remaining:
  - Day 3: "Tips to improve your score before your free re-audit"
  - Day 10: "Your free re-audit window closes in 4 days"
  - Day 13: "Last chance — free re-audit expires tomorrow"
- Content: Remind them of their score, suggest top 3 quick wins, CTA: "Run Your Free Re-Audit"

**4. Welcome (`welcome.tsx`)**
- Subject: "Welcome to Forge Audit — your results are saved"
- Content: Confirm results are saved, explain the re-audit benefit, CTA: "View Your Dashboard"

**5. Competitor Analysis Ready (`competitor-ready.tsx`)**
- Subject: "Your competitor analysis is complete"
- Content: Brief comparison highlights, CTA: "View Competitor Analysis"

### Email Testing
Every email template must render correctly in:
- Gmail (web + mobile)
- Apple Mail
- Outlook (latest)
Test using React Email's built-in preview: `npx email dev`

## Phase 3: Campaign & Social Assets

For outreach campaigns, generate variants of:
- LinkedIn banner/post images (16:9 and 1:1)
- Instagram story format (9:16)
- Twitter/X card images (16:9)

All with consistent brand styling and audit-related messaging.

## Quality Checklist
- [ ] All images use Forge brand colors (navy + gold)
- [ ] All images maintain Glassmorphism aesthetic
- [ ] Category icons are visually consistent as a set
- [ ] Email templates render correctly across major clients
- [ ] All images are optimized for web (compressed, appropriate resolution)
- [ ] OG image displays correctly when shared on social platforms
- [ ] Favicon is clear at 16x16 and 32x32
- [ ] No text in images is critical (accessibility) — text should be in HTML overlay
