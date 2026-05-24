---
phase: 08-autosave-submiss-o-versionamento
plan: "04"
subsystem: form
tags: [react-query, zustand, autosave, skeleton, dialog, history, typescript, supabase]

# Dependency graph
requires:
  - phase: 08-autosave-submiss-o-versionamento
    plan: "02"
    provides: "useAutosave(tenantId) e hydrateFromAssessment no formStore"
  - phase: 08-autosave-submiss-o-versionamento
    plan: "03"
    provides: "useSubmitAssessment(orgId) e useNewRevision(orgId)"
provides:
  - "FormLayout.tsx atualizado com useQuery draft, useEffect hydration, useAutosave, skeleton, sticky footer e dialog de submissão"
  - "HistoryPage.tsx criado — página /form/:orgId/history com lista de versões, skeleton, badges e fluxo de nova revisão"
affects:
  - "08-05 — router.tsx precisa adicionar rota /form/:orgId/history apontando para HistoryPage"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "maybeSingle<Tables<'assessments'>>() para evitar inferência never do Supabase JS v2 com select(*)"
    - "useEffect([draftQuery.data, tenantId]) para hidratação TanStack v5 (sem onSuccess em useQuery)"
    - "createFormStore(tenantId).getState() para acesso ao store sem subscription React — evita loop infinito"
    - "Sticky footer com position sticky bottom-0 dentro de flex-col wrapper — fora de <main>"
    - "pb-20 no <main> quando activeTab === TabKey.Nda para evitar conteúdo coberto pelo footer"

key-files:
  created:
    - roteiro-unificado/src/features/form/HistoryPage.tsx
  modified:
    - roteiro-unificado/src/features/form/FormLayout.tsx

key-decisions:
  - "maybeSingle<Tables<'assessments'>>(): Supabase JS v2 com select('*') infere never sem genérico explícito — mesmo padrão de .single<T>() documentado na Phase 3 (03-01), agora aplicado ao maybeSingle"
  - "Sticky footer colocado fora de <main> mas dentro do flex-col wrapper: permite position sticky funcionar corretamente sem scroll overflow conflict — segue Armadilha 5 do RESEARCH.md"
  - "useAssessmentHistory não exportada de HistoryPage: encapsulamento correto — só HistoryPage usa este hook; exportar criaria acoplamento desnecessário"
  - "mostRecentIsSubmitted pré-calculado fora do map: evita recalcular history[0].status === 'submitted' em cada iteração do array"

patterns-established:
  - "maybeSingle<T>() com genérico explícito como workaround para Supabase JS v2 strict mode (análogo ao .single<T>() da Phase 3)"
  - "Hook de query não exportado dentro do arquivo de página — padrão de encapsulamento para hooks de uso único"

requirements-completed:
  - SAVE-01
  - SAVE-02
  - SAVE-03
  - SAVE-05
  - SAVE-06
  - UX-04
  - UX-05

# Metrics
duration: ~4min
completed: "2026-05-24"
---

# Phase 8 Plan 04: FormLayout + HistoryPage — Integração UI Summary

**FormLayout integrado com autosave, skeleton de hydration e dialog de submissão; HistoryPage criada do zero com lista de versões, badges de status e fluxo de nova revisão — fluxo completo draft → submit → histórico → nova revisão funcional no browser após wiring do router (plano 08-05)**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-05-24T01:43:13Z
- **Completed:** 2026-05-24T01:47:39Z
- **Tasks:** 2
- **Files modified:** 2 (1 modificado, 1 criado)

## Accomplishments

### Tarefa 1: FormLayout.tsx atualizado

- `useQuery(['assessment', 'draft', tenantId])` com `maybeSingle<Tables<'assessments'>>()` — carrega draft existente ao montar
- `useEffect([draftQuery.data, tenantId])` chama `createFormStore(tenantId).getState().hydrateFromAssessment(data.form_data)` — hidratação via getState() sem subscription React (evita Armadilha 2)
- `useAutosave(tenantId)` montado logo após os hooks de query
- `useSubmitAssessment(tenantId)` para submitMutation com isPending
- Skeleton de 4 placeholders com `aria-busy="true"` durante `draftQuery.isLoading`
- `pb-20` no `<main>` quando `activeTab === TabKey.Nda` (evita Armadilha 5)
- Sticky footer com "Enviar Avaliação" visível apenas em `TabKey.Nda && !draftQuery.isLoading`
- Dialog de confirmação com copy exato do UI-SPEC: título "Enviar Avaliação?", descrição sobre imutabilidade, botões "Manter Rascunho" (secondary) e "Confirmar Envio" (primary, isLoading)
- Dialog usa `onClose` conforme API do `Dialog` existente em `dialog.tsx`

### Tarefa 2: HistoryPage.tsx criado

- `useAssessmentHistory(orgId)` com `queryKey: ['assessments', orgId]`, `staleTime: 60_000`, `enabled: !!orgId`
- Skeleton de 3 cards fake durante `isLoading` com estrutura per UI-SPEC §Skeleton da HistoryPage
- Empty state com heading "Nenhuma avaliação enviada ainda" e instrução conforme Copywriting Contract
- Lista renderiza `<article>` semântico por versão com `aria-label` adequado
- Badge "Enviado": `bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full`
- Badge "Rascunho": `bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full`
- `<Badge grade={...} />` para nível gerencial G1-G5
- "Iniciar Nova Revisão" apenas em `index === 0 && mostRecentIsSubmitted` — T-08-16 mitigado
- "Ver detalhes" em todos os registros submitted
- Botão "← Voltar ao Formulário" com `navigate(/form/${orgId})`

## Task Commits

1. **feat(08-04): atualizar FormLayout com useQuery draft, hydration, useAutosave, skeleton e submit dialog** — `3de8bc3`
2. **feat(08-04): criar HistoryPage — lista de versões com skeleton, badges e nova revisão** — `f667efa`

## Files Created/Modified

- `roteiro-unificado/src/features/form/FormLayout.tsx` — 9 novos imports, useQuery + useEffect hydration + useAutosave + submitMutation + skeleton + sticky footer + dialog
- `roteiro-unificado/src/features/form/HistoryPage.tsx` — 193 linhas (criado) com useAssessmentHistory, lista de versões, badges, botões condicionais

## Decisions Made

- **`maybeSingle<Tables<'assessments'>>()`:** Supabase JS v2 em strict mode infere `data` como `never` em `.select('*').maybeSingle()` sem genérico explícito. Workaround consistente com Phase 3 (03-01) que usa `.single<T>()`. A tabela `assessments` tem tipo `Tables<'assessments'>` exportado de `database.ts`.
- **Sticky footer fora de `<main>`:** A estrutura do JSX coloca o sticky footer como irmão de `<aside>` e `<main>` dentro do flex-col wrapper (não dentro de `<main>`). Isso garante que `position: sticky; bottom: 0` funcione corretamente sem conflitar com scroll overflow de `<main>`.
- **`useAssessmentHistory` não exportada:** Hook de uso único encapsulado no arquivo — segue o princípio de encapsulamento; exportar seria acoplamento desnecessário.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Inferência de tipo never com maybeSingle() sem genérico**
- **Found during:** Tarefa 1 — verificação `npx tsc --noEmit`
- **Issue:** `Property 'form_data' does not exist on type 'never'` — Supabase JS v2 infere `data` como `never` em `.select('*').maybeSingle()` sem genérico
- **Fix:** Adicionado `.maybeSingle<Tables<'assessments'>>()` e `import type { Tables } from '@/types/database'` — padrão consistente com `.single<T>()` da Phase 3 (03-01)
- **Files modified:** `FormLayout.tsx`
- **Commit:** incluído em `3de8bc3`

## Known Stubs

Nenhum — ambos os arquivos implementam lógica completa sem placeholders ou dados hardcoded.

## Threat Flags

Nenhuma superfície nova além do já mapeado no `<threat_model>` do plano (T-08-12 a T-08-16).

Mitigações aplicadas:
- T-08-13: `createFormStore(tenantId).getState()` usado em vez de subscription React — sem loop infinito
- T-08-14: `orgId` de `useParams` + RLS no Supabase — dados de outra org retornam array vazio
- T-08-16: `index === 0 && mostRecentIsSubmitted` — botão não aparece quando draft ativo já existe

## Self-Check

Verificações pós-SUMMARY:

---

## Self-Check: PASSED

- `roteiro-unificado/src/features/form/FormLayout.tsx` — FOUND
- `roteiro-unificado/src/features/form/HistoryPage.tsx` — FOUND
- Commit `3de8bc3` — FOUND (feat(08-04): atualizar FormLayout com useQuery draft...)
- Commit `f667efa` — FOUND (feat(08-04): criar HistoryPage...)
- `npx tsc --noEmit` — PASSED (zero erros em ambos os arquivos)
- useAutosave(tenantId) presente em FormLayout — CONFIRMED
- hydrateFromAssessment via createFormStore().getState() — CONFIRMED
- Dialog copy exato: "Enviar Avaliação?" / "Manter Rascunho" / "Confirmar Envio" — CONFIRMED
- Botão "Iniciar Nova Revisão" condicional index===0 && submitted — CONFIRMED

---
*Phase: 08-autosave-submiss-o-versionamento*
*Completed: 2026-05-24*
