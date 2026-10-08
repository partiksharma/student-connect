import { NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/auth-server';
import { generateUUID } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const supabase = getServerSupabaseClient();

    // Query projects from database
    const { data: projects, error: pErr } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (pErr) {
      console.warn('Error fetching projects from Supabase:', pErr);
      return NextResponse.json({ projects: [] });
    }

    // Query business profiles to attach business metadata
    const { data: businesses } = await supabase.from('business_profiles').select('*');
    const bizMap = new Map();
    if (businesses) {
      businesses.forEach((b: any) => bizMap.set(b.user_id, b));
    }

    const enrichedProjects = (projects || []).map((p: any) => {
      const biz = bizMap.get(p.business_id);
      return {
        ...p,
        business: biz ? {
          user_id: biz.user_id,
          business_name: biz.business_name,
          industry: biz.industry,
          business_size: biz.business_size,
          location: biz.location,
          description: biz.description,
          logo_url: biz.logo_url,
          website_url: biz.website_url,
          created_at: biz.created_at,
          updated_at: biz.updated_at,
        } : p.business,
      };
    });

    return NextResponse.json({ projects: enrichedProjects });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch projects';
    return NextResponse.json({ error: message, projects: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      category,
      description,
      deliverables_description,
      skills_required,
      estimated_hours_per_week,
      duration_weeks,
      business_id,
      status,
      perks,
    } = body;

    if (!title || !description || !business_id) {
      return NextResponse.json(
        { error: 'Missing required project fields (title, description, business_id)' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabaseClient();
    const now = new Date().toISOString();
    const projectId = generateUUID();

    const newProject = {
      id: projectId,
      business_id,
      title: title.trim(),
      category: category || 'marketing',
      description: description.trim(),
      deliverables_description: deliverables_description ? deliverables_description.trim() : '',
      skills_required: Array.isArray(skills_required) ? skills_required : [],
      estimated_hours_per_week: Number(estimated_hours_per_week) || 5,
      duration_weeks: Number(duration_weeks) || 4,
      status: status || 'open',
      created_at: now,
      updated_at: now,
    };

    // First ensure the business profile row exists in business_profiles table if needed
    const { data: existingBiz } = await supabase
      .from('business_profiles')
      .select('user_id')
      .eq('user_id', business_id)
      .maybeSingle();

    if (!existingBiz) {
      // Create minimal business profile placeholder so foreign key constraint passes
      await supabase.from('business_profiles').insert([{
        user_id: business_id,
        business_name: 'Client Business Partner',
        industry: 'Small Business',
        business_size: '1-5',
        location: 'Remote',
        description: 'Verified business client on StudentConnect.',
        created_at: now,
        updated_at: now,
      }]);
    }

    const { data: insertedProject, error: insertError } = await supabase
      .from('projects')
      .insert([newProject])
      .select()
      .single();

    if (insertError) {
      console.error('Failed to insert project into Supabase database:', insertError);
      return NextResponse.json(
        { error: `Database insertion failed: ${insertError.message}` },
        { status: 500 }
      );
    }

    // Fetch business details for complete project record
    const { data: bizData } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', business_id)
      .maybeSingle();

    const finalProject = {
      ...(insertedProject || newProject),
      perks: perks || ['Certificate of Project Completion', 'Recommendation Testimonial'],
      applicant_count: 0,
      business: bizData || undefined,
    };

    return NextResponse.json(
      {
        success: true,
        project: finalProject,
        message: 'Project posted successfully and published to marketplace',
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create project';
    console.error('Project POST API error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
