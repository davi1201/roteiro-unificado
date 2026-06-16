---
phase: 13
plan: "05"
subsystem: infra-deploy
tags: [supabase, edge-function, deploy, vitest, wave-4]
dependency_graph:
  requires:
    - 13-01 (Edge Function reset-user-password criada)
    - 13-03 (MemberTable + OrgDetail com Fluxo A)
    - 13-04 (FormLayout com botão Alterar senha)
  provides:
    - supabase/functions/reset-user-password (deployada e ACTIVE no projeto zbfajqtvplabdcmjmdiw)
  affects:
    - roteiro-unificado/src/features/form/ExportPdfButton.test.tsx (fix bug pré-existente)
tech_stack:
  added: []
  patterns:
    - supabase functions deploy --no-verify-jwt para deploy de Edge Function sem verificação JWT da função (autenticação garantida pelo cliente JS)
key_files:
  created: []
  modified:
    - roteiro-unificado/src/features/form/ExportPdfButton.test.tsx
decisions:
  - "N-05 verificado via supabase functions list — reset-user-password aparece como ACTIVE"
  - "Suite completa verde (196 testes + 3 todo) confirma N-03 e N-04 automatizados"
  - "vi.doMock redundante removido do beforeEach do ExportPdfButton.test.tsx — vi.mock estático no nível do módulo já intercepta dynamic imports no Vitest"
metrics:
  duration: "~4 min"
  completed: "2026-06-16"
  tasks_completed: 1
  files_created: 0
  files_modified: 1
---

# Phase 13 Plan 05: Deploy da Edge Function e Verificação E2E Summary

Edge Function `reset-user-password` deployada com sucesso no projeto Supabase (status ACTIVE), suite de testes 100% verde após correção de bug pré-existente — aguardando verificação manual N-01 e N-02.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Deploy da Edge Function e suite de testes automatizados | 151ec80 | ExportPdfButton.test.tsx |

## Resultado do Deploy (N-05)

| Função | Status | Versão | Atualizado em |
|--------|--------|--------|---------------|
| `reset-user-password` | ACTIVE | 1 | 2026-06-16 22:10:12 UTC |

Deploy realizado via `supabase functions deploy reset-user-password --no-verify-jwt` — confirmado com `supabase functions list`.

## Resultado dos Testes Automatizados

| Suíte | Testes | Status |
|-------|--------|--------|
| `MemberTable.test.tsx` | N-03: botão ausente para role=admin | PASS |
| `ChangePasswordModal.test.tsx` | N-04: erro inline para senhas divergentes | PASS |
| `resetPassword.test.ts` | 5 testes de schema | PASS |
| `changePassword.test.ts` | Testes de schema | PASS |
| Suite completa | 196 testes + 3 todo | 100% verde |

## Acceptance Criteria Verificados

- [x] N-05: `supabase functions list` exibe `reset-user-password` com status ACTIVE
- [x] N-03: `MemberTable.test.tsx` — botão ausente para role=admin (suite verde)
- [x] N-04: `ChangePasswordModal.test.tsx` — erro inline para senhas divergentes (suite verde)
- [x] Suite completa: 196 testes passando, 0 regressões
- [ ] N-01: Verificação manual — aguardando checkpoint:human-verify (Tarefa 2)
- [ ] N-02: Verificação manual — aguardando checkpoint:human-verify (Tarefa 2)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrigido bug pré-existente em ExportPdfButton.test.tsx**
- **Found during:** Tarefa 1 — ao rodar `npx vitest run --reporter=verbose`
- **Issue:** Test 3 falhava porque `vi.doMock` no `beforeEach` estava conflitando com `vi.mock` estático no nível do módulo. O `vi.clearAllMocks()` limpava as implementações e o `vi.doMock` seguinte sobrescrevia com uma nova factory independente do `mockGenerateAndOpenPDF`. Resultado: a promessa de `mockRejectedValueOnce` não era propagada ao dynamic import do componente.
- **Fix:** Removido o `vi.doMock` redundante do `beforeEach` — o `vi.mock` estático (hoisted) já intercepta corretamente dynamic imports no Vitest. O `vi.clearAllMocks()` no `beforeEach` é suficiente para resetar entre testes.
- **Escopo:** Bug existe desde o commit `07b2dee` (fase 10); não relacionado às mudanças da fase 13, mas exigia correção para a suite completa ficar verde (critério de aceitação do plano 13-05).
- **Files modified:** `roteiro-unificado/src/features/form/ExportPdfButton.test.tsx`
- **Commit:** `151ec80`

## Known Stubs

Nenhum stub. A Tarefa 1 apenas fez deploy e corrigiu teste — nenhum componente novo criado.

## Threat Flags

T-13-SC mitigado: Deploy realizado via CLI autenticada (supabase login); `supabase functions list` confirma que `reset-user-password` aparece com status ACTIVE antes de considerar N-05 como PASS.

T-13-14 risco aceito: Flag `--no-verify-jwt` permite que a Edge Function receba chamadas sem verificação JWT server-side — mitigado pelo fato de que o Supabase JS client sempre envia o JWT do usuário logado no header Authorization automaticamente. Risco aceito para o piloto (A4).

## Self-Check: PASSED

- [x] `supabase functions list` confirma `reset-user-password` com status ACTIVE
- [x] Commit `151ec80` existe (Task 1)
- [x] 196 testes da suite completa passando (0 falhas)
- [x] `roteiro-unificado/src/features/form/ExportPdfButton.test.tsx` corrigido (vi.doMock removido)
- [ ] N-01 e N-02: pendentes — checkpoint:human-verify (Tarefa 2)
