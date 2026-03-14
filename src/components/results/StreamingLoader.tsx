'use client';

import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';
import { GlassCard } from '@/components/shared/GlassCard';
import type { StreamingLoaderProps } from '../../../contracts/component-props';
import { CATEGORY_LABELS } from '../../../contracts/constants';

export function StreamingLoader({ category, isActive }: StreamingLoaderProps) {
  const t = useTranslations('results');
  const label = CATEGORY_LABELS[category].en;

  return (
    <GlassCard className="relative overflow-hidden" hover={false}>
      <div className="flex items-center gap-3 mb-4">
        {/* Pulsing gold dot when active */}
        <div
          className={cn(
            'size-2.5 rounded-full transition-colors duration-300',
            isActive
              ? 'bg-forge-accent animate-pulse'
              : 'bg-forge-text-muted/30'
          )}
        />
        <span className="text-sm font-medium text-forge-text-muted">
          {label}
        </span>
      </div>

      {/* Shimmer skeleton bars */}
      <div className="space-y-3">
        <div className="h-4 w-3/4 rounded shimmer" />
        <div className="h-3 w-full rounded shimmer" />
        <div className="h-3 w-5/6 rounded shimmer" />
        <div className="h-3 w-2/3 rounded shimmer" />
      </div>

      {/* Score skeleton */}
      <div className="mt-4 flex items-center gap-2">
        <div className="h-2 flex-1 rounded-full bg-forge-card" />
        <div className="h-4 w-10 rounded shimmer" />
      </div>
    </GlassCard>
  );
}
