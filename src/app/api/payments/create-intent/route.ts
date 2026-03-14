import { NextResponse } from 'next/server';
import { parseBody, errorResponse } from '@/app/api/_shared/helpers';
import { createPaymentIntentSchema } from '@/app/api/_shared/schemas';
import type { CreatePaymentIntentResponse } from '@contracts/api-contracts';
import { PRICING } from '@contracts/constants';

export async function POST(request: Request) {
  try {
    const body = await parseBody(request, createPaymentIntentSchema);

    // TODO Phase 3: requireAuth()
    // TODO Phase 3: Create Stripe PaymentIntent via stripe.paymentIntents.create()
    // TODO Phase 3: Store pending payment in payments table

    const amount = body.productType === 'competitor_analysis'
      ? PRICING.COMPETITOR_ANALYSIS
      : PRICING.REAUDIT_MIN;

    const response: CreatePaymentIntentResponse = {
      clientSecret: `pi_mock_${crypto.randomUUID()}_secret_mock`,
      paymentIntentId: `pi_mock_${crypto.randomUUID()}`,
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
