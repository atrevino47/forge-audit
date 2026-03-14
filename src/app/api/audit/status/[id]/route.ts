import { errorResponse } from '@/app/api/_shared/helpers';
import { createServiceClient } from '@/lib/db/client';
import type { SSEEvent } from '@contracts/events';
import type { AuditCategory, CategoryResult, Recommendation, Grade } from '@contracts/audit-types';
import { AUDIT_CATEGORIES } from '@contracts/constants';

// Track active connections per audit to enforce single-connection limit
const activeConnections = new Map<string, AbortController>();

function formatSSE(event: SSEEvent): string {
  return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
}

// Maximum time to poll before giving up (90 seconds)
const MAX_POLL_MS = 90_000;
// Interval between DB polls (1.5 seconds)
const POLL_INTERVAL_MS = 1_500;

interface CategoryRow {
  category: AuditCategory;
  status: string;
  score: number | null;
  results: CategoryResult | null;
}

interface AuditRow {
  status: string;
  overall_score: number | null;
  overall_grade: string | null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: auditId } = await params;

  if (!auditId) {
    return errorResponse('INVALID_INPUT', 'Audit ID is required', 400);
  }

  // Enforce single connection per audit
  const existing = activeConnections.get(auditId);
  if (existing) {
    existing.abort();
    activeConnections.delete(auditId);
  }

  const abortController = new AbortController();
  activeConnections.set(auditId, abortController);

  // Keep-alive function reference — set inside stream start, called from interval
  let keepAliveFn: (() => void) | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      function send(event: SSEEvent) {
        try {
          controller.enqueue(encoder.encode(formatSSE(event)));
        } catch {
          // Stream already closed
        }
      }

      keepAliveFn = () => {
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'));
        } catch {
          // Stream already closed
        }
      };

      // Handle abort (client disconnect or new connection replacing this one)
      abortController.signal.addEventListener('abort', () => {
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });

      const supabase = createServiceClient();

      try {
        // ── Check if audit already completed ──────────────────────────────
        const { data: auditCheck, error: auditCheckErr } = await supabase
          .from('audits')
          .select('status, overall_score, overall_grade')
          .eq('id', auditId)
          .single();

        if (auditCheckErr || !auditCheck) {
          send({ type: 'error', message: 'Audit not found' });
          return;
        }

        // If audit is already completed, send all results immediately
        if (auditCheck.status === 'completed') {
          await sendAllCompletedResults(supabase, auditId, auditCheck as AuditRow, send);
          return;
        }

        // If audit already failed before we even started polling
        if (auditCheck.status === 'failed') {
          send({ type: 'error', message: 'Audit failed before results could be generated' });
          return;
        }

        // ── DB polling loop ──────────────────────────────────────────────
        const sentStarted = new Set<AuditCategory>();
        const sentCompleted = new Set<AuditCategory>();
        const sentFailed = new Set<AuditCategory>();
        const pollStart = Date.now();

        while (!abortController.signal.aborted) {
          // Safety timeout
          if (Date.now() - pollStart > MAX_POLL_MS) {
            send({ type: 'error', message: 'Audit timed out waiting for results' });
            break;
          }

          // Query all category rows for this audit
          const { data: categoryRows, error: catError } = await supabase
            .from('audit_categories')
            .select('category, status, score, results')
            .eq('audit_id', auditId);

          if (catError) {
            send({ type: 'error', message: `Database error: ${catError.message}` });
            break;
          }

          const rows = (categoryRows ?? []) as CategoryRow[];

          // Process each category row
          for (const row of rows) {
            const cat = row.category;

            if (row.status === 'running' && !sentStarted.has(cat)) {
              send({ type: 'category_started', category: cat });
              sentStarted.add(cat);
            }

            if (row.status === 'completed' && !sentCompleted.has(cat)) {
              // Ensure we also sent started for this category
              if (!sentStarted.has(cat)) {
                send({ type: 'category_started', category: cat });
                sentStarted.add(cat);
              }

              const results = row.results as CategoryResult;
              send({
                type: 'category_completed',
                category: cat,
                score: results.score,
                results,
              });
              sentCompleted.add(cat);
            }

            if (row.status === 'failed' && !sentFailed.has(cat)) {
              // Ensure we also sent started for this category
              if (!sentStarted.has(cat)) {
                send({ type: 'category_started', category: cat });
                sentStarted.add(cat);
              }

              send({
                type: 'category_failed',
                category: cat,
                error: `Analysis failed for ${cat}`,
              });
              sentFailed.add(cat);
            }
          }

          // Check if all 7 categories are done (completed or failed)
          const doneCount = sentCompleted.size + sentFailed.size;
          if (doneCount >= AUDIT_CATEGORIES.length) {
            // Fetch overall audit results
            const { data: auditRow, error: auditErr } = await supabase
              .from('audits')
              .select('status, overall_score, overall_grade')
              .eq('id', auditId)
              .single();

            if (auditErr || !auditRow) {
              send({ type: 'error', message: 'Failed to fetch audit results' });
              break;
            }

            const audit = auditRow as AuditRow;

            if (audit.status === 'failed') {
              send({ type: 'error', message: 'Audit failed' });
              break;
            }

            // Build action plan from all completed category recommendations
            const allResults = rows
              .filter((r) => r.status === 'completed' && r.results)
              .map((r) => r.results as CategoryResult);

            const actionPlan = buildActionPlanFromResults(allResults);

            send({
              type: 'overall_completed',
              overallScore: audit.overall_score ?? 0,
              grade: (audit.overall_grade ?? 'F') as Grade,
              actionPlan,
            });

            // Check for generated landing page
            const { data: pageRow } = await supabase
              .from('generated_pages')
              .select('id')
              .eq('audit_id', auditId)
              .limit(1)
              .maybeSingle();

            if (pageRow) {
              const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://audit.forgedigital.com';
              send({
                type: 'landing_page_ready',
                previewUrl: `${appUrl}/preview/${pageRow.id}`,
                pageId: pageRow.id,
              });
            }

            break;
          }

          // Check if overall audit has failed
          const { data: auditStatusRow } = await supabase
            .from('audits')
            .select('status')
            .eq('id', auditId)
            .single();

          if (auditStatusRow && auditStatusRow.status === 'failed') {
            send({ type: 'error', message: 'Audit failed' });
            break;
          }

          // Wait before next poll (abort-aware)
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(resolve, POLL_INTERVAL_MS);
            abortController.signal.addEventListener('abort', () => {
              clearTimeout(timeout);
              reject(new Error('aborted'));
            }, { once: true });
          }).catch(() => { /* aborted */ });
        }
      } catch (err) {
        if (!abortController.signal.aborted) {
          send({
            type: 'error',
            message: err instanceof Error ? err.message : 'An unexpected error occurred',
          });
        }
      } finally {
        activeConnections.delete(auditId);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      }
    },
  });

  // Keep-alive interval (every 15s) to prevent proxy timeouts
  const keepAliveInterval = setInterval(() => {
    if (abortController.signal.aborted) {
      clearInterval(keepAliveInterval);
      return;
    }
    keepAliveFn?.();
  }, 15000);

  // Clean up when the response is done
  abortController.signal.addEventListener('abort', () => {
    clearInterval(keepAliveInterval);
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a prioritized action plan from all completed category results.
 * Sorted by: priority (high -> low), then impact (high -> low).
 */
function buildActionPlanFromResults(categoryResults: CategoryResult[]): Recommendation[] {
  const allRecs = categoryResults.flatMap((r) => r.recommendations);

  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const impactOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

  return allRecs.sort((a, b) => {
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pDiff !== 0) return pDiff;
    return impactOrder[a.impact] - impactOrder[b.impact];
  });
}

/**
 * Send all results for an already-completed audit without polling.
 */
async function sendAllCompletedResults(
  supabase: ReturnType<typeof createServiceClient>,
  auditId: string,
  audit: AuditRow,
  send: (event: SSEEvent) => void,
): Promise<void> {
  // Fetch all category rows
  const { data: categoryRows, error: catError } = await supabase
    .from('audit_categories')
    .select('category, status, score, results')
    .eq('audit_id', auditId);

  if (catError) {
    send({ type: 'error', message: `Database error: ${catError.message}` });
    return;
  }

  const rows = (categoryRows ?? []) as CategoryRow[];
  const completedResults: CategoryResult[] = [];

  for (const row of rows) {
    const cat = row.category;

    // Send started + completed/failed for each category
    send({ type: 'category_started', category: cat });

    if (row.status === 'completed' && row.results) {
      const results = row.results as CategoryResult;
      send({
        type: 'category_completed',
        category: cat,
        score: results.score,
        results,
      });
      completedResults.push(results);
    } else if (row.status === 'failed') {
      send({
        type: 'category_failed',
        category: cat,
        error: `Analysis failed for ${cat}`,
      });
    }
  }

  // Send overall completion
  const actionPlan = buildActionPlanFromResults(completedResults);

  send({
    type: 'overall_completed',
    overallScore: audit.overall_score ?? 0,
    grade: (audit.overall_grade ?? 'F') as Grade,
    actionPlan,
  });

  // Check for generated landing page
  const { data: pageRow } = await supabase
    .from('generated_pages')
    .select('id')
    .eq('audit_id', auditId)
    .limit(1)
    .maybeSingle();

  if (pageRow) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://audit.forgedigital.com';
    send({
      type: 'landing_page_ready',
      previewUrl: `${appUrl}/preview/${pageRow.id}`,
      pageId: pageRow.id,
    });
  }
}
