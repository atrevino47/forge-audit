'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Music2, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';
import type { WizardStepProps } from '../../../contracts/component-props';

interface SocialsData {
  instagram: string;
  facebook: string;
  tiktok: string;
  linkedin: string;
}

interface StepSocialsProps extends WizardStepProps {
  data: SocialsData;
  onChange: (data: Partial<SocialsData>) => void;
}

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.25, ease: 'easeOut' as const },
  }),
};

export function StepSocials({ data, onChange, onNext, onBack, isFirstStep, isLastStep }: StepSocialsProps) {
  const t = useTranslations('wizard');
  const [skipSocials, setSkipSocials] = useState(false);

  const handleSkipToggle = () => {
    const next = !skipSocials;
    setSkipSocials(next);
    if (next) {
      onChange({ instagram: '', facebook: '', tiktok: '', linkedin: '' });
    }
  };

  const handleChange = (field: string, value: string) => {
    if (skipSocials) return;
    onChange({ [field]: value });
  };

  const fields = [
    {
      key: 'instagram',
      label: t('step2.instagram'),
      placeholder: t('step2.instagramPlaceholder'),
      icon: Instagram,
    },
    {
      key: 'facebook',
      label: t('step2.facebook'),
      placeholder: t('step2.facebookPlaceholder'),
      icon: Facebook,
    },
    {
      key: 'tiktok',
      label: t('step2.tiktok'),
      placeholder: t('step2.tiktokPlaceholder'),
      icon: Music2,
    },
    {
      key: 'linkedin',
      label: t('step2.linkedin'),
      placeholder: t('step2.linkedinPlaceholder'),
      icon: Linkedin,
    },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="mb-6"
      >
        <h2 className="text-xl font-semibold text-forge-text">{t('step2.title')}</h2>
        <p className="text-sm text-forge-text-muted mt-1">{t('step2.subtitle')}</p>
      </motion.div>

      <div className={cn('space-y-4', skipSocials && 'opacity-40 pointer-events-none')}>
        {fields.map((field, index) => {
          const Icon = field.icon;
          const value = data[field.key as keyof SocialsData];

          return (
            <motion.div
              key={field.key}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={fieldVariants}
            >
              <label
                htmlFor={`wizard-${field.key}`}
                className="block text-sm font-medium text-forge-text mb-1.5"
              >
                {field.label}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors duration-200',
                      value ? 'text-forge-accent' : 'text-forge-text-muted'
                    )}
                  />
                </div>
                <input
                  id={`wizard-${field.key}`}
                  type="text"
                  placeholder={field.placeholder}
                  value={value}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  disabled={skipSocials}
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
          );
        })}
      </div>

      {/* Skip checkbox */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.25, ease: 'easeOut' }}
        className="mt-6"
      >
        <label className="flex items-center gap-3 cursor-pointer group min-h-[44px]">
          <div
            className={cn(
              'flex items-center justify-center w-5 h-5 rounded border-2 transition-all duration-200',
              skipSocials
                ? 'bg-forge-accent border-forge-accent'
                : 'border-forge-glass-border group-hover:border-forge-accent/50'
            )}
          >
            {skipSocials && (
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
            checked={skipSocials}
            onChange={handleSkipToggle}
            className="sr-only"
          />
          <span className="text-sm text-forge-text-muted group-hover:text-forge-text transition-colors duration-200">
            {t('step2.skip')}
          </span>
        </label>
      </motion.div>
    </div>
  );
}
