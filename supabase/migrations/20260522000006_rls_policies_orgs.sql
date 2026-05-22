-- Migration: 20260522000006_rls_policies_orgs.sql
-- Phase 2: Database Schema & RLS
-- RLS policies for public.orgs table.
-- Depends on: 20260522000004_enable_rls.sql, 20260522000005_rls_helper_functions.sql
--
-- Policy summary:
--   SELECT: admin sees all orgs; company user sees only their own org
--   INSERT: admin only (company users cannot create orgs)
--   UPDATE: admin only (company users cannot modify orgs)
--   DELETE: no policy — soft-delete via active column will be implemented in Phase 4

-- orgs: SELECT — admin sees all; company sees their own org only
CREATE POLICY "orgs_select"
  ON public.orgs FOR SELECT
  TO authenticated
  USING (
    (SELECT public.is_admin())
    OR
    (SELECT public.is_org_member(id))
  );

-- orgs: INSERT — admin only
CREATE POLICY "orgs_insert"
  ON public.orgs FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT public.is_admin())
  );

-- orgs: UPDATE — admin only (USING filters rows visible for update; WITH CHECK validates new data)
CREATE POLICY "orgs_update"
  ON public.orgs FOR UPDATE
  TO authenticated
  USING (
    (SELECT public.is_admin())
  )
  WITH CHECK (
    (SELECT public.is_admin())
  );

-- No DELETE policy on orgs — soft-delete via active=FALSE will be added in Phase 4.
-- Omitting DELETE means DELETE always returns 0 rows for all roles (silently blocked by RLS).
