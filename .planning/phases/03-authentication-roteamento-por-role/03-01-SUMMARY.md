---
phase: 03-authentication-roteamento-por-role
plan: "01"
subsystem: auth
tags: [auth, supabase, context, react-router-dom, react-hook-form, zod]
dependency_graph:
  requires:
    - roteiro-unificado/src/lib/supabase.ts
    - roteiro-unificado/src/types/database.ts
  provides:
    - roteiro-unificado/src/features/auth/AuthProvider.tsx
    - roteiro-unificado/src/features/auth/useAuth.ts
  affects:
    - roteiro-unificado/src/main.tsx (AuthProvider deve envolver App — plano 06)
tech_stack:
  added:
    - react-router-dom@^7.15.1
    - react-hook-form@^7.76.0
    - zod@^4.4.3
    - "@hookform/resolvers@^5.4.0"
  patterns:
    - React Context com tipagem explícita via createContext<AuthContextType | null>(null)
    - Supabase onAuthStateChange para persistência de sessão
    - .single<T>() com tipo genérico explícito para evitar inferência incorreta do PostgREST
key_files:
  created:
    - roteiro-unificado/src/features/auth/AuthProvider.tsx
    - roteiro-unificado/src/features/auth/useAuth.ts
  modified:
    - roteiro-unificado/package.json
    - roteiro-unificado/package-lock.json
decisions:
  - "Tipo genérico .single<{ org_id: string; role: Enums<'member_role'> }>() necessário pois TypeScript não infere corretamente o tipo parcial de select() do PostgREST client"
  - "onAuthStateChange trata null session como SIGNED_OUT independente do event string — cobre casos de expiração de token"
  - "signOut não faz redirect — responsabilidade delegada ao Router (plano 06)"
metrics:
  duration_seconds: 104
  completed_date: "2026-05-22"
  tasks_completed: 2
  files_created: 2
  files_modified: 2
---

# Phase 3 Plan 1: Auth Dependencies & AuthProvider Summary

**One-liner:** AuthContext tipado com Supabase onAuthStateChange, query org_members para role/orgId, e hook useAuth com guard contra uso fora do Provider.

## O que foi construído

Instaladas as 4 dependências de roteamento e formulário no projeto `roteiro-unificado`. Criados `AuthProvider.tsx` e `useAuth.ts` em `src/features/auth/`, formando a fundação de toda a autenticação da fase.

### AuthProvider.tsx

- Exporta `AuthContext` (createContext) e `AuthProvider` component
- Estado gerenciado: `user`, `session`, `role`, `orgId`, `isLoading`
- `isLoading` inicia como `true`; vira `false` após o primeiro evento do `onAuthStateChange`
- `SIGNED_OUT` ou session nula: limpa todos os estados de auth
- `SIGNED_IN` / `INITIAL_SESSION`: busca `org_members` com `.eq('user_id', ...).single<T>()` e popula `role` e `orgId`
- `signOut()`: delega redirect ao Router (plano 06)
- Cleanup da subscription no retorno do useEffect

### useAuth.ts

- Importa `AuthContext` e `AuthContextType` de `./AuthProvider`
- Guard: lança `Error('useAuth deve ser usado dentro de AuthProvider')` se contexto for null
- Retorna contexto tipado sem duplicar a interface

## Acceptance Criteria

| Critério | Resultado |
|----------|-----------|
| `export const AuthContext = createContext` em AuthProvider.tsx | PASS (count=1) |
| `supabase.auth.onAuthStateChange` em AuthProvider.tsx | PASS (count=1) |
| `org_members` em AuthProvider.tsx | PASS (count=1) |
| `isLoading` com valor inicial `true` em AuthProvider.tsx | PASS (count=3 — declaração + uso) |
| `throw new Error` em useAuth.ts | PASS (count=1) |
| `npx tsc --noEmit` sem erros nos arquivos criados | PASS |
| 4 pacotes em package.json dependencies | PASS |
| node_modules verificado via `node -e require(...)` | PASS (OK) |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript type inference do .single() do PostgREST**

- **Found during:** Task 2 — primeira execução do `npx tsc --noEmit`
- **Issue:** `select('org_id, role').single()` retorna tipo inferido como `never` para o campo `role` e `org_id`, causando erros TS2339. O cliente PostgREST do Supabase não infere corretamente subsets de colunas via string literal.
- **Fix:** Adicionado tipo genérico explícito: `.single<{ org_id: string; role: Enums<'member_role'> }>()`
- **Files modified:** `roteiro-unificado/src/features/auth/AuthProvider.tsx`
- **Commit:** 804e8a8

## Verification Results

```
grep -c "onAuthStateChange" → 1 ✓
grep -c "org_members"       → 1 ✓
grep -c "isLoading"         → 3 ✓
grep -c "throw new Error"   → 1 ✓
npx tsc --noEmit            → sem erros ✓
```

## Known Stubs

Nenhum — AuthProvider é infraestrutura; não renderiza UI própria.

## Threat Surface Scan

Nenhuma superfície de segurança nova além do mapeado no threat_model do plano (T-03-01, T-03-02, T-03-03, T-03-SC). A mitigação T-03-01 foi implementada corretamente: `.single()` com erro retorna `null` para role/orgId, sem exposição de dados de outras orgs.

## Next Phase Readiness

- [x] `AuthContext` e `AuthProvider` exportados e prontos para uso
- [x] `useAuth()` com guard funcional
- [x] `react-router-dom`, `react-hook-form`, `zod`, `@hookform/resolvers` disponíveis
- [ ] Plano 02 (Login page) pode avançar imediatamente
- [ ] Plano 06 (React Router + roteamento pós-login) deve envolver `App` em `AuthProvider` no `main.tsx`

## Self-Check: PASSED

- `roteiro-unificado/src/features/auth/AuthProvider.tsx` — FOUND
- `roteiro-unificado/src/features/auth/useAuth.ts` — FOUND
- Commit `804e8a8` — FOUND
