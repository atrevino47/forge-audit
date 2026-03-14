'use client';

import { motion } from 'framer-motion';
import {
  Building2,
  Share2,
  MapPin,
  Target,
  Pencil,
  Mail,
  User,
  Globe,
  Instagram,
  Facebook,
  Music2,
  Linkedin,
  BarChart3,
  Users,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';
import type { WizardStepProps } from '../../../contracts/component-props';

interface FormData {
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

interface StepLaunchProps extends WizardStepProps {
  data: FormData;
  onGoToStep: (step: number) => void;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.25, ease: 'easeOut' as const },
  }),
};

interface SummaryItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function SummaryItem({ icon: Icon, label, value }: SummaryItemProps) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-1.5">
      <Icon className="w-3.5 h-3.5 text-forge-accent shrink-0 mt-0.5" />
      <div className="min-w-0">
        <span className="text-xs text-forge-text-muted">{label}</span>
        <p className="text-sm text-forge-text truncate">{value}</p>
      </div>
    </div>
  );
}

interface SummarySectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  stepIndex: number;
  onEdit: () => void;
  editLabel: string;
  children: React.ReactNode;
  index: number;
}

function SummarySection({ title, icon: Icon, onEdit, editLabel, children, index }: SummarySectionProps) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
      className="backdrop-blur-xl bg-forge-glass border border-forge-glass-border rounded-xl p-5 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-forge-accent" />
          <h3 className="text-sm font-semibold text-forge-text">{title}</h3>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1.5 text-xs text-forge-accent hover:text-forge-accent-hover cursor-pointer transition-colors duration-200 min-h-[44px] px-2"
        >
          <Pencil className="w-3 h-3" />
          {editLabel}
        </button>
      </div>
      <div className="space-y-1">{children}</div>
    </motion.div>
  );
}

export function StepLaunch({ data, onGoToStep, onNext, onBack, isFirstStep, isLastStep }: StepLaunchProps) {
  const t = useTranslations('wizard');

  const hasSocials =
    data.socials.instagram || data.socials.facebook || data.socials.tiktok || data.socials.linkedin;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="mb-6"
      >
        <h2 className="text-xl font-semibold text-forge-text">{t('step5.title')}</h2>
        <p className="text-sm text-forge-text-muted mt-1">{t('step5.subtitle')}</p>
      </motion.div>

      <div className="space-y-4">
        {/* Business Info */}
        <SummarySection
          title={t('step5.businessInfo')}
          icon={Building2}
          stepIndex={0}
          onEdit={() => onGoToStep(0)}
          editLabel={t('step5.edit')}
          index={0}
        >
          <SummaryItem icon={Mail} label={t('step1.email')} value={data.email} />
          <SummaryItem icon={User} label={t('step1.fullName')} value={data.fullName} />
          <SummaryItem icon={Building2} label={t('step1.businessName')} value={data.businessName} />
          <SummaryItem icon={Globe} label={t('step1.websiteUrl')} value={data.websiteUrl} />
        </SummarySection>

        {/* Social Profiles */}
        <SummarySection
          title={t('step5.socialProfiles')}
          icon={Share2}
          stepIndex={1}
          onEdit={() => onGoToStep(1)}
          editLabel={t('step5.edit')}
          index={1}
        >
          {hasSocials ? (
            <>
              <SummaryItem icon={Instagram} label={t('step2.instagram')} value={data.socials.instagram} />
              <SummaryItem icon={Facebook} label={t('step2.facebook')} value={data.socials.facebook} />
              <SummaryItem icon={Music2} label={t('step2.tiktok')} value={data.socials.tiktok} />
              <SummaryItem icon={Linkedin} label={t('step2.linkedin')} value={data.socials.linkedin} />
            </>
          ) : (
            <p className="text-sm text-forge-text-muted italic">No social profiles provided</p>
          )}
        </SummarySection>

        {/* Google Business */}
        <SummarySection
          title={t('step5.googleBusiness')}
          icon={MapPin}
          stepIndex={2}
          onEdit={() => onGoToStep(2)}
          editLabel={t('step5.edit')}
          index={2}
        >
          {data.gbpUrl ? (
            <SummaryItem icon={MapPin} label={t('step3.gbpUrl')} value={data.gbpUrl} />
          ) : (
            <p className="text-sm text-forge-text-muted italic">No Google Business Profile provided</p>
          )}
        </SummarySection>

        {/* Goals */}
        <SummarySection
          title={t('step5.goals')}
          icon={Target}
          stepIndex={3}
          onEdit={() => onGoToStep(3)}
          editLabel={t('step5.edit')}
          index={3}
        >
          <SummaryItem icon={Target} label={t('step4.industry')} value={data.goals.industry} />
          <SummaryItem icon={BarChart3} label={t('step4.mainChallenge')} value={data.goals.mainChallenge} />
          <SummaryItem icon={Users} label={t('step4.businessSize')} value={data.goals.businessSize} />
        </SummarySection>
      </div>

      {/* Results estimate */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.25, ease: 'easeOut' }}
        className="mt-6 flex items-center justify-center gap-2 text-sm text-forge-text-muted"
      >
        <Clock className="w-4 h-4 text-forge-accent" />
        <span>{t('step5.launchSubtext')}</span>
      </motion.div>

      {/* Shimmer preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="mt-4 space-y-2"
      >
        <div className="h-2 w-3/4 mx-auto rounded-full shimmer" />
        <div className="h-2 w-1/2 mx-auto rounded-full shimmer" />
        <div className="h-2 w-2/3 mx-auto rounded-full shimmer" />
      </motion.div>
    </div>
  );
}
