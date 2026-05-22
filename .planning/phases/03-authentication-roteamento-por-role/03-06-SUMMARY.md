---
phase: 03-authentication-roteamento-por-role
plan: "06"
subsystem: auth
tags: [react-router-dom, auth-redirect, role-based-routing, app-wiring, authprovider]

dependency_graph:
  requires:
    - roteiro-unificado/src/features/auth/AuthProvider.tsx
    - roteiro-unificado/src/features/auth/useAuth.ts
    - roteiro-unificado/src/router.tsx
    - roteiro-unificado/src/pages/Login.tsx
  provides:
    - roteiro-unificado/src/App.tsx (RouterProvider — sistema de rotas conectado)
    - roteiro-unificado/src/main.tsx (AuthProvider — auth context disponivel em toda a arvore)
    - roteiro-unificado/src/pages/Login.tsx (redirect pos-login por role; guard de sessao existente)
  affects:
    - Phase 4 — Admin Dashboard (recebe auth context e rotas protegidas prontas)
    - Phase 5 — Formulario (recebe redirect /form/:orgId funcional)

tech-stack:
  added: []
  patterns:
    - "useEffect observando session+role+orgId para redirect pos-login assincrono — cobre tanto mount (usuario ja autenticado) quanto pos-signIn (onAuthStateChange)"
    - "navigate com replace:true em todos os redirects de auth — /login nao fica no historico (T-03-16)"
    - "AuthProvider como filho de QueryClientProvider e pai de App — Toaster fora do AuthProvider (global, nao precisa de auth context)"

key-files:
  created: []
  modified:
    - roteiro-unificado/src/App.tsx
    - roteiro-unificado/src/main.tsx
    - roteiro-unificado/src/pages/Login.tsx

key-decisions:
  - "useEffect observando [session, role, orgId, isLoading] para redirect — resolve o problema de timing do onAuthStateChange assincrono sem setTimeout"
  - "Toaster permanece fora de AuthProvider (irmao, nao filho) — componente global de notificacao nao depende de auth context"
  - "Edge case de org_members incompleto exibe toast.error generico sem logout — usuario autenticado mas sem role/orgId configurados nao e silenciosamente ignorado"

patterns-established:
  - "Redirect de auth sempre com replace:true — /login nao fica no historico apos autenticacao"
  - "guard de already-authenticated no Login.tsx via useEffect — previne flash do formulario para usuarios ja logados"

requirements-completed: [AUTH-01, AUTH-02, AUTH-04, AUTH-05]

duration: 8min
completed: "2026-05-22"
---

# Phase 3 Plan 6: Fechamento da Fase — App.tsx, main.tsx e Login.tsx Summary

**RouterProvider conectado em App.tsx, AuthProvider injetado em main.tsx, e redirect pos-login por role implementado em Login.tsx — fluxo de autenticacao end-to-end operacional.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-05-22T17:06:00Z
- **Completed:** 2026-05-22T17:14:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- App.tsx substituiu `<DesignSystem />` por `<RouterProvider router={router} />` — sistema de rotas da fase 3 conectado
- main.tsx adicionou `<AuthProvider>` entre `QueryClientProvider` e `<App />` — auth context disponivel em toda a arvore de componentes
- Login.tsx implementou redirect pos-login por role via `useEffect` observando `session + role + orgId` — cobre tanto acesso com sessao ja existente quanto o callback assincrono do `onAuthStateChange`
- Usuarios ja autenticados acessando `/login` sao redirecionados imediatamente sem exibir o formulario (prevent flash)
- `npx tsc --noEmit` passa sem erros; `npm run build` conclui sem erros TypeScript

## Task Commits

1. **Tarefa 1: Atualizar App.tsx e main.tsx com RouterProvider e AuthProvider** - `8554def` (feat)
2. **Tarefa 2: Implementar roteamento pos-login por role em Login.tsx** - `a594037` (feat)

## Files Created/Modified

- `roteiro-unificado/src/App.tsx` — Substituiu corpo do componente: `<DesignSystem />` removido, `<RouterProvider router={router} />` adicionado; imports limpos
- `roteiro-unificado/src/main.tsx` — AuthProvider adicionado como wrapper de App; Toaster permanece irmao (fora do AuthProvider)
- `roteiro-unificado/src/pages/Login.tsx` — useNavigate e useEffect adicionados; logica de redirect por role implementada; guard de sessao existente no mount

## Decisions Made

- **Estrategia de redirect assincrono:** `useEffect` observando `[session, role, orgId, isLoading]` em vez de callback direto no `onSubmit` — o `onAuthStateChange` do Supabase dispara de forma assincrona; aguardar o estado do context resolver via `useEffect` e mais confiavel do que tentar ler `role` imediatamente apos `signInWithPassword`
- **Toaster fora do AuthProvider:** o `<Toaster />` e um componente global de notificacao sem dependencia de auth context — mante-lo como irmao de `AuthProvider` (filho de `QueryClientProvider`) e a posicao correta e evita aninhamento desnecessario
- **Edge case org_members incompleto:** usuario autenticado com `role !== null` mas sem `orgId` exibe `toast.error` — comportamento explicito em vez de redirecionar para rota invalida ou falhar silenciosamente

## Deviations from Plan

Nenhuma — plano executado exatamente como especificado.

## Issues Encountered

Nenhum. O pre-commit hook (prettier + eslint) normalizou formatacao automaticamente em todos os tres arquivos — comportamento esperado, sem impacto funcional.

## Acceptance Criteria Verification

| Criterio | Resultado |
|----------|-----------|
| `grep -c "RouterProvider" App.tsx` >= 1 | PASS (2) |
| `grep -c "AuthProvider" main.tsx` >= 1 | PASS (3) |
| `grep -c 'navigate.*admin/dashboard' Login.tsx` >= 1 | PASS (1) |
| `grep -c 'navigate.*form/' Login.tsx` >= 1 | PASS (1) |
| `npx tsc --noEmit` sem erros | PASS (0 erros) |
| App.tsx NAO contem DesignSystem | PASS |
| main.tsx contem exatamente UM Toaster | PASS |
| useEffect guard de already-authenticated em Login.tsx | PASS |
| navigate com replace:true em todos os redirects | PASS |

## Threat Surface Scan

| Mitigacao | Arquivo | Status |
|-----------|---------|--------|
| T-03-15 — Redirect usa role do AuthContext (server-side via org_members), nao parametro cliente | Login.tsx | Implementada: `role` vem de `useAuth()` que le do Supabase `onAuthStateChange` |
| T-03-16 — navigate com replace:true elimina /login do historico apos redirect | Login.tsx | Implementada: todos os `navigate` usam `{ replace: true }` |
| T-03-17 — Paths de admin visiveis no bundle client-side | router.tsx | Accepted: protecao real esta no AdminRoute + RLS do Supabase |

## Known Stubs

Nenhum neste plano. Os stubs existentes (rotas `/form/:orgId` e `/admin/dashboard`) foram introduzidos no plano 03-05 e documentados no 03-05-SUMMARY.md — permanecem intencionais ate as fases 4 e 5.

## Next Phase Readiness

- [x] Auth end-to-end operacional: login → redirect por role → rotas protegidas → logout
- [x] `AuthProvider` disponivel globalmente para qualquer componente via `useAuth()`
- [x] `ProtectedRoute` e `AdminRoute` guardam rotas privadas
- [x] `router` configurado com todas as rotas da fase 3 mais placeholders para fases 4 e 5
- [x] Phase 3 completa — UAT pode ser executado
- [ ] Phase 4 (Admin Dashboard): substituir placeholder `<div>Admin Dashboard — Phase 4</div>` em `/admin/dashboard`
- [ ] Phase 5 (Formulario): substituir placeholder `<div>Form Page — Phase 5</div>` em `/form/:orgId`

---
*Phase: 03-authentication-roteamento-por-role*
*Completed: 2026-05-22*

## Self-Check: PASSED

- `roteiro-unificado/src/App.tsx` — FOUND
- `roteiro-unificado/src/main.tsx` — FOUND
- `roteiro-unificado/src/pages/Login.tsx` — FOUND
- Commit `8554def` — FOUND
- Commit `a594037` — FOUND
