---
phase: 05-shell-do-formul-rio-navega-o-por-abas
plan: "03"
subsystem: ui
tags: [hook, sidebar, stepper, progress-bar, responsive, zustand, accessibility]

# Dependency graph
requires:
  - "05-01: formStore expandida com TabKey, visitedTabs, sectionData, updateSection, markTabVisited, setActiveTab"
  - "05-02: ProgressBadge com 3 estados SVG inline"
provides:
  - "Hook useFormSection(tenantId, tab) retornando data/updateField/errors/completeness por aba"
  - "Componente TabNavigation: stepper vertical (desktop) + pills horizontais (mobile) com 10 abas"
  - "Componente ProgressBar: faixa h-1 sticky no topo com largura proporcional ao progresso médio"
affects:
  - "05-04-PLAN (FormLayout importará TabNavigation e ProgressBar para montar o shell do formulário)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Hook de abstração de aba: useFormSection isola o acesso a sectionData e proxia completeness via visitedTabs"
    - "window.history.replaceState em vez de window.location.hash = ... para evitar react-hooks/immutability"
    - "Guard anti-loop de hash: verifica window.location.hash !== '#' + tab antes de escrever"
    - "Pills mobile via flex-row overflow-x-auto em nav; stepper desktop via md:flex-col md:overflow-x-visible"
    - "aria-label por button garante acessibilidade quando label visual está oculto (hidden md:inline)"
    - "TAB_CONFIG.reduce para calcular pct médio de completeness no ProgressBar"
    - "role=progressbar + aria-valuenow + aria-valuemin/max para acessibilidade da barra de progresso"

key-files:
  created:
    - roteiro-unificado/src/features/form/useFormSection.ts
    - roteiro-unificado/src/features/form/TabNavigation.tsx
    - roteiro-unificado/src/features/form/ProgressBar.tsx
  modified: []

key-decisions:
  - "window.history.replaceState usado em vez de window.location.hash = tab — a regra react-hooks/immutability (eslint-plugin-react-hooks v7) proíbe atribuição direta a propriedades de objetos globais dentro de handlers de componentes"
  - "Tipo de retorno implícito (inferido pelo TypeScript) para TabNavigation e ProgressBar — mesmo padrão estabelecido no Plan 02 para evitar erro TS2503 (namespace JSX não acessível sem import React)"
  - "completeness mantida como proxy visitedTabs.has(tab) ? 0.01 : 0 conforme D-09; Phase 6+ substituirá por cálculo Zod real"

patterns-established:
  - "Hook de aba (useFormSection): abstrai store access e retorna slice tipado + helpers; sem useMemo neste plano"
  - "Componente de navegação sem NavLink — button type=button evita scroll-to-anchor e comportamentos indesejados de roteamento"
  - "Guard anti-loop hash + store: padrão para sincronização bidirecional segura entre window.location.hash e Zustand"

requirements-completed: [FORM-04, UX-03]

# Metrics
duration: 6min
completed: "2026-05-22"
---

# Phase 05 Plan 03: useFormSection + TabNavigation + ProgressBar Summary

**Hook useFormSection e componentes TabNavigation/ProgressBar que consomem formStore expandida para abstrair acesso por aba, renderizar stepper responsivo com 10 itens e exibir faixa sticky de progresso**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-05-22T19:53:50Z
- **Completed:** 2026-05-22T19:59:01Z
- **Tasks:** 3
- **Files criados:** 3

## Accomplishments

- Criado `useFormSection.ts`: hook que retorna `{ data, updateField, errors, completeness }` por aba, com proxy de completeness via `visitedTabs.has(tab) ? 0.01 : 0` (D-09)
- Criado `TabNavigation.tsx`: stepper vertical (desktop) + pills horizontais (mobile) com os 10 itens de TAB_CONFIG, ProgressBadge por item, guard anti-loop de hash, aria-label em cada button
- Criado `ProgressBar.tsx`: faixa h-1 sticky top-0 z-40 com largura calculada via TAB_CONFIG.reduce + visitedTabs, role=progressbar + aria-valuenow, sem percentual numérico
- `npm run type-check` passa sem erros nos 3 arquivos
- Sem hex hardcoded em nenhum dos 3 arquivos
- ESLint passou em todos os arquivos após ajuste de window.history.replaceState

## Task Commits

Cada task foi commitada atomicamente:

1. **Task 1: Criar useFormSection.ts** — `e36ee16` (feat)
2. **Task 2: Criar TabNavigation.tsx** — `936584b` (feat)
3. **Task 3: Criar ProgressBar.tsx** — `291ac49` (feat)

## Files Created/Modified

- `roteiro-unificado/src/features/form/useFormSection.ts` — Hook com assinatura `(tenantId: string, tab: TabKey)`, retorna `{ data, updateField, errors, completeness }`, proxy `visitedTabs.has(tab) ? 0.01 : 0`
- `roteiro-unificado/src/features/form/TabNavigation.tsx` — Componente `{ tenantId }`, mapeia TAB_CONFIG, usa `<button type="button">`, guard `window.location.hash !== '#' + tab`, cores via tokens semânticos, `hidden md:inline` para label
- `roteiro-unificado/src/features/form/ProgressBar.tsx` — Componente `{ tenantId }`, faixa `h-1 sticky top-0 z-40`, `bg-primary` + `bg-gray-200`, `role="progressbar"` + `aria-valuenow`, `transition-all duration-300`

## Decisions Made

- **window.history.replaceState em vez de window.location.hash = tab:** A regra `react-hooks/immutability` do `eslint-plugin-react-hooks` v7 (instalado na Phase 1) proíbe atribuição direta a propriedades de objetos globais dentro de handlers de componentes. Usar `window.history.replaceState(null, '', '#' + tab)` é semanticamente equivalente — atualiza o hash sem causar navegação — e passa o linter.

- **Tipo de retorno implícito:** O namespace `JSX` não é acessível diretamente no projeto com JSX transform automático. Mesmo padrão do Plan 02 (ProgressBadge): TypeScript infere o tipo correto sem anotação explícita.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Substituição de window.location.hash = tab por window.history.replaceState**
- **Found during:** Task 2 (TabNavigation.tsx) — pre-commit hook ESLint falhou
- **Issue:** O plano especificava `window.location.hash = tab` na implementação, mas a regra `react-hooks/immutability` do eslint-plugin-react-hooks v7 proíbe atribuição direta a propriedades de objetos globais dentro de handlers de componentes React
- **Fix:** Substituída a atribuição `window.location.hash = tab` por `window.history.replaceState(null, '', '#' + tab)` dentro do guard anti-loop. O comportamento é semanticamente idêntico: atualiza o fragmento hash da URL sem causar navegação ou scroll, e o guard `window.location.hash !== '#' + tab` ainda funciona para ler o hash atual
- **Files modified:** `roteiro-unificado/src/features/form/TabNavigation.tsx`
- **Commit:** `936584b`

**2. [Rule 1 - Bug] Removida anotação de retorno JSX.Element em TabNavigation e ProgressBar**
- **Found during:** Task 2 e Task 3 — type-check TSC
- **Issue:** Mesmo problema já documentado no Plan 02: `JSX.Element` não é acessível sem importar React explicitamente
- **Fix:** Removida anotação `: JSX.Element` do tipo de retorno — TypeScript infere corretamente. Padrão estabelecido no Plan 02
- **Files modified:** `TabNavigation.tsx`, `ProgressBar.tsx`

---

**Total desvios:** 2 auto-corrigidos (Rule 1 — bugs de compatibilidade com toolchain do projeto)
**Impacto no plano:** Correções necessárias para passar ESLint/TypeScript. Sem impacto funcional — comportamento resultante idêntico ao especificado no plano.

## Threat Surface Scan

Nenhuma nova superfície de segurança introduzida além das documentadas no threat_model do plano:
- T-05-03-01 mitigado: guard `window.location.hash !== '#' + tab` presente no TabNavigation
- T-05-03-02 aceito: labels expostos em aria-label são públicos (nomes de abas do formulário)
- T-05-03-03 aceito: RLS Supabase é a barreira autoritativa; tenantId arbitrário cria store isolada sem acesso real a dados de outros tenants

## Known Stubs

- `errors: Record<string, string> = {}` em `useFormSection.ts`: sempre objeto vazio em Phase 5. Phase 6 preencherá com validação Zod por campo obrigatório. Não bloqueia o objetivo do plano (hook correto + componentes visuais funcionais).
- `completeness = visitedTabs.has(tab) ? 0.01 : 0`: proxy de progresso em Phase 5. Valor máximo por aba visitada é 1% (0.01 × 100). Phase 6 substituirá por cálculo real baseado em campos preenchidos / campos obrigatórios.

## User Setup Required

Nenhum — sem serviços externos, sem variáveis de ambiente.

## Next Phase Readiness

- `useFormSection`, `TabNavigation` e `ProgressBar` disponíveis para importação
- `FormLayout` (Plan 05-04) pode compor TabNavigation + ProgressBar + área de conteúdo + botão Sair
- Sem bloqueadores

---
*Phase: 05-shell-do-formul-rio-navega-o-por-abas*
*Completed: 2026-05-22*
