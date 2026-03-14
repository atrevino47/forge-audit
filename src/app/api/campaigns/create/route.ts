import { NextResponse } from 'next/server';
import { parseBody, errorResponse } from '@/app/api/_shared/helpers';
import { createCampaignSchema } from '@/app/api/_shared/schemas';
import type { Campaign } from '@contracts/api-contracts';

function generateSlug(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36)).join('').slice(0, 12);
}

export async function POST(request: Request) {
  try {
    // TODO Phase 2: requireRole('team', 'admin')
    const body = await parseBody(request, createCampaignSchema);

    const slug = generateSlug();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://audit.forgedigital.com';

    // TODO Phase 2: Insert campaign row in DB
    // TODO Phase 2: Link to team_member_id from session

    const mockCampaign: Campaign = {
      id: crypto.randomUUID(),
      slug,
      name: body.name,
      url: `${appUrl}/c/${slug}`,
      maxCompetitorAnalyses: body.maxCompetitorAnalyses,
      isActive: true,
      analytics: {
        clicks: 0,
        auditsStarted: 0,
        auditsCompleted: 0,
        callsBooked: 0,
      },
    };

    return NextResponse.json(mockCampaign, { status: 201 });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('POST /api/campaigns/create error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to create campaign', 500);
  }
}
