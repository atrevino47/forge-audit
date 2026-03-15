'use client';

import { cn } from '@/lib/utils';
import type { GlassCardProps } from '../../../contracts/component-props';

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        'backdrop-blur-xl bg-forge-glass border border-forge-glass-border rounded-xl p-6',
        'card-hover-lift',
        hover && 'hover:border-forge-accent/20 hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.15),0_0_12px_rgba(212,165,55,0.06)] cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
