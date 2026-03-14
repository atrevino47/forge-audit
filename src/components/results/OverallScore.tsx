'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useTranslations } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';
import type { OverallScoreProps } from '../../../contracts/component-props';
import type { Grade } from '../../../contracts/audit-types';

function getGradeColor(grade: Grade): string {
  if (grade.startsWith('A')) return 'text-forge-pass';
  if (grade.startsWith('B')) return 'text-forge-accent';
  if (grade.startsWith('C')) return 'text-forge-warning';
  return 'text-forge-fail';
}

function getStrokeColor(grade: Grade): string {
  if (grade.startsWith('A')) return 'var(--forge-pass)';
  if (grade.startsWith('B')) return 'var(--forge-accent)';
  if (grade.startsWith('C')) return 'var(--forge-warning)';
  return 'var(--forge-fail)';
}

const CIRCLE_RADIUS = 88;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
const ANIMATION_DURATION = 1.5;

export function OverallScore({ score, grade, isAnimating }: OverallScoreProps) {
  const t = useTranslations('results');
  const [showGrade, setShowGrade] = useState(false);
  const motionScore = useMotionValue(0);
  const displayScore = useTransform(motionScore, (v) => Math.round(v));
  const [renderedScore, setRenderedScore] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isAnimating || hasAnimated.current) return;
    hasAnimated.current = true;

    const controls = animate(motionScore, score, {
      duration: ANIMATION_DURATION,
      ease: 'easeOut',
    });

    const unsubscribe = displayScore.on('change', (v) => {
      setRenderedScore(v);
    });

    // Show grade after the count-up completes
    const gradeTimer = setTimeout(() => {
      setShowGrade(true);
    }, ANIMATION_DURATION * 1000 + 300);

    return () => {
      controls.stop();
      unsubscribe();
      clearTimeout(gradeTimer);
    };
  }, [isAnimating, score, motionScore, displayScore]);

  const strokeDashoffset = isAnimating
    ? CIRCLE_CIRCUMFERENCE - (renderedScore / 100) * CIRCLE_CIRCUMFERENCE
    : CIRCLE_CIRCUMFERENCE;

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-lg font-medium text-forge-text-muted">
        {t('score.title')}
      </p>

      {/* Circular progress */}
      <div className="relative size-[200px]">
        <svg
          className="size-full -rotate-90"
          viewBox="0 0 200 200"
          fill="none"
        >
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={CIRCLE_RADIUS}
            stroke="var(--forge-card)"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r={CIRCLE_RADIUS}
            stroke={getStrokeColor(grade)}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            className="transition-[stroke-dashoffset] duration-100 ease-out"
          />
        </svg>

        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold tabular-nums text-forge-text">
            {renderedScore}
          </span>
          <span className="text-sm text-forge-text-muted mt-1">
            {t('score.outOf')}
          </span>
        </div>
      </div>

      {/* Grade badge */}
      {showGrade && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <span
            className={cn(
              'inline-flex items-center justify-center size-14 rounded-full border-2 text-xl font-bold',
              getGradeColor(grade),
              grade.startsWith('A') && 'border-forge-pass/30 bg-forge-pass/10',
              grade.startsWith('B') && 'border-forge-accent/30 bg-forge-accent/10',
              grade.startsWith('C') && 'border-forge-warning/30 bg-forge-warning/10',
              (!grade.startsWith('A') && !grade.startsWith('B') && !grade.startsWith('C')) &&
                'border-forge-fail/30 bg-forge-fail/10'
            )}
          >
            {grade}
          </span>
        </motion.div>
      )}
    </div>
  );
}
