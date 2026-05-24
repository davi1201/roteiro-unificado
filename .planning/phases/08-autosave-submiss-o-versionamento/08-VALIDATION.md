---
phase: 8
slug: autosave-submiss-o-versionamento
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-23
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (não instalado — Wave 0 instala) |
| **Config file** | `roteiro-unificado/vitest.config.ts` — Wave 0 cria |
| **Quick run command** | `cd roteiro-unificado && npx vitest run --reporter=verbose` |
| **Full suite command** | `cd roteiro-unificado && npx vitest run --coverage` |
| **Estimated runtime** | ~15 seconds |

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
| 08-00-01 | 00 | 0 | — | — | N/A — infraestrutura | infra | `cd roteiro-unificado && npx vitest run` | ❌ W0 | ⬜ pending |
| 08-02-01 | 02 | 2 | SAVE-01, SAVE-02 | T-08-01 | Autosave upsert via debounce 1500ms | unit | `cd roteiro-unificado && npx vitest run src/hooks/useAutosave.test.ts` | ❌ W0 | ⬜ pending |
| 08-02-02 | 02 | 2 | UX-04 | — | Toast success/warning no autosave | unit | `cd roteiro-unificado && npx vitest run src/hooks/useAutosave.test.ts` | ❌ W0 | ⬜ pending |
| 08-03-01 | 03 | 2 | SAVE-03 | T-08-02 | Submissão muda status para submitted | unit | `cd roteiro-unificado && npx vitest run src/features/form/useSubmitAssessment.test.ts` | ❌ W0 | ⬜ pending |
| 08-03-02 | 03 | 2 | SAVE-04, SAVE-05 | T-08-02 | Nova revisão copia form_data; submitted nunca sobrescrito | unit | `cd roteiro-unificado && npx vitest run src/features/form/useNewRevision.test.ts` | ❌ W0 | ⬜ pending |
| 08-lib | lib | — | — | — | calculateReadiness retorna G1–G5 correto | unit | `cd roteiro-unificado && npx vitest run src/lib/readiness.test.ts` | ❌ W0 | ⬜ pending |
| 08-04-* | 04 | 3 | SAVE-06, UX-05 | — | Skeleton exibido; histórico lista versões | smoke | Manual (DevTools throttle) | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `roteiro-unificado/vitest.config.ts` — configuração do Vitest com jsdom
- [ ] `roteiro-unificado/package.json` — adicionar `"test": "vitest"` em scripts
- [ ] `src/hooks/useAutosave.test.ts` — stubs para SAVE-01, SAVE-02, UX-04
- [ ] `src/lib/readiness.test.ts` — testes unitários do calculateReadiness
- [ ] `src/features/form/useSubmitAssessment.test.ts` — stubs para SAVE-03
- [ ] `src/features/form/useNewRevision.test.ts` — stubs para SAVE-04, SAVE-05

**Instalação:**
```bash
cd roteiro-unificado
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event jsdom
```
