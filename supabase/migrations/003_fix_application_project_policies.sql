-- ==============================================================================
-- Migration 003: Fix Application & Project RLS Policies
-- ==============================================================================
-- ROOT CAUSE FIX: Applications and projects had no INSERT/UPDATE RLS policies,
-- causing all server-side writes to fail silently when using the anon key.
--
-- This migration adds:
--   1. INSERT/UPDATE/SELECT policies for applications table
--   2. INSERT/UPDATE policies for projects table 
--   3. SELECT policy for all project statuses (not just 'open')
--   4. Permissive public INSERT policies for server-side API operations
--
-- Apply with: psql $DATABASE_URL -f 003_fix_application_project_policies.sql
-- ==============================================================================

-- ==============================================================================
-- 1. APPLICATIONS TABLE POLICIES
-- ==============================================================================

-- Allow anyone to read applications (server-side API needs this)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'applications' AND policyname = 'Public can view applications'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Public can view applications" ON public.applications
                FOR SELECT USING (true);
        $policy$;
    END IF;
END $$;

-- Allow application insertion (students applying to projects)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'applications' AND policyname = 'Anyone can insert applications'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Anyone can insert applications" ON public.applications
                FOR INSERT WITH CHECK (true);
        $policy$;
    END IF;
END $$;

-- Allow application status updates (client accept/reject)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'applications' AND policyname = 'Anyone can update applications'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Anyone can update applications" ON public.applications
                FOR UPDATE USING (true);
        $policy$;
    END IF;
END $$;


-- ==============================================================================
-- 2. PROJECTS TABLE POLICIES
-- ==============================================================================

-- Allow project insertion (clients posting projects)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'projects' AND policyname = 'Anyone can insert projects'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Anyone can insert projects" ON public.projects
                FOR INSERT WITH CHECK (true);
        $policy$;
    END IF;
END $$;

-- Allow project updates (status changes, applicant count updates)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'projects' AND policyname = 'Anyone can update projects'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Anyone can update projects" ON public.projects
                FOR UPDATE USING (true);
        $policy$;
    END IF;
END $$;

-- Allow reading ALL projects (not just open ones) so clients can see their own
-- The existing policy only allows SELECT WHERE status='open', which blocks
-- clients from seeing their own in_progress/completed/draft projects.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'projects' AND policyname = 'Public can view all projects'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Public can view all projects" ON public.projects
                FOR SELECT USING (true);
        $policy$;
    END IF;
END $$;


-- ==============================================================================
-- 3. STUDENT_PROFILES & BUSINESS_PROFILES - ensure insert for server API
-- ==============================================================================

-- Allow insert into student_profiles from server API (auto-create on application)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'student_profiles' AND policyname = 'Server can insert student profiles'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Server can insert student profiles" ON public.student_profiles
                FOR INSERT WITH CHECK (true);
        $policy$;
    END IF;
END $$;

-- Allow insert into business_profiles from server API (auto-create on project post)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'business_profiles' AND policyname = 'Server can insert business profiles'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Server can insert business profiles" ON public.business_profiles
                FOR INSERT WITH CHECK (true);
        $policy$;
    END IF;
END $$;

-- Allow read of all student profiles (needed for application enrichment)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'student_profiles' AND policyname = 'Public can view all student profiles'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Public can view all student profiles" ON public.student_profiles
                FOR SELECT USING (true);
        $policy$;
    END IF;
END $$;

-- Allow read of all business profiles (needed for project enrichment)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'business_profiles' AND policyname = 'Public can view all business profiles'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Public can view all business profiles" ON public.business_profiles
                FOR SELECT USING (true);
        $policy$;
    END IF;
END $$;

-- Allow inserting profiles from server API (registration flow)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles' AND policyname = 'Server can insert profiles'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Server can insert profiles" ON public.profiles
                FOR INSERT WITH CHECK (true);
        $policy$;
    END IF;
END $$;

-- Allow updating profiles from server API (admin approval)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles' AND policyname = 'Server can update profiles'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Server can update profiles" ON public.profiles
                FOR UPDATE USING (true);
        $policy$;
    END IF;
END $$;


-- ==============================================================================
-- 4. Indexes for performance
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_applications_project_id ON public.applications(project_id);
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON public.applications(student_id);
CREATE INDEX IF NOT EXISTS idx_projects_business_id ON public.projects(business_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);


-- ==============================================================================
-- Done. All policies are idempotent and safe to re-run.
-- ==============================================================================
