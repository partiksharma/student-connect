import { NextResponse } from 'next/server';
import {
  AUTHORIZED_ADMIN_EMAIL,
  ADMIN_SESSION_COOKIE,
  checkRateLimit,
  recordFailedLogin,
  resetFailedLogins,
  verifyAdminPassword,
  createAdminSessionToken,
  getServerSupabaseClient,
} from '@/lib/auth-server';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               req.headers.get('x-real-ip') ||
               'client-ip';

    // 1. Rate Limiting Check
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Please wait ${rateCheck.retryAfterSeconds || 60} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      recordFailedLogin(ip);
      return NextResponse.json(
        { error: 'Invalid admin credentials.' },
        { status: 401 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 2. Strict Email Verification: Only the authorized admin email may proceed
    if (cleanEmail !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      recordFailedLogin(ip);
      return NextResponse.json(
        { error: 'Invalid admin credentials.' },
        { status: 401 }
      );
    }

    // 3. Strict Password Verification against server-side hashed credentials
    const isPasswordValid = verifyAdminPassword(password);
    if (!isPasswordValid) {
      recordFailedLogin(ip);
      return NextResponse.json(
        { error: 'Invalid admin credentials.' },
        { status: 401 }
      );
    }

    // 4. Successful Authentication: Reset rate limiter
    resetFailedLogins(ip);

    // 5. Ensure authoritative database record exists and holds admin role
    const supabase = getServerSupabaseClient();
    let adminId = '441a1482-929a-4311-a8f7-f2b69ae22835';

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', AUTHORIZED_ADMIN_EMAIL)
        .maybeSingle();

      if (profile) {
        adminId = profile.id;
        if (profile.role !== 'admin' || profile.status !== 'approved') {
          await supabase
            .from('profiles')
            .update({ role: 'admin', status: 'approved', updated_at: new Date().toISOString() })
            .eq('id', profile.id);
        }
      } else {
        const { data: newProfile } = await supabase
          .from('profiles')
          .upsert([
            {
              id: adminId,
              email: AUTHORIZED_ADMIN_EMAIL,
              role: 'admin',
              status: 'approved',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .maybeSingle();

        if (newProfile) {
          adminId = newProfile.id;
        }
      }
    } catch (dbErr) {
      console.warn('Notice syncing admin profile with database during login:', dbErr);
    }

    // 6. Generate cryptographically signed HMAC-SHA256 session token
    const adminUser = {
      id: adminId,
      email: AUTHORIZED_ADMIN_EMAIL,
      role: 'admin' as const,
      status: 'approved' as const,
    };

    const sessionToken = createAdminSessionToken(adminUser);

    const response = NextResponse.json({
      success: true,
      user: adminUser,
      sessionToken,
      message: 'Admin session authenticated successfully',
    });

    // 7. Secure httpOnly Session Cookie
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 3600, // 8 hours
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Authentication failure';
    console.error('Admin login API error:', err);
    return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 500 });
  }
}
