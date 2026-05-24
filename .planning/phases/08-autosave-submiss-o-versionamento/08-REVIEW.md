---
phase: 08-autosave-submissao-versionamento
reviewed: 2026-05-23T00:00:00Z
depth: standard
files_reviewed: 15
files_reviewed_list:
  - roteiro-unificado/vitest.config.ts
  - roteiro-unificado/src/hooks/useAutosave.test.ts
  - roteiro-unificado/src/lib/readiness.test.ts
  - roteiro-unificado/src/features/form/useSubmitAssessment.test.ts
  - roteiro-unificado/src/features/form/useNewRevision.test.ts
  - roteiro-unificado/package.json
  - supabase/migrations/20260523000001_assessments_draft_unique.sql
  - roteiro-unificado/src/hooks/useAutosave.ts
  - roteiro-unificado/src/stores/formStore.test.ts
  - roteiro-unificado/src/stores/formStore.ts
  - roteiro-unificado/src/features/form/useSubmitAssessment.ts
  - roteiro-unificado/src/features/form/useNewRevision.ts
  - roteiro-unificado/src/features/form/HistoryPage.tsx
  - roteiro-unificado/src/features/form/FormLayout.tsx
  - roteiro-unificado/src/router.tsx
findings:
  critical: 4
  warning: 4
  info: 3
  total: 11
status: fixed
fixed_at: 2026-05-23T00:00:00Z
fixes_applied: 8
fixes_scope: critical+warning
---

# Phase 08: Code Review Report

**Reviewed:** 2026-05-23T00:00:00Z
**Depth:** standard
**Files Reviewed:** 15
**Status:** issues_found

## Summary

This phase implements autosave (debounce + SELECT/INSERT/UPDATE strategy), formal submission
(draft to submitted transition), revision versioning, history page, and the supporting SQL
migration. The architectural decisions are sound and well-documented: the SELECT+UPDATE/INSERT
pattern instead of upsert with a partial index is correct, the debounce cleanup is sound, and
the `storesByTenant` memoization is intentional.

However, four critical blockers were found: a null-dereference crash in `useSubmitAssessment`
when no draft exists, a missing cross-tenant authorization guard on `HistoryPage` that allows
any authenticated user to view another org's assessment history, a broken Tailwind class
concatenation that makes the NDA tab's sticky footer overlap page content, and a module-level
memory issue in `storesByTenant` that never clears on logout enabling cross-user data leakage.
Four warnings and three info items round out the findings.

---

## Critical Issues

### CR-01: `HistoryPage` has no cross-tenant guard — any authenticated user can view any org's history

**File:** `roteiro-unificado/src/features/form/HistoryPage.tsx:52-55`

**Issue:** `HistoryPage` extracts `orgId` from `useParams()` and uses it directly in the
`useAssessmentHistory` query without verifying it matches the authenticated user's `authOrgId`.
`FormLayout` has an explicit cross-tenant guard (comparing `routeOrgId !== authOrgId` and
redirecting, lines 149-151), but `HistoryPage` has none. The two routes are siblings in the
router, both children of `ProtectedRoute` which only checks authentication — not tenant identity.

An authenticated user of org `AAA` can navigate to `/form/BBB/history` and see org BBB's
complete assessment history. If RLS policies on the `assessments` table are not correctly
scoped to `auth.uid()` → `org_members.org_id`, this leaks data at the application layer.
Even if RLS blocks the DB query, the route is accepted without redirect, producing a confusing
empty state rather than an authorization error.

**Fix:**
```tsx
export function HistoryPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const { orgId: authOrgId, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Cross-tenant guard — mirrors FormLayout (Phase 5)
  if (authLoading || !orgId || !authOrgId) {
    return (
      <div className="bg-primary flex min-h-screen items-center justify-center">
        <Spinner size="lg" className="border-white border-t-transparent" />
      </div>
    )
  }

  if (orgId !== authOrgId) {
    return <Navigate to={`/form/${authOrgId}/history`} replace />
  }

  // ...rest of component unchanged
}
```

---

### CR-02: Null dereference crash in `useSubmitAssessment` when draft is not found

**File:** `roteiro-unificado/src/features/form/useSubmitAssessment.ts:14-29`

**Issue:** The SELECT uses `.single()` on line 19. Supabase's `.single()` returns
`{ data: null, error: { code: 'PGRST116' } }` when zero rows match. `if (fetchError) throw fetchError`
on line 21 catches that case and promotes it to a thrown exception, which routes to `onError`
with a generic "Erro ao enviar avaliação — tente novamente" message instead of explaining that
no draft exists.

More critically: `draft` is typed as `{ version: number } | null` by the Supabase client even
after the generic `<{ version: number }>` annotation. If RLS silently filters the row (returning
`data: null` without setting `error` — a known behavior in certain RLS configurations), the guard
`if (fetchError)` does not fire, `draft` is `null`, and `draft.version + 1` on line 29 throws
a runtime `TypeError: Cannot read properties of null (reading 'version')`. The mutation crashes
and the user sees the generic error toast with no indication of what happened.

**Fix:**
```typescript
const { data: draft, error: fetchError } = await supabase
  .from('assessments')
  .select('version')
  .eq('org_id', orgId)
  .eq('status', 'draft')
  .maybeSingle<{ version: number }>()  // does not error on no-rows

if (fetchError) throw fetchError
if (!draft) throw new Error('Nenhum rascunho encontrado. Salve o formulário antes de enviar.')

const { error } = await supabase
  .from('assessments')
  .update({
    status: 'submitted',
    submitted_at: new Date().toISOString(),
    version: draft.version + 1,
  } as never)
  .eq('org_id', orgId)
  .eq('status', 'draft')

if (error) throw error
```

---

### CR-03: Broken CSS class concatenation — sticky footer overlaps NDA tab content

**File:** `roteiro-unificado/src/features/form/FormLayout.tsx:186`

**Issue:** The template literal produces an invalid class name:

```tsx
<main className={`flex-1 p-4 md:p-6${store.activeTab === TabKey.Nda ? 'pb-20' : ''}`}>
```

When `activeTab === TabKey.Nda`, this evaluates to `"flex-1 p-4 md:p-6pb-20"`. The string
`md:p-6pb-20` is not a recognized Tailwind utility class — Tailwind does not generate styles
for it. The bottom padding of 80px (`pb-20`) intended to prevent the sticky footer from
covering the NDA content is never applied. The NDA checkbox and other bottom-of-form content
will be hidden behind the sticky "Enviar Avaliação" footer, making it inaccessible.

**Fix:**
```tsx
<main className={`flex-1 p-4 md:p-6 ${store.activeTab === TabKey.Nda ? 'pb-20' : ''}`}>
```
A space between `md:p-6` and the conditional class is all that is needed. Using `clsx` or
`tailwind-merge` (both already in `package.json`) would prevent this class of bug entirely.

---

### CR-04: Module-level `storesByTenant` Map is never cleared on logout — cross-user data leak

**File:** `roteiro-unificado/src/stores/formStore.ts:70`

**Issue:** `storesByTenant` is declared at module scope (line 70) and accumulates one
`StoreApi<FormStore>` entry per `tenantId` for the entire browser session. Nothing clears it
on sign-out. `AuthProvider.signOut()` calls `supabase.auth.signOut()` and that is all — no
store cleanup (see `AuthProvider.tsx:93-96`).

When user A signs out and user B signs in without a full page reload (a realistic scenario in
a SPA), `createFormStore(tenantId)` returns the in-memory store from user A's session if user
A and user B share the same `tenantId` (unlikely in production UUIDs, but likely in
dev/staging with fixed IDs). More practically, the `sessionStorage` key `form-data-${tenantId}`
and the `localStorage` key `form-progress-${tenantId}` are never removed on logout, so a
subsequent user on the same machine restores the previous user's form state.

**Fix:**
```typescript
// formStore.ts — add export:
export function clearFormStore(tenantId: string): void {
  storesByTenant.delete(tenantId)
  try {
    localStorage.removeItem(`form-progress-${tenantId}`)
    sessionStorage.removeItem(`form-data-${tenantId}`)
  } catch {}
}

// AuthProvider.tsx — call in SIGNED_OUT handler:
if (event === 'SIGNED_OUT' || !currentSession) {
  if (currentOrgIdRef.current) clearFormStore(currentOrgIdRef.current)
  setUser(null)
  setSession(null)
  setRole(null)
  setOrgId(null)
  setIsLoading(false)
}
```

---

## Warnings

### WR-01: `storesByTenant` never cleared also causes an unbounded memory accumulation

**File:** `roteiro-unificado/src/stores/formStore.ts:70`

**Issue:** Beyond the cross-user security concern (CR-04), the Map accumulates indefinitely.
Each entry holds a Zustand store with a `persist` middleware subscription and a `sessionStorage`
subscriber. In a long browser session — particularly if the router mounts `FormLayout` with
different `tenantId` values for any reason (route testing, admin viewing different orgs) —
the Map and all subscriptions grow without bound. The subscriber on line 183 is never
unsubscribed because `store.subscribe()` returns an unsubscribe function that is never called
for the sessionStorage subscriber (only for the autosave subscriber in `useAutosave.ts`).

**Fix:** Same `clearFormStore` function from CR-04, but also: store the sessionStorage
subscriber's unsubscribe and expose it through `clearFormStore`.

---

### WR-02: `useAutosave` mock in tests exposes incomplete `useToast` interface

**File:** `roteiro-unificado/src/hooks/useAutosave.test.ts:64-66`

**Issue:** The mock only exposes `{ success: mockSuccess, warning: mockWarning }`. The real
`useToast()` also exposes `error`, `info`, `loading`, `promise`, and `dismiss`. The current
`useAutosave.ts` uses only `warning` and `success`, so tests pass today. However, if a future
developer adds `toast.error()` or `toast.info()` inside `useAutosave`, calling those methods
on the incomplete mock will throw `TypeError: toast.X is not a function`, causing a misleading
failure instead of a meaningful assertion. The mock should match the full interface.

**Fix:**
```typescript
const mockError = vi.fn()
const mockInfo = vi.fn()

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    success: mockSuccess,
    warning: mockWarning,
    error: mockError,
    info: mockInfo,
    loading: vi.fn(),
    promise: vi.fn(),
    dismiss: vi.fn(),
  }),
}))
```

---

### WR-03: `useNewRevision` missing success toast — user gets no feedback before navigation

**File:** `roteiro-unificado/src/features/form/useNewRevision.ts:45-49`

**Issue:** The `onSuccess` handler navigates to `/form/${orgId}` immediately without any toast
confirmation. The `toast` variable is imported and used in `onError` but not `onSuccess`. When
the user clicks "Iniciar Nova Revisão", the page transitions with no feedback. If TanStack Query
takes time to invalidate and re-fetch the draft, the form will appear blank briefly — leaving
the user uncertain whether the action succeeded or whether the form reset intentionally.
`useSubmitAssessment.ts` (a parallel hook) does call `toast.success()` on success.

**Fix:**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['assessment', 'draft', orgId] })
  queryClient.invalidateQueries({ queryKey: ['assessments', orgId] })
  toast.success('Nova revisão iniciada — continue preenchendo o formulário.')
  navigate(`/form/${orgId}`, { replace: true })
},
```

---

### WR-04: Dialog does not close on submit success — double-submit risk if navigation is delayed

**File:** `roteiro-unificado/src/features/form/FormLayout.tsx:217` and `roteiro-unificado/src/features/form/useSubmitAssessment.ts:36-41`

**Issue:** On successful submission, `useSubmitAssessment.onSuccess` calls
`navigate('/form/${orgId}/history', { replace: true })`. Navigation unmounts `FormLayout`,
destroying the dialog — but only if navigation completes. If navigation is interrupted (a
router guard, a beforeunload handler, or any delay), the dialog remains open with
`submitMutation.isPending = false` and `isSubmitOpen = true`. The "Confirmar Envio" button
becomes clickable again. A second click re-runs `mutate()` on an already-submitted record.
`useSubmitAssessment` would then do `SELECT ... status='draft'` and find nothing, throwing
a `PGRST116` error (or the `maybeSingle` null path from CR-02's fix), which the `onError`
handler catches with the generic "Erro ao enviar" message — confusing the user.

`setIsSubmitOpen(false)` is never called in the success path; it only fires on the "Manter
Rascunho" button (line 233) and on the dialog's `onClose` prop.

**Fix:**
```tsx
// In FormLayout: pass the close callback to the mutation or handle it inline
onClick={() => {
  submitMutation.mutate(undefined, {
    onSuccess: () => setIsSubmitOpen(false),
  })
}}
```
Or refactor `useSubmitAssessment` to accept an `onSuccessCallback` param.

---

## Info

### IN-01: Three test files are empty stubs — `useSubmitAssessment`, `useNewRevision`, and `readiness` have zero coverage

**Files:**
- `roteiro-unificado/src/features/form/useSubmitAssessment.test.ts`
- `roteiro-unificado/src/features/form/useNewRevision.test.ts`
- `roteiro-unificado/src/lib/readiness.test.ts`

**Issue:** All three files contain only `it.todo()` declarations. The `calculateReadiness`
function is a pure function with no dependencies — trivial to test without mocks. The mutation
hooks have the exact behavior enumerated in the stubs (status change, version increment,
navigation, error toast) and a working mock pattern in `useAutosave.test.ts` to copy from.
The phase ships with the critical submission path having zero automated test coverage.

**Fix:** Implement `readiness.test.ts` first (pure function, fastest wins), then
`useSubmitAssessment.test.ts` following the `makeMockFrom` pattern in `useAutosave.test.ts`.

---

### IN-02: `as never` type assertions disable TypeScript checking on Supabase payloads

**Files:**
- `roteiro-unificado/src/features/form/useSubmitAssessment.ts:30`
- `roteiro-unificado/src/features/form/useNewRevision.ts:41`

**Issue:** Both hooks use `as never` to silence TypeScript type errors on the `.update()`
and `.insert()` payload objects. This is the most aggressive type cast available — it converts
any type to `never`, completely disabling type checking at that call site. A misspelled column
name or a type mismatch (e.g., passing a `string` to a `number` column) will compile without
warning. `useAutosave.ts` handles this correctly using `AssessmentUpdate` and `AssessmentInsert`
typed imports from `@/types/database` (lines 8-9), which is the pattern to follow.

**Fix:**
```typescript
import type { Database } from '@/types/database'
type AssessmentUpdate = Database['public']['Tables']['assessments']['Update']

// In useSubmitAssessment:
.update({
  status: 'submitted',
  submitted_at: new Date().toISOString(),
  version: draft.version + 1,
} satisfies Partial<AssessmentUpdate>)
```

---

### IN-03: Migration SQL comment contradicts the current implementation

**File:** `supabase/migrations/20260523000001_assessments_draft_unique.sql:17-19`

**Issue:** Lines 17-19 of the migration comment say: "O hook useAutosave usa
`onConflict: 'org_id,status'` no upsert do Supabase." The current `useAutosave.ts`
implementation was refactored away from upsert precisely to avoid this (the `onConflict`
pattern with a partial index caused error `42P10`). The comment describing the reason for
the index now describes a usage pattern that no longer exists in the code, misleading any
developer who reads the migration to understand the system.

**Fix:** Update the migration comment to reflect that the index serves as a data integrity
constraint (preventing two simultaneous drafts) and that the application uses
SELECT+UPDATE/INSERT instead of upsert.

---

_Reviewed: 2026-05-23T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
