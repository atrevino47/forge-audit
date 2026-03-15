import { NextResponse } from 'next/server';
import { errorResponse } from '@/app/api/_shared/helpers';
import { getStripeClient, getWebhookSecret } from '@/lib/stripe';
import { createServiceClient } from '@/lib/db/client';
import type Stripe from 'stripe';

export async function POST(request: Request) {
  try {
    const stripe = getStripeClient();
    const webhookSecret = getWebhookSecret();

    if (!stripe || !webhookSecret) {
      return errorResponse(
        'STRIPE_NOT_CONFIGURED',
        'Stripe webhook processing is not available. STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET is missing.',
        503
      );
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return errorResponse('INVALID_INPUT', 'Missing Stripe signature', 400);
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown verification error';
      console.error('Webhook signature verification failed:', message);
      return errorResponse('INVALID_SIGNATURE', 'Webhook signature verification failed', 400);
    }

    const supabase = createServiceClient();

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { error } = await supabase
          .from('payments')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (error) {
          console.error('Failed to update payment status:', error);
        } else {
          console.log('Payment completed:', paymentIntent.id);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { error } = await supabase
          .from('payments')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (error) {
          console.error('Failed to update payment status to failed:', error);
        } else {
          console.log('Payment failed:', paymentIntent.id);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = typeof charge.payment_intent === 'string'
          ? charge.payment_intent
          : charge.payment_intent?.id;

        if (paymentIntentId) {
          const { error } = await supabase
            .from('payments')
            .update({ status: 'refunded', updated_at: new Date().toISOString() })
            .eq('stripe_payment_intent_id', paymentIntentId);

          if (error) {
            console.error('Failed to update payment status to refunded:', error);
          } else {
            console.log('Payment refunded:', paymentIntentId);
          }
        }
        break;
      }

      default:
        console.log('Unhandled webhook event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('POST /api/payments/webhook error:', err);
    return errorResponse('INTERNAL_ERROR', 'Webhook processing failed', 500);
  }
}
