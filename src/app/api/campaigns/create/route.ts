import { NextResponse } from 'next/server';
import { parseBody, errorResponse } from '@/app/api/_shared/helpers';
import { createCampaignSchema } from '@/app/api/_shared/schemas';
import { createServiceClient } from '@/lib/db';
import { requireRole, AuthError } from '@/lib/auth/guards';
import type { Campaign } from '@contracts/api-contracts';

export async function POST(request: Request) {
  try {
    const session = await requireRole('team', 'admin');
    const supabase = createServiceClient();

    const body = await parseBody(request, createCampaignSchema);

    const slug = crypto.randomUUID().slice(0, 8);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://audit.forgedigital.com';

    const { data: inserted, error } = await supabase
      .from('campaigns')
      .insert({
        name: body.name,
        slug,
        max_competitor_analyses: body.maxCompetitorAnalyses,
        team_member_id: session.user.id,
        expires_at: body.expiresAt ?? null,
        metadata: body.metadata ?? null,
      })
      .select('id, slug, name, max_competitor_analyses, is_active')
      .single();

    if (error || !inserted) {
      console.error('Campaign insert error:', error);
      return errorResponse('INTERNAL_ERROR', 'Failed to create campaign', 500);
    }

    const campaign: Campaign = {
      id: inserted.id as string,
      slug: inserted.slug as string,
      name: inserted.name as string,
      url: `${appUrl}/c/${inserted.slug}`,
      maxCompetitorAnalyses: inserted.max_competitor_analyses as number,
      isActive: inserted.is_active as boolean,
      analytics: {
        clicks: 0,
        auditsStarted: 0,
        auditsCompleted: 0,
        callsBooked: 0,
      },
    };

    return NextResponse.json(campaign, { status: 201 });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (err instanceof AuthError) {
      const status = err.code === 'UNAUTHORIZED' ? 401 : 403;
      return errorResponse(err.code, err.message, status);
    }
    console.error('POST /api/campaigns/create error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to create campaign', 500);
  }
}
