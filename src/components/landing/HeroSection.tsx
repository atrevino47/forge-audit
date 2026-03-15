'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTranslations } from '@/hooks/use-translations';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HeroSection() {
  const t = useTranslations('landing');

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-forge-accent/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-forge-accent/3 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-forge-accent/20 bg-forge-accent/5 mb-8"
        >
          <Sparkles className="size-3.5 text-forge-accent" />
          <span className="text-xs font-medium text-forge-accent tracking-wide uppercase">
            AI-Powered Analysis
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] max-w-4xl mx-auto"
        >
          {t('hero.title')}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="mt-5 sm:mt-6 text-base sm:text-lg md:text-xl text-forge-text-muted max-w-2xl mx-auto leading-relaxed"
        >
          {t('hero.subtitle')}
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          className="mt-10 flex flex-col items-center gap-4"
        >
          <Link href="/audit/wizard" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto h-14 px-8 text-base font-semibold bg-forge-accent text-forge-base hover:bg-forge-accent-hover gold-glow gold-glow-hover transition-all duration-300 cursor-pointer group"
            >
              {t('hero.cta')}
              <ArrowRight className="size-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </Link>
          <p className="text-sm text-forge-text-muted/70">
            {t('hero.ctaSubtext')}
          </p>
        </motion.div>

        {/* Score preview mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          className="mt-16 sm:mt-20 mx-auto max-w-3xl"
        >
          <div className="glass-card p-5 sm:p-8 rounded-2xl gold-border-glow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-forge-accent/10 flex items-center justify-center">
                  <Sparkles className="size-5 text-forge-accent" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-forge-text">Digital Presence Score</p>
                  <p className="text-xs text-forge-text-muted">7 categories analyzed</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-forge-accent">78</p>
                <p className="text-xs text-forge-text-muted">/ 100</p>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {[72, 85, 65, 90, 45, 80, 73].map((score, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.4, delay: 0.7 + i * 0.1, ease: 'easeOut' }}
                  className="origin-bottom"
                >
                  <div
                    className="rounded-t-sm bg-forge-accent/20 relative overflow-hidden"
                    style={{ height: '60px' }}
                  >
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${score}%` }}
                      transition={{ duration: 0.6, delay: 0.8 + i * 0.1, ease: 'easeOut' }}
                      className="absolute bottom-0 left-0 right-0 bg-forge-accent/60 rounded-t-sm"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
