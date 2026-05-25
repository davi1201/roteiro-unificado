---
phase: 08-autosave-submissao-versionamento
fixed_at: 2026-05-23T00:00:00Z
review_path: .planning/phases/08-autosave-submiss-o-versionamento/08-REVIEW.md
iteration: 1
findings_in_scope: 8
fixed: 8
skipped: 0
status: all_fixed
---

# Phase 08: Code Review Fix Report

**Fixed at:** 2026-05-23T00:00:00Z
**Source review:** .planning/phases/08-autosave-submiss-o-versionamento/08-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 8 (CR-01, CR-02, CR-03, CR-04, WR-01, WR-02, WR-03, WR-04)
- Fixed: 8
- Skipped: 0

## Fixed Issues

### CR-01: HistoryPage cross-tenant guard

**Files modified:** `roteiro-unificado/src/features/form/HistoryPage.tsx`
**Commit:** ac97a2c
**Applied fix:** Added `useAuth()` import and `currentOrgIdRef` guard at the top of `HistoryPage`. The component now checks `authLoading || !orgId || !authOrgId` (shows spinner) and `orgId !== authOrgId` (redirects to `/form/${authOrgId}/history`). The actual page content was extracted into an internal `HistoryPageContent` component that only renders after the guard passes. Also added `Navigate` and `Spinner` imports, and `useAuth` from the auth feature.

---

### CR-02: Null dereference crash in useSubmitAssessment

**Files modified:** `roteiro-unificado/src/features/form/useSubmitAssessment.ts`
**Commit:** a05c999
**Applied fix:** Switched `.single<{ version: number }>()` to `.maybeSingle<{ version: number }>()` so PGRST116 (no rows found) is not promoted to an error. Added explicit `if (!draft) throw new Error('Nenhum rascunho encontrado. Salve o formulário antes de enviar.')` guard after the fetchError check, preventing the `draft.version + 1` null dereference.

---

### CR-03: Broken CSS class concatenation in FormLayout

**Files modified:** `roteiro-unificado/src/features/form/FormLayout.tsx`
**Commit:** 3ac1663
**Applied fix:** Added a space before the conditional class in the `<main>` element's className template literal. Changed `` `flex-1 p-4 md:p-6${...}` `` to `` `flex-1 p-4 md:p-6 ${...}` ``. The NDA tab now correctly receives `pb-20` as a separate Tailwind class, preventing the sticky footer from covering NDA content.

---

### CR-04 + WR-01: storesByTenant never cleared on logout; unbounded subscriber accumulation

**Files modified:** `roteiro-unificado/src/stores/formStore.ts`, `roteiro-unificado/src/features/auth/AuthProvider.tsx`
**Commit:** f8fcdc8
**Applied fix:**

`formStore.ts`:
- Added `unsubscribeByTenant` Map alongside `storesByTenant` to store the sessionStorage subscriber's unsubscribe function per tenant.
- The subscriber's return value is now captured in `const unsubscribe = store.subscribe(...)` and stored in `unsubscribeByTenant`.
- Added `clearFormStore(tenantId)` export that: cancels the subscriber, removes entries from both Maps, and removes `localStorage`/`sessionStorage` keys for the tenant.

`AuthProvider.tsx`:
- Added `clearFormStore` import from `@/stores/formStore`.
- Added `currentOrgIdRef = useRef<string | null>(null)` to track orgId synchronously.
- The ref is updated alongside `setOrgId()` calls in `fetchOrgMember` (both success and error paths).
- In the `SIGNED_OUT` handler, `clearFormStore(currentOrgIdRef.current)` is called before nulling state, preventing cross-user data leakage.

---

### WR-02: Incomplete useToast mock in useAutosave.test.ts

**Files modified:** `roteiro-unificado/src/hooks/useAutosave.test.ts`
**Commit:** f1cb18e
**Applied fix:** Expanded the `useToast` mock to include `error`, `info`, `loading`, `promise`, and `dismiss` alongside the existing `success` and `warning`. Added `mockError` and `mockInfo` as named `vi.fn()` constants (matching the pattern of `mockSuccess`/`mockWarning`) and cleared them in `beforeEach`.

---

### WR-03: useNewRevision missing success toast

**Files modified:** `roteiro-unificado/src/features/form/useNewRevision.ts`
**Commit:** 8103af6
**Applied fix:** Added `toast.success('Nova revisão iniciada — continue preenchendo o formulário.')` in the `onSuccess` handler before the `navigate()` call. The `toast` variable was already imported and used in `onError`; this completes parity with `useSubmitAssessment`.

---

### WR-04: Dialog does not close on submit success

**Files modified:** `roteiro-unificado/src/features/form/FormLayout.tsx`
**Commit:** 193ee50
**Applied fix:** Changed the "Confirmar Envio" button's `onClick` from `() => submitMutation.mutate()` to pass an inline `onSuccess` callback: `submitMutation.mutate(undefined, { onSuccess: () => setIsSubmitOpen(false) })`. This ensures the dialog closes immediately on successful submission, eliminating the double-submit window if navigation is delayed.

---

_Fixed: 2026-05-23T00:00:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
