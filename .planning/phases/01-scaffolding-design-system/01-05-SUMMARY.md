---
phase: 1
plan: "01-05"
title: "Criar biblioteca de componentes UI base"
subsystem: "ui-components"
tags: ["components", "ui", "tailwind", "cva", "design-system"]
dependency_graph:
  requires: ["01-02", "01-06"]
  provides: ["Button", "Input", "Textarea", "Select", "Card", "Badge", "Spinner", "Skeleton", "DesignSystem"]
  affects: ["src/components/ui", "src/pages/DesignSystem.tsx", "src/App.tsx"]
tech_stack:
  added: ["class-variance-authority@0.7.1"]
  patterns: ["CVA variant composition", "forwardRef for form library compat", "barrel exports"]
key_files:
  created:
    - src/components/ui/button.tsx
    - src/components/ui/input.tsx
    - src/components/ui/textarea.tsx
    - src/components/ui/select.tsx
    - src/components/ui/card.tsx
    - src/components/ui/badge.tsx
    - src/components/ui/spinner.tsx
    - src/components/ui/skeleton.tsx
    - src/components/ui/index.ts
    - src/pages/DesignSystem.tsx
  modified:
    - src/App.tsx
    - roteiro-unificado/package.json
decisions:
  - "CVA (class-variance-authority) for Button variants — avoids manual ternary explosion"
  - "Badge G3 uses text-primary-900 (dark text on yellow) — white text fails WCAG AA on yellow background"
  - "forwardRef on Input/Textarea/Select — needed for react-hook-form Controller integration in future phases"
  - "ButtonProps exported from both button.tsx AND index.ts for direct import flexibility"
  - "disabled={!!(isLoading ?? disabled)} — explicit boolean cast avoids TypeScript strictness error"
metrics:
  duration: "~10 minutes"
  completed: "2025-07-14"
  tasks_completed: 12
  files_created: 11
  files_modified: 2
---

# Phase 1 Plan 05: Criar biblioteca de componentes UI base — Summary

## One-liner
8-component UI library using CVA Button variants, forwardRef form inputs, G1-G5 WCAG-compliant Badges, and DesignSystem.tsx visual sandbox.

## What Was Built

### Components Created
| Component | File | Key Features |
|-----------|------|--------------|
| Button | `src/components/ui/button.tsx` | 4 variants × 3 sizes via CVA, `isLoading` spinner state |
| Input | `src/components/ui/input.tsx` | forwardRef, error/errorMessage state, focus ring |
| Textarea | `src/components/ui/textarea.tsx` | forwardRef, resize-y, error state, min-height |
| Select | `src/components/ui/select.tsx` | forwardRef, options array prop, placeholder, error state |
| Card | `src/components/ui/card.tsx` | Card + CardHeader + CardContent + CardFooter sub-components |
| Badge | `src/components/ui/badge.tsx` | G1-G5 scale with WCAG AA-compliant color pairs |
| Spinner | `src/components/ui/spinner.tsx` | 3 sizes, role="status", aria-label for accessibility |
| Skeleton | `src/components/ui/skeleton.tsx` | animate-pulse, accepts className for custom sizing |

### Color Decisions
- G1 (Crítico): `bg-g1 text-white` — red bg, white text ✓ WCAG AA
- G2 (Baixo): `bg-g2 text-white` — orange-red bg, white text ✓ WCAG AA
- G3 (Médio): `bg-g3 text-primary-900` — **yellow bg, dark text** (white would fail WCAG AA)
- G4 (Bom): `bg-g4 text-white` — green bg, white text ✓ WCAG AA
- G5 (Excelente): `bg-g5 text-white` — teal bg, white text ✓ WCAG AA

### Barrel Exports (`src/components/ui/index.ts`)
All 8 components plus type exports (`ButtonProps`, `Grade`) accessible via `@/components/ui`.

### DesignSystem.tsx
Visual sandbox at `src/pages/DesignSystem.tsx` showcasing all components with:
- All Button variants and sizes
- Live toast triggers (success, error, loading, promise)
- Error state demo on Input (focus to trigger)
- Card with embedded Badge
- Spinner size variants
- Skeleton placeholder shapes

### App.tsx
Simplified to render `<DesignSystem />` directly, replacing the inline toast test UI from Plan 01-06.

## Verification Results
```
✓ npm run build — built in 222ms, 0 TypeScript errors
✓ npm run lint  — 1 warning (react-refresh/only-export-components on buttonVariants), 0 errors
✓ npx tsc --noEmit — passes
✓ All 9 ui files present in src/components/ui/
✓ ButtonProps exported from both button.tsx and index.ts
```

## Deviations from Plan

None — plan executed exactly as written. The one lint warning (`react-refresh/only-export-components` for `buttonVariants`) was expected per plan ("warnings OK, no errors").

## Known Stubs

None. All components are fully wired. The DesignSystem.tsx page renders real interactive components with actual state and live toast triggers.

## Threat Flags

None. No new network endpoints, auth paths, or trust boundaries introduced. All components are client-side UI only.

## Self-Check: PASSED
- `src/components/ui/button.tsx` — FOUND ✓
- `src/components/ui/input.tsx` — FOUND ✓
- `src/components/ui/textarea.tsx` — FOUND ✓
- `src/components/ui/select.tsx` — FOUND ✓
- `src/components/ui/card.tsx` — FOUND ✓
- `src/components/ui/badge.tsx` — FOUND ✓
- `src/components/ui/spinner.tsx` — FOUND ✓
- `src/components/ui/skeleton.tsx` — FOUND ✓
- `src/components/ui/index.ts` — FOUND ✓
- `src/pages/DesignSystem.tsx` — FOUND ✓
- Commit `cb17a7f` — FOUND ✓
