---
phase: 06-campos-do-formul-rio-torre-360
plan: "02"
subsystem: form-section-identificacao
tags:
  - zod
  - react-hook-form
  - form-section
  - identificacao
  - cnpj-mask
dependency_graph:
  requires:
    - 06-01 (TextareaField Controller wrapper — usado por IdentificacaoSection)
    - src/stores/formStore.ts (TabKey.Identificacao, updateSection, sectionData)
    - src/components/ui/input.tsx (base Input — register-based fields)
    - src/components/ui/textarea-field.tsx (TextareaField Controller wrapper)
    - react-hook-form@7.76.0 (useForm, zodResolver, watch, setValue)
    - zod@4.4.3 (z.object, z.string, z.infer)
  provides:
    - identificacaoSchema (Zod schema com 12 campos da aba Identificação)
    - IdentificacaoData (tipo TypeScript inferido do schema)
    - IDENTIFICACAO_REQUIRED_COUNT = 2 (constante para cálculo de completeness)
    - IdentificacaoSection (Section component pronto para renderização via FormLayout)
  affects:
    - Plan 06-07 (FormLayout conectará IdentificacaoSection via switch(activeTab))
    - Phase 8 (autosave usará identificacaoSchema para revalidação)
tech_stack:
  added: []
  patterns:
    - "Zod schema por aba em src/schemas/: z.object com campos camelCase + z.infer + constante de obrigatórios"
    - "Section component com useForm per-tab: zodResolver + defaultValues da store + mode=onBlur"
    - "D-02 sync pattern: watch()+useEffect → updateSection(TabKey, values), store fora das deps"
    - "CNPJ mask via formatCnpj: 4 regex sequenciais + onChange+setValue (sem biblioteca externa)"
    - "9 Input register-based + 3 TextareaField Controller-based por aba (padrão estabelecido)"
    - "Layout responsivo: grid-cols-1 md:grid-cols-2 para pares de campos curtos"
key_files:
  created:
    - roteiro-unificado/src/schemas/identificacao.ts
    - roteiro-unificado/src/features/form/sections/IdentificacaoSection.tsx
  modified: []
decisions:
  - "D-02 aplicado: watch()+useEffect com store fora das deps — evita loop infinito documentado em T-05-04-04 (FormLayout.tsx linha 42)"
  - "D-04 aplicado: defaultValues = (store.sectionData[TabKey.Identificacao] ?? {}) as Partial<IdentificacaoData> — cast seguro pois dados vieram do mesmo schema"
  - "D-08 aplicado: sem FormProvider/useFormContext — props explícitas são o padrão da fase"
  - "Máscara CNPJ client-side via formatCnpj sem biblioteca — controle total, sem dependência nova"
  - "Campo CNPJ controlado via setValue/watch (não register puro) — necessário para aplicar máscara visual"
  - "Diretório src/features/form/sections/ criado neste plano — recebe os 5 Section components da fase"
metrics:
  duration: "~4 min"
  completed: "2026-05-22"
  tasks_completed: 2
  files_created: 2
  files_modified: 0
---

# Phase 06 Plan 02: Schema e Section da Aba Identificação — Summary

**One-liner:** Schema Zod identificacaoSchema com 12 campos (2 obrigatórios + regex CNPJ) e IdentificacaoSection renderizando todos os campos com máscara de CNPJ, sync RHF→Zustand via watch+useEffect e layout responsivo.

## O Que Foi Construído

### identificacaoSchema (Zod v4)

Schema com 12 campos em camelCase mapeados do HTML de referência (`id="inicio"`). Campos obrigatórios: `empresa` (`.trim().min(2)`) e `cnpj` (regex `/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/`). Os 10 demais campos são `.optional()` conforme auditoria do HTML (nenhum usa atributo `required`). Tipo `IdentificacaoData` inferido via `z.infer<typeof identificacaoSchema>`. Constante `IDENTIFICACAO_REQUIRED_COUNT = 2` exportada para uso futuro em `useFormSection` (D-03).

Arquivo: `roteiro-unificado/src/schemas/identificacao.ts`

### IdentificacaoSection

Section component com `useForm<IdentificacaoData>({ resolver: zodResolver(identificacaoSchema), defaultValues, mode: 'onBlur' })`. Implementa o padrão D-02 (sync RHF→Zustand via `watch()+useEffect`). Renderiza todos os 12 campos em 5 grupos lógicos separados por `<hr>`:

1. **Grupo 1 — Dados da empresa:** `empresa` (Input, required) + `cnpj` (Input, required, máscara CNPJ)
2. **Grupo 2 — Reunião e participantes:** grid `dataReuniao` + `sponsorPiloto` + `participantes` (TextareaField)
3. **Grupo 3 — Responsáveis:** grid `responsavelSienge` + `responsavelHabilitacoes` + `quemConduzComercial`
4. **Grupo 4 — Escopo:** grid `numCnpjsEscopo` + `numObrasAtivas`
5. **Grupo 5 — Prioridades:** `prioridadeTorre360` (TextareaField) + `prioridadeHabilitacoes` (TextareaField)

9 campos usam `<Input>` com `register()` (campos de texto nativo). 3 campos usam `<TextareaField>` com `control` (Controller-based do Wave 1). Layout responsivo: `grid-cols-1 md:grid-cols-2` para pares de campos curtos.

**Máscara CNPJ:** função `formatCnpj(raw)` com 4 substituições regex sequenciais (`.replace(/\D/g,'')` + 4 replaces de formatação). Campo CNPJ usa `value={watch('cnpj')}` + `onChange → setValue('cnpj', formatCnpj(...))` — controlado pelo RHF sem dependência externa.

Arquivo: `roteiro-unificado/src/features/form/sections/IdentificacaoSection.tsx`

## Deviations from Plan

Nenhuma. O plano foi executado exatamente como descrito.

## Verificação de Conformidade (Success Criteria)

| Critério | Status |
|----------|--------|
| identificacaoSchema exporta 12 campos com slugs camelCase | PASS |
| Campos empresa (min(2)) e cnpj (regex) com validação Zod | PASS |
| IdentificacaoData e IDENTIFICACAO_REQUIRED_COUNT = 2 exportados | PASS |
| Nenhum z.string().email() ou superRefine (anti-patterns) | PASS |
| IdentificacaoSection renderiza 12 campos com labels do HTML | PASS |
| Máscara formatCnpj com 4 regex sequenciais via onChange+setValue | PASS |
| Sync RHF → Zustand via watch+useEffect, store fora das deps | PASS |
| 3 campos textarea usam TextareaField (Wave 1 Controller-based) | PASS |
| Layout responsivo: max-w-2xl no form, grid-cols-2 em md+ | PASS |
| Nenhum FormProvider/useFormContext (D-08) | PASS |
| Nenhum handleSubmit (Phase 8 cuida de submit) | PASS |
| npx tsc --noEmit passa sem erros | PASS |
| npm run lint não introduz novos erros (apenas warnings pré-existentes) | PASS |

## Warnings de Lint (Não-Bloqueantes)

O warning `react-hooks/incompatible-library` na linha 39 de `IdentificacaoSection.tsx` é gerado pelo React Compiler ao detectar `useForm().watch()` como retorno não-memoizável. Este warning:

- É esperado e não é um erro (0 errors)
- Não afeta o comportamento em runtime (React Compiler opera em compile-time)
- É o comportamento documentado na codebase (T-05-04-04, FormLayout.tsx linha 42)
- Ocorrerá em todos os 5 Section components desta fase pelo mesmo motivo

O warning de `button.tsx` (`react-refresh/only-export-components`) é pré-existente (documentado em 06-01-SUMMARY.md §Lint Pre-existente).

## Self-Check: PASSED

Arquivos verificados:
- `roteiro-unificado/src/schemas/identificacao.ts` — FOUND (commit 84dddbe)
- `roteiro-unificado/src/features/form/sections/IdentificacaoSection.tsx` — FOUND (commit 9b8ff01)

Commits verificados:
- `84dddbe` feat(06-02): add identificacaoSchema with 12 fields and CNPJ regex validation — FOUND
- `9b8ff01` feat(06-02): add IdentificacaoSection with 12 fields, CNPJ mask and RHF→Zustand sync — FOUND
