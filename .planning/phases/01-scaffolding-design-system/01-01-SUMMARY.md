---
phase: 1
plan: "01-01"
subsystem: frontend-scaffold
tags: [vite, react, typescript, scaffold, project-init]
dependency_graph:
  requires: []
  provides: [vite-react-ts-project, src-folder-structure, path-alias, env-config]
  affects: [all-subsequent-plans]
tech_stack:
  added:
    - "React 19.2.6"
    - "react-dom 19.2.6"
    - "Vite 8.0.14"
    - "@vitejs/plugin-react 6.0.2"
    - "TypeScript 6.0.3 (pinned ~6.0.0)"
    - "@types/node (latest)"
  patterns:
    - "ESM-first project (type: module)"
    - "@/ path alias for src/ directory"
    - "Inline styles for pre-Tailwind App stub"
key_files:
  created:
    - roteiro-unificado/package.json
    - roteiro-unificado/vite.config.ts
    - roteiro-unificado/tsconfig.json
    - roteiro-unificado/tsconfig.node.json
    - roteiro-unificado/src/App.tsx
    - roteiro-unificado/src/main.tsx
    - roteiro-unificado/src/index.css
    - roteiro-unificado/.env.local.example
    - roteiro-unificado/.gitignore
  modified: []
decisions:
  - "Removed deprecated baseUrl from tsconfig.json (TS6 requires ignoreDeprecations or removal)"
  - "Added composite:true to tsconfig.node.json (required for project references)"
  - "Added types:[vite/client] to tsconfig.json (required for CSS side-effect imports)"
  - "Used fileURLToPath for __dirname in vite.config.ts (ESM project, __dirname not natively available)"
  - "Used create-vite@8.3.0 instead of 8.0.14 (8.0.14 does not exist for create-vite; vite@8.0.14 exists)"
metrics:
  duration: "~5 minutes"
  completed: "2026-05-22"
  tasks_completed: 10
  files_created: 20
---

# Phase 1 Plan 01: Inicializar projeto Vite + React + TypeScript — Summary

**One-liner:** Vite 8.0.14 + React 19.2.6 + TypeScript 6.0.3 project scaffolded in `roteiro-unificado/` with `@/` alias, structured `src/` layout, and App.tsx stub using brand colors.

## What Was Done

Created the `roteiro-unificado/` application directory inside the monorepo root with:

1. **Project scaffold** via `npm create vite@8 -- --template react-ts` (create-vite@8.3.0)
2. **Exact version pinning** in package.json: React 19.2.6, Vite 8.0.14, TypeScript ~6.0.0, @vitejs/plugin-react 6.0.2
3. **TypeScript config** (`tsconfig.json`) with `@/` path alias, strict mode, `types: [vite/client]`, composite project reference to `tsconfig.node.json`
4. **Vite config** (`vite.config.ts`) with `@/` alias using `fileURLToPath` pattern for ESM compatibility
5. **Folder structure** created: `src/components/ui`, `src/components/forms`, `src/features`, `src/hooks`, `src/lib`, `src/stores`, `src/types`, `src/pages`
6. **App.tsx stub** with `#123B66` background, white heading, and `#F28C28` accent button — inline styles (pre-Tailwind)
7. **main.tsx** with null-safe root element check
8. **index.css** minimal reset (Plan 02 will replace with Tailwind v4)
9. **Environment config**: `.env.local.example` documented, `.env.local` with empty values (git-ignored)
10. **`.gitignore`** updated to explicitly exclude `.env.local`, `.env.*.local`, `.env`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] create-vite@8.0.14 does not exist**
- **Found during:** Task 1
- **Issue:** `npm create vite@8.0.14` fails — `create-vite` package version `8.0.14` does not exist. The plan confused the `create-vite` CLI version with the `vite` package version.
- **Fix:** Used `npm create vite@8` (resolves to `create-vite@8.3.0`). The `vite` package version is set to `8.0.14` in `package.json` (Task 2), which does exist.
- **Files modified:** none (scaffold step only)
- **Impact:** None — correct `vite@8.0.14` was installed via `package.json`

**2. [Rule 1 - Bug] `baseUrl` deprecated in TypeScript 6.0**
- **Found during:** Verification
- **Issue:** TypeScript 6.0 treats `baseUrl` as a deprecation error (TS5101), causing `tsc --noEmit` to fail.
- **Fix:** Removed `"baseUrl": "."` from `tsconfig.json`. The `paths` alias `@/*` → `./src/*` works without `baseUrl` in TS6 with `moduleResolution: bundler`.
- **Files modified:** `roteiro-unificado/tsconfig.json`

**3. [Rule 1 - Bug] Project reference requires `composite: true`**
- **Found during:** Verification
- **Issue:** TypeScript error TS6306 — referenced project `tsconfig.node.json` must have `"composite": true`.
- **Fix:** Added `"composite": true` to `tsconfig.node.json` compilerOptions.
- **Files modified:** `roteiro-unificado/tsconfig.node.json`

**4. [Rule 1 - Bug] Missing `types: ["vite/client"]` for CSS imports**
- **Found during:** Verification (after fix 2 and 3)
- **Issue:** TypeScript error TS2882 — cannot find type declarations for side-effect import of `./index.css`. The original scaffold had `types: ["vite/client"]` in `tsconfig.app.json` which provides this.
- **Fix:** Added `"types": ["vite/client"]` to `tsconfig.json` compilerOptions.
- **Files modified:** `roteiro-unificado/tsconfig.json`

**5. [Rule 3 - Blocking] ESM project requires `fileURLToPath` for `__dirname`**
- **Found during:** Task 4 (preemptive — noted in plan's "if TypeScript complains" section)
- **Issue:** Project has `"type": "module"` in package.json, making it ESM. In ESM, `__dirname` is not available natively.
- **Fix:** Used `import { fileURLToPath } from 'url'; const __dirname = path.dirname(fileURLToPath(import.meta.url))` as documented in the plan.
- **Files modified:** `roteiro-unificado/vite.config.ts`

## Actual Package Versions Installed

| Package | Requested | Installed |
|---------|-----------|-----------|
| react | 19.2.6 (exact) | 19.2.6 |
| react-dom | 19.2.6 (exact) | 19.2.6 |
| vite | 8.0.14 (exact) | 8.0.14 |
| @vitejs/plugin-react | 6.0.2 (exact) | 6.0.2 |
| typescript | ~6.0.0 (tilde) | 6.0.3 |
| @types/node | latest | (latest at install time) |

## Verification Results

```
TypeScript version: 6.0.3 ✓ (within ~6.0.0 range)
tsc --noEmit: PASSED (0 errors) ✓
Directories: all 8 exist ✓
.env.local git-ignored: ✓
.env.local.example NOT git-ignored: ✓
```

## Known Stubs

- `roteiro-unificado/src/App.tsx` — intentional stub with inline styles, pending Tailwind integration in Plan 02

## Self-Check: PASSED

- [x] `roteiro-unificado/package.json` exists
- [x] `roteiro-unificado/vite.config.ts` exists
- [x] `roteiro-unificado/tsconfig.json` exists
- [x] `roteiro-unificado/src/App.tsx` exists
- [x] Commit `3ebc553` exists in git log
