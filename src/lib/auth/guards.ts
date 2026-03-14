import { createServerSupabaseClient } from '@/lib/db/server';
import type { User } from '@supabase/supabase-js';

export interface SessionData {
  user: User;
  role: 'user' | 'team' | 'admin';
}

/**
 * Get the current authenticated session from cookies.
 * Returns null if no valid session exists.
 */
export async function getSession(): Promise<SessionData | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  return {
    user,
    role: (profile?.role as SessionData['role']) ?? 'user',
  };
}

/**
 * Get the current user, or null if unauthenticated.
 */
export async function getUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Require authentication. Returns session data or throws.
 * Use in API routes that need a logged-in user.
 */
export async function requireAuth(): Promise<SessionData> {
  const session = await getSession();
  if (!session) {
    throw new AuthError('UNAUTHORIZED', 'Authentication required');
  }
  return session;
}

/**
 * Require a specific role. Returns session data or throws.
 * Use in admin/team API routes.
 */
export async function requireRole(...roles: SessionData['role'][]): Promise<SessionData> {
  const session = await requireAuth();
  if (!roles.includes(session.role)) {
    throw new AuthError('FORBIDDEN', 'Insufficient permissions');
  }
  return session;
}

export class AuthError extends Error {
  constructor(
    public code: 'UNAUTHORIZED' | 'FORBIDDEN',
    message: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
