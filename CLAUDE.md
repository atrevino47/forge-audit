# FORGE AUDIT — MASTER INSTRUCTIONS

> **Read this file first.** Every Claude Code agent working on this project MUST read this file before writing any code.

## Project Overview
We are building **audit.forgedigital.com** — a premium AI-powered online presence audit tool for Forge Digital. It analyzes 7 dimensions of a business's digital presence and delivers real-time streaming results with detailed scores, actionable recommendations, and a generated landing page preview.

**This app is Forge's showroom.** Every pixel, every animation, every loading state demonstrates the quality Forge brings to client work. If this app feels cheap, prospects will assume Forge's services are cheap.

## The One Goal
Convert free audit users into Forge's done-for-you sales funnel packages. Every feature exists to serve this conversion funnel.

## Brand Direction
- **Colors:** Deep navy (#0B1120) base + warm gold (#D4A537) accent
- **Style:** Glassmorphism — frosted glass layers, translucent depth, glowing gold accents
- **Mode:** Dark mode default. Dashboard has dark/light toggle.
- **Quality Standard:** Linear, Vercel, Stripe dashboard level
- **Full palette:** See `docs/PROJECT-PLAN.md` Section 12

## Tech Stack
- **Frontend:** Next.js 15 (App Router), Tailwind CSS, shadcn/ui, Framer Motion
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **Payments:** Stripe Elements
- **Email:** Resend + React Email
- **Scheduling:** Cal.com (embedded, white-labeled)
- **AI (deep):** Claude Sonnet 4 — branding, action plans, landing page gen
- **AI (simple):** Claude Haiku 3.5 — technical checks, scoring
- **Image Gen:** NanoBanana2 MCP Server (Google Gemini)
- **Design System:** UI/UX Pro Max (Claude Code Skill)
- **Analytics:** PostHog + Vercel Analytics
- **Hosting:** Vercel
- **i18n:** next-intl (EN/ES)

## Agent Architecture
There are 6 agents working on this project:

| Agent | Instruction File | Owns |
|-------|-----------------|------|
| Master Orchestrator | This file | /contracts/, /docs/, CLAUDE.md |
| Backend | docs/AGENT-BACKEND.md | /src/app/api/, /src/lib/db/, /src/lib/auth/, /src/lib/stripe/, /supabase/ |
| Frontend | docs/AGENT-FRONTEND.md | /src/app/(pages)/, /src/components/, /src/styles/, /design-system/ |
| Audit Engine | docs/AGENT-AUDIT.md | /src/lib/audit/, /src/lib/analyzers/, /src/lib/scoring/ |
| AI/Copy | docs/AGENT-AI-COPY.md | /src/lib/ai/, /src/lib/prompts/, /src/i18n/, /src/lib/landing-gen/ |
| Assets | docs/AGENT-ASSETS.md | /src/assets/, /src/emails/, /public/images/ |

## Rules — ALL AGENTS MUST FOLLOW

### Rule 1: Read your instruction file first
Before writing ANY code, read your specific `AGENT-*.md` file in `/docs/`.

### Rule 2: Contracts are the single source of truth
All shared types, interfaces, and constants live in `/contracts/`. Import from contracts — never define shared types locally. If you need a type that doesn't exist, create a `CONTRACT_REQUEST.md` in your owned directory and the Master will update contracts.

### Rule 3: Only Master modifies contracts
No agent modifies files in `/contracts/` directly. Request changes via `CONTRACT_REQUEST.md`.

### Rule 4: Strict file ownership
NEVER modify files outside your owned directories. If you need another agent to make a change, document it in your `CONTRACT_REQUEST.md`.

### Rule 5: API-first integration
Frontend never imports from Backend's lib directly. Frontend calls API routes. Backend exposes data through API contracts. Audit Engine exposes results through the database + SSE events.

### Rule 6: TypeScript strict mode
All code must pass `tsc --strict`. No `any` types. No `@ts-ignore`. Use proper typing everywhere.

### Rule 7: Bilingual from day one
All user-facing text must use i18n keys from `/src/i18n/`. Never hardcode English strings in components. The AI/Copy agent owns all copy.

### Rule 8: Brand compliance
All UI must follow the brand direction defined above. Read `design-system/MASTER.md` before building any UI component. Navy + gold + Glassmorphism + dark mode default.

### Rule 9: Error handling
Every API route validates inputs with Zod. Every async operation has try/catch. Every error state has a user-friendly message. No unhandled rejections.

### Rule 10: Performance budget
- Lighthouse score: 95+ on landing page
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Bundle size: monitor with next/bundle-analyzer

## Key Files to Read
- `docs/PROJECT-PLAN.md` — Complete project specification
- `contracts/audit-types.ts` — Audit result interfaces
- `contracts/api-contracts.ts` — API request/response types
- `contracts/events.ts` — SSE event types
- `contracts/constants.ts` — Shared constants (scoring thresholds, grades, limits)
- `design-system/MASTER.md` — Design tokens and component patterns

## Development Commands
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript strict check
npx supabase start   # Local Supabase
npx supabase db push # Push migrations
```
