---
phase: 06-campos-do-formul-rio-torre-360
plan: "07"
subsystem: form-integration-wiring
tags:
  - react-hook-form
  - useFormSection
  - FormLayout
  - integration
  - wiring
  - completeness
dependency_graph:
  requires:
    - 06-02 (IdentificacaoSection)
    - 06-03 (TorreDecisaoSection)
    - 06-04 (TorreSiengeSection)
    - 06-05 (TorreAcessoSection)
    - 06-06 (TorreClassificacaoSection)
    - src/features/form/useFormSection.ts (Phase 5 — ampliado neste plano)
    - src/features/form/FormLayout.tsx (Phase 5 — modificado neste plano)
  provides:
    - useFormSection com assinatura backward-compatible (control? + totalRequired? opcionais)
    - completeness real derivado de useFormState quando control fornecido
    - FormLayout com switch(activeTab) ligando os 5 Section components Torre 360
  affects:
    - Phase 7 (Habilitações/NDA — FormLayout switch aguarda esses components)
    - Phase 8 (autosave — useFormSection é o hook de integração entre seções e store)
tech_stack:
  added: []
  patterns:
    - "useFormState chamado incondicionalmente com sub-hook pattern para compatibilidade retroativa (THREAT T-06-07-02)"
    - "flattenErrors helper local — achata FieldErrors aninhado para Record<string, string>"
    - "renderSection(activeTab, tenantId) função pura antes do componente — switch por TabKey"
    - "Default case do switch preserva placeholder para abas Phase 7 não implementadas"
key_files:
  created: []
  modified:
    - roteiro-unificado/src/features/form/useFormSection.ts
    - roteiro-unificado/src/features/form/FormLayout.tsx
decisions:
  - "useFormState chamado com sub-hook interno usando noop Control quando control ausente — nunca condicional (regra de hooks + T-06-07-02)"
  - "completeness sem control mantém sentinel 0.01 (visitedTabs) — backward-compat com Phase 5 (ProgressBadge + TabNavigation)"
  - "flattenErrors recursiva com prefixKey — suporta erros aninhados (ex: Sienge com moduleSchema)"
  - "renderSection fora do componente FormLayout (função pura) — sem re-criação em cada render"
  - "Stale .js files (57 arquivos) deletados de src/ — causavam shadowing de .tsx pelo resolver Vite"
metrics:
  duration: "~2h (inclui investigação + fix do render loop + aprovação do checkpoint)"
  completed: "2026-05-22"
  tasks_completed: 3
  files_created: 0
  files_modified: 2
---

# Phase 06 Plan 07: Wiring Final Torre 360 — Summary

**One-liner:** useFormSection ampliado com control? + completeness real via useFormState, e FormLayout com switch(activeTab) ligando os 5 Section components Torre 360 — encerramento da Phase 6 com checkpoint humano aprovado após correção de render loop por shadowing de arquivos .js stale.

## O Que Foi Construído

### Task 1: useFormSection ampliado (backward-compatible)

Arquivo `roteiro-unificado/src/features/form/useFormSection.ts` ampliado com:

- Assinatura genérica: `useFormSection<T extends FieldValues>(tenantId, tab, control?, totalRequired?)`
- Sub-hook interno `useControlState` chamado incondicionalmente com noop Control quando `control` é undefined — garante que `useFormState` nunca seja chamado condicionalmente (regra de hooks + mitigação T-06-07-02)
- `flattenErrors(errs: FieldErrors)` helper local com recursão via `prefixKeys` — suporta erros aninhados como os do schema de Sienge (12 módulos × 5 campos)
- Quando `control` presente: `errors` = resultado de `flattenErrors(formState.errors)` + `completeness` derivado de `totalRequired` vs `errorCount`
- Quando `control` ausente: `errors = {}` e `completeness` mantém sentinel Phase 5 (`0.01` se visitada, `0` se não)
- Shape de retorno `{ data, updateField, errors, completeness }` preservada — zero mudanças em consumidores (ProgressBadge, TabNavigation)

Commit: `a7bd828` feat(06-07): ampliar useFormSection com control? opcional e completeness real

### Task 2: FormLayout com switch(activeTab) wired

Arquivo `roteiro-unificado/src/features/form/FormLayout.tsx` modificado com:

- 5 imports adicionados: IdentificacaoSection, TorreDecisaoSection, TorreSiengeSection, TorreAcessoSection, TorreClassificacaoSection
- Função pura `renderSection(activeTab: TabKey, tenantId: string)` antes do componente com switch de 5 cases + default (placeholder text para Phase 7)
- Bloco `<main>` atualizado: `<h1>{activeTabConfig.label}</h1>` preservado + `{renderSection(store.activeTab, tenantId)}`
- Cross-tenant guard, hash sync useEffect, sidebar, ProgressBar, TabNavigation e handleSignOut preservados intactos

Commit: `d395ef9` feat(06-07): ligar Section components ao FormLayout via switch por activeTab

### Task 3: Checkpoint humano aprovado

O checkpoint humano de verificação visual foi aprovado após resolução de um blocker de render loop.

**Problema encontrado:** Após os commits das Tasks 1 e 2, o app apresentava render loop infinito no browser. Investigação revelou que 57 arquivos `.js` stale existiam em `src/` — compilações anteriores de um processo de build não removido. O Vite resolve `.js` antes de `.tsx` na mesma localização, então os `.js` stale estavam sendo servidos no lugar dos `.tsx` corrigidos, incluindo versões antigas com o padrão `watch()` (que causa re-render a cada keystroke).

**Fix aplicado:** Commits `6e07f28`, `9e5c881`, `afacd9e`, `81a4bfa`, `fc7040a` — substituição do padrão `watch value` pelo padrão `watch subscription` em todos os 5 Section components (IdentificacaoSection, TorreDecisaoSection, TorreSiengeSection, TorreAcessoSection, TorreClassificacaoSection). Os 57 arquivos `.js` stale foram deletados de `src/`.

**Resultado após fix:** Checkpoint aprovado pelo usuário. As 5 abas Torre 360 funcionam corretamente no browser:
- Aba Identificação: 12 campos com máscara CNPJ e validação inline
- Aba Torre Decisão: campos condicionais (qualBI aparece/desaparece conforme select "Existe BI hoje?")
- Aba Torre Sienge: 12 cards × 5 campos em grid responsivo
- Aba Torre Acesso: 8 selects + 3 textareas + checkbox group
- Aba Torre Classificação: 2 selects + 6 textareas + checkbox group de evidências
- Navegação entre abas preserva dados via Zustand sectionData
- Abas Habilitações/NDA exibem placeholder (Phase 7)

## Deviations from Plan

### Auto-fixes aplicados (Regra 1 — Bug)

**1. [Regra 1 - Bug] Fix render loop em todos os 5 Section components — padrão watch subscription**

- **Encontrado durante:** Checkpoint humano (Task 3)
- **Problema:** Todos os Section components (02–06) usavam `watch()` retornando valor reativo — causava re-render em loop a cada keystroke pois o valor do watch mudava, disparava o useEffect, que chamava updateSection, que atualizava o store, que causava novo render e novo watch value, reiniciando o ciclo
- **Fix:** Substituição por `watch(callback)` (padrão de subscription, não valor) — o callback só dispara quando o form muda internamente, sem criar dependência reativa no render
- **Arquivos modificados:**
  - `roteiro-unificado/src/features/form/sections/IdentificacaoSection.tsx` (commit `6e07f28`)
  - `roteiro-unificado/src/features/form/sections/TorreDecisaoSection.tsx` (commit `9e5c881`)
  - `roteiro-unificado/src/features/form/sections/TorreSiengeSection.tsx` (commit `afacd9e`)
  - `roteiro-unificado/src/features/form/sections/TorreAcessoSection.tsx` (commit `81a4bfa`)
  - `roteiro-unificado/src/features/form/sections/TorreClassificacaoSection.tsx` (commit `fc7040a`)

**2. [Regra 3 - Blocker] Deleção de 57 arquivos .js stale em src/**

- **Encontrado durante:** Checkpoint humano (Task 3) — investigação do render loop
- **Problema:** 57 arquivos `.js` compilados estavam presentes em `src/` (resultado de processo de build anterior não limpo). O resolver Vite prioriza `.js` sobre `.tsx` para o mesmo caminho base — os stale `.js` estavam sendo servidos no lugar dos `.tsx` corrigidos com o fix de subscription
- **Fix:** Deleção dos 57 arquivos `.js` de `src/` — necessário para que os `.tsx` corrigidos fossem efetivamente carregados pelo Vite
- **Impacto:** Sem impacto no código de produção (arquivos gerados, não fontes); commits `6e07f28`–`fc7040a` incluem as deleções junto com os fixes de subscription

## Verificação de Conformidade (Success Criteria)

| Critério | Status |
|----------|--------|
| useFormSection aceita control? + totalRequired? opcionais | PASS |
| useFormState chamado incondicionalmente (sub-hook pattern) | PASS |
| flattenErrors helper local presente | PASS |
| Quando control ausente: errors = {}, completeness = sentinel Phase 5 | PASS |
| Quando control fornecido: completeness derivado de totalRequired vs errorCount | PASS |
| Shape de retorno { data, updateField, errors, completeness } preservada | PASS |
| FormLayout importa os 5 Section components | PASS |
| switch(activeTab) com 5 cases + default | PASS |
| Default case preserva placeholder text para Phase 7 | PASS |
| Cross-tenant guard preservado | PASS |
| hash sync preservado | PASS |
| npx tsc --noEmit produz 0 erros | PASS |
| npm run build completa sem erros | PASS |
| Checkpoint humano: 5 abas Torre 360 visualmente corretas | PASS — aprovado |
| Campo condicional qualBI funcional (aparece/desaparece) | PASS |
| Navegação cross-tab preserva dados via Zustand | PASS |
| Abas Phase 7 exibem placeholder correto | PASS |
| Console sem erros React (sem render loops) | PASS |

## Known Stubs

Nenhum. Todos os 5 Section components Torre 360 estão completamente ligados e funcionais. As 5 abas Habilitações/NDA estão intencionalmente com placeholder — serão implementadas na Phase 7.

## Threat Flags

Nenhuma nova superfície de segurança. A função `renderSection` recebe `tenantId` derivado do cross-tenant guard pré-existente em FormLayout — sem novo boundary criado (T-06-07-03: accept conforme plano).

## Self-Check: PASSED

Arquivos verificados:
- `roteiro-unificado/src/features/form/useFormSection.ts` — FOUND (modificado)
- `roteiro-unificado/src/features/form/FormLayout.tsx` — FOUND (modificado)

Commits verificados:
- `a7bd828` feat(06-07): ampliar useFormSection — FOUND
- `d395ef9` feat(06-07): ligar FormLayout switch — FOUND
- `6e07f28` fix(06-02): subscription pattern IdentificacaoSection — FOUND
- `9e5c881` fix(06-03): subscription pattern TorreDecisaoSection — FOUND
- `afacd9e` fix(06-04): subscription pattern TorreSiengeSection — FOUND
- `81a4bfa` fix(06-05): subscription pattern TorreAcessoSection — FOUND
- `fc7040a` fix(06-06): subscription pattern TorreClassificacaoSection — FOUND
