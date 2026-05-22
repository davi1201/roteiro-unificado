-- Migration: 20260522000005_rls_helper_functions.sql
-- Phase 2: Database Schema & RLS
-- Creates SECURITY DEFINER helper functions used by all RLS policies.
-- Depends on: 20260522000002_create_tables.sql (public.org_members must exist)
--
-- Design notes:
--   SECURITY DEFINER: function runs as its owner (postgres), bypassing RLS on org_members.
--   SET search_path = '': prevents search_path hijacking attacks (required for SECURITY DEFINER).
--   (SELECT auth.uid()): wraps auth.uid() in a subselect so Postgres can cache the result
--     per statement — up to 95% faster than bare auth.uid() per Supabase RLS docs.
--   STABLE: tells Postgres the function returns the same result within a single statement.

-- is_admin(): returns TRUE if the current authenticated user has role='admin' in any org.
-- Used in cross-org policies to grant admins access to all organizations' data.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.org_members
    WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
  );
$$;

-- is_org_member(p_org_id): returns TRUE if the current user belongs to the given org.
-- Used in per-org policies to restrict access to a user's own organization.
-- IMPORTANT: Do NOT expose via Supabase RPC without extra auth guard — accepts org_id
--   parameter, which could be used for membership enumeration via brute-force.
CREATE OR REPLACE FUNCTION public.is_org_member(p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.org_members
    WHERE user_id = (SELECT auth.uid())
      AND org_id = p_org_id
  );
$$;
