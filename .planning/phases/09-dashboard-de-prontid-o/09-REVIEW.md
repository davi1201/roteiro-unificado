---
phase: 09-dashboard-de-prontidao
reviewed: 2026-05-24T00:00:00Z
depth: standard
files_reviewed: 14
files_reviewed_list:
  - roteiro-unificado/src/components/admin/AssessmentSection.tsx
  - roteiro-unificado/src/components/admin/CompanyCard.tsx
  - roteiro-unificado/src/features/admin/useOrgsWithReadiness.ts
  - roteiro-unificado/src/features/form/CompanyDashboard.tsx
  - roteiro-unificado/src/features/form/SectionProgress.tsx
  - roteiro-unificado/src/lib/sectionStatus.ts
  - roteiro-unificado/src/pages/admin/AdminDashboard.tsx
  - roteiro-unificado/src/pages/admin/OrgDetail.tsx
  - roteiro-unificado/src/router.tsx
  - roteiro-unificado/src/components/admin/CompanyCard.test.tsx
  - roteiro-unificado/src/features/admin/useOrgsWithReadiness.test.ts
  - roteiro-unificado/src/features/form/CompanyDashboard.test.tsx
  - roteiro-unificado/src/lib/sectionStatus.test.ts
  - roteiro-unificado/src/pages/admin/AdminDashboard.test.tsx
findings:
  critical: 3
  warning: 4
  info: 3
  total: 10
status: issues_found
---

# Phase 09: Code Review Report

**Reviewed:** 2026-05-24T00:00:00Z
**Depth:** standard
**Files Reviewed:** 14
**Status:** issues_found

## Summary

Reviewed the Phase 09 dashboard de prontidão implementation covering the admin-side `AdminDashboard`, `OrgDetail`/`AssessmentSection`, `CompanyDashboard`, `SectionProgress`, `sectionStatus`, and `useOrgsWithReadiness`. The overall architecture is sound: the LEFT JOIN technique in `useOrgsWithReadiness` correctly preserves orgs without assessments, `computeTabStatus` is a clean pure function, and the cross-tenant guard pattern is consistent with prior phases.

Three blockers were found: a side effect called directly during render in `CompanyDashboard`, an unstable `toast` reference in a `useEffect` dependency array in `AdminDashboard` that causes toast spam on error, and an infinite spinner regression for any authenticated user whose `authOrgId` is `null` after loading completes (the case where admin users—who have no `org_members` row—navigate to a `/form/*` route). All three will produce incorrect behavior in production.

---

## Critical Issues

### CR-01: Side effect called during render in `CompanyDashboardContent`

**File:** `roteiro-unificado/src/features/form/CompanyDashboard.tsx:85-87`
**Issue:** `toastError(...)` is called unconditionally during the component's render path when `draftQuery.isError` is `true`. This is not inside a `useEffect`. React may invoke render multiple times (Strict Mode doubles it; concurrent mode may also re-render). The result is duplicate toast notifications fired on every render cycle while the error state persists. In production the error fires once per render rather than once per error transition, leading to toast spam. This pattern also violates React's rule that render functions must be pure (no observable side effects).

**Fix:**
```tsx
// Replace the direct call:
//   if (draftQuery.isError) {
//     toastError('Erro ao carregar dados...')
//   }
// with a useEffect:

useEffect(() => {
  if (draftQuery.isError) {
    toastError('Erro ao carregar dados. Tente recarregar a página.')
  }
}, [draftQuery.isError]) // toastError is stable (sonner under the hood)
```

---

### CR-02: Unstable `toast` reference in `useEffect` deps causes toast spam on error

**File:** `roteiro-unificado/src/pages/admin/AdminDashboard.tsx:47-52`
**Issue:** `useToast()` returns a plain object literal on every call (`return { success: ..., error: ..., ... }`). Every render produces a new object reference. `toast` is included in the `useEffect` dependency array at line 52, so the effect re-runs on every render. When `isError` is `true`, `toast.error('Erro ao carregar organizações')` fires on every render cycle, not just on the first error transition — producing an infinite stream of toast notifications for as long as the component remains mounted in error state.

The pattern in `AssessmentSection` (line 65) avoids this by suppressing the deps with `// eslint-disable-line react-hooks/exhaustive-deps`, but the correct fix is to not include `toast` in the deps array at all, since the toast functions are referentially stable at the Sonner layer even when the hook wrapper is not.

**Fix:**
```tsx
useEffect(() => {
  if (isError) {
    toast.error('Erro ao carregar organizações')
    console.error('useOrgsWithReadiness error:', error)
  }
}, [isError, error]) // remove `toast` from deps — its identity is irrelevant
```

---

### CR-03: Infinite loading spinner for users with `authOrgId === null` after auth resolves

**File:** `roteiro-unificado/src/features/form/CompanyDashboard.tsx:40-46`
**Issue:** The cross-tenant guard reads:

```tsx
if (authLoading || !orgId || !authOrgId) {
  return <Spinner ... />
}
```

`ProtectedRoute` checks only that a session exists — it does not require `role === 'company'` or that `orgId` is non-null. Admin users (who have no row in `org_members`) have `authOrgId = null` after `isLoading` becomes `false` (see `AuthProvider.tsx:86-89`). An admin user who navigates to `/form/<anyOrgId>/dashboard` will reach this guard with `authLoading = false`, `orgId = 'some-id'` (from URL), and `authOrgId = null`. The condition evaluates to `false || false || true` → the spinner renders forever with no escape route (no redirect, no error message).

The same pattern exists in `HistoryPage` (Phase 8, out of current scope) and the guard was copied verbatim into `CompanyDashboard`. The fix is to redirect when auth has resolved but `authOrgId` remains null, rather than spinning forever.

**Fix:**
```tsx
if (authLoading) {
  return (
    <div className="bg-primary flex min-h-screen items-center justify-center">
      <Spinner size="lg" className="border-white border-t-transparent" />
    </div>
  )
}

// Auth resolved but user has no org membership (e.g., admin user)
if (!authOrgId) {
  return <Navigate to="/login" replace />
}

if (!orgId || orgId !== authOrgId) {
  return <Navigate to={`/form/${authOrgId}/dashboard`} replace />
}
```

---

## Warnings

### WR-01: Unsafe `as Grade` cast without runtime validation can crash the `Badge` component

**File:** `roteiro-unificado/src/components/admin/CompanyCard.tsx:43`, `roteiro-unificado/src/components/admin/AssessmentSection.tsx:136`, `roteiro-unificado/src/features/form/CompanyDashboard.tsx:142`
**Issue:** All three locations cast a `string | null` database value to `Grade` before passing it to `<Badge>`. The `Badge` component immediately destructures `gradeConfig[grade]` at line 19 of `badge.tsx` without a null check:

```tsx
const { label, bg, text } = gradeConfig[grade]
```

If the database contains a value outside `'G1'`–`'G5'` (e.g., `'G6'`, `''`, or a future grade value added before the frontend is updated), `gradeConfig[grade]` is `undefined` and the destructuring throws a `TypeError: Cannot destructure property 'label' of undefined`. Each of the three callers guards the render with a truthiness check on `readiness_level_mgmt`, but that only excludes `null`/`''` — any non-empty unexpected string still reaches `Badge` and crashes.

**Fix:** Add a runtime guard before casting, or validate inside `Badge`:

```tsx
// Option A — guard at call site (CompanyCard example):
const validGrades: Grade[] = ['G1', 'G2', 'G3', 'G4', 'G5']
const grade = latestAssessment.readiness_level_mgmt
if (grade && (validGrades as string[]).includes(grade)) {
  return <Badge grade={grade as Grade} />
}

// Option B — make Badge resilient:
export function Badge({ grade, className }: BadgeProps) {
  const config = gradeConfig[grade]
  if (!config) return null   // or a fallback pill
  const { label, bg, text } = config
  ...
}
```

---

### WR-02: `filterOrgs` silently hides orgs with a submitted assessment but `readiness_level_mgmt === null`

**File:** `roteiro-unificado/src/pages/admin/AdminDashboard.tsx:28-34`
**Issue:** The grade filter logic is:

```tsx
gradeFilter === 'Todos' ||
(gradeFilter === 'Sem avaliação'
  ? !org.latestAssessment               // true only when latestAssessment is null
  : org.latestAssessment?.readiness_level_mgmt === gradeFilter)
```

An org that has `latestAssessment` (a submitted assessment exists) but `readiness_level_mgmt === null` (grade not yet computed) will:
- Be excluded from every specific grade filter (`G1`–`G5`), because `null !== 'G1'`, etc.
- Be excluded from the `'Sem avaliação'` filter, because `!org.latestAssessment` is `false`.
- Only appear under `'Todos'`.

This scenario occurs legitimately when the Supabase function that computes readiness has not yet run, or when the admin has manually inserted an assessment without a grade. The affected org becomes effectively invisible in filtered views with no indication to the user. This is not tested in `AdminDashboard.test.tsx`.

**Fix:**
```tsx
const matchesGrade =
  gradeFilter === 'Todos' ||
  (gradeFilter === 'Sem avaliação'
    ? !org.latestAssessment?.readiness_level_mgmt  // covers null assessment AND null grade
    : org.latestAssessment?.readiness_level_mgmt === gradeFilter)
```
Update `GRADE_OPTIONS` copy if needed to reflect that "Sem avaliação" now includes submitted-but-ungraded orgs.

---

### WR-03: `OrgDetail` conflates network error with "not found" — misleading user feedback

**File:** `roteiro-unificado/src/pages/admin/OrgDetail.tsx:24-33`
**Issue:** `useOrgDetail` exposes `isError` and `error` properties, but `OrgDetail` destructures only `{ org, members, isLoading }` and discards them. When the Supabase query for the org fails due to a network error or RLS denial, `isLoading` becomes `false` and `org` is `undefined`. The component then renders "Organização não encontrada" — the same UI as a genuine 404. An admin troubleshooting a connectivity issue or a misconfigured RLS policy receives no actionable information.

**Fix:**
```tsx
const { org, members, isLoading, isError } = useOrgDetail(orgId)

// After isLoading check:
if (isError) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-red-600">Erro ao carregar organização. Tente recarregar.</p>
      <Link to="/admin/dashboard" className="text-primary text-sm hover:underline">
        ← Voltar para Organizações
      </Link>
    </div>
  )
}
```

---

### WR-04: `AssessmentSection` `useEffect` suppresses all hook deps with blanket `eslint-disable`

**File:** `roteiro-unificado/src/components/admin/AssessmentSection.tsx:65`
**Issue:**
```tsx
}, [isError]) // eslint-disable-line react-hooks/exhaustive-deps
```
The comment acknowledges that `toast` and `orgId` are missing from the dependency array. Suppressing the lint rule instead of fixing the deps is a correctness trade-off: if `orgId` changes (admin navigates from one `OrgDetail` to another), the effect closure captures the stale `orgId` for the `console.error` call. More importantly, if `toast` is ever stabilized (e.g., via `useCallback` in a future refactor of `useToast`), the suppression would hide that `toast` should now be included. The immediate functional impact is minor (stale `orgId` in a log message), but the approach of silencing the exhaustive-deps rule wholesale is fragile.

**Fix:** Destructure only the `error` method once outside the effect and pass it as a stable reference, or wrap the toast call in `useCallback`. The minimal fix that avoids the lint suppression:

```tsx
const { error: showError } = useToast()
const showErrorRef = useRef(showError)
useEffect(() => { showErrorRef.current = showError })

useEffect(() => {
  if (isError) {
    console.error('[AssessmentSection] Erro ao carregar avaliações', { orgId })
    showErrorRef.current('Erro ao carregar dados. Tente recarregar a página.')
  }
}, [isError, orgId])
```
Alternatively, since `sonner`'s `toast.error` is a module-level stable function, the simplest fix is to call `toast.error` directly (not through the hook wrapper) inside the effect, matching what the hook does internally.

---

## Info

### IN-01: Double `new Date()` construction for the same timestamp value

**File:** `roteiro-unificado/src/components/admin/AssessmentSection.tsx:100-105`, `roteiro-unificado/src/components/admin/CompanyCard.tsx:24-29`
**Issue:** Each component calls `new Date(submitted_at)` twice (once for `toLocaleDateString`, once for `toLocaleTimeString`) when computing the formatted date string. This is harmless but redundant. A single `Date` object should be constructed and reused.

**Fix:**
```tsx
const date = new Date(row.submitted_at)
const formattedDate =
  date.toLocaleDateString('pt-BR') +
  ' às ' +
  date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
```

---

### IN-02: `HistoryPage.AssessmentRow` declares `created_at` but never renders it

**File:** `roteiro-unificado/src/features/form/HistoryPage.tsx:18` (context for the shared queryKey concern)
**Issue:** `HistoryPage` selects `created_at` in its query and includes it in the `AssessmentRow` type, but never references it in the JSX template. Because `AssessmentSection` uses the same queryKey `['assessments', orgId]` but does NOT select `created_at`, if a cached result from `AssessmentSection` is present when `HistoryPage` mounts (e.g., an admin user navigating between `/admin/orgs/:id` and `/form/:orgId/history` — possible since `ProtectedRoute` allows admin access), `HistoryPage` will use the stale cache missing `created_at`. Currently this causes no visible bug because `created_at` is never read in JSX, but it is a latent risk if `created_at` is used in a future iteration.

**Fix:** Either add `created_at` to `AssessmentSection`'s select (making the schemas consistent), or remove `created_at` from `HistoryPage`'s select and type definition if it is not needed.

---

### IN-03: `computeTabStatus` does not guard against array-typed `tabData`

**File:** `roteiro-unificado/src/lib/sectionStatus.ts:50`
**Issue:** The guard at step 2 checks `typeof tabData !== 'object'`, but `typeof [] === 'object'` is `true` in JavaScript. If `form_data[tabKey]` were ever an array (e.g., due to a schema migration or data corruption), the function would proceed to count `Object.values` of the array, which would return the array elements themselves. For a non-empty array this would produce `'in-progress'` instead of `'empty'`. In the current schema this is not a risk, but the logic could be made more explicit with:

```ts
if (
  !tabData ||
  typeof tabData !== 'object' ||
  Array.isArray(tabData) ||
  Object.keys(tabData as object).length === 0
) {
  return 'empty'
}
```

---

_Reviewed: 2026-05-24T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
