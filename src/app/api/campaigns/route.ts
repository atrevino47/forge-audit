import { NextResponse } from 'next/server';
import { errorResponse } from '@/app/api/_shared/helpers';
import { createServiceClient } from '@/lib/db';
import { requireRole, AuthError } from '@/lib/auth/guards';
import type { Campaign } from '@contracts/api-contracts';

export async function GET() {
  try {
    await requireRole('team', 'admin');
    const supabase = createServiceClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://audit.forgedigital.com';

    const { data: rows, error } = await supabase
      .from('campaigns')
      .select('id, slug, name, max_competitor_analyses, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Campaigns fetch error:', error);
      return errorResponse('INTERNAL_ERROR', 'Failed to fetch campaigns', 500);
    }

    // For each campaign, fetch analytics counts
    const campaigns: Campaign[] = await Promise.all(
      (rows ?? []).map(async (row) => {
        const { count: clicks } = await supabase
          .from('campaign_analytics')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', row.id)
          .eq('event_type', 'click');

        const { count: auditsStarted } = await supabase
          .from('campaign_analytics')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', row.id)
          .eq('event_type', 'audit_started');

        const { count: auditsCompleted } = await supabase
          .from('campaign_analytics')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', row.id)
          .eq('event_type', 'audit_completed');

        const { count: callsBooked } = await supabase
          .from('campaign_analytics')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', row.id)
          .eq('event_type', 'call_booked');

        return {
          id: row.id as string,
          slug: row.slug as string,
          name: row.name as string,
          url: `${appUrl}/c/${row.slug}`,
          maxCompetitorAnalyses: row.max_competitor_analyses as number,
          isActive: row.is_active as boolean,
          analytics: {
            clicks: clicks ?? 0,
            auditsStarted: auditsStarted ?? 0,
            auditsCompleted: auditsCompleted ?? 0,
            callsBooked: callsBooked ?? 0,
          },
        };
      })
    );

    return NextResponse.json({ campaigns });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (err instanceof AuthError) {
      const status = err.code === 'UNAUTHORIZED' ? 401 : 403;
      return errorResponse(err.code, err.message, status);
    }
    console.error('GET /api/campaigns error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch campaigns', 500);
  }
}
