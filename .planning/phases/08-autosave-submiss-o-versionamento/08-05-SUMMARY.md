---
phase: 08-autosave-submiss-o-versionamento
plan: "05"
subsystem: router
tags: [react-router, routing, protected-route, history, typescript]

# Dependency graph
requires:
  - phase: 08-autosave-submiss-o-versionamento
    plan: "04"
    provides: "HistoryPage.tsx criado em src/features/form/HistoryPage.tsx"
provides:
  - "Rota /form/:orgId/history registrada no router.tsx dentro de ProtectedRoute"
  - "HistoryPage acessível via URL e protegida por autenticação"
affects:
  - "Fluxo completo da Phase 8: autosave → submissão → histórico → nova revisão — agora totalmente roteado"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Rota mais específica /form/:orgId/history adicionada após /form/:orgId no mesmo bloco ProtectedRoute.children — React Router v6 usa especificidade automática"

key-files:
  created: []
  modified:
    - roteiro-unificado/src/router.tsx

key-decisions:
  - "Rota /form/:orgId/history dentro do bloco ProtectedRoute existente: sem novo wrapper de autenticação necessário — ProtectedRoute já garante redirect para /login (T-08-17 mitigado)"
  - "Ordem das rotas: /form/:orgId/history colocada após /form/:orgId — React Router v6 faz matching mais específico automaticamente, mas manter ordem lógica ajuda legibilidade"

patterns-established:
  - "Named export de páginas de feature importado diretamente no router — padrão consistente com FormLayout"

requirements-completed:
  - SAVE-06
  - UX-05

# Metrics
duration: ~5min
completed: "2026-05-24"
---

# Phase 8 Plan 05: Rota /form/:orgId/history — Wiring do Router Summary

**Rota /form/:orgId/history adicionada ao router.tsx dentro do bloco ProtectedRoute — HistoryPage agora acessível via URL e protegida por autenticação; checkpoint humano aguarda verificação do fluxo completo da Phase 8 no browser**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-05-24
- **Completed:** 2026-05-24
- **Tasks:** 1 automatizável (+ 1 checkpoint humano pendente)
- **Files modified:** 1

## Accomplishments

### Tarefa 1: Rota /form/:orgId/history adicionada ao router.tsx

- Import adicionado: `import { HistoryPage } from '@/features/form/HistoryPage'`
- Rota adicionada dentro do bloco `element: <ProtectedRoute />` em `children`:
  ```tsx
  {
    path: '/form/:orgId/history',
    element: <HistoryPage />,
  }
  ```
- `npx tsc --noEmit` passou sem erros no repositório principal
- lint-staged (eslint + prettier) executou com sucesso no hook pre-commit

## Task Commits

1. **feat(08-05): adicionar rota /form/:orgId/history no router.tsx** — `ebe9506`
2. **fix(08-05): substituir upsert por SELECT+UPDATE/INSERT no useAutosave (42P10)** — `3a272e7`

## Files Created/Modified

- `roteiro-unificado/src/router.tsx` — 2 linhas adicionadas: import de HistoryPage e rota `/form/:orgId/history` dentro de ProtectedRoute
- `roteiro-unificado/src/hooks/useAutosave.ts` — substituído `.upsert()` por SELECT+UPDATE/INSERT; adicionado comentário explicando incompatibilidade 42P10
- `roteiro-unificado/src/hooks/useAutosave.test.ts` — mock fluente refatorado; adicionado SAVE-01b para caminho UPDATE
- `roteiro-unificado/src/types/database.ts` — adicionado `Relationships: []` em todas as tabelas (obrigatório para GenericTable do postgrest-js v2.x)

## Decisions Made

- **HistoryPage dentro de ProtectedRoute:** A rota herda a proteção de autenticação do bloco existente. Sem sessão válida o usuário é redirecionado para `/login` — mitiga T-08-17 (Spoofing: acesso sem autenticação).
- **Ordem das rotas:** `/form/:orgId/history` posicionada após `/form/:orgId` — React Router v6 resolve automaticamente a rota mais específica. Ordem legível por humanos.

## Checkpoint Pendente

**Verificação humana requerida** — Todos os 6 pontos do checkpoint:

1. Skeleton aparece brevemente ao abrir `/form/:orgId`
2. Autosave funciona: digitar campo → aguardar 1.5s → toast "Salvo às HH:MM"
3. Submissão: aba NDA → sticky footer → botão "Enviar Avaliação" → dialog de confirmação → redirect para `/form/:orgId/history`
4. HistoryPage lista versões com badge "Enviado" e botão "Iniciar Nova Revisão"
5. Persistência: alterar campo → salvar → F5 → dado preservado
6. Falha de autosave: bloquear URL Supabase → toast warning "Falha ao salvar"

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Worktree sem node_modules — hook pre-commit falha**
- **Found during:** Tarefa 1 — commit com lint-staged
- **Issue:** O worktree não tem `node_modules/` próprio; o hook pre-commit executa `npx lint-staged` que chama `eslint --fix`, mas o ESLint não encontrava `typescript-eslint` no contexto do worktree
- **Fix:** Criado symlink `roteiro-unificado/node_modules → /roteiro-unificado/node_modules` do repositório principal dentro do worktree — resolve a busca de módulos sem duplicar dependências
- **Files modified:** Nenhum (symlink no filesystem, não rastreado pelo git)
- **Commit:** ebe9506 (fix implícito no mesmo commit)

**2. [Rule 1 - Bug] Erro 42P10 em produção — upsert incompatível com índice parcial**
- **Found during:** Pós-execução — erro reportado em produção ao tentar salvar via autosave
- **Issue:** `useAutosave.ts` usava `.upsert({...}, { onConflict: 'org_id,status' })` gerando `ON CONFLICT (org_id, status) DO UPDATE` sem predicado `WHERE`. O PostgreSQL exige que o predicado `WHERE status='draft'` conste no SQL para usar o índice parcial criado em 08-01. PostgREST não suporta esta sintaxe — erro code `42P10: there is no unique or exclusion constraint matching the ON CONFLICT specification`.
- **Fix:** Substituído `.upsert()` por padrão SELECT + UPDATE/INSERT:
  1. `SELECT id WHERE org_id=? AND status='draft' MAYBÉSINGLE` — verifica existência
  2. Se draft existe: `UPDATE SET form_data, readiness_level_mgmt, readiness_level_tech WHERE id=? AND status='draft'`
  3. Se não existe: `INSERT {org_id, status: 'draft', form_data, readiness_level_mgmt, readiness_level_tech}`
- **Causa colateral:** `database.ts` hand-written não tinha `Relationships: []` em nenhuma tabela — campo obrigatório para `GenericTable` do `@supabase/postgrest-js` v2.x. Sem ele, `Schema` resolvia como `never` e `.update()` / `.insert()` recebiam tipo `never`, causando erros TypeScript ao tentar tipar corretamente o payload. Fix aplicado no mesmo commit.
- **Testes atualizados:** `useAutosave.test.ts` refatorado — mock fluente `SELECT+UPDATE/INSERT` substitui mock de `upsert`; adicionado teste `SAVE-01b` para cobertura do caminho UPDATE (draft existente). Suite completa: 12 pass, 14 todo, 3 skipped.
- **Files modified:** `src/hooks/useAutosave.ts`, `src/hooks/useAutosave.test.ts`, `src/types/database.ts`
- **Commit:** 3a272e7

## Known Stubs

Nenhum — a modificação é exclusivamente wiring de rota. HistoryPage e FormLayout implementam lógica completa (documentado em 08-04-SUMMARY.md).

## Threat Flags

Nenhuma superfície nova além do mapeado no `<threat_model>` do plano:
- T-08-17 (Spoofing): mitigado — rota dentro de ProtectedRoute, redirect para /login sem sessão
- T-08-18 (Information Disclosure): mitigado — RLS `is_org_member(org_id)` bloqueia cross-tenant (implementado em 08-01 e usado em 08-04)

## Self-Check

Verificações pós-SUMMARY:

---

## Self-Check: PASSED

- `roteiro-unificado/src/router.tsx` — FOUND
- `08-05-SUMMARY.md` — FOUND
- Commit `ebe9506` — FOUND (feat(08-05): adicionar rota /form/:orgId/history no router.tsx)
- `import { HistoryPage } from '@/features/form/HistoryPage'` presente no router.tsx — CONFIRMED
- `{ path: '/form/:orgId/history', element: <HistoryPage /> }` dentro de ProtectedRoute.children — CONFIRMED
- `npx tsc --noEmit` — PASSED (zero erros)
- lint-staged (eslint + prettier) — PASSED no hook pre-commit

---
*Phase: 08-autosave-submiss-o-versionamento*
*Completed: 2026-05-24*
