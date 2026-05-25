---
phase: "03"
slug: authentication-roteamento-por-role
status: complete
nyquist_compliant: true
wave_0_complete: true
created: "2026-05-25"
---

# Phase 03 — Validation Strategy

> Per-phase validation contract — Authentication & Roteamento por Role.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 2.x + jsdom + @testing-library/react |
| **Config file** | `roteiro-unificado/vitest.config.ts` |
| **Setup file** | `roteiro-unificado/src/test-setup.ts` (jest-dom matchers) |
| **Quick run command** | `cd roteiro-unificado && npx vitest run src/features/auth` |
| **Full suite command** | `cd roteiro-unificado && npx vitest run` |
| **Estimated runtime** | ~5 seconds (120 tests, 23 files) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/features/auth`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | AUTH-01/02 | T-03-01, T-03-02, T-03-03 | isLoading stays true until org_members resolves; SIGNED_OUT clears role/orgId; null session = signed out | integration | `npx vitest run src/features/auth/AuthProvider.test.tsx` | ✅ | ✅ green |
| 03-01-02 | 01 | 1 | AUTH-01 | T-03-03 | useAuth() throws outside AuthProvider | unit | `npx vitest run src/features/auth/useAuth.test.tsx` | ✅ | ✅ green |
| 03-02-01 | 02 | 1 | AUTH-05 | T-03-05 | isAdmin derived server-side via role; never client-tamperable | unit | `npx vitest run src/features/auth/useUser.test.tsx` | ✅ | ✅ green |
| 03-02-02 | 02 | 1 | AUTH-05 | T-03-04 | form-progress-${tenantId} namespace prevents cross-tenant localStorage leakage | unit | `npx vitest run src/stores/formStore.test.ts` | ✅ | ✅ green |
| 03-03-01 | 03 | 2 | AUTH-01 | T-03-06, T-03-07 | Zod inline validation; generic error toast on auth failure (anti-enumeration) | integration | `npx vitest run src/pages/Login.test.tsx` | ✅ | ✅ green |
| 03-03-02 | 03 | 2 | AUTH-04 | T-03-15, T-03-16 | admin → /admin/dashboard; company+orgId → /form/:orgId; navigate with replace:true | integration | `npx vitest run src/pages/Login.test.tsx` | ✅ | ✅ green |
| 03-04-01 | 04 | 2 | AUTH-03 | T-03-10 | resetPasswordForEmail called; success toast on null error | integration | `npx vitest run src/pages/ForgotPassword.test.tsx` | ✅ | ✅ green |
| 03-04-02 | 04 | 2 | AUTH-03 | T-03-09, T-03-11 | getSession check before form; expired message when no session; Zod .refine confirms password match | integration | `npx vitest run src/pages/ResetPassword.test.tsx` | ✅ | ✅ green |
| 03-05-01 | 05 | 3 | AUTH-05 | T-03-13, T-03-14 | redirect /login when no session; spinner during isLoading; Outlet when authenticated | integration | `npx vitest run src/components/routing/ProtectedRoute.test.tsx` | ✅ | ✅ green |
| 03-05-02 | 05 | 3 | AUTH-05 | T-03-12, T-03-13, T-03-14 | redirect /login for company role; redirect /login when no session; Outlet only for admin | integration | `npx vitest run src/components/routing/AdminRoute.test.tsx` | ✅ | ✅ green |
| 03-06-01 | 06 | 3 | AUTH-04/05 | T-03-17 | /login, /forgot-password, /reset-password public; /form/:orgId under ProtectedRoute; /admin/dashboard under AdminRoute | smoke | `npx vitest run src/router.test.tsx` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covered all phase requirements.

- Vitest + jsdom pre-installed (vitest.config.ts)
- @testing-library/react pre-installed
- @testing-library/jest-dom installed during validation (src/test-setup.ts)
- vitest.config.ts updated: added `setupFiles: ['./src/test-setup.ts']`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Email de recuperação de senha chega na caixa de entrada real | AUTH-03 | Depende de SMTP do Supabase + email real | 1. Acessar /forgot-password; 2. Inserir email válido de teste; 3. Verificar recebimento do link |
| Link de reset expira após uso ou expiração do token | AUTH-03 | Depende de TTL configurado no Supabase Auth | Testar com link de reset já utilizado — deve redirecionar para /forgot-password |
| Rate limiting de tentativas de login | AUTH-01 | Responsabilidade do Supabase Auth server-side | Testar 10+ tentativas falhas consecutivas — verificar comportamento do Supabase |

---

## Validation Sign-Off

- [x] Todas as tasks têm `automated` verify
- [x] Continuidade de sampling: nenhuma tarefa sem verificação automatizada
- [x] Wave 0 não necessária (infra existente)
- [x] Sem watch-mode flags nos comandos
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` setado no frontmatter

**Approval:** approved 2026-05-25

---

## Validation Audit 2026-05-25

| Métrica | Contagem |
|---------|---------|
| Gaps encontrados | 11 (10 MISSING + 1 PARTIAL) |
| Resolvidos automaticamente | 10 |
| Manual-only | 3 (comportamentos dependentes de infra externa) |
| Testes criados | 9 arquivos novos, 41 testes |
| Total suite | 120 testes, 23 arquivos, todos verdes |
