---
phase: quick
plan: 260525-n1d
subsystem: form
tags: [navigation, sidebar, history, ux]
dependency_graph:
  requires: []
  provides: [HistoryContent reutilizável, item Histórico na sidebar do formulário]
  affects: [FormLayout, TabNavigation, HistoryPage]
tech_stack:
  added: []
  patterns: [render condicional por estado local de view, extração de componente de conteúdo sem wrapper de página]
key_files:
  created:
    - roteiro-unificado/src/features/form/HistoryContent.tsx
  modified:
    - roteiro-unificado/src/features/form/HistoryPage.tsx
    - roteiro-unificado/src/features/form/TabNavigation.tsx
    - roteiro-unificado/src/features/form/FormLayout.tsx
decisions:
  - "HistoryContent sem exports de hook/tipo para evitar warning react-refresh/only-export-components"
  - "onSelectStep como callback explícito em TabNavigation — abordagem clara e sem loop de render"
  - "Item Histórico renderizado apenas quando onSelectHistory é passado — compatibilidade retroativa com HistoryPage standalone"
metrics:
  duration: ~12min
  completed_date: 2026-05-25
---

# Quick Task 260525-n1d: Adicionar Histórico no Menu Lateral

Item "Histórico" adicionado na sidebar do formulário com render condicional da lista de versões dentro do `<main>` do `FormLayout`, sem navegar para rota separada; rota standalone `/form/:orgId/history` preservada via `HistoryContent` reutilizável.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extrair HistoryContent reutilizável de HistoryPage | 0546bf3 | HistoryContent.tsx (criado), HistoryPage.tsx (reescrito) |
| 2 | Adicionar item "Histórico" na sidebar (TabNavigation) | 5c2a5c9 | TabNavigation.tsx |
| 3 | Render condicional form/histórico dentro do main (FormLayout) | 50be216 | FormLayout.tsx, HistoryContent.tsx (refinamento) |

## What Was Built

**HistoryContent.tsx** — Componente de conteúdo reutilizável extraído de `HistoryPage`. Contém: hook interno `useAssessmentHistory`, tipo `AssessmentRow`, skeleton de 3 cards, empty state, lista de `<article>` com badges de status, `<Badge grade>`, `Ver detalhes`, `<ExportPdfButton>` e `Iniciar Nova Revisão`. Aceita prop `showHeading?: boolean` (default `true`) para controlar se renderiza o `<h1>` + subtítulo — `HistoryPage` passa `showHeading` (mantém cabeçalho), `FormLayout` passa `showHeading={false}` (topbar já mostra contexto).

**HistoryPage.tsx** — Simplificado para wrapper de página: cross-tenant guard + `div.mx-auto.max-w-3xl.px-4.py-8` + botão "← Voltar ao Formulário" + `<HistoryContent showHeading />`. Sem duplicação de lógica.

**TabNavigation.tsx** — Novas props opcionais: `activeView` (`'form'|'historico'`, default `'form'`), `onSelectHistory`, `onSelectStep`. Item Histórico renderizado apenas quando `onSelectHistory` é passado — compatibilidade retroativa. Ícone SVG de relógio no slot do badge. Separação visual `border-t border-white/10`. `isActive` das etapas respeita `activeView !== 'historico'`.

**FormLayout.tsx** — Estado `view: 'form'|'historico'` com `useState`. Ambas instâncias de `<TabNavigation>` (desktop e mobile) recebem `activeView={view}`, `onSelectHistory={() => setView('historico')}`, `onSelectStep={() => setView('form')}`. Topbar mostra "Histórico" ou o label da aba ativa. Render condicional: `view === 'historico'` → `<HistoryContent orgId={tenantId} showHeading={false} />`; `view === 'form'` → comportamento original com `ReadinessClassification` + `renderSection` + footer sticky.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed export of useAssessmentHistory and AssessmentRow from HistoryContent**
- **Found during:** Task 3 (eslint verification)
- **Issue:** Exporting a non-component from a component file gera warning `react-refresh/only-export-components`. HistoryPage não usa o hook diretamente — apenas o componente HistoryContent.
- **Fix:** Tornar `useAssessmentHistory` e `AssessmentRow` internos ao módulo (sem `export`).
- **Files modified:** `HistoryContent.tsx`
- **Commit:** 50be216

## Verification

- `tsc --noEmit`: PASSED (0 errors)
- `eslint` nos 4 arquivos modificados: PASSED (0 errors, 0 warnings)
- Pre-existing warnings no restante do codebase: 14 warnings (fora do escopo — pré-existentes)

## Known Stubs

Nenhum. HistoryContent conecta diretamente ao Supabase via `useAssessmentHistory` — sem dados mock.

## Threat Flags

Nenhum. Não foram introduzidos novos endpoints, rotas de auth ou padrões de acesso a dados. `HistoryContent` reutiliza a mesma query de `HistoryPage` — sem nova superfície de rede.

## Self-Check: PASSED

- [x] `roteiro-unificado/src/features/form/HistoryContent.tsx` — criado
- [x] `roteiro-unificado/src/features/form/HistoryPage.tsx` — modificado
- [x] `roteiro-unificado/src/features/form/TabNavigation.tsx` — modificado
- [x] `roteiro-unificado/src/features/form/FormLayout.tsx` — modificado
- [x] Commit 0546bf3 — Task 1
- [x] Commit 5c2a5c9 — Task 2
- [x] Commit 50be216 — Task 3
