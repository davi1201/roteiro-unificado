---
phase: 13
plan: "02"
subsystem: frontend-modals
tags: [react, dialog, react-hook-form, usemutation, zod, wave-2]
dependency_graph:
  requires:
    - 13-01 (schemas Zod resetPassword e changePassword)
  provides:
    - roteiro-unificado/src/components/admin/ResetPasswordModal.tsx
    - roteiro-unificado/src/features/form/ChangePasswordModal.tsx
  affects:
    - roteiro-unificado/src/components/admin/MemberTable.tsx (Wave 3 — wiring onResetPassword)
    - roteiro-unificado/src/features/form/FormLayout.tsx ou similar (Wave 4 — wiring ChangePasswordModal)
tech_stack:
  added: []
  patterns:
    - Dialog + React Hook Form + useMutation — padrão AddMemberModal aplicado a novos modais
    - Verificação dupla fnError || !fnData?.success para Edge Functions (Pitfall 2 do RESEARCH.md)
    - Re-autenticação Opção B com signInWithPassword antes de updateUser (T-13-05)
    - onClose() exclusivamente em onSuccess — previne fechamento acidental
key_files:
  created:
    - roteiro-unificado/src/components/admin/ResetPasswordModal.tsx
    - roteiro-unificado/src/features/form/ChangePasswordModal.tsx
  modified:
    - roteiro-unificado/src/features/form/__tests__/ChangePasswordModal.test.tsx (Rule 1 — fix regex ambíguo)
decisions:
  - "ResetPasswordModal não usa useQueryClient — reset de senha não invalida queries de listagem de membros"
  - "ChangePasswordModal usa Opção B (signInWithPassword antes de updateUser) para verificação de senha atual — adequada para piloto com 5 construtoras"
  - "Regex /nova senha/i no teste original era ambíguo com label 'Confirmar nova senha'; corrigido para /^nova senha$/i com anchors"
metrics:
  duration: "~15 min"
  completed: "2026-06-16"
  tasks_completed: 2
  files_created: 2
  files_modified: 1
---

# Phase 13 Plan 02: Modais de Alteração de Senha Summary

Dois modais React com Dialog, React Hook Form, useMutation e toast — ResetPasswordModal (admin, Fluxo A) e ChangePasswordModal (company self-service, Fluxo B com re-autenticação signInWithPassword).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Criar ResetPasswordModal (Fluxo A — admin) | 46bc7d4 | ResetPasswordModal.tsx |
| 2 | Criar ChangePasswordModal (Fluxo B — company self-service) | 5027d0e | ChangePasswordModal.tsx, ChangePasswordModal.test.tsx |

## Resultado dos Testes

| Arquivo | Suite | Testes | Status |
|---------|-------|--------|--------|
| `ResetPasswordModal.test.tsx` | describe('ResetPasswordModal') | 2 | 2 PASS |
| `ChangePasswordModal.test.tsx` | describe('ChangePasswordModal') | 3 | 3 PASS |

Suite total: 196 testes passando + 2 expected failures (stubs Wave 0 de MemberTable — aguardam Wave 3).

## Acceptance Criteria Verificados

- [x] `ResetPasswordModal.tsx` existe em `src/components/admin/`
- [x] Contém `useMutation(` com `supabase.functions.invoke(`
- [x] Contém verificação dupla `fnError || !fnData?.success` (Pitfall 2)
- [x] `onClose()` SOMENTE dentro de `onSuccess`
- [x] `npx vitest run src/components/admin/__tests__/ResetPasswordModal.test.tsx` — 2 testes PASS
- [x] `ChangePasswordModal.tsx` existe em `src/features/form/`
- [x] Contém `supabase.auth.signInWithPassword(` (verificação Opção B)
- [x] Contém `supabase.auth.updateUser({ password: data.newPassword })`
- [x] Contém `throw new Error('wrong_current_password')`
- [x] `npx vitest run src/features/form/__tests__/ChangePasswordModal.test.tsx` — 3 testes PASS
- [x] `npx tsc --noEmit` sem erros em ResetPasswordModal.tsx e ChangePasswordModal.tsx

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Regex ambíguo no teste ChangePasswordModal**
- **Found during:** Tarefa 2 — ao executar `npx vitest run ChangePasswordModal.test.tsx`
- **Issue:** `getByLabelText(/nova senha/i)` retornava múltiplos elementos porque o label "Confirmar nova senha" também contém a substring "nova senha". Testing Library usa `.test()` para regex, que faz substring match, causando `Found multiple elements with the text of: /nova senha/i`.
- **Fix:** Alterado para `getByLabelText(/^nova senha$/i)` com anchors de início e fim — mantém a intenção do teste (verificar que o campo "Nova senha" existe) sem ambiguidade com "Confirmar nova senha".
- **Files modified:** `roteiro-unificado/src/features/form/__tests__/ChangePasswordModal.test.tsx` (linha 51)
- **Commit:** `5027d0e`

## Known Stubs

Nenhum stub. Ambos os modais estão completamente implementados e prontos para wiring na Wave 3+4.

## Threat Flags

Nenhuma nova superfície de segurança identificada além do que foi documentado no `<threat_model>` do plano.

## Self-Check: PASSED

- [x] `roteiro-unificado/src/components/admin/ResetPasswordModal.tsx` existe
- [x] `roteiro-unificado/src/features/form/ChangePasswordModal.tsx` existe
- [x] Commit `46bc7d4` existe
- [x] Commit `5027d0e` existe
- [x] 5 testes dos novos modais passando
- [x] TypeScript sem erros nos novos arquivos
