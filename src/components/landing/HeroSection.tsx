'use client';

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { t } from '@/lib/design-tokens';
import { useEntranceAnimation, useCountUp, createShimmer } from '@/lib/gsap-presets';
import { useTranslations } from '@/hooks/use-translations';
import Link from 'next/link';

/* ANIMATION SEQUENCE — Hero
 * Beat 1  (0.00s): Badge        — fadeSlideUp
 * Beat 2  (0.10s): Headline     — fadeIn container
 *         (0.15s): Line 1 letters — 26 chars × 45ms stagger (ends ~1.32s)
 *         (1.62s): Line 2 letters — 11 chars × 45ms stagger (ends ~2.12s)
 * Beat 3  (0.35s): Subtitle     — fadeSlideUp
 * Beat 4  (0.50s): CTA          — fadeSlideUp
 * Beat 5  (0.65s): Microcopy    — fadeIn
 * Beat 6  (0.75s): Trust strip  — fadeIn
 * Beat 7  (0.80s): Mockup       — riseUp (1.0s)
 * Beat 8  (3.50s): Live feed    — fadeIn, stagger 0.15s
 *
 * MOCKUP INTERNAL SEQUENCE:
 * 1.20s:         URL typing starts (70ms/char × 15 chars = 1.05s)
 * ~2.25s:        "SCANNED ✓" fadeIn
 * ~2.55s:        Gold scan line sweeps top→bottom (2.0s)
 * ~4.55s:        Score counters start (72, 82, 71, 64, 88)
 * ~4.55s:        Status checks stagger in (0.08s each)
 * ~4.65s:        Progress bars animate to target widths
 * ~5.05s:        Grade badge + priority card fadeIn
 *
 * INDEPENDENT:
 * 3.00s:         CTA shimmer starts (repeats every 4s)
 */

// ── Timing constants ──────────────────────────────────────
const FULL_URL = 'acme-design.com';
const TYPING_DELAY = 1.2;
const TYPING_SPEED = 70; // ms per character
const TYPING_END = TYPING_DELAY + (FULL_URL.length * TYPING_SPEED) / 1000;
const SCAN_START = TYPING_END + 0.3;
const SCAN_DURATION = 2.0;
const SCORES_START = SCAN_START + SCAN_DURATION;

// ── Static data ───────────────────────────────────────────
const CATEGORY_CARDS = [
  { label: 'SEO', score: 82, color: '#22C55E' },
  { label: 'Website', score: 71, color: '#F59E0B' },
  { label: 'Social', score: 64, color: '#F59E0B' },
  { label: 'Branding', score: 88, color: '#22C55E' },
] as const;

const STATUS_CHECKS = [
  { label: 'SSL Certificate', pass: true },
  { label: 'Mobile Responsive', pass: true },
  { label: 'Open Graph Tags', pass: false },
  { label: 'Google Analytics', pass: false },
] as const;

const TRUST_ITEMS = [
  { value: '2,847', label: 'audits this month' },
  { value: '7', label: 'dimensions analyzed' },
  { value: '60s', label: 'avg scan time' },
] as const;

const LIVE_FEED = [
  { domain: 'bloom-studio.co', score: 84, time: '2m ago', color: '#22C55E' },
  { domain: 'vertex-labs.io', score: 61, time: '5m ago', color: '#F59E0B' },
  { domain: 'maison-noir.com', score: 93, time: '8m ago', color: '#22C55E' },
] as const;

// ── Letter-reveal helper ──────────────────────────────────
function SplitText({ children, className }: { children: string; className?: string }) {
  return (
    <>
      {children.split('').map((char, i) => (
        <span
          key={i}
          className={className}
          style={{ display: 'inline-block', opacity: 0.15 }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </>
  );
}

export function HeroSection() {
  const tr = useTranslations('landing');
  const { containerRef, addBeat } = useEntranceAnimation();

  // ── Refs ──
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const mockupCardRef = useRef<HTMLDivElement>(null);
  const scannedRef = useRef<HTMLSpanElement>(null);
  const scanLineRef = useRef<HTMLDivElement>(null);
  const gradeBadgeRef = useRef<HTMLSpanElement>(null);
  const priorityCardRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const liveFeedRef = useRef<HTMLDivElement>(null);

  // ── Overall score counter (72) via useCountUp ──
  const overallScoreRef = useCountUp(72, { delay: SCORES_START, duration: 1.8 });

  // ── URL typing state ──
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(false);

  /* ── 1. URL Typing Animation ─────────────────────────── */
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    const timeoutId = setTimeout(() => {
      setShowCursor(true);
      let i = 0;
      intervalId = setInterval(() => {
        i++;
        setTypedText(FULL_URL.slice(0, i));
        if (i >= FULL_URL.length) {
          clearInterval(intervalId);
          setShowCursor(false);
        }
      }, TYPING_SPEED);
    }, TYPING_DELAY * 1000);
    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  /* ── Headline letter-by-letter reveal ─────────────────── */
  // Line 1: 26 chars × 0.028s = 0.73s, starts at 0.15s
  // Line 2: delay = 0.15 + (26 × 0.028) + 0.3 = 1.18s
  // Line 2: 11 chars × 0.028s = 0.31s → headline done at ~1.49s

  useGSAP(() => {
    if (!headlineRef.current) return;
    const line1 = headlineRef.current.querySelectorAll('[data-headline-line="1"] span');
    gsap.to(line1, {
      opacity: 1, duration: 0.15, ease: 'power1.out',
      stagger: 0.028, delay: 0.15,
    });
  }, { scope: headlineRef, dependencies: [] });

  /* ── "Blind Spots" letter reveal (separate hook — own scope) ── */
  useGSAP(() => {
    if (!line2Ref.current) return;
    const chars = line2Ref.current.querySelectorAll('span');
    gsap.to(chars, {
      opacity: 1, duration: 0.15, ease: 'power1.out',
      stagger: 0.028, delay: 1.18,
    });
  }, { scope: line2Ref, dependencies: [] });

  /* ── 2-6. Mockup Internal Sequence ──────────────────── */
  useGSAP(() => {
    if (!mockupCardRef.current) return;

    // "SCANNED ✓" fadeIn after typing completes
    if (scannedRef.current) {
      gsap.to(scannedRef.current, {
        opacity: 1, duration: 0.4, ease: 'power2.out', delay: TYPING_END,
      });
    }

    // Scan line — gold 2px sweep top→bottom
    if (scanLineRef.current) {
      const scanTl = gsap.timeline({ delay: SCAN_START });
      scanTl.set(scanLineRef.current, { opacity: 1 });
      scanTl.to(scanLineRef.current, {
        top: '100%', duration: SCAN_DURATION, ease: 'power1.inOut',
      });
      scanTl.to(scanLineRef.current, { opacity: 0, duration: 0.2 });
    }

    // Category score counters via data-score
    mockupCardRef.current.querySelectorAll<HTMLElement>('[data-score]').forEach((el, i) => {
      const target = parseInt(el.dataset.score || '0');
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target, duration: 1.5, ease: 'power2.out',
        delay: SCORES_START + i * 0.08,
        onUpdate: () => { el.textContent = String(Math.round(obj.val)); },
      });
    });

    // Progress bars via data-bar-target
    mockupCardRef.current.querySelectorAll<HTMLElement>('[data-bar-target]').forEach((el, i) => {
      gsap.fromTo(el,
        { width: '0%' },
        { width: el.dataset.barTarget, duration: 1.2, ease: 'power2.out', delay: SCORES_START + 0.1 + i * 0.08 },
      );
    });

    // Status checks stagger
    gsap.from(
      mockupCardRef.current.querySelectorAll('[data-status-check]'),
      { opacity: 0, x: -8, duration: 0.3, ease: 'power2.out', stagger: 0.08, delay: SCORES_START },
    );

    // Grade badge fadeIn
    if (gradeBadgeRef.current) {
      gsap.to(gradeBadgeRef.current, {
        opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: SCORES_START + 0.5,
      });
    }

    // Priority card fadeSlideUp (last)
    if (priorityCardRef.current) {
      gsap.to(priorityCardRef.current, {
        opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: SCORES_START + 0.5,
      });
    }
  }, { scope: mockupCardRef, dependencies: [] });

  /* ── 7. CTA Shimmer ─────────────────────────────────── */
  useGSAP(() => {
    if (!ctaRef.current) return;
    createShimmer(ctaRef.current, { delay: 3, repeatDelay: 4 });
  }, { dependencies: [] });

  /* ── 8. Live Feed Stagger ───────────────────────────── */
  useGSAP(() => {
    if (!liveFeedRef.current) return;
    const items = liveFeedRef.current.querySelectorAll('[data-feed-item]');
    if (!items.length) return;
    gsap.from(items, {
      opacity: 0, y: 8, duration: 0.5, ease: 'power2.out', stagger: 0.15, delay: 3.5,
    });
  }, { scope: liveFeedRef, dependencies: [] });

  return (
    <section className="relative min-h-screen flex flex-col items-center overflow-hidden pt-32 pb-24">
      {/* BACKGROUND */}
      <div className="dot-grid absolute inset-0 pointer-events-none" aria-hidden="true" />
      <div
        className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 40%, rgba(212, 165, 55, 0.07) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* CONTENT — entrance animation scope */}
      <div ref={containerRef} className="relative mx-auto max-w-[960px] px-4 sm:px-6 text-center flex flex-col items-center">

        {/* Beat 1: Badge — fadeSlideUp */}
        <div ref={addBeat('fadeSlideUp', 0)} className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-forge-accent/15 bg-forge-accent/5">
          <span
            className="size-1.5 shrink-0 rounded-full bg-forge-accent"
            style={{ boxShadow: '0 0 8px rgba(212, 165, 55, 0.6)' }}
          />
          <span className="font-body text-xs font-medium text-forge-accent tracking-wider uppercase">
            {tr('hero.badge')}
          </span>
        </div>

        {/* Beat 2: Headline — fadeIn container, then letter-by-letter reveal */}
        <h1
          ref={el => { addBeat('fadeIn', 0.1)(el); headlineRef.current = el as HTMLHeadingElement; }}
          className="font-display mt-8 max-w-[780px] font-normal"
          style={{ fontSize: 'clamp(2.6rem, 5.2vw, 4.4rem)' }}
        >
          <span data-headline-line="1">
            <SplitText>{tr('hero.title')}</SplitText>
          </span>
          <br />
          <em>
            <span ref={line2Ref} data-headline-line="2">
              <SplitText className="text-gold-gradient">{tr('hero.titleAccent')}</SplitText>
            </span>
          </em>
        </h1>

        {/* Beat 3: Subtitle — fadeSlideUp */}
        <p
          ref={el => addBeat('fadeSlideUp', 0.35)(el)}
          className="font-body mt-6 max-w-[520px] text-forge-text-muted"
          style={{ fontSize: 'clamp(1rem, 1.6vw, 1.15rem)' }}
        >
          {tr('hero.subtitle')}
        </p>

        {/* Beat 4: CTA — fadeSlideUp (wrapper) + shimmer (link) */}
        <div ref={addBeat('fadeSlideUp', 0.50)} className="mt-10">
          <Link
            ref={ctaRef}
            href="/audit/wizard"
            className="relative overflow-hidden inline-flex items-center gap-2.5 rounded-full py-4 px-10 font-body text-[15px] font-semibold tracking-wide text-forge-base gold-glow transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(212,165,55,0.3)]"
            style={{ background: t.color.gradient.gold }}
          >
            {tr('hero.cta')}
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {/* Beat 5: Microcopy — fadeIn */}
        <p ref={el => addBeat('fadeIn', 0.65)(el)} className="mt-4 text-xs text-forge-text-muted/60">
          {tr('hero.ctaSubtext')}
        </p>

        {/* Beat 6: Trust strip — fadeIn */}
        <div ref={addBeat('fadeIn', 0.75)} className="mt-12 flex flex-col sm:flex-row items-center gap-6 sm:gap-0 sm:divide-x sm:divide-white/10">
          {TRUST_ITEMS.map((item) => (
            <div key={item.label} className="sm:px-6 text-center">
              <span className="font-display text-lg text-forge-text">{item.value}</span>
              <span className="ml-1.5 font-body text-xs text-forge-text-muted">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Beat 7: Dashboard Mockup — riseUp */}
        <div ref={addBeat('riseUp', 0.80)} className="mt-8 w-full max-w-[820px]">
          <div ref={mockupCardRef} className="glass-card rounded-2xl gold-border-glow overflow-hidden relative">

            {/* Scan line (sweeps top→bottom after typing) */}
            <div
              ref={scanLineRef}
              className="absolute left-0 right-0 h-0.5 z-10 pointer-events-none"
              style={{
                top: 0,
                opacity: 0,
                background: 'linear-gradient(90deg, transparent, rgba(212, 165, 55, 0.6), transparent)',
              }}
            />

            {/* URL Bar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#EF4444]/70" />
                <span className="size-2.5 rounded-full bg-[#F59E0B]/70" />
                <span className="size-2.5 rounded-full bg-[#22C55E]/70" />
              </div>
              <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md bg-forge-base/50">
                <svg className="size-3 shrink-0 text-forge-text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="font-mono text-xs text-forge-text-muted">
                  {typedText}
                  {showCursor && <span className="text-forge-accent">|</span>}
                </span>
              </div>
              <span
                ref={scannedRef}
                className="font-mono text-[11px] text-[#22C55E] tracking-wide"
                style={{ opacity: 0 }}
              >
                SCANNED ✓
              </span>
            </div>

            {/* Body */}
            <div className="flex flex-col lg:flex-row gap-5 p-5 sm:p-6">

              {/* LEFT PANEL — Overall Score */}
              <div className="w-full lg:min-w-[200px] lg:w-auto bg-forge-surface rounded-xl p-4 flex flex-col gap-4">
                <p className="font-body text-[10px] uppercase tracking-widest text-forge-text-muted">
                  OVERALL SCORE
                </p>
                <div>
                  <span ref={overallScoreRef} className="font-display text-[42px] leading-none text-forge-text">0</span>
                  <span className="font-mono text-xs text-forge-text-muted">/100</span>
                </div>
                <span
                  ref={gradeBadgeRef}
                  className="inline-flex self-start px-2.5 py-1 rounded-full border border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#F59E0B] font-body text-[10px] font-medium"
                  style={{ opacity: 0, transform: 'translateY(4px)' }}
                >
                  Needs Improvement
                </span>
                <div className="flex flex-col gap-2.5 mt-1">
                  {STATUS_CHECKS.map((item) => (
                    <div key={item.label} className="flex items-center gap-2" data-status-check>
                      <span
                        className={`size-1.5 shrink-0 rounded-full ${item.pass ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`}
                        style={{ boxShadow: item.pass ? '0 0 6px rgba(34,197,94,0.5)' : '0 0 6px rgba(239,68,68,0.5)' }}
                      />
                      <span className="font-mono text-[10.5px] text-forge-text-muted">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT PANEL — Category Cards + Insight */}
              <div className="flex-1 grid grid-cols-2 gap-3">
                {CATEGORY_CARDS.map((card) => (
                  <div key={card.label} className="bg-forge-surface border border-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ background: card.color }}
                      />
                      <span className="font-body text-xs text-forge-text-muted">{card.label}</span>
                    </div>
                    <span className="font-display text-xl text-forge-text" data-score={card.score}>0</span>
                    <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        data-bar-target={`${card.score}%`}
                        style={{ width: '0%', background: card.color }}
                      />
                    </div>
                  </div>
                ))}

                {/* Priority Insight Card */}
                <div
                  ref={priorityCardRef}
                  className="col-span-2 bg-forge-accent/5 border border-forge-accent/15 rounded-lg p-4 flex items-start gap-3"
                  style={{ opacity: 0, transform: 'translateY(16px)' }}
                >
                  <span className="size-8 shrink-0 flex items-center justify-center rounded-full bg-forge-accent/15">
                    <svg className="size-4 text-forge-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-body text-sm text-forge-text font-medium">
                      #1 Priority: Claim your Google Business Profile
                    </p>
                    <p className="font-body text-xs text-forge-text-muted mt-1">
                      Estimated impact: <span className="text-[#22C55E] font-medium">+15 pts</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Beat 8: Live Feed — fadeIn, stagger */}
        <div ref={liveFeedRef} className="mt-10 w-full max-w-[380px]">
          <p className="text-[10px] uppercase tracking-widest text-forge-text-muted mb-3 text-center">
            RECENT AUDITS
          </p>
          <div className="flex flex-col gap-1.5">
            {LIVE_FEED.map((row) => (
              <div key={row.domain} className="flex items-center gap-2 px-3 py-1.5 rounded-lg" data-feed-item>
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ background: row.color, boxShadow: `0 0 6px ${row.color}80` }}
                />
                <span className="font-mono text-xs text-forge-text-muted flex-1">{row.domain}</span>
                <span className="font-display text-sm text-forge-text leading-none">{row.score}</span>
                <span className="text-[10px] text-forge-text-muted/50 ml-1">{row.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
