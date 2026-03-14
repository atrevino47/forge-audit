import { NextResponse } from 'next/server';
import { parseBody, errorResponse } from '@/app/api/_shared/helpers';
import { startAuditSchema } from '@/app/api/_shared/schemas';
import type { StartAuditResponse } from '@contracts/api-contracts';
import { AUDIT_CATEGORIES } from '@contracts/constants';

export async function POST(request: Request) {
  try {
    const body = await parseBody(request, startAuditSchema);

    // TODO Phase 2: Check rate limits (IP + email)
    // TODO Phase 2: Upsert lead record in DB
    // TODO Phase 2: Create audit + audit_categories rows
    // TODO Phase 2: Dispatch audit engine jobs

    // Mock response
    const mockAuditId = crypto.randomUUID();

    const response: StartAuditResponse = {
      auditId: mockAuditId,
      streamUrl: `/api/audit/status/${mockAuditId}`,
      estimatedTime: AUDIT_CATEGORIES.length * 8, // ~8s per category
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('POST /api/audit/start error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to start audit', 500);
  }
}
