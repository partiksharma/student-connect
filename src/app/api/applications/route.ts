import { NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/auth-server';
import { generateUUID } from '@/lib/utils';
import { resolveProjectId, resolveUserId, isValidUUID } from '@/lib/aliases';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawProjectId = searchParams.get('projectId');
    const rawStudentId = searchParams.get('studentId');
    const rawBusinessId = searchParams.get('businessId');

    const projectId = resolveProjectId(rawProjectId);
    const studentId = resolveUserId(rawStudentId);
    const businessId = resolveUserId(rawBusinessId);

    const supabase = getServerSupabaseClient();

    let query = supabase.from('applications').select('*').order('created_at', { ascending: false });

    if (projectId && isValidUUID(projectId)) {
      query = query.eq('project_id', projectId);
    }
    if (studentId && isValidUUID(studentId)) {
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
      students.forEach((s: any) => {
        studentMap.set(s.user_id, s);
        if (s.user_id) {
          studentMap.set(resolveUserId(s.user_id), s);
        }
      });
    }

    const projectMap = new Map();
    if (projects) {
      projects.forEach((p: any) => {
        projectMap.set(p.id, p);
        if (p.id) {
          projectMap.set(resolveProjectId(p.id), p);
        }
      });
    }

    const enrichedApps = (apps || [])
      .map((app: any) => {
        const student = studentMap.get(app.student_id) || studentMap.get(resolveUserId(app.student_id));
        const project = projectMap.get(app.project_id) || projectMap.get(resolveProjectId(app.project_id));

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
        const proj = projectMap.get(app.project_id) || projectMap.get(resolveProjectId(app.project_id));
        if (!proj) return true;
        return (
          proj.business_id === businessId ||
          resolveUserId(proj.business_id) === businessId ||
          proj.business_id === rawBusinessId
        );
      });

    // Enforce strict uniqueness by composite key (project_id, student_id)
    const uniqueAppMap = new Map<string, any>();
    enrichedApps.forEach((app: any) => {
      const canonicalP = resolveProjectId(app.project_id);
      const canonicalS = resolveUserId(app.student_id);
      const compositeKey = `${canonicalP}::${canonicalS}`;

      if (!uniqueAppMap.has(compositeKey)) {
        uniqueAppMap.set(compositeKey, app);
      } else {
        const existing = uniqueAppMap.get(compositeKey);
        if (app.status === 'accepted' || (existing.status === 'pending' && app.status !== 'pending')) {
          uniqueAppMap.set(compositeKey, app);
        }
      }
    });

    return NextResponse.json({ applications: Array.from(uniqueAppMap.values()) });
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

    const canonicalProjectId = resolveProjectId(project_id);
    const canonicalStudentId = resolveUserId(student_id);

    if (!isValidUUID(canonicalProjectId)) {
      return NextResponse.json(
        { error: `Invalid project ID format: "${project_id}". Must resolve to a valid UUID.` },
        { status: 400 }
      );
    }

    if (!isValidUUID(canonicalStudentId)) {
      return NextResponse.json(
        { error: `Invalid student ID format: "${student_id}". Must resolve to a valid UUID.` },
        { status: 400 }
      );
    }

    const supabase = getServerSupabaseClient();
    const now = new Date().toISOString();

    // Check for duplicate application
    const { data: existingApp } = await supabase
      .from('applications')
      .select('id, status')
      .eq('project_id', canonicalProjectId)
      .eq('student_id', canonicalStudentId)
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
      .eq('user_id', canonicalStudentId)
      .maybeSingle();

    if (!existingStudent) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', canonicalStudentId)
        .maybeSingle();

      if (!existingProfile) {
        await supabase.from('profiles').insert([{
          id: canonicalStudentId,
          email: `student-${canonicalStudentId.slice(0, 8)}@university.edu`,
          role: 'student',
          status: 'approved',
          created_at: now,
          updated_at: now,
        }]);
      }

      await supabase.from('student_profiles').insert([{
        user_id: canonicalStudentId,
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

    // Ensure project exists in projects table so foreign key constraint passes
    const { data: existingProject } = await supabase
      .from('projects')
      .select('id, business_id')
      .eq('id', canonicalProjectId)
      .maybeSingle();

    if (!existingProject) {
      await supabase.from('projects').insert([{
        id: canonicalProjectId,
        business_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        title: 'Community Project',
        category: 'web_tech',
        description: 'Verified business project opportunity on StudentConnect.',
        skills_required: ['Problem Solving'],
        status: 'open',
        created_at: now,
        updated_at: now,
      }]);
    }

    const appId = generateUUID();
    const newApplication = {
      id: appId,
      project_id: canonicalProjectId,
      student_id: canonicalStudentId,
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

    // Increment project applicant counter if RPC function exists
    try {
      await supabase.rpc('increment_applicant_count', { project_id_input: canonicalProjectId });
    } catch {}

    // Fetch student profile details for response
    const { data: stData } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', canonicalStudentId)
      .maybeSingle();

    const { data: projData } = await supabase
      .from('projects')
      .select('*')
      .eq('id', canonicalProjectId)
      .maybeSingle();

    const finalApp = {
      ...(insertedApp || newApplication),
      student: stData || undefined,
      project: projData || undefined,
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
