'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mail, User, Building2, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';
import type { WizardStepProps } from '../../../contracts/component-props';

interface StepBusinessProps extends WizardStepProps {
  data: {
    email: string;
    fullName: string;
    businessName: string;
    websiteUrl: string;
  };
  onChange: (data: Partial<StepBusinessProps['data']>) => void;
}

interface FieldErrors {
  email?: string;
  fullName?: string;
  businessName?: string;
  websiteUrl?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateUrl(url: string): boolean {
  if (!url) return true;
  try {
    const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`;
    new URL(urlWithProtocol);
    return true;
  } catch {
    return false;
  }
}

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.25, ease: 'easeOut' as const },
  }),
};

export function StepBusiness({ data, onChange, onNext, onBack, isFirstStep, isLastStep }: StepBusinessProps) {
  const t = useTranslations('wizard');
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = setTimeout(() => firstInputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const validateField = useCallback(
    (field: string, value: string): string | undefined => {
      switch (field) {
        case 'email':
          if (!value.trim()) return t('validation.required');
          if (!validateEmail(value)) return t('validation.email');
          return undefined;
        case 'fullName':
        case 'businessName':
          if (!value.trim()) return t('validation.required');
          return undefined;
        case 'websiteUrl':
          if (!value.trim()) return t('validation.required');
          if (!validateUrl(value)) return t('validation.url');
          return undefined;
        default:
          return undefined;
      }
    },
    [t]
  );

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = data[field as keyof typeof data];
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (field: string, value: string) => {
    onChange({ [field]: value });
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const fields = [
    {
      key: 'email',
      label: t('step1.email'),
      placeholder: t('step1.emailPlaceholder'),
      type: 'email',
      icon: Mail,
      autoComplete: 'email',
    },
    {
      key: 'fullName',
      label: t('step1.fullName'),
      placeholder: t('step1.fullNamePlaceholder'),
      type: 'text',
      icon: User,
      autoComplete: 'name',
    },
    {
      key: 'businessName',
      label: t('step1.businessName'),
      placeholder: t('step1.businessNamePlaceholder'),
      type: 'text',
      icon: Building2,
      autoComplete: 'organization',
    },
    {
      key: 'websiteUrl',
      label: t('step1.websiteUrl'),
      placeholder: t('step1.websiteUrlPlaceholder'),
      type: 'url',
      icon: Globe,
      autoComplete: 'url',
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
        <h2 className="text-xl font-semibold text-forge-text">{t('step1.title')}</h2>
        <p className="text-sm text-forge-text-muted mt-1">{t('step1.subtitle')}</p>
      </motion.div>

      <div className="space-y-4">
        {fields.map((field, index) => {
          const Icon = field.icon;
          const hasError = touched[field.key] && errors[field.key as keyof FieldErrors];
          const value = data[field.key as keyof typeof data];

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
                      hasError ? 'text-forge-fail' : value ? 'text-forge-accent' : 'text-forge-text-muted'
                    )}
                  />
                </div>
                <input
                  ref={index === 0 ? firstInputRef : undefined}
                  id={`wizard-${field.key}`}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  placeholder={field.placeholder}
                  value={value}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  onBlur={() => handleBlur(field.key)}
                  className={cn(
                    'w-full bg-forge-card border rounded-xl p-4 pl-11 text-sm text-forge-text',
                    'placeholder:text-forge-text-muted/50',
                    'outline-none transition-all duration-200',
                    'min-h-[44px]',
                    hasError
                      ? 'border-forge-fail focus:border-forge-fail'
                      : 'border-forge-glass-border focus:border-forge-accent'
                  )}
                />
              </div>
              {hasError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-xs text-forge-fail mt-1"
                >
                  {errors[field.key as keyof FieldErrors]}
                </motion.p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function validateStepBusiness(data: {
  email: string;
  fullName: string;
  businessName: string;
  websiteUrl: string;
}): boolean {
  return (
    !!data.email.trim() &&
    validateEmail(data.email) &&
    !!data.fullName.trim() &&
    !!data.businessName.trim() &&
    !!data.websiteUrl.trim() &&
    validateUrl(data.websiteUrl)
  );
}
