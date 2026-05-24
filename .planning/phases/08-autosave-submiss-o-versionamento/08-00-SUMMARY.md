---
phase: 08-autosave-submiss-o-versionamento
plan: "00"
subsystem: testing
tags: [vitest, jsdom, testing-library, react, typescript]

# Dependency graph
requires: []
provides:
  - "Vitest 4.1.7 instalado como devDependency no roteiro-unificado"
  - "vitest.config.ts com environment jsdom, include src/**/*.test.ts(x), alias @ para ./src"
  - "Script 'test: vitest' no package.json"
  - "4 arquivos stub de teste (it.todo) prontos para substituição TDD nos planos 08-02 e 08-03"
  - "npx vitest run sai com código 0 — infraestrutura validada"
affects:
  - "08-01-autosave-hook (usa vitest run no verify)"
  - "08-02-submit-new-revision (usa TDD com vitest)"
  - "08-03-readiness-tests (usa TDD com vitest)"

# Tech tracking
tech-stack:
  added:
    - "vitest@4.1.7 (framework de teste)"
    - "@vitest/coverage-v8@4.1.7 (cobertura de código)"
    - "@testing-library/react@16.3.2 (utilities para testar React hooks)"
    - "@testing-library/user-event@14.6.1 (simulação de eventos de usuário)"
    - "jsdom@29.1.1 (simulação de DOM no Node.js)"
  patterns:
    - "Arquivos de teste ficam ao lado dos módulos (co-located): src/hooks/useX.test.ts, src/lib/y.test.ts"
    - "Imports explícitos de vitest (describe, it, expect) em vez de globals para evitar conflito com tsconfig"
    - "it.todo como placeholder para TDD RED→GREEN nos planos subsequentes"

key-files:
  created:
    - "roteiro-unificado/vitest.config.ts"
    - "roteiro-unificado/src/hooks/useAutosave.test.ts"
    - "roteiro-unificado/src/lib/readiness.test.ts"
    - "roteiro-unificado/src/features/form/useSubmitAssessment.test.ts"
    - "roteiro-unificado/src/features/form/useNewRevision.test.ts"
  modified:
    - "roteiro-unificado/package.json (script 'test: vitest' + 5 devDependencies)"
    - "roteiro-unificado/package-lock.json"

key-decisions:
  - "Usar imports explícitos de vitest (describe, it, expect) em vez de globals: tsconfig.json já tem types=['vite/client'] e não inclui 'vitest/globals' — evita conflito"
  - "vitest.config.ts separado de vite.config.ts: permite configurar test.environment=jsdom sem afetar o build de produção"
  - "Usar fileURLToPath para __dirname no vitest.config.ts: projeto é ESM (type:module), __dirname não existe nativamente — segue padrão já estabelecido no vite.config.ts"

patterns-established:
  - "Test co-location: arquivos de teste ficam no mesmo diretório do módulo testado (não em __tests__/)"
  - "Vitest config separado de Vite config para não poluir build de produção"

requirements-completed:
  - SAVE-01
  - SAVE-02
  - SAVE-03
  - SAVE-04
  - SAVE-05
  - UX-04

# Metrics
duration: 8min
completed: 2026-05-24
---

# Phase 8 Plan 00: Infraestrutura Vitest Summary

**Vitest 4.1.7 instalado com jsdom e 4 arquivos stub de teste criados — `npx vitest run` passa com código 0, habilitando TDD nos planos 08-01 a 08-03**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-05-24T01:01:00Z
- **Completed:** 2026-05-24T01:09:59Z
- **Tasks:** 2
- **Files modified:** 7 (2 modificados, 5 criados)

## Accomplishments

- Vitest 4.1.7 + coverage-v8 + testing-library + jsdom instalados como devDependencies
- `vitest.config.ts` criado com environment jsdom, include pattern `src/**/*.test.ts(x)`, alias `@` para `./src`, usando `fileURLToPath` para compatibilidade ESM
- 4 arquivos stub de teste com `it.todo` criados para hooks da Phase 8 (19 casos de teste mapeados)
- `npx vitest run` sai com código 0 — todos os 19 `it.todo` passam vacuamente

## Task Commits

Cada tarefa foi commitada atomicamente:

1. **Tarefa 1: Instalar Vitest e criar vitest.config.ts** - `dd88519` (chore)
2. **Tarefa 2: Criar arquivos stub de teste** - `2c382fa` (test)

## Files Created/Modified

- `roteiro-unificado/vitest.config.ts` — Configuração Vitest com jsdom, include pattern, alias @
- `roteiro-unificado/package.json` — Script `test: vitest` adicionado + 5 devDependencies
- `roteiro-unificado/package-lock.json` — Lock file atualizado (86 pacotes adicionados)
- `roteiro-unificado/src/hooks/useAutosave.test.ts` — 5 it.todo para SAVE-01, SAVE-02, UX-04
- `roteiro-unificado/src/lib/readiness.test.ts` — 4 it.todo para calculateReadiness
- `roteiro-unificado/src/features/form/useSubmitAssessment.test.ts` — 5 it.todo para SAVE-03
- `roteiro-unificado/src/features/form/useNewRevision.test.ts` — 5 it.todo para SAVE-04, SAVE-05

## Decisions Made

- **Imports explícitos de vitest em vez de globals:** `tsconfig.json` tem `types: ["vite/client"]` — adicionar `vitest/globals` poderia causar conflito de tipos. Solução: `import { describe, it } from 'vitest'` em cada arquivo de teste.
- **vitest.config.ts separado de vite.config.ts:** Permite configurar `test.environment: 'jsdom'` sem impactar o build de produção do Vite.
- **fileURLToPath para __dirname:** Projeto usa `type: "module"` no package.json — `__dirname` não existe em ESM nativamente. Segue padrão já estabelecido no `vite.config.ts` existente.

## Deviations from Plan

Nenhuma — plano executado exatamente como especificado.

## Issues Encountered

Nenhum problema encontrado. O npm install do worktree precisou ser executado primeiro (`npm install` para montar node_modules da base antes do `npm install -D vitest ...`), o que é comportamento normal de um git worktree recém-criado.

## User Setup Required

Nenhum — nenhuma configuração externa necessária. Todos os pacotes são devDependencies instalados localmente.

## Next Phase Readiness

- Infraestrutura Vitest operacional: `npx vitest run` passa com código 0
- Os 4 arquivos stub estão prontos para substituição por testes reais nos planos 08-01 (autosave hook), 08-02 (submit + new revision) e 08-03 (readiness function)
- Todos os planos subsequentes da Phase 8 podem usar `npx vitest run` em seus `<verify>` com segurança
- Nenhum bloqueador identificado

---
*Phase: 08-autosave-submiss-o-versionamento*
*Completed: 2026-05-24*
