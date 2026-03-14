'use client';

import { motion } from 'framer-motion';
import { useTranslations } from '@/hooks/use-translations';
import { GlassCard } from '@/components/shared/GlassCard';
import { RecommendationItem } from './RecommendationItem';
import type { ActionPlanProps } from '../../../contracts/component-props';

export function ActionPlan({ recommendations }: ActionPlanProps) {
  const t = useTranslations('results');

  if (recommendations.length === 0) return null;

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-forge-text">
          {t('actionPlan.title')}
        </h2>
        <p className="text-sm text-forge-text-muted mt-1">
          {t('actionPlan.subtitle')}
        </p>
      </div>

      <GlassCard hover={false}>
        <div className="divide-y divide-forge-glass-border/50">
          {recommendations.map((rec, i) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1, ease: 'easeOut' }}
            >
              <RecommendationItem recommendation={rec} index={i} />
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </section>
  );
}
