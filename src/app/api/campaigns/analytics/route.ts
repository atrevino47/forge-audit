import { NextResponse } from 'next/server';
import { errorResponse } from '@/app/api/_shared/helpers';
import { createServiceClient } from '@/lib/db';
import { requireRole, AuthError } from '@/lib/auth/guards';

interface CampaignAnalyticsItem {
  campaignId: string;
  clicks: number;
  auditsStarted: number;
  auditsCompleted: number;
  callsBooked: number;
}

export async function GET(request: Request) {
  try {
    await requireRole('team', 'admin');
    const supabase = createServiceClient();

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaign_id');

    // Build base query — select campaign_id and event_type from campaign_analytics
    let dbQuery = supabase
      .from('campaign_analytics')
      .select('campaign_id, event_type');

    // Optionally filter by a specific campaign
    if (campaignId) {
      dbQuery = dbQuery.eq('campaign_id', campaignId);
    }

    const { data: rows, error } = await dbQuery;

    if (error) {
      console.error('Campaign analytics fetch error:', error);
      return errorResponse('INTERNAL_ERROR', 'Failed to fetch campaign analytics', 500);
    }

    // Group by campaign_id and count events per type
    const grouped = new Map<string, { clicks: number; auditsStarted: number; auditsCompleted: number; callsBooked: number }>();

    for (const row of rows ?? []) {
      const cid = row.campaign_id as string;
      const eventType = row.event_type as string;

      if (!grouped.has(cid)) {
        grouped.set(cid, { clicks: 0, auditsStarted: 0, auditsCompleted: 0, callsBooked: 0 });
      }

      const entry = grouped.get(cid)!;
      switch (eventType) {
        case 'click':
          entry.clicks++;
          break;
        case 'audit_started':
          entry.auditsStarted++;
          break;
        case 'audit_completed':
          entry.auditsCompleted++;
          break;
        case 'call_booked':
          entry.callsBooked++;
          break;
      }
    }

    const analytics: CampaignAnalyticsItem[] = [];
    for (const [cid, counts] of grouped) {
      analytics.push({
        campaignId: cid,
        ...counts,
      });
    }

    return NextResponse.json({ analytics });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (err instanceof AuthError) {
      const status = err.code === 'UNAUTHORIZED' ? 401 : 403;
      return errorResponse(err.code, err.message, status);
    }
    console.error('GET /api/campaigns/analytics error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch campaign analytics', 500);
  }
}
