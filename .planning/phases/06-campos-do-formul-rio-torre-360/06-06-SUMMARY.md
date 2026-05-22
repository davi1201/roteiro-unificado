---
phase: 06-campos-do-formul-rio-torre-360
plan: "06"
subsystem: form-section-torre-classificacao
tags:
  - zod
  - react-hook-form
  - form-section
  - torre-classificacao
dependency_graph:
  requires:
    - 06-01 (SelectField, TextareaField, CheckboxGroupField em @/components/ui)
    - src/stores/formStore.ts (TabKey.TorreClassificacao, useFormStore, updateSection)
    - @hookform/resolvers/zod (zodResolver)
    - react-hook-form@7.76.0 (useForm, Controller)
  provides:
    - torreClassificacaoSchema (Zod schema da aba Torre Classificação)
    - TorreClassificacaoData (tipo TypeScript inferido do schema)
    - TORRE_CLASSIFICACAO_REQUIRED_COUNT = 0
    - TorreClassificacaoSection (Section component da aba Torre Classificação)
  affects:
    - Plan 06-07 (FormLayout — conectar TorreClassificacaoSection como última aba Torre 360)
    - Phase 8 (autosave Supabase importa os schemas)
tech_stack:
  added: []
  patterns:
    - "Zod schema por aba: z.object com .optional() em todos os campos — padrão D-07"
    - "Section component com useForm individualmente por aba — padrão D-01"
    - "Sync watch+useEffect sem store nas deps — padrão D-02/T-06-06-01"
    - "Props explícitas: tenantId only — sem FormProvider nem useFormContext (D-08)"
key_files:
  created:
    - roteiro-unificado/src/schemas/torre-classificacao.ts
    - roteiro-unificado/src/features/form/sections/TorreClassificacaoSection.tsx
  modified: []
decisions:
  - "Todos os 9 campos do schema são .optional() — HTML de referência não usa required; TORRE_CLASSIFICACAO_REQUIRED_COUNT = 0"
  - "Labels das opções de classificacaoFinal incluem descrição resumida do HTML (ex: T360-A — Pronta para integração) para facilitar escolha sem lookup externo"
  - "CheckboxGroupField sem showSelectAll — aba não tem seleção em massa; apenas 9 evidências individuais"
  - "Sync RHF→Zustand via watch()+useEffect com store excluído das deps (padrão T-06-06-01 = anti-loop)"
metrics:
  duration: "~5 min"
  completed: "2026-05-22"
  tasks_completed: 2
  files_created: 2
  files_modified: 0
---

# Phase 06 Plan 06: Aba Torre Classificação — Summary

**One-liner:** Schema Zod torreClassificacaoSchema (9 campos: 2 selects + 5 textareas + 1 checkbox group + 1 textarea final) e TorreClassificacaoSection com 2 SelectField + 6 TextareaField + 1 CheckboxGroupField, cobrindo 100% dos campos do HTML id="t_fechamento".

## O Que Foi Construído

### torreClassificacaoSchema

Schema Zod plano com 9 campos todos `.optional()`:

- `classificacaoFinal`: `z.enum(['t360-a', 't360-b', 't360-c', 't360-d', 't360-e'])`
- `abordagemRecomendada`: `z.enum(['integracao-sienge', 'hibrida-sienge-bi', 'ativacao-dados', 'reconciliacao-bi', 'projeto-preparatorio'])`
- `justificativa`, `fase1`, `fase2`, `foraEscopo`, `riscos`, `proximosPassos`: `z.string()`
- `evidenciasSolicitar`: `z.array(z.enum([...9 slugs...]))`

Exporta `TorreClassificacaoData = z.infer<typeof torreClassificacaoSchema>` e `TORRE_CLASSIFICACAO_REQUIRED_COUNT = 0`.

Arquivo: `roteiro-unificado/src/schemas/torre-classificacao.ts`

### TorreClassificacaoSection

Section component que segue o template consolidado das sections da Wave 2 (mesmo padrão de TorreAcessoSection). Organizado em 3 grupos separados por `<hr className="my-6 border-gray-100">`:

**Grupo 1 — Classificação da empresa:**
- `SelectField` classificacaoFinal com 5 opções T360-A..E (labels com descrição curta do HTML)
- `SelectField` abordagemRecomendada com 5 opções
- `TextareaField` justificativa

**Grupo 2 — Plano macro e riscos:**
- `TextareaField` fase1, fase2, foraEscopo, riscos

**Grupo 3 — Evidências essenciais a solicitar:**
- `CheckboxGroupField` evidenciasSolicitar com 9 opções
- `TextareaField` proximosPassos

Sync via `watch() + useEffect` com `store.updateSection(TabKey.TorreClassificacao, ...)` — sem `store` nas deps (padrão anti-loop T-06-06-01).

Arquivo: `roteiro-unificado/src/features/form/sections/TorreClassificacaoSection.tsx`

## Deviations from Plan

Nenhum. O plano foi executado exatamente como descrito. Sem condicionais, sem dependências extras, estrutura de 3 grupos seguindo o template da aba Torre Acesso (Plan 05).

## Verificação de Conformidade (Success Criteria)

| Critério | Status |
|----------|--------|
| Schema cobre 9 chaves da aba Torre Classificação conforme HTML | PASS |
| classificacaoFinal enum = ['t360-a'..'t360-e'] | PASS |
| abordagemRecomendada enum tem 5 valores incluindo integracao-sienge e projeto-preparatorio | PASS |
| evidenciasSolicitar é z.array(z.enum) com 9 valores | PASS |
| TORRE_CLASSIFICACAO_REQUIRED_COUNT = 0 exportado | PASS |
| TorreClassificacaoSection exporta função com nome correto | PASS |
| 2 SelectField (classificacaoFinal + abordagemRecomendada) renderizados | PASS |
| 6 TextareaField renderizados (justificativa + fase1 + fase2 + foraEscopo + riscos + proximosPassos) | PASS |
| 1 CheckboxGroupField (evidenciasSolicitar) renderizado | PASS |
| 8 labels do HTML presentes (Classificação final, Abordagem recomendada, ..., Próximos passos) | PASS |
| 9 labels de evidências presentes | PASS |
| 5 labels T360-A..E presentes | PASS |
| 5 labels de abordagem presentes | PASS |
| updateSection(TabKey.TorreClassificacao, ...) presente | PASS |
| Sync useEffect NÃO inclui store nas deps | PASS |
| Zero ocorrências de ConditionalField/useFormContext/FormProvider/handleSubmit | PASS |
| npx tsc --noEmit produz 0 erros | PASS |
| npm run lint não introduz novos erros | PASS (warnings pré-existentes do padrão watch/RHF — mesmos que TorreAcessoSection) |

## Lint — Aviso Pré-existente do Padrão

O warning `react-hooks/incompatible-library` sobre `watch()` do RHF é **pré-existente no padrão** de todos os Section components (mesmo aviso presente em `TorreAcessoSection.tsx` — Plan 05). O React Compiler informa que RHF retorna funções não memorizáveis, mas o componente funciona corretamente. Este warning não é um erro novo introduzido por este plano.

## Conhecidos Stubs

Nenhum. `TorreClassificacaoSection` não está ligado no `FormLayout` ainda — isso é trabalho do Plan 07 (integração final). O componente está completo e pronto para ser importado no switch do FormLayout.

## Threat Flags

Nenhuma nova superfície de segurança introduzida. Os campos de `riscos` e `evidenciasSolicitar` ficam em `sectionData` namespaceado por tenant em sessionStorage — conforme padrão já estabelecido. Criptografia em repouso é avaliada na Phase 8 (T-06-06-02: accept).

## Self-Check: PASSED

Arquivos verificados:
- `roteiro-unificado/src/schemas/torre-classificacao.ts` — FOUND
- `roteiro-unificado/src/features/form/sections/TorreClassificacaoSection.tsx` — FOUND

Commits verificados:
- `67aeac9` feat(06-06): add torreClassificacaoSchema Zod schema — FOUND
- `7850451` feat(06-06): add TorreClassificacaoSection component — FOUND
