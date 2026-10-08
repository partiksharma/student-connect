import { NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/auth-server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    const supabase = getServerSupabaseClient();

    if (userId || email) {
      let query = supabase.from('profiles').select('*');
      if (userId) {
        query = query.eq('id', userId);
      } else if (email) {
        query = query.eq('email', email.trim().toLowerCase());
      }

      const { data: profile, error } = await query.maybeSingle();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      let student = null;
      let business = null;

      if (profile) {
        if (profile.role === 'student') {
          const { data: st } = await supabase.from('student_profiles').select('*').eq('user_id', profile.id).maybeSingle();
          student = st;
        } else if (profile.role === 'business') {
          const { data: biz } = await supabase.from('business_profiles').select('*').eq('user_id', profile.id).maybeSingle();
          business = biz;
        }
      }

      return NextResponse.json({
        profile,
        student,
        business,
      });
    }

    // Return all profiles for store synchronization
    const [
      { data: profiles, error: pErr },
      { data: students, error: sErr },
      { data: businesses, error: bErr }
    ] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('student_profiles').select('*'),
      supabase.from('business_profiles').select('*')
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
    const message = err instanceof Error ? err.message : 'Failed to fetch profiles';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
