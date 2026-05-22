---
status: testing
phase: 01-scaffolding-design-system
source:
  - 01-01-SUMMARY.md
  - 01-02-SUMMARY.md
  - 01-03-SUMMARY.md
  - 01-04-SUMMARY.md
  - 01-05-SUMMARY.md
  - 01-06-SUMMARY.md
  - 01-07-SUMMARY.md
started: 2026-05-22T10:54:00-03:00
updated: 2026-05-22T10:54:00-03:00
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 1
name: Cold Start Smoke Test
expected: |
  Kill any running dev server. Run `cd roteiro-unificado && npm run dev` from scratch.
  The dev server boots without errors and http://localhost:5173 loads the DesignSystem page
  (showing buttons, inputs, badges, etc.) without a blank screen or console crash.
awaiting: user response

## Tests

### 1. Cold Start Smoke Test
expected: |
  Kill any running dev server. Run `cd roteiro-unificado && npm run dev` from scratch.
  The dev server boots without errors and http://localhost:5173 loads the DesignSystem page
  (showing buttons, inputs, badges, etc.) without a blank screen or console crash.
result: [pending]

### 2. Design System Page — Brand Colors
expected: |
  The page background is white/light. There is a heading/section with the deep blue (#123B66)
  brand color visible (e.g. primary buttons or header text). An orange (#F28C28) accent color
  appears on at least one element. The layout is structured (not unstyled HTML).
result: [pending]

### 3. Button Variants & Loading State
expected: |
  The DesignSystem page shows buttons in at least 4 variants: Primary (blue filled), Secondary
  (outlined or subtle), Ghost (transparent), and Danger (red). Clicking any button does not crash
  the page. If an isLoading button exists, it shows a spinner and becomes non-interactive.
result: [pending]

### 4. Form Inputs — Error State
expected: |
  An Input field is visible. When focused or when error state is active, a red border/message
  appears below the field. Textarea and Select components also render (even if no error state
  is triggered, just that they appear and accept interaction without crashes).
result: [pending]

### 5. Toast Notification System
expected: |
  Clicking "Toast Sucesso" (or equivalent) triggers a green notification toast in the top-right
  corner that auto-dismisses after ~4 seconds. Clicking "Toast Erro" shows a red toast.
  "Toast Loading" shows a loading spinner toast. "Toast Promise" shows loading then resolves to
  success or error randomly after ~2 seconds.
result: [pending]

### 6. Badge Grades (G1–G5)
expected: |
  Five badge chips are visible, labeled G1 through G5 (or Crítico/Baixo/Médio/Bom/Excelente).
  Colors: G1 red, G2 orange-red, G3 yellow (with DARK text — not white), G4 blue/green, G5 green/teal.
  All text is legible (high contrast).
result: [pending]

### 7. Pre-Commit Quality Gate
expected: |
  Stage any small change to a `.ts` or `.tsx` file (e.g. add a blank comment) and run `git commit`.
  Before the commit completes, lint-staged runs ESLint + Prettier on the staged files. If the file is
  clean, the commit proceeds. The hook fires — you see output from lint-staged in the terminal.
result: [pending]

## Summary

total: 7
passed: 0
issues: 0
skipped: 0
pending: 7

## Gaps

[none yet]
