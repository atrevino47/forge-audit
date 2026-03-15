'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Clock,
  ArrowRightLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/shared/GlassCard';
import { Logo } from '@/components/shared/Logo';
import Link from 'next/link';
import type { LeadListItem } from '@contracts/api-contracts';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface LeadsApiResponse {
  leads: LeadListItem[];
  pagination: Pagination;
}

interface LeadNote {
  id: string;
  leadId: string;
  authorId: string | null;
  authorName: string;
  content: string;
  noteType: 'note' | 'call' | 'email' | 'status_change' | 'meeting';
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const statusColors: Record<LeadListItem['status'], string> = {
  new: 'bg-blue-500/10 text-blue-400',
  contacted: 'bg-yellow-500/10 text-yellow-400',
  qualified: 'bg-green-500/10 text-green-400',
  closed: 'bg-forge-text-muted/10 text-forge-text-muted',
};

const statusSelectColors: Record<LeadListItem['status'], string> = {
  new: 'text-blue-400',
  contacted: 'text-yellow-400',
  qualified: 'text-green-400',
  closed: 'text-forge-text-muted',
};

function gradeColor(grade: string | null): string {
  if (!grade) return 'text-forge-text-muted';
  const letter = grade.charAt(0);
  if (letter === 'A') return 'text-green-400';
  if (letter === 'B') return 'text-blue-400';
  if (letter === 'C') return 'text-yellow-400';
  if (letter === 'D') return 'text-orange-400';
  return 'text-red-400';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

const noteTypeIcons: Record<LeadNote['noteType'], typeof MessageSquare> = {
  note: MessageSquare,
  call: Phone,
  email: Mail,
  meeting: Calendar,
  status_change: ArrowRightLeft,
};

const noteTypeLabels: Record<string, string> = {
  note: 'Note',
  call: 'Call',
  email: 'Email',
  meeting: 'Meeting',
  status_change: 'Status Change',
};

/* ------------------------------------------------------------------ */
/*  Lead Detail Panel                                                  */
/* ------------------------------------------------------------------ */

function LeadDetailPanel({
  lead,
  onClose,
  onStatusChange,
}: {
  lead: LeadListItem;
  onClose: () => void;
  onStatusChange: (leadId: string, newStatus: LeadListItem['status']) => void;
}) {
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<'note' | 'call' | 'email' | 'meeting'>('note');
  const [submitting, setSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<LeadListItem['status']>(lead.status);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchNotes = useCallback(async () => {
    setLoadingNotes(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/notes`);
      if (res.ok) {
        const json = await res.json();
        setNotes(json.notes ?? []);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingNotes(false);
    }
  }, [lead.id]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleStatusChange = async (newStatus: LeadListItem['status']) => {
    if (newStatus === currentStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id, status: newStatus }),
      });
      if (res.ok) {
        setCurrentStatus(newStatus);
        onStatusChange(lead.id, newStatus);
        // Refresh notes to show the status_change entry
        await fetchNotes();
      }
    } catch {
      // silently fail
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteContent.trim(), noteType }),
      });
      if (res.ok) {
        const newNote: LeadNote = await res.json();
        setNotes((prev) => [newNote, ...prev]);
        setNoteContent('');
        setNoteType('note');
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        className="fixed inset-y-0 right-0 z-50 w-full max-w-xl flex flex-col"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <GlassCard hover={false} className="h-full rounded-none rounded-l-xl p-0 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-forge-glass-border flex-shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-xl font-bold truncate">{lead.fullName}</h2>
                <p className="text-sm text-forge-text-muted truncate">{lead.businessName}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <select
                  value={currentStatus}
                  onChange={(e) => handleStatusChange(e.target.value as LeadListItem['status'])}
                  disabled={updatingStatus}
                  className={`px-3 py-1.5 rounded-lg bg-forge-glass border border-forge-glass-border text-sm font-medium focus:outline-none focus:border-forge-accent/40 disabled:opacity-50 ${statusSelectColors[currentStatus]}`}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="closed">Closed</option>
                </select>
                <button
                  onClick={onClose}
                  className="text-forge-text-muted hover:text-forge-text transition-colors p-1"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="px-6 py-4 border-b border-forge-glass-border flex-shrink-0">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <span className="text-forge-text-muted text-xs uppercase tracking-wider">Email</span>
                <a href={`mailto:${lead.email}`} className="block text-forge-accent hover:underline truncate mt-0.5">
                  {lead.email}
                </a>
              </div>
              <div>
                <span className="text-forge-text-muted text-xs uppercase tracking-wider">Website</span>
                <a
                  href={lead.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-forge-accent hover:underline truncate mt-0.5"
                >
                  {lead.websiteUrl}
                </a>
              </div>
              <div>
                <span className="text-forge-text-muted text-xs uppercase tracking-wider">Score / Grade</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-semibold tabular-nums">{lead.overallScore ?? '--'}</span>
                  <span className={`font-bold ${gradeColor(lead.grade)}`}>{lead.grade ?? '--'}</span>
                </div>
              </div>
              <div>
                <span className="text-forge-text-muted text-xs uppercase tracking-wider">Source</span>
                <p className="capitalize mt-0.5">
                  {lead.source}
                  {lead.campaignName ? ` (${lead.campaignName})` : ''}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-forge-text-muted text-xs uppercase tracking-wider">Created</span>
                <p className="mt-0.5">{formatDate(lead.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Notes / Activity */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Add Note Form */}
            <form onSubmit={handleSubmitNote} className="px-6 py-4 border-b border-forge-glass-border flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Add Note</span>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value as typeof noteType)}
                  className="ml-auto px-2 py-1 rounded-md bg-forge-glass border border-forge-glass-border text-xs text-forge-text focus:outline-none focus:border-forge-accent/40"
                >
                  <option value="note">Note</option>
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                </select>
              </div>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write a note..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-forge-base/50 border border-forge-glass-border text-sm text-forge-text placeholder:text-forge-text-muted focus:outline-none focus:border-forge-accent/40 resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!noteContent.trim() || submitting}
                  className="px-4 py-1.5 rounded-lg bg-forge-accent text-forge-base text-sm font-medium hover:bg-forge-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Saving...' : 'Add Note'}
                </button>
              </div>
            </form>

            {/* Timeline */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4">
              {loadingNotes ? (
                <p className="text-sm text-forge-text-muted text-center py-8">Loading activity...</p>
              ) : notes.length === 0 ? (
                <p className="text-sm text-forge-text-muted text-center py-8">No activity yet.</p>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => {
                    const Icon = noteTypeIcons[note.noteType] ?? MessageSquare;
                    const isSystemEntry = note.noteType === 'status_change';

                    return (
                      <div key={note.id} className="flex gap-3">
                        <div
                          className={`flex-shrink-0 mt-0.5 size-8 rounded-full flex items-center justify-center ${
                            isSystemEntry
                              ? 'bg-forge-text-muted/10 text-forge-text-muted'
                              : 'bg-forge-accent/10 text-forge-accent'
                          }`}
                        >
                          <Icon className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`font-medium ${isSystemEntry ? 'text-forge-text-muted' : 'text-forge-text'}`}>
                              {note.authorName}
                            </span>
                            <span className="text-forge-text-muted">
                              {noteTypeLabels[note.noteType] ?? note.noteType}
                            </span>
                            <span className="text-forge-text-muted/60 ml-auto flex items-center gap-1 flex-shrink-0">
                              <Clock className="size-3" />
                              {relativeTime(note.createdAt)}
                            </span>
                          </div>
                          <p
                            className={`text-sm mt-1 ${
                              isSystemEntry ? 'text-forge-text-muted italic' : 'text-forge-text'
                            }`}
                          >
                            {note.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function LeadsPage() {
  const [data, setData] = useState<LeadsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLead, setSelectedLead] = useState<LeadListItem | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? `Request failed (${res.status})`);
      }
      const json: LeadsApiResponse = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const handleStatusChange = (leadId: string, newStatus: LeadListItem['status']) => {
    // Update the lead in the local list so the table reflects the change immediately
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        leads: prev.leads.map((l) =>
          l.id === leadId ? { ...l, status: newStatus } : l
        ),
      };
    });
    // Also update the selected lead
    setSelectedLead((prev) => (prev && prev.id === leadId ? { ...prev, status: newStatus } : prev));
  };

  return (
    <div className="min-h-screen bg-forge-base">
      <header className="border-b border-forge-glass-border px-6 py-4 flex items-center justify-between">
        <Logo size="sm" />
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin/dashboard" className="text-forge-text-muted hover:text-forge-text transition-colors cursor-pointer">Dashboard</Link>
          <Link href="/admin/leads" className="text-forge-accent font-medium cursor-pointer">Leads</Link>
          <Link href="/admin/campaigns" className="text-forge-text-muted hover:text-forge-text transition-colors cursor-pointer">Campaigns</Link>
          <Link href="/admin/settings" className="text-forge-text-muted hover:text-forge-text transition-colors cursor-pointer">Settings</Link>
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Leads</h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-forge-text-muted" />
            <input
              type="text"
              placeholder="Search by name, email, or business..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-forge-glass border border-forge-glass-border text-sm text-forge-text placeholder:text-forge-text-muted focus:outline-none focus:border-forge-accent/40"
            />
          </form>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg bg-forge-glass border border-forge-glass-border text-sm text-forge-text focus:outline-none focus:border-forge-accent/40"
          >
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {error && (
          <GlassCard hover={false} className="mb-6 border-red-500/30">
            <p className="text-sm text-red-400">{error}</p>
          </GlassCard>
        )}

        {/* Table */}
        <GlassCard hover={false} className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-forge-glass-border text-forge-text-muted text-left">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Business</th>
                  <th className="px-4 py-3 font-medium text-center">Score</th>
                  <th className="px-4 py-3 font-medium text-center">Grade</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-forge-text-muted">
                      Loading leads...
                    </td>
                  </tr>
                ) : (data?.leads?.length ?? 0) === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-forge-text-muted">
                      No leads found.
                    </td>
                  </tr>
                ) : (
                  data?.leads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="border-b border-forge-glass-border/50 hover:bg-forge-accent/5 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{lead.fullName}</td>
                      <td className="px-4 py-3 text-forge-text-muted">{lead.email}</td>
                      <td className="px-4 py-3">{lead.businessName}</td>
                      <td className="px-4 py-3 text-center tabular-nums">{lead.overallScore ?? '--'}</td>
                      <td className={`px-4 py-3 text-center font-semibold ${gradeColor(lead.grade)}`}>{lead.grade ?? '--'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColors[lead.status]}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-forge-text-muted">{formatDate(lead.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-forge-text-muted">
            <span>
              Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} leads)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-forge-glass border border-forge-glass-border hover:border-forge-accent/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="size-4" /> Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page >= data.pagination.totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-forge-glass border border-forge-glass-border hover:border-forge-accent/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* CRM Slide-out Panel */}
        <AnimatePresence>
          {selectedLead && (
            <LeadDetailPanel
              lead={selectedLead}
              onClose={() => setSelectedLead(null)}
              onStatusChange={handleStatusChange}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
