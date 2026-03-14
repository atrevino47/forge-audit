import { NextResponse } from 'next/server';
import { parseBody, errorResponse } from '@/app/api/_shared/helpers';
import { reauditReminderSchema } from '@/app/api/_shared/schemas';

export async function POST(request: Request) {
  try {
    const body = await parseBody(request, reauditReminderSchema);

    // TODO Phase 3: Fetch user + reaudit_window from DB
    // TODO Phase 3: Verify reminder hasn't already been sent for this day
    // TODO Phase 3: Call email sender: sendReauditReminder(user, dayNumber)
    // TODO Phase 3: Update reaudit_windows.reminder_dayX_sent = true

    return NextResponse.json({
      userId: body.userId,
      auditId: body.auditId,
      dayNumber: body.dayNumber,
      status: 'queued',
      message: `Re-audit reminder (day ${body.dayNumber}) queued for delivery`,
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('POST /api/email/reaudit-reminder error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to send re-audit reminder', 500);
  }
}
