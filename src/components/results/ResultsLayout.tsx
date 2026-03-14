'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useTranslations } from '@/hooks/use-translations';
import { GlassCard } from '@/components/shared/GlassCard';
import { StreamingLoader } from './StreamingLoader';
import { OverallScore } from './OverallScore';
import { CategoryCard } from './CategoryCard';
import { ActionPlan } from './ActionPlan';
import { LandingPagePreview } from './LandingPagePreview';
import { ResultsCTA } from './ResultsCTA';
import { SaveResultsModal } from './SaveResultsModal';
import type { SSEEvent } from '../../../contracts/events';
import type {
  AuditCategory,
  CategoryResult,
  Grade,
  Recommendation,
} from '../../../contracts/audit-types';
import { AUDIT_CATEGORIES } from '../../../contracts/constants';

type CategoryState = 'pending' | 'loading' | 'completed' | 'failed';

interface CategoryEntry {
  state: CategoryState;
  result?: CategoryResult;
  error?: string;
}

interface ResultsLayoutProps {
  auditId: string;
}

export function ResultsLayout({ auditId }: ResultsLayoutProps) {
  const t = useTranslations('results');
  const tc = useTranslations('common');

  // Category states
  const [categories, setCategories] = useState<Record<AuditCategory, CategoryEntry>>(() => {
    const initial = {} as Record<AuditCategory, CategoryEntry>;
    for (const cat of AUDIT_CATEGORIES) {
      initial[cat] = { state: 'pending' };
    }
    return initial;
  });

  // Overall results
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [actionPlan, setActionPlan] = useState<Recommendation[]>([]);
  const [isScoreAnimating, setIsScoreAnimating] = useState(false);

  // Landing page
  const [landingPage, setLandingPage] = useState<{
    pageId: string;
    previewUrl: string;
  } | null>(null);

  // UI state
  const [expandedCategory, setExpandedCategory] = useState<AuditCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // SSE connection ref
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(`/api/audit/status/${auditId}`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data: SSEEvent = JSON.parse(event.data);

        switch (data.type) {
          case 'category_started':
            setCategories((prev) => ({
              ...prev,
              [data.category]: { state: 'loading' },
            }));
            break;

          case 'category_completed':
            setCategories((prev) => ({
              ...prev,
              [data.category]: {
                state: 'completed',
                result: data.results,
              },
            }));
            break;

          case 'category_failed':
            setCategories((prev) => ({
              ...prev,
              [data.category]: {
                state: 'failed',
                error: data.error,
              },
            }));
            break;

          case 'overall_completed':
            setOverallScore(data.overallScore);
            setGrade(data.grade);
            setActionPlan(data.actionPlan);
            // Trigger score animation after a short delay
            setTimeout(() => setIsScoreAnimating(true), 200);
            eventSource.close();
            break;

          case 'landing_page_ready':
            setLandingPage({
              pageId: data.pageId,
              previewUrl: data.previewUrl,
            });
            break;

          case 'error':
            setGlobalError(data.message);
            eventSource.close();
            break;
        }
      } catch {
        // Malformed SSE data — ignore
      }
    };

    eventSource.onerror = () => {
      // EventSource will auto-reconnect for transient errors.
      // If the connection is fully closed, we stop.
      if (eventSource.readyState === EventSource.CLOSED) {
        setGlobalError('Connection lost. Please refresh the page.');
      }
    };

    return () => {
      eventSource.close();
    };
  }, [auditId]);

  // Handlers
  const handleToggleCategory = useCallback((category: AuditCategory) => {
    setExpandedCategory((prev) => (prev === category ? null : category));
  }, []);

  const handleSaveResults = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCompareCompetitors = useCallback(() => {
    window.location.href = `/compare/${auditId}`;
  }, [auditId]);

  const handleBookCall = useCallback(() => {
    window.open('https://cal.com/forgedigital/strategy', '_blank', 'noopener,noreferrer');
  }, []);

  // Derive completed categories in display order
  const completedCategories = AUDIT_CATEGORIES.filter(
    (cat) => categories[cat].state === 'completed'
  );
  const loadingCategories = AUDIT_CATEGORIES.filter(
    (cat) => categories[cat].state === 'loading'
  );
  const pendingCategories = AUDIT_CATEGORIES.filter(
    (cat) => categories[cat].state === 'pending'
  );
  const failedCategories = AUDIT_CATEGORIES.filter(
    (cat) => categories[cat].state === 'failed'
  );

  const isAuditRunning =
    loadingCategories.length > 0 || pendingCategories.length > 0;

  return (
    <div className="min-h-screen bg-forge-base">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 md:pb-8">
        {/* Header */}
        <div className="text-center mb-10">
          {isAuditRunning ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <Loader2 className="size-5 text-forge-accent animate-spin" />
                <h1 className="text-2xl sm:text-3xl font-bold text-forge-text">
                  {t('loading.title')}
                </h1>
              </div>
              <p className="text-sm text-forge-text-muted">
                {t('loading.subtitle')}
              </p>
            </motion.div>
          ) : overallScore !== null && grade !== null ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <OverallScore
                score={overallScore}
                grade={grade}
                isAnimating={isScoreAnimating}
              />
            </motion.div>
          ) : null}
        </div>

        {/* Global error */}
        {globalError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <GlassCard hover={false} className="border-forge-fail/30">
              <div className="flex items-center gap-3">
                <AlertCircle className="size-5 text-forge-fail shrink-0" />
                <p className="text-sm text-forge-fail">{globalError}</p>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Category breakdown title */}
        {(completedCategories.length > 0 || loadingCategories.length > 0) && (
          <h2 className="text-xl font-bold text-forge-text mb-4">
            {t('categories.title')}
          </h2>
        )}

        {/* Category cards + loaders */}
        <div className="space-y-3 mb-8">
          {AUDIT_CATEGORIES.map((cat, i) => {
            const entry = categories[cat];

            if (entry.state === 'completed' && entry.result) {
              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: 0.1,
                    ease: 'easeOut',
                  }}
                >
                  <CategoryCard
                    result={entry.result}
                    isExpanded={expandedCategory === cat}
                    onToggle={() => handleToggleCategory(cat)}
                  />
                </motion.div>
              );
            }

            if (entry.state === 'loading' || entry.state === 'pending') {
              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <StreamingLoader
                    category={cat}
                    isActive={entry.state === 'loading'}
                  />
                </motion.div>
              );
            }

            if (entry.state === 'failed') {
              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard hover={false} className="border-forge-fail/20">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="size-4 text-forge-fail shrink-0" />
                      <span className="text-sm text-forge-text-muted">
                        {entry.error ?? 'Failed to analyze this category'}
                      </span>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            }

            return null;
          })}
        </div>

        {/* Action Plan */}
        {actionPlan.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mb-8"
          >
            <ActionPlan recommendations={actionPlan} />
          </motion.div>
        )}

        {/* Landing Page Preview */}
        {landingPage && (
          <div className="mb-8">
            <LandingPagePreview
              pageId={landingPage.pageId}
              previewUrl={landingPage.previewUrl}
            />
          </div>
        )}

        {/* CTA Section — only show when audit is done */}
        {!isAuditRunning && overallScore !== null && (
          <ResultsCTA
            auditId={auditId}
            isAuthenticated={false}
            onSaveResults={handleSaveResults}
            onCompareCompetitors={handleCompareCompetitors}
            onBookCall={handleBookCall}
          />
        )}
      </div>

      {/* Save Results Modal */}
      <SaveResultsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        auditId={auditId}
      />
    </div>
  );
}
