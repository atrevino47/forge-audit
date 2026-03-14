import { NextResponse } from 'next/server';
import { errorResponse } from '@/app/api/_shared/helpers';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return errorResponse('INVALID_INPUT', 'Missing Stripe signature', 400);
    }

    // TODO Phase 3: Verify webhook signature with Stripe SDK
    // TODO Phase 3: Handle events:
    //   - payment_intent.succeeded → update payments table, unlock feature
    //   - payment_intent.payment_failed → update payments table
    //   - charge.refunded → mark payment as refunded

    console.log('Stripe webhook received (mock mode):', {
      bodyLength: body.length,
      hasSignature: !!signature,
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('POST /api/payments/webhook error:', err);
    return errorResponse('INTERNAL_ERROR', 'Webhook processing failed', 500);
  }
}
