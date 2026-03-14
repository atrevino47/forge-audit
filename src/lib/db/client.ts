import { createClient } from '@supabase/supabase-js';

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

/**
 * Server-side Supabase client with service_role key.
 * Bypasses RLS — use only in API routes, never expose to the client.
 */
export function createServiceClient() {
  return createClient(
    getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Browser-side Supabase client with anon key.
 * Respects RLS policies. Safe for client-side use.
 */
export function createBrowserClient() {
  return createClient(
    getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  );
}
