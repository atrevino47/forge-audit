'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/hooks/use-translations';
import { WizardProgress } from './WizardProgress';
import { WizardNavigation } from './WizardNavigation';
import { StepBusiness, validateStepBusiness } from './StepBusiness';
import { StepSocials } from './StepSocials';
import { StepGBP } from './StepGBP';
import { StepGoals, validateStepGoals } from './StepGoals';
import { StepLaunch } from './StepLaunch';
import type { StartAuditRequest } from '../../../contracts/api-contracts';

const STORAGE_KEY = 'forge-audit-wizard-data';
const TOTAL_STEPS = 5;

interface WizardFormData {
  email: string;
  fullName: string;
  businessName: string;
  websiteUrl: string;
  socials: {
    instagram: string;
    facebook: string;
    tiktok: string;
    linkedin: string;
  };
  gbpUrl: string;
  goals: {
    industry: string;
    mainChallenge: string;
    businessSize: string;
  };
}

const defaultFormData: WizardFormData = {
  email: '',
  fullName: '',
  businessName: '',
  websiteUrl: '',
  socials: {
    instagram: '',
    facebook: '',
    tiktok: '',
    linkedin: '',
  },
  gbpUrl: '',
  goals: {
    industry: '',
    mainChallenge: '',
    businessSize: '',
  },
};

function loadSavedData(): WizardFormData {
  if (typeof window === 'undefined') return defaultFormData;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<WizardFormData>;
      return {
        ...defaultFormData,
        ...parsed,
        socials: { ...defaultFormData.socials, ...parsed.socials },
        goals: { ...defaultFormData.goals, ...parsed.goals },
      };
    }
  } catch {
    // Corrupted data, start fresh
  }
  return defaultFormData;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

export function WizardLayout() {
  const router = useRouter();
  const t = useTranslations('wizard');

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [formData, setFormData] = useState<WizardFormData>(defaultFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasHydrated = useRef(false);

  // Restore from localStorage on mount
  useEffect(() => {
    if (!hasHydrated.current) {
      hasHydrated.current = true;
      setFormData(loadSavedData());
    }
  }, []);

  // Save to localStorage on data change
  useEffect(() => {
    if (hasHydrated.current) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      } catch {
        // Storage full or unavailable
      }
    }
  }, [formData]);

  const stepLabels = [
    t('progress.step1'),
    t('progress.step2'),
    t('progress.step3'),
    t('progress.step4'),
    t('progress.step5'),
  ];

  const updateFormData = useCallback((partial: Partial<WizardFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...partial,
      socials: {
        ...prev.socials,
        ...(partial.socials || {}),
      },
      goals: {
        ...prev.goals,
        ...(partial.goals || {}),
      },
    }));
  }, []);

  const updateSocials = useCallback((partial: Partial<WizardFormData['socials']>) => {
    setFormData((prev) => ({
      ...prev,
      socials: { ...prev.socials, ...partial },
    }));
  }, []);

  const updateGoals = useCallback((partial: Partial<WizardFormData['goals']>) => {
    setFormData((prev) => ({
      ...prev,
      goals: { ...prev.goals, ...partial },
    }));
  }, []);

  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 0:
        return validateStepBusiness({
          email: formData.email,
          fullName: formData.fullName,
          businessName: formData.businessName,
          websiteUrl: formData.websiteUrl,
        });
      case 1:
        return true; // Socials are optional
      case 2:
        return true; // GBP is optional
      case 3:
        return validateStepGoals(formData.goals);
      case 4:
        return true; // Launch step
      default:
        return false;
    }
  }, [currentStep, formData]);

  const goToStep = useCallback(
    (step: number) => {
      setDirection(step > currentStep ? 1 : -1);
      setCurrentStep(step);
      setError(null);
    },
    [currentStep]
  );

  const handleNext = useCallback(async () => {
    if (!canProceed()) return;

    if (currentStep === TOTAL_STEPS - 1) {
      // Launch the audit
      setIsLoading(true);
      setError(null);

      try {
        const hasSocials =
          formData.socials.instagram ||
          formData.socials.facebook ||
          formData.socials.tiktok ||
          formData.socials.linkedin;

        const payload: StartAuditRequest = {
          email: formData.email,
          fullName: formData.fullName,
          businessName: formData.businessName,
          websiteUrl: formData.websiteUrl,
          goals: formData.goals,
          language: 'en',
          ...(hasSocials
            ? {
                socials: {
                  ...(formData.socials.instagram && { instagram: formData.socials.instagram }),
                  ...(formData.socials.facebook && { facebook: formData.socials.facebook }),
                  ...(formData.socials.tiktok && { tiktok: formData.socials.tiktok }),
                  ...(formData.socials.linkedin && { linkedin: formData.socials.linkedin }),
                },
              }
            : {}),
          ...(formData.gbpUrl ? { gbpUrl: formData.gbpUrl } : {}),
        };

        const response = await fetch('/api/audit/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Audit request failed: ${response.status}`);
        }

        const result = await response.json();

        // Clear saved data on successful launch
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // Ignore storage errors
        }

        router.push(`/audit/results/${result.auditId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        setIsLoading(false);
      }
      return;
    }

    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
    setError(null);
  }, [currentStep, canProceed, formData, router]);

  const handleBack = useCallback(() => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setError(null);
  }, []);

  const renderStep = () => {
    const stepProps = {
      onNext: handleNext,
      onBack: handleBack,
      isFirstStep: currentStep === 0,
      isLastStep: currentStep === TOTAL_STEPS - 1,
    };

    switch (currentStep) {
      case 0:
        return (
          <StepBusiness
            {...stepProps}
            data={{
              email: formData.email,
              fullName: formData.fullName,
              businessName: formData.businessName,
              websiteUrl: formData.websiteUrl,
            }}
            onChange={(partial) => updateFormData(partial)}
          />
        );
      case 1:
        return (
          <StepSocials
            {...stepProps}
            data={formData.socials}
            onChange={updateSocials}
          />
        );
      case 2:
        return (
          <StepGBP
            {...stepProps}
            data={{ gbpUrl: formData.gbpUrl }}
            onChange={({ gbpUrl }) => updateFormData({ gbpUrl })}
          />
        );
      case 3:
        return (
          <StepGoals
            {...stepProps}
            data={formData.goals}
            onChange={updateGoals}
          />
        );
      case 4:
        return (
          <StepLaunch
            {...stepProps}
            data={formData}
            onGoToStep={goToStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 min-h-[600px] flex flex-col">
      <WizardProgress
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        stepLabels={stepLabels}
      />

      <div className="flex-1 relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-4 p-3 rounded-xl bg-forge-fail/10 border border-forge-fail/20 text-sm text-forge-fail text-center"
        >
          {error}
        </motion.div>
      )}

      <WizardNavigation
        onNext={handleNext}
        onBack={handleBack}
        isFirstStep={currentStep === 0}
        isLastStep={currentStep === TOTAL_STEPS - 1}
        isLoading={isLoading}
        canProceed={canProceed()}
      />
    </div>
  );
}
