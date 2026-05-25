-- Migration: 20260525000001_rpc_org_members_with_email.sql
-- Adds a SECURITY DEFINER RPC that returns org_members rows enriched with email
-- from auth.users. Accessible only to admins (guard inside function body).
--
-- Design notes:
--   SECURITY DEFINER: runs as postgres, bypassing RLS on auth.users
--   SET search_path = '': prevents search_path hijacking (same pattern as is_admin)
--   Admin guard: explicit check inside body — callers without admin role get empty result
--   No view used: views require SECURITY INVOKER/DEFINER gymnastics; RPC is simpler
--
-- Returns one row per org_member for the given org_id with:
--   id, org_id, user_id, role, created_at, email

CREATE OR REPLACE FUNCTION public.get_org_members_with_email(p_org_id UUID)
RETURNS TABLE (
  id         UUID,
  org_id     UUID,
  user_id    UUID,
  role       public.member_role,
  created_at TIMESTAMPTZ,
  email      TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  -- Guard: only admins may call this function.
  -- Non-admins receive an empty result set (safe — no error leak).
  SELECT
    m.id,
    m.org_id,
    m.user_id,
    m.role,
    m.created_at,
    u.email
  FROM public.org_members m
  JOIN auth.users u ON u.id = m.user_id
  WHERE m.org_id = p_org_id
    AND (SELECT public.is_admin())
  ORDER BY m.created_at DESC;
$$;

-- Grant execute to authenticated users.
-- The is_admin() guard inside the function enforces the actual restriction.
GRANT EXECUTE ON FUNCTION public.get_org_members_with_email(UUID) TO authenticated;
