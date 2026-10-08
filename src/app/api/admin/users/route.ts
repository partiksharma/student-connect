import { NextResponse } from 'next/server';
import { getServerSupabaseClient, verifyAdminRequest } from '@/lib/auth-server';

export async function GET(req: Request) {
  try {
    const isAuthorized = verifyAdminRequest(req);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }

    const supabase = getServerSupabaseClient();

    // Query profiles, student_profiles, business_profiles from authoritative database
    const [
      { data: profiles, error: pErr },
      { data: students, error: sErr },
      { data: businesses, error: bErr },
    ] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('student_profiles').select('*'),
      supabase.from('business_profiles').select('*'),
    ]);

    if (pErr) {
      return NextResponse.json({ error: pErr.message }, { status: 500 });
    }

    return NextResponse.json({
      profiles: profiles || [],
      students: students || [],
      businesses: businesses || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch admin users';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
