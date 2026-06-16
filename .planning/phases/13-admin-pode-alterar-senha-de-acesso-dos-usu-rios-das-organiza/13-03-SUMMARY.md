---
phase: 13
plan: "03"
subsystem: frontend-wiring
tags: [react, member-table, modal-wiring, admin-panel, wave-3]
dependency_graph:
  requires:
    - 13-02 (ResetPasswordModal criado)
    - 13-01 (schemas Zod e Edge Function)
  provides:
    - roteiro-unificado/src/components/admin/MemberTable.tsx (coluna Ações + prop onResetPassword)
    - roteiro-unificado/src/pages/admin/OrgDetail.tsx (estado resetPasswordMemberId + ResetPasswordModal condicional)
  affects:
    - roteiro-unificado/src/pages/admin/OrgDetail.tsx (Wave 3 — wiring completo do Fluxo A admin)
tech_stack:
  added: []
  patterns:
    - Prop callback opcional (onResetPassword?) — MemberTable expõe trigger sem acoplar lógica
    - Estado local string | null para ID do membro selecionado — padrão isAddMemberOpen/isArchiveOpen replicado
    - Renderização condicional com guard expression (resetPasswordMemberId && <Modal />) — padrão OrgDetail
    - T-13-09: botão oculto para role=admin via condicional member.role === 'company' && onResetPassword
key_files:
  created: []
  modified:
    - roteiro-unificado/src/components/admin/MemberTable.tsx
    - roteiro-unificado/src/pages/admin/OrgDetail.tsx
decisions:
  - "Prop onResetPassword é opcional (?) — MemberTable funciona sem ela; botão simplesmente não aparece quando a prop está ausente"
  - "isLoading={false} preservado em OrgDetail (Pitfall 3 do RESEARCH.md)"
  - "resetPasswordMemberId como string | null segue exatamente o padrão isAddMemberOpen/isArchiveOpen existente"
  - "email do membro resolvido via members?.find() inline no JSX — sem estado extra; consistente com dados já carregados"
metrics:
  duration: "~10 min"
  completed: "2026-06-16"
  tasks_completed: 2
  files_created: 0
  files_modified: 2
---

# Phase 13 Plan 03: Wiring MemberTable e OrgDetail para Fluxo A de Reset de Senha Summary

Coluna "Ações" adicionada ao MemberTable com botão "Redefinir senha" condicional por role, e OrgDetail conectado ao ResetPasswordModal via estado local — admin clica no botão e o modal abre com userId e email corretos.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Expandir MemberTable com coluna Ações e prop onResetPassword | e5c0bbe | MemberTable.tsx |
| 2 | Conectar ResetPasswordModal ao OrgDetail | 3c09865 | OrgDetail.tsx |

## Resultado dos Testes

| Arquivo | Suite | Testes | Status |
|---------|-------|--------|--------|
| `MemberTable.test.tsx` | describe('MemberTable') | 2 | 2 PASS |
| Suite completa | todos os arquivos | 196 | 196 PASS + 3 todo |

## Acceptance Criteria Verificados

- [x] `MemberTable.tsx` contém `onResetPassword?: (userId: string) => void` na interface
- [x] `MemberTable.tsx` contém `member.role === 'company' && onResetPassword &&` no tbody
- [x] `MemberTable.tsx` contém `<th` com texto `Ações`
- [x] `npx vitest run src/components/admin/__tests__/MemberTable.test.tsx` — 2 testes PASS
- [x] `OrgDetail.tsx` contém `resetPasswordMemberId` como useState<string | null>(null)
- [x] `OrgDetail.tsx` contém `onResetPassword={(userId) => setResetPasswordMemberId(userId)}`
- [x] `OrgDetail.tsx` contém `isLoading={false}` na chamada de MemberTable (sem alteração)
- [x] `OrgDetail.tsx` contém `ResetPasswordModal` com `userId={resetPasswordMemberId}` e `memberEmail={members?.find(...)`
- [x] `OrgDetail.tsx` importa `ResetPasswordModal` de `@/components/admin/ResetPasswordModal`
- [x] `npx tsc --noEmit` — sem erros TypeScript
- [x] Suite completa verde — sem regressões (196 testes + 3 todo)

## Deviations from Plan

### Setup Adicional

**1. [Rule 3 - Blocking] Worktree não tinha arquivos da Wave 2**
- **Found during:** Início da execução
- **Issue:** Worktree branch `worktree-agent-a7973186a586d25bb` foi criado antes dos commits das waves 0-2 da fase 13. Arquivos `ResetPasswordModal.tsx`, schemas e testes não existiam no worktree.
- **Fix:** `git merge c3f5bab` (fast-forward) para trazer os commits da Wave 2 antes de iniciar a implementação. npm install no `roteiro-unificado` do worktree para obter as dependências.
- **Commit:** Fast-forward para c3f5bab (sem commit adicional criado — fast-forward)

## Known Stubs

Nenhum stub. Ambos os arquivos modificados têm implementação completa e funcional.

## Threat Flags

T-13-09 mitigado: botão "Redefinir senha" aparece apenas para `member.role === 'company'` — verificado por testes RTL que passam. Nenhuma nova superfície de segurança além do documentado no plan.

## Self-Check: PASSED

- [x] `roteiro-unificado/src/components/admin/MemberTable.tsx` modificado com coluna Ações
- [x] `roteiro-unificado/src/pages/admin/OrgDetail.tsx` modificado com ResetPasswordModal wiring
- [x] Commit `e5c0bbe` existe (Task 1)
- [x] Commit `3c09865` existe (Task 2)
- [x] 2 testes MemberTable passando
- [x] 196 testes da suite completa passando
- [x] TypeScript sem erros
