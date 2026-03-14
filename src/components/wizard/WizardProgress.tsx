'use client';

import { motion } from 'framer-motion';
import { Building2, Share2, MapPin, Target, Rocket, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';
import type { WizardProgressProps } from '../../../contracts/component-props';

const stepIcons = [Building2, Share2, MapPin, Target, Rocket];

export function WizardProgress({ currentStep, totalSteps, stepLabels }: WizardProgressProps) {
  const t = useTranslations('wizard');

  const progressPercentage = 15 + ((currentStep) / (totalSteps - 1)) * 85;

  return (
    <div className="w-full mb-8">
      {/* Progress bar */}
      <div className="relative h-1 bg-forge-card rounded-full overflow-hidden mb-6">
        <motion.div
          className="absolute inset-y-0 left-0 bg-forge-accent rounded-full"
          initial={{ width: '15%' }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {stepLabels.map((label, index) => {
          const Icon = stepIcons[index];
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const translatedLabel = t(`progress.step${index + 1}`);

          return (
            <div
              key={label}
              className="flex flex-col items-center gap-2"
            >
              {/* Step circle */}
              <motion.div
                className={cn(
                  'relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-200',
                  isCompleted && 'bg-forge-accent border-forge-accent',
                  isCurrent && 'border-forge-accent bg-forge-accent/10',
                  !isCompleted && !isCurrent && 'border-forge-glass-border bg-forge-card'
                )}
                animate={isCurrent ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                transition={{ duration: 1.5, repeat: isCurrent ? Infinity : 0, ease: 'easeInOut' }}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-forge-base" />
                ) : (
                  <Icon
                    className={cn(
                      'w-4 h-4',
                      isCurrent ? 'text-forge-accent' : 'text-forge-text-muted'
                    )}
                  />
                )}
              </motion.div>

              {/* Step label - hidden on mobile, visible on md+ */}
              <span
                className={cn(
                  'hidden md:block text-xs font-medium transition-colors duration-200',
                  isCurrent ? 'text-forge-accent' : isCompleted ? 'text-forge-text' : 'text-forge-text-muted'
                )}
              >
                {translatedLabel}
              </span>

              {/* Dot indicator on mobile */}
              <div
                className={cn(
                  'md:hidden w-1.5 h-1.5 rounded-full transition-colors duration-200',
                  isCurrent ? 'bg-forge-accent' : isCompleted ? 'bg-forge-accent' : 'bg-forge-glass-border'
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
