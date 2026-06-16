---
phase: 13
plan: "00"
subsystem: testing
tags: [tdd, test-stubs, wave-0, red-tests]
dependency_graph:
  requires: []
  provides:
    - test stubs RED para MemberTable (N-03)
    - test stubs RED para ResetPasswordModal (N-03, N-04)
    - test stubs RED para ChangePasswordModal (N-04)
  affects:
    - roteiro-unificado/src/components/admin/__tests__/MemberTable.test.tsx
    - roteiro-unificado/src/components/admin/__tests__/ResetPasswordModal.test.tsx
    - roteiro-unificado/src/features/form/__tests__/ChangePasswordModal.test.tsx
tech_stack:
  added: []
  patterns:
    - RTL + vitest test stub pattern com vi.mock para dependências ausentes
    - fixtures tipadas com OrgMemberWithEmail para testes de MemberTable
key_files:
  created:
    - roteiro-unificado/src/components/admin/__tests__/MemberTable.test.tsx
    - roteiro-unificado/src/components/admin/__tests__/ResetPasswordModal.test.tsx
    - roteiro-unificado/src/features/form/__tests__/ChangePasswordModal.test.tsx
  modified: []
decisions:
  - "Stubs importam módulos que não existem — falhas do tipo FAIL [Cannot find module] são esperadas e corretas para Wave 0"
  - "MemberTable.test.tsx já declara a prop onResetPassword que será adicionada em Wave 3; 1 teste já passa (admin não deve ver botão)"
  - "Criado symlink roteiro-unificado/node_modules -> main project para viabilizar pre-commit hooks no worktree"
metrics:
  duration: "~10 min"
  completed: "2026-06-16"
  tasks_completed: 2
  files_created: 3
---

# Phase 13 Plan 00: Wave 0 — Stubs de Teste RED Summary

Três arquivos de stub criados com testes que falham intencionalmente, estabelecendo contratos comportamentais para os planos seguintes da fase 13.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Criar stubs MemberTable e ResetPasswordModal | 6af5468 | MemberTable.test.tsx, ResetPasswordModal.test.tsx |
| 2 | Criar stub ChangePasswordModal | 573c8c6 | ChangePasswordModal.test.tsx |

## Resultado dos Stubs

| Arquivo | Suite | Testes | Status |
|---------|-------|--------|--------|
| `MemberTable.test.tsx` | describe('MemberTable') | 2 | 1 FAIL (esperado), 1 PASS |
| `ResetPasswordModal.test.tsx` | describe('ResetPasswordModal') | 2 | 2 FAIL (Cannot find module) |
| `ChangePasswordModal.test.tsx` | describe('ChangePasswordModal') | 3 | 3 FAIL (Cannot find module) |

Suite existente: 178 testes passando (sem regressão). Falha pré-existente no ExportPdfButton.test.tsx (Test 3) não relacionada a este plano.

## Comportamentos Declarados pelos Stubs

**MemberTable (N-03):**
- Membro com role `company` deve ter botão "Redefinir senha" visível
- Membro com role `admin` NOT deve ter botão "Redefinir senha"

**ResetPasswordModal (N-03, N-04):**
- Quando `open=true`: dialog exibe título "Redefinir senha"
- Quando `open=false`: conteúdo não visível

**ChangePasswordModal (N-04):**
- Quando `open=true`: três campos de senha (Senha atual, Nova senha, Confirmar nova senha)
- Quando `open=true`: botões "Salvar" e "Cancelar" presentes
- Quando `open=false`: conteúdo não visível

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Worktree sem node_modules para pre-commit hooks**
- **Found during:** Task 1 (primeiro commit)
- **Issue:** Pre-commit hook `cd roteiro-unificado && npx lint-staged` falhava com ENOENT porque o worktree não tem node_modules instalado
- **Fix:** Criado symlink `roteiro-unificado/node_modules -> /roteiro-unificado/node_modules` no projeto principal para viabilizar eslint/prettier no worktree
- **Commit:** Aplicado antes do commit 6af5468

## Known Stubs

Todos os três arquivos são stubs intencionais — os módulos que eles importam (`../ResetPasswordModal`, `../ChangePasswordModal`) ainda não existem e serão criados em Wave 2 (planos 01 e 02).

## Self-Check: PASSED

- [x] 3 arquivos criados nos caminhos corretos
- [x] Commits 6af5468 e 573c8c6 existem
- [x] Stubs executam sem erros de sintaxe/parse
- [x] Suite existente mantém 178 testes passando
