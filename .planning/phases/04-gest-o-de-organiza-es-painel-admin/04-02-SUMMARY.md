---
phase: 04-gest-o-de-organiza-es-painel-admin
plan: 02
subsystem: ui
tags: [admin, orgs, table, react-query, tanstack-query]

# Dependency graph
requires:
  - phase: 04-gest-o-de-organiza-es-painel-admin
    plan: 01
    provides: AdminLayout shell, AdminDashboard stub, Dialog primitive, router.tsx atualizado
provides:
  - useOrgs() hook com TanStack Query (queryKey ['orgs']) + count agregado de membros
  - OrgTable componente apresentacional com 6 colunas, loading/empty/data states
  - AdminDashboard populado com header + botão Nova Organização accent + tabela + paginação
affects: [04-03, 04-04, 04-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useQuery com select PostgREST relação inversa: org_members(count) + cast explícito como unknown para compatibilidade de tipos"
    - "Componente apresentacional puro: OrgTable sem fetch/mutation — props-only"
    - "Paginação client-side com useState(page) + useMemo para slice"
    - "useEffect para toast.error() quando isError muda — padrão de error boundary leve"
    - "bg-accent reservado para único CTA primário da listagem (Nova Organização)"

key-files:
  created:
    - roteiro-unificado/src/features/admin/useOrgs.ts
    - roteiro-unificado/src/components/admin/OrgTable.tsx
  modified:
    - roteiro-unificado/src/pages/admin/AdminDashboard.tsx

key-decisions:
  - "OrgWithMemberCount usa cast `as unknown as OrgRow[]` para contornar limitação do schema manual — tipos gerados pelo supabase-cli resolveriam isso automaticamente em fase futura"
  - "Empty state sem CTA duplicado no OrgTable — botão Nova Organização já existe no header da página (per UI-SPEC §Estados vazios)"
  - "formatCnpj como função local em OrgTable — não extraída para utils por ser específica deste contexto"

# Metrics
duration: 3min
completed: 2026-05-22
---

# Phase 04 Plan 02: Listagem de Organizações no AdminDashboard — Summary

**Hook useOrgs com TanStack Query (queryKey ['orgs']), componente OrgTable apresentacional com 6 colunas e estados de loading/empty/data, e AdminDashboard populado com botão Nova Organização accent, tabela paginada client-side e toast de erro.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-05-22T18:10:05Z
- **Completed:** 2026-05-22T18:13:10Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Hook `useOrgs()` exporta `OrgWithMemberCount[]` buscando orgs + count de membros via PostgREST `org_members(count)`; queryKey `['orgs']` canônica para invalidação nos Plans 03 e 05
- `OrgTable` apresentacional com 6 headers (Nome, CNPJ, Membros, Criado em, Status, Ações), badges Ativa/Arquivada, loading state com 3 linhas Skeleton, empty state sem CTA duplicado, e `e.stopPropagation()` na célula Ações
- `AdminDashboard` reescrito: stub removido, integra `useOrgs()` e `OrgTable`, botão "Nova Organização" com `bg-accent` (cor laranja reservada), paginação client-side `useState(page)`, `useEffect` para toast.error quando isError
- Build production `npm run build` passa sem erros (321 kB JS, 18 kB CSS)

## Task Commits

1. **Task 1: Criar hook useOrgs com TanStack Query** - `80c72c3` (feat)
2. **Task 2: Criar componente OrgTable apresentacional** - `9c45fc1` (feat)
3. **Task 3: Popular AdminDashboard** - `3ac14e4` (feat)

## Files Created/Modified

- `roteiro-unificado/src/features/admin/useOrgs.ts` — hook tipado, queryKey `['orgs']`, SELECT com `org_members(count)`, normalização de shape com OrgRow type local
- `roteiro-unificado/src/components/admin/OrgTable.tsx` — componente puro com tabela 6 colunas, formatCnpj helper, loading Skeleton, empty state, navigate on row click, stopPropagation em Ações
- `roteiro-unificado/src/pages/admin/AdminDashboard.tsx` — página completa substituindo stub: header + CTA accent + OrgTable + paginação client-side + error toast

## Decisions Made

- **Cast explícito para OrgRow:** O schema `database.ts` não tem a relação `org_members` tipada na row de `orgs` (foi escrito manualmente). Para usar `org_members(count)` na query PostgREST sem erros TS2339, o retorno é casted `as unknown as OrgRow[]` com tipo local. Quando o schema for gerado via `supabase gen types`, o cast pode ser removido.
- **Empty state sem CTA no OrgTable:** Per UI-SPEC §Estados vazios, o botão "Nova Organização" já está no header da página — duplicar seria confuso. OrgTable mostra apenas heading + body no empty state.
- **Handlers placeholder:** `handleNewOrg` e `handleArchive` chamam `toast.info('Funcionalidade disponível em breve')` — Plans 03 e 05 substituirão esses handlers por implementações reais (modal de criação e dialog de confirmação respectivamente).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Erro de tipo TS2339 em useOrgs.ts**
- **Encontrado durante:** Task 1 — verificação type-check
- **Problema:** O schema manual `database.ts` não declara `org_members` como relação na row de `orgs`. A query `.select('...org_members(count)')` retornava tipo `never` para as propriedades do resultado.
- **Correção:** Adicionado tipo local `OrgRow` com shape explícito de PostgREST e cast `as unknown as OrgRow[]` na normalização.
- **Arquivos modificados:** `src/features/admin/useOrgs.ts`
- **Commit:** `80c72c3`

**2. [Operacional] Symlink node_modules ausente no worktree**
- **Encontrado durante:** Task 1 — tentativa de type-check
- **Problema:** O worktree não tinha `node_modules/` (apenas o repo principal tem). O `tsc` não era encontrado.
- **Correção:** Criado symlink `roteiro-unificado/node_modules -> ../../../../roteiro-unificado/node_modules` (mesmo procedimento do Plan 01).
- **Arquivos modificados:** nenhum (symlink de ambiente)
- **Commit:** não commitado (symlink não é rastreado pelo git)

## Known Stubs

| Arquivo | Função | Conteúdo | Plano que resolverá |
|---------|--------|----------|---------------------|
| `src/pages/admin/AdminDashboard.tsx` | `handleNewOrg` | `toast.info('Funcionalidade disponível em breve')` | Plan 04-03 |
| `src/pages/admin/AdminDashboard.tsx` | `handleArchive` | `toast.info('Funcionalidade disponível em breve')` | Plan 04-05 |

Estes stubs são intencionais — os Plans 03 e 05 editarão `AdminDashboard.tsx` substituindo esses handlers por modal de criação e dialog de confirmação respectivamente. O objetivo deste plano (listagem funcional) é alcançado.

## Threat Flags

Nenhuma superfície nova além das modeladas no `<threat_model>` do PLAN.md.

## Self-Check

Arquivos criados:
- `roteiro-unificado/src/features/admin/useOrgs.ts` — FOUND
- `roteiro-unificado/src/components/admin/OrgTable.tsx` — FOUND
- `roteiro-unificado/src/pages/admin/AdminDashboard.tsx` — FOUND (reescrito)

Commits:
- `80c72c3` — FOUND (feat useOrgs)
- `9c45fc1` — FOUND (feat OrgTable)
- `3ac14e4` — FOUND (feat AdminDashboard)

Build: `npm run build` — PASS (saída: ✓ built in 299ms)

## Self-Check: PASSED

---
*Phase: 04-gest-o-de-organiza-es-painel-admin*
*Completed: 2026-05-22*
