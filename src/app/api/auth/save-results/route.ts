import { NextResponse } from 'next/server';
import { parseBody, errorResponse } from '@/app/api/_shared/helpers';
import { saveResultsSchema } from '@/app/api/_shared/schemas';
import type { SaveResultsResponse } from '@contracts/api-contracts';
import { REAUDIT_WINDOW } from '@contracts/constants';
import { requireAuth, AuthError } from '@/lib/auth/guards';
import { createServiceClient } from '@/lib/db/client';

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await parseBody(request, saveResultsSchema);

    const supabase = createServiceClient();

    // Fetch audit, verify it exists
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .select('id, lead_id')
      .eq('id', body.auditId)
      .single();

    if (auditError || !audit) {
      return errorResponse('NOT_FOUND', 'Audit not found', 404);
    }

    // Link audit to the authenticated user
    const { error: updateAuditError } = await supabase
      .from('audits')
      .update({ user_id: session.user.id })
      .eq('id', audit.id);

    if (updateAuditError) {
      console.error('Failed to update audit user_id:', updateAuditError);
      return errorResponse('INTERNAL_ERROR', 'Failed to link audit to user', 500);
    }

    // Upsert user record
    const { error: upsertUserError } = await supabase
      .from('users')
      .upsert(
        {
          id: session.user.id,
          email: session.user.email!,
          full_name:
            session.user.user_metadata?.full_name ??
            session.user.user_metadata?.name ??
            '',
          lead_id: audit.lead_id,
        },
        { onConflict: 'id' }
      );

    if (upsertUserError) {
      console.error('Failed to upsert user:', upsertUserError);
      return errorResponse('INTERNAL_ERROR', 'Failed to save user', 500);
    }

    // Create reaudit window
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + REAUDIT_WINDOW.DURATION_DAYS);

    const { error: windowError } = await supabase
      .from('reaudit_windows')
      .insert({
        audit_id: audit.id,
        user_id: session.user.id,
        opens_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      });

    if (windowError) {
      console.error('Failed to create reaudit window:', windowError);
      return errorResponse('INTERNAL_ERROR', 'Failed to create reaudit window', 500);
    }

    const response: SaveResultsResponse = {
      userId: session.user.id,
      reauditWindow: {
        opensAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (err instanceof AuthError) {
      const status = err.code === 'UNAUTHORIZED' ? 401 : 403;
      return errorResponse(err.code, err.message, status);
    }
    console.error('POST /api/auth/save-results error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to save results', 500);
  }
}
