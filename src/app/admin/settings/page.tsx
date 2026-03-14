'use client';

import { Logo } from '@/components/shared/Logo';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-forge-base">
      <header className="border-b border-forge-glass-border px-6 py-4 flex items-center justify-between">
        <Logo size="sm" />
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin/dashboard" className="text-forge-text-muted hover:text-forge-text transition-colors cursor-pointer">Dashboard</Link>
          <Link href="/admin/leads" className="text-forge-text-muted hover:text-forge-text transition-colors cursor-pointer">Leads</Link>
          <Link href="/admin/campaigns" className="text-forge-text-muted hover:text-forge-text transition-colors cursor-pointer">Campaigns</Link>
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>
        <p className="text-sm text-forge-text-muted text-center">
          Settings will be built in Phase 3.
        </p>
      </main>
    </div>
  );
}
