---
phase: 05-shell-do-formul-rio-navega-o-por-abas
plan: 01
subsystem: ui
tags: [zustand, form-store, typescript, storage-split, localstorage, sessionstorage]

requires:
  - phase: 03-authentication-roteamento-por-role
    provides: "formStore com persist key namespaceada por tenantId e padrão createFormStore/useFormStore"

provides:
  - "enum TabKey com 10 valores string em ordem fixa (Identificacao → Nda)"
  - "FormStore expandida com activeTab, visitedTabs, sectionData e 4 novas actions"
  - "Storage split: localStorage persiste navegação; sessionStorage persiste sectionData"
  - "TAB_CONFIG em tabConfig.ts como fonte única de labels das 10 abas"

affects:
  - 05-02 (ProgressBadge consome TabKey para tipagem)
  - 05-03 (TabNavigation e useFormSection consomem TabKey, TAB_CONFIG e actions da store)
  - 05-04 (FormLayout consome a store expandida via useFormStore)
  - 06 (campos do formulário usam updateSection e TabKey para persistir dados por aba)

tech-stack:
  added: []
  patterns:
    - "Storage split via partialize exclusivo + subscriber manual para sessionStorage"
    - "Set<T> serializado como Array no localStorage e reconvertido no onRehydrateStorage"
    - "Factory createFormStore memoiza instâncias por tenantId em Map"

key-files:
  created:
    - roteiro-unificado/src/features/form/tabConfig.ts
  modified:
    - roteiro-unificado/src/stores/formStore.ts

key-decisions:
  - "Subscriber manual para sessionStorage preferido sobre dois persist compostos — tipos mais simples e intenção explícita"
  - "partialize retorna EXPLICITAMENTE apenas 4 campos (sem sectionData) — proteção contra vazamento acidental para localStorage"
  - "TabKey exportado de formStore.ts (não de arquivo separado) para manter um único ponto de importação para consumers"

patterns-established:
  - "Storage split Zustand: partialize → localStorage; subscriber manual → sessionStorage"
  - "Set<TabKey> → Array no partialize; new Set(array as unknown as TabKey[]) no onRehydrateStorage"

requirements-completed: [FORM-01, FORM-04]

duration: 10min
completed: 2026-05-22
---

# Phase 05 Plan 01: Expandir formStore com TabKey + Storage Split e criar tabConfig

**enum TabKey com 10 abas, storage split localStorage/sessionStorage e TAB_CONFIG implementados em formStore.ts e tabConfig.ts sem quebrar a interface pública existente.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-05-22T19:49:41Z
- **Completed:** 2026-05-22T19:59:00Z
- **Tasks:** 2 concluídas
- **Files modified:** 2

## Accomplishments

- `formStore.ts` expandida in-place com `TabKey` enum (10 valores), 3 novos campos de estado (`activeTab`, `visitedTabs`, `sectionData`) e 4 novas actions (`setActiveTab`, `markTabVisited`, `updateSection`, `resetForm`), mantendo 100% de compatibilidade com a interface pública existente (`createFormStore`, `useFormStore`, `currentStep`, `completedSteps`, `markStepComplete`)
- Storage split implementado: `partialize` exclui `sectionData` explicitamente (somente navegação no localStorage `form-progress-${tenantId}`); subscriber manual persiste `sectionData` no sessionStorage `form-data-${tenantId}` com hidratação inicial
- `tabConfig.ts` criado com `TAB_CONFIG` (10 itens em ordem canônica) e interface `TabConfig` — arquivo TypeScript puro sem dependências React

## Task Commits

1. **Task 1 + Task 2: expandir formStore e criar tabConfig** — `0569a77` (feat)

## Files Created/Modified

- `roteiro-unificado/src/stores/formStore.ts` — adicionado `TabKey` enum, campos `activeTab`/`visitedTabs`/`sectionData`, actions novas, `partialize` atualizado, subscriber sessionStorage
- `roteiro-unificado/src/features/form/tabConfig.ts` — criado com `TabConfig` interface e `TAB_CONFIG` array de 10 itens

## Decisions Made

- **Subscriber manual para sessionStorage:** Preferido sobre composição de dois middlewares `persist` (como documentado em RESEARCH.md §Padrão 1). A abordagem com dois `persist` aninhados em Zustand v5 torna os tipos TypeScript complexos e o `partialize` ambíguo. O subscriber manual é explícito e mais simples de entender.
- **TabKey exportado de formStore.ts:** Mantém um único ponto de importação para todos os consumers da store e do enum, seguindo o padrão barrel já estabelecido no projeto.
- **partialize explícito:** Retornar EXPLICITAMENTE apenas os 4 campos de navegação (sem depender de spread) garante que qualquer campo novo adicionado ao estado não vaze acidentalmente para o localStorage.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocker] JSX.Element em ProgressBadge.tsx causava falha no type-check**

- **Found during:** Task 1 (verificação pós-implementação)
- **Issue:** `src/features/form/ProgressBadge.tsx` (criado pelo Plan 05-02 em paralelo) usava `JSX.Element` como tipo de retorno explícito, o que não funciona com `"jsx": "react-jsx"` sem importar o namespace JSX
- **Fix:** O pre-commit hook (ESLint + Prettier) já havia corrigido a assinatura removendo o tipo de retorno explícito. O type-check passou sem intervenção adicional.
- **Files modified:** `roteiro-unificado/src/features/form/ProgressBadge.tsx` (corrigido pelo linter)
- **Verification:** `npm run type-check` exitou 0 após a correção automática do linter
- **Committed in:** `6723acd` (commit do Plan 05-02, prévio a este plano)

## Known Stubs

Nenhum stub — este plano não renderiza UI; expõe apenas estado e configuração tipados.

## Threat Flags

Nenhuma superfície nova além do documentado no threat model do plano:
- `form-data-${tenantId}` no sessionStorage: namespaceado por tenant, envolvido em try/catch
- `form-progress-${tenantId}` no localStorage: padrão existente desde Phase 3

## Self-Check: PASSED

- `roteiro-unificado/src/stores/formStore.ts` existe e contém `export enum TabKey`
- `roteiro-unificado/src/features/form/tabConfig.ts` existe com 10 entradas
- Commit `0569a77` existe no histórico
- `npm run type-check` passou sem erros
