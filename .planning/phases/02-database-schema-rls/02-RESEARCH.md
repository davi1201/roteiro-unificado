# Phase 2: Database Schema & RLS - Research

**Researched:** 2026-05-22
**Domain:** Supabase PostgreSQL — Schema design, Row Level Security, TypeScript types, migrations, seed data
**Confidence:** HIGH (most claims verified against official Supabase documentation)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** `form_data` stored as **JSONB blob** in `assessments` table — one column per full assessment. Aligned with ROADMAP.
- **D-02:** JSONB stores **complete form snapshot** — all fields, even unpopulated ones (value `null`). Simplifies restore and eliminates merge-with-defaults logic.
- **D-03:** `form_data` schema validation done **exclusively in the app via Zod** — Postgres accepts any valid JSON with no `CHECK constraint`. Allows form field evolution without additional migrations.
- **D-04:** Classification results stored as **direct columns in `assessments`**: `readiness_level_mgmt VARCHAR` (G1–G5) and `readiness_level_tech VARCHAR` (technical level). Calculated at submission, indexed for fast dashboard queries.

### Claude's Discretion
- **Admin identity model**: How SuaEquipe.IA admins are identified (role in `org_members` of internal org vs global flag) — choose the simplest approach that supports cross-org RLS policies.
- **Schema management workflow**: Local Supabase CLI with git-tracked migrations vs SQL in dashboard — follow the approach that the development environment supports.
- **TypeScript types**: Write types manually in `database.ts` for this phase; add comment about regeneration via `supabase gen types typescript` when project has CLI configured.

### Deferred Ideas (OUT OF SCOPE)
None — discussion was focused on the phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ORG-01 | Each construtora is an organization (`org`) isolated by RLS in Supabase | `orgs` table + RLS policies covered in §RLS Policies |
| ORG-02 | User belongs to exactly one org via `org_members` table | `org_members` schema in §Standard Stack; membership check in §RLS Patterns |
| ORG-04 | RLS guarantees that queries from one org never return data from another | Complete policy set in §Architecture Patterns; verified via §Common Pitfalls |
</phase_requirements>

---

## Summary

This phase creates the foundational database layer for a multi-tenant assessment platform. The schema is intentionally minimal — three tables (`orgs`, `org_members`, `assessments`), two enums, and a focused set of RLS policies — while the security model must be provably correct before Phase 3 (Auth) builds on top of it.

The critical design decision is the **admin identity model** (discretion area): the simplest correct approach is to check for `role = 'admin'` in `org_members` for a dedicated internal org (e.g., `org_id` of SuaEquipe.IA's own org). This avoids any global flag, keeping all authorization logic inside the existing `org_members` table and making it expressible in standard RLS `USING` clauses. A `security definer` helper function `public.is_admin()` wraps the lookup and is referenced in all cross-org policies — Supabase's own benchmarks show this pattern yields up to 95% query performance improvement over inline subqueries.

The **Supabase CLI is not installed** on this machine. The recommended fallback is: write migration SQL files in `supabase/migrations/` (for git tracking), initialize the Supabase CLI project structure with `supabase init`, then install CLI via `brew install supabase/tap/supabase` or use `supabase db push --db-url <connection-string>` which does **not** require Docker. The dashboard SQL editor is an acceptable last resort for the remote project, but migrations should still be kept in git.

TypeScript types must be hand-written in the existing `database.ts` skeleton, following the exact three-subtype structure (`Row`, `Insert`, `Update`) that `supabase gen types typescript` would generate — ensuring zero-friction upgrade when the CLI is available.

**Primary recommendation:** Use a `security definer` `is_admin()` function referencing `org_members.role = 'admin'`, write all SQL in `supabase/migrations/` for git tracking, and push with `supabase db push --db-url` (no Docker required).

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Tenant data isolation | Database / Storage (RLS) | — | RLS enforced at Postgres level, not application level — cannot be bypassed by client bugs |
| Admin cross-org access | Database / Storage (RLS) | API / Backend | `is_admin()` security definer function checks membership; anon key client inherits the policy |
| Schema enforcement | Database / Storage (Postgres) | App (Zod) | Structural constraints (FK, NOT NULL) in Postgres; JSONB content validation in Zod |
| Type safety | Frontend/Build (TypeScript) | — | `database.ts` is consumed by the Supabase client and propagated to all TypeScript files |
| Seed / test data | Database / Storage (migration) | — | `supabase/seed.sql` runs after migrations; auth users seeded via pgcrypto |
| Append-only enforcement | Database / Storage (RLS) | App | RLS omits UPDATE/DELETE policies on submitted rows; app also enforces via UI |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | 2.106.1 | Typed Supabase client (already installed) | Official client; already in project |
| Supabase CLI (`supabase`) | 2.101.0 | Migration management, `db push` | Official CLI for schema versioning |
| PostgreSQL (via Supabase) | 15.x | Relational DB with native JSONB + RLS | Supabase managed; no separate install |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `pgcrypto` extension | built-in | `crypt()` + `gen_salt()` for seeding auth.users with hashed passwords | Required for seed.sql with test users |
| `uuid-ossp` extension | built-in | `gen_random_uuid()` — already default in Postgres 13+ | Fallback if `gen_random_uuid()` not available |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `is_admin()` security definer function | Inline subquery in every policy | Inline is simpler but 95% slower per Supabase benchmarks; definer function is more maintainable |
| `role = 'admin'` in `org_members` | Global `is_admin` flag on `auth.users.raw_app_meta_data` | JWT metadata approach avoids extra table lookup but requires admin API to set; `org_members` role is entirely in our schema and simpler |
| `supabase db push` with CLI | Dashboard SQL editor | CLI tracks history in `supabase_migrations` table; dashboard bypasses it — CLI preferred |

**Installation (Supabase CLI — not yet installed):**
```bash
brew install supabase/tap/supabase
# Verify:
supabase --version
```

**Version verification performed:**
```
npm view @supabase/supabase-js version → 2.106.1 (2026-05-22)
npm view supabase version              → 2.101.0 (2026-05-22)
npm view @supabase/ssr version         → 0.10.3  (2026-05-22)
```

---

## Package Legitimacy Audit

No new npm packages are installed in this phase. The only infrastructure change is installing the Supabase CLI globally via Homebrew, which is the official distribution channel documented at supabase.com/docs.

| Tool | Source | Age | Authority | slopcheck | Disposition |
|------|--------|-----|-----------|-----------|-------------|
| `supabase` CLI (brew) | supabase/tap/supabase | 4+ yrs | Official Supabase tap | N/A (brew, not npm) | Approved |
| `@supabase/supabase-js` | npm | 4+ yrs | Official Supabase package | N/A (already installed) | Approved |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

---

## Architecture Patterns

### System Architecture Diagram

```
Browser / React App
        │
        │  anon key (RLS-enforced)
        ▼
┌─────────────────────────────────┐
│         Supabase PostgREST      │ ← REST API auto-generated from schema
│  (reads auth.uid() from JWT)   │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│       PostgreSQL (public)       │
│                                 │
│  ┌───────┐  ┌─────────────┐    │
│  │ orgs  │◄─│ org_members │    │ ← membership join table
│  └───────┘  └──────┬──────┘    │
│                    │            │
│             ┌──────▼──────┐    │
│             │ assessments │    │ ← JSONB + indexed classification cols
│             └─────────────┘    │
│                                 │
│  is_admin() ◄── security        │ ← definer fn, not exposed via API
│  definer fn      definer        │
│                                 │
│  RLS policies on every table   │
└─────────────────────────────────┘
             │
             ▼
      auth.users (Supabase Auth)
      (referenced by org_members.user_id)
```

### Recommended Project Structure
```
roteiro-unificado/          ← existing app root
supabase/                   ← NEW: Supabase CLI project (at repo root, sibling to roteiro-unificado/)
├── config.toml             ← CLI project config (supabase init generates this)
├── migrations/
│   ├── 20260522000001_create_enums.sql
│   ├── 20260522000002_create_tables.sql
│   ├── 20260522000003_create_indexes.sql
│   ├── 20260522000004_enable_rls.sql
│   ├── 20260522000005_rls_helper_functions.sql
│   ├── 20260522000006_rls_policies_orgs.sql
│   ├── 20260522000007_rls_policies_org_members.sql
│   └── 20260522000008_rls_policies_assessments.sql
└── seed.sql                ← test users + orgs + seed assessments
```

> NOTE: `supabase/` lives at the repository root (same level as `roteiro-unificado/`), not inside it. The Supabase CLI initializes there with `supabase init` run from the repo root.

### Pattern 1: Enum + Table Creation (Migration SQL)

```sql
-- Source: Supabase official docs (supabase.com/docs/guides/deployment/database-migrations)
-- Migration: 20260522000001_create_enums.sql

CREATE TYPE public.member_role AS ENUM ('admin', 'company');
CREATE TYPE public.assessment_status AS ENUM ('draft', 'submitted');
```

```sql
-- Migration: 20260522000002_create_tables.sql

CREATE TABLE public.orgs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  cnpj        TEXT UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.org_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        public.member_role NOT NULL DEFAULT 'company',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)   -- each user belongs to exactly one org (ORG-02)
);

CREATE TABLE public.assessments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  status                public.assessment_status NOT NULL DEFAULT 'draft',
  version               INTEGER NOT NULL DEFAULT 1,
  form_data             JSONB NOT NULL DEFAULT '{}',
  readiness_level_mgmt  VARCHAR(10),  -- G1–G5 (D-04)
  readiness_level_tech  VARCHAR(100), -- technical level string (D-04)
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at          TIMESTAMPTZ   -- NULL until status = 'submitted'
);
```

### Pattern 2: Index Strategy — JSONB + Direct Columns

```sql
-- Migration: 20260522000003_create_indexes.sql
-- Source: Supabase RLS docs + PostgreSQL JSONB indexing guides

-- Membership lookup (used by every RLS policy — most critical index)
CREATE INDEX idx_org_members_user_id ON public.org_members (user_id);
CREATE INDEX idx_org_members_org_id  ON public.org_members (org_id);

-- Assessment queries
CREATE INDEX idx_assessments_org_id  ON public.assessments (org_id);
CREATE INDEX idx_assessments_status  ON public.assessments (status);

-- Dashboard filter: readiness level (D-04 — indexed for DASH-05)
CREATE INDEX idx_assessments_readiness_mgmt ON public.assessments (readiness_level_mgmt);
CREATE INDEX idx_assessments_readiness_tech ON public.assessments (readiness_level_tech);

-- History query: latest version per org (SAVE-04, SAVE-06)
CREATE INDEX idx_assessments_org_version ON public.assessments (org_id, version DESC);

-- form_data JSONB: GIN index only if querying specific JSON keys at query time.
-- For this phase, form_data is read-whole-blob — no GIN index needed yet.
-- If future queries filter on form_data->>'field', add:
-- CREATE INDEX idx_assessments_form_data ON public.assessments USING GIN (form_data);
```

**Key insight on JSONB + direct columns:** Promote to direct column only fields that: (1) need filtering/sorting at the DB level, and (2) are stable (not part of the evolving form). `readiness_level_mgmt` and `readiness_level_tech` qualify. All other form fields stay in JSONB. [VERIFIED: PostgreSQL JSONB indexing guides, Supabase docs]

### Pattern 3: Admin Identity Model (Claude's Discretion — Recommendation)

**Recommended approach:** `role = 'admin'` in `org_members`, protected by a `security definer` helper function.

Rationale: Avoids a global flag in `auth.users.raw_app_meta_data` (which requires the `service_role` key to set), keeps all authorization data in our own schema, and is the pattern explicitly recommended by Supabase's multi-tenant documentation and MakerKit's production RLS guide.

```sql
-- Migration: 20260522000005_rls_helper_functions.sql
-- Source: Supabase docs (supabase.com/docs/guides/database/postgres/row-level-security)
-- + MakerKit production guide (makerkit.dev/blog/tutorials/supabase-rls-best-practices)

-- Helper: Is the current user an admin? (checks org_members across all orgs)
-- SECURITY DEFINER: runs as function owner (postgres), bypassing RLS on org_members.
-- set search_path = '': prevents search_path hijacking attacks.
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

-- Helper: Does the current user belong to this org?
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
```

> IMPORTANT: Do NOT expose `is_org_member(org_id)` via Supabase RPC (PostgREST) without additional authentication checks — accepting a parameter makes it exploitable for membership enumeration. Keep it in `public` schema but restrict via `GRANT` or move to `private` schema if needed.

### Pattern 4: RLS Policies — Complete Set

```sql
-- Migration: 20260522000004_enable_rls.sql
ALTER TABLE public.orgs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
```

```sql
-- Migration: 20260522000006_rls_policies_orgs.sql
-- Source: Supabase RLS docs

-- orgs: member can see their own org; admin sees all
CREATE POLICY "orgs_select"
  ON public.orgs FOR SELECT
  TO authenticated
  USING (
    (SELECT public.is_admin())
    OR
    (SELECT public.is_org_member(id))
  );

-- orgs: only admins can create or modify orgs
CREATE POLICY "orgs_insert"
  ON public.orgs FOR INSERT
  TO authenticated
  WITH CHECK ( (SELECT public.is_admin()) );

CREATE POLICY "orgs_update"
  ON public.orgs FOR UPDATE
  TO authenticated
  USING ( (SELECT public.is_admin()) )
  WITH CHECK ( (SELECT public.is_admin()) );

-- No DELETE policy on orgs — soft-delete via active column in Phase 4
```

```sql
-- Migration: 20260522000007_rls_policies_org_members.sql

-- org_members: user sees their own membership record; admin sees all
CREATE POLICY "org_members_select"
  ON public.org_members FOR SELECT
  TO authenticated
  USING (
    (SELECT public.is_admin())
    OR user_id = (SELECT auth.uid())
  );

-- org_members: only admins can add/remove members
CREATE POLICY "org_members_insert"
  ON public.org_members FOR INSERT
  TO authenticated
  WITH CHECK ( (SELECT public.is_admin()) );

CREATE POLICY "org_members_update"
  ON public.org_members FOR UPDATE
  TO authenticated
  USING ( (SELECT public.is_admin()) )
  WITH CHECK ( (SELECT public.is_admin()) );

CREATE POLICY "org_members_delete"
  ON public.org_members FOR DELETE
  TO authenticated
  USING ( (SELECT public.is_admin()) );
```

```sql
-- Migration: 20260522000008_rls_policies_assessments.sql

-- assessments: member can see their org's assessments; admin sees all
CREATE POLICY "assessments_select"
  ON public.assessments FOR SELECT
  TO authenticated
  USING (
    (SELECT public.is_admin())
    OR (SELECT public.is_org_member(org_id))
  );

-- assessments: member can insert for their own org only
CREATE POLICY "assessments_insert"
  ON public.assessments FOR INSERT
  TO authenticated
  WITH CHECK ( (SELECT public.is_org_member(org_id)) );

-- assessments: member can update ONLY draft records of their org (append-only enforcement)
-- submitted records cannot be updated by company role
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

-- assessments: admin can update any (needed for status transitions in Phase 4)
CREATE POLICY "assessments_update_admin"
  ON public.assessments FOR UPDATE
  TO authenticated
  USING ( (SELECT public.is_admin()) )
  WITH CHECK ( (SELECT public.is_admin()) );

-- NO DELETE policy on assessments — append-only by design (SAVE-04)
-- Omitting a DELETE policy means DELETE always returns 0 rows (silently blocked by RLS)
```

### Pattern 5: Seed SQL with Auth Users

> **NOTE (updated by plan revision 2026-05-22):** The `public.orgs` table includes an `active BOOLEAN NOT NULL DEFAULT TRUE` column added in Plan 02-01 (Claude's discretion — avoids a separate migration in Phase 4). The INSERT below includes `active = TRUE` explicitly. Older versions of this pattern omitted the `active` column — always use the version below.

```sql
-- supabase/seed.sql
-- Source: laros.io/seeding-users-in-supabase-with-a-sql-seed-script (verified technique)
-- Requires pgcrypto extension (enabled by default in Supabase)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  v_admin_id  UUID := gen_random_uuid();
  v_empresa_id UUID := gen_random_uuid();
  v_org_suaequipe UUID := gen_random_uuid();
  v_org_empresa1  UUID := gen_random_uuid();
  v_admin_pw  TEXT := crypt('Admin@123', gen_salt('bf'));
  v_empresa_pw TEXT := crypt('Empresa@123', gen_salt('bf'));
BEGIN

  -- Seed admin user (admin@suaequipe.ia)
  INSERT INTO auth.users (
    id, instance_id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) VALUES (
    v_admin_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'admin@suaequipe.ia',
    v_admin_pw,
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(), NOW()
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_admin_id, v_admin_id,
    json_build_object('sub', v_admin_id::text, 'email', 'admin@suaequipe.ia'),
    'email', v_admin_id::text,
    NOW(), NOW(), NOW()
  );

  -- Seed empresa1 user
  INSERT INTO auth.users (
    id, instance_id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) VALUES (
    v_empresa_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'empresa1@teste.com',
    v_empresa_pw,
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(), NOW()
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_empresa_id, v_empresa_id,
    json_build_object('sub', v_empresa_id::text, 'email', 'empresa1@teste.com'),
    'email', v_empresa_id::text,
    NOW(), NOW(), NOW()
  );

  -- Create orgs (active = TRUE explicit — column added in Plan 02-01)
  INSERT INTO public.orgs (id, name, cnpj, active) VALUES
    (v_org_suaequipe, 'SuaEquipe.IA (Admin)', NULL, TRUE),
    (v_org_empresa1,  'Construtora Teste 1', '12.345.678/0001-99', TRUE);

  -- Create memberships
  INSERT INTO public.org_members (org_id, user_id, role) VALUES
    (v_org_suaequipe, v_admin_id,   'admin'),
    (v_org_empresa1,  v_empresa_id, 'company');

  -- Seed draft assessment for empresa1
  INSERT INTO public.assessments (org_id, status, version, form_data) VALUES
    (v_org_empresa1, 'draft', 1, '{}');

END $$;
```

**Critical seed gotchas:**
- `auth.identities` insert is required in current Supabase versions — without it, login fails silently. [VERIFIED: laros.io guide, GitHub discussion #1323]
- `instance_id = '00000000-0000-0000-0000-000000000000'` is the standard value for Supabase-hosted projects. [VERIFIED: multiple community sources]
- Seed runs after migrations on `supabase db reset`; also runnable with `supabase db push --include-seed`. [VERIFIED: Supabase seeding docs]
- This seed approach works on the **remote** Supabase project via Dashboard SQL Editor. For `supabase db reset` (local), Docker is required.
- The `public.orgs` INSERT includes `active = TRUE` explicitly — the `active` column was added by Plan 02-01 (not present in the original research draft).

### Pattern 6: TypeScript Types — Hand-Written Format

The existing `database.ts` skeleton must be expanded to match the exact output of `supabase gen types typescript`. The critical structure is three sub-types per table: `Row`, `Insert`, `Update`.

```typescript
// roteiro-unificado/src/types/database.ts
// Source: Supabase type generation docs (supabase.com/docs/guides/api/rest/generating-types)
//
// Hand-written for Phase 2. To regenerate automatically when CLI is configured:
//   npx supabase gen types typescript --project-id <project-id> > src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      orgs: {
        Row: {
          id: string
          name: string
          cnpj: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          cnpj?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          cnpj?: string | null
          created_at?: string
        }
      }
      org_members: {
        Row: {
          id: string
          org_id: string
          user_id: string
          role: Database['public']['Enums']['member_role']
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id: string
          role?: Database['public']['Enums']['member_role']
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string
          role?: Database['public']['Enums']['member_role']
          created_at?: string
        }
      }
      assessments: {
        Row: {
          id: string
          org_id: string
          status: Database['public']['Enums']['assessment_status']
          version: number
          form_data: Json
          readiness_level_mgmt: string | null
          readiness_level_tech: string | null
          created_at: string
          submitted_at: string | null
        }
        Insert: {
          id?: string
          org_id: string
          status?: Database['public']['Enums']['assessment_status']
          version?: number
          form_data?: Json
          readiness_level_mgmt?: string | null
          readiness_level_tech?: string | null
          created_at?: string
          submitted_at?: string | null
        }
        Update: {
          id?: string
          org_id?: string
          status?: Database['public']['Enums']['assessment_status']
          version?: number
          form_data?: Json
          readiness_level_mgmt?: string | null
          readiness_level_tech?: string | null
          created_at?: string
          submitted_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_org_member: {
        Args: { p_org_id: string }
        Returns: boolean
      }
    }
    Enums: {
      member_role: 'admin' | 'company'
      assessment_status: 'draft' | 'submitted'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Utility types (keep existing — do not modify)
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T] extends { Row: infer R } ? R : never

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
```

### Pattern 7: Append-Only Versioning

The append-only constraint is enforced at two layers:
1. **RLS layer:** No `DELETE` policy on `assessments`. UPDATE policy only allows changes when `status = 'draft'`. Once `submitted`, no further UPDATE is possible for `company` role. [VERIFIED: Supabase RLS docs — omitting a policy type silently blocks that operation]
2. **Application layer (Phase 8):** When creating a new revision, INSERT a new row with `version = (previous_version + 1)` and `form_data` copied from the previous submitted row. Never UPDATE a submitted row.

```sql
-- Application-level versioning query (reference for Phase 8)
-- "Start new revision" flow:
INSERT INTO public.assessments (org_id, status, version, form_data)
SELECT org_id, 'draft', version + 1, form_data
FROM public.assessments
WHERE org_id = $1
ORDER BY version DESC
LIMIT 1;
```

### Anti-Patterns to Avoid

- **Inline `auth.uid()` without SELECT wrapper:** Write `(SELECT auth.uid())` not bare `auth.uid()` — the SELECT wrapper lets Postgres cache the result per statement, yielding up to 95% performance improvement. [VERIFIED: Supabase RLS performance docs]
- **Putting `is_admin()` check in exposed RPC:** The function references `org_members` without parameters, so membership enumeration via RPC is not possible — but do not add a `user_id` parameter or it becomes exploitable.
- **Using `service_role` key client-side:** Never expose `service_role` — it bypasses all RLS. For seed operations, use the Dashboard SQL editor or CLI.
- **Creating RLS policies without enabling RLS first:** `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` must run before any policy is created.
- **Forgetting `auth.identities` in seed:** Seeded `auth.users` without a matching `auth.identities` row will result in login returning 200 but failing to establish a session.
- **Schema changes via Dashboard after CLI is set up:** Once `supabase db push` is in use, all schema changes must go through migration files or `db push` will fail with sync errors. [VERIFIED: Supabase migration docs]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Password hashing for seed users | Custom bcrypt implementation | `crypt()` + `gen_salt('bf')` from pgcrypto extension | Supabase Auth expects exactly this Blowfish hash format; wrong format = silent login failure |
| Cross-org admin check | Flag in application session | `is_admin()` security definer function | DB-level enforcement; cannot be bypassed by client-side bugs or JWT manipulation |
| Append-only enforcement | Application-only guard | RLS policy omitting DELETE + UPDATE-on-submitted | Application guards can be bypassed; DB policy cannot |
| Type generation | Manual interface maintenance | `supabase gen types typescript` (add comment for future use) | Manual types will drift from schema; CLI regeneration is authoritative |
| Migration ordering | Relying on filename alphabetical sort | Timestamp prefix `YYYYMMDDHHMMSS` | Supabase CLI applies migrations in timestamp order; gaps in sequence cause failures |

**Key insight:** The security model is only as strong as its lowest layer. Implementing RLS as the sole enforcement layer (not relying on application-level checks) means even a compromised or buggy application cannot leak cross-org data.

---

## Common Pitfalls

### Pitfall 1: Missing `auth.identities` Row in Seed
**What goes wrong:** User is inserted into `auth.users` but cannot log in — Supabase Auth returns success but no session is created.
**Why it happens:** Recent Supabase versions require a corresponding `auth.identities` row for the `email` provider to work.
**How to avoid:** Always pair every `auth.users` INSERT with an `auth.identities` INSERT in the seed.
**Warning signs:** Login returns HTTP 200 but `session` is null in the client.

### Pitfall 2: `(SELECT auth.uid())` vs `auth.uid()` Performance
**What goes wrong:** RLS policies with bare `auth.uid()` calls run the function once per row, causing slow queries on large tables.
**Why it happens:** Postgres evaluates non-STABLE functions per row unless wrapped in a subselect.
**How to avoid:** Always write `(SELECT auth.uid())` in USING/WITH CHECK clauses.
**Warning signs:** Slow dashboard queries; EXPLAIN shows `auth.uid()` being called many times.

### Pitfall 3: UPDATE Policy Without Accompanying SELECT Policy
**What goes wrong:** UPDATE operations silently fail even though the user has permission.
**Why it happens:** Postgres evaluates the USING clause of SELECT policy to determine which rows are visible for UPDATE — if SELECT is blocked, UPDATE has nothing to operate on.
**How to avoid:** Always create a matching SELECT policy for every UPDATE policy target.
**Warning signs:** `update()` returns `{ count: 0 }` with no error.

### Pitfall 4: Schema Changes via Dashboard After CLI Configured
**What goes wrong:** `supabase db push` fails with "migration history mismatch" error.
**Why it happens:** Dashboard schema changes bypass the `supabase_migrations` history table.
**How to avoid:** After initializing CLI, all changes must go through migration SQL files.
**Warning signs:** `supabase db push` reports "remote migration history is ahead of local."

### Pitfall 5: Forgetting `UNIQUE (user_id)` on `org_members`
**What goes wrong:** A user can accidentally belong to multiple orgs, breaking ORG-02 and making RLS policies return data from unexpected orgs.
**Why it happens:** No constraint enforces the one-user-one-org requirement at the DB level.
**How to avoid:** `UNIQUE (user_id)` constraint on `org_members` enforces ORG-02 at the DB level.
**Warning signs:** Application allows re-registration; user sees mixed org data.

### Pitfall 6: Seeding Against Remote Without CLI (Fallback Path)
**What goes wrong:** Running `supabase db reset` on the remote project — this resets the entire database.
**Why it happens:** `db reset` is a destructive operation intended for local dev only.
**How to avoid:** For the remote Supabase project, apply seed SQL via Dashboard SQL editor, not `db reset`. Use `supabase db push --include-seed` only when explicitly intended.
**Warning signs:** Production data wiped; Supabase confirms "All tables truncated."

---

## Code Examples

### Complete Migration Deployment Flow (with CLI)

```bash
# Source: supabase.com/docs/guides/deployment/database-migrations

# 1. Initialize Supabase CLI project (from repo root)
supabase init

# 2. Link to remote project
supabase login
supabase link --project-ref <project-ref>

# 3. Create migration files
supabase migration new create_enums
supabase migration new create_tables
# ... (edit the generated files)

# 4. Push migrations to remote (no Docker required for push)
supabase db push

# 5. Apply seed data (separate from migrations)
supabase db push --include-seed

# Dry run to preview:
supabase db push --dry-run
```

### Fallback: Dashboard SQL Editor (no CLI)

When CLI is not set up, apply SQL files directly in the Supabase Dashboard:
1. Open Dashboard → SQL Editor
2. Paste and run each migration file in order (by timestamp prefix)
3. Run seed.sql last
4. Migration history will NOT be tracked — set up CLI before next schema change

### Querying with Type Safety

```typescript
// Source: supabase.com/docs/reference/javascript/typescript-support
// After database.ts is updated, all queries are fully typed:

const { data: assessments, error } = await supabase
  .from('assessments')           // typed to assessments table
  .select('id, org_id, status, version, readiness_level_mgmt')
  .eq('org_id', orgId)
  .order('version', { ascending: false })

// data is typed as Array<Pick<Tables<'assessments'>, 'id' | 'org_id' | ...>>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Store permissions in `app_metadata` JWT claims | `org_members` table with security definer functions | Supabase 2.x | More flexible; doesn't require admin API to update permissions |
| `uuid-ossp` extension for UUIDs | `gen_random_uuid()` built-in (PostgreSQL 13+) | PG 13 (2020) | No extension needed for UUID generation |
| Separate type definition files | `supabase gen types typescript` CLI command | Supabase CLI v1 | Auto-generated types stay in sync with schema |
| Docker required for all CLI operations | `db push --db-url` works without Docker | Supabase CLI recent | Can deploy migrations from CI/CD without Docker |

**Deprecated/outdated:**
- `uuid-ossp` extension: No longer needed for UUID generation — `gen_random_uuid()` is built-in since PG13. [ASSUMED: based on PostgreSQL release notes]
- `security definer` without `set search_path = ''`: Old pattern; modern recommendation always includes the search_path restriction to prevent privilege escalation. [VERIFIED: Supabase RLS docs]

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `instance_id = '00000000-0000-0000-0000-000000000000'` is correct for remote Supabase-hosted projects | Seed SQL example | Seed login would fail on remote; test during UAT |
| A2 | `UNIQUE (user_id)` on `org_members` is the correct DB-level enforcement of one-user-one-org | Tables schema | If wrong, ORG-02 is only enforced at app level |
| A3 | `supabase db push` (push to remote) does not require Docker to be running | CLI Workflow | If wrong, need Docker installed or use Dashboard fallback |
| A4 | PostgreSQL 15.x is the Supabase version in use (gen_random_uuid() available) | Tables schema | If PG < 13, need `uuid-ossp` extension |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.
*(Table is not empty — A1 and A3 should be validated during first UAT run.)*

---

## Open Questions (RESOLVED)

1. **Which Supabase project ref to use for `supabase link`?**
   - What we know: Project exists (credentials referenced in `.env.local`); `VITE_SUPABASE_URL` is set
   - What's unclear: Whether `.env.local` exists with real values or is still a placeholder
   - Recommendation: Have user retrieve Project Reference ID from Supabase Dashboard → Project Settings → General
   - **RESOLVED:** User provides the Project Reference ID at Plan 03 execution time via `supabase link --project-ref <PROJECT_REF>`. Fallback path (Dashboard SQL Editor) requires no ref at all.

2. **Should `supabase/` live at repo root or inside `roteiro-unificado/`?**
   - What we know: Supabase CLI `supabase init` creates `supabase/` in the current directory; the git repo root is one level above `roteiro-unificado/`
   - What's unclear: User's preference for project organization
   - Recommendation: Place `supabase/` at repo root (sibling to `roteiro-unificado/`) so it's not inside the Vite build scope; add `supabase/` to `roteiro-unificado/.gitignore` exclusions if needed (it won't be, since it's outside the app dir)
   - **RESOLVED:** `supabase/` lives at repo root — per Plan 02-01 action (step 2: `supabase init` run from repo root, sibling to `roteiro-unificado/`). All plan `files_modified` paths confirm this layout.

3. **Should there be an `active` column on `orgs` for Phase 4 soft-delete?**
   - What we know: Phase 4 plan mentions "campo `active` em `orgs`" for archiving
   - What's unclear: Should Phase 2 add this column now (simpler migration) or Phase 4 adds it later (separation of concerns)?
   - Recommendation: Add `active BOOLEAN NOT NULL DEFAULT TRUE` in Phase 2 schema — it's a zero-cost addition now vs a separate migration later
   - **RESOLVED:** `active BOOLEAN NOT NULL DEFAULT TRUE` added to `public.orgs` in Plan 02-01 action (step 4) — per Claude's discretion to avoid an extra migration in Phase 4. Pattern 5 (seed SQL) updated to include `active = TRUE` explicitly in the public.orgs INSERT.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Supabase CLI (`supabase`) | Migration management, `db push` | ✗ | — | Apply SQL via Dashboard SQL Editor; install CLI via `brew install supabase/tap/supabase` |
| Docker Desktop | `supabase db reset` (local seed) | Unknown | — | Skip local reset; apply seed via Dashboard SQL Editor on remote |
| Node.js | Supabase JS client (already in project) | ✓ | 20.19.3 | — |
| Homebrew | CLI install on macOS | [ASSUMED] | — | Download binary from github.com/supabase/cli/releases |

**Missing dependencies with no fallback:**
- None — all operations have a Dashboard SQL Editor fallback path.

**Missing dependencies with fallback:**
- Supabase CLI: Install via `brew install supabase/tap/supabase` OR apply migrations via Dashboard SQL Editor.
- Docker: Required only for `supabase db reset` (local dev). Remote `db push` works without Docker.

---

## Validation Architecture

> `nyquist_validation: true` in config.json — section required.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — no vitest/jest config found in project |
| Config file | None — Wave 0 must create `vitest.config.ts` |
| Quick run command | `npx vitest run --reporter=verbose` (after Wave 0 setup) |
| Full suite command | `npx vitest run` |

> NOTE: This phase is **infrastructure-only** (SQL migrations, no React components). The appropriate validation is **integration testing via Supabase client**, not unit tests. The UAT criteria from ROADMAP.md (RLS isolation checks) must be verified manually or via a test script that authenticates as each test user and verifies data visibility.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ORG-01 | Org data is isolated by RLS — a company user cannot see another org's data | Integration/manual | Manual SQL test via Dashboard | ❌ Wave 0 |
| ORG-02 | User belongs to exactly one org | DB constraint | `UNIQUE (user_id)` on `org_members` — enforced at DB level | ❌ Wave 0 |
| ORG-04 | RLS guarantees cross-org query isolation | Integration/manual | Supabase client auth test script | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** TypeScript type-check — `cd roteiro-unificado && npx tsc --noEmit`
- **Per wave merge:** All migrations applied + seed runs + manual RLS isolation check
- **Phase gate:** All UAT items in ROADMAP.md Phase 2 pass before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `supabase/` project directory — initialize with `supabase init`
- [ ] `supabase/migrations/` — create migration files
- [ ] `supabase/seed.sql` — create with auth user seeding
- [ ] Manual RLS test checklist — verify 4 UAT items from ROADMAP Phase 2 UAT section

*(No vitest setup needed for this phase — validation is DB-level via Supabase client or Dashboard)*

---

## Security Domain

> `security_enforcement` not set to false in config.json — section required.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No (Phase 3 owns auth flow) | — |
| V3 Session Management | No (Phase 3 owns sessions) | — |
| V4 Access Control | YES | RLS policies + `is_admin()` security definer function |
| V5 Input Validation | Partial | Zod validation in app (D-03); DB enforces FK and NOT NULL only |
| V6 Cryptography | Partial | `pgcrypto` for seed password hashing (test data only; production passwords via Supabase Auth) |
| V9 Communication | No (Supabase handles TLS) | — |

### Known Threat Patterns for Supabase RLS Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Horizontal privilege escalation (user reads another org's data) | Information Disclosure | RLS `USING` clause with `is_org_member()` check on every SELECT policy |
| Vertical privilege escalation (company user becomes admin) | Elevation of Privilege | `org_members.role` is only writable by admin RLS policy; no self-elevation |
| RPC enumeration via `is_org_member(org_id)` function | Information Disclosure | Function only checks current user's membership; does not accept user_id param |
| `anon` key access bypassing auth | Spoofing | All tables restrict to `authenticated` role; `anon` gets 0 rows |
| Direct `auth.users` manipulation via client | Tampering | `auth` schema not exposed via PostgREST; only accessible via Supabase Auth API |
| Search path injection in security definer functions | Tampering | All definer functions use `SET search_path = ''` |

---

## Sources

### Primary (HIGH confidence)
- [Supabase Row Level Security Guide](https://supabase.com/docs/guides/database/postgres/row-level-security) — RLS policies, performance patterns, security definer functions
- [Supabase Database Migrations](https://supabase.com/docs/guides/deployment/database-migrations) — migration workflow, db push behavior
- [Supabase CLI: db push reference](https://supabase.com/docs/reference/cli/supabase-db-push) — flags, Docker requirement clarification
- [Supabase Generating TypeScript Types](https://supabase.com/docs/guides/api/rest/generating-types) — exact Database interface format (Row/Insert/Update)
- [Supabase Seeding Your Database](https://supabase.com/docs/guides/local-development/seeding-your-database) — seed.sql patterns

### Secondary (MEDIUM confidence)
- [MakerKit: Supabase RLS Best Practices](https://makerkit.dev/blog/tutorials/supabase-rls-best-practices) — production multi-tenant RLS patterns, security definer helper functions, verified against official Supabase docs
- [Paul Laros: Seeding Users in Supabase with SQL](https://laros.io/seeding-users-in-supabase-with-a-sql-seed-script) — `auth.identities` requirement, pgcrypto seed pattern
- [LockIn Multi-Tenant RLS Deep Dive](https://dev.to/blackie360/-enforcing-row-level-security-in-supabase-a-deep-dive-into-lockins-multi-tenant-architecture-4hd2) — membership verification functions, composite index pattern

### Tertiary (LOW confidence)
- WebSearch: `instance_id = '00000000-0000-0000-0000-000000000000'` for remote projects — multiple community sources agree but not officially documented (tagged A1 in Assumptions Log)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified package versions against npm registry; Supabase is the locked BaaS choice
- Architecture (schema): HIGH — follows Supabase official multi-tenant documentation exactly
- RLS policies: HIGH — patterns directly from official Supabase RLS docs + verified production guide
- Seed SQL: MEDIUM — `auth.identities` requirement verified by community sources; `instance_id` value is ASSUMED (A1)
- TypeScript types: HIGH — format verified against official `supabase gen types` documentation
- CLI workflow: HIGH — `db push` without Docker confirmed by official CLI reference

**Research date:** 2026-05-22
**Valid until:** 2026-08-22 (stable Supabase APIs; RLS patterns are stable; CLI flags may evolve)
