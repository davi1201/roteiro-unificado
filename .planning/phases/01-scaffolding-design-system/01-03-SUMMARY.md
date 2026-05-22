---
phase: 1
plan: 3
subsystem: supabase-client
tags: [supabase, typescript, types, client, env-vars]
dependency_graph:
  requires: [01-01]
  provides: [supabase-singleton, database-types]
  affects: [all-data-access-modules]
tech_stack:
  added: ['@supabase/supabase-js@2.106.1']
  patterns: [singleton-client, typed-database-schema]
key_files:
  created:
    - roteiro-unificado/src/lib/supabase.ts
    - roteiro-unificado/src/types/database.ts
  modified:
    - roteiro-unificado/package.json
    - roteiro-unificado/package-lock.json
decisions:
  - 'Use createClient from @supabase/supabase-js (not createBrowserClient from @supabase/ssr — Vite SPA, not SSR framework)'
  - 'Database types scaffold uses [_ in never]: never pattern for empty Tables/Enums (avoids @typescript-eslint/no-empty-object-type lint error)'
  - 'Runtime throw on missing env vars — intentional; dev must provide real credentials before running'
metrics:
  duration: ~5 minutes
  completed: '2025-05-22'
  tasks_completed: 4
  files_changed: 4
---

# Phase 1 Plan 3: Configurar cliente Supabase Summary

**One-liner:** Supabase singleton client via `createClient` with typed `Database` scaffold and env-var validation for Vite SPA.

## What Was Built

- **`src/lib/supabase.ts`** — Exports a single `supabase` client instance created with `createClient<Database>`. Validates `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` at init time, throwing a descriptive Portuguese error if missing.
- **`src/types/database.ts`** — Empty `Database` interface typed for Supabase's codegen format. Includes `Json` type, all required sub-types (`Tables`, `Views`, `Functions`, `Enums`, `CompositeTypes`), and utility types `Tables<T>` / `Enums<T>` using conditional types to handle the empty-tables phase gracefully.
- **`@supabase/supabase-js@2.106.1`** — Installed as a production dependency.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed empty object type lint errors in `database.ts`**
- **Found during:** Task commit (Husky pre-commit lint-staged ran ESLint)
- **Issue:** `Tables: {}` and `Enums: {}` with comment-only bodies triggered `@typescript-eslint/no-empty-object-type` (2 errors) — Husky blocked the commit
- **Fix:** Added `[_ in never]: never` inside both `Tables` and `Enums`, matching the same pattern already used for `Views`, `Functions`, and `CompositeTypes` in the plan scaffold
- **Files modified:** `src/types/database.ts`
- **Commit:** 093e213

## Runtime Behavior Note

When `npm run dev` runs with empty `.env.local` values, `supabase.ts` throws:

> `Variáveis de ambiente Supabase não configuradas. Copie .env.local.example para .env.local e preencha os valores.`

This is **correct and expected**. The app will work once real Supabase credentials are added in Phase 3.

## Self-Check: PASSED

- `roteiro-unificado/src/lib/supabase.ts` ✅
- `roteiro-unificado/src/types/database.ts` ✅
- Commit `093e213` ✅
