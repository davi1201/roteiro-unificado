# Phase 2: Database Schema & RLS - Pattern Map

**Mapped:** 2026-05-22
**Files analyzed:** 9 (8 migration files + 1 modified TypeScript file)
**Analogs found:** 2 / 9 (only for `database.ts`; SQL files have no codebase precedent)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `supabase/migrations/20260522000001_create_enums.sql` | migration | transform | none | no analog |
| `supabase/migrations/20260522000002_create_tables.sql` | migration | CRUD | none | no analog |
| `supabase/migrations/20260522000003_create_indexes.sql` | migration | transform | none | no analog |
| `supabase/migrations/20260522000004_enable_rls.sql` | migration | transform | none | no analog |
| `supabase/migrations/20260522000005_rls_helper_functions.sql` | migration | transform | none | no analog |
| `supabase/migrations/20260522000006_rls_policies_orgs.sql` | migration | transform | none | no analog |
| `supabase/migrations/20260522000007_rls_policies_org_members.sql` | migration | transform | none | no analog |
| `supabase/migrations/20260522000008_rls_policies_assessments.sql` | migration | transform | none | no analog |
| `supabase/seed.sql` | config | CRUD | none | no analog |
| `roteiro-unificado/src/types/database.ts` | model | request-response | `roteiro-unificado/src/types/database.ts` (current skeleton) | exact — expand in-place |

---

## Pattern Assignments

### `roteiro-unificado/src/types/database.ts` (model, request-response)

**Analog:** `roteiro-unificado/src/types/database.ts` (the existing skeleton itself)

This file already exists with the correct structural scaffold. The task is to replace the `[_ in never]: never` placeholders with real table, enum, and function definitions while preserving every existing utility type unchanged.

**Existing file header comment to preserve** (lines 1–13):
```typescript
/**
 * Tipos gerados para o schema do Supabase.
 *
 * Este arquivo será expandido na Fase 2 quando as tabelas forem criadas.
 * Para regenerar após mudanças no schema:
 *   npx supabase gen types typescript --project-id <id> > src/types/database.ts
 *
 * Tabelas planejadas (Fase 2):
 *   - companies          → dados das construtoras (tenants)
 *   - assessments        → avaliações de prontidão
 *   - assessment_answers → respostas individuais por pergunta
 *   - users              → perfis de usuários (via Supabase Auth)
 */
```

**Update the comment block** to reflect the actual tables created in Phase 2 (`orgs`, `org_members`, `assessments`).

**Existing `Json` type to preserve verbatim** (line 14):
```typescript
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]
```

**Existing `Database` interface skeleton structure to follow** (lines 16–37):
```typescript
export interface Database {
  public: {
    Tables: {
      // Replace [_ in never]: never with real table definitions
    }
    Views: {
      [_ in never]: never  // Keep as-is — no views in Phase 2
    }
    Functions: {
      // Replace [_ in never]: never with is_admin and is_org_member
    }
    Enums: {
      // Replace [_ in never]: never with member_role and assessment_status
    }
    CompositeTypes: {
      [_ in never]: never  // Keep as-is
    }
  }
}
```

**Existing utility types to preserve verbatim** (lines 40–43):
```typescript
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T] extends { Row: infer R } ? R : never

export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
```

**Target structure for Tables section** — each table must have exactly three sub-types `Row`, `Insert`, `Update` matching the `supabase gen types typescript` output format:
```typescript
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
```

**Target structure for Enums section:**
```typescript
Enums: {
  member_role: 'admin' | 'company'
  assessment_status: 'draft' | 'submitted'
}
```

**Target structure for Functions section:**
```typescript
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
```

**How `supabase.ts` consumes this type** — no changes needed to `roteiro-unificado/src/lib/supabase.ts` (lines 1–14):
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis de ambiente Supabase não configuradas. ' +
      'Copie .env.local.example para .env.local e preencha os valores.'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

The `createClient<Database>` generic will automatically propagate the new table types to all callers — no changes needed after `database.ts` is updated.

---

### SQL Migration Files (all 8 + seed.sql)

**No codebase analog exists.** The `supabase/` directory does not exist in the repository. All SQL must be written from scratch following the patterns documented in RESEARCH.md.

The RESEARCH.md already contains authoritative, complete SQL for every migration file (Pattern 1–5 in the `## Architecture Patterns` section). Implementers should copy directly from there. Key reference points per file:

| Migration File | RESEARCH.md Section | Key Pattern |
|----------------|---------------------|-------------|
| `20260522000001_create_enums.sql` | Pattern 1 — first code block | `CREATE TYPE public.member_role AS ENUM (...)` |
| `20260522000002_create_tables.sql` | Pattern 1 — second code block | `CREATE TABLE public.orgs`, `org_members`, `assessments` |
| `20260522000003_create_indexes.sql` | Pattern 2 | `CREATE INDEX idx_*` on membership + assessment columns |
| `20260522000004_enable_rls.sql` | Pattern 4 — first block | `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` |
| `20260522000005_rls_helper_functions.sql` | Pattern 3 | `CREATE OR REPLACE FUNCTION public.is_admin()` + `is_org_member()` with `SECURITY DEFINER SET search_path = ''` |
| `20260522000006_rls_policies_orgs.sql` | Pattern 4 — `orgs` block | `CREATE POLICY "orgs_select"` + `"orgs_insert"` + `"orgs_update"` |
| `20260522000007_rls_policies_org_members.sql` | Pattern 4 — `org_members` block | `CREATE POLICY "org_members_select"` through `"org_members_delete"` |
| `20260522000008_rls_policies_assessments.sql` | Pattern 4 — `assessments` block | `CREATE POLICY "assessments_select"` through `"assessments_update_admin"` |
| `supabase/seed.sql` | Pattern 5 | `DO $$ DECLARE ... BEGIN` block with pgcrypto + auth.users + auth.identities |

---

## Shared Patterns

### `(SELECT auth.uid())` Wrapper — All RLS Policies
**Source:** RESEARCH.md, Anti-Patterns section and Pattern 3
**Apply to:** Every `USING` and `WITH CHECK` clause in all 3 policy migration files
```sql
-- CORRECT: Postgres caches this per statement (up to 95% faster on large tables)
WHERE user_id = (SELECT auth.uid())

-- WRONG: evaluated per row, never cache
WHERE user_id = auth.uid()
```

### `SECURITY DEFINER SET search_path = ''` — Helper Functions
**Source:** RESEARCH.md, Pattern 3
**Apply to:** `is_admin()` and `is_org_member()` in `20260522000005_rls_helper_functions.sql`
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''   -- prevents search_path hijacking
STABLE
AS $$ ... $$;
```

### Enum Cross-Reference in TypeScript — All Table Types
**Source:** `roteiro-unificado/src/types/database.ts` (pattern from RESEARCH.md Pattern 6)
**Apply to:** `role` field in `org_members` and `status` field in `assessments`
```typescript
// Reference enum types via the Database interface, not as raw strings:
role: Database['public']['Enums']['member_role']
status: Database['public']['Enums']['assessment_status']
// This propagates to Enums<'member_role'> utility type automatically
```

### `INSERT` Fields Are Optional, `Row` Fields Are Required
**Source:** RESEARCH.md Pattern 6 — `supabase gen types typescript` output format
**Apply to:** All three tables in `database.ts`
```typescript
// Row: all fields required (mirrors what SELECT returns)
Row: { id: string; name: string; created_at: string }

// Insert: DB-defaulted fields are optional (id, created_at, status, version)
Insert: { id?: string; name: string; created_at?: string }

// Update: all fields optional (partial update is always valid)
Update: { id?: string; name?: string; created_at?: string }
```

### `auth.identities` Pair with `auth.users` — Seed Only
**Source:** RESEARCH.md Pattern 5 and Pitfall 1
**Apply to:** `supabase/seed.sql` — every test user insert
```sql
-- Every auth.users INSERT must be paired with auth.identities INSERT
-- or login returns HTTP 200 but session is null
INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
) VALUES (
  v_user_id, v_user_id,
  json_build_object('sub', v_user_id::text, 'email', 'user@example.com'),
  'email', v_user_id::text,
  NOW(), NOW(), NOW()
);
```

### Migration Application Order
**Source:** RESEARCH.md, Anti-Patterns and Don't Hand-Roll sections
**Apply to:** All migration filenames
```
-- Timestamp prefix determines application order:
-- Enable RLS BEFORE creating policies:
20260522000004_enable_rls.sql         ← must come before policies
20260522000005_rls_helper_functions.sql ← must come before policies that call them
20260522000006_rls_policies_orgs.sql   ← depends on is_admin(), is_org_member()
```

---

## No Analog Found

These files have no close match in the existing codebase. Implementers must use RESEARCH.md patterns as the primary reference:

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `supabase/migrations/20260522000001_create_enums.sql` | migration | transform | No SQL migrations exist in the repo; `supabase/` directory does not exist yet |
| `supabase/migrations/20260522000002_create_tables.sql` | migration | CRUD | Same — no SQL precedent |
| `supabase/migrations/20260522000003_create_indexes.sql` | migration | transform | Same |
| `supabase/migrations/20260522000004_enable_rls.sql` | migration | transform | Same |
| `supabase/migrations/20260522000005_rls_helper_functions.sql` | migration | transform | Same |
| `supabase/migrations/20260522000006_rls_policies_orgs.sql` | migration | transform | Same |
| `supabase/migrations/20260522000007_rls_policies_org_members.sql` | migration | transform | Same |
| `supabase/migrations/20260522000008_rls_policies_assessments.sql` | migration | transform | Same |
| `supabase/seed.sql` | config | CRUD | Same; RESEARCH.md Pattern 5 is the authoritative source |

---

## Metadata

**Analog search scope:** `roteiro-unificado/src/` (all `.ts`, `.tsx`, `.sql` files)
**Files scanned:** 20 TypeScript/TSX files, 0 SQL files
**Pattern extraction date:** 2026-05-22

**Key finding:** This phase is the first to introduce SQL infrastructure. The only reusable codebase pattern is the `database.ts` skeleton, which already defines the exact interface structure (`Database`, `Tables<T>`, `Enums<T>`, `Json`) that must be preserved and expanded. All SQL patterns must be sourced from RESEARCH.md directly — they are complete and production-ready.
