---
slug: sticky-readiness-bar
date: 2026-05-25
status: complete
---

# Sticky Readiness Classification Bar

## Goal
Make the ReadinessClassification div sticky at the top of the viewport as users scroll through the long assessment form.

## File
`roteiro-unificado/src/features/form/ReadinessClassification.tsx` — line 35

## Change
Add `sticky top-1 z-30` to the div className.
- `top-1` = 4px — clears the ProgressBar (h-1, sticky top-0 z-40)
- `z-30` — below ProgressBar (z-40) but above form content

## Before
`className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"`

## After
`className="sticky top-1 z-30 mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"`
