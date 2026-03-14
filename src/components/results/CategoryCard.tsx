'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Globe,
  Share2,
  Palette,
  MapPin,
  Target,
  Star,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';
import { GlassCard } from '@/components/shared/GlassCard';
import { AuditItem } from './AuditItem';
import type { CategoryCardProps } from '../../../contracts/component-props';
import type { AuditCategory, Grade } from '../../../contracts/audit-types';
import { CATEGORY_LABELS } from '../../../contracts/constants';

const categoryIcons: Record<AuditCategory, React.ElementType> = {
  seo: Search,
  website: Globe,
  social: Share2,
  branding: Palette,
  gbp: MapPin,
  ads: Target,
  reputation: Star,
};

function scoreToGradeLetter(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  return 'D';
}

function getScoreBarColor(score: number): string {
  if (score >= 90) return 'bg-forge-pass';
  if (score >= 80) return 'bg-forge-accent';
  if (score >= 70) return 'bg-forge-warning';
  return 'bg-forge-fail';
}

function getScoreTextColor(score: number): string {
  if (score >= 90) return 'text-forge-pass';
  if (score >= 80) return 'text-forge-accent';
  if (score >= 70) return 'text-forge-warning';
  return 'text-forge-fail';
}

export function CategoryCard({ result, isExpanded, onToggle }: CategoryCardProps) {
  const t = useTranslations('results');
  const Icon = categoryIcons[result.category];
  const label = CATEGORY_LABELS[result.category].en;

  return (
    <GlassCard className="p-0 overflow-hidden" hover={false}>
      {/* Header — clickable */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 cursor-pointer text-left transition-colors duration-200 hover:bg-forge-accent/5"
      >
        {/* Category icon */}
        <div className="size-10 rounded-lg bg-forge-accent/10 flex items-center justify-center shrink-0">
          <Icon className="size-5 text-forge-accent" />
        </div>

        {/* Name + score bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-semibold text-forge-text truncate">
              {label}
            </span>
            <span
              className={cn(
                'text-sm font-bold tabular-nums ml-2',
                getScoreTextColor(result.score)
              )}
            >
              {result.score}
              <span className="text-forge-text-muted/60 font-normal">/100</span>
            </span>
          </div>
          {/* Score bar */}
          <div className="h-1.5 w-full rounded-full bg-forge-card overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', getScoreBarColor(result.score))}
              initial={{ width: 0 }}
              animate={{ width: `${result.score}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown className="size-4 text-forge-text-muted" />
        </motion.div>
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-forge-glass-border">
              {result.subCategories.map((sub) => (
                <div key={sub.name} className="mt-4">
                  {/* Sub-category header */}
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-forge-text-muted">
                      {sub.name}
                    </h4>
                    <span className="text-xs text-forge-text-muted tabular-nums">
                      {sub.score}/100
                    </span>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-forge-glass-border/50">
                    {sub.items.map((item) => (
                      <AuditItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
