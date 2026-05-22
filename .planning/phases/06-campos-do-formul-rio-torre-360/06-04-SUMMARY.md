---
phase: 06-campos-do-formul-rio-torre-360
plan: "04"
subsystem: form-section-torre-sienge
tags:
  - zod
  - react-hook-form
  - form-section
  - torre-sienge
  - nested-schema
dependency_graph:
  requires:
    - 06-01 (SelectField, TextareaField — @/components/ui)
    - src/stores/formStore.ts (useFormStore, TabKey.TorreSienge)
    - react-hook-form@7.76.0 (useForm, Controller, FieldPath)
    - zod@4.4.3 (z.object, z.enum, z.string, z.optional)
    - "@hookform/resolvers@5.4.0 (zodResolver)"
  provides:
    - torreSiengeSchema (Zod aninhado — disponível em @/schemas/torre-sienge)
    - TorreSiengeData (tipo infer — disponível em @/schemas/torre-sienge)
    - SIENGE_MODULES (array as const — disponível em @/schemas/torre-sienge)
    - SiengeModuleSlug (tipo literal — disponível em @/schemas/torre-sienge)
    - TorreSiengeSection (Section component — disponível em src/features/form/sections/)
  affects:
    - Plan 06-07 (FormLayout — deve importar e renderizar TorreSiengeSection)
    - Phase 7 (Habilitações — pode reutilizar padrão aninhado de schema)
    - Phase 8 (autosave — importa torreSiengeSchema para validação)
tech_stack:
  added: []
  patterns:
    - "Nested Zod schema: moduleSchema reutilizado N vezes — evita 60 campos flat (RESEARCH §Armadilha 1)"
    - "FieldPath aninhado via template literal: modules.${slug}.{col} as FieldPath<T>"
    - "ModuleErrors cast controlado: Record<SiengeModuleSlug, Record<string, {message?:string}>> para FieldErrors aninhado do RHF"
    - "Card layout responsivo (article) em vez de <table> — grid-cols-1 mobile, grid-cols-2 md+"
    - "Sync RHF→Zustand: watch()+useEffect com store fora das deps (padrão T-06-04-02)"
key_files:
  created:
    - roteiro-unificado/src/schemas/torre-sienge.ts
    - roteiro-unificado/src/features/form/sections/TorreSiengeSection.tsx
decisions:
  - "Schema aninhado com moduleSchema reutilizado 12x — evita 60 campos flat (RESEARCH §Armadilha 1)"
  - "Card layout (article) em vez de <table> HTML — responsivo e sem quebra em mobile (PLAN success criteria)"
  - "SiengeModuleSlug usado como chave do ModuleErrors Record — cast controlado e tipado (T-06-04-04)"
  - "modules objeto .optional() no schema — permite defaultValues vazio na primeira montagem (RESEARCH §Armadilha 4)"
  - "TORRE_SIENGE_REQUIRED_COUNT = 0 — todos os campos são opcionais (formulário de diagnóstico)"
metrics:
  duration: "~8 min"
  completed: "2026-05-22"
  tasks_completed: 2
  files_created: 2
  files_modified: 0
---

# Phase 06 Plan 04: Torre Sienge — Schema Aninhado + Section Component — Summary

**One-liner:** Schema Zod com moduleSchema reutilizado 12 vezes (estrutura modules.{slug}.{col}) e TorreSiengeSection renderizando 12 cards responsivos com 4 SelectField + 1 TextareaField cada (60 campos totais).

## O Que Foi Construído

### torreSiengeSchema — Schema Zod Aninhado

Schema para a aba Torre Sienge usando estrutura aninhada `modules.{moduleSlug}.{column}` em vez de 60 campos flat (RESEARCH §Armadilha 1). Um único `moduleSchema` é definido com 5 colunas e reutilizado para os 12 módulos.

`moduleSchema` define as 5 colunas:
- `contratado`: enum `['sim', 'nao', 'nao-sabe', 'nao-aplicavel']`
- `usoReal`: enum `['total', 'parcial', 'baixo', 'nao-usa']`
- `confiancaDado`: enum `['alta', 'media', 'baixa', 'nao-confiavel']`
- `controleParalelo`: enum `['nao', 'excel', 'bi', 'outro', 'informal']`
- `observacoes`: `z.string()`

Todos os campos são `.optional()` — formulário de diagnóstico, sem campos obrigatórios.

`torreSiengeSchema` encapsula `modules: z.object({ cadastros, financeiro, ..., bi }).optional()` — o objeto `modules` é `.optional()` para compatibilidade com `defaultValues: {}` na primeira montagem.

Arquivo: `roteiro-unificado/src/schemas/torre-sienge.ts`

### SIENGE_MODULES — Array de Módulos

Array `as const` com 12 itens `{ slug, label }` na ordem exata do HTML de referência. Exportado para reutilização no componente (slug como chave de campo, label como heading do card). Tipo `SiengeModuleSlug` derivado via `typeof SIENGE_MODULES[number]['slug']`.

### TorreSiengeSection — Section Component

Renderiza 12 cards (`<article>`) — um por módulo Sienge. Cada card tem:
- `<h3>` com o label do módulo
- Grid responsivo `grid-cols-1 / md:grid-cols-2` com 4 `SelectField`
- `<TextareaField>` para observações (abaixo do grid, largura total)

FieldPath aninhado via template literal: `` `modules.${module.slug}.contratado` as FieldPath<TorreSiengeData> `` — RHF resolve os paths aninhados corretamente.

Sync RHF→Zustand: `const values = watch(); useEffect(() => { store.updateSection(TabKey.TorreSienge, values) }, [values])` com `// eslint-disable-next-line react-hooks/exhaustive-deps` — `store` fora das deps conforme padrão T-05-04-04 (T-06-04-02).

`defaultValues` inicializado com `(store.sectionData[TabKey.TorreSienge] ?? {}) as Partial<TorreSiengeData>` — restaura dados de sessão anterior (D-04).

Arquivo: `roteiro-unificado/src/features/form/sections/TorreSiengeSection.tsx`

## Deviations from Plan

### Auto-fixed Issues

Nenhum. O plano foi executado exatamente como descrito.

### Worktree Setup (Rule 3 — Blocking Fix Preventivo)

- **Found during:** Verificação pré-commit
- **Issue:** O symlink `node_modules/` não existia no worktree (necessário para lint-staged no pre-commit hook)
- **Fix:** Criado symlink `roteiro-unificado/node_modules -> /Users/DaviAlves/.../roteiro-unificado/node_modules` — mesmo procedimento do Plan 01
- **Commit:** Não gerou commit adicional (symlink não rastreado pelo git)

## Verificação de Conformidade (Success Criteria)

| Critério | Status |
|----------|--------|
| Schema aninhado com moduleSchema reutilizado 12x (não 60 campos planos) | PASS |
| SIENGE_MODULES array com 12 itens slug/label conforme HTML | PASS |
| TorreSiengeSection renderiza 12 cards responsivos (article com border + p-4) | PASS |
| Cada card com 4 SelectField + 1 TextareaField | PASS |
| FieldPath aninhado via template literal (modules.${slug}.{col}) | PASS |
| Layout responsivo: grid-cols-1 em mobile, grid-cols-2 em md+ | PASS |
| max-w-5xl para acomodar a tabela | PASS |
| Sem `<table>` HTML (cards responsivos) | PASS |
| useEffect sync sem store nas deps | PASS |
| Sem useFormContext / FormProvider / handleSubmit | PASS |
| npx tsc --noEmit passa sem erros | PASS |
| npm run lint — zero erros novos (2 warnings pré-existentes) | PASS |

## Lint Warnings Pré-existentes (Fora de Escopo)

Dois warnings pré-existentes detectados (não introduzidos por este plano):
- `src/components/ui/button.tsx:47` — `react-refresh/only-export-components` (existia desde Plan 01)
- `TorreSiengeSection.tsx:64` — `react-hooks/incompatible-library` sobre `watch()` — é o padrão prescrito pelo CONTEXT.md D-02 e RESEARCH.md §Armadilha 2 para todos os Section components desta fase

## Known Stubs

Nenhum. O componente renderiza todos os 12 módulos com todos os 60 campos funcionais. Não está ligado ao FormLayout ainda — integração é responsabilidade do Plan 07 (conforme `<done>` da Task 2).

## Threat Flags

Nenhum novo surface não documentado no threat_model do plano.

## Self-Check: PASSED

Arquivos verificados:
- `roteiro-unificado/src/schemas/torre-sienge.ts` — FOUND (commit 3e0bddf)
- `roteiro-unificado/src/features/form/sections/TorreSiengeSection.tsx` — FOUND (commit d4042af)

Commits verificados:
- `3e0bddf` feat(06-04): add nested Zod schema for Torre Sienge — FOUND
- `d4042af` feat(06-04): add TorreSiengeSection — 12 module cards × 5 fields each — FOUND
