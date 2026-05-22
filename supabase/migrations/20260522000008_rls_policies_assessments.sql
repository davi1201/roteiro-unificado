-- Migration: 20260522000008_rls_policies_assessments.sql
-- Phase 2: Database Schema & RLS
-- RLS policies for public.assessments table.
-- Depends on: 20260522000004_enable_rls.sql, 20260522000005_rls_helper_functions.sql
--
-- Policy summary:
--   SELECT: admin sees all; company sees only their org's assessments
--   INSERT: company can insert for their own org (admin can too via is_admin pass-through)
--   UPDATE (draft): company can update draft assessments in their own org — submitted rows are immutable (T-02-P02)
--   UPDATE (admin): admin can update any assessment (needed for status transitions in Phase 4)
--   DELETE: NO POLICY — append-only by design (SAVE-04, ORG-04)
--
-- Append-only enforcement:
--   No DELETE policy means DELETE always returns 0 rows for all roles (silently blocked).
--   UPDATE for company role is restricted to status='draft' in both USING and WITH CHECK —
--   a submitted assessment cannot be transitioned back to draft by a company user.

-- assessments: SELECT — admin sees all; company sees their org's assessments only
CREATE POLICY "assessments_select"
  ON public.assessments FOR SELECT
  TO authenticated
  USING (
    (SELECT public.is_admin())
    OR
    (SELECT public.is_org_member(org_id))
  );

-- assessments: INSERT — company can insert for their own org only
CREATE POLICY "assessments_insert"
  ON public.assessments FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT public.is_org_member(org_id))
  );

-- assessments: UPDATE (company role) — restricted to draft rows in their own org (T-02-P02)
-- Both USING and WITH CHECK include status='draft' to prevent submitted→draft regression.
CREATE POLICY "assessments_update_draft"
  ON public.assessments FOR UPDATE
  TO authenticated
  USING (
    (SELECT public.is_org_member(org_id))
    AND status = 'draft'
  )
  WITH CHECK (
    (SELECT public.is_org_member(org_id))
    AND status = 'draft'
  );

-- assessments: UPDATE (admin role) — admin can update any assessment (e.g., status transitions)
CREATE POLICY "assessments_update_admin"
  ON public.assessments FOR UPDATE
  TO authenticated
  USING (
    (SELECT public.is_admin())
  )
  WITH CHECK (
    (SELECT public.is_admin())
  );

-- No DELETE policy on assessments — append-only by design (SAVE-04, ORG-04).
-- Omitting DELETE means DELETE always returns 0 rows for all roles (silently blocked by RLS).
