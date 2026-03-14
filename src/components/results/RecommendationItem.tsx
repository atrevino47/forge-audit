'use client';

import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';
import type { RecommendationItemProps } from '../../../contracts/component-props';

export function RecommendationItem({ recommendation, index }: RecommendationItemProps) {
  const t = useTranslations('results');

  const priorityConfig = {
    high: {
      label: t('priority.high'),
      className: 'bg-forge-fail/15 text-forge-fail border-forge-fail/20',
    },
    medium: {
      label: t('priority.medium'),
      className: 'bg-forge-warning/15 text-forge-warning border-forge-warning/20',
    },
    low: {
      label: t('priority.low'),
      className: 'bg-forge-text-muted/15 text-forge-text-muted border-forge-text-muted/20',
    },
  };

  const effortConfig = {
    'quick-win': {
      label: t('effort.quickWin'),
      className: 'bg-forge-pass/15 text-forge-pass border-forge-pass/20',
    },
    moderate: {
      label: t('effort.moderate'),
      className: 'bg-forge-warning/15 text-forge-warning border-forge-warning/20',
    },
    'major-project': {
      label: t('effort.majorProject'),
      className: 'bg-forge-fail/15 text-forge-fail border-forge-fail/20',
    },
  };

  const impactConfig = {
    high: {
      label: t('impact.high'),
      className: 'bg-forge-pass/15 text-forge-pass border-forge-pass/20',
    },
    medium: {
      label: t('impact.medium'),
      className: 'bg-forge-warning/15 text-forge-warning border-forge-warning/20',
    },
    low: {
      label: t('impact.low'),
      className: 'bg-forge-text-muted/15 text-forge-text-muted border-forge-text-muted/20',
    },
  };

  const priority = priorityConfig[recommendation.priority];
  const effort = effortConfig[recommendation.effort];
  const impact = impactConfig[recommendation.impact];

  return (
    <div className="flex gap-4 py-4">
      {/* Index number */}
      <div className="size-7 rounded-full bg-forge-accent/10 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-xs font-bold text-forge-accent tabular-nums">
          {index + 1}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-forge-text mb-1">
          {recommendation.title}
        </h4>
        <p className="text-xs text-forge-text-muted leading-relaxed mb-3">
          {recommendation.description}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border',
              priority.className
            )}
          >
            {priority.label}
          </span>
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border',
              effort.className
            )}
          >
            {effort.label}
          </span>
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border',
              impact.className
            )}
          >
            {impact.label}
          </span>
        </div>
      </div>
    </div>
  );
}
