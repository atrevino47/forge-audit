import { NextResponse } from 'next/server';
import { errorResponse } from '@/app/api/_shared/helpers';
import { adminLeadsQuerySchema } from '@/app/api/_shared/schemas';
import type { LeadListItem } from '@contracts/api-contracts';

export async function GET(request: Request) {
  try {
    // TODO Phase 2: requireRole('team', 'admin')
    const { searchParams } = new URL(request.url);
    const query = adminLeadsQuerySchema.parse(Object.fromEntries(searchParams.entries()));

    // TODO Phase 2: Query leads table with pagination, filters, search
    // TODO Phase 2: Join with audits for score/grade

    const mockLeads: LeadListItem[] = [
      {
        id: crypto.randomUUID(),
        email: 'maria@example.com',
        fullName: 'María García',
        businessName: 'Café Luna',
        websiteUrl: 'https://cafeluna.mx',
        overallScore: 72,
        grade: 'C+',
        status: 'new',
        source: 'organic',
        createdAt: '2026-03-12T14:30:00Z',
      },
      {
        id: crypto.randomUUID(),
        email: 'carlos@example.com',
        fullName: 'Carlos Rodríguez',
        businessName: 'TechMTY',
        websiteUrl: 'https://techmty.com',
        overallScore: 45,
        grade: 'D-',
        status: 'contacted',
        source: 'campaign',
        createdAt: '2026-03-11T09:15:00Z',
        campaignName: 'LinkedIn Q1',
      },
      {
        id: crypto.randomUUID(),
        email: 'ana@example.com',
        fullName: 'Ana Martínez',
        businessName: 'Yoga Flow Studio',
        websiteUrl: 'https://yogaflow.com',
        overallScore: null,
        grade: null,
        status: 'new',
        source: 'direct',
        createdAt: '2026-03-13T16:45:00Z',
      },
    ];

    return NextResponse.json({
      leads: mockLeads,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: 156,
        totalPages: Math.ceil(156 / query.limit),
      },
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('GET /api/admin/leads error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch leads', 500);
  }
}
