import { NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/auth-server';
import { generateUUID } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      role,
      fullName,
      school,
      graduationYear,
      skills,
      availabilityHours,
      bio,
      portfolioUrls,
      businessName,
      industry,
      businessSize,
      location,
      description,
      websiteUrl,
    } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Security: Users cannot assign themselves admin role
    if (role !== 'student' && role !== 'business') {
      return NextResponse.json({ error: 'Invalid user role specified' }, { status: 400 });
    }

    const supabase = getServerSupabaseClient();

    // 1. Check if a profile with this email already exists
    const { data: existingProfile, error: searchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (searchError && searchError.code !== 'PGRST116') {
      console.warn('Error checking existing profile:', searchError);
    }

    if (existingProfile) {
      if (existingProfile.status === 'approved') {
        return NextResponse.json(
          { error: 'An account with this email is already registered and approved. Please sign in.' },
          { status: 409 }
        );
      }

      // Reconciliation mechanism: Update the existing profile record without violating UNIQUE constraint
      const userId = existingProfile.id;
      const now = new Date().toISOString();

      await supabase
        .from('profiles')
        .update({
          role,
          status: 'pending_approval',
          updated_at: now,
        })
        .eq('id', userId);

      if (role === 'student') {
        await supabase
          .from('student_profiles')
          .upsert(
            {
              user_id: userId,
              full_name: fullName || existingProfile.email.split('@')[0],
              school: school || 'University',
              graduation_year: graduationYear || 2027,
              skills: skills || [],
              availability_hours_per_week: availabilityHours || 8,
              bio: bio || '',
              portfolio_urls: portfolioUrls || [],
              is_public: true,
              updated_at: now,
            },
            { onConflict: 'user_id' }
          );
      } else {
        await supabase
          .from('business_profiles')
          .upsert(
            {
              user_id: userId,
              business_name: businessName || existingProfile.email.split('@')[0],
              industry: industry || 'Small Business',
              business_size: businessSize || '1-5',
              location: location || 'Remote',
              description: description || '',
              website_url: websiteUrl || '',
              updated_at: now,
            },
            { onConflict: 'user_id' }
          );
      }

      const reconciledProfile = {
        id: userId,
        email: cleanEmail,
        role,
        status: 'pending_approval',
        created_at: existingProfile.created_at,
        updated_at: now,
      };

      return NextResponse.json({
        profile: reconciledProfile,
        message: 'Account details updated. Awaiting administrator approval.',
        reconciled: true,
      });
    }

    // 2. New registration: Attempt Supabase Auth creation if password provided
    let authUserId: string | null = null;
    if (password) {
      try {
        const { data: authData } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
        });
        if (authData?.user?.id) {
          authUserId = authData.user.id;
        }
      } catch (authErr) {
        console.warn('Supabase auth signup notice:', authErr);
      }
    }

    const userId = authUserId || generateUUID();
    const now = new Date().toISOString();

    const newProfile = {
      id: userId,
      email: cleanEmail,
      role,
      status: 'pending_approval' as const,
      created_at: now,
      updated_at: now,
    };

    // Insert into profiles
    const { error: profileInsertError } = await supabase.from('profiles').insert([newProfile]);
    if (profileInsertError) {
      console.error('Failed to insert new profile:', profileInsertError);
      return NextResponse.json(
        { error: `Database profile creation failed: ${profileInsertError.message}` },
        { status: 500 }
      );
    }

    // Insert role-specific profile details
    if (role === 'student') {
      const studentData = {
        user_id: userId,
        full_name: fullName || cleanEmail.split('@')[0],
        school: school || 'University',
        graduation_year: graduationYear || 2027,
        skills: skills || [],
        availability_hours_per_week: availabilityHours || 8,
        bio: bio || '',
        portfolio_urls: portfolioUrls || [],
        is_public: true,
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        created_at: now,
        updated_at: now,
      };

      const { error: studentInsertError } = await supabase.from('student_profiles').insert([studentData]);
      if (studentInsertError) {
        console.error('Failed to insert student profile:', studentInsertError);
      }
    } else {
      const businessData = {
        user_id: userId,
        business_name: businessName || cleanEmail.split('@')[0],
        industry: industry || 'Small Business',
        business_size: businessSize || '1-5',
        location: location || 'Remote',
        description: description || 'Registered client partner.',
        website_url: websiteUrl || '',
        logo_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80',
        created_at: now,
        updated_at: now,
      };

      const { error: bizInsertError } = await supabase.from('business_profiles').insert([businessData]);
      if (bizInsertError) {
        console.error('Failed to insert business profile:', bizInsertError);
      }
    }

    return NextResponse.json(
      {
        profile: newProfile,
        message: 'Registration successful. Account awaiting admin verification.',
        reconciled: false,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown registration error';
    console.error('Registration API error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
