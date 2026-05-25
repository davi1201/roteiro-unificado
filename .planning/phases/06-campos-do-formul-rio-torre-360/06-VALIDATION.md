---
phase: 6
slug: 06-campos-do-formul-rio-torre-360
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-25
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for Phase 6: Campos do Formulário Torre 360.
> Reconstructed from SUMMARY artifacts via /gsd:validate-phase 6 (2026-05-25).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x + @testing-library/react + @testing-library/jest-dom |
| **Config file** | `roteiro-unificado/vitest.config.ts` |
| **Quick run command** | `cd roteiro-unificado && npx vitest run` |
| **Full suite command** | `cd roteiro-unificado && npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** `cd roteiro-unificado && npx vitest run`
- **After every plan wave:** `cd roteiro-unificado && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-T1 | 01 | 1 | FORM-05 | T-06-01-04 | SelectField renders options from prop, not user input (XSS prevented by React escaping) | unit | `cd roteiro-unificado && npx vitest run src/components/ui/select-field.test.tsx` | ✅ | ✅ green |
| 06-01-T2 | 01 | 1 | FORM-05 | — | TextareaField shows helpText only when no error; error takes priority | unit | `cd roteiro-unificado && npx vitest run src/components/ui/textarea-field.test.tsx` | ✅ | ✅ green |
| 06-01-T3 | 01 | 1 | FORM-05 | T-06-01-01 | RadioGroupField uses type="button" (no submit); applies ring-2 ring-primary on selected | unit | `cd roteiro-unificado && npx vitest run src/components/ui/radio-group-field.test.tsx` | ✅ | ✅ green |
| 06-01-T4 | 01 | 1 | FORM-05 | T-06-01-02 | CheckboxGroupField manages string[] via single Controller; showSelectAll selects/deselects all | unit | `cd roteiro-unificado && npx vitest run src/components/ui/checkbox-group-field.test.tsx` | ✅ | ✅ green |
| 06-01-T5 | 01 | 1 | FORM-06 | T-06-01-03 | ConditionalField returns null when condition=false; calls unregisterFn(fieldName, {keepValue: false}) | unit | `cd roteiro-unificado && npx vitest run src/components/ui/conditional-field.test.tsx` | ✅ | ✅ green |
| 06-02-T1 | 02 | 1 | FORM-05 | — | identificacaoSchema: empresa required min(2); cnpj regex passes valid format, fails invalid | unit | `cd roteiro-unificado && npx vitest run src/schemas/identificacao.test.ts` | ✅ | ✅ green |
| 06-03-T1 | 03 | 1 | FORM-06 | T-06-03-01 | torreDecisaoSchema: qualBI .optional() (no value = valid); existeBI accepts valid enum slugs | unit | `cd roteiro-unificado && npx vitest run src/schemas/torre-decisao.test.ts` | ✅ | ✅ green |
| 06-07-T1 | 07 | 2 | FORM-05/06 | T-06-07-02 | useFormSection without control: returns 0.01 sentinel + empty errors; with control: returns real completeness | unit | `cd roteiro-unificado && npx vitest run src/features/form/useFormSection.test.ts` | ✅ | ✅ green |
| 06-07-T2 | 07 | 2 | FORM-05 | — | FormLayout renders IdentificacaoSection for TabKey.Identificacao; TorreDecisaoSection for TabKey.TorreDecisao | integration | `cd roteiro-unificado && npx vitest run src/features/form/FormLayout.test.tsx` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new framework installation needed — Vitest + @testing-library/react already present.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| CNPJ mask applies visual formatting (xx.xxx.xxx/xxxx-xx) while typing | FORM-05 | Requires real browser input events with sequential typing; jsdom does not fully simulate onChange chaining via setValue | Type "12345678000195" in the CNPJ field; verify "12.345.678/0001-95" appears |
| ConditionalField hides qualBI when "Existe BI?" = "Não" and shows it when "Sim — Power BI" | FORM-06 | Integration of watch+ConditionalField in real browser context | In Torre Decisão tab, select "Não" for "Existe BI hoje?" → verify qualBI field disappears; select "Sim — Power BI" → verify it appears |
| 12 Sienge module cards render correctly in grid layout at various viewport sizes | FORM-05 | Responsive layout requires visual inspection | Open Torre Sienge tab on mobile (375px) and desktop (1280px); verify cards stack on mobile, 2-col grid on desktop |
| Completeness indicator updates as fields are filled | FORM-05 | Requires full RHF+Zustand+FormLayout integration in real browser | Fill all required fields in Identificação; verify sidebar badge changes to 100% |

---

## Known Issues

> **WARNING — useFormSection "without control" path:** The `useFormSection.ts:85` comment claims "RHF returns empty state when control is undefined", but `useFormState({ control: undefined })` crashes without a surrounding `FormProvider`. This does not affect production (the without-control path is only called from components using `useFormStore` directly). Tracked for fix in Phase 8 (autosave) when `useFormSection` usage is consolidated.

---

## Validation Sign-Off

- [x] All tasks have automated verify command
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (9/9 gaps resolved)
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-05-25 (automated via /gsd:validate-phase 6)
