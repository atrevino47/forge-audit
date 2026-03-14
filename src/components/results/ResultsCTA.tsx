'use client';

import { Bookmark, BarChart3, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/GlassCard';
import type { ResultsCTAProps } from '../../../contracts/component-props';

export function ResultsCTA({
  auditId,
  isAuthenticated,
  onSaveResults,
  onCompareCompetitors,
  onBookCall,
}: ResultsCTAProps) {
  const t = useTranslations('results');

  return (
    <>
      {/* Desktop: inline section */}
      <section className="hidden md:block mt-8">
        <GlassCard hover={false} className="flex items-center gap-6">
          {/* Save Results */}
          {!isAuthenticated && (
            <div className="flex-1">
              <button
                type="button"
                onClick={onSaveResults}
                className="w-full cursor-pointer rounded-lg bg-forge-accent hover:bg-forge-accent-hover text-forge-base font-semibold py-3 px-5 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Bookmark className="size-4" />
                {t('cta.save')}
              </button>
              <p className="text-xs text-forge-text-muted mt-2 text-center">
                {t('cta.saveDescription')}
              </p>
            </div>
          )}

          {/* Compare with Competitors */}
          <div className="flex-1">
            <button
              type="button"
              onClick={onCompareCompetitors}
              className="w-full cursor-pointer rounded-lg border border-forge-glass-border hover:border-forge-accent/30 bg-transparent text-forge-text font-semibold py-3 px-5 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <BarChart3 className="size-4" />
              {t('cta.compare')}
              <span className="ml-1 text-[10px] font-bold bg-forge-accent/15 text-forge-accent px-1.5 py-0.5 rounded-full">
                {t('cta.comparePrice')}
              </span>
            </button>
            <p className="text-xs text-forge-text-muted mt-2 text-center">
              {t('cta.compareDescription')}
            </p>
          </div>

          {/* Book a Call */}
          <div className="flex-1">
            <button
              type="button"
              onClick={onBookCall}
              className="w-full cursor-pointer rounded-lg bg-transparent text-forge-accent hover:text-forge-accent-hover font-medium py-3 px-5 transition-colors duration-200 flex items-center justify-center gap-2 underline-offset-4 hover:underline"
            >
              <Phone className="size-4" />
              {t('cta.bookCall')}
            </button>
            <p className="text-xs text-forge-text-muted mt-2 text-center">
              {t('cta.bookCallDescription')}
            </p>
          </div>
        </GlassCard>
      </section>

      {/* Mobile: sticky bottom bar */}
      <div className="fixed bottom-0 inset-x-0 md:hidden z-50">
        <div className="backdrop-blur-xl bg-forge-base/90 border-t border-forge-glass-border px-4 py-3 flex items-center gap-2">
          {/* Save */}
          {!isAuthenticated && (
            <button
              type="button"
              onClick={onSaveResults}
              className="flex-1 cursor-pointer rounded-lg bg-forge-accent hover:bg-forge-accent-hover text-forge-base font-semibold py-2.5 px-3 transition-colors duration-200 flex items-center justify-center gap-1.5 text-sm"
            >
              <Bookmark className="size-3.5" />
              {t('cta.save')}
            </button>
          )}

          {/* Compare */}
          <button
            type="button"
            onClick={onCompareCompetitors}
            className="flex-1 cursor-pointer rounded-lg border border-forge-glass-border hover:border-forge-accent/30 text-forge-text font-semibold py-2.5 px-3 transition-colors duration-200 flex items-center justify-center gap-1.5 text-sm"
          >
            <BarChart3 className="size-3.5" />
            {t('cta.compare')}
          </button>

          {/* Call */}
          <button
            type="button"
            onClick={onBookCall}
            className="cursor-pointer text-forge-accent hover:text-forge-accent-hover transition-colors duration-200 p-2.5"
            aria-label={t('cta.bookCall')}
          >
            <Phone className="size-4" />
          </button>
        </div>
      </div>
    </>
  );
}
