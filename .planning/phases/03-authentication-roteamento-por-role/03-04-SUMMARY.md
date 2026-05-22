---
phase: 03-authentication-roteamento-por-role
plan: "04"
subsystem: auth
tags: [auth, supabase, react-hook-form, zod, password-reset, forgot-password]
dependency_graph:
  requires:
    - roteiro-unificado/src/lib/supabase.ts
    - roteiro-unificado/src/hooks/useToast.ts
    - roteiro-unificado/src/components/ui/button.tsx
    - roteiro-unificado/src/components/ui/input.tsx
    - roteiro-unificado/src/components/ui/card.tsx
    - roteiro-unificado/src/components/ui/spinner.tsx
  provides:
    - roteiro-unificado/src/pages/ForgotPassword.tsx
    - roteiro-unificado/src/pages/ResetPassword.tsx
  affects:
    - roteiro-unificado/src/App.tsx (roteamento — plano 06 deve registrar /forgot-password e /reset-password)
tech_stack:
  added: []
  patterns:
    - Zod schema com .refine() para validação cruzada de campos (confirmPassword)
    - useState<boolean | null> para estado ternário de verificação de sessão (null=checking, true=ok, false=invalid)
    - supabase.auth.getSession() em useEffect para verificar sessão ativa no mount
key_files:
  created:
    - roteiro-unificado/src/pages/ForgotPassword.tsx
    - roteiro-unificado/src/pages/ResetPassword.tsx
  modified: []
decisions:
  - "ForgotPassword não redireciona após envio — usuário permanece na página para tentar novamente se necessário"
  - "ResetPassword usa getSession() no mount para verificar token válido antes de exibir formulário (T-03-09)"
  - "Erro genérico no onSubmit do ResetPassword usa error.message do Supabase ou fallback genérico"
metrics:
  duration_seconds: 240
  completed_date: "2026-05-22"
  tasks_completed: 2
  files_created: 2
  files_modified: 0
---

# Phase 3 Plan 4: ForgotPassword e ResetPassword Summary

**One-liner:** Fluxo completo de recuperação de senha com resetPasswordForEmail, verificação de sessão via getSession() e redefinição via updateUser com validação Zod cruzada.

## O que foi construído

Criadas as duas páginas que formam o fluxo de recuperação de senha: ForgotPassword envia o email de reset via Supabase Auth e ResetPassword verifica a sessão ativa antes de permitir a redefinição.

### ForgotPassword.tsx

- Layout idêntico ao Login: `min-h-screen bg-primary flex items-center justify-center px-4` + Card `max-w-[400px]`
- CardHeader com título "Recuperar senha" e subtítulo explicativo
- Schema Zod com validação de email (min(1) + email format)
- Campo email com label, Input componente com propagação de erros inline via RHF
- Botão "Enviar link" com `isLoading` integrado ao spinner do Button
- `onSubmit` chama `supabase.auth.resetPasswordForEmail(email, { redirectTo: '...origin/reset-password' })`
- `error === null` → `toast.success('Link enviado. Verifique sua caixa de entrada')`
- `error !== null` → `toast.error('Não foi possível enviar o link. Tente novamente')`
- Não redireciona após o envio — usuário permanece na página
- Link "Voltar para o login" → `/login` abaixo do formulário
- Sem auth flicker (não usa isLoading do AuthContext — página pública)

### ResetPassword.tsx

- Layout idêntico: bg-primary full-screen, card max-w-[400px]
- Estado `hasValidSession: boolean | null` — null=verificando, true=sessão válida, false=sem sessão
- `useEffect` chama `supabase.auth.getSession()` no mount e define o estado
- Renderização condicional por três estados:
  - `null`: Spinner centralizado enquanto verifica
  - `false`: Mensagem "Link expirado. Solicite um novo link de recuperação" + link "Solicitar novo link" → /forgot-password
  - `true`: Formulário de nova senha
- Schema Zod com `password` (min(8)) e `confirmPassword` com `.refine()` verificando igualdade, mensagem "As senhas não coincidem" em path `['confirmPassword']`
- Campos "Nova senha" e "Confirmar nova senha" com type="password"
- Botão "Redefinir senha" com isLoading
- `onSubmit` chama `supabase.auth.updateUser({ password })`
- Sucesso: `toast.success('Senha redefinida com sucesso')` + `navigate('/login')`
- Erro: `toast.error(error.message || fallback)`
- Link "Voltar para o login" sempre visível no rodapé

## Acceptance Criteria

| Critério | Resultado |
|----------|-----------|
| `grep -c "Recuperar senha" ForgotPassword.tsx` ≥ 1 | PASS (1) |
| `grep -c "resetPasswordForEmail" ForgotPassword.tsx` ≥ 1 | PASS (1) |
| `grep -c "Link enviado. Verifique sua caixa de entrada" ForgotPassword.tsx` ≥ 1 | PASS (1) |
| `grep -c "Não foi possível enviar o link. Tente novamente" ForgotPassword.tsx` ≥ 1 | PASS (1) |
| `grep -c "Voltar para o login" ForgotPassword.tsx` ≥ 1 | PASS (1) |
| `grep -c "bg-primary" ForgotPassword.tsx` ≥ 1 | PASS (1) |
| `grep -c "Redefinir senha" ResetPassword.tsx` ≥ 1 | PASS (2) |
| `grep -c "updateUser" ResetPassword.tsx` ≥ 1 | PASS (1) |
| `grep -c "Senha redefinida com sucesso" ResetPassword.tsx` ≥ 1 | PASS (1) |
| `grep -c "Link expirado. Solicite um novo link de recuperação" ResetPassword.tsx` ≥ 1 | PASS (1) |
| `grep -c "As senhas não coincidem" ResetPassword.tsx` ≥ 1 | PASS (1) |
| `grep -c "A senha deve ter pelo menos 8 caracteres" ResetPassword.tsx` ≥ 1 | PASS (1) |
| `grep -c "useNavigate" ResetPassword.tsx` ≥ 1 | PASS (2) |
| `npx tsc --noEmit` sem erros em ForgotPassword.tsx | PASS |
| `npx tsc --noEmit` sem erros em ResetPassword.tsx | PASS |

## Deviations from Plan

Nenhum — plano executado exatamente conforme especificado.

## Threat Surface Scan

| Mitigação | Arquivo | Status |
|-----------|---------|--------|
| T-03-09 — Verificação de sessão antes de exibir formulário | ResetPassword.tsx | Implementada via `getSession()` no mount; `false` = bloqueia formulário |
| T-03-10 — Enumeração de email (accept) | ForgotPassword.tsx | Supabase retorna success para emails inexistentes por padrão; comportamento correto |
| T-03-11 — Senha fraca | ResetPassword.tsx | Zod `min(8)` bloqueia senhas curtas no client |

## Next Phase Readiness

- [x] ForgotPassword.tsx pronto para registro em rota `/forgot-password` (plano 06)
- [x] ResetPassword.tsx pronto para registro em rota `/reset-password` (plano 06)
- [ ] Plano 06 (React Router) deve registrar ambas as rotas como públicas (sem ProtectedRoute)

## Self-Check: PASSED

- `roteiro-unificado/src/pages/ForgotPassword.tsx` — FOUND
- `roteiro-unificado/src/pages/ResetPassword.tsx` — FOUND
- Commit `f48f509` — FOUND
