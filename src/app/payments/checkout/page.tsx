'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Logo } from '@/components/shared/Logo';
import { GlassCard } from '@/components/shared/GlassCard';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Dynamic import for heavy Stripe dependencies — only loaded when payment form is needed
const StripeCheckoutForm = dynamic(
  () => import('./StripeCheckoutForm').then((mod) => ({ default: mod.StripeCheckoutForm })),
  {
    loading: () => (
      <div className="flex flex-col items-center py-8">
        <Loader2 className="size-8 text-forge-accent animate-spin mb-4" />
        <p className="text-sm text-forge-text-muted">Loading payment form...</p>
      </div>
    ),
    ssr: false,
  }
);

// ── Main checkout page ────────────────────────────────────────────────────────
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-forge-base"><Loader2 className="size-8 text-forge-accent animate-spin" /></div>}>
      <CheckoutPageInner />
    </Suspense>
  );
}

function CheckoutPageInner() {
  const searchParams = useSearchParams();
  const productType = searchParams.get('productType') ?? 'competitor_analysis';
  const auditId = searchParams.get('auditId');
  const status = searchParams.get('status');

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If returned from redirect with success status
    if (status === 'success') {
      setLoading(false);
      return;
    }

    if (!auditId) {
      setError('Missing audit ID. Please start from your audit results page.');
      setLoading(false);
      return;
    }

    async function createIntent() {
      try {
        const res = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productType, auditId }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          const msg =
            data?.error?.message ?? `Payment setup failed (${res.status})`;
          setError(msg);
          setLoading(false);
          return;
        }

        const data = await res.json();
        setClientSecret(data.clientSecret);
        setAmount(data.amount);
        setLoading(false);
      } catch {
        setError('Unable to connect to payment service. Please try again later.');
        setLoading(false);
      }
    }

    createIntent();
  }, [auditId, productType, status]);

  // ── Success redirect state ─────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-forge-base">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block cursor-pointer">
              <Logo size="lg" />
            </Link>
          </div>
          <GlassCard className="p-8 rounded-2xl" hover={false}>
            <CheckCircle className="size-12 text-green-400 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-center mb-2 text-forge-text">
              Payment Successful
            </h1>
            <p className="text-sm text-forge-text-muted text-center">
              Your payment has been processed. You will receive a confirmation shortly.
            </p>
          </GlassCard>
        </div>
      </div>
    );
  }

  // ── Loading / Error / Payment form ─────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-forge-base">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block cursor-pointer">
            <Logo size="lg" />
          </Link>
        </div>
        <GlassCard className="p-8 rounded-2xl" hover={false}>
          {loading ? (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="size-8 text-forge-accent animate-spin mb-4" />
              <p className="text-sm text-forge-text-muted">Setting up payment...</p>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <AlertCircle className="size-8 text-red-400 mx-auto mb-4" />
              <h1 className="text-xl font-semibold mb-2 text-forge-text">
                Payment Error
              </h1>
              <p className="text-sm text-red-300 mb-4">{error}</p>
              <Link
                href="/"
                className="text-sm text-forge-accent hover:underline"
              >
                Return home
              </Link>
            </div>
          ) : clientSecret ? (
            <StripeCheckoutForm
              clientSecret={clientSecret}
              amount={amount}
              productType={productType}
            />
          ) : null}
        </GlassCard>
      </div>
    </div>
  );
}
