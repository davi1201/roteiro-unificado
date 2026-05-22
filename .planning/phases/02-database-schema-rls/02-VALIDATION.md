---
phase: 2
slug: database-schema-rls
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-22
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | No vitest/jest — phase is infrastructure-only (SQL migrations, no React components). TypeScript type-check via `tsc`. |
| **Config file** | `roteiro-unificado/tsconfig.app.json` (existing) |
| **Quick run command** | `cd roteiro-unificado && npx tsc --noEmit` |
| **Full suite command** | `cd roteiro-unificado && npx tsc --noEmit` + manual RLS isolation check via Dashboard |
| **Estimated runtime** | ~10 seconds (tsc) + ~5 min (manual RLS checks) |

> **Note:** This phase creates SQL migrations and updates TypeScript types — there are no testable React components or JavaScript units. Automated validation is limited to TypeScript compilation. All RLS isolation behaviors are verified manually via Supabase Dashboard SQL Editor or via the seed test users.

---

## Sampling Rate

- **After every task commit:** Run `cd roteiro-unificado && npx tsc --noEmit`
- **After every plan wave:** `tsc --noEmit` passes + manual RLS check via Dashboard confirms isolation
- **Before `/gsd:verify-work`:** All UAT items in ROADMAP.md Phase 2 must pass

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-T1 | 02-01 | 1 | ORG-01, ORG-02, ORG-04 | H-04 Horizontal escalation | SQL files contain correct table/enum definitions | build | `ls supabase/migrations/*.sql \| wc -l && cd roteiro-unificado && npx tsc --noEmit` | ❌ Wave 0 | ⬜ pending |
| 02-01-T2 | 02-01 | 1 | — | — | database.ts compiles with all 3 tables typed correctly | build | `cd roteiro-unificado && npx tsc --noEmit` | ✅ exists (skeleton) | ⬜ pending |
| 02-02-T1 | 02-02 | 2 | ORG-01, ORG-04 | H-04 Horizontal escalation, H-06 Vertical escalation | RLS policies present with correct SECURITY DEFINER functions | manual | Manual: run SQL in Dashboard and verify policy list | ❌ Wave 0 | ⬜ pending |
| 02-02-T2 | 02-02 | 2 | ORG-01, ORG-02 | H-01 Anon access | Seed users exist and RLS-isolated assessments are created | manual | Manual: Dashboard SQL Editor — verify seed rows exist | ❌ Wave 0 | ⬜ pending |
| 02-03-T1 | 02-03 | 3 | ORG-01, ORG-04 | ALL | All 3 tables exist in remote DB with RLS active | checkpoint | Human checkpoint — verify via Dashboard: Table Editor + Authentication | ❌ Wave 0 | ⬜ pending |
| 02-03-T2 | 02-03 | 3 | ORG-01, ORG-02, ORG-04 | H-04 Horizontal escalation | empresa1 cannot see SuaEquipe data; admin sees all | manual | Manual: authenticate as each test user and run SELECT queries | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `supabase/` directory — initialize with `supabase init` at repo root
- [ ] `supabase/migrations/*.sql` — 8 migration files created (enums, tables, indexes, enable_rls, helpers, 3 policy files)
- [ ] `supabase/seed.sql` — test users with `auth.identities` pairs
- [ ] Manual RLS test checklist — 4 UAT items from ROADMAP Phase 2 UAT section verified

*All Wave 0 items are created by Plans 02-01 and 02-02 execution.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| empresa1 sees only its own assessments | ORG-01, ORG-04 | Requires real Supabase Auth session; cannot be automated without test runner setup | Login as empresa1@teste.com in Dashboard → SQL Editor → `SELECT * FROM assessments` → verify only 1 row (empresa1's draft) |
| empresa1 cannot INSERT assessment for another org_id | ORG-04 | RLS policy WITH CHECK — requires real auth session | Login as empresa1 → attempt INSERT with SuaEquipe's org_id → verify error |
| admin sees all orgs and assessments | AUTH-05, ORG-04 | Requires real admin session | Login as admin@suaequipe.ia → `SELECT * FROM orgs` → verify 2 rows; `SELECT * FROM assessments` → verify 1 row |
| Submitted assessment cannot be updated by company role | SAVE-03, SAVE-04 | Tests RLS UPDATE policy with status='draft' gate | Manually update seed assessment status to 'submitted' → attempt UPDATE as empresa1 → verify 0 rows affected |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: tsc runs after each task
- [ ] Wave 0 covers all MISSING references (supabase/ dir, migration files, seed)
- [ ] No watch-mode flags
- [ ] Feedback latency: tsc ~10s (acceptable)
- [ ] `nyquist_compliant: true` set in frontmatter after sign-off

**Approval:** pending
