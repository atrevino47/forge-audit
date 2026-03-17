/**
 * Forge Premium Web — Design Tokens
 * 
 * INTEGRATION NOTE:
 * This file works alongside the existing --forge-* CSS variables in globals.css.
 * The CSS variables handle Tailwind integration (bg-forge-base, text-forge-accent, etc.)
 * This file provides the JS-side constants for GSAP animations, inline styles, and 
 * any place where CSS variables aren't practical.
 * 
 * Both systems should use the SAME hex values. If you change a color here,
 * update globals.css to match. Single source of truth = this file.
 * 
 * USAGE: import { t } from '@/lib/design-tokens'
 * (Using 't' as alias to keep component code terse)
 */

export const t = {
  // ============================================================
  // COLORS — Match these with --forge-* in globals.css
  // ============================================================
  color: {
    // Backgrounds — 3-tier depth
    base:             "#0B1120",     // --forge-base (page bg)
    surface:          "#0F172A",     // --forge-surface (panels)
    surfaceElevated:  "#1E293B",     // --forge-card (cards, modals)
    surfaceBright:    "#283548",     // hover/active states

    // Borders
    border:           "rgba(255, 255, 255, 0.05)",
    borderHover:      "rgba(255, 255, 255, 0.08)",
    borderAccent:     "rgba(212, 165, 55, 0.12)",  // --forge-border
    borderAccentHover:"rgba(212, 165, 55, 0.22)",

    // Text — 4-tier
    textPrimary:      "#F8FAFC",     // --forge-text
    textSecondary:    "#94A3B8",     // --forge-text-muted
    textMuted:        "#64748B",
    textDisabled:     "#334155",

    // Accent — Gold (keeping current brand gold)
    accent:           "#D4A537",     // --forge-accent
    accentHover:      "#E5B84A",     // --forge-accent-hover
    accentLight:      "#F0D078",     // for gradients
    accentDim:        "rgba(212, 165, 55, 0.12)",
    accentGlow:       "rgba(212, 165, 55, 0.06)",

    // Semantic — data only, never decoration
    green:            "#22C55E",     // --forge-pass
    greenDim:         "rgba(34, 197, 94, 0.10)",
    yellow:           "#F59E0B",     // --forge-warning
    yellowDim:        "rgba(245, 158, 11, 0.10)",
    red:              "#EF4444",     // --forge-fail
    redDim:           "rgba(239, 68, 68, 0.10)",
    blue:             "#60A5FA",
    blueDim:          "rgba(96, 165, 250, 0.10)",

    // Glass
    glass:            "rgba(30, 41, 59, 0.5)",    // --forge-glass
    glassBorder:      "rgba(212, 165, 55, 0.12)", // --forge-glass-border

    // Special
    overlay:          "rgba(11, 17, 32, 0.8)",
    gradient: {
      gold:     "linear-gradient(135deg, #D4A537, #B8941F)",
      goldText: "linear-gradient(135deg, #D4A537, #F0D078)",
      surface:  "linear-gradient(170deg, #1E293B 0%, #0F172A 100%)",
      glow:     "radial-gradient(ellipse 50% 60% at 50% 40%, rgba(212, 165, 55, 0.07) 0%, transparent 70%)",
    },
  },

  // ============================================================
  // TYPOGRAPHY
  // ============================================================
  font: {
    display:  "'Instrument Serif', Georgia, serif",
    body:     "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    mono:     "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
  },

  // next/font/google config (for layout.tsx)
  fontConfig: {
    instrumentSerif: { family: 'Instrument_Serif', variable: '--font-display', weight: '400', subsets: ['latin'] },
    plusJakarta: { family: 'Plus_Jakarta_Sans', variable: '--font-body', subsets: ['latin'] },
    jetbrainsMono: { family: 'JetBrains_Mono', variable: '--font-mono', subsets: ['latin'] },
  },

  // Type scale
  fontSize: {
    xs:   "0.6875rem",  // 11px
    sm:   "0.8125rem",  // 13px
    base: "1rem",       // 16px
    md:   "1.125rem",   // 18px
    lg:   "1.25rem",    // 20px
    xl:   "1.5rem",     // 24px
    "2xl":"2rem",       // 32px
    "3xl":"2.75rem",    // 44px
    "4xl":"3.5rem",     // 56px
    "5xl":"4.5rem",     // 72px
  },

  leading: {
    none:    1,
    tight:   1.08,
    snug:    1.2,
    normal:  1.5,
    relaxed: 1.65,
    loose:   1.8,
  },

  tracking: {
    tighter: "-0.03em",
    tight:   "-0.02em",
    normal:  "0",
    wide:    "0.01em",
    wider:   "0.04em",
    widest:  "0.1em",
  },

  weight: {
    light:    300,
    regular:  400,
    medium:   500,
    semibold: 600,
    bold:     700,
  },

  // ============================================================
  // SPACING — 4px base unit
  // ============================================================
  space: {
    0:    "0px",
    1:    "4px",
    2:    "8px",
    3:    "12px",
    4:    "16px",
    5:    "20px",
    6:    "24px",
    8:    "32px",
    10:   "40px",
    12:   "48px",
    16:   "64px",
    20:   "80px",
    24:   "96px",
    32:   "128px",
  },

  // ============================================================
  // BORDER RADIUS
  // ============================================================
  radius: {
    xs:   "4px",
    sm:   "6px",
    md:   "10px",
    lg:   "14px",
    xl:   "20px",
    "2xl":"28px",
    full: "9999px",
  },

  // ============================================================
  // SHADOWS — Dark theme needs heavier shadows
  // ============================================================
  shadow: {
    sm:   "0 1px 2px rgba(0, 0, 0, 0.3)",
    md:   "0 4px 12px rgba(0, 0, 0, 0.4)",
    lg:   "0 12px 40px rgba(0, 0, 0, 0.5)",
    xl:   "0 24px 80px rgba(0, 0, 0, 0.6)",
    glow: "0 0 20px rgba(212, 165, 55, 0.15)",
    glowStrong: "0 0 40px rgba(212, 165, 55, 0.25)",
    inset: "inset 0 1px 0 rgba(255, 255, 255, 0.03)",
  },

  // ============================================================
  // MOTION — GSAP values (seconds, not ms)
  // ============================================================
  motion: {
    duration: {
      fast:   0.3,
      normal: 0.6,
      slow:   0.9,
      slower: 1.2,
    },
    ease: {
      out:     "power3.out",
      inOut:   "power2.inOut",
      spring:  "elastic.out(1, 0.5)",
      smooth:  "power1.out",
      snap:    "power4.out",
    },
    stagger: {
      fast:   0.08,
      normal: 0.12,
      slow:   0.18,
    },
  },

  // ============================================================
  // BREAKPOINTS
  // ============================================================
  breakpoint: {
    sm:  "640px",
    md:  "768px",
    lg:  "1024px",
    xl:  "1280px",
  },

  z: {
    base: 0, content: 1, elevated: 10, sticky: 20,
    overlay: 30, modal: 40, toast: 50,
  },
} as const;

export type DesignTokens = typeof t;
