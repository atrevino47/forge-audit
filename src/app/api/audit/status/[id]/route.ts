import { errorResponse } from '@/app/api/_shared/helpers';
import type { SSEEvent } from '@contracts/events';
import type { AuditCategory, CategoryResult } from '@contracts/audit-types';
import { AUDIT_CATEGORIES } from '@contracts/constants';

// Track active connections per audit to enforce single-connection limit
const activeConnections = new Map<string, AbortController>();

function formatSSE(event: SSEEvent): string {
  return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
}

function mockCategoryResult(category: AuditCategory): CategoryResult {
  const scores: Record<AuditCategory, number> = {
    seo: 72, website: 65, social: 58, branding: 74,
    gbp: 70, ads: 62, reputation: 75,
  };
  const score = scores[category];

  return {
    category,
    score,
    status: 'completed',
    subCategories: [
      {
        name: `${category} - General`,
        score,
        items: [
          {
            id: crypto.randomUUID(),
            label: `${category} primary check`,
            status: score > 70 ? 'pass' : score > 50 ? 'warning' : 'fail',
            detail: `Analysis result for ${category}`,
          },
          {
            id: crypto.randomUUID(),
            label: `${category} secondary check`,
            status: score > 65 ? 'pass' : 'warning',
            detail: `Secondary analysis for ${category}`,
          },
        ],
      },
    ],
    recommendations: [
      {
        id: crypto.randomUUID(),
        title: `Improve your ${category} score`,
        description: `Based on our analysis, there are opportunities to improve your ${category} performance.`,
        priority: score < 60 ? 'high' : score < 75 ? 'medium' : 'low',
        effort: score < 60 ? 'major-project' : 'moderate',
        impact: 'high',
        category,
      },
    ],
  };
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

      function sendKeepAlive() {
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'));
        } catch {
          // Stream already closed
        }
      }

      // Handle abort (client disconnect or new connection replacing this one)
      abortController.signal.addEventListener('abort', () => {
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });

      try {
        // TODO Phase 2: Replace mock flow with real DB polling.
        // Real implementation will:
        //   1. Poll audit_categories table every 1-2s
        //   2. Push events as each category transitions
        //   3. Compute overall score when all 7 complete
        //   4. Wait for landing page generation
        //   5. Close stream

        // --- MOCK STREAMING FLOW ---
        // Simulate categories completing one by one with realistic timing
        for (const category of AUDIT_CATEGORIES) {
          if (abortController.signal.aborted) break;

          // Category started
          send({ type: 'category_started', category });

          // Simulate processing time (2-5 seconds per category)
          const processingTime = 2000 + Math.random() * 3000;
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(resolve, processingTime);
            abortController.signal.addEventListener('abort', () => {
              clearTimeout(timeout);
              reject(new Error('aborted'));
            }, { once: true });
          }).catch(() => { /* aborted */ });

          if (abortController.signal.aborted) break;

          // Category completed
          const results = mockCategoryResult(category);
          send({
            type: 'category_completed',
            category,
            score: results.score,
            results,
          });
        }

        if (!abortController.signal.aborted) {
          // All categories done — send overall completion
          send({
            type: 'overall_completed',
            overallScore: 68,
            grade: 'C+',
            actionPlan: [
              {
                id: crypto.randomUUID(),
                title: 'Fix page speed issues',
                description: 'Your website loads slowly on mobile. Optimize images and minimize JavaScript.',
                priority: 'high',
                effort: 'moderate',
                impact: 'high',
                category: 'website',
              },
              {
                id: crypto.randomUUID(),
                title: 'Add meta descriptions',
                description: 'Several pages are missing meta descriptions.',
                priority: 'high',
                effort: 'quick-win',
                impact: 'medium',
                category: 'seo',
              },
            ],
          });

          // Simulate landing page generation delay
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(resolve, 3000);
            abortController.signal.addEventListener('abort', () => {
              clearTimeout(timeout);
              reject(new Error('aborted'));
            }, { once: true });
          }).catch(() => { /* aborted */ });

          if (!abortController.signal.aborted) {
            const mockPageId = crypto.randomUUID();
            const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://audit.forgedigital.com';
            send({
              type: 'landing_page_ready',
              previewUrl: `${appUrl}/preview/${mockPageId}`,
              pageId: mockPageId,
            });
          }
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
    }
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
