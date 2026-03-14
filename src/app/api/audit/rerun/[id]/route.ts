import { NextResponse } from 'next/server';
import { parseBody, errorResponse } from '@/app/api/_shared/helpers';
import { rerunAuditSchema } from '@/app/api/_shared/schemas';
import type { StartAuditResponse } from '@contracts/api-contracts';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: originalAuditId } = await params;
    const body = await parseBody(request, rerunAuditSchema);

    if (!originalAuditId) {
      return errorResponse('INVALID_INPUT', 'Original audit ID is required', 400);
    }

    // TODO Phase 2: Verify original audit exists
    // TODO Phase 2: Check reaudit window (free if within 14 days + authed)
    // TODO Phase 2: If outside window, verify payment via body.paymentIntentId
    // TODO Phase 2: Create new audit row with is_reaudit=true, parent_audit_id
    // TODO Phase 2: Dispatch audit engine jobs

    const mockNewAuditId = crypto.randomUUID();

    const response: StartAuditResponse = {
      auditId: mockNewAuditId,
      streamUrl: `/api/audit/status/${mockNewAuditId}`,
      estimatedTime: 56,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('POST /api/audit/rerun/[id] error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to start re-audit', 500);
  }
}
