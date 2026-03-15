import { NextResponse } from 'next/server';
import { errorResponse } from '@/app/api/_shared/helpers';
import { createServiceClient } from '@/lib/db';
import { requireRole, AuthError } from '@/lib/auth/guards';
import type { AdminDashboardResponse, AdminActivityItem } from '@contracts/api-contracts';

export async function GET() {
  try {
    await requireRole('team', 'admin');
    const supabase = createServiceClient();

    // Total audits count
    const { count: totalAudits } = await supabase
      .from('audits')
      .select('*', { count: 'exact', head: true });

    // Total leads count
    const { count: totalLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

    // Total revenue from completed payments (amount in cents)
    const { data: paymentRows } = await supabase
      .from('payments')
      .select('amount_cents')
      .eq('status', 'completed');

    const totalRevenue = (paymentRows ?? []).reduce(
      (sum, row) => sum + (row.amount_cents as number),
      0
    );

    // Conversion rate: leads who booked a call or paid / total leads
    const { count: convertedCount } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .in('status', ['qualified', 'closed']);

    const safeLeads = totalLeads ?? 0;
    const conversionRate = safeLeads > 0
      ? (convertedCount ?? 0) / safeLeads
      : 0;

    // Recent activity: last 10 completed audits
    const { data: recentAudits } = await supabase
      .from('audits')
      .select('id, overall_score, overall_grade, completed_at, lead_id, leads(full_name, business_name)')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(10);

    const recentActivity: AdminActivityItem[] = (recentAudits ?? []).map((audit) => {
      const lead = audit.leads as unknown as { full_name: string; business_name: string } | null;
      const name = lead?.business_name ?? 'Unknown';
      const score = audit.overall_score ?? 0;
      const grade = audit.overall_grade ?? '?';
      return {
        id: audit.id as string,
        type: 'audit_completed' as const,
        description: `Audit completed for ${name} — Score: ${score} (${grade})`,
        timestamp: (audit.completed_at as string) ?? new Date().toISOString(),
      };
    });

    const response: AdminDashboardResponse = {
      totalAudits: totalAudits ?? 0,
      totalLeads: safeLeads,
      conversionRate: Math.round(conversionRate * 1000) / 1000,
      totalRevenue,
      recentActivity,
    };

    return NextResponse.json(response);
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (err instanceof AuthError) {
      const status = err.code === 'UNAUTHORIZED' ? 401 : 403;
      return errorResponse(err.code, err.message, status);
    }
    console.error('GET /api/admin/dashboard error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch dashboard data', 500);
  }
}
