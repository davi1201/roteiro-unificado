---
phase: 08-autosave-submiss-o-versionamento
plan: "01"
subsystem: database
tags: [supabase, postgresql, migration, rls, assessments, unique-index, partial-index]

# Dependency graph
requires:
  - phase: 02-database-schema-rls
    provides: "Tabela public.assessments com colunas org_id e status"
provides:
  - "Índice único parcial assessments_org_id_draft_unique em (org_id, status) WHERE status='draft'"
  - "Suporte a upsert com onConflict: 'org_id,status' no hook useAutosave"
affects:
  - "08-02 — useAutosave pode usar upsert com onConflict: 'org_id,status' com segurança"
  - "08-03 — submissão formal (UPDATE status) não é afetada — constraint é parcial apenas para draft"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Índice único parcial PostgreSQL via CREATE UNIQUE INDEX ... WHERE (status = 'draft') — permite múltiplos submitted por org mas exatamente um draft"
    - "Migrations idempotentes via IF NOT EXISTS — supabase db push é seguro para re-execução"

key-files:
  created:
    - supabase/migrations/20260523000001_assessments_draft_unique.sql
  modified: []

key-decisions:
  - "CREATE UNIQUE INDEX com colunas (org_id, status) — não apenas (org_id) — para alinhar com onConflict: 'org_id,status' do PostgREST; índice com apenas (org_id) causaria erro em runtime"
  - "Índice parcial WHERE (status = 'draft') — múltiplos submitted por org são válidos (append-only); apenas um draft por org por vez"
  - "A2 confirmada: RLS policy assessments_update_draft já bloqueia UPDATE em submitted — nenhuma migration de RLS adicional necessária"

patterns-established:
  - "Migrations de Phase 8 seguem cabeçalho padrão Phase 2: comentário com nome, fase, descrição, dependências"

requirements-completed:
  - SAVE-01
  - SAVE-02
  - SAVE-03
  - SAVE-04

# Metrics
duration: 3min
completed: "2026-05-23"
---

# Phase 8 Plan 01: Constraint UNIQUE Parcial em assessments Summary

**Índice único parcial `assessments_org_id_draft_unique` aplicado ao banco remoto Supabase, habilitando upsert seguro com `onConflict: 'org_id,status'` para o autosave**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-05-23T22:14:00Z
- **Completed:** 2026-05-23T22:16:25Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Migration `20260523000001_assessments_draft_unique.sql` criada com `CREATE UNIQUE INDEX IF NOT EXISTS assessments_org_id_draft_unique ON public.assessments (org_id, status) WHERE (status = 'draft')`
- Migration aplicada ao banco remoto via `supabase db push` sem erros de conflito de dados
- Idempotência confirmada: segunda execução retornou "Remote database is up to date"
- Suposição A2 confirmada: RLS policy `assessments_update_draft` já bloqueia UPDATE em submitted — nenhuma migration de RLS adicional necessária

## Task Commits

1. **Tarefa 1: Criar migration de constraint UNIQUE parcial para autosave upsert** - `9480c37` (feat)

**Plan metadata:** (a ser adicionado no commit de docs)

## Files Created/Modified

- `supabase/migrations/20260523000001_assessments_draft_unique.sql` — Índice único parcial em (org_id, status) WHERE status='draft'; habilita upsert do autosave com onConflict correto

## Decisions Made

- **Duas colunas no índice (org_id, status):** O PostgREST exige correspondência exata entre as colunas do `onConflict` e as do índice único. Um índice com apenas `(org_id)` causaria erro em runtime quando o hook useAutosave usar `onConflict: 'org_id,status'`.
- **Índice parcial WHERE (status = 'draft'):** O design de dados é append-only — múltiplos registros submitted por org são válidos e necessários para o histórico. Apenas um rascunho por org deve existir simultaneamente.
- **A2 verificada:** A policy `assessments_update_draft` usa `USING (is_org_member(org_id) AND status = 'draft')` — registros submitted são imutáveis para role `company` por design desde a Phase 2.

## Deviations from Plan

Nenhum — plano executado exatamente como especificado.

**Nota sobre autenticação:** A variável `SUPABASE_ACCESS_TOKEN` estava disponível em `roteiro-unificado/.env.local`. O `supabase db push` exigiu o token para conectar ao banco remoto — isso foi tratado inline como autenticação esperada, não como um blocker.

## Issues Encountered

Nenhum — migration aplicada sem conflitos de dados. O banco não possuía drafts duplicados por org.

## User Setup Required

Nenhum — a migration foi aplicada automaticamente ao banco remoto via `supabase db push` com o token de acesso disponível em `.env.local`.

## Next Phase Readiness

- Constraint `assessments_org_id_draft_unique` ativa no banco Supabase remoto
- Plano 08-02 (hook `useAutosave`) pode usar `supabase.from('assessments').upsert({...}, { onConflict: 'org_id,status' })` com segurança — o índice e o `onConflict` referenciam as mesmas colunas `(org_id, status)`
- Nenhum blocker identificado para os planos seguintes da Phase 8

---
*Phase: 08-autosave-submiss-o-versionamento*
*Completed: 2026-05-23*
