'use client';

import { useCallback, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import type { StripeElementsOptions } from '@stripe/stripe-js';
import { Shield, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// ── Product display info ──────────────────────────────────────────────────────
const PRODUCT_INFO: Record<string, { label: string; description: string }> = {
  competitor_analysis: {
    label: 'Competitor Analysis',
    description: 'Deep-dive competitive analysis comparing your digital presence against a key competitor.',
  },
  reaudit: {
    label: 'Re-Audit',
    description: 'Full re-audit of your digital presence to measure improvements and identify new opportunities.',
  },
};

function formatAmount(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ── Stripe promise (lazy singleton) ───────────────────────────────────────────
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

// ── Payment form (rendered inside Elements provider) ──────────────────────────
function PaymentForm({
  amount,
  productType,
}: {
  amount: number;
  productType: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!stripe || !elements) return;

      setIsProcessing(true);
      setError(null);

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payments/checkout?status=success`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message ?? 'Payment failed. Please try again.');
        setIsProcessing(false);
      } else {
        setSucceeded(true);
        setIsProcessing(false);
      }
    },
    [stripe, elements]
  );

  if (succeeded) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="size-12 text-green-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-forge-text mb-2">Payment Successful</h2>
        <p className="text-sm text-forge-text-muted">
          Your payment has been processed. You will receive a confirmation shortly.
        </p>
      </div>
    );
  }

  const info = PRODUCT_INFO[productType];

  return (
    <form onSubmit={handleSubmit}>
      {/* Order summary */}
      <div className="mb-6 pb-6 border-b border-forge-glass-border">
        <h2 className="text-sm font-medium text-forge-text-muted mb-1">
          {info?.label ?? 'Payment'}
        </h2>
        <p className="text-xs text-forge-text-muted mb-3">
          {info?.description ?? ''}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-forge-text">Total</span>
          <span className="text-lg font-semibold text-forge-accent">
            {formatAmount(amount)}
          </span>
        </div>
      </div>

      {/* Stripe PaymentElement */}
      <div className="mb-6">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full py-3 px-4 bg-forge-accent text-forge-base font-semibold rounded-lg
                   hover:bg-forge-accent/90 button-micro hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                   flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ${formatAmount(amount)}`
        )}
      </button>

      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-forge-text-muted">
        <span className="flex items-center gap-1">
          <Shield className="size-3" />
          Secure payment
        </span>
        <span className="flex items-center gap-1">
          <Lock className="size-3" />
          SSL encrypted
        </span>
      </div>
    </form>
  );
}

// ── Exported Stripe checkout wrapper ──────────────────────────────────────────
interface StripeCheckoutFormProps {
  clientSecret: string;
  amount: number;
  productType: string;
}

export function StripeCheckoutForm({ clientSecret, amount, productType }: StripeCheckoutFormProps) {
  if (!stripePromise) {
    return (
      <div className="text-center py-4">
        <AlertCircle className="size-8 text-forge-accent mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-forge-text">
          Payments Not Configured
        </h2>
        <p className="text-sm text-forge-text-muted">
          The payment system is not set up yet. Please contact support or try again later.
        </p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={
        {
          clientSecret,
          appearance: {
            theme: 'night',
            variables: {
              colorPrimary: '#D4A537',
              colorBackground: '#0B1120',
              colorText: '#e2e8f0',
              colorDanger: '#ef4444',
              fontFamily: 'system-ui, sans-serif',
              borderRadius: '8px',
            },
          },
        } satisfies StripeElementsOptions
      }
    >
      <PaymentForm amount={amount} productType={productType} />
    </Elements>
  );
}
