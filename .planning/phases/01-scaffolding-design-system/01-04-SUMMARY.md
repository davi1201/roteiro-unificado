---
phase: 1
plan: "01-04"
title: "Configurar TanStack Query v5 e Zustand"
subsystem: "state-management"
tags: ["tanstack-query", "zustand", "localStorage", "state-management", "persistence"]
dependency_graph:
  requires: ["01-01"]
  provides: ["QueryClientProvider", "useFormStore"]
  affects: ["src/main.tsx", "src/stores/"]
tech_stack:
  added:
    - "@tanstack/react-query@5.100.11"
    - "zustand@5.0.13"
  patterns:
    - "QueryClient created outside component to prevent cache recreation"
    - "Zustand persist with Set→Array serialization workaround"
    - "onRehydrateStorage for Array→Set reconversion"
key_files:
  created:
    - "roteiro-unificado/src/stores/formStore.ts"
    - "roteiro-unificado/src/stores/index.ts"
  modified:
    - "roteiro-unificado/src/main.tsx"
    - "roteiro-unificado/package.json"
    - "roteiro-unificado/package-lock.json"
decisions:
  - "staleTime set to 5min — form reference data changes rarely; avoids re-fetches during fill sessions"
  - "retry: 1 — single retry on query failure to avoid flooding Supabase on network hiccup"
  - "Persist key 'form-progress' intentionally not namespaced yet — Phase 3 will add tenantId prefix"
  - "Set serialized as Array via partialize — JSON.stringify(new Set()) returns '{}'"
metrics:
  duration: "2 minutes"
  completed: "2026-05-22T13:34:00Z"
  tasks: 4
  files_changed: 5
---

# Phase 1 Plan 04: Configurar TanStack Query v5 e Zustand — Summary

**One-liner:** TanStack Query v5 with QueryClientProvider (staleTime 5min) + Zustand v5 useFormStore with Set-safe localStorage persistence.

## What Was Built

### Task 1 — Dependencies installed
- `@tanstack/react-query@5.100.11` — exact version as specified
- `zustand@5.0.13` — exact version as specified

### Task 2 — main.tsx updated
- `QueryClient` created **outside** any component (mandatory — prevents cache recreation on re-renders)
- `QueryClientProvider` wraps `<App />` with `staleTime: 1000 * 60 * 5` (5 min) and `retry: 1`
- Placeholder comment for Sonner Toaster (Plan 01-06)

### Task 3 — src/stores/formStore.ts created
- `useFormStore` with `persist` middleware targeting `localStorage`
- Tracks `currentStep: number` and `completedSteps: Set<number>`
- **Critical Set serialization fix:** `partialize` converts `Set` → `Array` (JSON.stringify gotcha)
- **Critical rehydration fix:** `onRehydrateStorage` reconverts `Array` → `Set` on page load
- Phase 3 multi-tenant warning comment in place: key must become `form-progress-${tenantId}`
- Actions: `setCurrentStep`, `markStepComplete`, `markStepIncomplete`, `reset`

### Task 4 — src/stores/index.ts created
- Barrel export of `useFormStore`
- Comments for Phase 2 (`useAssessmentStore`) and Phase 3 (`useAuthStore`) additions

## Verification

```
✅ npx tsc --noEmit — no errors
✅ src/stores/formStore.ts — created
✅ src/stores/index.ts — created
✅ main.tsx contains QueryClientProvider and QueryClient
✅ formStore.ts contains partialize and onRehydrateStorage
```

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — no placeholder data or TODO stubs that affect functionality.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: localStorage-tenant-leak | src/stores/formStore.ts | Persist key `form-progress` is NOT namespaced by tenantId — cross-tenant data leakage possible in shared browsers. Phase 3 mitigation required. |

> This is a **known and documented** future risk, not an oversight. The Phase 3 plan must address it.

## Self-Check: PASSED

- `roteiro-unificado/src/main.tsx` — FOUND ✅
- `roteiro-unificado/src/stores/formStore.ts` — FOUND ✅
- `roteiro-unificado/src/stores/index.ts` — FOUND ✅
- Commit `049fbf2` (chore: install deps) — FOUND ✅
- Commit `d6f1655` (feat: configure) — FOUND ✅
