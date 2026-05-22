---
phase: 02-database-schema-rls
plan: "02"
subsystem: database
tags: [supabase, postgresql, rls, security, seed, multi-tenant]
dependency_graph:
  requires:
    - supabase/migrations/20260522000001_create_enums.sql
    - supabase/migrations/20260522000002_create_tables.sql
    - supabase/migrations/20260522000003_create_indexes.sql
    - roteiro-unificado/src/types/database.ts
  provides:
    - supabase/migrations/20260522000004_enable_rls.sql
    - supabase/migrations/20260522000005_rls_helper_functions.sql
    - supabase/migrations/20260522000006_rls_policies_orgs.sql
    - supabase/migrations/20260522000007_rls_policies_org_members.sql
    - supabase/migrations/20260522000008_rls_policies_assessments.sql
    - supabase/seed.sql
  affects:
    - All future phases that query the three tenant-isolated tables
    - Phase 3 (Auth) relies on RLS policies being correct before login flow is built
tech_stack:
  added: []
  patterns:
    - SECURITY DEFINER helper functions (is_admin, is_org_member) for cross-org RLS
    - (SELECT auth.uid()) wrapper pattern for RLS performance (avoids per-row evaluation)
    - SET search_path = '' on all SECURITY DEFINER functions (prevents privilege escalation)
    - Append-only enforcement via missing DELETE policy on assessments
    - pgcrypto seed pattern with paired auth.users + auth.identities rows
key_files:
  created:
    - supabase/migrations/20260522000004_enable_rls.sql
    - supabase/migrations/20260522000005_rls_helper_functions.sql
    - supabase/migrations/20260522000006_rls_policies_orgs.sql
    - supabase/migrations/20260522000007_rls_policies_org_members.sql
    - supabase/migrations/20260522000008_rls_policies_assessments.sql
    - supabase/seed.sql
  modified: []
decisions:
  - "All USING/WITH CHECK clauses use (SELECT auth.uid()) wrapper — 95% perf gain per Supabase docs"
  - "assessments UPDATE policy split into two: assessments_update_draft (company, draft-only) and assessments_update_admin (admin, any) — required to allow admin status transitions in Phase 4"
  - "No DELETE policy on orgs or assessments — append-only by design; soft-delete via active column for orgs in Phase 4"
  - "seed.sql uses DO $$ DECLARE ... END $$ block for variable reuse across INSERT statements"
  - "active=TRUE included explicitly in public.orgs INSERT — Pattern 5 in RESEARCH.md was outdated and omitted this column"
metrics:
  duration: "~10 min"
  completed: "2026-05-22T00:00:00Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 6
  files_modified: 0
---

# Phase 2 Plan 02: RLS Policies and Seed SQL Summary

**One-liner:** RLS enabled on 3 tables with SECURITY DEFINER helper functions (is_admin, is_org_member), 11 policies covering all tables with append-only enforcement, and seed.sql with 2 test users correctly paired with auth.identities rows.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Criar migrations de RLS — enable, helper functions e policies | 3d46725 | 5 migration SQL files (000004–000008) |
| 2 | Criar seed SQL com usuários de teste e assessment inicial | d5713c2 | supabase/seed.sql |

## What Was Built

### Task 1 — RLS Migrations (000004–000008)

Five migration files were created in application order:

**20260522000004_enable_rls.sql** — Enables RLS on all three tables:
- `ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY`
- `ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY`
- `ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY`

With RLS enabled and no policies, all operations are denied by default until migration 000006 adds policies.

**20260522000005_rls_helper_functions.sql** — Two SECURITY DEFINER helper functions:
- `public.is_admin()`: returns TRUE if current user has `role='admin'` in any org in `org_members`. Uses `SECURITY DEFINER` (runs as postgres, bypasses RLS) + `SET search_path = ''` (prevents search path hijacking) + `STABLE` (Postgres can cache within a statement).
- `public.is_org_member(p_org_id UUID)`: returns TRUE if current user belongs to the given org. Same SECURITY DEFINER + SET search_path = '' + STABLE configuration.
- Both functions use `(SELECT auth.uid())` with the subselect wrapper for performance caching.

**20260522000006_rls_policies_orgs.sql** — 3 policies for `public.orgs`:
- `orgs_select`: admin sees all orgs; company sees only their own org (via `is_org_member(id)`)
- `orgs_insert`: admin only
- `orgs_update`: admin only (both USING and WITH CHECK)
- No DELETE policy — soft-delete via `active=FALSE` in Phase 4

**20260522000007_rls_policies_org_members.sql** — 4 policies for `public.org_members`:
- `org_members_select`: admin sees all; user sees only their own membership row (`user_id = (SELECT auth.uid())`)
- `org_members_insert`: admin only (prevents self-promotion / role elevation by company users — T-02-P03)
- `org_members_update`: admin only (prevents role changes)
- `org_members_delete`: admin only (admin can revoke memberships)

**20260522000008_rls_policies_assessments.sql** — 4 policies for `public.assessments`:
- `assessments_select`: admin sees all; company sees their org's assessments only
- `assessments_insert`: company can insert for their own org (is_org_member check)
- `assessments_update_draft`: company can update only `status='draft'` rows in their org — both USING and WITH CHECK include `AND status = 'draft'` (T-02-P02 enforcement)
- `assessments_update_admin`: admin can update any assessment (needed for Phase 4 status transitions)
- No DELETE policy — append-only by design (SAVE-04, ORG-04)

### Task 2 — seed.sql

`supabase/seed.sql` creates a complete test environment in a single idempotent `DO $$ ... END $$` block:

- **2 auth.users**: `admin@suaequipe.ia` and `empresa1@teste.com` with bcrypt-hashed passwords (pgcrypto `crypt()` + `gen_salt('bf')`)
- **2 auth.identities**: one paired immediately after each auth.users INSERT — critical for login to return a valid session (Pitfall 1 from RESEARCH.md)
- **2 public.orgs**: `SuaEquipe.IA (Admin)` (no CNPJ) and `Construtora Teste 1` (CNPJ: 12.345.678/0001-99), both with `active=TRUE` explicit
- **2 public.org_members**: admin → SuaEquipe.IA org (`role='admin'`); empresa1 → Construtora Teste 1 (`role='company'`)
- **1 public.assessments**: draft assessment for empresa1 (`status='draft'`, `version=1`, `form_data='{}'`)

Header comment documents credentials and warns against using `supabase db reset` on remote.

## Verification

All plan acceptance criteria and final verification checks passed:

```
ls 5 migration files (000004–000008)                      → all found
grep -c "ENABLE ROW LEVEL SECURITY" *000004*              → 3
grep -c "^SECURITY DEFINER" *000005*                      → 2 (function keywords only)
grep -c "SET search_path = ''" *000005*                   → 2 (function declarations)
grep -c "SELECT auth.uid()" *000005*                      → 2 (function bodies)
grep -c "CREATE POLICY" *000006*                          → 3 (select, insert, update)
grep -c "CREATE POLICY" *000007*                          → 4 (select, insert, update, delete)
grep -c "CREATE POLICY" *000008*                          → 4 (select, insert, update_draft, update_admin)
grep -c "status = 'draft'" *000008*                       → 2 (USING + WITH CHECK)
ls supabase/migrations/*.sql | wc -l                      → 8
grep -c "INSERT INTO auth.users" seed.sql                 → 2
grep -c "INSERT INTO auth.identities" seed.sql            → 2
grep -c "INSERT INTO public.orgs" seed.sql                → 1
grep -c "INSERT INTO public.org_members" seed.sql         → 1
grep -c "INSERT INTO public.assessments" seed.sql         → 1
grep -c "pgcrypto" seed.sql                               → 2 (comment + CREATE EXTENSION)
grep -c "crypt(" seed.sql                                 → 2 (one per user)
grep -c "00000000-0000-0000-0000-000000000000" seed.sql   → 2
grep -c "db reset" seed.sql                               → 1
grep -c "Admin@123" seed.sql                              → 2 (header + variable)
grep -c "active" seed.sql                                 → 2 (comment + INSERT)
No bare auth.uid() in non-comment lines                   → PASS
```

## Deviations from Plan

None — plan executed exactly as written. All critical requirements were followed:
- `(SELECT auth.uid())` wrapper used throughout (no bare `auth.uid()`)
- `SECURITY DEFINER` + `SET search_path = ''` on both helper functions
- `auth.identities` paired with every `auth.users` INSERT in seed
- `active=TRUE` included explicitly in public.orgs INSERT (RESEARCH.md Pattern 5 was noted as outdated)
- No DELETE policy on assessments (append-only)
- UPDATE on assessments restricted to `status='draft'` for company role

## Known Stubs

None — all migration files are complete, runnable SQL. seed.sql is complete with real bcrypt-hashed passwords. The 8 migration files are ready to be applied to the remote Supabase project via Dashboard SQL Editor or `supabase db push`.

## Threat Flags

No new threat surface beyond what is documented in the plan's threat model. The RLS policies specifically mitigate:
- T-02-P01: SELECT policies present on all tables (no silent UPDATE blocking)
- T-02-P02: assessments_update_draft restricts UPDATE to status='draft' rows
- T-02-P03: org_members INSERT/UPDATE restricted to admin (no self-promotion)
- T-02-P04: Seed passwords documented as test-only in header comment
- T-02-P05: is_admin() takes no parameters (no membership enumeration possible)

## Self-Check: PASSED

Files exist:
- supabase/migrations/20260522000004_enable_rls.sql — FOUND
- supabase/migrations/20260522000005_rls_helper_functions.sql — FOUND
- supabase/migrations/20260522000006_rls_policies_orgs.sql — FOUND
- supabase/migrations/20260522000007_rls_policies_org_members.sql — FOUND
- supabase/migrations/20260522000008_rls_policies_assessments.sql — FOUND
- supabase/seed.sql — FOUND

Commits exist:
- 3d46725 — feat(02-02): create RLS migrations — enable, helper functions and policies — FOUND
- d5713c2 — feat(02-02): create seed.sql with test users, orgs and draft assessment — FOUND
