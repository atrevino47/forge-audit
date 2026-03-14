'use client';

import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';
import type { AuditItemProps } from '../../../contracts/component-props';
import type { ItemStatus } from '../../../contracts/audit-types';

const statusConfig: Record<
  ItemStatus,
  { icon: React.ElementType; colorClass: string }
> = {
  pass: { icon: CheckCircle2, colorClass: 'text-forge-pass' },
  fail: { icon: XCircle, colorClass: 'text-forge-fail' },
  warning: { icon: AlertTriangle, colorClass: 'text-forge-warning' },
  info: { icon: Info, colorClass: 'text-forge-text-muted' },
};

export function AuditItem({ item }: AuditItemProps) {
  const t = useTranslations('results');
  const { icon: Icon, colorClass } = statusConfig[item.status];

  return (
    <div className="flex items-start gap-3 py-2.5">
      {/* Status icon */}
      <div className={cn('mt-0.5 shrink-0', colorClass)}>
        <Icon className="size-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-forge-text">
            {item.label}
          </span>
          {/* Value vs benchmark */}
          {item.value !== undefined && (
            <span className="text-xs text-forge-text-muted whitespace-nowrap">
              {item.value}
              {item.benchmark !== undefined && (
                <span className="text-forge-text-muted/60">
                  {' / '}
                  {item.benchmark}
                </span>
              )}
            </span>
          )}
        </div>
        {item.detail && (
          <p className="text-xs text-forge-text-muted mt-0.5 leading-relaxed">
            {item.detail}
          </p>
        )}
      </div>
    </div>
  );
}
