---
slug: form-data-stale-after-relogin
status: awaiting_human_verify
trigger: manual
created: 2026-06-16
updated: 2026-06-16
---

## Symptoms

After logout + login, form data does not load. Only a manual page refresh (F5) fixes it.

## Prior Context

- A prior bug (`infinite-spinner-post-login`) was fixed by making `onAuthStateChange` synchronous — org_members fetch moved to a `useEffect` watching `user?.id`.
- File changed: `src/features/auth/AuthProvider.tsx`

## Likely Area

React Query / Zustand / context not re-fetching or re-initializing form data when auth state changes on re-login. Could be stale cache, missing query invalidation on auth change, or effect dependencies not reacting to the new session.

## Key Files

- `src/features/auth/AuthProvider.tsx`
- `src/features/form/FormLayout.tsx`
- Any React Query client setup / query invalidation on auth change
- Any Zustand store that holds form state
- Hooks that fetch form data (`useQuery`, `useSWR`, or `supabase.from` calls related to form)

## Debug Approach

1. Trace how form data is fetched after login
2. Check if query cache is invalidated on logout
3. Check if re-login triggers a re-fetch or just reuses stale cache
4. Identify what the page refresh does that re-login doesn't

## Current Focus

reasoning_checkpoint:
  hypothesis: "On SIGNED_OUT, clearFormStore clears Zustand and localStorage/sessionStorage, but the QueryClient in-memory cache is never invalidated. When the same (or different) user logs back in, TanStack Query returns the previously-cached ['assessment','draft',tenantId] data immediately (within the 30s staleTime window on that query, or the 5-minute global default), so draftQuery.data does not change reference, the hydrateFromAssessment useEffect does not re-fire, and the form appears empty or stale. F5 destroys the in-memory QueryClient cache, forcing a genuine refetch — this is why F5 fixes it."
  confirming_evidence:
    - "QueryClient created once at module level in main.tsx — persists across logout/login without page reload"
    - "AuthProvider SIGNED_OUT handler calls clearFormStore(orgId) but never calls queryClient.removeQueries() or queryClient.clear()"
    - "draftQuery uses staleTime: 30_000 — if re-login happens within 30s the cache is still considered fresh and no fetch is made"
    - "global defaultOptions.staleTime is 5 minutes — all other queries also survive logout without invalidation"
    - "hydrateFromAssessment useEffect depends on draftQuery.data — if cache returns same reference, effect is a no-op"
    - "F5 clears in-memory QueryClient → forces genuine fetch → data loads correctly"
  falsification_test: "If I call queryClient.removeQueries on logout and the bug persists, this hypothesis is wrong"
  fix_rationale: "Invalidate/remove the stale assessment cache on logout so re-login always triggers a fresh Supabase fetch. The fix belongs in AuthProvider's SIGNED_OUT handler (or in signOut()), where it can call queryClient.removeQueries(['assessment']) or queryClient.clear()."
  blind_spots: "Different tenant IDs between logout and re-login would use different queryKeys — but the hydrateFromAssessment effect would still not re-run if the new query fetches and returns the same data shape. That case also needs the same fix."

next_action: "Add queryClient.removeQueries call in AuthProvider's SIGNED_OUT branch"

## Evidence

- timestamp: 2026-06-16
  checked: main.tsx — QueryClient instantiation
  found: QueryClient created once at module level, staleTime 5min globally; shared across entire app lifetime
  implication: Cache survives logout/login cycle because QueryClient is never reset

- timestamp: 2026-06-16
  checked: AuthProvider.tsx — SIGNED_OUT handler
  found: Calls clearFormStore(currentOrgIdRef.current) but no React Query invalidation
  implication: Assessment draft cache remains in QueryClient after logout

- timestamp: 2026-06-16
  checked: FormLayout.tsx — draftQuery
  found: queryKey ['assessment','draft',tenantId], staleTime 30_000ms; hydrateFromAssessment useEffect depends on draftQuery.data
  implication: If QueryClient cache is fresh on re-login, no new fetch is triggered and hydrateFromAssessment is a no-op

- timestamp: 2026-06-16
  checked: formStore.ts — clearFormStore
  found: Removes store from Map, cancels subscriber, clears localStorage and sessionStorage — does NOT touch QueryClient
  implication: Confirms no query cache invalidation on logout path

## Resolution

root_cause: "On logout, the React Query cache is not invalidated. The QueryClient is a module-level singleton that persists across the logout/login cycle. When the user logs back in within the staleTime window, TanStack Query serves the cached draft immediately without refetching, so draftQuery.data does not change and the hydrateFromAssessment useEffect is a no-op. The form renders empty because the Zustand store was correctly cleared on logout but is never re-populated from the still-cached (now-stale) query result."
fix: "Added useQueryClient() to AuthProvider and called queryClient.clear() in the SIGNED_OUT branch, before zeroing user/session/role/orgId state. Also updated AuthProvider.test.tsx to wrap renderHook with QueryClientProvider."
files_changed:
  - "roteiro-unificado/src/features/auth/AuthProvider.tsx"
  - "roteiro-unificado/src/features/auth/AuthProvider.test.tsx"
verification: "Full test suite: 41 files, 196 tests passing, 0 failures."
