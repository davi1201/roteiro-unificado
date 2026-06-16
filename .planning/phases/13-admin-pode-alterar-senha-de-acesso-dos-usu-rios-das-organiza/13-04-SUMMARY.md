---
phase: 13
plan: "04"
subsystem: frontend-form
tags: [react, formlayout, sidebar, modal, wave-3]
dependency_graph:
  requires:
    - 13-02 (ChangePasswordModal criado)
  provides:
    - roteiro-unificado/src/features/form/FormLayout.tsx (botão 'Alterar senha' + wiring ChangePasswordModal)
  affects:
    - roteiro-unificado/.husky/pre-commit (fix para suporte a git worktrees)
tech_stack:
  added: []
  patterns:
    - useState(false) para controle de modal — padrão já usado com isSubmitOpen
    - Renderização condicional isChangePasswordOpen && <ChangePasswordModal/> — padrão do projeto
    - flex flex-col gap-2 no footer da sidebar para empilhar botões verticalmente
key_files:
  created: []
  modified:
    - roteiro-unificado/src/features/form/FormLayout.tsx
    - roteiro-unificado/.husky/pre-commit
decisions:
  - "Botão 'Alterar senha' inserido ANTES do botão 'Sair' no footer da sidebar — ordem lógica: ação de conta antes de ação de saída"
  - "Renderização condicional (isChangePasswordOpen && ...) em vez de passar open prop sempre — padrão de unmount do modal após fechar, liberando memória"
  - "Hook .husky/pre-commit atualizado com auto-symlink de node_modules para suporte a git worktrees"
metrics:
  duration: "~20 min"
  completed: "2026-06-16"
  tasks_completed: 1
  files_created: 0
  files_modified: 2
---

# Phase 13 Plan 04: Conectar ChangePasswordModal ao FormLayout Summary

Botão 'Alterar senha' adicionado ao footer da sidebar do FormLayout com wiring completo ao ChangePasswordModal via estado isChangePasswordOpen — company self-service (Fluxo B D-03) acessível sem sair do contexto de preenchimento do formulário.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Adicionar botão 'Alterar senha' e conectar ChangePasswordModal ao FormLayout | 195431b | FormLayout.tsx, .husky/pre-commit |

## Resultado dos Testes

| Arquivo | Suite | Testes | Status |
|---------|-------|--------|--------|
| `FormLayout.test.tsx` | FormLayout renderSection routing | 3 | 3 PASS |

Suite continua verde. Sem regressões.

## Acceptance Criteria Verificados

- [x] `FormLayout.tsx` importa `ChangePasswordModal` de `@/features/form/ChangePasswordModal`
- [x] `FormLayout.tsx` contém `isChangePasswordOpen` como `useState(false)`
- [x] `FormLayout.tsx` contém `onClick={() => setIsChangePasswordOpen(true)` em Button "Alterar senha"
- [x] `FormLayout.tsx` contém `isChangePasswordOpen && (<ChangePasswordModal`
- [x] O botão "Sair" ainda existe e seu `onClick={handleSignOut}` não foi alterado
- [x] O div do footer da sidebar contém `flex flex-col gap-2` (dois botões empilhados)
- [x] `npx tsc --noEmit` — sem erros TypeScript em FormLayout.tsx
- [x] `npx vitest run src/features/form/FormLayout.test.tsx` — 3 testes PASS (sem regressões)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking Issue] Hook .husky/pre-commit falhava em git worktrees**
- **Found during:** Tarefa 1 — ao tentar fazer commit a partir do worktree
- **Issue:** O hook `cd roteiro-unificado && npx lint-staged` falhava com `ENOENT` ao tentar spawn de `eslint --fix`. A causa raiz: git worktrees têm seu próprio diretório de trabalho (working tree) mas compartilham o histórico git. O diretório `roteiro-unificado/` no worktree NÃO tem `node_modules/` — esses existem apenas no checkout principal. Quando `lint-staged` tentava executar `eslint`, Node.js não conseguia resolver o módulo `typescript-eslint` importado no `eslint.config.js` porque o worktree não tem `node_modules/`.
- **Fix:** Atualizado `.husky/pre-commit` para detectar o checkout principal via `git rev-parse --git-common-dir` e criar automaticamente um symlink de `$WORKTREE/roteiro-unificado/node_modules` para `$MAIN_CHECKOUT/roteiro-unificado/node_modules` quando necessário. Também adiciona o `node_modules/.bin` ao `PATH`.
- **Files modified:** `.husky/pre-commit`
- **Commit:** `195431b`

## Known Stubs

Nenhum stub. FormLayout com botão 'Alterar senha' completamente implementado e funcional.

## Threat Flags

Nenhuma nova superfície de segurança identificada além do que foi documentado no `<threat_model>` do plano (T-13-12: botão visível apenas para usuários autenticados na rota protegida por CompanyRoute; admin nunca acessa FormLayout).

## Self-Check: PASSED

- [x] `roteiro-unificado/src/features/form/FormLayout.tsx` contém `isChangePasswordOpen`
- [x] `roteiro-unificado/src/features/form/FormLayout.tsx` contém `import { ChangePasswordModal }`
- [x] `roteiro-unificado/src/features/form/FormLayout.tsx` contém `flex flex-col gap-2` no footer
- [x] `.husky/pre-commit` contém lógica de symlink para worktrees
- [x] Commit `195431b` existe
- [x] 3 testes do FormLayout passando
- [x] TypeScript sem erros em FormLayout.tsx
