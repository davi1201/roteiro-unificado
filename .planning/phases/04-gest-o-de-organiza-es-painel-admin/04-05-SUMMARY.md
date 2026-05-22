---
phase: 04-gest-o-de-organiza-es-painel-admin
plan: 05
subsystem: ui
tags: [admin, orgs, archive, mutation, dialog, tanstack-query]

# Dependency graph
requires:
  - phase: 04-gest-o-de-organiza-es-painel-admin
    plan: 01
    provides: Dialog primitive com 6 sub-componentes, AdminLayout, Button variante danger
  - phase: 04-gest-o-de-organiza-es-painel-admin
    plan: 02
    provides: useOrgs hook (queryKey ['orgs']), AdminDashboard com OrgTable
  - phase: 04-gest-o-de-organiza-es-painel-admin
    plan: 03
    provides: CreateOrgModal, handleArchive placeholder em AdminDashboard
  - phase: 04-gest-o-de-organiza-es-painel-admin
    plan: 04
    provides: useOrgDetail hook (queryKey ['orgs', orgId]), OrgDetail com stub do botão Arquivar
provides:
  - useArchiveOrg hook reutilizável (useMutation UPDATE active=false, invalida ['orgs'] + ['orgs', orgId])
  - ArchiveOrgDialog componente de confirmação (Dialog nativo com botões danger/secondary)
  - AdminDashboard wirificado — handleArchive abre ArchiveOrgDialog com archiveTarget state
  - OrgDetail wirificado — botão Arquivar danger no header, disabled quando !org.active
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useMutation com onSuccess(_data, variables) — segundo arg é o orgId passado para mutate()"
    - "mutate(orgId, { onSuccess: () => onClose() }) — callback local no mutate() para fechar dialog apenas após mutation completar"
    - "Invalidação dupla de queryKey ['orgs'] e ['orgs', orgId] para atualizar listagem e detalhe simultaneamente"
    - "Estado archiveTarget tipado como { id: string; name: string } | null — estado null = dialog fechado"
    - "cast as never em update({ active: false }) — mesmo padrão estabelecido em Plans 02/03 para schema manual"

key-files:
  created:
    - roteiro-unificado/src/features/admin/useArchiveOrg.ts
    - roteiro-unificado/src/components/admin/ArchiveOrgDialog.tsx
  modified:
    - roteiro-unificado/src/pages/admin/AdminDashboard.tsx
    - roteiro-unificado/src/pages/admin/OrgDetail.tsx

key-decisions:
  - "cast as never em supabase.from('orgs').update(): mesmo padrão do Plan 02 — schema manual não infere tipo Update corretamente"
  - "onClose() chamado via callback onSuccess do mutate() (não no onSuccess do useMutation): garante que o dialog só fecha após confirmação do servidor, não imediatamente"

requirements-completed: [ORG-03]

# Metrics
duration: 5min
completed: 2026-05-22
---

# Phase 04 Plan 05: Fluxo de Arquivamento de Organização — Summary

**Hook useArchiveOrg (useMutation UPDATE active=false com dupla invalidação), componente ArchiveOrgDialog (dialog de confirmação com copy pt-br, botão danger), AdminDashboard e OrgDetail wirificados para abrir o dialog com estado correto.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-05-22T18:31:00Z
- **Completed:** 2026-05-22T18:36:20Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Hook `useArchiveOrg` em `src/features/admin/useArchiveOrg.ts` — `useMutation` com `mutationFn` que chama `supabase.from('orgs').update({ active: false }).eq('id', orgId)`, `onSuccess` invalida `['orgs']` e `['orgs', orgId]`, toasts em pt-br
- Componente `ArchiveOrgDialog` em `src/components/admin/ArchiveOrgDialog.tsx` — Dialog com título "Arquivar organização", corpo com nome da org em `<strong>`, botão danger "Sim, arquivar" (loading: "Arquivando...") e botão secondary "Manter organização"; retorna null quando orgId/orgName são nulos
- `AdminDashboard` atualizado: import `ArchiveOrgDialog`, estado `archiveTarget`, `handleArchive` substituído (remove placeholder `toast.info('Funcionalidade disponível em breve')`), dialog renderizado com `open={archiveTarget !== null}`
- `OrgDetail` atualizado: import `ArchiveOrgDialog`, estado `isArchiveOpen`, botão `variant="danger"` no header com `disabled={!org.active}` e texto condicional "Arquivar"/"Arquivada", dialog renderizado
- `npm run build` — PASS (321 kB JS, 18 kB CSS)
- `npm run lint` — PASS (0 errors, 1 pre-existing warning em button.tsx)
- `npm run type-check` — PASS (exit 0)

## Task Commits

1. **Task 1: Criar hook useArchiveOrg** — `8dd6eff` (feat)
2. **Task 2: Criar ArchiveOrgDialog** — `a25c515` (feat)
3. **Task 3: Wire ArchiveOrgDialog ao AdminDashboard + OrgDetail** — `c56abb5` (feat)

## Files Created/Modified

- `roteiro-unificado/src/features/admin/useArchiveOrg.ts` — hook reutilizável, useMutation, UPDATE active=false, invalidateQueries duplo, toasts pt-br
- `roteiro-unificado/src/components/admin/ArchiveOrgDialog.tsx` — dialog de confirmação, props open/orgId/orgName/onClose, early return quando null, botão danger com isLoading
- `roteiro-unificado/src/pages/admin/AdminDashboard.tsx` — archiveTarget state, handleArchive atualizado, ArchiveOrgDialog renderizado
- `roteiro-unificado/src/pages/admin/OrgDetail.tsx` — isArchiveOpen state, botão Arquivar danger no header, ArchiveOrgDialog renderizado

## Decisions Made

- **cast as never em .update():** O schema `database.ts` manual não infere corretamente o tipo `Update` de `orgs` com supabase-js v2.106.1 — `update({ active: false })` gera erro de tipo. Mesmo padrão de cast estabelecido nos Plans 02 e 03 (`as never`). Removível quando tipos forem gerados via `supabase gen types`.
- **onClose() no callback local do mutate():** `archiveOrgMutation.mutate(orgId, { onSuccess: () => onClose() })` — o dialog fecha apenas após a mutation completar com sucesso no servidor. Se o toast global do `useArchiveOrg.onSuccess` disparar e então o dialog fechar, o usuário tem confirmação visual da ação antes do dismiss. Alternativa (fechar imediatamente) foi descartada por UX.

## Deviations from Plan

Nenhuma — plano executado exatamente como escrito. O cast `as never` em `.update()` é uma extensão do padrão já estabelecido nos Plans 02/03 e estava implícito pelo contexto de `interfaces` do plano.

## Known Stubs

Nenhum — todos os stubs documentados nos plans anteriores foram resolvidos neste plano:
- `AdminDashboard.handleArchive` placeholder (`toast.info('Funcionalidade disponível em breve')`) — removido e substituído
- `OrgDetail` comentário "Botão Arquivar será wired no Plan 05" — removido e substituído pelo botão real

## Threat Flags

Nenhuma superfície nova além das modeladas no `<threat_model>` do PLAN.md. Mitigações implementadas:
- T-04-27 (admin arquiva sem confirmação): ArchiveOrgDialog requer confirmação explícita "Sim, arquivar"
- T-04-31 (construtora tenta arquivar via DevTools): RLS `is_admin()` bloqueia UPDATE — mitigação de backend fora do escopo desta fase, já implementada em Phase 2

## Self-Check

Arquivos criados/modificados:
- `roteiro-unificado/src/features/admin/useArchiveOrg.ts` — FOUND
- `roteiro-unificado/src/components/admin/ArchiveOrgDialog.tsx` — FOUND
- `roteiro-unificado/src/pages/admin/AdminDashboard.tsx` — FOUND (modificado)
- `roteiro-unificado/src/pages/admin/OrgDetail.tsx` — FOUND (modificado)

Commits:
- `8dd6eff` — FOUND (feat Task 1 useArchiveOrg)
- `a25c515` — FOUND (feat Task 2 ArchiveOrgDialog)
- `c56abb5` — FOUND (feat Task 3 wiring)

Build: `npm run build` — PASS (321 kB JS, sem erros)
Type-check: `npm run type-check` — PASS (exit 0)
Lint: `npm run lint` — PASS (0 errors)

## Self-Check: PASSED

---
*Phase: 04-gest-o-de-organiza-es-painel-admin*
*Completed: 2026-05-22*
