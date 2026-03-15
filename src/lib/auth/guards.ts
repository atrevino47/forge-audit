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
 * Dev-mode fallback session for local testing without OAuth.
 */
function devFallbackSession(): SessionData | null {
  if (process.env.NODE_ENV !== 'development') return null;
  return {
    user: {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'dev@forgedigital.com',
      user_metadata: { full_name: 'Dev Admin' },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User,
    role: 'admin',
  };
}

/**
 * Require authentication. Returns session data or throws.
 * In development, falls back to a mock admin session.
 */
export async function requireAuth(): Promise<SessionData> {
  const session = await getSession();
  if (session) return session;

  const devSession = devFallbackSession();
  if (devSession) return devSession;

  throw new AuthError('UNAUTHORIZED', 'Authentication required');
}

/**
 * Require a specific role. Returns session data or throws.
 * In development, falls back to a mock admin session.
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
