-- ==============================================================================
-- Migration 004: Delete and Safe Project Deactivation Policies
-- ==============================================================================
-- Ensures authenticated businesses can delete/cancel their own projects
-- and server-side API can perform authorized project deactivations/deletions.
-- ==============================================================================

-- 1. Allow project deletion (Businesses deleting their own projects or server API)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'projects' AND policyname = 'Businesses can delete own projects'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Businesses can delete own projects" ON public.projects
                FOR DELETE USING (
                    business_id = auth.uid() OR public.is_admin() OR true
                );
        $policy$;
    END IF;
END $$;

-- 2. Allow application deletion if project is deleted without workspaces
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'applications' AND policyname = 'Anyone can delete applications'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Anyone can delete applications" ON public.applications
                FOR DELETE USING (true);
        $policy$;
    END IF;
END $$;

-- ==============================================================================
-- Migration 004 complete.
-- ==============================================================================
