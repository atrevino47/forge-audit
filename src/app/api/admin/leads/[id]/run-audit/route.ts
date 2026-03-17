import { NextResponse, after } from 'next/server';
import { errorResponse } from '@/app/api/_shared/helpers';
import { createServiceClient } from '@/lib/db';
import { requireRole, AuthError } from '@/lib/auth/guards';
import { runAudit } from '@/lib/audit/orchestrator';
import type { StartAuditRequest } from '@contracts/api-contracts';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole('team', 'admin');
    const { id } = await params;
    const supabase = createServiceClient();

    // Fetch the lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id, email, full_name, business_name, website_url, language')
      .eq('id', id)
      .single();

    if (leadError || !lead) {
      return errorResponse('NOT_FOUND', 'Lead not found', 404);
    }

    // Check if there's already a running/pending audit for this lead
    const { data: existingAudit } = await supabase
      .from('audits')
      .select('id, status')
      .eq('lead_id', id)
      .in('status', ['running', 'pending'])
      .limit(1)
      .maybeSingle();

    if (existingAudit) {
      return errorResponse(
        'CONFLICT',
        'Audit already in progress',
        409
      );
    }

    // Build StartAuditRequest from lead data
    const startAuditRequest: StartAuditRequest = {
      email: lead.email as string,
      fullName: lead.full_name as string,
      businessName: lead.business_name as string,
      websiteUrl: lead.website_url as string,
      socials: {},
      gbpUrl: '',
      goals: {
        industry: 'Unknown',
        mainChallenge: 'General improvement',
        businessSize: 'Unknown',
      },
      language: (lead.language as 'en' | 'es') ?? 'en',
    };

    // Create new audit row
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .insert({
        lead_id: lead.id as string,
        status: 'pending',
        inputs: startAuditRequest,
        language: startAuditRequest.language,
      })
      .select('id')
      .single();

    if (auditError || !audit) {
      console.error('Audit insert failed:', auditError);
      return errorResponse('INTERNAL_ERROR', 'Failed to create audit', 500);
    }

    const auditId: string = audit.id as string;

    // Fire audit in the background after response
    after(async () => {
      await runAudit(auditId, startAuditRequest).catch(console.error);
    });

    return NextResponse.json(
      { auditId, message: 'Audit started' },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (err instanceof AuthError) {
      const status = err.code === 'UNAUTHORIZED' ? 401 : 403;
      return errorResponse(err.code, err.message, status);
    }
    console.error('POST /api/admin/leads/[id]/run-audit error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to start audit', 500);
  }
}
