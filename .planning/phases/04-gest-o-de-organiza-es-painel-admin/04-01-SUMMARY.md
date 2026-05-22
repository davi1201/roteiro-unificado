---
phase: 04-gest-o-de-organiza-es-painel-admin
plan: 01
subsystem: ui
tags: [react, tailwind, react-router, dialog, admin-layout, aria]

# Dependency graph
requires:
  - phase: 03-authentication-roteamento-por-role
    provides: AdminRoute guard com Outlet, useAuth hook (user.email + signOut), router.tsx com estrutura de rotas admin
provides:
  - Dialog primitive nativo (sem Radix UI) com 6 sub-componentes, focus trap e scroll lock
  - AdminLayout shell com sidebar fixa 240px e header fixo 56px
  - AdminSidebar com 3 itens de navegação (Organizações ativo, Dashboard e Exportações desabilitados)
  - AdminHeader com email do admin e botão Encerrar sessão
  - Stubs AdminDashboard e OrgDetail para Plans 02 e 04
  - router.tsx atualizado com AdminLayout como wrapper das rotas admin
affects: [04-02, 04-03, 04-04, 04-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dialog nativo com role=dialog + aria-modal + useEffect keydown + body scroll lock (sem dependência externa)"
    - "AdminLayout como wrapper React Router via Outlet — layouts aninhados com fixed sidebar + fixed header"
    - "NavLink com className callback isActive para estilo ativo/inativo na sidebar"
    - "aria-disabled='true' em <span> para links desabilitados (sem <a> inválido)"

key-files:
  created:
    - roteiro-unificado/src/components/ui/dialog.tsx
    - roteiro-unificado/src/components/layouts/AdminLayout.tsx
    - roteiro-unificado/src/components/layouts/AdminSidebar.tsx
    - roteiro-unificado/src/components/layouts/AdminHeader.tsx
    - roteiro-unificado/src/pages/admin/AdminDashboard.tsx
    - roteiro-unificado/src/pages/admin/OrgDetail.tsx
  modified:
    - roteiro-unificado/src/components/ui/index.ts
    - roteiro-unificado/src/router.tsx

key-decisions:
  - "Dialog implementado sem @radix-ui/react-dialog — DOM nativa com role/aria + focus trap manual via useEffect (pacote ausente do package.json, PLAN.md proibiu instalação)"
  - "Symlink de node_modules do repo principal para worktree necessário para type-check e build funcionar no ambiente de execução isolado"
  - "AdminLayout usa fixed positioning para sidebar e header + margin-left/top no main — abordagem mais simples que flex + scroll override"

patterns-established:
  - "Layout admin aninhado: AdminRoute > AdminLayout (elemento sem path) > páginas filhas com paths específicos"
  - "Tokens semânticos obrigatórios: bg-primary, text-primary-100, text-primary-300, text-primary-800 — nunca hex hardcoded"

requirements-completed: [ORG-03]

# Metrics
duration: 4min
completed: 2026-05-22
---

# Phase 04 Plan 01: Admin Shell — Dialog + Layout + Router Summary

**Shell do painel admin com Dialog nativo acessível (6 sub-componentes, focus trap, scroll lock), AdminLayout com sidebar fixa D-06 (3 itens de nav, dois desabilitados), header com logout funcional, e router.tsx atualizado com AdminLayout como wrapper das rotas admin.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-22T18:04:07Z
- **Completed:** 2026-05-22T18:07:35Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- Componente Dialog nativo com `role="dialog"`, `aria-modal="true"`, Escape key handler, body scroll lock e focus trap — sem dependência de @radix-ui
- AdminLayout shell com sidebar fixa 240px (bg-primary, z-30) e header fixo 56px (bg-primary, z-20) usando tokens semânticos
- router.tsx atualizado: placeholders "Phase 4" removidos, AdminLayout wrapping AdminDashboard e OrgDetail como filhos aninhados do AdminRoute

## Task Commits

Cada task foi commitada atomicamente:

1. **Task 1: Criar componente Dialog nativo** - `89a9dab` (feat)
2. **Task 2: Criar AdminSidebar + AdminHeader + AdminLayout** - `a6d3b53` (feat)
3. **Task 3: Criar stubs admin + atualizar router.tsx** - `900197c` (feat)

## Files Created/Modified

- `roteiro-unificado/src/components/ui/dialog.tsx` — Dialog primitive com 6 funções exportadas: Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter
- `roteiro-unificado/src/components/ui/index.ts` — barrel export atualizado com Dialog e sub-componentes
- `roteiro-unificado/src/components/layouts/AdminSidebar.tsx` — sidebar fixa com 3 nav items (NavLink ativo + 2 aria-disabled com badge "Em breve")
- `roteiro-unificado/src/components/layouts/AdminHeader.tsx` — header com email do admin e botão "Encerrar sessão" chamando signOut() + navigate('/login', {replace:true})
- `roteiro-unificado/src/components/layouts/AdminLayout.tsx` — wrapper com AdminSidebar + AdminHeader + main com Outlet
- `roteiro-unificado/src/pages/admin/AdminDashboard.tsx` — stub para Plan 02
- `roteiro-unificado/src/pages/admin/OrgDetail.tsx` — stub para Plan 04 com useParams<{orgId}>
- `roteiro-unificado/src/router.tsx` — importa e usa AdminLayout, AdminDashboard, OrgDetail; placeholders removidos

## Decisions Made

- **Dialog sem Radix UI:** @radix-ui/react-dialog está ausente do package.json e o PLAN.md proibiu explicitamente a instalação. Implementado com DOM nativa + useEffect para keydown/scroll lock + useRef para focus trap.
- **Symlink node_modules no worktree:** O worktree não tinha node_modules próprios. Criado symlink para `../../../roteiro-unificado/node_modules` para type-check e build funcionarem sem instalar dependências.
- **Fixed positioning para layout:** AdminLayout usa `fixed` para sidebar (top-0 left-0 bottom-0 w-60 z-30) e header (top-0 left-60 right-0 h-14 z-20), com `ml-60 mt-14` no main — mais simples e previsível que flexbox com overflow.

## Deviations from Plan

Nenhuma — plano executado exatamente como especificado. A decisão de criar o symlink de node_modules foi um requisito operacional do ambiente de worktree isolado, não uma mudança de escopo do código.

## Known Stubs

| Arquivo | Linha | Conteúdo | Plano que resolverá |
|---------|-------|----------|---------------------|
| `src/pages/admin/AdminDashboard.tsx` | 5 | "Listagem será implementada no plano 02." | Plan 04-02 |
| `src/pages/admin/OrgDetail.tsx` | 5 | "orgId: {orgId}" | Plan 04-04 |

Estes stubs são intencionais — esta tarefa entrega apenas o shell de UI. Os planos 02 e 04 implementarão o CRUD real.

## Issues Encountered

Nenhum problema além do symlink de node_modules descrito acima.

## Next Phase Readiness

- Plan 02 (04-02): Listagem de orgs pode ser implementada dentro do AdminDashboard usando AdminLayout como wrapper — pronto.
- Plan 03 (04-03): Modal de criação de org pode usar o Dialog primitive criado aqui — pronto.
- Plan 04 (04-04): Página de detalhe (OrgDetail) tem o stub criado e usa useParams para receber orgId — pronto.
- Plan 05 (04-05): Edge Function de criação de usuário é independente do shell — pode iniciar em paralelo.
- Build production passa sem erros (vite build + TypeScript type-check clean).

---
*Phase: 04-gest-o-de-organiza-es-painel-admin*
*Completed: 2026-05-22*
