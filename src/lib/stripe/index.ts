import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

/**
 * Returns a Stripe client instance if STRIPE_SECRET_KEY is configured.
 * Returns null if the key is missing, allowing graceful degradation.
 */
export function getStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2026-02-25.clover',
      typescript: true,
    });
  }

  return stripeInstance;
}

/**
 * Returns the webhook secret, or null if not configured.
 */
export function getWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET ?? null;
}
