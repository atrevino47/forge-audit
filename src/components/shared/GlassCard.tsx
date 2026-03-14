'use client';

import { cn } from '@/lib/utils';
import type { GlassCardProps } from '../../../contracts/component-props';

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        'backdrop-blur-xl bg-forge-glass border border-forge-glass-border rounded-xl p-6',
        'transition-all duration-200',
        hover && 'hover:border-forge-accent/20 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
