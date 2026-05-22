---
phase: 05-shell-do-formul-rio-navega-o-por-abas
plan: "02"
subsystem: ui
tags: [react, tailwind, svg, presentational, progress-indicator]

# Dependency graph
requires: []
provides:
  - "Componente ProgressBadge puro presentacional com 3 estados SVG inline (vazio / em progresso / completo)"
  - "Exportado de src/features/form/ProgressBadge.tsx como named export"
  - "Cria o diretório src/features/form/ para os demais componentes do formulário"
affects:
  - "05-03-PLAN (TabNavigation importará ProgressBadge)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SVG inline Heroicons (viewBox 0 0 24 24, strokeWidth=1.5) para ícones sem dependências de biblioteca"
    - "Branching first-match-wins para seleção de estado de renderização"
    - "cn() de @/lib/utils para composição de className opcional"

key-files:
  created:
    - roteiro-unificado/src/features/form/ProgressBadge.tsx
  modified: []

key-decisions:
  - "Tipo de retorno JSX implícito (TypeScript infere) em vez de JSX.Element explícito — namespace JSX não disponível sem import React no projeto configurado com JSX transform automático"
  - "Diretório src/features/form/ criado neste plano para abrigar os componentes do formulário"

patterns-established:
  - "Componente puro presentacional: recebe apenas props numéricas, sem acoplamento a stores ou context"

requirements-completed: [UX-03]

# Metrics
duration: 2min
completed: "2026-05-22"
---

# Phase 05 Plan 02: ProgressBadge Summary

**Componente SVG inline puro com 3 estados de progresso (vazio/em progresso/completo) usando tokens Tailwind text-primary-300, text-accent e text-green-500 sem dependências de biblioteca de ícones**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-05-22T19:49:57Z
- **Completed:** 2026-05-22T19:51:34Z
- **Tasks:** 1
- **Files modified:** 1 criado

## Accomplishments

- Criado `src/features/form/ProgressBadge.tsx` como componente puro presentacional
- Implementados 3 ramos de renderização SVG inline: círculo vazio (text-primary-300), relógio em progresso (text-accent), checkmark completo (text-green-500)
- Criado diretório `src/features/form/` para hospedar os componentes do formulário
- type-check passou sem erros; sem hex hardcoded; sem acoplamento à store

## Task Commits

Cada task foi commitada atomicamente:

1. **Task 1: Criar ProgressBadge.tsx com 3 estados SVG inline** - `6723acd` (feat)

## Files Created/Modified

- `roteiro-unificado/src/features/form/ProgressBadge.tsx` — Componente puro com ProgressBadgeProps (completeness: number, className?: string), 3 ramos SVG inline, aria-hidden="true", sem hex hardcoded

## Decisions Made

- Tipo de retorno JSX omitido (inferido pelo TypeScript) em vez de `: JSX.Element` explícito. O namespace `JSX` não é acessível diretamente no projeto com o JSX transform automático do Vite — o padrão dos outros componentes do projeto é omitir o tipo de retorno e deixar o TypeScript inferir.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removida anotação de retorno `: JSX.Element` explícita**
- **Found during:** Task 1 (Criar ProgressBadge.tsx)
- **Issue:** O plano especificava `): JSX.Element` como tipo de retorno, mas `JSX` não é um namespace acessível no projeto sem importar `React` explicitamente (projeto usa JSX transform automático). TypeScript reportou `error TS2503: Cannot find namespace 'JSX'`
- **Fix:** Removida a anotação `: JSX.Element` — TypeScript infere o tipo correto (`React.JSX.Element`) automaticamente, seguindo o padrão dos outros componentes do projeto
- **Files modified:** `roteiro-unificado/src/features/form/ProgressBadge.tsx`
- **Verification:** `npm run type-check` exits 0 após a correção
- **Committed in:** `6723acd` (parte do commit da task)

---

**Total desvios:** 1 auto-corrigido (Rule 1 - bug de tipo)
**Impacto no plano:** Correção necessária para compilar. Sem impacto funcional — o componente exportado tem assinatura e comportamento idênticos ao especificado no plano.

## Issues Encountered

- Anotação de retorno `: JSX.Element` causou erro de compilação TypeScript. Resolvido removendo a anotação explícita (TypeScript infere corretamente sem ela no contexto do projeto).

## User Setup Required

Nenhum — sem serviços externos, sem variáveis de ambiente.

## Next Phase Readiness

- `ProgressBadge` disponível para importação em `src/features/form/TabNavigation.tsx` (Plan 05-03)
- Diretório `src/features/form/` criado e pronto para os demais componentes da fase
- Sem bloqueadores

---
*Phase: 05-shell-do-formul-rio-navega-o-por-abas*
*Completed: 2026-05-22*
