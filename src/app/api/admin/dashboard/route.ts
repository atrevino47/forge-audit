import { NextResponse } from 'next/server';
import { errorResponse } from '@/app/api/_shared/helpers';
import type { AdminDashboardResponse } from '@contracts/api-contracts';

export async function GET() {
  try {
    // TODO Phase 2: requireRole('team', 'admin')
    // TODO Phase 2: Aggregate real metrics from DB

    const response: AdminDashboardResponse = {
      totalAudits: 342,
      totalLeads: 289,
      conversionRate: 0.087,
      totalRevenue: 4950_00, // $4,950 in cents
      recentActivity: [
        {
          id: crypto.randomUUID(),
          type: 'audit_completed',
          description: 'Audit completed for cafeluna.mx — Score: 72 (C+)',
          timestamp: '2026-03-14T10:30:00Z',
        },
        {
          id: crypto.randomUUID(),
          type: 'lead_captured',
          description: 'New lead: Ana Martínez (Yoga Flow Studio)',
          timestamp: '2026-03-13T16:45:00Z',
        },
        {
          id: crypto.randomUUID(),
          type: 'payment_received',
          description: 'Competitor analysis purchased — $99.00',
          timestamp: '2026-03-13T14:20:00Z',
        },
        {
          id: crypto.randomUUID(),
          type: 'call_booked',
          description: 'Strategy call booked: Carlos Rodríguez (TechMTY)',
          timestamp: '2026-03-12T11:00:00Z',
        },
      ],
    };

    return NextResponse.json(response);
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('GET /api/admin/dashboard error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch dashboard data', 500);
  }
}
