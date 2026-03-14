'use client';

import { Logo } from '@/components/shared/Logo';
import { GlassCard } from '@/components/shared/GlassCard';
import { ArrowLeftRight } from 'lucide-react';
import Link from 'next/link';

export default function ComparePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-forge-base">
      <div className="w-full max-w-lg text-center">
        <Link href="/" className="inline-block cursor-pointer mb-8">
          <Logo size="lg" />
        </Link>
        <GlassCard className="p-10 rounded-2xl" hover={false}>
          <ArrowLeftRight className="size-10 text-forge-accent mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Re-Audit Comparison</h1>
          <p className="text-sm text-forge-text-muted">
            Side-by-side comparison view will be built in Phase 3.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
