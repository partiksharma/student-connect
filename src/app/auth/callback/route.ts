import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const next = searchParams.get('next') ?? '/reset-password';

  if (error) {
    const redirectUrl = new URL('/reset-password', origin);
    redirectUrl.searchParams.set('error', error);
    if (errorDescription) redirectUrl.searchParams.set('error_description', errorDescription);
    return NextResponse.redirect(redirectUrl.toString());
  }

  if (code) {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored if called from Server Component
          }
        },
      },
    });

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      const redirectUrl = new URL('/reset-password', origin);
      redirectUrl.searchParams.set('error', 'invalid_code');
      redirectUrl.searchParams.set('error_description', exchangeError.message);
      return NextResponse.redirect(redirectUrl.toString());
    }
  }

  // If no code, redirect directly to the requested next page or reset password
  return NextResponse.redirect(`${origin}${next}`);
}
