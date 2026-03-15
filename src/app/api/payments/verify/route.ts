import { NextResponse } from 'next/server';
import { errorResponse } from '@/app/api/_shared/helpers';
import { createServiceClient } from '@/lib/db/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get('payment_intent_id');

    if (!paymentIntentId) {
      return errorResponse('INVALID_INPUT', 'payment_intent_id query parameter is required', 400);
    }

    const supabase = createServiceClient();

    const { data: payment, error } = await supabase
      .from('payments')
      .select('id, stripe_payment_id, status, product_type, amount_cents, currency, created_at')
      .eq('stripe_payment_id', paymentIntentId)
      .single();

    if (error || !payment) {
      return errorResponse('NOT_FOUND', 'Payment not found', 404);
    }

    return NextResponse.json({
      paymentIntentId: payment.stripe_payment_id,
      status: payment.status,
      productType: payment.product_type,
      amount: payment.amount_cents,
      currency: payment.currency,
      createdAt: payment.created_at,
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('GET /api/payments/verify error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to verify payment', 500);
  }
}
