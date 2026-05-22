-- Migration: 20260522000007_rls_policies_org_members.sql
-- Phase 2: Database Schema & RLS
-- RLS policies for public.org_members table.
-- Depends on: 20260522000004_enable_rls.sql, 20260522000005_rls_helper_functions.sql
--
-- Policy summary:
--   SELECT: admin sees all memberships; company sees only their own membership record
--   INSERT: admin only (prevents self-promotion — T-02-P03)
--   UPDATE: admin only (prevents role elevation by company users — T-02-P03)
--   DELETE: admin only (admin can remove members from any org)
--
-- Security note: restricting INSERT/UPDATE to admin prevents a company user from
-- adding themselves to a different org or elevating their own role to 'admin'.

-- org_members: SELECT — admin sees all; user sees their own membership row
CREATE POLICY "org_members_select"
  ON public.org_members FOR SELECT
  TO authenticated
  USING (
    (SELECT public.is_admin())
    OR user_id = (SELECT auth.uid())
  );

-- org_members: INSERT — admin only (company cannot add members or promote themselves)
CREATE POLICY "org_members_insert"
  ON public.org_members FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT public.is_admin())
  );

-- org_members: UPDATE — admin only (company cannot change role or org_id)
CREATE POLICY "org_members_update"
  ON public.org_members FOR UPDATE
  TO authenticated
  USING (
    (SELECT public.is_admin())
  )
  WITH CHECK (
    (SELECT public.is_admin())
  );

-- org_members: DELETE — admin only (admin can revoke memberships)
CREATE POLICY "org_members_delete"
  ON public.org_members FOR DELETE
  TO authenticated
  USING (
    (SELECT public.is_admin())
  );
