---
phase: 10-exportacao-pdf
reviewed: 2026-05-25T18:36:06Z
depth: standard
files_reviewed: 19
files_reviewed_list:
  - roteiro-unificado/package.json
  - roteiro-unificado/src/features/form/ExportPdfButton.test.tsx
  - roteiro-unificado/src/features/form/ExportPdfButton.tsx
  - roteiro-unificado/src/features/form/HistoryPage.tsx
  - roteiro-unificado/src/features/form/useOrgInfo.ts
  - roteiro-unificado/src/lib/pdf/PDFCoverPage.tsx
  - roteiro-unificado/src/lib/pdf/PDFDocument.test.tsx
  - roteiro-unificado/src/lib/pdf/PDFDocument.tsx
  - roteiro-unificado/src/lib/pdf/PDFFieldRow.tsx
  - roteiro-unificado/src/lib/pdf/PDFFooter.tsx
  - roteiro-unificado/src/lib/pdf/PDFSectionFinal.tsx
  - roteiro-unificado/src/lib/pdf/PDFSectionHabilitacoes.tsx
  - roteiro-unificado/src/lib/pdf/PDFSectionHeader.tsx
  - roteiro-unificado/src/lib/pdf/PDFSectionTorre360.tsx
  - roteiro-unificado/src/lib/pdf/fieldMaps.ts
  - roteiro-unificado/src/lib/pdf/index.test.ts
  - roteiro-unificado/src/lib/pdf/index.ts
  - roteiro-unificado/src/lib/pdf/styles.ts
  - roteiro-unificado/src/lib/pdf/types.ts
findings:
  critical: 1
  warning: 4
  info: 3
  total: 8
status: issues_found
---

# Phase 10: Code Review Report

**Reviewed:** 2026-05-25T18:36:06Z
**Depth:** standard
**Files Reviewed:** 19
**Status:** issues_found

## Summary

The PDF export chunk is well-structured: dynamic import isolation is enforced (no static imports of `@/lib/pdf` found in production code), the Supabase client correctly uses the anon key so RLS applies, and the component decomposition follows `@react-pdf/renderer` conventions (no React hooks inside PDF components). The primary areas of concern are a rendering correctness bug for boolean field values, an inconsistency in how `readiness_level_mgmt` is sourced for the PDF, a memory-management gap when the popup is blocked, and several smaller quality issues.

---

## Critical Issues

### CR-01: Boolean field values render as raw `"true"` in the PDF

**File:** `roteiro-unificado/src/lib/pdf/PDFFieldRow.tsx:16`

**Issue:** `PDFFieldRow` converts every non-empty value to a string via `String(value)`. The NDA schema stores `aceitaTermos` as a `z.literal(true)` boolean. When that `true` value reaches `PDFFieldRow`, it is displayed as the string `"true"` instead of a human-readable label such as `"Sim"`. The `FIELD_MAPS` entry for `aceitaTermos` has the label `"Aceita os Termos do NDA"`, but the value column of a signed NDA reading `"true"` is a correctness failure in a document that may serve as a legal/compliance artifact.

Any other boolean-typed field added in the future will silently exhibit the same defect.

**Fix:** Add a boolean branch before the generic `String()` call:

```tsx
export function PDFFieldRow({ label, value }: PDFFieldRowProps) {
  const isEmpty = value === undefined || value === null || value === ''
  let display: string
  if (isEmpty) {
    display = '—'
  } else if (typeof value === 'boolean') {
    display = value ? 'Sim' : 'Não'
  } else if (Array.isArray(value)) {
    display = value.join(', ') || '—'
  } else {
    display = String(value)
  }

  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={isEmpty ? styles.fieldEmpty : styles.fieldValue}>{display}</Text>
    </View>
  )
}
```

---

## Warnings

### WR-01: `readiness_level_mgmt` is fetched from DB but never used — `grade` is taken from stale caller prop

**File:** `roteiro-unificado/src/lib/pdf/index.ts:25,38`

**Issue:** The Supabase query at line 25 selects `readiness_level_mgmt` alongside `readiness_level_tech`. However, only `readiness_level_tech` is mapped into `pdfData` (line 39 via `data.readiness_level_tech ?? null`). The `grade` field in `pdfData` is sourced exclusively from `opts.grade` (line 38), which is passed by the HistoryPage at render time.

This creates an asymmetry: `gradeTech` is always fresh from the database, while `grade` (the primary G1-G5 classification displayed prominently on the cover and final page) is the value that was in the React state when the user clicked the button — potentially stale if the assessment was modified between the page load and the click. Additionally, the selected `readiness_level_mgmt` column is dead weight in the query.

**Fix:** Use the database value for both grades, keeping the caller prop as a fallback:

```ts
const pdfData: AssessmentPDFData = {
  orgName: opts.orgName,
  cnpj: opts.cnpj,
  version: opts.version,
  grade: (data.readiness_level_mgmt as string | null) ?? opts.grade,
  gradeTech: data.readiness_level_tech ?? null,
  generatedAt: new Date(),
  formData: (data.form_data as Record<string, unknown>) ?? {},
}
```

---

### WR-02: Blob URL is never revoked when `window.open` returns `null` (popup blocked)

**File:** `roteiro-unificado/src/lib/pdf/index.ts:52-54`

**Issue:** `window.open` returns `null` when the browser blocks the popup (common in Firefox and Safari with strict settings). The current code does not check the return value. When the window is null, the user receives no feedback that the PDF is inaccessible, and the blob URL still persists in memory for 60 seconds. More importantly, the user has no way to retrieve the PDF — the generated blob is lost after revocation and there is no download fallback.

**Fix:** Check the return value of `window.open` and fall back to a direct `<a>` download if the popup is blocked:

```ts
const url = URL.createObjectURL(blob)
const newWindow = window.open(url, '_blank')

if (!newWindow) {
  // Popup blocked — trigger download instead
  const a = document.createElement('a')
  a.href = url
  a.download = `relatorio-v${opts.version}.pdf`
  a.click()
}

setTimeout(() => URL.revokeObjectURL(url), 60_000)
```

---

### WR-03: Defense-in-depth `org_id` filter absent in `generateAndOpenPDF` compared to `useAssessmentHistory`

**File:** `roteiro-unificado/src/lib/pdf/index.ts:23-27`

**Issue:** `useAssessmentHistory` in `HistoryPage.tsx` (line 33) applies both `.eq('org_id', orgId)` **and** relies on RLS. By contrast, `generateAndOpenPDF` relies solely on RLS with only `.eq('id', opts.assessmentId)`. The code comment explicitly states that RLS is the sole guard ("sem necessidade de filtro adicional").

This is architecturally acceptable because the anon Supabase client enforces RLS. However, if RLS policies are ever loosened during development/migration, or if the client is accidentally switched to a service-role key, cross-tenant data exposure becomes possible. The inconsistency between the two query patterns also makes audits harder.

**Fix:** Add a defence-in-depth `org_id` filter. This requires passing `orgId` through `GeneratePDFOptions`:

```ts
// In types.ts — add orgId to GeneratePDFOptions
orgId: string   // Added field

// In index.ts — add to the query chain
.eq('id', opts.assessmentId)
.eq('org_id', opts.orgId)   // Defence-in-depth: mirrors useAssessmentHistory

// In HistoryPage.tsx — pass orgId to ExportPdfButton and propagate to generateAndOpenPDF
<ExportPdfButton orgId={orgId} assessmentId={row.id} ... />
```

---

### WR-04: `useOrgInfo` hook silently discards query errors — PDF exports with `orgName='—'` on auth/network failure

**File:** `roteiro-unificado/src/features/form/useOrgInfo.ts:11-24`

**Issue:** The `useQuery` call in `useOrgInfo` does not expose the `isError` or `error` state to callers. `HistoryPage.tsx` (line 78) destructures only `{ orgName, cnpj }`, and line 199 applies a `?? '—'` fallback. If the `orgs` query fails due to a network error or a RLS misconfiguration, the PDF cover page silently shows `—` as the organisation name. In a compliance document, a blank org name is a silent data quality failure with no user notification.

**Fix:** Expose `isError` from the hook and surface an error toast or warning in `HistoryPage` before allowing export:

```ts
// useOrgInfo.ts — expose error state
export function useOrgInfo(orgId: string | undefined) {
  const { data, isLoading, isError } = useQuery({ ... })
  return {
    orgName: data?.name,
    cnpj: data?.cnpj ?? null,
    isLoading,
    isError,
  }
}

// HistoryPage.tsx — guard the export button
const { orgName, cnpj, isError: orgInfoError } = useOrgInfo(orgId)
// Disable ExportPdfButton or show warning when orgInfoError is true
```

---

## Info

### IN-01: Dead code — `coverPage`, `coverBrand`, `coverOrgName`, `coverMeta` styles in `styles.ts` are never referenced

**File:** `roteiro-unificado/src/lib/pdf/styles.ts:55-80`

**Issue:** The shared `styles` object in `styles.ts` defines five cover-page style keys (`coverPage`, `coverBrand`, `coverBrandAccent`, `coverOrgName`, `coverMeta`). None of these are imported or referenced anywhere — `PDFCoverPage.tsx` defines its own local `coverStyles` via a separate `StyleSheet.create()` call and uses those exclusively. The dead styles add noise and may cause future confusion about which style object is authoritative for the cover page.

**Fix:** Remove the five unused cover style entries from `styles.ts`. If the intent was to centralise all styles, migrate `PDFCoverPage.tsx`'s local `coverStyles` into `styles.ts` and import from there.

---

### IN-02: `getField` utility function is copy-pasted verbatim in two files

**Files:**
- `roteiro-unificado/src/lib/pdf/PDFSectionTorre360.tsx:38-42`
- `roteiro-unificado/src/lib/pdf/PDFSectionHabilitacoes.tsx:17-21`

**Issue:** The `getField` helper (3 lines, identical implementation) is defined independently in both section files. Any change to the safe-access logic must be applied twice. Extract to a shared location.

**Fix:** Create `roteiro-unificado/src/lib/pdf/utils.ts` (or add to `fieldMaps.ts`) and export one canonical `getField`:

```ts
// utils.ts
export function getField(
  formData: Record<string, unknown>,
  tabKey: string,
  fieldKey: string
): unknown {
  const tab = formData?.[tabKey]
  if (!tab || typeof tab !== 'object') return undefined
  return (tab as Record<string, unknown>)?.[fieldKey]
}
```

---

### IN-03: `vi.doMock` in `ExportPdfButton.test.tsx` `beforeEach` is dead code

**File:** `roteiro-unificado/src/features/form/ExportPdfButton.test.tsx:37-40`

**Issue:** The `beforeEach` block calls `vi.doMock('@/lib/pdf/index', ...)` to re-register the mock for each test. However, Vitest already has the module mock in place from the hoisted `vi.mock('@/lib/pdf/index', ...)` at line 11. Because `vi.mock` is hoisted and module resolution is cached, `vi.doMock` inside `beforeEach` has no observable effect — the dynamic `import('@/lib/pdf/index')` inside `handleExport` resolves from the `vi.mock` registration, not from `vi.doMock`. The redundant call misleads future maintainers into thinking per-test re-mocking is needed.

**Fix:** Remove the `vi.doMock` call from `beforeEach`. The `vi.clearAllMocks()` call already clears mock call history, which is the relevant reset.

---

_Reviewed: 2026-05-25T18:36:06Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
