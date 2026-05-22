---
phase: 06-campos-do-formul-rio-torre-360
plan: "05"
subsystem: form-section-torre-acesso
tags:
  - zod
  - react-hook-form
  - form-section
  - torre-acesso
  - controller
dependency_graph:
  requires:
    - 06-01 (SelectField, TextareaField, CheckboxGroupField em @/components/ui)
    - src/stores/formStore.ts (TabKey.TorreAcesso, updateSection)
    - react-hook-form@7.76.0
    - zod@4.4.3
    - @hookform/resolvers@5.4.0
  provides:
    - torreAcessoSchema (Zod schema — 12 campos, todos opcionais)
    - TorreAcessoData (tipo TypeScript inferido do schema)
    - TORRE_ACESSO_REQUIRED_COUNT = 0
    - TorreAcessoSection (Section component da aba Torre Acesso)
  affects:
    - Plan 06-07 (FormLayout switch — consumirá TorreAcessoSection)
    - Phase 8 (autosave — consumirá torreAcessoSchema para validação server-side)
tech_stack:
  added: []
  patterns:
    - "useForm por aba com zodResolver — padrão D-01 do CONTEXT.md"
    - "watch() + useEffect sync RHF → Zustand — padrão D-02 sem store nas deps"
    - "Props explícitas (tenantId) sem FormProvider/useFormContext — padrão D-08"
    - "Grid responsivo md:grid-cols-2 para pares curtos de SelectField"
    - "Enum values como slugs (nuvem-data-center, nao-aplicavel-fase-1) — labels com acentos apenas no runtime"
key_files:
  created:
    - roteiro-unificado/src/schemas/torre-acesso.ts
    - roteiro-unificado/src/features/form/sections/TorreAcessoSection.tsx
  modified: []
decisions:
  - "Todos os 12 campos .optional() — HTML de referência não marca nenhum como required; TORRE_ACESSO_REQUIRED_COUNT = 0"
  - "seTudoNoSienge como z.array(z.enum(...)) único Controller — padrão documentado no RESEARCH.md §Armadilha 6"
  - "Grid md:grid-cols-2 para 3 pares de selects curtos (subdominioTenant+usuarioLeitura, ambienteHomologacao+pacoteLimiteApi, apiRest+bulkData)"
  - "Sem ConditionalField — RESEARCH.md §Inventário confirma que aba Torre Acesso não tem campos condicionais"
metrics:
  duration: "~8 min"
  completed: "2026-05-22"
  tasks_completed: 2
  files_created: 2
  files_modified: 0
---

# Phase 06 Plan 05: Torre Acesso — Schema Zod + Section Component — Summary

**One-liner:** Schema Zod torreAcessoSchema (12 campos, todos opcionais) + TorreAcessoSection com 8 SelectField, 3 TextareaField e 1 CheckboxGroupField para a aba Torre Acesso do formulário Torre 360.

## O Que Foi Construído

### torreAcessoSchema (src/schemas/torre-acesso.ts)

Schema Zod plano (sem aninhamento) cobrindo todos os campos do HTML `id="t_acesso"`. Doze campos totais:

- **8 selects:** `ambienteSienge`, `subdominioTenant`, `usuarioLeitura`, `ambienteHomologacao`, `apiRest`, `bulkData`, `pacoteLimiteApi`, `webhooksRelevantes`
- **2 textareas:** `outrasFontes`, `restricoesSeguranca`
- **1 checkbox group:** `seTudoNoSienge` como `z.array(z.enum([...]))` com 6 opções de viabilidade
- **1 textarea final:** `observacaoTecnica`

Todos os campos são `.optional()`. Sem validação cruzada. Sem campos condicionais no schema.

Exporta `TorreAcessoData = z.infer<typeof torreAcessoSchema>` e `TORRE_ACESSO_REQUIRED_COUNT = 0`.

Arquivo: `roteiro-unificado/src/schemas/torre-acesso.ts`

### TorreAcessoSection (src/features/form/sections/TorreAcessoSection.tsx)

Section component organizado em 3 grupos separados por `<hr className="my-6 border-gray-100">`:

**Grupo 1 — Ambiente e acessos:**
- `ambienteSienge` — SelectField com 4 opções (Nuvem/Data Center, Local, Híbrido, Confirmar)
- Par responsivo `subdominioTenant` + `usuarioLeitura` em `grid-cols-2` no md+
- Par responsivo `ambienteHomologacao` + `pacoteLimiteApi` em `grid-cols-2` no md+
- Par responsivo `apiRest` + `bulkData` em `grid-cols-2` no md+ (opções compartilhadas `apiBulkOptions`)
- `webhooksRelevantes` — SelectField com opção especial "Não aplicável na fase 1"
- `outrasFontes` — TextareaField
- `restricoesSeguranca` — TextareaField (dados sensíveis — mitigação T-06-05-02: sessionStorage tenant-namespaced)

**Grupo 2 — Checklist de viabilidade:**
- `seTudoNoSienge` — CheckboxGroupField com 6 opções de viabilidade Sienge

**Grupo 3 — Observação técnica:**
- `observacaoTecnica` — TextareaField final

Padrão de sincronização: `watch() + useEffect → updateSection(TabKey.TorreAcesso, values)` com `store` excluído das deps para evitar loop infinito (T-06-05-01, padrão T-05-04-04).

Arquivo: `roteiro-unificado/src/features/form/sections/TorreAcessoSection.tsx`

## Deviations from Plan

None — plano executado exatamente como descrito.

## Verificação de Conformidade (Success Criteria)

| Critério | Status |
|----------|--------|
| torreAcessoSchema criado em src/schemas/torre-acesso.ts | PASS |
| 12 campos no schema (8 selects + 2 textareas + 1 checkbox group + 1 textarea) | PASS |
| Todos os campos .optional() | PASS |
| seTudoNoSienge como z.array(z.enum(...)) com 6 opções | PASS |
| TORRE_ACESSO_REQUIRED_COUNT = 0 exportado | PASS |
| TorreAcessoSection criado em src/features/form/sections/ | PASS |
| 8 ocorrências de SelectField | PASS |
| 3 ocorrências de TextareaField | PASS |
| 1 ocorrência de CheckboxGroupField | PASS |
| 6 labels do checkbox presentes no arquivo | PASS |
| 12 labels de campo presentes no arquivo (supera mínimo de 11) | PASS |
| updateSection(TabKey.TorreAcesso, ...) presente | PASS |
| store excluído das deps do useEffect | PASS |
| Nenhuma ocorrência de ConditionalField | PASS |
| Nenhuma ocorrência de useFormContext/FormProvider/handleSubmit | PASS |
| npx tsc --noEmit passa sem erros | PASS |
| npm run lint não introduz novos erros (warning react-compiler é esperado para watch()) | PASS |
| Grid responsivo md:grid-cols-2 para 3 pares de selects | PASS |
| Componente não conectado ao FormLayout (Plan 07) | PASS — intencional |

## Lint — Aviso do React Compiler

O TorreAcessoSection apresenta 1 **warning** (não erro) do eslint-plugin-react-compiler:

```
80:18  warning  Compilation Skipped: Use of incompatible library
```

Isso ocorre porque `watch()` do React Hook Form retorna uma nova referência a cada render, e o React Compiler não consegue memoizar o componente de forma segura. O aviso é **esperado e documentado** no RESEARCH.md §Armadilha 2 — é o comportamento correto do padrão D-02 (watch + useEffect). Os 2 errors pré-existentes (FormLayout.js e AuthProvider.js) não foram introduzidos por este plano.

## Known Stubs

Nenhum stub — o componente recebe `defaultValues` da store Zustand e sincroniza de volta via `updateSection`. Dados reais são exibidos/editados corretamente.

## Threat Flags

Nenhuma nova superfície de segurança além do documentado no plan `<threat_model>`. O campo `restricoesSeguranca` armazena dados sensíveis em sessionStorage com chave namespaceada por tenant (mitigação T-06-05-02 aplicada via herança da formStore existente).

## Self-Check: PASSED

Arquivos verificados:
- `roteiro-unificado/src/schemas/torre-acesso.ts` — FOUND
- `roteiro-unificado/src/features/form/sections/TorreAcessoSection.tsx` — FOUND

Commits verificados:
- `f7e2180` feat(06-05): add Zod schema for Torre Acesso tab — FOUND
- `04ce4c0` feat(06-05): add TorreAcessoSection component — FOUND
