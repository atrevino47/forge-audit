'use client';

import { motion } from 'framer-motion';
import { Search, Globe, Share2, Palette, MapPin, Target, Star } from 'lucide-react';
import { useTranslations } from '@/hooks/use-translations';
import { GlassCard } from '@/components/shared/GlassCard';
import type { AuditCategory } from '../../../contracts/audit-types';
import { AUDIT_CATEGORIES } from '../../../contracts/constants';

const categoryIcons: Record<AuditCategory, React.ElementType> = {
  seo: Search,
  website: Globe,
  social: Share2,
  branding: Palette,
  gbp: MapPin,
  ads: Target,
  reputation: Star,
};

export function Categories() {
  const t = useTranslations('landing');

  return (
    <section id="categories" className="py-24 sm:py-32 relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-forge-surface/50 pointer-events-none" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-forge-accent tracking-wide uppercase mb-3">
            {t('categories.label')}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {t('categories.title')}
          </h2>
          <p className="mt-4 text-lg text-forge-text-muted max-w-2xl mx-auto">
            {t('categories.subtitle')}
          </p>
        </motion.div>

        {/* Category grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {AUDIT_CATEGORIES.map((category, i) => {
            const Icon = categoryIcons[category];
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <GlassCard className="h-full group" hover>
                  <div className="size-10 rounded-lg bg-forge-accent/10 flex items-center justify-center mb-4 transition-colors duration-200 group-hover:bg-forge-accent/15">
                    <Icon className="size-5 text-forge-accent" />
                  </div>
                  <h3 className="text-base font-semibold mb-1.5">
                    {t(`categories.${category}.title`)}
                  </h3>
                  <p className="text-sm text-forge-text-muted leading-relaxed">
                    {t(`categories.${category}.description`)}
                  </p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
