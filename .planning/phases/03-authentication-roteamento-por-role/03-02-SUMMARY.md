---
phase: 03-authentication-roteamento-por-role
plan: "02"
subsystem: auth
tags: [auth, zustand, persist, multi-tenant, react-hook]
dependency_graph:
  requires:
    - roteiro-unificado/src/features/auth/useAuth.ts
    - roteiro-unificado/src/features/auth/AuthProvider.tsx
  provides:
    - roteiro-unificado/src/features/auth/useUser.ts
    - roteiro-unificado/src/stores/formStore.ts (atualizado)
  affects:
    - Todos os componentes que consomem dados do usuário logado (planos futuros)
    - Formulário de avaliação (planos futuros usarão useFormStore(tenantId))
tech_stack:
  added: []
  patterns:
    - "Hook de abstração: useUser() re-expõe useAuth() com semântica explícita de alto nível"
    - "Store factory com memoização: Map<tenantId, StoreApi> para isolar estado por tenant"
    - "Zustand useStore(api) para consumo de StoreApi em componentes React"
key_files:
  created:
    - roteiro-unificado/src/features/auth/useUser.ts
  modified:
    - roteiro-unificado/src/stores/formStore.ts
decisions:
  - "isAdmin derivado inline no return (role === 'admin') para satisfazer grep de aceitação e deixar a lógica explícita"
  - "useFormStore(tenantId) usa useStore(createFormStore(tenantId)) — pattern zustand para consumir StoreApi desacoplado de create()"
  - "Mapa storesByTenant vive em escopo de módulo — singleton por bundle, garantindo uma instância por tenant por sessão"
metrics:
  duration_seconds: 312
  completed_date: "2026-05-22"
  tasks_completed: 2
  files_created: 1
  files_modified: 1
---

# Phase 3 Plan 2: useUser Hook & formStore Tenant Namespace Summary

**One-liner:** Hook useUser() como abstração sobre AuthContext e formStore namespaceado por tenantId via factory createFormStore para eliminar risco de cross-tenant leakage no localStorage.

## O que foi construído

### useUser.ts

Criado `src/features/auth/useUser.ts` — abstração de alto nível sobre `AuthContext`. Todos os componentes da aplicação que precisam de dados do usuário logado devem consumir `useUser()` ao invés de `useAuth()` diretamente.

- Exporta interface `UserProfile: { id: string; email: string | undefined }`
- `profile` é `null` quando não há usuário autenticado; quando autenticado, expõe `id` e `email` do objeto `User` do Supabase
- `isAdmin` é derivado inline como `role === 'admin'` — não pode ser adulterado pelo cliente (role vem do AuthContext que consulta `org_members` via `auth.uid()`)
- `signOut` e `isLoading` são repassados diretamente do `useAuth()` sem reimplementação

### formStore.ts (atualizado)

Substituído o padrão de `create()` inline por uma factory com memoização:

- `createFormStore(tenantId: string)` — cria e memoiza store por tenant usando `Map<string, StoreApi<FormStore>>`
- `useFormStore(tenantId: string)` — hook React que usa `useStore(createFormStore(tenantId))` para consumo em componentes
- Persist key mudou de `'form-progress'` (hardcoded) para `` `form-progress-${tenantId}` `` — garante que dados de avaliação de empresa A não sejam lidos por empresa B no mesmo browser
- Removido comentário de aviso `// ⚠️  FASE 3` e substituído por JSDoc descrevendo a solução implementada
- `FormState`, `FormActions`, `FormStore` e `initialState` permanecem idênticos — sem quebra de contrato

## Acceptance Criteria

| Critério | Resultado |
|----------|-----------|
| `export interface UserProfile` em useUser.ts | PASS (count=1) |
| `isAdmin: role === 'admin'` em useUser.ts | PASS (count=1) |
| `from './useAuth'` em useUser.ts | PASS (count=1) |
| `npx tsc --noEmit` sem erros em useUser.ts | PASS |
| `form-progress-\${tenantId}` em formStore.ts (não comentário) | PASS (count=3) |
| `createFormStore` em formStore.ts | PASS (count=3) |
| `name: 'form-progress'` ausente em formStore.ts | PASS (count=0) |
| `npx tsc --noEmit` sem erros em formStore.ts | PASS |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] node_modules ausentes no worktree**

- **Found during:** Tentativa de commit — pre-commit hook lint-staged falhou com `ENOENT: eslint not found`
- **Issue:** O worktree foi criado sem `node_modules` instalados em `roteiro-unificado/`. O pre-commit hook executa `eslint --fix` via lint-staged, que não encontrou o binário.
- **Fix:** Executado `npm install` dentro de `roteiro-unificado/` no worktree antes de retentar o commit.
- **Files modified:** `roteiro-unificado/node_modules/` (gerado, nao tracked)
- **Commit:** N/A (pre-commit fix, nao commitable)

### Ajustes de Estilo (Prettier)

O pre-commit hook `prettier --write` reformatou `useUser.ts` — mudou a declaracao `profile` de duas linhas para uma linha inline. Sem impacto funcional.

## Threat Surface Scan

Nenhuma superficie de segurança nova alem do mapeado no threat_model do plano (T-03-04, T-03-05).

- **T-03-04** (Information Disclosure — localStorage): mitigado com exito via namespace `form-progress-${tenantId}`. Dados de empresa A nao sao acessiveis por empresa B no mesmo browser.
- **T-03-05** (Tampering — isAdmin): mitigado por design — `isAdmin` e derivado de `role` que vem do AuthContext, que por sua vez consulta `org_members` via `auth.uid()` no servidor Supabase. Nao pode ser adulterado pelo cliente.

## Known Stubs

Nenhum — ambos os artefatos sao infraestrutura; nao renderizam UI propria e nao possuem dados hardcoded.

## Self-Check: PASSED

- `roteiro-unificado/src/features/auth/useUser.ts` — FOUND
- `roteiro-unificado/src/stores/formStore.ts` — FOUND (modificado)
- Commit `2ce9f5a` — FOUND
