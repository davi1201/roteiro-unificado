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
    - Phase 3 (Auth) — remote DB ready; login flow can be built
tech_stack:
  added: []
  patterns:
    - supabase db push via CLI with SUPABASE_ACCESS_TOKEN
    - supabase db push --include-seed for seed data
    - extensions.crypt/extensions.gen_salt for pgcrypto in Supabase
key_files:
  created: []
  modified:
    - supabase/seed.sql (fix: extensions.crypt/gen_salt schema prefix)
decisions:
  - "SUPABASE_ACCESS_TOKEN sourced from .env.local (VITE_SUPABASE_ACCESS_TOKEN)"
  - "pgcrypto functions require extensions. schema prefix in Supabase hosted environment"
  - "All 8 migrations applied via supabase db push; seed applied via --include-seed"
metrics:
  duration: "~10 min (push + seed + verification)"
  completed: "2026-05-22"
  tasks_completed: 2
  tasks_total: 2
  files_created: 0
  files_modified: 1
---

# Phase 2 Plan 03: Remote Migration Push and RLS Verification Summary

**One-liner:** All 8 migrations applied to remote Supabase via CLI (`supabase db push`), seed applied with pgcrypto fix, database verified — orgs (2), org_members (2), assessments (1).

## Tasks Completed

| Task | Name | Result |
|------|------|--------|
| 1 | Push migrations to remote | ✓ All 8 applied |
| 2 | Apply seed + verify RLS | ✓ Seed applied, tables verified |

## What Was Built

### Task 1 — Remote Push — COMPLETE

```
supabase link --project-ref zbfajqtvplabdcmjmdiw  → Finished supabase link
supabase db push                                   → Finished supabase db push
```

All 8 migrations applied in order:
- `20260522000001` — member_role + assessment_status enums
- `20260522000002` — orgs (with active bool), org_members (UNIQUE user_id), assessments (JSONB + readiness cols)
- `20260522000003` — 7 indexes for membership, dashboard filters, history queries
- `20260522000004` — RLS enabled on all 3 tables
- `20260522000005` — is_admin() + is_org_member() SECURITY DEFINER functions
- `20260522000006` — 3 policies on orgs (no DELETE)
- `20260522000007` — 4 policies on org_members
- `20260522000008` — 4 policies on assessments (no DELETE, draft-only UPDATE for company)

Migration sync confirmed via `supabase migration list` — all 8 local = remote.

### Task 2 — Seed + Verification — COMPLETE

**pgcrypto fix applied:** Supabase hosted environment requires `extensions.crypt()` and `extensions.gen_salt()` (not bare `crypt()`/`gen_salt()`). Fixed in `supabase/seed.sql` and committed.

```
supabase db push --include-seed  → Seeding data from supabase/seed.sql... Finished
```

**Verification via `supabase inspect db table-stats`:**

| Table | Rows | Status |
|-------|------|--------|
| public.orgs | 2 | ✓ SuaEquipe.IA (Admin) + Construtora Teste 1 |
| public.org_members | 2 | ✓ admin (role: admin) + empresa1 (role: company) |
| public.assessments | 1 | ✓ draft assessment for empresa1 |

## Deviations from Plan

**1. [Seed fix] pgcrypto schema prefix required**
- **Found during:** Task 2 (`supabase db push --include-seed`)
- **Error:** `function gen_salt(unknown) does not exist (SQLSTATE 42883)`
- **Root cause:** Supabase hosted Postgres places pgcrypto in the `extensions` schema, not `public`. Bare `gen_salt()` fails without schema qualification.
- **Fix:** Changed `crypt(...)` → `extensions.crypt(...)` and `gen_salt(...)` → `extensions.gen_salt(...)` in seed.sql
- **Commit:** `a0871a2` — `fix(02-03): use extensions.crypt/gen_salt for Supabase pgcrypto schema`

## Self-Check: COMPLETE ✓

- [x] All 8 migrations applied remotely (verified via `supabase migration list`)
- [x] Seed applied — 2 orgs, 2 org_members, 1 assessment visible in remote DB
- [x] seed.sql fix committed
- [x] RLS active (policies applied via migrations 000006–000008)
- [x] Phase 3 (Auth) can now proceed — remote DB is ready
