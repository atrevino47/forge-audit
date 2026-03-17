'use client';

import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const sizeMap = {
  sm: 'size-5',
  md: 'size-6',
  lg: 'size-8',
};

const textSizeMap = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
};

export function Logo({ className, size = 'md', showText = true }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <Flame
          className={cn(sizeMap[size], 'text-forge-accent')}
          strokeWidth={2.5}
        />
      </div>
      {showText && (
        <span className={cn(textSizeMap[size], 'font-display font-bold tracking-tight text-forge-text')}>
          Forge
          <span className="text-forge-accent">Audit</span>
        </span>
      )}
    </div>
  );
}
