---
phase: 09-dashboard-de-prontidao
plan: 01
subsystem: dashboard-logic
tags: [pure-function, tanstack-query, tdd, admin, readiness]
dependency_graph:
  requires: []
  provides:
    - roteiro-unificado/src/lib/sectionStatus.ts → computeTabStatus, TabStatus, STATUS_TO_COMPLETENESS
    - roteiro-unificado/src/features/admin/useOrgsWithReadiness.ts → useOrgsWithReadiness, OrgWithReadiness
  affects:
    - Waves 2-3 do Phase 09 (SectionProgress consome computeTabStatus; CompanyCard e AdminDashboard consomem OrgWithReadiness)
tech_stack:
  added: []
  patterns:
    - Função pura sem React/Zustand (padrão readiness.ts)
    - Hook TanStack Query com LEFT JOIN PostgREST + filtro no cliente (padrão useOrgs.ts)
key_files:
  created:
    - roteiro-unificado/src/lib/sectionStatus.ts
    - roteiro-unificado/src/lib/sectionStatus.test.ts
    - roteiro-unificado/src/features/admin/useOrgsWithReadiness.ts
    - roteiro-unificado/src/features/admin/useOrgsWithReadiness.test.ts
  modified: []
decisions:
  - "computeTabStatus verifica requiredCount===0 ANTES de avaliar filledCount — evita que abas sem campos obrigatórios sejam marcadas como 'complete' (0 >= 0 seria sempre true)"
  - "useOrgsWithReadiness NÃO usa .eq('assessments.status') na query — mantém LEFT JOIN; filtro submitted feito no cliente para preservar orgs sem avaliação (viola D-04 se filtrado no servidor)"
  - "status omitido do objeto latestAssessment final — isolamento de contrato entre camada de dados e camada de apresentação"
metrics:
  duration: 299s
  completed: "2026-05-24"
  tasks: 2
  files: 4
---

# Phase 09 Plan 01: Lógica Pura — computeTabStatus e useOrgsWithReadiness

**One-liner:** Função pura `computeTabStatus` com 3 estados (empty/in-progress/complete) e hook `useOrgsWithReadiness` com LEFT JOIN PostgREST + filtro de submitted no cliente.

## O que foi construído

### Task 1: computeTabStatus (TDD — RED → GREEN)

Criada a função pura `computeTabStatus(tabKey, formData, requiredCount): TabStatus` em `src/lib/sectionStatus.ts`.

A lógica implementada (em ordem de verificação):
1. Ler `tabData = formData?.[tabKey]`
2. Se tabData ausente, não-objeto ou objeto vazio → retornar `'empty'`
3. Se `requiredCount === 0` → retornar `'in-progress'` (verificação ANTES de comparar filledCount)
4. Contar `filledCount` = valores que não são null, undefined, '' ou array vazio
5. Retornar `'complete'` se `filledCount >= requiredCount`, senão `'in-progress'`

Também exporta:
- `TabStatus = 'empty' | 'in-progress' | 'complete'`
- `STATUS_TO_COMPLETENESS: Record<TabStatus, number>` com valores `{empty: 0, 'in-progress': 0.5, complete: 1}`

Teste cobre 10 casos incluindo todos os comportamentos do bloco `<behavior>` do plano.

### Task 2: useOrgsWithReadiness (TDD — RED → GREEN)

Criado o hook `useOrgsWithReadiness()` em `src/features/admin/useOrgsWithReadiness.ts`.

Query PostgREST:
```
supabase.from('orgs')
  .select('id, name, cnpj, active, assessments!left(..., status)')
  .eq('active', true)
  .order('name', { ascending: true })
```

Filtro no cliente (conforme Armadilha 1 do RESEARCH):
- `.filter(a => a.status === 'submitted')`
- `.sort((a, b) => b.version - a.version)`
- `[0] ?? null` → latestAssessment

Exporta:
- `OrgWithReadiness` (tipo) com `latestAssessment` sem campo `status`
- `useOrgsWithReadiness()` com `queryKey: ['orgs', 'with-readiness']` e `staleTime: 60_000`

Teste cobre 4 casos: org sem submitted, múltiplos submitted (maior version vence), draft ignorado, e campos preservados sem status.

## Verificação

```
Tests: 2 passed (14 total)
  - src/lib/sectionStatus.test.ts: 10 passed
  - src/features/admin/useOrgsWithReadiness.test.ts: 4 passed
TypeScript: 0 erros nos arquivos novos (npx tsc --noEmit)
```

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED (test) Task 1 | 12e53d2 | PASSED |
| GREEN (feat) Task 1 | 4f7dc36 | PASSED |
| RED (test) Task 2 | 017d7ae | PASSED |
| GREEN (feat) Task 2 | 1d35115 | PASSED |

## Deviations from Plan

**Deviation: node_modules symlink (Rule 3 - Blocker)**
- **Found during:** Task 1 RED phase
- **Issue:** O diretório do worktree `roteiro-unificado/node_modules` não existia — o vitest não encontrava dependências ao executar `npm test` de dentro do worktree.
- **Fix:** Criado symlink `roteiro-unificado/node_modules → .../Roteiro Unificado/roteiro-unificado/node_modules` no worktree. O pacote `node_modules` já existia no repositório principal; apenas o link estava faltando no worktree isolado.
- **Files modified:** nenhum arquivo rastreado — apenas symlink de runtime
- **Commit:** N/A (symlink não rastreado pelo git)

## Known Stubs

Nenhum. Os dois artefatos são lógica pura/hook — sem dados hardcoded, sem placeholders.

## Threat Flags

Nenhum novo vetor de superfície introduzido. Os dois arquivos novos estão cobertos pelo threat register do plano:
- T-09-IDOR: aceito, mitigado por RLS existente
- T-09-INJ: mitigado — computeTabStatus trata form_data apenas como dados (typeof/Object.keys), saída é enum de string fixo

## Self-Check: PASSED

- [x] `roteiro-unificado/src/lib/sectionStatus.ts` — criado e commitado (4f7dc36)
- [x] `roteiro-unificado/src/lib/sectionStatus.test.ts` — criado e commitado (12e53d2)
- [x] `roteiro-unificado/src/features/admin/useOrgsWithReadiness.ts` — criado e commitado (1d35115)
- [x] `roteiro-unificado/src/features/admin/useOrgsWithReadiness.test.ts` — criado e commitado (017d7ae)
- [x] 14 testes verdes, 0 erros TypeScript nos arquivos novos
