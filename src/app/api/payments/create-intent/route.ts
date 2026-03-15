import { NextResponse } from 'next/server';
import { parseBody, errorResponse } from '@/app/api/_shared/helpers';
import { createPaymentIntentSchema } from '@/app/api/_shared/schemas';
import { getStripeClient } from '@/lib/stripe';
import { createServiceClient } from '@/lib/db/client';
import type { CreatePaymentIntentResponse } from '@contracts/api-contracts';
import { PRICING } from '@contracts/constants';

export async function POST(request: Request) {
  try {
    const body = await parseBody(request, createPaymentIntentSchema);

    const amount = body.productType === 'competitor_analysis'
      ? PRICING.COMPETITOR_ANALYSIS
      : PRICING.REAUDIT_MIN;

    const stripe = getStripeClient();

    if (!stripe) {
      return errorResponse(
        'STRIPE_NOT_CONFIGURED',
        'Payment processing is not available. STRIPE_SECRET_KEY is missing.',
        503
      );
    }

    // Verify the audit exists
    const supabase = createServiceClient();
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .select('id, lead_id')
      .eq('id', body.auditId)
      .single();

    if (auditError || !audit) {
      return errorResponse('NOT_FOUND', 'Audit not found', 404);
    }

    const leadId = typeof audit.lead_id === 'string' ? audit.lead_id : null;

    // Create the Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        auditId: body.auditId,
        productType: body.productType,
        leadId: leadId ?? '',
      },
    });

    if (!paymentIntent.client_secret) {
      return errorResponse('INTERNAL_ERROR', 'Failed to generate payment client secret', 500);
    }

    // Store pending payment in payments table
    await supabase.from('payments').insert({
      stripe_payment_intent_id: paymentIntent.id,
      audit_id: body.auditId,
      lead_id: leadId,
      amount,
      currency: 'usd',
      product_type: body.productType,
      status: 'pending',
    });

    const response: CreatePaymentIntentResponse = {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      currency: 'usd',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('POST /api/payments/create-intent error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to create payment intent', 500);
  }
}
