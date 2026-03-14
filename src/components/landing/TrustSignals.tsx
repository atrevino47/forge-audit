'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Clock } from 'lucide-react';
import { useTranslations } from '@/hooks/use-translations';

export function TrustSignals() {
  const t = useTranslations('landing');

  const signals = [
    { icon: Shield, label: 'No credit card required' },
    { icon: Zap, label: 'Results in 60 seconds' },
    { icon: Clock, label: 'Takes 2 minutes to set up' },
  ];

  return (
    <section className="py-12 border-y border-forge-glass-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12"
        >
          <p className="text-sm text-forge-text-muted">
            <span className="text-forge-accent font-semibold">{t('trust.count')}</span>{' '}
            {t('trust.suffix')}
          </p>

          <div className="hidden sm:block w-px h-6 bg-forge-glass-border" />

          <div className="flex items-center gap-6 sm:gap-8">
            {signals.map((signal, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="flex items-center gap-2"
              >
                <signal.icon className="size-4 text-forge-accent" />
                <span className="text-xs text-forge-text-muted whitespace-nowrap">{signal.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
