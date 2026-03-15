'use client';

import { useEffect, useState, useCallback } from 'react';
import { BarChart3, Users, TrendingUp, DollarSign, RefreshCw } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { Logo } from '@/components/shared/Logo';
import Link from 'next/link';
import type { AdminDashboardResponse, AdminActivityItem } from '@contracts/api-contracts';

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

function MetricCard({ label, value, icon: Icon }: MetricCardProps) {
  return (
    <GlassCard hover={false}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-forge-text-muted mb-1">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className="size-5 text-forge-accent" />
      </div>
    </GlassCard>
  );
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const activityTypeLabels: Record<AdminActivityItem['type'], string> = {
  audit_completed: 'Audit',
  lead_captured: 'Lead',
  call_booked: 'Call',
  payment_received: 'Payment',
};

export default function DashboardPage() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? `Request failed (${res.status})`);
      }
      const json: AdminDashboardResponse = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="min-h-screen bg-forge-base">
      <header className="border-b border-forge-glass-border px-6 py-4 flex items-center justify-between">
        <Logo size="sm" />
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin/dashboard" className="text-forge-accent font-medium cursor-pointer">Dashboard</Link>
          <Link href="/admin/leads" className="text-forge-text-muted hover:text-forge-text transition-colors cursor-pointer">Leads</Link>
          <Link href="/admin/campaigns" className="text-forge-text-muted hover:text-forge-text transition-colors cursor-pointer">Campaigns</Link>
          <Link href="/admin/settings" className="text-forge-text-muted hover:text-forge-text transition-colors cursor-pointer">Settings</Link>
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-forge-text-muted hover:text-forge-text transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <GlassCard hover={false} className="mb-6 border-red-500/30">
            <p className="text-sm text-red-400">{error}</p>
          </GlassCard>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Audits"
            value={loading ? '...' : String(data?.totalAudits ?? 0)}
            icon={BarChart3}
          />
          <MetricCard
            label="Total Leads"
            value={loading ? '...' : String(data?.totalLeads ?? 0)}
            icon={Users}
          />
          <MetricCard
            label="Conversion Rate"
            value={loading ? '...' : formatPercent(data?.conversionRate ?? 0)}
            icon={TrendingUp}
          />
          <MetricCard
            label="Revenue"
            value={loading ? '...' : formatCurrency(data?.totalRevenue ?? 0)}
            icon={DollarSign}
          />
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          {loading ? (
            <GlassCard hover={false}>
              <p className="text-sm text-forge-text-muted text-center py-4">Loading activity...</p>
            </GlassCard>
          ) : (data?.recentActivity?.length ?? 0) === 0 ? (
            <GlassCard hover={false}>
              <p className="text-sm text-forge-text-muted text-center py-4">No recent activity yet.</p>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {data?.recentActivity.map((item) => (
                <GlassCard key={item.id} hover={false} className="py-3 px-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-forge-accent bg-forge-accent/10 rounded px-2 py-0.5">
                        {activityTypeLabels[item.type]}
                      </span>
                      <p className="text-sm truncate">{item.description}</p>
                    </div>
                    <span className="shrink-0 text-xs text-forge-text-muted">{formatTimestamp(item.timestamp)}</span>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
