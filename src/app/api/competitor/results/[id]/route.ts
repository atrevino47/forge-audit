import { NextResponse } from 'next/server';
import { errorResponse } from '@/app/api/_shared/helpers';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return errorResponse('INVALID_INPUT', 'Analysis ID is required', 400);
    }

    // TODO Phase 2: Fetch competitor_analyses row
    // TODO Phase 2: Return 404 if not found, 202 if still running

    return NextResponse.json({
      id,
      auditId: crypto.randomUUID(),
      competitorUrl: 'https://competitor-example.com',
      competitorName: 'Competitor Example',
      status: 'completed',
      scores: {
        seo: { yours: 72, theirs: 81, gap: -9 },
        website: { yours: 65, theirs: 78, gap: -13 },
        social: { yours: 58, theirs: 45, gap: 13 },
        branding: { yours: 74, theirs: 69, gap: 5 },
        gbp: { yours: 70, theirs: 82, gap: -12 },
        ads: { yours: 62, theirs: 55, gap: 7 },
        reputation: { yours: 75, theirs: 88, gap: -13 },
      },
      gaps: [
        {
          category: 'website',
          description: 'Competitor has significantly faster load times and better mobile experience.',
          opportunity: 'Optimizing page speed could close this gap quickly.',
          priority: 'high',
        },
        {
          category: 'reputation',
          description: 'Competitor has 3x more reviews with a higher average rating.',
          opportunity: 'Implement a review request system to increase volume.',
          priority: 'high',
        },
      ],
      createdAt: new Date(Date.now() - 30000).toISOString(),
      completedAt: new Date().toISOString(),
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('GET /api/competitor/results/[id] error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch competitor results', 500);
  }
}
