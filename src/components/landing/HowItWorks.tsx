'use client';

import { motion } from 'framer-motion';
import { ClipboardList, Sparkles, BarChart3 } from 'lucide-react';
import { useTranslations } from '@/hooks/use-translations';
import { GlassCard } from '@/components/shared/GlassCard';

const steps = [
  { icon: ClipboardList, stepKey: 'step1' as const },
  { icon: Sparkles, stepKey: 'step2' as const },
  { icon: BarChart3, stepKey: 'step3' as const },
];

export function HowItWorks() {
  const t = useTranslations('landing');

  return (
    <section id="how-it-works" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-forge-accent tracking-wide uppercase mb-3">
            {t('howItWorks.label')}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {t('howItWorks.title')}
          </h2>
          <p className="mt-4 text-lg text-forge-text-muted max-w-2xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.stepKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <GlassCard className="h-full relative group" hover>
                {/* Step number */}
                <div className="absolute -top-3 -left-1 size-7 rounded-full bg-forge-accent flex items-center justify-center text-forge-base text-xs font-bold">
                  {i + 1}
                </div>

                {/* Icon */}
                <div className="size-12 rounded-xl bg-forge-accent/10 flex items-center justify-center mb-5 transition-colors duration-200 group-hover:bg-forge-accent/15">
                  <step.icon className="size-6 text-forge-accent" />
                </div>

                <h3 className="text-lg font-semibold mb-2">
                  {t(`howItWorks.${step.stepKey}.title`)}
                </h3>
                <p className="text-sm text-forge-text-muted leading-relaxed">
                  {t(`howItWorks.${step.stepKey}.description`)}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Connector lines (desktop only) */}
        <div className="hidden md:flex justify-center mt-[-160px] mb-[100px] pointer-events-none" aria-hidden>
          <div className="w-full max-w-2xl flex items-center">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-forge-accent/20 to-forge-accent/20" />
            <div className="flex-1 h-px bg-gradient-to-r from-forge-accent/20 via-forge-accent/20 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
