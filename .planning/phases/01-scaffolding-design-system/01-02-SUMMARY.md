---
phase: 1
plan: "01-02"
subsystem: "design-system"
tags: [tailwind, css, design-tokens, oklch, vite]
dependency_graph:
  requires: ["01-01"]
  provides: ["tailwind-v4", "design-tokens", "cn-helper"]
  affects: ["all-ui-components"]
tech_stack:
  added:
    - "tailwindcss@4.3.0"
    - "@tailwindcss/vite@4.3.0"
    - "clsx@2.1.1"
    - "tailwind-merge@3.6.0"
  patterns:
    - "@theme {} block in CSS (Tailwind v4 config approach)"
    - "OKLCH color space for design tokens"
    - "Class-based dark mode via @custom-variant"
    - "cn() helper pattern (clsx + tailwind-merge)"
key_files:
  created:
    - "roteiro-unificado/src/lib/utils.ts"
  modified:
    - "roteiro-unificado/vite.config.ts"
    - "roteiro-unificado/src/index.css"
    - "roteiro-unificado/src/App.tsx"
    - "roteiro-unificado/.gitignore"
    - "roteiro-unificado/package.json"
decisions:
  - "Tailwind v4 Vite plugin only — no postcss.config.js needed"
  - "OKLCH color space for perceptually uniform palette shades"
  - "Class-based dark mode (.dark) not prefers-color-scheme for explicit tenant control"
  - "tailwind-merge@3.x required for Tailwind v4 class conflict resolution"
metrics:
  duration: "~8 minutes"
  completed: "2025-01-27"
  tasks_completed: 6
  files_changed: 6
---

# Phase 1 Plan 02: Configurar Tailwind v4 com design tokens — Summary

**One-liner:** Tailwind v4 via @tailwindcss/vite plugin with OKLCH design tokens (primary #123B66, accent #F28C28, G1-G5 grades) and cn() helper.

## What Was Built

Installed and configured Tailwind CSS v4 using the new Vite plugin approach (no PostCSS config, no `tailwind.config.js`). All design tokens are defined in `@theme {}` block within `index.css`, using OKLCH color space for perceptually uniform shades. Created the `cn()` utility helper. Updated `App.tsx` to use Tailwind classes to validate the entire pipeline works.

## Tasks Completed

| Task | Description | Status |
|------|-------------|--------|
| 1 | Install tailwindcss@4.3.0 + @tailwindcss/vite@4.3.0 | ✅ Done |
| 2 | Install clsx@2.1.1 + tailwind-merge@3.6.0 | ✅ Done |
| 3 | Update vite.config.ts with Tailwind Vite plugin | ✅ Done |
| 4 | Replace src/index.css with @theme {} design tokens | ✅ Done |
| 5 | Create src/lib/utils.ts with cn() helper | ✅ Done |
| 6 | Update App.tsx to use Tailwind classes | ✅ Done |

## Design Token System

### Color Palette

| Token | Value | Hex | Usage |
|-------|-------|-----|-------|
| `--color-primary` | `oklch(0.348 0.088 252.7)` | #123B66 | Brand blue base |
| `--color-primary-50..900` | Full shade scale | — | Light to dark variants |
| `--color-accent` | `oklch(0.735 0.161 58.8)` | #F28C28 | Action orange base |
| `--color-accent-50..900` | Full shade scale | — | Light to dark variants |
| `--color-g1` | `oklch(0.500 0.230 22.0)` | red | Crítico readiness grade |
| `--color-g2` | `oklch(0.735 0.161 58.8)` | orange | Baixo readiness grade |
| `--color-g3` | `oklch(0.795 0.185 86.0)` | yellow | Médio readiness grade |
| `--color-g4` | `oklch(0.546 0.215 264.1)` | blue | Bom readiness grade |
| `--color-g5` | `oklch(0.590 0.160 150.0)` | green | Excelente readiness grade |

### Typography & Radius

| Token | Value |
|-------|-------|
| `--font-sans` | 'Inter', ui-sans-serif, system-ui, sans-serif |
| `--radius-sm/md/lg/xl` | 0.25 / 0.375 / 0.5 / 0.75 rem |

## Verification Results

- ✅ `npm run build` — succeeds, no errors (6.24 kB CSS output)
- ✅ `npx tsc --noEmit` — no TypeScript errors
- ✅ No `tailwind.config.js` present
- ✅ No `postcss.config.js` present
- ✅ `cn()` helper uses twMerge + clsx

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Config] Added TypeScript build artifacts to .gitignore**
- **Found during:** Commit staging (Task 6 verification)
- **Issue:** `npm run build` (which runs `tsc -b`) generated compiled `.js`, `.d.ts`, and `.tsbuildinfo` files in `src/` and root. These were being staged for commit as they weren't in `.gitignore`.
- **Fix:** Added `*.tsbuildinfo`, `*.d.ts`, `src/**/*.js`, `vite.config.js` exclusions to `.gitignore`, then removed them from the git index with `git rm --cached`.
- **Files modified:** `roteiro-unificado/.gitignore`
- **Commit:** b3ad7ad (included in same task commit)

## Commit

- `b3ad7ad` — feat(01-02): configure Tailwind v4 with design system tokens

## Self-Check: PASSED

- ✅ `roteiro-unificado/src/lib/utils.ts` — exists
- ✅ `roteiro-unificado/src/index.css` — contains `@import "tailwindcss"` + `@theme {}`
- ✅ `roteiro-unificado/vite.config.ts` — contains `tailwindcss()` plugin
- ✅ Commit `b3ad7ad` — confirmed in git log
