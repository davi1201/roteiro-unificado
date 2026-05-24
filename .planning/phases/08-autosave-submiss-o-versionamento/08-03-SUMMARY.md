---
phase: 08-autosave-submiss-o-versionamento
plan: "03"
subsystem: form
tags: [react-query, useMutation, supabase, versioning, append-only, typescript]

# Dependency graph
requires:
  - "08-01 — Constraint UNIQUE parcial assessments_org_id_draft_unique ativa no banco"
provides:
  - "useSubmitAssessment(orgId) — mutation hook que transiciona draft para submitted via UPDATE two-step"
  - "useNewRevision(orgId) — mutation hook que cria novo draft via INSERT copiando form_data da versão submitted mais recente"
affects:
  - "08-04 — FormLayout e HistoryPage importam estes hooks para ações de submissão e nova revisão"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useMutation com mutationFn two-step (SELECT + UPDATE/INSERT) seguindo padrão de useArchiveOrg.ts"
    - ".single<T>() com tipo genérico explícito para inferência correta no Supabase client strict"
    - "`as never` em .insert() e .update() com objetos parciais — padrão estabelecido em useArchiveOrg.ts"
    - "onSuccess: invalidateQueries + navigate(replace:true) sem toast.success em useNewRevision (redirect é feedback)"

key-files:
  created:
    - roteiro-unificado/src/features/form/useSubmitAssessment.ts
    - roteiro-unificado/src/features/form/useNewRevision.ts
  modified: []

key-decisions:
  - "`.single<{ version: number }>()` em useSubmitAssessment: o tipo explícito é necessário porque `.select('version')` em modo strict resulta em `never` para `data` sem o genérico — padrão já documentado na Phase 3 (Phase 3 03-01)"
  - "Tipo local `SubmittedRow` em useNewRevision: evita import verboso de `Tables<'assessments'>` quando apenas 4 campos são necessários; mantém código autocontido"
  - "`as never` no `.insert({...})` de useNewRevision: padrão documentado em PATTERNS.md §Padrões Compartilhados — necessário no Supabase JS v2 com tipos strict para objetos de insert parciais"
  - "useNewRevision não chama toast.success no onSuccess: o redirect imediato para `/form/:orgId` é o feedback visual suficiente; o novo draft é carregado via useQuery no FormLayout"

patterns-established:
  - "Two-step SELECT + UPDATE/INSERT para evitar race condition em version increment (RESEARCH.md Armadilha 4)"
  - "`.single<T>()` com genérico explícito como workaround para inferência do Supabase client em strict mode"

requirements-completed:
  - SAVE-03
  - SAVE-04
  - SAVE-05
  - SAVE-06

# Metrics
duration: 5min
completed: "2026-05-24"
---

# Phase 8 Plan 03: Hooks useSubmitAssessment e useNewRevision Summary

**Dois hooks de mutation que completam o ciclo de vida append-only: `useSubmitAssessment` transiciona draft para submitted via UPDATE two-step; `useNewRevision` cria nova revisão via INSERT preservando histórico intocado**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-05-24T01:19:59Z
- **Completed:** 2026-05-24T01:24:30Z
- **Tasks:** 2
- **Files modified:** 2 (criados)

## Accomplishments

- `useSubmitAssessment(orgId)` criado com mutationFn two-step: SELECT version do draft atual, depois UPDATE status='submitted' + submitted_at + version+1 com `.eq('status', 'draft')` garantindo imutabilidade de registros já submitted
- `useNewRevision(orgId)` criado com mutationFn dois passos: SELECT da versão submitted mais recente (`.order('version', ascending:false).limit(1).single<SubmittedRow>()`), depois INSERT novo draft copiando form_data + version+1 + readiness_levels
- Ambos os hooks seguem o padrão exato de `useArchiveOrg.ts` (analog documentado em PATTERNS.md): useMutation + mutationFn com throw, onSuccess com invalidateQueries + navigate(replace:true), onError com toast.error
- T-08-08: `.eq('status', 'draft')` no WHERE do UPDATE de useSubmitAssessment — registros submitted são imutáveis no client
- T-08-09: `org_id` explícito no INSERT vem do parâmetro `orgId` — não de user input
- T-08-11: UNIQUE parcial da migration 08-01 bloqueia segundo INSERT de draft; erro propagado via throw para onError

## Task Commits

Cada tarefa foi commitada atomicamente:

1. **Tarefa 1: Criar useSubmitAssessment — mutation de submissão formal** - `5fe005a` (feat)
2. **Tarefa 2: Criar useNewRevision — mutation de nova revisão append-only** - `c67ac2d` (feat)

## Files Created/Modified

- `roteiro-unificado/src/features/form/useSubmitAssessment.ts` — Hook useMutation: SELECT version + UPDATE status=submitted, two-step; invalida queries + navigate history + toast
- `roteiro-unificado/src/features/form/useNewRevision.ts` — Hook useMutation: SELECT submitted mais recente + INSERT draft com form_data copiado; invalida queries + navigate form + toast.error

## Decisions Made

- **`.single<T>()` com genérico explícito:** O Supabase JS v2 em strict mode infere `data` como `never` em `.single()` sem genérico quando combinado com `.select()` de colunas específicas. Workaround consistente com Phase 3 (03-01 decision: `.single<T>()` com tipo genérico explícito necessário).
- **Tipo local `SubmittedRow` em useNewRevision:** Declara localmente apenas os 4 campos selecionados na query. Alternativa seria `Pick<Tables<'assessments'>, ...>` — evitada por verbosidade; o tipo local é suficiente e autocontido.
- **`as never` no `.insert()` de useNewRevision:** O Supabase JS v2 com tipos strict rejeita objetos de insert parciais sem cast. Padrão estabelecido em PATTERNS.md §Padrões Compartilhados.
- **Sem toast.success em useNewRevision:** O redirect imediato para `/form/:orgId` com `replace:true` é o feedback visual suficiente. O novo draft é carregado pelo FormLayout via useQuery + hydrateFromAssessment. Adicionar toast.success seria redundante.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Inferência de tipo `never` com `.single()` sem genérico**
- **Found during:** Tarefa 1 (TypeScript check)
- **Issue:** `npx tsc --noEmit` reportou `Property 'version' does not exist on type 'never'` — o Supabase client infere `data` como `never` em `.single()` combinado com `.select('version')` sem genérico explícito
- **Fix:** Adicionado `.single<{ version: number }>()` em useSubmitAssessment e `.single<SubmittedRow>()` em useNewRevision — padrão documentado em Phase 3 decision (03-01)
- **Files modified:** `useSubmitAssessment.ts`, `useNewRevision.ts`
- **Commit:** inline nas tarefas respectivas

**2. [Rule 1 - Bug] Inferência de tipo `never[]` em `.insert()` sem cast**
- **Found during:** Tarefa 2 (TypeScript check)
- **Issue:** `Object literal may only specify known properties, and 'org_id' does not exist in type 'never[]'` — `.insert({...})` rejeita o objeto sem `as never` em strict mode
- **Fix:** Adicionado `as never` no payload do `.insert()` — padrão já documentado em PATTERNS.md §Padrões Compartilhados e seguido em useArchiveOrg.ts
- **Files modified:** `useNewRevision.ts`
- **Commit:** inline na Tarefa 2

**3. [Rule 3 - Blocking] Path safety — arquivo criado no repo principal ao invés do worktree**
- **Found during:** Tarefa 1 (git status)
- **Issue:** Write tool usou path absoluto do repo principal (`/Users/DaviAlves/.../Roteiro Unificado/roteiro-unificado/...`) ao invés do worktree (`/Users/DaviAlves/.../worktrees/agent-aaefb40a49cfd1ae3/roteiro-unificado/...`). Git status retornou vazio no worktree.
- **Fix:** Removido do repo principal; recriado no path correto do worktree
- **Files modified:** `useSubmitAssessment.ts` (path corrigido)
- **Commit:** inline na Tarefa 1

## Issues Encountered

- `npm install` executado no worktree para instalar devDependencies antes de usar `npx tsc --noEmit` — comportamento normal de worktree recém-criado
- `.husky/_/husky.sh` modificado pelo `npm install` (versão diferente de husky); restaurado via `git checkout -- .husky/_/husky.sh` para não incluir na task commit

## User Setup Required

Nenhum — nenhuma configuração externa necessária. Os hooks são puramente client-side.

## Known Stubs

Nenhum stub. Os dois hooks implementam a lógica completa de mutação:
- `useSubmitAssessment` faz SELECT + UPDATE real no banco
- `useNewRevision` faz SELECT + INSERT real no banco

## Threat Flags

Nenhuma superfície nova além do já mapeado no `<threat_model>` do plano.

## Self-Check

Verificações pós-SUMMARY:

---

## Self-Check: PASSED

- `roteiro-unificado/src/features/form/useSubmitAssessment.ts` — FOUND no worktree
- `roteiro-unificado/src/features/form/useNewRevision.ts` — FOUND no worktree
- Commit `5fe005a` — FOUND (feat(08-03): criar useSubmitAssessment)
- Commit `c67ac2d` — FOUND (feat(08-03): criar useNewRevision)
- `npx tsc --noEmit` — PASSED (zero erros nos dois arquivos)
- Append-only garantido: nenhum UPDATE em registros submitted em ambos os hooks

---
*Phase: 08-autosave-submiss-o-versionamento*
*Completed: 2026-05-24*
