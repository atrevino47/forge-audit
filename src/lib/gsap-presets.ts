/**
 * Forge Premium Web — GSAP Animation Presets
 * 
 * REPLACES framer-motion entirely. Covers:
 * - Entrance animations (replaces motion.div initial/animate)
 * - Scroll reveals (replaces whileInView)
 * - Stagger reveals (replaces staggerChildren)
 * - Exit animations (replaces AnimatePresence)
 * - Accordion/toggle (replaces AnimatePresence for height)
 * - Directional transitions (replaces AnimatePresence for wizard steps)
 * - Counter animations
 * - Shimmer effects
 * 
 * USAGE: import { useEntranceAnimation, useScrollReveal, ... } from '@/lib/gsap-presets'
 * 
 * DEPENDENCIES: npm install gsap @gsap/react
 */

'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ============================================================
// PRESETS — "from" states. GSAP animates FROM these TO normal.
// ============================================================
export const presets = {
  fadeSlideUp: { y: 24, opacity: 0, duration: 0.7, ease: 'power3.out' },
  riseUp:      { y: 48, opacity: 0, scale: 0.98, duration: 1.0, ease: 'power3.out' },
  clipReveal:  { clipPath: 'inset(100% 0 0 0)', opacity: 0, duration: 0.9, ease: 'power3.out' },
  fadeIn:      { opacity: 0, duration: 0.6, ease: 'power2.out' },
  scaleIn:     { scale: 0.94, opacity: 0, duration: 0.6, ease: 'power3.out' },
  slideLeft:   { x: -30, opacity: 0, duration: 0.7, ease: 'power3.out' },
  slideRight:  { x: 30, opacity: 0, duration: 0.7, ease: 'power3.out' },
} as const;

export type PresetName = keyof typeof presets;


// ============================================================
// HOOK: useEntranceAnimation
// Replaces: motion.div initial/animate with orchestrated timeline
// ============================================================
export function useEntranceAnimation(options?: {
  initialDelay?: number;
  scrollTriggered?: boolean;
  scrollStart?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const beatsRef = useRef<Array<{
    element: HTMLElement;
    preset: PresetName;
    delay: number;
  }>>([]);

  const addBeat = useCallback((preset: PresetName, delay: number) => {
    return (el: HTMLElement | null) => {
      if (!el) return;
      if (!beatsRef.current.find(b => b.element === el)) {
        beatsRef.current.push({ element: el, preset, delay });
      }
    };
  }, []);

  useGSAP(() => {
    const beats = beatsRef.current;
    if (beats.length === 0) return;

    const tl = gsap.timeline({
      delay: options?.initialDelay ?? 0.1,
      ...(options?.scrollTriggered ? {
        scrollTrigger: {
          trigger: containerRef.current,
          start: options?.scrollStart ?? 'top 80%',
          once: true,
        },
      } : {}),
    });

    beats.sort((a, b) => a.delay - b.delay);

    beats.forEach((beat) => {
      const { duration, ease, ...fromValues } = { ...presets[beat.preset] };
      tl.from(beat.element, {
        ...fromValues,
        duration: duration as number,
        ease: ease as string,
        force3D: true,
      }, beat.delay);
    });
  }, { scope: containerRef, dependencies: [] });

  return { containerRef, addBeat };
}


// ============================================================
// HOOK: useScrollReveal
// Replaces: motion.div whileInView for single elements
// ============================================================
export function useScrollReveal(
  preset: PresetName = 'fadeSlideUp',
  options?: { delay?: number; start?: string }
) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!ref.current) return;
    const { duration, ease, ...fromValues } = { ...presets[preset] };
    gsap.from(ref.current, {
      ...fromValues,
      duration: duration as number,
      ease: ease as string,
      delay: options?.delay ?? 0,
      force3D: true,
      scrollTrigger: {
        trigger: ref.current,
        start: options?.start ?? 'top 85%',
        once: true,
      },
    });
  }, { scope: ref, dependencies: [] });

  return ref;
}


// ============================================================
// HOOK: useStaggerReveal
// Replaces: motion.div staggerChildren on scroll
// ============================================================
export function useStaggerReveal(options?: {
  preset?: PresetName;
  stagger?: number;
  start?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemClass = 'gsap-stagger-item';

  useGSAP(() => {
    if (!containerRef.current) return;
    const items = containerRef.current.querySelectorAll(`.${itemClass}`);
    if (items.length === 0) return;

    const { duration, ease, ...fromValues } = { ...presets[options?.preset ?? 'fadeSlideUp'] };
    gsap.from(items, {
      ...fromValues,
      duration: duration as number,
      ease: ease as string,
      stagger: options?.stagger ?? 0.12,
      force3D: true,
      scrollTrigger: {
        trigger: containerRef.current,
        start: options?.start ?? 'top 80%',
        once: true,
      },
    });
  }, { scope: containerRef, dependencies: [] });

  return { containerRef, itemClass };
}


// ============================================================
// HOOK: useCountUp
// Replaces: manual counter animation
// ============================================================
export function useCountUp(
  target: number,
  options?: { duration?: number; scroll?: boolean; delay?: number; suffix?: string }
) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    if (!ref.current) return;
    const obj = { val: 0 };
    const config: gsap.TweenVars = {
      val: target,
      duration: options?.duration ?? 1.8,
      ease: 'power2.out',
      delay: options?.delay ?? 0,
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = Math.round(obj.val).toLocaleString() + (options?.suffix ?? '');
        }
      },
    };
    if (options?.scroll) {
      config.scrollTrigger = {
        trigger: ref.current,
        start: 'top 85%',
        once: true,
      };
    }
    gsap.to(obj, config);
  }, { scope: ref, dependencies: [] });

  return ref;
}


// ============================================================
// HOOK: useAnimatedToggle
// Replaces: AnimatePresence for accordion / mobile menu
// Uses CSS grid-template-rows for smooth height animation.
// No GSAP needed — pure CSS transition.
// ============================================================
export function useAnimatedToggle(isOpen: boolean) {
  // Returns props to spread on wrapper and inner divs
  // Usage:
  //   const { wrapperProps, innerProps } = useAnimatedToggle(isOpen);
  //   <div {...wrapperProps}><div {...innerProps}>Content</div></div>
  
  return {
    wrapperStyle: {
      display: 'grid',
      gridTemplateRows: isOpen ? '1fr' : '0fr',
      transition: 'grid-template-rows 300ms cubic-bezier(0.16, 1, 0.3, 1)',
      overflow: 'hidden',
    } as React.CSSProperties,
    innerStyle: {
      minHeight: 0,
      overflow: 'hidden',
    } as React.CSSProperties,
  };
}


// ============================================================
// HOOK: useAnimatedUnmount
// Replaces: AnimatePresence for modals, conditional renders
// Keeps element mounted until exit animation completes.
// ============================================================
export function useAnimatedUnmount(
  isVisible: boolean,
  options?: {
    enterPreset?: PresetName;
    exitDuration?: number;
  }
) {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const ref = useRef<HTMLDivElement>(null);
  const prevVisible = useRef(isVisible);

  useEffect(() => {
    if (isVisible && !prevVisible.current) {
      // Entering
      setShouldRender(true);
    } else if (!isVisible && prevVisible.current) {
      // Exiting — animate out, then unmount
      if (ref.current) {
        gsap.to(ref.current, {
          opacity: 0,
          y: -10,
          scale: 0.98,
          duration: options?.exitDuration ?? 0.25,
          ease: 'power2.in',
          onComplete: () => setShouldRender(false),
        });
      } else {
        setShouldRender(false);
      }
    }
    prevVisible.current = isVisible;
  }, [isVisible, options?.exitDuration]);

  // Entrance animation after mount
  useEffect(() => {
    if (shouldRender && isVisible && ref.current) {
      const preset = options?.enterPreset ?? 'fadeSlideUp';
      const { duration, ease, ...fromValues } = { ...presets[preset] };
      gsap.from(ref.current, {
        ...fromValues,
        duration: duration as number,
        ease: ease as string,
        force3D: true,
      });
    }
  }, [shouldRender, isVisible, options?.enterPreset]);

  return { shouldRender, ref };
}


// ============================================================
// HOOK: useDirectionalTransition
// Replaces: AnimatePresence for wizard step transitions
// Animates old content out in one direction, new content in from opposite.
// ============================================================
export function useDirectionalTransition<T>(
  currentValue: T,
  options?: {
    duration?: number;
    distance?: number;
  }
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevValue = useRef<T>(currentValue);
  const [displayValue, setDisplayValue] = useState<T>(currentValue);

  useEffect(() => {
    if (currentValue === prevValue.current) return;

    const direction = 1; // Could be made smarter with step index comparison
    const dist = options?.distance ?? 40;
    const dur = options?.duration ?? 0.4;

    if (containerRef.current) {
      // Animate out
      gsap.to(containerRef.current, {
        x: -direction * dist,
        opacity: 0,
        duration: dur * 0.6,
        ease: 'power2.in',
        onComplete: () => {
          setDisplayValue(currentValue);
          // Set initial position for enter
          if (containerRef.current) {
            gsap.set(containerRef.current, { x: direction * dist, opacity: 0 });
            // Animate in
            gsap.to(containerRef.current, {
              x: 0,
              opacity: 1,
              duration: dur,
              ease: 'power3.out',
              force3D: true,
            });
          }
        },
      });
    } else {
      setDisplayValue(currentValue);
    }

    prevValue.current = currentValue;
  }, [currentValue, options?.duration, options?.distance]);

  return { containerRef, displayValue };
}


// ============================================================
// HOOK: useSimpleEntrance
// Replaces: motion.div initial/animate for single elements
// Simpler than useEntranceAnimation when you just need one element.
// ============================================================
export function useSimpleEntrance(
  preset: PresetName = 'fadeSlideUp',
  options?: { delay?: number }
) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!ref.current) return;
    const { duration, ease, ...fromValues } = { ...presets[preset] };
    gsap.from(ref.current, {
      ...fromValues,
      duration: duration as number,
      ease: ease as string,
      delay: options?.delay ?? 0,
      force3D: true,
    });
  }, { scope: ref, dependencies: [] });

  return ref;
}


// ============================================================
// UTILITY: Shimmer effect for buttons
// ============================================================
export function createShimmer(element: HTMLElement, options?: {
  delay?: number;
  repeatDelay?: number;
}) {
  const shimmer = document.createElement('div');
  shimmer.style.cssText = `
    position: absolute; top: 0; left: -100%;
    width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    pointer-events: none; border-radius: inherit;
  `;
  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(shimmer);

  return gsap.to(shimmer, {
    left: '200%',
    duration: 1.2,
    ease: 'power1.inOut',
    repeat: -1,
    repeatDelay: options?.repeatDelay ?? 4,
    delay: options?.delay ?? 3,
  });
}


// ============================================================
// CSS UTILITIES — Add these to globals.css or use inline
// ============================================================
export const dotGridCSS = {
  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
  backgroundSize: '32px 32px',
  maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, black 0%, transparent 70%)',
  WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, black 0%, transparent 70%)',
} as React.CSSProperties;

export const grainOverlayCSS = {
  position: 'fixed' as const,
  top: 0, left: 0, right: 0, bottom: 0,
  pointerEvents: 'none' as const,
  zIndex: 100,
  opacity: 0.035,
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'repeat',
  backgroundSize: '128px',
} as React.CSSProperties;
