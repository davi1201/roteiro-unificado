---
quick_id: 260524-mrz
slug: fix-formlayout-tsx-footer-inside-main-si
description: "fix FormLayout.tsx — footer inside main, sidebar sticky, padding p-6/p-8"
date: 2026-05-24
files_modified:
  - roteiro-unificado/src/features/form/FormLayout.tsx
must_haves:
  truths:
    - Footer renders as a bar at bottom of form content, not a 3rd flex column
    - Form sidebar stays visible when scrolling long sections
    - Form content padding matches admin (p-8 on desktop)
  artifacts:
    - roteiro-unificado/src/features/form/FormLayout.tsx
---

# Quick Task 260524-mrz: Fix FormLayout.tsx — 3 UI Review Blockers

## Objective

Fix 3 issues identified in the Phase 9.5 UI review in `FormLayout.tsx`:
1. BLOCKER: Footer is 3rd flex column on desktop (must be inside `<main>`)
2. BLOCKER: Form sidebar not sticky (scrolls away on long sections)
3. WARNING: Form content padding too tight vs admin (p-4/p-6 → p-6/p-8)

## Tasks

### Task 1: Move footer inside `<main>` and fix padding

**File:** `roteiro-unificado/src/features/form/FormLayout.tsx`

The outer flex container `<div className="flex flex-1 flex-col md:flex-row">` has 3 children:
`<aside>`, `<main>`, and the sticky footer `<div>`.

On `md:flex-row` the footer becomes a 3rd column instead of a bottom bar.

**Fix:**
- Move the entire footer `<div>` (the one with `sticky bottom-0` containing the prev/next/submit buttons) to be the LAST child inside `<main>`, before `</main>`
- Change `<main>` padding from `p-4 pb-24 md:p-6 md:pb-24` to `p-6 md:p-8`
  (pb-24 is no longer needed since footer is inside main and doesn't overlap content)
- The footer div should keep `sticky bottom-0` — inside main it will correctly stick to bottom of viewport

**verify:** `npm run build` passes, no new TS errors

**done:** Footer is child of `<main>`, not sibling of `<aside>`

### Task 2: Make form sidebar sticky

**File:** `roteiro-unificado/src/features/form/FormLayout.tsx`

The `<aside>` for the form tab navigation is a static flex child — it scrolls off screen on sections taller than the viewport.

**Fix:** Add `md:sticky md:top-0 md:h-screen md:overflow-y-auto` to the `<aside>` element's className.

Current aside className includes something like `hidden md:flex md:flex-col md:w-60 ...`
Add: `md:sticky md:top-0 md:h-screen md:overflow-y-auto`

**verify:** Sidebar tab navigation remains visible when scrolling

**done:** `<aside>` has sticky positioning classes

### Task 3: Verify build + tests pass

Run:
```bash
cd roteiro-unificado && npm run build && npm test -- --run
```

**done:** Build clean, all tests pass
