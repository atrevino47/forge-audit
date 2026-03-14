import { NextResponse } from 'next/server';
import { errorResponse } from '@/app/api/_shared/helpers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get('payment_intent_id');

    if (!paymentIntentId) {
      return errorResponse('INVALID_INPUT', 'payment_intent_id query parameter is required', 400);
    }

    // TODO Phase 3: requireAuth()
    // TODO Phase 3: Look up payment in payments table by stripe_payment_id
    // TODO Phase 3: Return actual status from Stripe if not in DB

    return NextResponse.json({
      paymentIntentId,
      status: 'completed',
      productType: 'competitor_analysis',
      amount: 9900,
      currency: 'usd',
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('GET /api/payments/verify error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to verify payment', 500);
  }
}
