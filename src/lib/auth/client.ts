import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

/**
 * Client-side Supabase auth client for use in React components.
 * Handles cookie-based session persistence automatically.
 */
export function createAuthClient() {
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
