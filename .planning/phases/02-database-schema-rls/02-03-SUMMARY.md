---
phase: 02-database-schema-rls
plan: "03"
subsystem: database
tags: [supabase, postgresql, migrations, rls, seed, remote-push]
dependency_graph:
  requires:
    - supabase/migrations/20260522000001_create_enums.sql
    - supabase/migrations/20260522000002_create_tables.sql
    - supabase/migrations/20260522000003_create_indexes.sql
    - supabase/migrations/20260522000004_enable_rls.sql
    - supabase/migrations/20260522000005_rls_helper_functions.sql
    - supabase/migrations/20260522000006_rls_policies_orgs.sql
    - supabase/migrations/20260522000007_rls_policies_org_members.sql
    - supabase/migrations/20260522000008_rls_policies_assessments.sql
    - supabase/seed.sql
  provides:
    - Remote Supabase database with complete schema + RLS + seed data
  affects:
    - Phase 3 (Auth) — depends on remote DB being ready before login flow is built
tech_stack:
  added: []
  patterns:
    - supabase db push via CLI (preferred) or Dashboard SQL Editor (fallback)
    - SUPABASE_ACCESS_TOKEN required for CLI authentication
key_files:
  created:
    - .planning/phases/02-database-schema-rls/02-03-SUMMARY.md
  modified: []
decisions:
  - "Authentication gate encountered — SUPABASE_ACCESS_TOKEN required to push via CLI; user must supply token or apply via Dashboard SQL Editor"
  - "All 8 migration files + seed.sql confirmed present on disk and ready to apply"
metrics:
  duration: "~5 min (pre-conditions check only)"
  completed: "2026-05-22T15:41:48Z"
  tasks_completed: 0
  tasks_total: 2
  files_created: 1
  files_modified: 0
---

# Phase 2 Plan 03: Remote Migration Push and RLS Verification Summary

**One-liner:** Authentication gate hit before remote push — all 8 migrations + seed.sql confirmed on disk and ready; SUPABASE_ACCESS_TOKEN required to proceed with `supabase db push` or user must apply via Dashboard SQL Editor.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| — | Pre-conditions check (local) | (no commit — no files changed) | 8 migration files + seed.sql confirmed present |

## What Was Built

### Pre-conditions Check — PASSED

All local pre-conditions verified:

```
ls supabase/migrations/*.sql | wc -l   → 8  ✓
ls supabase/seed.sql                   → found  ✓
```

Migration files confirmed in order:
- `20260522000001_create_enums.sql` — member_role + assessment_status enums
- `20260522000002_create_tables.sql` — orgs, org_members, assessments tables
- `20260522000003_create_indexes.sql` — 7 indexes for RLS, dashboard, history queries
- `20260522000004_enable_rls.sql` — RLS enabled on all 3 tables
- `20260522000005_rls_helper_functions.sql` — is_admin() + is_org_member() SECURITY DEFINER functions
- `20260522000006_rls_policies_orgs.sql` — 3 policies on orgs table
- `20260522000007_rls_policies_org_members.sql` — 4 policies on org_members table
- `20260522000008_rls_policies_assessments.sql` — 4 policies on assessments table (including append-only enforcement)
- `seed.sql` — 2 users + 2 orgs + 2 memberships + 1 draft assessment

### Remote Push — BLOCKED (Authentication Gate)

The Supabase CLI (2.101.0) is installed and the project has a `.mcp.json` configured for the Supabase MCP server at `https://mcp.supabase.com/mcp?project_ref=zbfajqtvplabdcmjmdiw`.

However:
- `supabase login` has not been performed — no access token is cached at `~/.config/supabase/access-token`
- The Supabase MCP HTTP endpoint returns `401 Unauthorized` without a PAT
- The `.env.local` file contains only the publishable key (`VITE_SUPABASE_PUBLISHABLE_KEY`) — not the service role key or database password needed for DDL execution
- No `SUPABASE_ACCESS_TOKEN` environment variable is set

The CLI reports: "Access token not provided. Supply an access token by running supabase login or setting the SUPABASE_ACCESS_TOKEN environment variable."

## How to Complete This Plan

### Option A — Supabase CLI (preferred, takes ~2 minutes)

1. Generate a Personal Access Token:
   - Go to https://supabase.com/dashboard/account/tokens
   - Click "Generate new token"
   - Copy the token

2. Set the token and link the project:
   ```bash
   export SUPABASE_ACCESS_TOKEN="<your-token>"
   cd "/Users/DaviAlves/Documents/Desenvolvimento/Giba/Roteiro Unificado"
   supabase link --project-ref zbfajqtvplabdcmjmdiw
   supabase db push
   ```

3. Apply seed data via Dashboard SQL Editor (seed requires interactive SQL exec):
   - Open https://supabase.com/dashboard/project/zbfajqtvplabdcmjmdiw/sql/new
   - Paste the contents of `supabase/seed.sql`
   - Click "Run"

### Option B — Dashboard SQL Editor only (fallback, takes ~5 minutes)

Open https://supabase.com/dashboard/project/zbfajqtvplabdcmjmdiw/sql/new and execute each file in order:

1. `supabase/migrations/20260522000001_create_enums.sql`
2. `supabase/migrations/20260522000002_create_tables.sql`
3. `supabase/migrations/20260522000003_create_indexes.sql`
4. `supabase/migrations/20260522000004_enable_rls.sql`
5. `supabase/migrations/20260522000005_rls_helper_functions.sql`
6. `supabase/migrations/20260522000006_rls_policies_orgs.sql`
7. `supabase/migrations/20260522000007_rls_policies_org_members.sql`
8. `supabase/migrations/20260522000008_rls_policies_assessments.sql`
9. `supabase/seed.sql`

After each SQL block, verify "Success. No rows returned" (or similar) — any error should be investigated before proceeding.

### Post-Application Verification (Task 2 of the plan)

After applying migrations and seed:

**Verification 1 — Tables exist** (Dashboard → Table Editor):
- `orgs`: id, name, cnpj, active, created_at — RLS enabled
- `org_members`: id, org_id, user_id, role, created_at — RLS enabled
- `assessments`: id, org_id, status, version, form_data, readiness_level_mgmt, readiness_level_tech, created_at, submitted_at — RLS enabled

**Verification 2 — Helper functions** (Dashboard → Database → Functions):
- `is_admin` — schema: public, SECURITY DEFINER
- `is_org_member` — schema: public, SECURITY DEFINER

**Verification 3 — Seed data** (Dashboard → Table Editor):
- `orgs`: 2 rows — "SuaEquipe.IA (Admin)" and "Construtora Teste 1"
- `org_members`: 2 rows — admin@suaequipe.ia (role: admin) and empresa1@teste.com (role: company)
- `assessments`: 1 row — status: draft
- Authentication → Users: 2 users (admin@suaequipe.ia, empresa1@teste.com)

**Verification 4 — RLS isolation** (Dashboard → SQL Editor):
```sql
-- Get empresa1 user_id first:
SELECT id FROM auth.users WHERE email = 'empresa1@teste.com';
-- Then test RLS:
SET LOCAL role = 'authenticated';
SET LOCAL "request.jwt.claim.sub" = '<UUID_empresa1>';
SELECT count(*) FROM public.orgs;        -- Expected: 1 (only their org)
SELECT count(*) FROM public.assessments; -- Expected: 1 (only their draft)
```

## Deviations from Plan

**1. [Auth Gate] Supabase access token not available for CLI push**
- **Found during:** Task 1, Etapa 2
- **Issue:** `SUPABASE_ACCESS_TOKEN` is not set and Supabase CLI has not been authenticated. The Supabase MCP HTTP endpoint also returns 401. No service role key is in the `.env.local`.
- **Disposition:** Authentication gate — user action required. This is NOT a bug or a deviation in the plan design; the plan's `user_setup` section explicitly called for `SUPABASE_ACCESS_TOKEN` via Supabase Dashboard → Account → Access Tokens.
- **Resolution path:** User provides PAT and reruns CLI push, or applies SQL directly in Dashboard SQL Editor.

## Known Stubs

None in local files — all 8 migration files and seed.sql are complete, ready SQL. The database schema is fully written and correct; it just hasn't been applied to the remote instance yet.

## Threat Flags

No new threat surface. All files are on-disk only; no network surface has been changed yet. The remote Supabase project remains in its pre-migration state (no tables created).

## Self-Check: PARTIAL

Files exist:
- supabase/migrations/20260522000001_create_enums.sql — FOUND
- supabase/migrations/20260522000002_create_tables.sql — FOUND
- supabase/migrations/20260522000003_create_indexes.sql — FOUND
- supabase/migrations/20260522000004_enable_rls.sql — FOUND
- supabase/migrations/20260522000005_rls_helper_functions.sql — FOUND
- supabase/migrations/20260522000006_rls_policies_orgs.sql — FOUND
- supabase/migrations/20260522000007_rls_policies_org_members.sql — FOUND
- supabase/migrations/20260522000008_rls_policies_assessments.sql — FOUND
- supabase/seed.sql — FOUND
- .planning/phases/02-database-schema-rls/02-03-SUMMARY.md — FOUND (this file)

Remote database state: NOT VERIFIED — blocked by auth gate.
Plan is INCOMPLETE — awaiting human action to supply Supabase credentials and push migrations.
