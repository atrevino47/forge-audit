'use client';

import { useEffect, useState, useCallback } from 'react';
import { Copy, Check, Plus, Link as LinkIcon, BarChart3 } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { Logo } from '@/components/shared/Logo';
import Link from 'next/link';
import type { Campaign } from '@contracts/api-contracts';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formMax, setFormMax] = useState(10);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Copy state
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/campaigns');
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? `Request failed (${res.status})`);
      }
      const json = await res.json() as { campaigns: Campaign[] };
      setCampaigns(json.campaigns);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/campaigns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          maxCompetitorAnalyses: formMax,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? `Request failed (${res.status})`);
      }
      const newCampaign: Campaign = await res.json();
      setCampaigns((prev) => [newCampaign, ...prev]);
      setFormName('');
      setFormMax(10);
      setShowForm(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create campaign');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = async (campaign: Campaign) => {
    try {
      await navigator.clipboard.writeText(campaign.url);
      setCopiedSlug(campaign.slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch {
      // Fallback: ignore clipboard errors
    }
  };

  return (
    <div className="min-h-screen bg-forge-base">
      <header className="border-b border-forge-glass-border px-6 py-4 flex items-center justify-between">
        <Logo size="sm" />
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin/dashboard" className="text-forge-text-muted hover:text-forge-text transition-colors cursor-pointer">Dashboard</Link>
          <Link href="/admin/leads" className="text-forge-text-muted hover:text-forge-text transition-colors cursor-pointer">Leads</Link>
          <Link href="/admin/campaigns" className="text-forge-accent font-medium cursor-pointer">Campaigns</Link>
          <Link href="/admin/settings" className="text-forge-text-muted hover:text-forge-text transition-colors cursor-pointer">Settings</Link>
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-forge-accent text-forge-base text-sm font-semibold hover:bg-forge-accent/90 transition-colors"
          >
            <Plus className="size-4" />
            New Campaign
          </button>
        </div>

        {error && (
          <GlassCard hover={false} className="mb-6 border-red-500/30">
            <p className="text-sm text-red-400">{error}</p>
          </GlassCard>
        )}

        {/* Create Campaign Form */}
        {showForm && (
          <GlassCard hover={false} className="mb-6">
            <h3 className="text-sm font-semibold mb-4">Create New Campaign</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="campaign-name" className="block text-xs text-forge-text-muted mb-1">Campaign Name</label>
                <input
                  id="campaign-name"
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. LinkedIn Q1 2026"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-forge-glass border border-forge-glass-border text-sm text-forge-text placeholder:text-forge-text-muted focus:outline-none focus:border-forge-accent/40"
                />
              </div>
              <div>
                <label htmlFor="campaign-max" className="block text-xs text-forge-text-muted mb-1">Max Free Competitor Analyses</label>
                <input
                  id="campaign-max"
                  type="number"
                  min={1}
                  max={100}
                  value={formMax}
                  onChange={(e) => setFormMax(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-forge-glass border border-forge-glass-border text-sm text-forge-text focus:outline-none focus:border-forge-accent/40"
                />
              </div>
              {createError && <p className="text-sm text-red-400">{createError}</p>}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-lg bg-forge-accent text-forge-base text-sm font-semibold hover:bg-forge-accent/90 disabled:opacity-50 transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Campaign'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg border border-forge-glass-border text-sm text-forge-text-muted hover:text-forge-text transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </GlassCard>
        )}

        {/* Campaign Cards */}
        {loading ? (
          <GlassCard hover={false}>
            <p className="text-sm text-forge-text-muted text-center py-4">Loading campaigns...</p>
          </GlassCard>
        ) : campaigns.length === 0 ? (
          <GlassCard hover={false}>
            <p className="text-sm text-forge-text-muted text-center py-4">No campaigns yet. Create your first one above.</p>
          </GlassCard>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <GlassCard key={campaign.id} hover={false}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{campaign.name}</h3>
                    <p className="text-xs text-forge-text-muted mt-0.5 font-mono">/{campaign.slug}</p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider rounded px-2 py-0.5 ${campaign.isActive ? 'bg-green-500/10 text-green-400' : 'bg-forge-text-muted/10 text-forge-text-muted'}`}>
                    {campaign.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Campaign Link */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-forge-base/50 border border-forge-glass-border text-xs font-mono text-forge-text-muted truncate">
                    <LinkIcon className="size-3 shrink-0" />
                    <span className="truncate">{campaign.url}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(campaign)}
                    className="shrink-0 p-1.5 rounded-lg border border-forge-glass-border hover:border-forge-accent/40 transition-colors"
                    title="Copy link"
                  >
                    {copiedSlug === campaign.slug ? (
                      <Check className="size-4 text-green-400" />
                    ) : (
                      <Copy className="size-4 text-forge-text-muted" />
                    )}
                  </button>
                </div>

                {/* Analytics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-forge-text-muted">
                    <BarChart3 className="size-3" />
                    <span>{campaign.analytics.clicks} clicks</span>
                  </div>
                  <div className="text-forge-text-muted">
                    {campaign.analytics.auditsCompleted} audits
                  </div>
                  <div className="text-forge-text-muted">
                    {campaign.analytics.auditsStarted} started
                  </div>
                  <div className="text-forge-text-muted">
                    {campaign.analytics.callsBooked} calls
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
