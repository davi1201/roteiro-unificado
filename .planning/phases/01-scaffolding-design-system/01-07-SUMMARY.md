---
phase: 1
plan: "01-07"
title: "Configurar ESLint + Prettier + Husky"
status: done
completed_at: "2025-05-22"
commit: "7e8c0f9"
subsystem: toolchain
tags: [eslint, prettier, husky, lint-staged, code-quality]
key-files:
  created:
    - roteiro-unificado/.prettierrc
    - roteiro-unificado/.prettierignore
    - .husky/pre-commit
    - .husky/_/husky.sh
  modified:
    - roteiro-unificado/eslint.config.js
    - roteiro-unificado/package.json
    - roteiro-unificado/package-lock.json
tech-stack:
  added:
    - eslint@10.4.0 (flat config)
    - typescript-eslint@8.59.4
    - eslint-plugin-react-hooks@7.1.1
    - eslint-plugin-react-refresh@0.4.20
    - eslint-config-prettier@10.1.5
    - prettier@3.8.3
    - prettier-plugin-tailwindcss@0.8.0
    - husky@9.1.7
    - lint-staged@16.4.0
  patterns:
    - ESLint 10 flat config (eslint.config.js)
    - Prettier with Tailwind class ordering plugin
    - Husky v9 pre-commit hooks via lint-staged
decisions:
  - "eslint-plugin-react-hooks upgraded from planned 5.2.0 to 7.1.1 (adds ESLint 10 peer dep support)"
  - "lint-staged downgraded from planned 17.0.5 to 16.4.0 (Node 20 compatibility; 17.x requires Node 22.22.1)"
  - "Husky initialized manually (git root differs from app dir); pre-commit uses `cd roteiro-unificado && npx lint-staged`"
  - "prepare script set to `cd .. && husky` to locate git root from app subdirectory"
---

# Phase 1 Plan 07: Configurar ESLint + Prettier + Husky — Summary

**One-liner:** ESLint 10 flat config with typescript-eslint + react-hooks + react-refresh plugins, Prettier 3 with Tailwind class ordering, Husky v9 pre-commit enforcement via lint-staged.

## What Was Built

- **`eslint.config.js`** — replaced Vite's default config with plan's flat config using `tseslint.config()`, typescript-eslint recommended rules, react-hooks and react-refresh plugins, and `eslint-config-prettier` as last element to prevent rule conflicts
- **`.prettierrc`** — single-quote, no-semi, 100-char width, Tailwind plugin for automatic class sorting
- **`.prettierignore`** — excludes dist, node_modules, .husky, public, *.md
- **`.husky/pre-commit`** — runs `cd roteiro-unificado && npx lint-staged` on staged files
- **`package.json`** — added scripts: `lint`, `lint:fix`, `format`, `type-check`, `prepare`; added `lint-staged` config
- **git config** — `core.hooksPath = .husky` configured at git root

## Verification Results

| Check | Result |
|-------|--------|
| `npm run lint` | ✅ Passed — no errors |
| `npm run type-check` | ✅ Passed — no output |
| `.husky/pre-commit` content | ✅ `cd roteiro-unificado && npx lint-staged` |
| lint-staged in package.json | ✅ TS/TSX and JSON/CSS/MD patterns configured |
| Pre-commit hook fired during commit | ✅ lint-staged ran successfully during feat(01-07) commit |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Version Incompatibility] `eslint-plugin-react-hooks@5.2.0` → `7.1.1`**
- **Found during:** Task 1 — npm install
- **Issue:** `eslint-plugin-react-hooks@5.2.0` declares peer dep `eslint@^3-9` which excludes ESLint 10. npm refused to install with ERESOLVE.
- **Fix:** Upgraded to `eslint-plugin-react-hooks@7.1.1` which adds `^10.0.0` to peer dep range. API is compatible — `configs.recommended.rules` still exists.
- **Files modified:** `roteiro-unificado/package.json`

**2. [Rule 1 - Version Incompatibility] `lint-staged@17.0.5` → `16.4.0`**
- **Found during:** Task 1 — npm install (engine warning)
- **Issue:** `lint-staged@17.0.5` requires Node >=22.22.1; running Node v20.19.3.
- **Fix:** Downgraded to `lint-staged@16.4.0` which requires Node >=20.17 (compatible with v20.19.3). Feature set is equivalent for this project's use case.
- **Files modified:** `roteiro-unificado/package.json`

**3. [Rule 3 - Blocking] Husky git root vs. app subdirectory setup**
- **Found during:** Task 5 — `npx husky init`
- **Issue:** Git root is `/Roteiro Unificado/` but the npm project is `/Roteiro Unificado/roteiro-unificado/`. `npx husky init` reports ".git can't be found" when run from the app subdirectory.
- **Fix:** Manually created `.husky/` directory at git root, set `git config core.hooksPath .husky`, created `pre-commit` hook with `cd roteiro-unificado && npx lint-staged`. Updated `prepare` script to `cd .. && husky` so it finds the git root.
- **Files modified:** `.husky/pre-commit` (git root), `roteiro-unificado/package.json`

## Known Stubs

None — this is a pure toolchain configuration plan with no UI or data-rendering components.

## Threat Flags

None — toolchain configuration with no network endpoints or auth paths introduced.

## Self-Check: PASSED

- ✅ `roteiro-unificado/eslint.config.js` — exists, correct content
- ✅ `roteiro-unificado/.prettierrc` — exists
- ✅ `roteiro-unificado/.prettierignore` — exists
- ✅ `.husky/pre-commit` — exists, executable
- ✅ `roteiro-unificado/package.json` — has lint-staged config and all scripts
- ✅ Commit `7e8c0f9` — exists in git log
