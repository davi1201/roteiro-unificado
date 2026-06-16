---
phase: 13
plan: "01"
subsystem: backend-schemas
tags: [tdd, edge-function, zod, deno, wave-1]
dependency_graph:
  requires:
    - 13-00 (stubs RED para Wave 1)
  provides:
    - supabase/functions/reset-user-password/index.ts
    - roteiro-unificado/src/schemas/resetPassword.ts
    - roteiro-unificado/src/schemas/changePassword.ts
  affects:
    - roteiro-unificado/src/components/admin/ResetPasswordModal.tsx (Wave 2)
    - roteiro-unificado/src/features/form/ChangePasswordModal.tsx (Wave 2)
tech_stack:
  added: []
  patterns:
    - Edge Function Deno com service_role seguindo template create-user
    - Schema Zod com .refine() para validação de correspondência de campos
    - TDD RED/GREEN com Vitest para schemas
key_files:
  created:
    - supabase/functions/reset-user-password/index.ts
    - roteiro-unificado/src/schemas/resetPassword.ts
    - roteiro-unificado/src/schemas/changePassword.ts
    - roteiro-unificado/src/schemas/resetPassword.test.ts
    - roteiro-unificado/src/schemas/changePassword.test.ts
  modified: []
decisions:
  - "Edge Function reset-user-password segue exatamente o padrão de create-user substituindo createUser por updateUserById e retornando { success: true }"
  - "resetPasswordSchema com campo único password (min 8 chars) — sem campo email pois admin já sabe qual usuário está redefinindo"
  - "changePasswordSchema com .refine() garante que erro de senhas divergentes aparece no path ['confirmPassword'] para React Hook Form"
  - "Validação UUID via regex na Edge Function previne user_id malformado (T-13-01 mitigado)"
metrics:
  duration: "~3 min"
  completed: "2026-06-16"
  tasks_completed: 1
  files_created: 5
---

# Phase 13 Plan 01: Edge Function e Schemas Zod de Senha Summary

Edge Function Deno com service_role para reset de senha via admin (reset-user-password) e dois schemas Zod (resetPassword e changePassword) com tipos exportados e testes passando.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 (RED) | Testes de schema resetPassword e changePassword | 5f8c33f | resetPassword.test.ts, changePassword.test.ts |
| 1 (GREEN) | Edge Function reset-user-password e schemas Zod | f63fabb | reset-user-password/index.ts, resetPassword.ts, changePassword.ts |

## Resultado dos Testes

| Arquivo | Suite | Testes | Status |
|---------|-------|--------|--------|
| `resetPassword.test.ts` | describe('resetPasswordSchema') | 5 | 5 PASS |
| `changePassword.test.ts` | describe('changePasswordSchema') | 6 | 6 PASS |

Suite total: 190 testes passando (sem regressão). Falhas esperadas: stubs da Wave 0 (MemberTable, ResetPasswordModal, ChangePasswordModal — aguardam implementação nos planos 13-02, 13-03, 13-04).

## Acceptance Criteria Verificados

- [x] `supabase/functions/reset-user-password/index.ts` contém `adminClient.auth.admin.updateUserById(user_id, { password })`
- [x] `supabase/functions/reset-user-password/index.ts` contém UUID regex `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`
- [x] `supabase/functions/reset-user-password/index.ts` retorna `{ success: true }` em sucesso e status 200
- [x] `roteiro-unificado/src/schemas/resetPassword.ts` exporta `resetPasswordSchema` e `ResetPasswordFormData`
- [x] `roteiro-unificado/src/schemas/changePassword.ts` exporta `changePasswordSchema` e `ChangePasswordFormData`
- [x] `changePassword.ts` contém `.refine(` com `path: ['confirmPassword']`
- [x] `npx vitest run src/schemas/resetPassword.test.ts src/schemas/changePassword.test.ts` — 11 testes passam

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Worktree sem node_modules para executar Vitest**
- **Found during:** Tentativa de executar testes RED
- **Issue:** Vitest falhou com `Cannot find package 'vitest'` porque o worktree não tem node_modules instalado (sem package install, apenas worktree checkout)
- **Fix:** Criado symlink `roteiro-unificado/node_modules -> /roteiro-unificado/node_modules` do projeto principal (mesmo padrão documentado no SUMMARY da Wave 0)
- **Files modified:** Symlink apenas (não trackado pelo git)

## TDD Gate Compliance

- [x] Commit RED existe: `5f8c33f` (test(13-01))
- [x] Commit GREEN existe: `f63fabb` (feat(13-01)) — após o RED

## Known Stubs

Nenhum stub. Todos os artefatos estão completamente implementados.

## Threat Flags

Nenhuma nova superfície de segurança identificada além do que foi documentado no `<threat_model>` do plano.

## Self-Check: PASSED

- [x] `supabase/functions/reset-user-password/index.ts` existe
- [x] `roteiro-unificado/src/schemas/resetPassword.ts` existe
- [x] `roteiro-unificado/src/schemas/changePassword.ts` existe
- [x] Commits `5f8c33f` e `f63fabb` existem
- [x] 11 testes de schema passando
- [x] 190 testes existentes mantêm status (sem regressão)
