'use client';

import { Logo } from '@/components/shared/Logo';
import { GlassCard } from '@/components/shared/GlassCard';
import { Shield, Lock } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-forge-base">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block cursor-pointer">
            <Logo size="lg" />
          </Link>
        </div>
        <GlassCard className="p-8 rounded-2xl" hover={false}>
          <h1 className="text-xl font-semibold text-center mb-2">Checkout</h1>
          <p className="text-sm text-forge-text-muted text-center mb-8">
            Stripe Elements payment form will be integrated in Phase 3.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-forge-text-muted">
            <span className="flex items-center gap-1">
              <Shield className="size-3" />
              Secure payment
            </span>
            <span className="flex items-center gap-1">
              <Lock className="size-3" />
              SSL encrypted
            </span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
