import { NextResponse } from 'next/server';
import { errorResponse } from '@/app/api/_shared/helpers';
import { createServiceClient } from '@/lib/db/client';

/**
 * GET /api/email/abandoned
 * Cron job endpoint: finds leads with abandoned audits (pending/running for 30+ minutes)
 * and returns them. Actual Resend sending will be configured later.
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

    // Find audits that have been pending or running for more than 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data: abandonedAudits, error } = await supabase
      .from('audits')
      .select(`
        id,
        status,
        created_at,
        lead_id,
        leads!inner (
          id,
          email,
          full_name,
          business_name
        )
      `)
      .in('status', ['pending', 'running'])
      .lt('created_at', thirtyMinutesAgo);

    if (error) {
      console.error('Failed to query abandoned audits:', error);
      return errorResponse('INTERNAL_ERROR', 'Failed to query abandoned audits', 500);
    }

    // TODO: For each lead, call sendAbandonedAudit(lead) via Resend
    // TODO: Mark leads as notified to prevent duplicate sends

    const leads = (abandonedAudits ?? []).map((audit) => ({
      auditId: audit.id,
      auditStatus: audit.status,
      createdAt: audit.created_at,
      leadId: audit.lead_id,
      lead: audit.leads,
    }));

    return NextResponse.json({
      count: leads.length,
      leads,
      message: `Found ${leads.length} abandoned audit(s) eligible for email`,
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('GET /api/email/abandoned error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to process abandoned audits', 500);
  }
}
