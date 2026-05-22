---
phase: 03-authentication-roteamento-por-role
plan: "05"
subsystem: routing
tags: [routing, react-router-dom, protected-route, admin-route, auth-guards]
dependency_graph:
  requires:
    - roteiro-unificado/src/features/auth/useAuth.ts
    - roteiro-unificado/src/features/auth/AuthProvider.tsx
    - roteiro-unificado/src/pages/Login.tsx
    - roteiro-unificado/src/pages/ForgotPassword.tsx
    - roteiro-unificado/src/pages/ResetPassword.tsx
    - roteiro-unificado/src/components/ui/spinner.tsx
  provides:
    - roteiro-unificado/src/components/routing/ProtectedRoute.tsx
    - roteiro-unificado/src/components/routing/AdminRoute.tsx
    - roteiro-unificado/src/router.tsx
  affects:
    - roteiro-unificado/src/App.tsx (plano 03-06 substitui DesignSystem por RouterProvider)
tech_stack:
  added: []
  patterns:
    - React Router v6 layout routes com Outlet para guards de autenticação
    - createBrowserRouter com array de objetos — configuração declarativa sem JSX wrapper
    - Guards de três estados (isLoading → spinner, sem sessão → redirect, autenticado → Outlet)
    - AdminRoute com quatro estados (isLoading, sem sessão, role errada, role admin)
key_files:
  created:
    - roteiro-unificado/src/components/routing/ProtectedRoute.tsx
    - roteiro-unificado/src/components/routing/AdminRoute.tsx
    - roteiro-unificado/src/router.tsx
  modified: []
decisions:
  - "Guards usam Outlet (layout route) em vez de children prop — padrão React Router v6 para aninhamento de rotas"
  - "AdminRoute verifica role !== 'admin' explicitamente — qualquer valor além de 'admin' resulta em redirect (inclui 'company' e null)"
  - "Placeholders inline (<div>...</div>) para rotas de fases futuras — evita imports de páginas inexistentes"
  - "Navigate replace em todos os redirects — elimina a rota protegida do histórico do browser (T-03-13)"
metrics:
  duration_seconds: 181
  completed_date: "2026-05-22"
  tasks_completed: 2
  files_created: 3
  files_modified: 0
---

# Phase 3 Plan 5: ProtectedRoute, AdminRoute e React Router v6 Summary

**One-liner:** Guards de rota tipados com três/quatro estados (isLoading spinner, sem sessão, role errada, autenticado) e router completo com createBrowserRouter cobrindo todas as rotas da fase.

## O que foi construído

Criado o diretório `src/components/routing/` com dois guards de autenticação e o arquivo `src/router.tsx` com a configuração completa do React Router v6 para a aplicação.

### ProtectedRoute.tsx

- Importa `Navigate` e `Outlet` de `react-router-dom`, `useAuth` de `@/features/auth/useAuth`, `Spinner` de `@/components/ui`
- **Estado isLoading:** Exibe spinner full-screen com fundo `bg-primary` e `Spinner size="lg"` branco — previne flash de redirect para usuários já autenticados (D-08, T-03-14)
- **Estado sem sessão:** `<Navigate to="/login" replace />` — `replace` elimina a rota protegida do histórico (T-03-13)
- **Estado autenticado:** `<Outlet />` — renderiza o componente filho da rota aninhada

### AdminRoute.tsx

- Mesmos imports que ProtectedRoute mais `role` extraído do `useAuth()`
- **Estado isLoading:** Mesmo spinner full-screen (T-03-14)
- **Estado sem sessão:** `<Navigate to="/login" replace />`
- **Estado role errada:** `<Navigate to="/login" replace />` quando `role !== 'admin'` — bloqueia construtoras tentando acessar /admin/* (T-03-12)
- **Estado admin:** `<Outlet />`

### router.tsx

Configuração com `createBrowserRouter` (não `createHashRouter`):

| Rota | Guard | Componente |
|------|-------|------------|
| `/` | — | `<Navigate to="/login" replace />` |
| `/login` | pública | `<Login />` |
| `/forgot-password` | pública | `<ForgotPassword />` |
| `/reset-password` | pública | `<ResetPassword />` |
| `/form/:orgId` | ProtectedRoute | placeholder Phase 5 |
| `/admin/dashboard` | AdminRoute | placeholder Phase 4 |
| `/admin/orgs/:orgId` | AdminRoute | placeholder Phase 4 |

## Acceptance Criteria

| Critério | Resultado |
|----------|-----------|
| `grep -c 'Navigate to="/login" replace' ProtectedRoute.tsx` ≥ 1 | PASS (1) |
| `grep -c 'Outlet' ProtectedRoute.tsx` ≥ 1 | PASS (2) |
| `grep -c 'bg-primary' ProtectedRoute.tsx` ≥ 1 | PASS (1) |
| `grep -c "role !== 'admin'" AdminRoute.tsx` ≥ 1 | PASS (1) |
| `grep -c 'Navigate to="/login" replace' AdminRoute.tsx` ≥ 2 | PASS (2) |
| `grep -c 'createBrowserRouter' router.tsx` ≥ 1 | PASS (2) |
| `grep -c "path: '/login'" router.tsx` ≥ 1 | PASS (1) |
| `grep -c "path: '/forgot-password'" router.tsx` ≥ 1 | PASS (1) |
| `grep -c "path: '/reset-password'" router.tsx` ≥ 1 | PASS (1) |
| `grep -c '/form/:orgId' router.tsx` ≥ 1 | PASS (1) |
| `grep -c '/admin/dashboard' router.tsx` ≥ 1 | PASS (1) |
| `grep -c 'export const router' router.tsx` ≥ 1 | PASS (1) |
| `npx tsc --noEmit` sem erros | PASS |

## Deviations from Plan

### Auto-fixed Issues

Nenhuma — plano executado exatamente como especificado.

### Formatação Automática (não é desvio)

O pre-commit hook (prettier + eslint) reordenou classes Tailwind de `min-h-screen bg-primary flex` para `bg-primary flex min-h-screen` — ordenação canônica do Tailwind. Comportamento visual idêntico.

## Known Stubs

- `/form/:orgId` → `<div>Form Page — Phase 5</div>` — placeholder intencional; será implementado na Fase 5
- `/admin/dashboard` → `<div>Admin Dashboard — Phase 4</div>` — placeholder intencional; será implementado na Fase 4
- `/admin/orgs/:orgId` → `<div>Org Detail — Phase 4</div>` — placeholder intencional; será implementado na Fase 4

Estes stubs são intencionais e documentados no plano. O objetivo deste plano é estabelecer a estrutura de roteamento e os guards — o conteúdo das rotas será conectado em fases futuras.

## Threat Surface Scan

| Mitigação | Arquivo | Status |
|-----------|---------|--------|
| T-03-12 — Elevation of Privilege: AdminRoute role check | AdminRoute.tsx | Implementada: `role !== 'admin'` cobre 'company', null e qualquer outro valor |
| T-03-13 — Tampering: Navigate replace elimina URL protegida do histórico | ProtectedRoute.tsx, AdminRoute.tsx | Implementada: todos os redirects usam `replace` |
| T-03-14 — isLoading race condition | ProtectedRoute.tsx, AdminRoute.tsx | Implementada: spinner durante isLoading — nunca redireciona antes do AuthContext resolver |

## Next Phase Readiness

- [x] `ProtectedRoute` pronto para uso como layout route em `App.tsx`
- [x] `AdminRoute` pronto para uso como layout route em `App.tsx`
- [x] `router` exportado e pronto para `<RouterProvider router={router} />` no plano 03-06
- [ ] Plano 03-06: substituir `<DesignSystem />` em `App.tsx` por `<RouterProvider router={router} />` e conectar roteamento pós-login

## Self-Check: PASSED

- `roteiro-unificado/src/components/routing/ProtectedRoute.tsx` — FOUND
- `roteiro-unificado/src/components/routing/AdminRoute.tsx` — FOUND
- `roteiro-unificado/src/router.tsx` — FOUND
- Commit `62248a8` — FOUND
