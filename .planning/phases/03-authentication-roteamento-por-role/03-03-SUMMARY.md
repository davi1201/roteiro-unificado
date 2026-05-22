---
phase: 03-authentication-roteamento-por-role
plan: "03"
subsystem: auth-ui
tags: [auth, login, react-hook-form, zod, tailwind, supabase]
dependency_graph:
  requires:
    - roteiro-unificado/src/features/auth/AuthProvider.tsx
    - roteiro-unificado/src/features/auth/useAuth.ts
    - roteiro-unificado/src/lib/supabase.ts
    - roteiro-unificado/src/hooks/useToast.ts
    - roteiro-unificado/src/components/ui/button.tsx
    - roteiro-unificado/src/components/ui/input.tsx
    - roteiro-unificado/src/components/ui/card.tsx
    - roteiro-unificado/src/components/ui/spinner.tsx
  provides:
    - roteiro-unificado/src/pages/Login.tsx
  affects:
    - roteiro-unificado/src/App.tsx (plano 03-05 conecta o router)
tech_stack:
  added: []
  patterns:
    - react-hook-form com zodResolver e mode onBlur para validação inline
    - Auth flicker guard via isLoading do AuthContext antes de renderizar o form
    - Mensagem de erro genérica anti-enumeração via toast.error (D-04)
    - Tailwind tokens apenas — nenhum hex hardcodado nos componentes
key_files:
  created:
    - roteiro-unificado/src/pages/Login.tsx
  modified: []
decisions:
  - "onSubmit não faz navigate — roteamento pós-login é responsabilidade do plano 03-06"
  - "isLoading guard renderizado antes do JSX do form, não dentro do return principal, para evitar chamada condicional de hooks"
  - "noValidate no form para que validação HTML5 nativa não conflite com Zod/RHF"
metrics:
  duration_seconds: 130
  completed_date: "2026-05-22"
  tasks_completed: 1
  files_created: 1
  files_modified: 0
---

# Phase 3 Plan 3: Login Page Summary

**One-liner:** Página /login com card centralizado sobre bg-primary, validação Zod/RHF inline, auth flicker guard, toast de erro genérico anti-enumeração e botão com loading state via isLoading prop.

## O que foi construído

Criado `src/pages/Login.tsx` — componente completo da página de login, fiel ao contrato visual do UI-SPEC e às decisões D-01 a D-10 do CONTEXT.md.

### Login.tsx

- **Auth flicker (D-08):** Se `isLoading` do AuthContext for `true`, renderiza `<div className="min-h-screen bg-primary flex items-center justify-center"><Spinner size="lg" className="border-white border-t-transparent" /></div>` — previne flash de redirect para usuários já autenticados durante a inicialização do Supabase Auth.

- **Layout (D-01):** Container externo `min-h-screen bg-primary flex items-center justify-center px-4` + `Card` com `w-full max-w-[400px] shadow-md`.

- **CardHeader (D-02):** Título `<h1>Roteiro Unificado</h1>` (`text-2xl font-bold text-gray-900`) e subtítulo `<p>Piloto Sinduscon</p>` (`text-sm text-gray-500`), centralizados.

- **Formulário RHF/Zod (D-06):** Schema Zod com campos `email` (`.min(1).email()`) e `password` (`.min(1)`). `useForm` com `zodResolver` e `mode: 'onBlur'`. Erros exibidos inline via `error`/`errorMessage` props do `Input`.

- **Link recuperação (D-03):** `<Link to="/forgot-password" className="text-sm text-primary hover:underline self-end">Esqueci minha senha</Link>` — posicionado após o campo senha, alinhado à direita.

- **Botão loading (D-07):** `<Button type="submit" isLoading={isSubmitting} className="bg-accent hover:bg-accent-600 text-white w-full">` com children condicionais "Entrar" / "Entrando...".

- **Erro de auth (D-04, D-05):** `toast.error('Email ou senha inválidos')` — sempre este texto exato, independente do erro retornado pelo Supabase. Anti-enumeração garantida.

- **Sem roteamento pós-login:** `onSubmit` não chama `navigate` — responsabilidade delegada ao plano 03-06.

## Acceptance Criteria

| Critério | Resultado |
|----------|-----------|
| `min-h-screen bg-primary flex items-center justify-center` presente | PASS (count=2) |
| `max-w-[400px]` presente | PASS (count=1) |
| `Roteiro Unificado` presente | PASS (count=1) |
| `Piloto Sinduscon` presente | PASS (count=1) |
| `Esqueci minha senha` presente | PASS (count=1) |
| `/forgot-password` presente | PASS (count=1) |
| `Email ou senha inválidos` — apenas 1 ocorrência (no toast.error) | PASS (count=1) |
| `isLoading={isSubmitting}` no Button | PASS (count=1) |
| `Spinner` presente (auth flicker) | PASS (count=2) |
| Nenhum hex hardcodado `#123B66` ou `#F28C28` | PASS (count=0) |
| `npx tsc --noEmit` sem erros em pages/Login | PASS |

## Deviations from Plan

None — plano executado exatamente como especificado.

## Known Stubs

Nenhum — o componente é funcional. O `onSubmit` chama `supabase.auth.signInWithPassword` corretamente. O roteamento pós-login será conectado no plano 03-06 (por design, não por omissão).

## Threat Surface Scan

T-03-06 (Information Disclosure) mitigado: `toast.error('Email ou senha inválidos')` é a única mensagem de erro — nunca revela se o email existe ou não. Implementado conforme D-04.

T-03-07 (Tampering / duplo-submit) mitigado: `isLoading={isSubmitting}` no Button desabilita automaticamente o botão durante a submissão — previne múltiplas chamadas.

## Self-Check: PASSED

- `roteiro-unificado/src/pages/Login.tsx` — FOUND
- Commit `089194f` — FOUND
