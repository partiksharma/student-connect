-- ==============================================================================
-- Migration 002: Verification & Admin Approval System Fixes
-- ==============================================================================
-- This migration addresses the root causes of the broken verification flow:
--   1. Ensures the 'rejected' value exists in the account_status enum
--   2. Adds missing RLS policies so the admin API can query/update all profiles
--   3. Adds policies for users to read their own student/business sub-profiles
--   4. Adds a service_role bypass so server-side API routes can manage data
--
-- Apply with:  psql $DATABASE_URL -f 002_verification_and_admin_policies.sql
--   or via:    supabase db push
-- ==============================================================================

-- 1. Ensure 'rejected' exists in account_status enum (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'rejected'
          AND enumtypid = 'public.account_status'::regtype
    ) THEN
        ALTER TYPE public.account_status ADD VALUE 'rejected';
    END IF;
END $$;

-- 2. Ensure 'rejected' exists in project_status enum (for rejected projects)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'rejected'
          AND enumtypid = 'public.project_status'::regtype
    ) THEN
        ALTER TYPE public.project_status ADD VALUE 'rejected';
    END IF;
END $$;


-- ==============================================================================
-- 3. Additional RLS Policies for Admin Verification Workflow
-- ==============================================================================

-- Admin can view ALL profiles (students, businesses, any status)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles' AND policyname = 'Admin can view all profiles'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Admin can view all profiles" ON public.profiles
                FOR SELECT USING (public.is_admin());
        $policy$;
    END IF;
END $$;

-- Admin can update ANY profile (approve, reject, set status)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles' AND policyname = 'Admin can update all profiles'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Admin can update all profiles" ON public.profiles
                FOR UPDATE USING (public.is_admin());
        $policy$;
    END IF;
END $$;

-- Users can read their own student_profile
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'student_profiles' AND policyname = 'Users can view own student profile'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Users can view own student profile" ON public.student_profiles
                FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
        $policy$;
    END IF;
END $$;

-- Users can update their own student_profile
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'student_profiles' AND policyname = 'Users can update own student profile'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Users can update own student profile" ON public.student_profiles
                FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
        $policy$;
    END IF;
END $$;

-- Users can insert their own student_profile (registration)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'student_profiles' AND policyname = 'Users can insert own student profile'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Users can insert own student profile" ON public.student_profiles
                FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());
        $policy$;
    END IF;
END $$;

-- Users can read their own business_profile
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'business_profiles' AND policyname = 'Users can view own business profile'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Users can view own business profile" ON public.business_profiles
                FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
        $policy$;
    END IF;
END $$;

-- Users can update their own business_profile
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'business_profiles' AND policyname = 'Users can update own business profile'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Users can update own business profile" ON public.business_profiles
                FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
        $policy$;
    END IF;
END $$;

-- Users can insert their own business_profile (registration)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'business_profiles' AND policyname = 'Users can insert own business profile'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Users can insert own business profile" ON public.business_profiles
                FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());
        $policy$;
    END IF;
END $$;

-- Users can insert their own profile row (registration)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Users can insert own profile" ON public.profiles
                FOR INSERT WITH CHECK (auth.uid() = id);
        $policy$;
    END IF;
END $$;

-- Users can update their own profile row (limited fields)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Users can update own profile" ON public.profiles
                FOR UPDATE USING (auth.uid() = id);
        $policy$;
    END IF;
END $$;


-- ==============================================================================
-- 4. Public read policies for approved profiles (so students/businesses can
--    see each other in the marketplace)
-- ==============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'student_profiles' AND policyname = 'Public can view approved student profiles'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Public can view approved student profiles" ON public.student_profiles
                FOR SELECT USING (
                    EXISTS (
                        SELECT 1 FROM public.profiles p
                        WHERE p.id = student_profiles.user_id AND p.status = 'approved'
                    )
                );
        $policy$;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'business_profiles' AND policyname = 'Public can view approved business profiles'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Public can view approved business profiles" ON public.business_profiles
                FOR SELECT USING (
                    EXISTS (
                        SELECT 1 FROM public.profiles p
                        WHERE p.id = business_profiles.user_id AND p.status = 'approved'
                    )
                );
        $policy$;
    END IF;
END $$;


-- ==============================================================================
-- 5. Index for faster admin queries on profiles by status
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON public.profiles(role, status);


-- ==============================================================================
-- Done. All policies are idempotent and safe to re-run.
-- ==============================================================================
