// contracts/component-props.ts
// Shared component prop interfaces — Single source of truth for all agents

import type {
  AuditCategory,
  AuditItem,
  CategoryResult,
  Grade,
  Recommendation,
  SubCategory,
} from './audit-types';
import type { Campaign, LeadListItem } from './api-contracts';

// Results page components
export interface OverallScoreProps {
  score: number;
  grade: Grade;
  isAnimating: boolean;
}

export interface CategoryCardProps {
  result: CategoryResult;
  isExpanded: boolean;
  onToggle: () => void;
}

export interface AuditItemProps {
  item: AuditItem;
}

export interface SubCategoryProps {
  subCategory: SubCategory;
}

export interface ActionPlanProps {
  recommendations: Recommendation[];
}

export interface RecommendationItemProps {
  recommendation: Recommendation;
  index: number;
}

export interface LandingPagePreviewProps {
  pageId: string;
  previewUrl: string;
}

export interface StreamingLoaderProps {
  category: AuditCategory;
  isActive: boolean;
}

export interface ResultsCTAProps {
  auditId: string;
  isAuthenticated: boolean;
  onSaveResults: () => void;
  onCompareCompetitors: () => void;
  onBookCall: () => void;
}

// Wizard components
export interface WizardStepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

// Admin components
export interface MetricCardProps {
  label: string;
  value: number | string;
  trend?: {
    direction: 'up' | 'down' | 'flat';
    percentage: number;
  };
}

export interface LeadTableProps {
  leads: LeadListItem[];
  onLeadClick: (leadId: string) => void;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onSort: (column: string) => void;
}

export interface CampaignCardProps {
  campaign: Campaign;
  onCopyLink: (url: string) => void;
}

// Shared components
export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}
