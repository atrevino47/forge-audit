import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/db/server';
import { createServiceClient } from '@/lib/db/client';

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

    // Create/update users row from auth.users data
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const serviceDb = createServiceClient();
      await serviceDb.from('users').upsert({
        id: user.id,
        email: user.email ?? '',
        full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? '',
        avatar_url: user.user_metadata?.avatar_url ?? null,
        role: 'user',
      }, { onConflict: 'id' });
    }

    return NextResponse.redirect(`${origin}${next}`);
  } catch (err) {
    console.error('GET /api/auth/callback error:', err);
    return NextResponse.redirect(`${origin}/auth/error?error=unexpected`);
  }
}
