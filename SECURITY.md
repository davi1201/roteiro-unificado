# SECURITY.md — Phase 06: campos-do-formul-rio-torre-360

**Audit Date:** 2026-05-24
**Phase:** 06 — campos-do-formul-rio-torre-360
**ASVS Level:** 1
**Block On:** blocker (open threats)
**Auditor:** Security audit agent (claude-sonnet-4-6)

---

## Threat Verification Summary

**Threats Closed:** 27/27
**Threats Open:** 0/27
**Unregistered Flags:** None

---

## Threat Register — Full Verification

| Threat ID | Category | Disposition | Status | Evidence |
|-----------|----------|-------------|--------|----------|
| T-06-01-01 | Tampering | mitigate | CLOSED | `radio-group-field.tsx:42` — every `<button>` has `type="button"` |
| T-06-01-02 | Tampering | mitigate | CLOSED | `checkbox-group-field.tsx:56-60` — single Controller; each onChange reads from `field.value` before recalculating |
| T-06-01-03 | Information Disclosure | accept | CLOSED | Accepted risk — value removed when field hidden (`conditional-field.tsx:18` calls `unregisterFn(fieldName, { keepValue: false })`) |
| T-06-01-04 | Tampering | mitigate | CLOSED | No `dangerouslySetInnerHTML` found in any UI field component (grep returned exit 1 = not found); labels sourced from code-defined `options[].label` |
| T-06-01-SC | Tampering | accept | CLOSED | Accepted risk — no new packages installed |
| T-06-02-01 | Tampering | mitigate | CLOSED | `identificacao.ts:8` — Zod regex `/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/` validates canonical CNPJ format |
| T-06-02-02 | Information Disclosure | accept | CLOSED | Accepted risk — `formStore.ts:175` confirms key `form-data-${tenantId}` for tenant-namespaced sessionStorage |
| T-06-02-03 | Tampering | mitigate | CLOSED | `IdentificacaoSection.tsx:44` — empty deps `[]` with `// eslint-disable-line react-hooks/exhaustive-deps`; store not in deps array |
| T-06-02-04 | Validation bypass | accept | CLOSED | Accepted risk — cast is necessary; Zod re-validates on `mode: 'onBlur'` |
| T-06-02-SC | Tampering | accept | CLOSED | Accepted risk — no new packages |
| T-06-03-01 | Tampering | mitigate | CLOSED | `TorreDecisaoSection.tsx:132-147` — `ConditionalField` has `unregisterFn={unregister ...}`; `torre-decisao.ts:39` has `qualBI: z.string().optional()` |
| T-06-03-02 | Tampering | mitigate | CLOSED | `TorreDecisaoSection.tsx:92` — `}, []) // eslint-disable-line react-hooks/exhaustive-deps`; store outside deps |
| T-06-03-03 | Information Disclosure | mitigate | CLOSED | `TorreDecisaoSection.tsx:35-39` — enum values use slugs (`sim-power-bi`, `sim-outra`, `em-implantacao`); accented text only in `label` field |
| T-06-03-SC | Tampering | accept | CLOSED | Accepted risk — no new packages |
| T-06-04-01 | DoS | accept | CLOSED | Accepted risk — ~5KB JSON typical; sessionStorage quota ~5MB |
| T-06-04-02 | Tampering | mitigate | CLOSED | `TorreSiengeSection.tsx:71` — `}, []) // eslint-disable-line react-hooks/exhaustive-deps`; store outside deps |
| T-06-04-03 | Information Disclosure | mitigate | CLOSED | `TorreSiengeSection.tsx:52` — `useFormStore(tenantId)` called with tenantId; `formStore.ts:175` keys sessionStorage as `form-data-${tenantId}` |
| T-06-04-04 | Tampering | mitigate | CLOSED | `TorreSiengeSection.tsx:45` — `type ModuleErrors = Record<SiengeModuleSlug, Record<string, { message?: string }>>` — controlled local cast |
| T-06-04-SC | Tampering | accept | CLOSED | Accepted risk — no new packages |
| T-06-05-01 | Tampering | mitigate | CLOSED | `TorreAcessoSection.tsx:86` — `}, []) // eslint-disable-line react-hooks/exhaustive-deps`; store outside deps |
| T-06-05-02 | Information Disclosure | mitigate | CLOSED | `TorreAcessoSection.tsx:170-173` — `restricoesSeguranca` rendered as TextareaField; data flows via `watch` subscription into `store.updateSection` stored at `form-data-${tenantId}` in sessionStorage |
| T-06-05-03 | Tampering | mitigate | CLOSED | `TorreAcessoSection.tsx:11-14` — option values use slugs (`nuvem-data-center`, `local`, `hibrido`); accented text only in `label` |
| T-06-05-SC | Tampering | accept | CLOSED | Accepted risk — no new packages |
| T-06-06-01 | Tampering | mitigate | CLOSED | `TorreClassificacaoSection.tsx:68` — `}, []) // eslint-disable-line react-hooks/exhaustive-deps`; store outside deps |
| T-06-06-02 | Information Disclosure | accept | CLOSED | Accepted risk — tenant-namespaced sessionStorage; encryption-at-rest deferred to Phase 8 |
| T-06-06-03 | Tampering | mitigate | CLOSED | `TorreClassificacaoSection.tsx:14-18` — option values use slugs (`t360-a`, `t360-b`, `t360-c`, `t360-d`, `t360-e`); accented text only in `label` |
| T-06-06-SC | Tampering | accept | CLOSED | Accepted risk — no new packages |
| T-06-07-01 | DoS | accept | CLOSED | Accepted risk — ~5-10ms cost per tab mount; acceptable for pilot scale |
| T-06-07-02 | Tampering | mitigate | CLOSED | `useFormSection.ts:86` — `const formState = useFormState({ control: ... })` called unconditionally (line 86); not inside any if-block |
| T-06-07-03 | Information Disclosure | mitigate | CLOSED | `FormLayout.tsx:149-150` — cross-tenant guard `if (routeOrgId !== authOrgId) { return <Navigate to={/form/${authOrgId}}> }` fires before `renderSection`; tenantId derives only from validated routeOrgId |
| T-06-07-04 | Tampering | accept | CLOSED | Accepted risk — default case shows informative placeholder; Phase 7 replaces |
| T-06-07-SC | Tampering | accept | CLOSED | Accepted risk — no new packages |

---

## Unregistered Flags

None. No new attack surface detected outside the threat register.

---

## Accepted Risks Log

| Threat ID | Risk Description | Rationale |
|-----------|-----------------|-----------|
| T-06-01-03 | Hidden field value removed on unmount | Intentional: prevents stale hidden field data from being submitted |
| T-06-01-SC | npm package tampering | No new packages introduced in this phase |
| T-06-02-02 | sectionData in sessionStorage | Tenant-namespaced; same-user, same-tenant access is intentional |
| T-06-02-04 | Partial type cast for defaultValues | Zod re-validates on onBlur; cast is structurally necessary |
| T-06-02-SC | npm package tampering | No new packages introduced |
| T-06-03-SC | npm package tampering | No new packages introduced |
| T-06-04-01 | sectionData size growth with 60 fields | ~5KB typical vs 5MB quota; no practical risk at pilot scale |
| T-06-04-SC | npm package tampering | No new packages introduced |
| T-06-05-SC | npm package tampering | No new packages introduced |
| T-06-06-02 | `riscos` field may contain contract-sensitive data | Tenant-namespaced sessionStorage; encryption-at-rest evaluation deferred to Phase 8 |
| T-06-06-SC | npm package tampering | No new packages introduced |
| T-06-07-01 | Each tab switch mounts new Section with useForm | Expected behavior per D-01; ~5-10ms cost acceptable |
| T-06-07-04 | Default switch case exposes placeholder text | Informative placeholder only; no sensitive data; replaced in Phase 7 |
| T-06-07-SC | npm package tampering | No new packages introduced |
