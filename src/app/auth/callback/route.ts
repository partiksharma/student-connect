import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getServerSupabaseClient } from '@/lib/auth-server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const type = searchParams.get('type') || 'login';
  const roleParam = searchParams.get('role');
  const next = searchParams.get('next');

  // Handle OAuth errors
  if (error) {
    const targetPath = type === 'recovery' ? '/reset-password' : (type === 'register' ? '/register' : '/login');
    const redirectUrl = new URL(targetPath, origin);
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
    if (exchangeError) {
      const targetPath = type === 'recovery' ? '/reset-password' : '/login';
      const redirectUrl = new URL(targetPath, origin);
      redirectUrl.searchParams.set('error', 'invalid_code');
      redirectUrl.searchParams.set('error_description', exchangeError.message);
      return NextResponse.redirect(redirectUrl.toString());
    }

    // Password reset / recovery flow
    if (type === 'recovery' || next === '/reset-password') {
      return NextResponse.redirect(new URL('/reset-password', origin).toString());
    }

    // Get authenticated user from session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(new URL('/login', origin).toString());
    }

    const cleanEmail = (user.email || '').trim().toLowerCase();
    const serverSupabase = getServerSupabaseClient();
    const now = new Date().toISOString();

    // 1. Check if profile already exists by ID or email
    let { data: profile } = await serverSupabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile && cleanEmail) {
      const { data: profileByEmail } = await serverSupabase
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (profileByEmail) {
        profile = profileByEmail;
      }
    }

    let finalRole: 'student' | 'business' | 'admin' = 'student';

    if (profile) {
      finalRole = profile.role || 'student';
    } else {
      // 2. New User Registration via Google OAuth
      // Security: Users cannot grant themselves admin role via OAuth
      const assignedRole: 'student' | 'business' = roleParam === 'business' ? 'business' : 'student';
      finalRole = assignedRole;

      const fullName = (user.user_metadata?.full_name ||
                        user.user_metadata?.name ||
                        (cleanEmail ? cleanEmail.split('@')[0] : 'User')).trim();
      const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

      const newProfile = {
        id: user.id,
        email: cleanEmail,
        role: assignedRole,
        status: 'pending_approval' as const,
        created_at: now,
        updated_at: now,
      };

      const { error: profileErr } = await serverSupabase.from('profiles').upsert([newProfile], { onConflict: 'id' });
      if (profileErr) {
        console.error('Failed to create profile for OAuth user:', profileErr);
      }

      if (assignedRole === 'student') {
        await serverSupabase.from('student_profiles').upsert([
          {
            user_id: user.id,
            full_name: fullName,
            school: 'University',
            graduation_year: 2027,
            skills: ['Communication', 'Marketing', 'Technology'],
            availability_hours_per_week: 8,
            bio: 'Student builder ready to deliver quality work for business clients.',
            portfolio_urls: [],
            avatar_url: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            is_public: true,
            created_at: now,
            updated_at: now,
          },
        ], { onConflict: 'user_id' });
      } else {
        await serverSupabase.from('business_profiles').upsert([
          {
            user_id: user.id,
            business_name: fullName,
            industry: 'Small Business',
            business_size: '1-5',
            location: 'Remote',
            description: 'Google authenticated business partner.',
            website_url: '',
            logo_url: avatarUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80',
            created_at: now,
            updated_at: now,
          },
        ], { onConflict: 'user_id' });
      }
    }

    // Determine target dashboard based on authoritative role
    let destination = '/student/dashboard';
    if (finalRole === 'admin') {
      destination = '/admin/dashboard';
    } else if (finalRole === 'business') {
      destination = '/business/dashboard';
    } else {
      destination = '/student/dashboard';
    }

    if (next && next.startsWith('/')) {
      destination = next;
    }

    const redirectUrl = new URL(destination, origin);
    redirectUrl.searchParams.set('oauth', 'success');
    return NextResponse.redirect(redirectUrl.toString());
  }

  // If no code, redirect to login
  return NextResponse.redirect(new URL('/login', origin).toString());
}
