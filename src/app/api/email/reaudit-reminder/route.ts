import { NextResponse } from 'next/server';
import { errorResponse } from '@/app/api/_shared/helpers';
import { createServiceClient } from '@/lib/db/client';
import { REAUDIT_WINDOW } from '@contracts/constants';

/**
 * GET /api/email/reaudit-reminder
 * Cron job endpoint: finds reaudit_windows where a reminder is due
 * (day 3, 10, or 13 has passed and the corresponding flag is still false).
 * Marks them as sent after processing.
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return errorResponse('UNAUTHORIZED', 'Invalid cron secret', 401);
    }

    const supabase = createServiceClient();
    const now = new Date();

    // Define reminder schedule
    const reminderSchedule = [
      {
        dayNumber: REAUDIT_WINDOW.REMINDER_DAY_3,
        sentColumn: 'reminder_day3_sent' as const,
      },
      {
        dayNumber: REAUDIT_WINDOW.REMINDER_DAY_10,
        sentColumn: 'reminder_day10_sent' as const,
      },
      {
        dayNumber: REAUDIT_WINDOW.REMINDER_DAY_13,
        sentColumn: 'reminder_day13_sent' as const,
      },
    ];

    const remindersDue: Array<{
      windowId: string;
      auditId: string;
      userId: string;
      dayNumber: number;
    }> = [];

    for (const reminder of reminderSchedule) {
      // Calculate the cutoff: windows opened more than N days ago
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - reminder.dayNumber);
      const cutoffISO = cutoff.toISOString();

      const { data: windows, error } = await supabase
        .from('reaudit_windows')
        .select('id, audit_id, user_id, opens_at')
        .eq('used', false)
        .eq(reminder.sentColumn, false)
        .lt('opens_at', cutoffISO)
        .gt('expires_at', now.toISOString()); // window has not expired

      if (error) {
        console.error(`Failed to query reaudit windows for day ${reminder.dayNumber}:`, error);
        continue;
      }

      if (!windows || windows.length === 0) continue;

      // TODO: For each window, send the reminder email via Resend

      // Mark as sent
      const windowIds = windows.map((w) => w.id);

      const { error: updateError } = await supabase
        .from('reaudit_windows')
        .update({ [reminder.sentColumn]: true })
        .in('id', windowIds);

      if (updateError) {
        console.error(`Failed to mark day ${reminder.dayNumber} reminders as sent:`, updateError);
        continue;
      }

      for (const w of windows) {
        remindersDue.push({
          windowId: w.id,
          auditId: w.audit_id,
          userId: w.user_id,
          dayNumber: reminder.dayNumber,
        });
      }
    }

    return NextResponse.json({
      count: remindersDue.length,
      reminders: remindersDue,
      message: `Processed ${remindersDue.length} reaudit reminder(s)`,
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('GET /api/email/reaudit-reminder error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to process reaudit reminders', 500);
  }
}
