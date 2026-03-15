import { NextResponse } from 'next/server';
import { errorResponse, parseBody } from '@/app/api/_shared/helpers';
import { adminLeadsQuerySchema, updateLeadSchema } from '@/app/api/_shared/schemas';
import { createServiceClient } from '@/lib/db';
import { requireRole, AuthError } from '@/lib/auth/guards';
import type { LeadListItem } from '@contracts/api-contracts';

export async function GET(request: Request) {
  try {
    await requireRole('team', 'admin');
    const supabase = createServiceClient();

    const { searchParams } = new URL(request.url);
    const query = adminLeadsQuerySchema.parse(Object.fromEntries(searchParams.entries()));

    // Build leads query with join to audits for score/grade
    let dbQuery = supabase
      .from('leads')
      .select(
        'id, email, full_name, business_name, website_url, status, source, created_at, campaign_id, campaigns(name), audits(overall_score, overall_grade)',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    // Apply filters
    if (query.status) {
      dbQuery = dbQuery.eq('status', query.status);
    }
    if (query.source) {
      dbQuery = dbQuery.eq('source', query.source);
    }
    if (query.search) {
      dbQuery = dbQuery.or(
        `full_name.ilike.%${query.search}%,email.ilike.%${query.search}%,business_name.ilike.%${query.search}%`
      );
    }

    // Pagination
    const offset = (query.page - 1) * query.limit;
    dbQuery = dbQuery.range(offset, offset + query.limit - 1);

    const { data: rows, count } = await dbQuery;

    const leads: LeadListItem[] = (rows ?? []).map((row) => {
      // Get the most recent audit score/grade
      const audits = row.audits as unknown as Array<{ overall_score: number | null; overall_grade: string | null }> | null;
      const latestAudit = audits?.[0] ?? null;
      const campaign = row.campaigns as unknown as { name: string } | null;

      return {
        id: row.id as string,
        email: row.email as string,
        fullName: row.full_name as string,
        businessName: row.business_name as string,
        websiteUrl: row.website_url as string,
        overallScore: latestAudit?.overall_score ?? null,
        grade: latestAudit?.overall_grade ?? null,
        status: row.status as LeadListItem['status'],
        source: (row.source as LeadListItem['source']) ?? 'direct',
        createdAt: row.created_at as string,
        ...(campaign?.name ? { campaignName: campaign.name } : {}),
      };
    });

    const total = count ?? 0;

    return NextResponse.json({
      leads,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (err instanceof AuthError) {
      const status = err.code === 'UNAUTHORIZED' ? 401 : 403;
      return errorResponse(err.code, err.message, status);
    }
    console.error('GET /api/admin/leads error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch leads', 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireRole('team', 'admin');
    const supabase = createServiceClient();
    const body = await parseBody(request, updateLeadSchema);

    const updates: Record<string, string> = {};
    if (body.status) updates.status = body.status;

    if (Object.keys(updates).length === 0) {
      return errorResponse('INVALID_INPUT', 'No fields to update', 400);
    }

    const { data: updated, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', body.leadId)
      .select('id, email, full_name, business_name, website_url, status, source, created_at')
      .single();

    if (error) {
      console.error('Lead update error:', error);
      return errorResponse('INTERNAL_ERROR', 'Failed to update lead', 500);
    }

    if (!updated) {
      return errorResponse('NOT_FOUND', 'Lead not found', 404);
    }

    // If status changed, insert a status_change note
    if (body.status) {
      const authorName =
        (session.user.user_metadata?.full_name as string) ??
        session.user.email ??
        'Team';

      await supabase.from('lead_notes').insert({
        lead_id: body.leadId,
        author_id: session.user.id,
        author_name: authorName,
        content: `Status changed to ${body.status}`,
        note_type: 'status_change',
      });
    }

    return NextResponse.json({
      id: updated.id as string,
      email: updated.email as string,
      fullName: updated.full_name as string,
      businessName: updated.business_name as string,
      websiteUrl: updated.website_url as string,
      status: updated.status as string,
      source: (updated.source as string) ?? 'direct',
      createdAt: updated.created_at as string,
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (err instanceof AuthError) {
      const status = err.code === 'UNAUTHORIZED' ? 401 : 403;
      return errorResponse(err.code, err.message, status);
    }
    console.error('PATCH /api/admin/leads error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to update lead', 500);
  }
}
