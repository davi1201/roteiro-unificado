---
phase: 8
slug: autosave-submiss-o-versionamento
status: compliant
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-23
audited: 2026-05-23
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.7 |
| **Config file** | `roteiro-unificado/vitest.config.ts` |
| **Quick run command** | `cd roteiro-unificado && npx vitest run --reporter=verbose` |
| **Full suite command** | `cd roteiro-unificado && npx vitest run --coverage` |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd roteiro-unificado && npx vitest run --reporter=verbose`
- **After every plan wave:** Run `cd roteiro-unificado && npx vitest run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 08-00-01 | 00 | 0 | — | — | N/A — infraestrutura | infra | `cd roteiro-unificado && npx vitest run` | ✅ | ✅ green |
| 08-02-01 | 02 | 2 | SAVE-01, SAVE-02 | T-08-01 | Autosave SELECT+INSERT/UPDATE via debounce 1500ms | unit | `cd roteiro-unificado && npx vitest run src/hooks/useAutosave.test.ts` | ✅ | ✅ green |
| 08-02-02 | 02 | 2 | UX-04 | — | Toast success/warning no autosave | unit | `cd roteiro-unificado && npx vitest run src/hooks/useAutosave.test.ts` | ✅ | ✅ green |
| 08-02-03 | 02 | 2 | — | — | formStore hydrateFromAssessment | unit | `cd roteiro-unificado && npx vitest run src/stores/formStore.test.ts` | ✅ | ✅ green |
| 08-03-01 | 03 | 2 | SAVE-03 | T-08-02 | Submissão muda status para submitted; submitted_at; version++ | unit | `cd roteiro-unificado && npx vitest run src/features/form/useSubmitAssessment.test.ts` | ✅ | ✅ green |
| 08-03-02 | 03 | 2 | SAVE-04, SAVE-05 | T-08-02 | Nova revisão copia form_data; submitted nunca sobrescrito | unit | `cd roteiro-unificado && npx vitest run src/features/form/useNewRevision.test.ts` | ✅ | ✅ green |
| 08-lib | lib | — | — | — | calculateReadiness retorna G1–G5 correto | unit | `cd roteiro-unificado && npx vitest run src/lib/readiness.test.ts` | ✅ | ✅ green |
| 08-04-* | 04 | 3 | SAVE-06, UX-05 | — | Skeleton exibido; histórico lista versões | smoke | Manual (DevTools throttle) | — | ⬜ manual |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Manual-Only

| Task | Reason | Verification Steps |
|------|--------|--------------------|
| 08-04-* | Requer UI em browser + DevTools throttle | 1. Abrir `/form/:orgId` em slow-3G no Chrome DevTools; 2. Confirmar skeleton renderiza antes dos dados; 3. Navegar para `/form/:orgId/history` e confirmar lista de versões |

---

## Wave 0 Requirements

- [x] `roteiro-unificado/vitest.config.ts` — configuração do Vitest com jsdom
- [x] `roteiro-unificado/package.json` — `"test": "vitest"` em scripts
- [x] `src/hooks/useAutosave.test.ts` — SAVE-01, SAVE-02, UX-04
- [x] `src/lib/readiness.test.ts` — testes unitários do calculateReadiness
- [x] `src/features/form/useSubmitAssessment.test.ts` — SAVE-03
- [x] `src/features/form/useNewRevision.test.ts` — SAVE-04, SAVE-05

---

## Validation Audit 2026-05-23

| Metric | Count |
|--------|-------|
| Gaps found | 14 |
| Resolved (automated) | 14 |
| Escalated to manual-only | 0 |
| Total tests passing | 26 |
