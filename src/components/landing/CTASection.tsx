'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from '@/hooks/use-translations';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CTASection() {
  const t = useTranslations('landing');

  return (
    <section className="py-24 sm:py-32 relative">
      <div className="absolute inset-0 bg-forge-surface/50 pointer-events-none" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="glass-card max-w-2xl mx-auto p-6 sm:p-10 md:p-14 rounded-2xl gold-border-glow">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
              {t('hero.title')}
            </h2>
            <p className="text-forge-text-muted mb-8 max-w-md mx-auto">
              {t('hero.subtitle')}
            </p>
            <Link href="/audit/wizard" className="block w-full sm:w-auto sm:inline-block">
              <Button
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-base font-semibold bg-forge-accent text-forge-base hover:bg-forge-accent-hover gold-glow gold-glow-hover transition-all duration-300 cursor-pointer group"
              >
                {t('hero.cta')}
                <ArrowRight className="size-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </Link>
            <p className="mt-4 text-xs text-forge-text-muted/70">
              {t('hero.ctaSubtext')}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
