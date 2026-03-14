'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';
import type { WizardStepProps } from '../../../contracts/component-props';

interface StepGBPProps extends WizardStepProps {
  data: {
    gbpUrl: string;
  };
  onChange: (data: { gbpUrl: string }) => void;
}

export function StepGBP({ data, onChange, onNext, onBack, isFirstStep, isLastStep }: StepGBPProps) {
  const t = useTranslations('wizard');
  const [skipGBP, setSkipGBP] = useState(false);

  const handleSkipToggle = () => {
    const next = !skipGBP;
    setSkipGBP(next);
    if (next) {
      onChange({ gbpUrl: '' });
    }
  };

  const handleChange = (value: string) => {
    if (skipGBP) return;
    onChange({ gbpUrl: value });
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="mb-6"
      >
        <h2 className="text-xl font-semibold text-forge-text">{t('step3.title')}</h2>
        <p className="text-sm text-forge-text-muted mt-1">{t('step3.subtitle')}</p>
      </motion.div>

      <div className={cn(skipGBP && 'opacity-40 pointer-events-none')}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <label
            htmlFor="wizard-gbpUrl"
            className="block text-sm font-medium text-forge-text mb-1.5"
          >
            {t('step3.gbpUrl')}
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <MapPin
                className={cn(
                  'w-4 h-4 transition-colors duration-200',
                  data.gbpUrl ? 'text-forge-accent' : 'text-forge-text-muted'
                )}
              />
            </div>
            <input
              id="wizard-gbpUrl"
              type="url"
              placeholder={t('step3.gbpUrlPlaceholder')}
              value={data.gbpUrl}
              onChange={(e) => handleChange(e.target.value)}
              disabled={skipGBP}
              className={cn(
                'w-full bg-forge-card border border-forge-glass-border rounded-xl p-4 pl-11 text-sm text-forge-text',
                'placeholder:text-forge-text-muted/50',
                'outline-none transition-all duration-200',
                'min-h-[44px]',
                'focus:border-forge-accent',
                'disabled:cursor-not-allowed'
              )}
            />
          </div>
        </motion.div>

        {/* Help text */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.25, ease: 'easeOut' }}
          className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-forge-card/50 border border-forge-glass-border"
        >
          <Info className="w-4 h-4 text-forge-accent shrink-0 mt-0.5" />
          <p className="text-xs text-forge-text-muted leading-relaxed">
            Your Google Business Profile (GBP) is how your business appears on Google Search and Google Maps.
            Search for your business on Google and look for your listing on the right side panel, or go to{' '}
            <span className="text-forge-accent">business.google.com</span> to manage it.
          </p>
        </motion.div>
      </div>

      {/* Skip checkbox */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.25, ease: 'easeOut' }}
        className="mt-6"
      >
        <label className="flex items-center gap-3 cursor-pointer group min-h-[44px]">
          <div
            className={cn(
              'flex items-center justify-center w-5 h-5 rounded border-2 transition-all duration-200',
              skipGBP
                ? 'bg-forge-accent border-forge-accent'
                : 'border-forge-glass-border group-hover:border-forge-accent/50'
            )}
          >
            {skipGBP && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="w-3 h-3 text-forge-base"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 6l3 3 5-5" />
              </motion.svg>
            )}
          </div>
          <input
            type="checkbox"
            checked={skipGBP}
            onChange={handleSkipToggle}
            className="sr-only"
          />
          <span className="text-sm text-forge-text-muted group-hover:text-forge-text transition-colors duration-200">
            {t('step3.skip')}
          </span>
        </label>
      </motion.div>
    </div>
  );
}
