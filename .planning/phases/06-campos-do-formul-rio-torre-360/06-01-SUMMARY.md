---
phase: 06-campos-do-formul-rio-torre-360
plan: "01"
subsystem: form-field-components
tags:
  - react-hook-form
  - controller
  - field-components
  - tailwind-v4
dependency_graph:
  requires:
    - 05-shell-do-formul-rio-navega-o-por-abas (FormLayout, useFormSection shell)
    - src/components/ui/select.tsx (base Select reutilizado por SelectField)
    - src/components/ui/textarea.tsx (base Textarea reutilizado por TextareaField)
    - react-hook-form@7.76.0 (Controller, Control, FieldPath, FieldValues)
  provides:
    - SelectField<T> (Controller wrapper — disponível em @/components/ui)
    - TextareaField<T> (Controller wrapper — disponível em @/components/ui)
    - RadioGroupField<T> (Controller wrapper com estados primary — disponível em @/components/ui)
    - CheckboxGroupField<T> (Controller wrapper com array e showSelectAll — disponível em @/components/ui)
    - ConditionalField (render-null + unregister cleanup — disponível em @/components/ui)
  affects:
    - Planos 06-02 a 06-06 (Section components que consomem estes field wrappers)
    - Phase 7 (Habilitações) — mesmo conjunto de field components
tech_stack:
  added: []
  patterns:
    - "Controller-based field component: <Controller name control render> wrapping base UI primitive"
    - "Explicit props pattern per D-08: control via prop, never useFormContext"
    - "ConditionalField render-null + useEffect unregister — padrão FORM-06"
    - "CheckboxGroupField: single Controller managing string[] array, master select-all"
key_files:
  created:
    - roteiro-unificado/src/components/ui/select-field.tsx
    - roteiro-unificado/src/components/ui/textarea-field.tsx
    - roteiro-unificado/src/components/ui/radio-group-field.tsx
    - roteiro-unificado/src/components/ui/checkbox-group-field.tsx
    - roteiro-unificado/src/components/ui/conditional-field.tsx
  modified:
    - roteiro-unificado/src/components/ui/index.ts
decisions:
  - "D-08 enforced: todos os 5 field components recebem control via prop explícita — zero uso de useFormContext ou FormProvider"
  - "ConditionalField retorna null (não display:none) para que RHF unregister funcione corretamente com Zod .optional()"
  - "RadioGroupField usa type='button' em todos os botões para prevenir submit acidental do form pai (T-06-01-01)"
  - "CheckboxGroupField usa único Controller para gerenciar string[] — evita race condition entre toggles (T-06-01-02)"
  - "node_modules symlink criado no worktree para habilitar lint-staged (pre-commit hook requer eslint/prettier)"
metrics:
  duration: "~5 min"
  completed: "2026-05-22"
  tasks_completed: 3
  files_created: 5
  files_modified: 1
---

# Phase 06 Plan 01: Biblioteca de Field Components Torre 360 — Summary

**One-liner:** Cinco Controller-based field wrappers (Select, Textarea, RadioGroup, CheckboxGroup, ConditionalField) exportados de @/components/ui como fundação de todos os Section components da Tower 360.

## O Que Foi Construído

### SelectField<T>

Wrapper de `Controller` sobre o componente base `Select`. Aceita `name`, `control`, `label`, `options`, `placeholder`, `required` e `error`. Propaga `error={!!error}` e `errorMessage={error}` para o `Select` base. Label com asterisco `<span className="text-g1 ml-0.5">*</span>` condicional.

Arquivo: `roteiro-unificado/src/components/ui/select-field.tsx`

### TextareaField<T>

Wrapper de `Controller` sobre o componente base `Textarea`. Mesma API do `SelectField` mais `rows?: number` e `helpText?: string`. Mensagem de ajuda (`helpText`) só renderiza quando não há erro; erro tem precedência.

Arquivo: `roteiro-unificado/src/components/ui/textarea-field.tsx`

### RadioGroupField<T>

Renderiza opções como `<button type="button">` — nunca `<input type="radio">`. Estado selecionado: `ring-2 ring-primary bg-primary/10 text-primary font-medium`. Estado não selecionado: `border border-gray-200 text-gray-700 hover:bg-gray-50`. Touch target mínimo: `min-h-[44px]`. Suporta `layout: 'vertical' | 'horizontal'`.

Arquivo: `roteiro-unificado/src/components/ui/radio-group-field.tsx`

### CheckboxGroupField<T>

Um único `Controller` gerencia o array `string[]` inteiro. Cada checkbox calcula o próximo array via spread/filter para evitar mutação. Prop `showSelectAll?: boolean` ativa checkbox master no topo com label padrão "Selecionar todos os módulos". Checkbox master detecta estado "todos selecionados" comparando `field.value.length === options.length`.

Arquivo: `roteiro-unificado/src/components/ui/checkbox-group-field.tsx`

### ConditionalField

Retorna `null` quando `condition === false` — sem `display:none`, sem `hidden`, sem `aria-hidden`. `useEffect` chama `unregisterFn(fieldName, { keepValue: false })` quando `condition` muda para false, garantindo que campos condicionais ocultos não bloqueiem validação Zod (campos devem ser `.optional()` nos schemas). A prop `condition` é calculada pelo Section pai via `watch()`.

Arquivo: `roteiro-unificado/src/components/ui/conditional-field.tsx`

### Barrel index.ts

Adicionados 5 exports sob comentário `// Field components (form Controller wrappers) — Phase 6`. Todos os exports anteriores (Button, buttonVariants, ButtonProps, Input, Textarea, Select, Card*, Badge, Grade, Spinner, Skeleton, Dialog*) preservados sem modificação.

Arquivo: `roteiro-unificado/src/components/ui/index.ts`

## Deviations from Plan

### Auto-fixed Issues

Nenhum. O plano foi executado exatamente como descrito.

### Worktree Setup (Rule 3 — Blocking Fix)

- **Found during:** Task 1 (primeiro commit)
- **Issue:** O pre-commit hook `cd roteiro-unificado && npx lint-staged` falhou no worktree porque `node_modules/` não existe na cópia do worktree — apenas no checkout principal.
- **Fix:** Criado symlink `roteiro-unificado/node_modules -> /Users/DaviAlves/.../roteiro-unificado/node_modules` no worktree para que `eslint` e `prettier` fiquem acessíveis ao lint-staged.
- **Files modified:** symlink (não rastreado pelo git — path fora dos arquivos staged)
- **Commit:** não gerou commit adicional (apenas habilitou os commits normais)

## Verificação de Conformidade (Success Criteria)

| Critério | Status |
|----------|--------|
| 5 field components criados em src/components/ui/ | PASS |
| Todos os 5 re-exportados pelo barrel index.ts | PASS |
| Nenhum usa useFormContext ou FormProvider (D-08) | PASS |
| RadioGroupField aplica ring-2 ring-primary bg-primary/10 text-primary font-medium | PASS |
| CheckboxGroupField gerencia array de strings via Controller único | PASS |
| CheckboxGroupField suporta showSelectAll opcional | PASS |
| ConditionalField retorna null quando condition=false | PASS |
| ConditionalField chama unregisterFn(fieldName, { keepValue: false }) | PASS |
| npx tsc --noEmit passa sem erros | PASS |
| npm run lint não introduz erros nos 5 novos arquivos | PASS |
| Barrel preserva exports anteriores (Button, Input, Textarea, etc.) | PASS |

## Lint Pre-existente (Fora de Escopo)

Três problemas de lint pré-existentes (não introduzidos por este plano) foram detectados durante a verificação final:

- `src/components/ui/button.tsx:47` — `react-refresh/only-export-components` warning (buttonVariants)
- `src/features/auth/AuthProvider.js:4` — `react-refresh/only-export-components` rule not found
- `src/features/form/FormLayout.js:41` — `react-hooks/exhaustive-deps` rule not found

Esses problemas existiam antes da Phase 6 e estão fora do escopo deste plano. Registrados em deferred-items para acompanhamento.

## Self-Check: PASSED

Arquivos verificados:
- `roteiro-unificado/src/components/ui/select-field.tsx` — FOUND
- `roteiro-unificado/src/components/ui/textarea-field.tsx` — FOUND
- `roteiro-unificado/src/components/ui/radio-group-field.tsx` — FOUND
- `roteiro-unificado/src/components/ui/checkbox-group-field.tsx` — FOUND
- `roteiro-unificado/src/components/ui/conditional-field.tsx` — FOUND
- `roteiro-unificado/src/components/ui/index.ts` — MODIFIED com 5 novos exports

Commits verificados:
- `8699fba` feat(06-01): add SelectField and TextareaField Controller wrappers — FOUND
- `c58fd11` feat(06-01): add RadioGroupField and CheckboxGroupField Controller wrappers — FOUND
- `528236b` feat(06-01): add ConditionalField and complete Phase 6 field barrel — FOUND
