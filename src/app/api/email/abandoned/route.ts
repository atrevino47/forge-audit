import { NextResponse } from 'next/server';
import { parseBody, errorResponse } from '@/app/api/_shared/helpers';
import { abandonedEmailSchema } from '@/app/api/_shared/schemas';

export async function POST(request: Request) {
  try {
    const body = await parseBody(request, abandonedEmailSchema);

    // TODO Phase 3: Fetch lead from DB
    // TODO Phase 3: Check if audit was actually abandoned (started but not completed)
    // TODO Phase 3: Call email sender: sendAbandonedAudit(lead)
    // TODO Phase 3: Mark lead as notified to prevent duplicate sends

    return NextResponse.json({
      leadId: body.leadId,
      status: 'queued',
      message: 'Abandoned audit email queued for delivery',
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('POST /api/email/abandoned error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to send abandoned email', 500);
  }
}
