---
phase: 07-campos-habilita-es-nda-classifica-o-g1-g5
reviewed: 2026-05-24T00:00:00Z
depth: standard
files_reviewed: 16
files_reviewed_list:
  - roteiro-unificado/src/components/ui/input-field.tsx
  - roteiro-unificado/src/constants/nda-text.ts
  - roteiro-unificado/src/lib/readiness.ts
  - roteiro-unificado/src/components/ui/index.ts
  - roteiro-unificado/src/schemas/hab-venda.ts
  - roteiro-unificado/src/schemas/hab-repositorios.ts
  - roteiro-unificado/src/schemas/hab-responsaveis.ts
  - roteiro-unificado/src/schemas/hab-classificacao.ts
  - roteiro-unificado/src/schemas/nda.ts
  - roteiro-unificado/src/features/form/sections/HabVendaSection.tsx
  - roteiro-unificado/src/features/form/sections/HabRepositoriosSection.tsx
  - roteiro-unificado/src/features/form/sections/HabResponsaveisSection.tsx
  - roteiro-unificado/src/features/form/sections/HabClassificacaoSection.tsx
  - roteiro-unificado/src/features/form/sections/NdaSection.tsx
  - roteiro-unificado/src/features/form/ReadinessClassification.tsx
  - roteiro-unificado/src/features/form/FormLayout.tsx
findings:
  critical: 3
  warning: 4
  info: 2
  total: 9
status: issues_found
---

# Phase 07: Code Review Report

**Reviewed:** 2026-05-24
**Depth:** standard
**Files Reviewed:** 16
**Status:** issues_found

## Summary

Phase 7 delivers the four Habilitações section forms (Venda, Repositórios, Responsáveis, Classificação), the NDA section with the only mandatory field in the entire form, the `ReadinessClassification` display component, `FormLayout` integration, and supporting schemas/library code.

The schema and readiness-engine code is clean and well-structured. The section components follow a consistent pattern (RHF + zodResolver + Zustand subscription). Three critical defects were found: error messages render twice for every `InputField` due to a bug in the `Input` + `InputField` composition; `NdaSection`'s submit button in `FormLayout` never calls `handleSubmit` so `aceitaTermos` (the only required field) is never validated before submission; and `dataAceite` is unconditionally overwritten to today's date on every mount, corrupting the recorded NDA acceptance date when a draft is resumed. Four warnings cover stale closure risks in the `watch` subscriptions, missing CPF format validation, a `useFormStore` call that violates the documented "no React subscription outside mount" guideline in `hydrateFromAssessment`, and the `as never` cast suppressing a type error in `useSubmitAssessment`.

---

## Critical Issues

### CR-01: Double error message rendered for every InputField

**File:** `roteiro-unificado/src/components/ui/input-field.tsx:37-42`

**Issue:** `InputField` passes `errorMessage={error}` to the `Input` primitive (line 38), which renders its own `<p className="text-g1 text-xs">{errorMessage}</p>` when `error && errorMessage` is truthy (see `input.tsx:24`). Then `InputField` also renders a second identical `<p>` at line 42. The result is that every field using `InputField` with an error shows the same error text twice. In `HabRepositoriosSection`, all 14 `responsavelInterno` fields use `InputField` — every one will double-render its error. The same applies to the four identification fields in `NdaSection`.

**Fix:** Remove the duplicate `<p>` at line 42 of `input-field.tsx` and rely solely on the one rendered by `Input`:

```tsx
// input-field.tsx — remove lines 42-43 entirely
// Delete:
{error && <p className="text-g1 text-xs">{error}</p>}
```

Alternatively, pass `error={false}` (or omit `errorMessage`) to `Input` and keep only the `InputField`-level `<p>`. Whichever you choose, there must be exactly one rendering path.

---

### CR-02: NDA acceptance is never validated before form submission

**File:** `roteiro-unificado/src/features/form/FormLayout.tsx:242-249`

**Issue:** The "Confirmar Envio" button calls `submitMutation.mutate(undefined, ...)` directly without triggering RHF's `handleSubmit` in `NdaSection`. Because each section manages its own isolated `useForm` instance, the submit flow in `FormLayout` has no access to `NdaSection`'s form state or its `trigger()`/`handleSubmit()`. This means a user can click "Enviar Avaliação" without ever checking the `aceitaTermos` checkbox, bypassing the only required field in the entire form. The Zod schema's `z.literal(true)` constraint and the error display in `NdaSection` are entirely inert at submission time — they only fire if the user interacts with the checkbox and then blurs away from it (due to `mode: 'onBlur'`).

**Fix (minimal):** Before opening the submit dialog (or inside `submitMutation.mutationFn`), read `aceitaTermos` directly from the store and block submission if it is not `true`:

```tsx
// In FormLayout, replace the onClick for "Enviar Avaliação":
onClick={() => {
  const ndaData = store.sectionData[TabKey.Nda]
  if (ndaData?.aceitaTermos !== true) {
    toast.error('Você deve aceitar os termos do NDA para continuar')
    store.setActiveTab(TabKey.Nda)
    return
  }
  setIsSubmitOpen(true)
}}
```

A more robust fix is to validate the full NDA section with `ndaSchema.safeParse(ndaData)` and surface its errors before permitting submission.

---

### CR-03: `dataAceite` is always overwritten to today on every mount, corrupting the recorded NDA date

**File:** `roteiro-unificado/src/features/form/sections/NdaSection.tsx:24-27`

**Issue:** The `defaultValues` object spreads `store.sectionData[TabKey.Nda]` first, but then unconditionally overwrites `dataAceite` with `new Date().toLocaleDateString('pt-BR')` regardless of whether a date was already saved. When a user:
1. Opens the NDA tab on Day 1, accepts the terms, and saves a draft;
2. Returns on Day 2 and the draft is hydrated from Supabase;

…the NDA section will display today's date (Day 2), not the original acceptance date (Day 1), and the watch subscription will sync the corrupted date back into the store and into the next autosave. The NDA clause 11 specifically uses "na data de aceite registrada" — recording the wrong date is a legal integrity issue for the document.

**Fix:** Only use today's date when no date has already been stored:

```tsx
defaultValues: {
  ...(store.sectionData[TabKey.Nda] ?? {}),
  dataAceite:
    (store.sectionData[TabKey.Nda]?.dataAceite as string | undefined) ??
    new Date().toLocaleDateString('pt-BR'),
  aceitaTermos:
    (store.sectionData[TabKey.Nda]?.aceitaTermos as boolean | undefined) ?? false,
} as Partial<NdaData>,
```

---

## Warnings

### WR-01: Stale `store` reference in `watch` subscription closure across all four section components

**File:** `roteiro-unificado/src/features/form/sections/HabVendaSection.tsx:86-91` (and identically in `HabRepositoriosSection.tsx:75-80`, `HabResponsaveisSection.tsx:77-82`, `HabClassificacaoSection.tsx:65-70`, `NdaSection.tsx:35-40`)

**Issue:** The `useEffect` captures `store` in its closure at mount time and never re-subscribes when `store` changes (the dependency array is intentionally `[]` with a suppression comment). `useFormStore(tenantId)` returns a new `store` object on every render because `useStore` re-subscribes on each call. In the common case where `tenantId` is stable, the Zustand selector returns the same store instance and there is no bug. However, if the store instance is ever replaced (e.g., via `clearFormStore` followed by a re-render while the component is still mounted), the closure will call `store.updateSection` on the stale/cleared instance, silently discarding form data.

The suppression comment acknowledges the trade-off but does not document the failure mode. At minimum this should be documented; ideally `store` should be captured by a stable ref:

```tsx
const storeRef = useRef(store)
useEffect(() => { storeRef.current = store }, [store])

useEffect(() => {
  const subscription = watch((values) => {
    storeRef.current.updateSection(TabKey.HabVenda, values as Record<string, unknown>)
  })
  return () => subscription.unsubscribe()
}, [watch]) // watch is stable after mount
```

---

### WR-02: CPF field accepts any string — no format validation

**File:** `roteiro-unificado/src/schemas/nda.ts:27`

**Issue:** `cpf: z.string().optional()` imposes no format constraint. A user can type "abc", "123", or any garbage string and the form will accept it. The field placeholder shows "000.000.000-00" suggesting a specific format is expected. Because the CPF is part of the NDA representation (clause 11: "partes identificadas neste formulário"), storing an invalid CPF may create a legally ambiguous record.

**Fix:** Add a regex refinement for CPF format (not digit validation, just format):

```ts
cpf: z
  .string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve estar no formato 000.000.000-00')
  .optional(),
```

---

### WR-03: `updateSection` replaces the entire section object; partial watch values from RHF overwrite existing hydrated data

**File:** `roteiro-unificado/src/features/form/sections/HabVendaSection.tsx:87-89` (and equivalent sections)

**Issue:** `watch((values) => ...)` in RHF returns the current form state as a partial snapshot — fields that have never been touched may be `undefined`. When the Zustand store is hydrated from Supabase (e.g., 50 fields filled), and the user opens the section form, `watch` fires immediately with the current form values. If `defaultValues` was correctly populated from the store, this is harmless. But `updateSection` replaces `sectionData[tab]` entirely with whatever `watch` returns. If `watch` fires before RHF has finished initialising the nested `scenarios`/`documents`/`responsibilities` objects, it can overwrite the hydrated data with a shallower object, dropping nested section keys.

This is a timing-dependent data-loss risk. The scenario: hydrate from Supabase → `hydrateFromAssessment` sets `sectionData[HabVenda]` → RHF mounts with `defaultValues` from store (correct) → first `watch` callback fires with partial values → `updateSection` writes back a shallower object → Supabase autosave persists the shallower object, discarding previously filled fields.

**Fix:** In the `updateSection` action in `formStore.ts`, merge incoming data with existing section data rather than replacing:

```ts
updateSection: (tab, data) =>
  set((state) => ({
    sectionData: {
      ...state.sectionData,
      [tab]: { ...(state.sectionData[tab] ?? {}), ...data },
    },
  })),
```

---

### WR-04: `as never` cast in `useSubmitAssessment` suppresses a type error on the `update` payload

**File:** `roteiro-unificado/src/features/form/useSubmitAssessment.ts:28-32`

**Issue:** The Supabase `.update({ ... } as never)` cast is used to silence a TypeScript type error. This means the type-checker cannot verify that the update payload matches the `assessments` table column types. If the `database.ts` types change (e.g., `submitted_at` becomes non-nullable or is renamed), the cast will hide the mismatch until runtime. This pattern is equivalent to using `as any` for Supabase client calls.

**Fix:** Either correct the payload to satisfy the generated Supabase types, or use a properly typed assertion:

```ts
const { error } = await supabase
  .from('assessments')
  .update({
    status: 'submitted' as const,
    submitted_at: new Date().toISOString(),
    version: draft.version + 1,
  })
  .eq('org_id', orgId)
  .eq('status', 'draft')
```

If the type error persists, the generated database types should be updated to reflect the actual schema rather than suppressed.

---

## Info

### IN-01: Array index used as React key for NDA text paragraphs

**File:** `roteiro-unificado/src/features/form/sections/NdaSection.tsx:47`

**Issue:** `key={i}` is used to render `NDA_TEXT` paragraphs. Because `NDA_TEXT` is a `const` array that never reorders or changes length at runtime, this is not a practical bug — React will never have diffing issues here. However, it is a lint warning target and contradicts the general recommendation to avoid index keys.

**Fix:** Use the first 20 characters of each paragraph as a stable key, or simply use the index with a comment acknowledging the immutability:

```tsx
{NDA_TEXT.map((paragraph, i) => (
  // NDA_TEXT is a static const — index key is safe here
  <p key={i} className="mb-3 text-gray-700 last:mb-0">
```

Or, more robustly:

```tsx
{NDA_TEXT.map((paragraph) => (
  <p key={paragraph.slice(0, 30)} className="mb-3 text-gray-700 last:mb-0">
```

---

### IN-02: `readiness.ts` maps are re-created on every call — minor initialisation cost in hot path

**File:** `roteiro-unificado/src/lib/readiness.ts:43-58`

**Issue:** `gerencialMap` and `habMap` are object literals declared inside `calculateReadiness`, which is called on every `sectionData` change via `useMemo` in `ReadinessClassification`. While V8 optimises this well, declaring them as module-level constants would be more idiomatic and makes the intent (these are static lookup tables, not computed values) immediately clear.

**Fix:**

```ts
// Module-level constants — move outside calculateReadiness()
const GERENCIAL_MAP: Record<string, ReadinessResult['gerencial']> = {
  g1: 'G1', g2: 'G2', g3: 'G3', g4: 'G4', g5: 'G5',
}
const HAB_MAP: Record<string, ReadinessResult['habilitacoes']> = {
  'hab-a': 'HAB-A', 'hab-b': 'HAB-B', 'hab-c': 'HAB-C', 'hab-d': 'HAB-D', 'hab-e': 'HAB-E',
}
```

---

_Reviewed: 2026-05-24_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
