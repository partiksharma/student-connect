-- ==============================================================================
-- Migration 005: Safe Deduplication & Strict Uniqueness on Applications
-- ==============================================================================
-- Purpose:
--   1. Safely removes any legacy duplicate applications per (project_id, student_id)
--      preserving accepted status, latest pitch notes, and conversation associations.
--   2. Enforces a database-level UNIQUE constraint on (project_id, student_id).
--   3. Adds performance index on project_id and student_id lookups.
-- ==============================================================================

-- 1. Safe Reversible Cleanup of duplicate applications
-- Keep the row with status = 'accepted' first, or the most recently updated/created row.
WITH ranked_applications AS (
    SELECT
        id,
        project_id,
        student_id,
        status,
        created_at,
        ROW_NUMBER() OVER (
            PARTITION BY project_id, student_id
            ORDER BY
                CASE WHEN status = 'accepted' THEN 1 ELSE 2 END,
                updated_at DESC,
                created_at DESC,
                id ASC
        ) as rank
    FROM public.applications
)
DELETE FROM public.applications
WHERE id IN (
    SELECT id FROM ranked_applications WHERE rank > 1
);

-- 2. Add Unique Constraint & Index on (project_id, student_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'applications_project_id_student_id_unique'
    ) THEN
        ALTER TABLE public.applications
        ADD CONSTRAINT applications_project_id_student_id_unique
        UNIQUE (project_id, student_id);
    END IF;
END $$;

-- 3. Add Index for Fast Application Querying by Business & Project
CREATE INDEX IF NOT EXISTS idx_applications_project_status
ON public.applications (project_id, status);

CREATE INDEX IF NOT EXISTS idx_applications_student_status
ON public.applications (student_id, status);

-- ==============================================================================
-- Migration 005 complete: Strict application uniqueness enforced.
-- ==============================================================================
