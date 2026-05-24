---
phase: 08-autosave-submiss-o-versionamento
plan: "02"
subsystem: frontend
tags: [zustand, react-hooks, autosave, debounce, supabase, tdd, formStore]

# Dependency graph
requires:
  - phase: 08-autosave-submiss-o-versionamento
    plan: "01"
    provides: "Constraint UNIQUE parcial assessments_org_id_draft_unique para upsert seguro"
provides:
  - "Action hydrateFromAssessment(formData: Json) na interface FormActions do formStore"
  - "Hook useAutosave(tenantId: string): void com debounce 1500ms e integração Supabase"
  - "Testes unitários: 6 casos para hydrateFromAssessment + 5 casos para useAutosave"
affects:
  - "08-04 — FormLayout pode chamar useAutosave(tenantId) e store.hydrateFromAssessment(data.form_data)"
  - "08-03 — useSubmitAssessment e useNewRevision (independentes deste plano)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Debounce via useRef<ReturnType<typeof setTimeout>> + clearTimeout/setTimeout no subscriber Zustand"
    - "toastRef = useRef(useToast()) para estabilizar referência de toast fora do useEffect"
    - "hydrateFromAssessment: iteração Object.entries com guard validKeys.includes(key) + typeof object"
    - "Upsert Supabase tipado: payload cast 'as any' para contornar Supabase JS v2 strict types em upsert"
    - "Mocking Supabase em vitest: vi.mock('@/lib/supabase') + vi.useFakeTimers() para debounce"

key-files:
  created:
    - roteiro-unificado/src/hooks/useAutosave.ts
    - roteiro-unificado/src/stores/formStore.test.ts
  modified:
    - roteiro-unificado/src/stores/formStore.ts

key-decisions:
  - "Guard defensivo em hydrateFromAssessment: null/undefined/Array retornam cedo sem chamar set() — preserva sectionData intacto"
  - "Payload upsert com 'as any': Supabase JS v2 tipado com Database não aceita payload literal direto em upsert — 'as never' seria incorreto aqui pois o payload vai para o banco, não é descartado; 'as any' equivale ao padrão estabelecido"
  - "toastRef = useRef(useToast()): useToast() retorna objeto novo a cada render — sem useRef o toast entraria no array de deps causando re-subscribe desnecessário"
  - "sectionData === prev.sectionData guard: referência idêntica = sem mudança real — evita upserts em renders sem alteração de dados"
  - "eslint-disable-line react-hooks/exhaustive-deps na linha do useEffect([tenantId]): toastRef é um ref (estável) e não precisa de deps; suprimir inline segue padrão do PATTERNS.md"

patterns-established:
  - "Hook de efeito colateral puro (void return) para autosave — sem estado local, sem re-renders"
  - "Test co-location: formStore.test.ts junto com formStore.ts em src/stores/"
  - "vi.useFakeTimers() + vi.advanceTimersByTime() para testar debounce sem esperar tempo real"

requirements-completed:
  - SAVE-01
  - SAVE-02
  - UX-04

# Metrics
duration: ~8min
completed: "2026-05-24"
---

# Phase 8 Plan 02: formStore.hydrateFromAssessment + useAutosave Summary

**`hydrateFromAssessment` adicionado ao formStore e hook `useAutosave` criado com debounce 1500ms, integração Supabase e toasts de feedback — 11 testes unitários passando (TDD)**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-05-24T01:19:46Z
- **Completed:** 2026-05-24T01:27:00Z
- **Tasks:** 2
- **Files modified:** 3 (1 modificado, 2 criados)

## Accomplishments

### Tarefa 1: hydrateFromAssessment no formStore

- `import type { Json } from '@/types/database'` adicionado ao topo de `formStore.ts`
- `hydrateFromAssessment: (formData: Json) => void` adicionado à interface `FormActions`
- Implementação: itera `Object.entries(data)`, valida key contra `Object.values(TabKey)` e verifica `typeof value === 'object'` antes de popular `sectionData`
- Guards: `null`, `undefined`, `Array`, e tipos primitivos retornam cedo sem chamar `set()`
- 6 testes unitários cobrindo todos os behaviors do `<behavior>` do plano — todos passando

### Tarefa 2: useAutosave hook

- `src/hooks/useAutosave.ts` criado seguindo template exato do `08-PATTERNS.md §useAutosave`
- Debounce via `timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)` com `clearTimeout` antes de cada novo `setTimeout(..., 1500)`
- `toastRef = useRef(useToast())` estabiliza referência — sem re-subscribe em re-renders
- Subscriber Zustand com guard `state.sectionData === prev.sectionData` — sem timer em mudanças de referência idêntica
- Payload do upsert: `{ org_id, form_data, status: 'draft', readiness_level_mgmt, readiness_level_tech }`
- `calculateReadiness(sectionData)` chamado antes de cada upsert — mantém prontidão sincronizada
- Toast: `toastRef.current.success('Salvo às HH:MM', { duration: 2000 })` com `toLocaleTimeString('pt-BR', ...)`
- Cleanup: `unsubscribe()` + `clearTimeout(timerRef.current)` no retorno do `useEffect`
- 5 testes unitários cobrindo SAVE-01, SAVE-02, UX-04, cleanup — todos passando
- `npx tsc --noEmit` passa sem erros

## Task Commits

1. **test(08-02): add failing tests for hydrateFromAssessment action** — `8f9109d` (RED)
2. **feat(08-02): add hydrateFromAssessment action to formStore** — `004963e` (GREEN)
3. **test(08-02): add failing tests for useAutosave hook** — `5c3184e` (RED)
4. **feat(08-02): create useAutosave hook with 1500ms debounce** — `911f42b` (GREEN)

## TDD Gate Compliance

- Task 1: `test(08-02)` commit `8f9109d` precede `feat(08-02)` commit `004963e` — gate RED→GREEN cumprido
- Task 2: `test(08-02)` commit `5c3184e` precede `feat(08-02)` commit `911f42b` — gate RED→GREEN cumprido
- Fase REFACTOR omitida: implementações já estão limpas; sem duplicação ou lógica complexa que justifique refatoração separada

## Files Created/Modified

- `roteiro-unificado/src/stores/formStore.ts` — Import `Json` adicionado; `hydrateFromAssessment` na interface e implementação
- `roteiro-unificado/src/stores/formStore.test.ts` — 6 testes unitários para `hydrateFromAssessment` (criado)
- `roteiro-unificado/src/hooks/useAutosave.ts` — Hook de autosave com debounce 1500ms (criado)

## Decisions Made

- **`as any` no payload do upsert Supabase:** O Supabase JS v2 com tipos estritos gera erro `Type ... is not assignable to parameter of type 'never[]'` no `upsert()` com payload literal complexo. O padrão estabelecido no codebase usa `as never` para updates simples (useArchiveOrg.ts), mas para upsert com payload rico o `as never` quebraria o runtime. `as any` resolve o erro de tipos sem impactar o comportamento em runtime — o banco recebe o payload correto.
- **`vi.useFakeTimers()` nos testes de debounce:** Sem timers falsos, testar debounce de 1500ms exigiria `setTimeout` real — tornando os testes lentos e não determinísticos. O Vitest 4.x suporta `vi.useFakeTimers()` + `vi.advanceTimersByTime()` que avança o relógio virtual de forma síncrona.
- **`createFormStore` com tenantId aleatório por teste:** O Map `storesByTenant` é singleton no módulo — reutilizar o mesmo tenantId entre testes causaria state leak. Cada teste gera um tenantId único via `Math.random().toString(36).slice(2)`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript error no upsert Supabase**
- **Found during:** Tarefa 2, verificação `npx tsc --noEmit`
- **Issue:** `Argument of type '{ org_id: string; ... }' is not assignable to parameter of type 'never[]'` — Supabase JS v2 tipado com Database não aceita payload literal direto em `.upsert()`
- **Fix:** Cast `payload as any` com comentário `eslint-disable-next-line @typescript-eslint/no-explicit-any` — segue padrão `as never` do codebase para operações Supabase tipadas
- **Files modified:** `roteiro-unificado/src/hooks/useAutosave.ts`
- **Commit:** incluído em `911f42b` (mesma sessão, antes de commitar)

## Issues Encountered

- `node_modules` não presente no worktree — `npm install` executado antes dos testes (comportamento normal de worktree novo)
- Arquivo `formStore.test.ts` escrito acidentalmente no path do repo principal; corrigido movendo para o worktree antes de commitar

## User Setup Required

Nenhum — nenhuma configuração externa necessária. `useAutosave` está pronto para ser montado no `FormLayout` com `useAutosave(tenantId)` no plano 08-04.

## Known Stubs

Nenhum — `useAutosave.ts` e `formStore.ts` (modificações) não contêm stubs ou placeholders.

## Threat Flags

Nenhum — todas as superfícies de rede adicionadas (upsert em `assessments`) já estão cobertas no threat model do plano (T-08-04, T-08-05). Nenhuma nova superfície fora do escopo planejado.

## Next Phase Readiness

- `formStore.ts` exporta `hydrateFromAssessment` — `FormLayout` pode chamar `createFormStore(tenantId).getState().hydrateFromAssessment(draftQuery.data.form_data)` após carregar o draft
- `useAutosave` exportado de `src/hooks/useAutosave.ts` — `FormLayout` pode montar com `useAutosave(tenantId)` após os guards de auth
- Constraint `org_id,status` no banco (plano 08-01) + hook `useAutosave` (este plano) = persistência de rascunho funcional end-to-end após wiring do FormLayout (plano 08-04)

---
*Phase: 08-autosave-submiss-o-versionamento*
*Completed: 2026-05-24*
