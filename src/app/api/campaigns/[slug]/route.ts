import { NextResponse } from 'next/server';
import { errorResponse } from '@/app/api/_shared/helpers';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return errorResponse('INVALID_INPUT', 'Campaign slug is required', 400);
    }

    // TODO Phase 2: Fetch campaign from DB by slug
    // TODO Phase 2: Return 404 if not found or inactive/expired
    // TODO Phase 2: Track 'click' event in campaign_analytics

    return NextResponse.json({
      id: crypto.randomUUID(),
      slug,
      name: `Campaign ${slug}`,
      maxCompetitorAnalyses: 10,
      isActive: true,
      expiresAt: null,
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('GET /api/campaigns/[slug] error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch campaign', 500);
  }
}
