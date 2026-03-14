import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/db/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error?error=missing_code`);
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(`${origin}/auth/error?error=exchange_failed`);
    }

    // TODO Phase 2: Create/update users row from auth.users data
    // TODO Phase 2: Link lead record if audit flow

    return NextResponse.redirect(`${origin}${next}`);
  } catch (err) {
    console.error('GET /api/auth/callback error:', err);
    return NextResponse.redirect(`${origin}/auth/error?error=unexpected`);
  }
}
