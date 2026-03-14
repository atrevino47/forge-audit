'use client';

import { BarChart3, Users, TrendingUp, DollarSign } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { Logo } from '@/components/shared/Logo';
import Link from 'next/link';

const metrics = [
  { label: 'Total Audits', value: '—', icon: BarChart3 },
  { label: 'Total Leads', value: '—', icon: Users },
  { label: 'Conversion Rate', value: '—', icon: TrendingUp },
  { label: 'Revenue', value: '—', icon: DollarSign },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-forge-base">
      <header className="border-b border-forge-glass-border px-6 py-4 flex items-center justify-between">
        <Logo size="sm" />
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin/dashboard" className="text-forge-accent font-medium cursor-pointer">Dashboard</Link>
          <Link href="/admin/leads" className="text-forge-text-muted hover:text-forge-text transition-colors cursor-pointer">Leads</Link>
          <Link href="/admin/campaigns" className="text-forge-text-muted hover:text-forge-text transition-colors cursor-pointer">Campaigns</Link>
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <GlassCard key={metric.label} hover={false}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-forge-text-muted mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
                <metric.icon className="size-5 text-forge-accent" />
              </div>
            </GlassCard>
          ))}
        </div>
        <p className="mt-8 text-sm text-forge-text-muted text-center">
          Admin dashboard will be fully built in Phase 3.
        </p>
      </main>
    </div>
  );
}
