import { NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/auth-server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, redirectTo } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabase = getServerSupabaseClient();

    // Determine the base URL for password reset redirect
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const redirectUrl = redirectTo || `${origin}/reset-password`;

    // 1. Verify if user exists in database profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, role, status')
      .eq('email', cleanEmail)
      .maybeSingle();

    // 2. Request password reset email from Supabase Auth
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });

      if (resetError) {
        console.warn('Supabase resetPasswordForEmail notice:', resetError.message);
      }
    } catch (authErr) {
      console.warn('Supabase reset password request failed:', authErr);
    }

    // Always respond with a generic success message to prevent user enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been dispatched.',
      exists: !!profile,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to process password reset request.';
    console.error('Forgot password API error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
