import { NextResponse } from 'next/server';
import { parseBody, errorResponse } from '@/app/api/_shared/helpers';
import { generateLandingPageSchema } from '@/app/api/_shared/schemas';
import type { GenerateLandingPageResponse } from '@contracts/api-contracts';

export async function POST(request: Request) {
  try {
    const body = await parseBody(request, generateLandingPageSchema);

    // TODO Phase 2: Fetch audit results for context
    // TODO Phase 2: Call AI/Copy agent's landing page generator
    // TODO Phase 2: Store generated HTML in generated_pages table
    // TODO Phase 2: Push SSE event 'landing_page_ready'

    const mockPageId = crypto.randomUUID();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://audit.forgedigital.com';

    const response: GenerateLandingPageResponse = {
      pageId: mockPageId,
      previewUrl: `${appUrl}/preview/${mockPageId}`,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('POST /api/landing-page/generate error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to generate landing page', 500);
  }
}
