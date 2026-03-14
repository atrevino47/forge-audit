'use client';

import { motion } from 'framer-motion';
import { Target, BarChart3, Users, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';
import type { WizardStepProps } from '../../../contracts/component-props';

interface GoalsData {
  industry: string;
  mainChallenge: string;
  businessSize: string;
}

interface StepGoalsProps extends WizardStepProps {
  data: GoalsData;
  onChange: (data: Partial<GoalsData>) => void;
}

const INDUSTRY_OPTIONS = [
  'Technology',
  'Healthcare',
  'Real Estate',
  'Restaurant/Food',
  'Retail/E-commerce',
  'Professional Services',
  'Fitness/Wellness',
  'Education',
  'Construction',
  'Other',
];

const CHALLENGE_OPTIONS = [
  'Getting more customers',
  'Building brand awareness',
  'Improving online reviews',
  'Social media growth',
  'SEO and search visibility',
  'Website conversion',
  'Local visibility',
  'Other',
];

const BUSINESS_SIZE_OPTIONS = [
  'Just me',
  '2-10 employees',
  '11-50 employees',
  '51-200 employees',
  '200+ employees',
];

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.25, ease: 'easeOut' as const },
  }),
};

interface SelectGroupProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  icon: React.ComponentType<{ className?: string }>;
  columns?: number;
}

function SelectGroup({ label, options, value, onChange, icon: Icon, columns = 2 }: SelectGroupProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-forge-accent" />
        <span className="text-sm font-medium text-forge-text">{label}</span>
      </div>
      <div
        className={cn(
          'grid gap-2',
          columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        )}
      >
        {options.map((option) => {
          const isSelected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                'relative flex items-center gap-3 p-3 rounded-xl border text-left text-sm',
                'transition-all duration-200 cursor-pointer',
                'min-h-[44px]',
                isSelected
                  ? 'bg-forge-accent/10 border-forge-accent text-forge-text gold-border-glow'
                  : 'bg-forge-card border-forge-glass-border text-forge-text-muted hover:border-forge-accent/30 hover:text-forge-text'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 transition-all duration-200',
                  isSelected
                    ? 'bg-forge-accent border-forge-accent'
                    : 'border-forge-glass-border'
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-forge-base" />}
              </div>
              <span className="leading-tight">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function StepGoals({ data, onChange, onNext, onBack, isFirstStep, isLastStep }: StepGoalsProps) {
  const t = useTranslations('wizard');

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="mb-6"
      >
        <h2 className="text-xl font-semibold text-forge-text">{t('step4.title')}</h2>
        <p className="text-sm text-forge-text-muted mt-1">{t('step4.subtitle')}</p>
      </motion.div>

      <div className="space-y-8">
        <motion.div custom={0} initial="hidden" animate="visible" variants={sectionVariants}>
          <SelectGroup
            label={t('step4.industry')}
            options={INDUSTRY_OPTIONS}
            value={data.industry}
            onChange={(value) => onChange({ industry: value })}
            icon={Target}
          />
        </motion.div>

        <motion.div custom={1} initial="hidden" animate="visible" variants={sectionVariants}>
          <SelectGroup
            label={t('step4.mainChallenge')}
            options={CHALLENGE_OPTIONS}
            value={data.mainChallenge}
            onChange={(value) => onChange({ mainChallenge: value })}
            icon={BarChart3}
          />
        </motion.div>

        <motion.div custom={2} initial="hidden" animate="visible" variants={sectionVariants}>
          <SelectGroup
            label={t('step4.businessSize')}
            options={BUSINESS_SIZE_OPTIONS}
            value={data.businessSize}
            onChange={(value) => onChange({ businessSize: value })}
            icon={Users}
          />
        </motion.div>
      </div>
    </div>
  );
}

export function validateStepGoals(data: GoalsData): boolean {
  return !!data.industry && !!data.mainChallenge && !!data.businessSize;
}
