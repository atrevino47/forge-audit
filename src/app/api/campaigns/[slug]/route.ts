import { NextResponse } from 'next/server';
import { errorResponse } from '@/app/api/_shared/helpers';
import { createServiceClient } from '@/lib/db/client';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return errorResponse('INVALID_INPUT', 'Campaign slug is required', 400);
    }

    const supabase = createServiceClient();

    // Fetch campaign from DB by slug
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('id, slug, name, max_competitor_analyses, is_active, created_at, expires_at, metadata')
      .eq('slug', slug)
      .single();

    if (error || !campaign) {
      return errorResponse('NOT_FOUND', 'Campaign not found', 404);
    }

    // Check if campaign is active and not expired
    if (!campaign.is_active) {
      return errorResponse('GONE', 'This campaign is no longer active', 410);
    }

    if (campaign.expires_at && new Date(campaign.expires_at) < new Date()) {
      return errorResponse('GONE', 'This campaign has expired', 410);
    }

    // Track 'click' event in campaign_analytics (fire-and-forget)
    supabase
      .from('campaign_analytics')
      .insert({
        campaign_id: campaign.id,
        event_type: 'click',
        metadata: { slug },
      })
      .then(({ error: analyticsError }) => {
        if (analyticsError) {
          console.error('Failed to track campaign click:', analyticsError);
        }
      });

    return NextResponse.json({
      id: campaign.id,
      slug: campaign.slug,
      name: campaign.name,
      maxCompetitorAnalyses: campaign.max_competitor_analyses,
      isActive: campaign.is_active,
      expiresAt: campaign.expires_at,
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('GET /api/campaigns/[slug] error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch campaign', 500);
  }
}
