---
phase: 13
slug: 13-admin-pode-alterar-senha-de-acesso-dos-usu-rios-das-organiza
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-16
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `roteiro-unificado/vitest.config.ts` (installed in Phase 8) |
| **Quick run command** | `cd roteiro-unificado && npx vitest run --reporter=verbose` |
| **Full suite command** | `cd roteiro-unificado && npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd roteiro-unificado && npx vitest run --reporter=verbose`
- **After every plan wave:** Run `cd roteiro-unificado && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 13-01-01 | 01 | 1 | N/A (TBD) | T-13-01 | Edge Function rejects calls without valid service_role | smoke/CLI | `supabase functions deploy reset-user-password` | ❌ W0 | ⬜ pending |
| 13-01-02 | 01 | 1 | N/A (TBD) | T-13-01 | updateUserById called with valid userId updates password | smoke manual | Manual: admin resets → company logs in | N/A | ⬜ pending |
| 13-02-01 | 02 | 2 | N/A (TBD) | — | ResetPasswordModal only renders for role=company rows | unit RTL | `npx vitest run src/components/admin/__tests__/ResetPasswordModal.test.tsx` | ❌ W0 | ⬜ pending |
| 13-02-02 | 02 | 2 | N/A (TBD) | — | "Redefinir senha" button hidden for admin rows | unit RTL | `npx vitest run src/components/admin/__tests__/MemberTable.test.tsx` | ❌ W0 | ⬜ pending |
| 13-03-01 | 03 | 2 | N/A (TBD) | — | ChangePasswordModal shows error on password mismatch | unit RTL | `npx vitest run src/components/__tests__/ChangePasswordModal.test.tsx` | ❌ W0 | ⬜ pending |
| 13-03-02 | 03 | 2 | N/A (TBD) | — | Company self-service: signInWithPassword fails → updateUser not called | unit | same as above | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `roteiro-unificado/src/components/admin/__tests__/ResetPasswordModal.test.tsx` — stubs N-03, N-04
- [ ] `roteiro-unificado/src/components/admin/__tests__/MemberTable.test.tsx` — stub N-03
- [ ] `roteiro-unificado/src/components/__tests__/ChangePasswordModal.test.tsx` — stubs N-04

*Existing infrastructure (vitest + @testing-library/react from Phase 8) covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Admin resets company password end-to-end | N-01 | Requires real Supabase Auth + deployed Edge Function | Admin acessa OrgDetail → clica "Redefinir senha" numa row company → digita nova senha → salva → company faz login com nova senha → sucesso |
| Company self-service password change | N-02 | Requires real Supabase Auth session + JWT | Company faz login → clica "Alterar senha" no FormLayout sidebar → preenche senha atual correta + nova + confirmação → salva → faz login com nova senha → sucesso |
| Edge Function deployada e listada | N-05 | CLI check | `supabase functions list` → `reset-user-password` aparece na lista |

---

## Nyquist Minimum Sample (N-01 a N-05)

| ID | Check | Type | Priority |
|----|-------|------|----------|
| N-01 | Admin resets company password → login com nova senha funciona | Smoke manual | MUST |
| N-02 | Company self-service muda senha → login com nova senha funciona | Smoke manual | MUST |
| N-03 | Botão "Redefinir senha" ausente em linhas com role=admin | Unit RTL | MUST |
| N-04 | Erro inline ao digitar senhas divergentes no ChangePasswordModal | Unit RTL | MUST |
| N-05 | `supabase functions list` retorna `reset-user-password` | CLI | MUST |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
