import { NextResponse } from 'next/server';
import { errorResponse } from '@/app/api/_shared/helpers';

export async function GET(request: Request) {
  try {
    // TODO Phase 2: requireRole('team', 'admin')
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaign_id');

    if (!campaignId) {
      return errorResponse('INVALID_INPUT', 'campaign_id query parameter is required', 400);
    }

    // TODO Phase 2: Fetch aggregated analytics from campaign_analytics table
    // TODO Phase 2: Verify caller has access to this campaign

    return NextResponse.json({
      campaignId,
      summary: {
        totalClicks: 142,
        auditsStarted: 87,
        auditsCompleted: 64,
        callsBooked: 12,
        conversionRate: 0.138,
      },
      timeline: [
        { date: '2026-03-07', clicks: 23, auditsStarted: 14, auditsCompleted: 10, callsBooked: 2 },
        { date: '2026-03-08', clicks: 31, auditsStarted: 19, auditsCompleted: 15, callsBooked: 3 },
        { date: '2026-03-09', clicks: 28, auditsStarted: 17, auditsCompleted: 12, callsBooked: 2 },
        { date: '2026-03-10', clicks: 18, auditsStarted: 11, auditsCompleted: 8, callsBooked: 1 },
        { date: '2026-03-11', clicks: 22, auditsStarted: 13, auditsCompleted: 10, callsBooked: 2 },
        { date: '2026-03-12', clicks: 20, auditsStarted: 13, auditsCompleted: 9, callsBooked: 2 },
      ],
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('GET /api/campaigns/analytics error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch campaign analytics', 500);
  }
}
