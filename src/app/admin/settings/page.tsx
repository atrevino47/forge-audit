'use client';

import { useEffect, useState, useCallback } from 'react';
import { UserPlus, Shield, Trash2, RefreshCw, X } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { Logo } from '@/components/shared/Logo';
import Link from 'next/link';

interface TeamMember {
  id: string;
  email: string;
  fullName: string;
  role: 'team' | 'admin';
  createdAt: string;
}

interface TeamApiResponse {
  members: TeamMember[];
}

const roleColors: Record<string, string> = {
  admin: 'bg-forge-accent/10 text-forge-accent',
  team: 'bg-blue-500/10 text-blue-400',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function SettingsPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Add form state
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<'team' | 'admin'>('team');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/team');
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? `Request failed (${res.status})`);
      }
      const json: TeamApiResponse = await res.json();
      setMembers(json.members);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail,
          fullName: newFullName,
          role: newRole,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? `Request failed (${res.status})`);
      }
      // Reset form and refresh list
      setNewEmail('');
      setNewFullName('');
      setNewRole('team');
      setShowAddForm(false);
      await fetchMembers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add team member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/team', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? `Request failed (${res.status})`);
      }
      setDeleteConfirmId(null);
      await fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove team member');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-forge-base">
      <header className="border-b border-forge-glass-border px-6 py-4 flex items-center justify-between">
        <Logo size="sm" />
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin/dashboard" className="text-forge-text-muted hover:text-forge-text transition-colors cursor-pointer">Dashboard</Link>
          <Link href="/admin/leads" className="text-forge-text-muted hover:text-forge-text transition-colors cursor-pointer">Leads</Link>
          <Link href="/admin/campaigns" className="text-forge-text-muted hover:text-forge-text transition-colors cursor-pointer">Campaigns</Link>
          <Link href="/admin/settings" className="text-forge-accent font-medium cursor-pointer">Settings</Link>
        </nav>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Settings</h1>
          <button
            onClick={fetchMembers}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-forge-text-muted hover:text-forge-text transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Team Members Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="size-5 text-forge-accent" />
              Team Members
            </h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-forge-accent/10 text-forge-accent hover:bg-forge-accent/20 border border-forge-accent/20 transition-colors"
            >
              <UserPlus className="size-4" />
              Add Member
            </button>
          </div>

          {error && (
            <GlassCard hover={false} className="mb-4 border-red-500/30">
              <p className="text-sm text-red-400">{error}</p>
            </GlassCard>
          )}

          {/* Add Team Member Form */}
          {showAddForm && (
            <GlassCard hover={false} className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Add Team Member</h3>
                <button onClick={() => setShowAddForm(false)} className="text-forge-text-muted hover:text-forge-text">
                  <X className="size-4" />
                </button>
              </div>
              {formError && (
                <p className="text-sm text-red-400 mb-3">{formError}</p>
              )}
              <form onSubmit={handleAdd} className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="add-email" className="block text-xs text-forge-text-muted mb-1">Email</label>
                    <input
                      id="add-email"
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="member@forgedigital.com"
                      className="w-full px-3 py-2 rounded-lg bg-forge-glass border border-forge-glass-border text-sm text-forge-text placeholder:text-forge-text-muted focus:outline-none focus:border-forge-accent/40"
                    />
                  </div>
                  <div>
                    <label htmlFor="add-name" className="block text-xs text-forge-text-muted mb-1">Full Name</label>
                    <input
                      id="add-name"
                      type="text"
                      required
                      minLength={2}
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-3 py-2 rounded-lg bg-forge-glass border border-forge-glass-border text-sm text-forge-text placeholder:text-forge-text-muted focus:outline-none focus:border-forge-accent/40"
                    />
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label htmlFor="add-role" className="block text-xs text-forge-text-muted mb-1">Role</label>
                    <select
                      id="add-role"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as 'team' | 'admin')}
                      className="w-full px-3 py-2 rounded-lg bg-forge-glass border border-forge-glass-border text-sm text-forge-text focus:outline-none focus:border-forge-accent/40"
                    >
                      <option value="team">Team</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 rounded-lg bg-forge-accent text-forge-base text-sm font-medium hover:bg-forge-accent/90 disabled:opacity-50 transition-colors"
                  >
                    {submitting ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </form>
            </GlassCard>
          )}

          {/* Members List */}
          {loading ? (
            <GlassCard hover={false}>
              <p className="text-sm text-forge-text-muted text-center py-4">Loading team members...</p>
            </GlassCard>
          ) : members.length === 0 ? (
            <GlassCard hover={false}>
              <p className="text-sm text-forge-text-muted text-center py-4">No team members found.</p>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <GlassCard key={member.id} hover={false} className="py-4 px-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="shrink-0 size-10 rounded-full bg-forge-accent/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-forge-accent">
                          {member.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{member.fullName}</p>
                        <p className="text-xs text-forge-text-muted truncate">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${roleColors[member.role] ?? roleColors.team}`}>
                        {member.role}
                      </span>
                      <span className="text-xs text-forge-text-muted hidden sm:inline">
                        {formatDate(member.createdAt)}
                      </span>
                      {member.role !== 'admin' && (
                        <>
                          {deleteConfirmId === member.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(member.id)}
                                disabled={submitting}
                                className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 disabled:opacity-50 transition-colors"
                              >
                                {submitting ? '...' : 'Confirm'}
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="text-xs px-2 py-1 rounded text-forge-text-muted hover:text-forge-text transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(member.id)}
                              className="text-forge-text-muted hover:text-red-400 transition-colors"
                              title="Remove member"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
