---
phase: 06-campos-do-formul-rio-torre-360
plan: "03"
subsystem: form-section-torre-decisao
tags:
  - zod
  - react-hook-form
  - form-section
  - torre-decisao
  - conditional-field
dependency_graph:
  requires:
    - 06-01 (SelectField, TextareaField, CheckboxGroupField, ConditionalField, Input — @/components/ui)
    - src/stores/formStore.ts (useFormStore, TabKey.TorreDecisao)
    - react-hook-form@7.76.0 (useForm, Controller, zodResolver)
    - zod@4.4.3 (z.object, z.enum, z.array, z.string)
  provides:
    - torreDecisaoSchema — schema Zod da aba Torre Decisão com 10 campos (em @/schemas/torre-decisao)
    - TorreDecisaoData — tipo TypeScript inferido do schema
    - TORRE_DECISAO_REQUIRED_COUNT = 0 — constante para cálculo de completeness
    - TorreDecisaoSection — Section component com ConditionalField para qualBI (em @/features/form/sections)
  affects:
    - Plan 06-07 (FormLayout switch — integrará TorreDecisaoSection na navegação por abas)
    - Phase 8 (autosave — consumirá torreDecisaoSchema para validação server-side)
tech_stack:
  added: []
  patterns:
    - "Zod schema por aba: todos os campos .optional() + slugs sem acentos em enums"
    - "Section component com useForm<TorreDecisaoData> + zodResolver por aba (D-01)"
    - "D-02 sync pattern: const values = watch() + useEffect([values]) sem store nas deps"
    - "FORM-06 ConditionalField: condition={mostraQualBI} + unregisterFn={unregister} + qualBI .optional()"
    - "cast unregister as (name: string, ...) => void para compatibilidade com ConditionalField props"
key_files:
  created:
    - roteiro-unificado/src/schemas/torre-decisao.ts
    - roteiro-unificado/src/features/form/sections/TorreDecisaoSection.tsx
  modified: []
decisions:
  - "FORM-06 implementado: ConditionalField envolve qualBI com condition baseada em watch('existeBI') — campo desaparece e é unregistered quando existeBI != 'sim-power-bi' e != 'sim-outra'"
  - "Cast de unregister necessário: UseFormUnregister<TorreDecisaoData> não é assignável ao tipo genérico (name: string) => void do ConditionalField — cast seguro porque os field names são conhecidos em compile time"
  - "Todos os enums usam slugs sem acentos (RESEARCH §Armadilha 5): 'nao-estruturada', 'sim-power-bi', 'em-implantacao', etc."
  - "0 campos obrigatórios: HTML de referência §id=t_decisao não usa atributo required — TORRE_DECISAO_REQUIRED_COUNT = 0"
metrics:
  duration: "~10 min"
  completed: "2026-05-22"
  tasks_completed: 2
  files_created: 2
  files_modified: 0
---

# Phase 06 Plan 03: Schema e Section Torre Decisão — Summary

**One-liner:** Schema Zod com 10 campos (4 selects, 1 campo condicional, 3 textareas, 1 input, 1 checkbox array de 9) e TorreDecisaoSection com ConditionalField wiring completo para o padrão FORM-06.

## O Que Foi Construído

### torreDecisaoSchema (Zod)

Schema da aba Torre Decisão com 10 campos, todos `.optional()` conforme o HTML de referência (seção `id="t_decisao"` não usa `required`).

- **4 selects com slugs:** `reuniaoGestao` (5 opções), `comoInformacaoChega` (6 opções), `existeBI` (4 opções: `sim-power-bi`, `sim-outra`, `em-implantacao`, `nao`), `nivelGerencial` (5 opções: `g1`..`g5`)
- **Campo condicional:** `qualBI: z.string().optional()` — preparado para ConditionalField + unregister (RESEARCH §Armadilha 3)
- **3 inputs livres:** `quemPreparaInfo`, `relatoriosDiretoria`, `numerosQuestionados`
- **1 textarea:** `observacoesGerenciais`
- **CheckboxGroup:** `decisoesMelhorar: z.array(z.enum([9 slugs])).optional()` com 9 opções de decisões prioritárias

Exporta: `torreDecisaoSchema`, `type TorreDecisaoData`, `TORRE_DECISAO_REQUIRED_COUNT = 0`.

Arquivo: `roteiro-unificado/src/schemas/torre-decisao.ts`

### TorreDecisaoSection (React)

Section component que renderiza todos os campos da aba Torre Decisão em 3 grupos separados por `<hr>`.

**Grupo 1 — Ritual e fontes de decisão:**
- `SelectField` para `reuniaoGestao`, `comoInformacaoChega`, `existeBI`
- `ConditionalField` com `condition={mostraQualBI}` envolvendo `Input` para `qualBI`
  - `mostraQualBI = watchedExisteBI === 'sim-power-bi' || watchedExisteBI === 'sim-outra'`
  - `unregisterFn={unregister as ...}` garante limpeza do valor ao ocultar (T-06-03-01)
- `Input` para `quemPreparaInfo`
- `TextareaField` para `relatoriosDiretoria` e `numerosQuestionados`

**Grupo 2 — Decisões prioritárias:**
- `CheckboxGroupField` para `decisoesMelhorar` com 9 opções e labels do HTML de referência

**Grupo 3 — Nível gerencial:**
- `SelectField` para `nivelGerencial` com descrições G1..G5
- `TextareaField` para `observacoesGerenciais`

**Integração RHF + Zustand:**
- `useForm<TorreDecisaoData>` com `zodResolver(torreDecisaoSchema)` e `defaultValues` da store
- Sync D-02: `const values = watch()` + `useEffect([values])` sem `store` nas deps (padrão T-05-04-04)

Arquivo: `roteiro-unificado/src/features/form/sections/TorreDecisaoSection.tsx`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Cast de unregister para compatibilidade de tipos com ConditionalField**
- **Found during:** Task 2 — tsc falhou com "UseFormUnregister não é assignável a (name: string) => void"
- **Issue:** O tipo `UseFormUnregister<TorreDecisaoData>` usa `FieldPath<TorreDecisaoData>` (union de chaves do schema) como parâmetro de `name`, mas `ConditionalField.unregisterFn` espera `(name: string, ...) => void`. TypeScript não permite atribuição porque `string` não é assignável a um union mais específico.
- **Fix:** Cast explícito: `unregisterFn={unregister as (name: string, options?: { keepValue?: boolean }) => void}`. Cast é seguro em runtime porque o `fieldName="qualBI"` passado para ConditionalField é de fato uma chave válida do schema.
- **Files modified:** `TorreDecisaoSection.tsx`
- **Commit:** `126d8a2`

**2. [Rule 3 - Blocking] Symlink node_modules no worktree**
- **Found during:** Task 1 — tsc e lint não encontravam o compilador TypeScript
- **Issue:** Este worktree (agent-a0eb422ea1cc69e4b) não tinha `node_modules/` — apenas o worktree do Plan 01 teve o symlink criado.
- **Fix:** Criado symlink `roteiro-unificado/node_modules -> /Users/DaviAlves/.../roteiro-unificado/node_modules`. O symlink não é rastreado pelo git.
- **Commit:** Não gerou commit adicional

### Aviso de React Compiler (Não Bloqueante)

O ESLint emite 2 warnings sobre `react-compiler/react-compiler` no `TorreDecisaoSection.tsx`:

```
warning  Compilation Skipped: Use of incompatible library
React Hook Form's `useForm()` API returns a `watch()` function which cannot be memoized safely.
```

Este é um warning esperado e documentado. O React Compiler não consegue memoizar componentes que usam `watch()` do RHF — comportamento documentado na RESEARCH como padrão aceito para o projeto. Zero errors de lint.

## Verificação de Conformidade (Success Criteria)

| Critério | Status |
|----------|--------|
| Schema com 10 chaves cobrindo todos os campos da aba Torre Decisão do HTML | PASS |
| Todos os enums usam slugs (não labels acentuadas) | PASS |
| qualBI é `z.string().optional()` (compatível com ConditionalField + unregister) | PASS |
| TorreDecisaoSection wireia ConditionalField com condition=watch('existeBI') | PASS |
| unregisterFn={unregister} conectado ao ConditionalField | PASS |
| Todos os 10 campos do HTML §id="t_decisao" renderizados | PASS |
| Labels de options refletem texto do HTML; values usam slugs do schema | PASS |
| Sync watch+useEffect funcional sem `store` nas deps | PASS |
| tsc --noEmit: 0 erros | PASS |
| npm run lint: 0 erros (2 warnings esperados sobre React Compiler + RHF) | PASS |
| Exporta TorreDecisaoData e TORRE_DECISAO_REQUIRED_COUNT | PASS |

## Threat Mitigations Aplicadas

| Threat ID | Mitigação |
|-----------|-----------|
| T-06-03-01 | unregisterFn={unregister} no ConditionalField + qualBI .optional() — valor é removido ao desmontar |
| T-06-03-02 | Padrão T-05-04-04 aplicado: store fora das deps do useEffect, eslint-disable documentado |
| T-06-03-03 | Slugs nos enums (sim-power-bi, em-implantacao, etc.) — labels acentuadas ficam apenas em options[] |

## Known Stubs

Nenhum. Todos os campos têm opções completas do HTML de referência. O componente não está conectado ao FormLayout ainda — isso é intencional (Plan 06-07). Não é um stub; é uma entrega isolada como especificado no plano.

## Self-Check: PASSED

Arquivos verificados:
- `roteiro-unificado/src/schemas/torre-decisao.ts` — FOUND (commit b506360)
- `roteiro-unificado/src/features/form/sections/TorreDecisaoSection.tsx` — FOUND (commit 126d8a2)

Commits verificados:
- `b506360` feat(06-03): add Zod schema for Torre Decisão tab — FOUND
- `126d8a2` feat(06-03): add TorreDecisaoSection with ConditionalField for qualBI — FOUND
