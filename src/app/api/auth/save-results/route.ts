import { NextResponse } from 'next/server';
import { parseBody, errorResponse } from '@/app/api/_shared/helpers';
import { saveResultsSchema } from '@/app/api/_shared/schemas';
import type { SaveResultsResponse } from '@contracts/api-contracts';
import { REAUDIT_WINDOW } from '@contracts/constants';

export async function POST(request: Request) {
  try {
    const body = await parseBody(request, saveResultsSchema);

    // TODO Phase 2: requireAuth() — user must be logged in
    // TODO Phase 2: Fetch audit, verify it exists and is completed
    // TODO Phase 2: Link audit.user_id to current user
    // TODO Phase 2: Link lead to user
    // TODO Phase 2: Create reaudit_windows row

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + REAUDIT_WINDOW.DURATION_DAYS);

    const response: SaveResultsResponse = {
      userId: crypto.randomUUID(),
      reauditWindow: {
        opensAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('POST /api/auth/save-results error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to save results', 500);
  }
}
