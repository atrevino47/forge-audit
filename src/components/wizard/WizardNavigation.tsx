'use client';

import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';

interface WizardNavigationProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading?: boolean;
  canProceed?: boolean;
}

export function WizardNavigation({
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  isLoading = false,
  canProceed = true,
}: WizardNavigationProps) {
  const tCommon = useTranslations('common');
  const tWizard = useTranslations('wizard');

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && canProceed && !isLoading) {
        e.preventDefault();
        onNext();
      }
    },
    [onNext, canProceed, isLoading]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex items-center justify-between gap-4 mt-8">
      {/* Back button */}
      <div className="flex-1">
        {!isFirstStep && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Button
              variant="ghost"
              onClick={onBack}
              disabled={isLoading}
              className="cursor-pointer gap-2 text-forge-text-muted hover:text-forge-text"
            >
              <ArrowLeft className="w-4 h-4" />
              {tCommon('cta.back')}
            </Button>
          </motion.div>
        )}
      </div>

      {/* Next / Launch button */}
      <div className="flex-1 flex justify-end">
        {isLastStep ? (
          <Button
            onClick={onNext}
            disabled={!canProceed || isLoading}
            className={cn(
              'cursor-pointer gap-2 px-8 py-3 h-auto text-base font-semibold',
              'bg-forge-accent text-forge-base hover:bg-forge-accent-hover',
              'gold-glow gold-glow-hover',
              'w-full sm:w-auto',
              'transition-all duration-200'
            )}
          >
            {isLoading ? (
              <motion.div
                className="w-5 h-5 border-2 border-forge-base/30 border-t-forge-base rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                {tWizard('step5.launchCta')}
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={onNext}
            disabled={!canProceed || isLoading}
            className={cn(
              'cursor-pointer gap-2 px-6 py-2.5 h-auto',
              'bg-forge-accent text-forge-base hover:bg-forge-accent-hover',
              'w-full sm:w-auto',
              'transition-all duration-200'
            )}
          >
            {tCommon('cta.next')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
