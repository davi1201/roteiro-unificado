---
phase: "06"
slug: campos-do-formul-rio-torre-360
status: verified
threats_open: 0
asvs_level: 1
created: 2026-05-24
---

# Phase 06 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Usuário (browser) → React state | Inputs via Controller/onChange; stay in memory/Zustand until Phase 8 syncs to Supabase | Form field values (non-PII in this phase) |
| ConditionalField → RHF internals | unregisterFn called only on condition change; controlled by Section parent | Field value removed on hide |
| Zustand sectionData → sessionStorage | Serialized to `form-data-${tenantId}`; tenant-isolated | Partial form data |
| URL hash → activeTab → renderSection | Invalid hash falls back to TabKey.Identificacao; switch has default for unimplemented tabs | Tab key only |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-06-01-01 | Tampering | RadioGroupField buttons | mitigate | `radio-group-field.tsx:42` — `type="button"` on every `<button>` | closed |
| T-06-01-02 | Tampering | CheckboxGroupField array | mitigate | `checkbox-group-field.tsx:56-60` — single Controller; onChange recalculates from field.value | closed |
| T-06-01-03 | Information Disclosure | ConditionalField unregister | accept | Intentional: `conditional-field.tsx:18` — `unregisterFn(fieldName, { keepValue: false })` | closed |
| T-06-01-04 | Tampering | Field components XSS | mitigate | No `dangerouslySetInnerHTML` in any field component; labels from code-only options[].label | closed |
| T-06-01-SC | Tampering | npm packages | accept | No new packages installed this phase | closed |
| T-06-02-01 | Tampering | CNPJ mask | mitigate | `identificacao.ts:8` — Zod regex `/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/` | closed |
| T-06-02-02 | Information Disclosure | sectionData in sessionStorage | accept | `formStore.ts:175` — `form-data-${tenantId}` key; same-user/same-tenant intentional | closed |
| T-06-02-03 | Tampering | watch+useEffect loop | mitigate | `IdentificacaoSection.tsx:44` — empty deps `[]`; store not in deps; eslint-disable documented | closed |
| T-06-02-04 | Validation bypass | defaultValues cast | accept | Necessary cast; Zod re-validates on subsequent onBlur | closed |
| T-06-02-SC | Tampering | npm packages | accept | No new packages | closed |
| T-06-03-01 | Tampering | qualBI survives existeBI change | mitigate | `TorreDecisaoSection.tsx:132-147` — unregisterFn on ConditionalField; `torre-decisao.ts:39` qualBI optional() | closed |
| T-06-03-02 | Tampering | watch+useEffect loop | mitigate | `TorreDecisaoSection.tsx:92` — empty deps `[]`; store outside deps | closed |
| T-06-03-03 | Information Disclosure | Slugs vs accented labels | mitigate | `TorreDecisaoSection.tsx:35-39` — option values are slugs; accented text in label only | closed |
| T-06-03-SC | Tampering | npm packages | accept | No new packages | closed |
| T-06-04-01 | DoS | sectionData 60 fields | accept | ~5KB typical vs 5MB quota; no practical risk | closed |
| T-06-04-02 | Tampering | watch+useEffect loop | mitigate | `TorreSiengeSection.tsx:71` — empty deps `[]`; store outside deps | closed |
| T-06-04-03 | Information Disclosure | Cross-tenant sectionData | mitigate | `TorreSiengeSection.tsx:52` — useFormStore(tenantId); sessionStorage key `form-data-${tenantId}` | closed |
| T-06-04-04 | Tampering | Type unsafety errors.modules | mitigate | `TorreSiengeSection.tsx:45` — controlled local cast `Record<SiengeModuleSlug, Record<string, { message?: string }>>` | closed |
| T-06-04-SC | Tampering | npm packages | accept | No new packages | closed |
| T-06-05-01 | Tampering | watch+useEffect loop | mitigate | `TorreAcessoSection.tsx:86` — empty deps `[]`; store outside deps | closed |
| T-06-05-02 | Information Disclosure | restricoesSeguranca sensitive data | mitigate | Flows through watch subscription → sessionStorage at `form-data-${tenantId}`; server encryption deferred to Phase 8 | closed |
| T-06-05-03 | Tampering | Slugs vs accented labels | mitigate | `TorreAcessoSection.tsx:11-14` — slugs (`nuvem-data-center`); accented text in label only | closed |
| T-06-05-SC | Tampering | npm packages | accept | No new packages | closed |
| T-06-06-01 | Tampering | watch+useEffect loop | mitigate | `TorreClassificacaoSection.tsx:68` — empty deps `[]`; store outside deps | closed |
| T-06-06-02 | Information Disclosure | riscos field contract data | accept | Tenant-namespaced sessionStorage; encryption-at-rest evaluation deferred to Phase 8 | closed |
| T-06-06-03 | Tampering | Slugs vs labels | mitigate | `TorreClassificacaoSection.tsx:14-18` — slugs (`t360-a` through `t360-e`); accented text in label only | closed |
| T-06-06-SC | Tampering | npm packages | accept | No new packages | closed |
| T-06-07-01 | DoS | Tab switch mounts new useForm | accept | Expected D-01 behavior; ~5-10ms cost; acceptable for pilot | closed |
| T-06-07-02 | Tampering | Conditional hook call in useFormSection | mitigate | `useFormSection.ts:86` — useFormState called unconditionally at top level via sub-hook pattern | closed |
| T-06-07-03 | Information Disclosure | Cross-tenant in renderSection | mitigate | `FormLayout.tsx:149-150` — routeOrgId !== authOrgId guard fires before renderSection; tenantId from guard-validated routeOrgId only | closed |
| T-06-07-04 | Tampering | Phase 7 placeholder tabs | accept | Placeholder text only; no sensitive data; replaced in Phase 7 | closed |
| T-06-07-SC | Tampering | npm packages | accept | No new packages | closed |

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-06-01 | T-06-01-03 | ConditionalField unregister is intentional design (FORM-06) — removes stale hidden field values | Davi Alves | 2026-05-24 |
| AR-06-02 | T-06-02-02 | sessionStorage sectionData same-user/same-tenant sharing is intended draft-resume behavior | Davi Alves | 2026-05-24 |
| AR-06-03 | T-06-02-04 | defaultValues cast necessary; Zod re-validates on onBlur; values originated from same schema | Davi Alves | 2026-05-24 |
| AR-06-04 | T-06-04-01 | ~5KB JSON vs 5MB sessionStorage quota; no practical DoS risk at pilot scale | Davi Alves | 2026-05-24 |
| AR-06-05 | T-06-06-02 | restricoesSeguranca / riscos fields: encryption-at-rest scoped to Phase 8 (Supabase RLS + storage) | Davi Alves | 2026-05-24 |
| AR-06-06 | T-06-07-01 | useForm per tab mount (~5-10ms) acceptable for 5-construtora pilot; revisit at scale | Davi Alves | 2026-05-24 |
| AR-06-07 | T-06-07-04 | Phase 7 placeholder tabs expose no data; replaced when Phase 7 executes | Davi Alves | 2026-05-24 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-05-24 | 32 | 32 | 0 | gsd-security-auditor (sonnet) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-05-24
