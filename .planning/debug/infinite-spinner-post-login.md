---
slug: infinite-spinner-post-login
status: resolved
trigger: manual
goal: find_and_fix
created: 2026-05-22
---

## Symptoms

After login, app redirects to `/form/<orgId>` and shows infinite loading spinner. Never resolves.

## Evidence

- timestamp: 2026-05-22T00:00:00Z
  file: src/features/auth/AuthProvider.tsx
  observation: onAuthStateChange callback was async and awaited fetchOrgMember() (a supabase.from query) inside the callback body

- timestamp: 2026-05-22T00:00:01Z
  file: src/components/routing/ProtectedRoute.tsx
  observation: renders spinner while isLoading === true; isLoading never became false because fetchOrgMember deadlocked

- timestamp: 2026-05-22T00:00:02Z
  lib: @supabase/supabase-js ^2.106.1
  observation: Supabase JS v2 holds an internal client lock during the auth state change event; calling supabase.from() inside the async onAuthStateChange callback causes a deadlock

## Current Focus

hypothesis: fetchOrgMember deadlocked the Supabase JS v2 client because it was called inside the onAuthStateChange async callback, which holds a client lock preventing concurrent DB queries.

next_action: RESOLVED — fix applied

## Resolution

root_cause: >
  Supabase JS v2 holds an internal async lock during the `onAuthStateChange` event.
  The callback was declared `async` and called `await fetchOrgMember(userId)` which
  internally calls `supabase.from('org_members').select(...)`. That query waits for
  the auth lock to release, but the auth lock is held until the callback resolves —
  a classic async deadlock. As a result `setIsLoading(false)` was never reached and
  `ProtectedRoute` displayed the spinner indefinitely.

fix: >
  Refactored `AuthProvider` so that `onAuthStateChange` callback is synchronous —
  it only updates session/user state. The `org_members` fetch was moved to a separate
  `useEffect` that watches `user?.id`, running after the auth lock is released.
  Added a `cancelled` flag to prevent stale state updates on cleanup.

files_changed:
  - src/features/auth/AuthProvider.tsx
