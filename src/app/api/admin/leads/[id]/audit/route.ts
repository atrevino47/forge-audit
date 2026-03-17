import { NextResponse } from 'next/server';
import { errorResponse } from '@/app/api/_shared/helpers';
import { createServiceClient } from '@/lib/db';
import { requireRole, AuthError } from '@/lib/auth/guards';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole('team', 'admin');
    const { id } = await params;
    const supabase = createServiceClient();

    // Fetch the most recent audit for this lead
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .select('id, status, overall_score, overall_grade, created_at, completed_at, inputs, language')
      .eq('lead_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (auditError) {
      console.error('Audit fetch error:', auditError);
      return errorResponse('INTERNAL_ERROR', 'Failed to fetch audit', 500);
    }

    if (!audit) {
      return NextResponse.json({ audit: null });
    }

    // Fetch category results for this audit
    const { data: categories, error: catError } = await supabase
      .from('audit_categories')
      .select('category, status, score, results')
      .eq('audit_id', audit.id);

    if (catError) {
      console.error('Audit categories fetch error:', catError);
      return errorResponse('INTERNAL_ERROR', 'Failed to fetch audit categories', 500);
    }

    return NextResponse.json({
      audit: {
        id: audit.id as string,
        status: audit.status as string,
        overallScore: audit.overall_score as number | null,
        overallGrade: audit.overall_grade as string | null,
        createdAt: audit.created_at as string,
        completedAt: audit.completed_at as string | null,
        inputs: audit.inputs as Record<string, unknown>,
        categories: (categories ?? []).map((c) => ({
          category: c.category as string,
          status: c.status as string,
          score: c.score as number | null,
          results: c.results as Record<string, unknown> | null,
        })),
      },
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (err instanceof AuthError) {
      const status = err.code === 'UNAUTHORIZED' ? 401 : 403;
      return errorResponse(err.code, err.message, status);
    }
    console.error('GET /api/admin/leads/[id]/audit error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch audit', 500);
  }
}
