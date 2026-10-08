import { NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/auth-server';
import { generateUUID } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const studentId = searchParams.get('studentId');
    const businessId = searchParams.get('businessId');

    const supabase = getServerSupabaseClient();

    let query = supabase.from('applications').select('*').order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    const { data: apps, error: aErr } = await query;

    if (aErr) {
      console.warn('Error fetching applications from Supabase:', aErr);
      return NextResponse.json({ applications: [] });
    }

    // Fetch related student profiles and projects for complete metadata
    const [{ data: students }, { data: projects }] = await Promise.all([
      supabase.from('student_profiles').select('*'),
      supabase.from('projects').select('*'),
    ]);

    const studentMap = new Map();
    if (students) {
      students.forEach((s: any) => studentMap.set(s.user_id, s));
    }

    const projectMap = new Map();
    if (projects) {
      projects.forEach((p: any) => projectMap.set(p.id, p));
    }

    const enrichedApps = (apps || [])
      .map((app: any) => {
        const student = studentMap.get(app.student_id);
        const project = projectMap.get(app.project_id);

        return {
          ...app,
          student: student ? {
            user_id: student.user_id,
            full_name: student.full_name,
            school: student.school,
            graduation_year: student.graduation_year,
            skills: student.skills,
            availability_hours_per_week: student.availability_hours_per_week,
            bio: student.bio,
            avatar_url: student.avatar_url,
          } : app.student,
          project: project || app.project,
        };
      })
      .filter((app: any) => {
        if (!businessId) return true;
        const proj = projectMap.get(app.project_id);
        return proj && proj.business_id === businessId;
      });

    return NextResponse.json({ applications: enrichedApps });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch applications';
    return NextResponse.json({ error: message, applications: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { project_id, student_id, pitch_note } = body;

    if (!project_id || !student_id || !pitch_note) {
      return NextResponse.json(
        { error: 'Missing required application fields (project_id, student_id, pitch_note)' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabaseClient();
    const now = new Date().toISOString();

    // Check for duplicate application
    const { data: existingApp } = await supabase
      .from('applications')
      .select('id, status')
      .eq('project_id', project_id)
      .eq('student_id', student_id)
      .maybeSingle();

    if (existingApp) {
      return NextResponse.json(
        { error: 'You have already submitted an application for this project.' },
        { status: 409 }
      );
    }

    // Ensure student profile row exists in student_profiles table if needed
    const { data: existingStudent } = await supabase
      .from('student_profiles')
      .select('user_id')
      .eq('user_id', student_id)
      .maybeSingle();

    if (!existingStudent) {
      await supabase.from('student_profiles').insert([{
        user_id: student_id,
        full_name: 'Student Applicant',
        school: 'University',
        graduation_year: 2027,
        skills: ['Communication', 'Research'],
        availability_hours_per_week: 8,
        is_public: true,
        created_at: now,
        updated_at: now,
      }]);
    }

    const appId = generateUUID();
    const newApplication = {
      id: appId,
      project_id,
      student_id,
      pitch_note: pitch_note.trim(),
      status: 'pending',
      created_at: now,
      updated_at: now,
    };

    const { data: insertedApp, error: insertError } = await supabase
      .from('applications')
      .insert([newApplication])
      .select()
      .single();

    if (insertError) {
      console.error('Failed to insert application into database:', insertError);
      return NextResponse.json(
        { error: `Database insertion failed: ${insertError.message}` },
        { status: 500 }
      );
    }

    // Increment project applicant counter
    try {
      const { data: projData } = await supabase
        .from('projects')
        .select('id')
        .eq('id', project_id)
        .maybeSingle();

      if (projData) {
        // Increment count if column exists
        await supabase.rpc('increment_applicant_count', { project_id_input: project_id }).catch(() => {});
      }
    } catch {}

    // Fetch student profile details for response
    const { data: stData } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', student_id)
      .maybeSingle();

    const finalApp = {
      ...(insertedApp || newApplication),
      student: stData || undefined,
    };

    return NextResponse.json(
      {
        success: true,
        application: finalApp,
        message: 'Application submitted successfully to client.',
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to submit application';
    console.error('Applications POST API error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { applicationId, status } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: 'Valid applicationId and status are required' },
        { status: 400 }
      );
    }

    if (status !== 'accepted' && status !== 'rejected' && status !== 'pending') {
      return NextResponse.json({ error: 'Invalid application status' }, { status: 400 });
    }

    const supabase = getServerSupabaseClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('applications')
      .update({
        status,
        updated_at: now,
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      application: data,
      message: `Application status updated to ${status}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update application';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
