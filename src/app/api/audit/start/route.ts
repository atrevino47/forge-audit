import { NextResponse } from 'next/server';
import { parseBody, errorResponse } from '@/app/api/_shared/helpers';
import { startAuditSchema } from '@/app/api/_shared/schemas';
import type { StartAuditResponse } from '@contracts/api-contracts';
import { AUDIT_CATEGORIES } from '@contracts/constants';
import { createServiceClient } from '@/lib/db/client';
import { runAudit } from '@/lib/audit/orchestrator';
import { checkRateLimit, recordAuditUsage } from '@/lib/audit/rate-limiter';

export async function POST(request: Request) {
  try {
    const body = await parseBody(request, startAuditSchema);

    // ── Get client IP ───────────────────────────────────────────────────────
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      '0.0.0.0';

    // ── Rate-limit check ────────────────────────────────────────────────────
    const rateCheck = await checkRateLimit(body.email, ip);
    if (!rateCheck.allowed) {
      return errorResponse('RATE_LIMITED', rateCheck.reason ?? 'Rate limit exceeded', 429);
    }

    const supabase = createServiceClient();

    // ── Upsert lead ─────────────────────────────────────────────────────────
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .upsert(
        {
          email: body.email,
          full_name: body.fullName,
          business_name: body.businessName,
          website_url: body.websiteUrl,
          language: body.language,
          source: body.campaignSlug ? 'campaign' : 'organic',
          campaign_id: body.campaignSlug ?? null,
          ip_address: ip,
        },
        { onConflict: 'email' },
      )
      .select('id')
      .single();

    if (leadError || !lead) {
      console.error('Lead upsert failed:', leadError);
      return errorResponse('INTERNAL_ERROR', 'Failed to create lead', 500);
    }

    // ── Create audit row ────────────────────────────────────────────────────
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .insert({
        lead_id: lead.id,
        status: 'pending',
        inputs: body,
        language: body.language,
      })
      .select('id')
      .single();

    if (auditError || !audit) {
      console.error('Audit insert failed:', auditError);
      return errorResponse('INTERNAL_ERROR', 'Failed to create audit', 500);
    }

    const auditId: string = audit.id;

    // ── Fire-and-forget: run orchestrator in background ─────────────────────
    runAudit(auditId, body).catch(console.error);

    // ── Fire-and-forget: record rate-limit usage ────────────────────────────
    recordAuditUsage(body.email, ip).catch(console.error);

    // ── Respond ─────────────────────────────────────────────────────────────
    const response: StartAuditResponse = {
      auditId,
      streamUrl: `/api/audit/status/${auditId}`,
      estimatedTime: AUDIT_CATEGORIES.length * 8, // ~8s per category
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('POST /api/audit/start error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to start audit', 500);
  }
}
