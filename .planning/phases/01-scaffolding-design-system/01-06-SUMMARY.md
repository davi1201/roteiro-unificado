---
phase: 1
plan: "01-06"
subsystem: notifications
tags: [toast, sonner, hooks, ux]
dependency_graph:
  requires: [01-01, 01-04]
  provides: [toast-system, useToast-hook]
  affects: [App.tsx, main.tsx]
tech_stack:
  added: [sonner@2.0.7]
  patterns: [hook-wrapper, global-provider]
key_files:
  created:
    - roteiro-unificado/src/hooks/useToast.ts
  modified:
    - roteiro-unificado/src/main.tsx
    - roteiro-unificado/src/App.tsx
    - roteiro-unificado/package.json
decisions:
  - "Sonner chosen over react-hot-toast (unmaintained) and react-toastify (heavy CSS, not React 19 optimized)"
  - "useToast hook wraps Sonner API to prevent direct imports spread across codebase and enable test mocking"
  - "<Toaster> placed inside QueryClientProvider and after <App /> to render on top of content"
metrics:
  duration: "~5 minutes"
  completed: "2025-05-22"
  tasks_completed: 4
  files_changed: 4
---

# Phase 1 Plan 06: Criar sistema de Toast com Sonner — Summary

## One-liner
Sonner v2.0.7 toast system with global `<Toaster>` in `main.tsx` and typed `useToast` hook wrapping all toast variants.

## What Was Built

### Task 1 — Install Sonner
Installed `sonner@2.0.7` (zero-deps, native CSS animations, React 19 optimized).

### Task 2 — Update main.tsx with Toaster
Added `<Toaster position="top-right" richColors duration={4000} closeButton />` inside `QueryClientProvider`, after `<App />` so it renders above all app content.

### Task 3 — Create src/hooks/useToast.ts
Created typed hook wrapping Sonner's `toast` API:
- `success`, `error`, `loading`, `info`, `warning` — typed with `ExternalToast` options
- `promise<T>` — typed generic with typed success/error message callbacks
- `dismiss` — accepts optional toast ID

Uses `ExternalToast` type from Sonner v2 (confirmed exported in `dist/index.d.ts`).

### Task 4 — Update App.tsx with demo buttons
Four interactive demo buttons: Toast Sucesso, Toast Erro, Toast Loading, Toast Promise (simulates random success/failure after 2 seconds).

Removed `src/hooks/.gitkeep` as the directory now has real content.

## Verification Results

```
✓ npx tsc --noEmit — no errors
✓ npm run build — built in 217ms (249.68 kB JS, 5.86 kB CSS)
✓ grep "Toaster\|sonner" src/main.tsx — both import and JSX confirmed
✓ ls src/hooks/useToast.ts — file exists (1276 bytes)
✓ src/**/*.js in .gitignore — compiled tsc-b output not tracked
```

## Deviations from Plan

None — plan executed exactly as written.

**Note:** `tsc -b` (used in `npm run build`) emits `useToast.js` alongside `useToast.ts` because the root `tsconfig.json` lacks `noEmit: true`. This is pre-existing behavior (same pattern exists for `src/App.js`, `src/main.js`, etc.). The `.gitignore` already handles this via `src/**/*.js`. Logged for reference — not a blocker.

## Known Stubs

None — the toast demo in App.tsx is intentional scaffolding that will be replaced when real feature pages are built.

## Threat Flags

None — no new network endpoints, auth paths, or trust-boundary changes introduced.

## Self-Check: PASSED

- ✅ `roteiro-unificado/src/hooks/useToast.ts` — exists
- ✅ `roteiro-unificado/src/main.tsx` — contains Toaster import and JSX
- ✅ `roteiro-unificado/src/App.tsx` — contains useToast import and demo buttons
- ✅ Commit `fe58549` — confirmed in git log
