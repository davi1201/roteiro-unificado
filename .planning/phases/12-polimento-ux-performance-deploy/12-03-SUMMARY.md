---
phase: 12-polimento-ux-performance-deploy
plan: "03"
subsystem: build-performance
tags: [vite, rolldown, code-splitting, bundle-optimization, ux-05]
dependency_graph:
  requires: []
  provides: [bundle-code-splitting]
  affects: [roteiro-unificado/vite.config.ts]
tech_stack:
  added: []
  patterns: [rolldown-code-splitting, vite8-rolldownOptions]
key_files:
  created: []
  modified:
    - roteiro-unificado/vite.config.ts
decisions:
  - "Usar build.rolldownOptions.output.codeSplitting.groups (Vite 8 / Rolldown) — manualChunks removido/depreciado"
  - "Três grupos de chunks: react-vendor (priority 30), supabase (priority 20), router (priority 10)"
  - "Bundle principal caiu de 812KB para 327KB; chunks vendor separados permitem cache duradouro"
metrics:
  duration: 56s
  completed: "2026-05-25"
  tasks_completed: 1
  tasks_total: 2
  files_modified: 1
---

# Phase 12 Plan 03: Bundle Optimization (Code Splitting Rolldown) Summary

**One-liner:** Code splitting Rolldown via `build.rolldownOptions.output.codeSplitting.groups` no Vite 8 — bundle único de 812KB dividido em react-vendor (190KB), supabase (201KB), router (93KB) e index (327KB).

## O que foi feito

Configurado `build.rolldownOptions.output.codeSplitting.groups` no `vite.config.ts` para separar o bundle único de produção de 812KB em quatro chunks distintos via Rolldown (bundler do Vite 8). A API correta para Vite 8 é `build.rolldownOptions` — não `build.rollupOptions.manualChunks` que foi removido/depreciado.

## Resultado do Build

| Chunk | Tamanho | gzip |
|-------|---------|------|
| react-vendor | 189.64 kB | 59.65 kB |
| supabase | 200.64 kB | 51.59 kB |
| router | 92.90 kB | 30.56 kB |
| index (app code) | 327.48 kB | 88.47 kB |
| rolldown-runtime | 0.56 kB | 0.36 kB |
| index.css | 29.01 kB | 6.23 kB |

Antes: 1 chunk de 812KB com warning "Some chunks are larger than 500 kB".
Depois: bundle principal de 327KB, sem warnings. Chunks vendor separados para cache duradouro do browser.

## Critérios de Aceitação — Status

| Critério | Status |
|----------|--------|
| vite.config.ts contém `rolldownOptions` e `codeSplitting` | PASSOU |
| vite.config.ts NÃO contém `manualChunks` nem `rollupOptions` | PASSOU |
| `npm run build` sai com código 0 | PASSOU |
| Chunks `react-vendor`, `supabase`, `router` aparecem separados | PASSOU |
| Nenhum warning de chunk > 500KB | PASSOU |
| tsc -b passa (parte do `npm run build`) | PASSOU |

## Checkpoint Pendente

O checkpoint `checkpoint:human-verify` (Task 2 / gate: blocking) aguarda verificação manual:

1. Confirmar chunks separados no output de `npm run build`
2. Rodar `npm run preview` (porta 4173) e medir Lighthouse Performance via Chrome DevTools
3. Alvo: Lighthouse Performance ≥ 85, FCP < 1.5s
4. Verificar aba Network: chunks de vendor como arquivos JS separados

## Desvios do Plano

Nenhum — plano executado exatamente como escrito. A API `rolldownOptions.output.codeSplitting.groups` funcionou conforme documentado no RESEARCH.md Pattern 1 + PATTERNS.md.

## Ameaças / Flags de Segurança

Nenhuma nova superfície de ataque introduzida. Apenas configuração de build; sem alteração de código runtime, credenciais ou endpoints.

## Self-Check: PASSED

- Arquivo `roteiro-unificado/vite.config.ts` existe e modificado: FOUND
- Commit `3ac77e8` existe: FOUND (`git log --oneline -1` = `3ac77e8 perf(12-03): configure Rolldown code splitting via rolldownOptions`)
- Build de produção verde com 4 chunks separados: PASSED
- Sem `manualChunks` nem `rollupOptions`: PASSED
