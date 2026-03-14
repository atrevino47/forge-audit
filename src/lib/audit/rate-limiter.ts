// src/lib/audit/rate-limiter.ts
// IP + email rate limit checks against the rate_limits table

import { createClient } from '@supabase/supabase-js';
import { RATE_LIMITS } from '../../../contracts/constants';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RateLimitResult {
  allowed: boolean;
  reason?: 'email_limit_reached' | 'ip_limit_reached';
  retryAfter?: number; // seconds until the window resets
}

interface RateLimitRow {
  id: string;
  audit_count: number;
  window_start: string;
}

// ─── Supabase Admin Client ───────────────────────────────────────────────────

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Check whether an audit request is permitted under the rate limits.
 * - 1 free audit per email (lifetime)
 * - 3 free audits per IP in a rolling 24-hour window
 */
export async function checkRateLimit(
  email: string,
  ipAddress: string,
): Promise<RateLimitResult> {
  // Check email limit
  const { data: emailRow } = await db()
    .from('rate_limits')
    .select('id, audit_count')
    .eq('email', email)
    .maybeSingle();

  const emailRecord = emailRow as Pick<RateLimitRow, 'id' | 'audit_count'> | null;
  if (emailRecord && emailRecord.audit_count >= RATE_LIMITS.FREE_AUDITS_PER_EMAIL) {
    return { allowed: false, reason: 'email_limit_reached' };
  }

  // Check IP limit
  const windowCutoff = new Date(Date.now() - TWENTY_FOUR_HOURS_MS).toISOString();

  const { data: ipRow } = await db()
    .from('rate_limits')
    .select('id, audit_count, window_start')
    .eq('ip_address', ipAddress)
    .is('email', null)
    .maybeSingle();

  const ipRecord = ipRow as RateLimitRow | null;
  if (ipRecord) {
    // Window expired — allow
    if (new Date(ipRecord.window_start) < new Date(windowCutoff)) {
      return { allowed: true };
    }

    if (ipRecord.audit_count >= RATE_LIMITS.FREE_AUDITS_PER_IP_24H) {
      const windowEnd = new Date(
        new Date(ipRecord.window_start).getTime() + TWENTY_FOUR_HOURS_MS,
      );
      const retryAfter = Math.max(0, Math.ceil((windowEnd.getTime() - Date.now()) / 1000));
      return { allowed: false, reason: 'ip_limit_reached', retryAfter };
    }
  }

  return { allowed: true };
}

/**
 * Record that an audit was started (call after rate check passes).
 */
export async function recordAuditUsage(
  email: string,
  ipAddress: string,
): Promise<void> {
  const supabase = db();
  const now = new Date().toISOString();

  // Upsert email record
  const { data: emailRow } = await supabase
    .from('rate_limits')
    .select('id, audit_count')
    .eq('email', email)
    .maybeSingle();

  const emailRecord = emailRow as Pick<RateLimitRow, 'id' | 'audit_count'> | null;

  if (emailRecord) {
    await supabase
      .from('rate_limits')
      .update({ audit_count: emailRecord.audit_count + 1, last_audit_at: now })
      .eq('id', emailRecord.id);
  } else {
    await supabase.from('rate_limits').insert({
      email,
      ip_address: ipAddress,
      audit_count: 1,
      last_audit_at: now,
      window_start: now,
    });
  }

  // Upsert IP record (separate row — email IS NULL distinguishes it)
  const windowCutoff = new Date(Date.now() - TWENTY_FOUR_HOURS_MS).toISOString();

  const { data: ipRow } = await supabase
    .from('rate_limits')
    .select('id, audit_count, window_start')
    .eq('ip_address', ipAddress)
    .is('email', null)
    .maybeSingle();

  const ipRecord = ipRow as RateLimitRow | null;

  if (ipRecord) {
    const windowExpired = new Date(ipRecord.window_start) < new Date(windowCutoff);
    await supabase
      .from('rate_limits')
      .update({
        audit_count: windowExpired ? 1 : ipRecord.audit_count + 1,
        last_audit_at: now,
        window_start: windowExpired ? now : ipRecord.window_start,
      })
      .eq('id', ipRecord.id);
  } else {
    await supabase.from('rate_limits').insert({
      ip_address: ipAddress,
      audit_count: 1,
      last_audit_at: now,
      window_start: now,
    });
  }
}
