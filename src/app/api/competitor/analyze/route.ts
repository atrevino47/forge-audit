import { NextResponse } from 'next/server';
import { parseBody, errorResponse } from '@/app/api/_shared/helpers';
import { competitorAnalyzeSchema } from '@/app/api/_shared/schemas';

export async function POST(request: Request) {
  try {
    const body = await parseBody(request, competitorAnalyzeSchema);

    // TODO Phase 2: Verify audit exists
    // TODO Phase 2: If campaignSlug, validate campaign + check max analyses
    // TODO Phase 2: If no campaign, verify payment via paymentIntentId
    // TODO Phase 2: Create competitor_analyses row
    // TODO Phase 2: Dispatch competitor analysis job

    const mockAnalysisId = crypto.randomUUID();

    return NextResponse.json(
      {
        analysisId: mockAnalysisId,
        auditId: body.auditId,
        competitorUrl: body.competitorUrl,
        status: 'pending',
        estimatedTime: 30,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('POST /api/competitor/analyze error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to start competitor analysis', 500);
  }
}
