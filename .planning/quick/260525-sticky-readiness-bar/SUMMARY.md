---
slug: sticky-readiness-bar
date: 2026-05-25
status: complete
---

# Summary

Added `sticky top-1 z-30` to ReadinessClassification div.

## Change
`ReadinessClassification.tsx:35` — `mb-4 flex flex-wrap...` → `sticky top-1 z-30 mb-4 flex flex-wrap...`

## Rationale
- `top-1` (4px) clears ProgressBar (h-1, sticky top-0 z-40)
- `z-30` stays below ProgressBar but above form content
- Bar stays visible as user scrolls through long assessment form
