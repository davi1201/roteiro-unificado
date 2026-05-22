---
phase: 07-campos-habilita-es-nda-classifica-o-g1-g5
plan: 01
subsystem: frontend-form
tags: [ui-components, constants, lib, readiness-engine, nda, react-hook-form]
dependency_graph:
  requires: []
  provides:
    - InputField (src/components/ui/input-field.tsx)
    - NDA_TEXT (src/constants/nda-text.ts)
    - calculateReadiness + ReadinessResult (src/lib/readiness.ts)
  affects:
    - Todos os Section components da Phase 7 (07-02 a 07-06) que consomem InputField, NDA_TEXT e calculateReadiness
    - Phase 8 (autosave inclui ReadinessResult no payload)
    - Phase 9 (dashboard exibe classificação G1-G5 / HAB-A..E)
tech_stack:
  added: []
  patterns:
    - InputField seguindo padrão exato de SelectField (Controller + label + asterisco + error inline)
    - NDA_TEXT como readonly string[] as const (texto puro sem HTML/JSX)
    - calculateReadiness como função pura testável sem React (padrão D-03)
key_files:
  created:
    - roteiro-unificado/src/components/ui/input-field.tsx
    - roteiro-unificado/src/constants/nda-text.ts
    - roteiro-unificado/src/lib/readiness.ts
  modified:
    - roteiro-unificado/src/components/ui/index.ts
decisions:
  - InputField é genérico <T extends FieldValues> para type safety em schemas aninhados com FieldPath<T>
  - NDA_TEXT contém 12 entradas — 1 parágrafo de cabeçalho + 11 cláusulas numeradas
  - calculateReadiness usa gerencialMap e habMap explícitos — slugs desconhecidos retornam null via ?? null (T-07-01-01 mitigado)
metrics:
  duration: ~15 minutos
  completed: 2026-05-22T22:55:06Z
  tasks_completed: 3
  tasks_total: 3
  files_created: 3
  files_modified: 1
---

# Phase 7 Plan 01: Fundação Wave 1 — InputField, NDA_TEXT e calculateReadiness

**One-liner:** Infraestrutura base Wave 1 da Phase 7 — wrapper InputField RHF, constante NDA_TEXT com 11 cláusulas legais, e engine pura calculateReadiness mapeando slugs G1-G5 e HAB-A..E.

> **Nota Wave 1:** Este plano é a fundação consumida por todos os demais planos da Phase 7. Os planos 07-02 a 07-06 (schemas + sections + FormLayout + ReadinessClassification) dependem dos artefatos criados aqui para funcionar sem disputa de arquivos.

---

## Tasks Concluídas

| Task | Nome | Commit | Arquivos |
|------|------|--------|---------|
| 1 | Criar InputField e atualizar barrel export | 93a8af8 | input-field.tsx (criado), index.ts (modificado) |
| 2 | Criar constante NDA_TEXT com cláusulas extraídas do HTML | 67ecad4 | src/constants/nda-text.ts (criado) |
| 3 | Criar engine calculateReadiness em src/lib/readiness.ts | fed81c6 | src/lib/readiness.ts (criado) |

---

## Verificação Final

- `npx tsc --noEmit` em roteiro-unificado/: **OK — sem erros TypeScript**
- `grep -c "export { InputField }" src/components/ui/index.ts`: **1**
- `grep -c "export const NDA_TEXT" src/constants/nda-text.ts`: **1**
- `grep -c "export function calculateReadiness" src/lib/readiness.ts`: **1**
- NDA_TEXT contém 12 entradas (cabeçalho + cláusulas 1-11): **OK**
- calculateReadiness sem imports React/useMemo/useState: **Confirmado — função pura**
- gerencialMap usa slugs lowercase g1..g5 batendo com torre-decisao.ts linha 30: **Confirmado**

---

## Desvios do Plano

Nenhum — plano executado exatamente como escrito.

---

## Ameaças Tratadas

| Threat ID | Status |
|-----------|--------|
| T-07-01-01 (Tampering via calculateReadiness) | Mitigado — slugs desconhecidos retornam null via `?? null`; sem crash nem resultado fraudulento |
| T-07-01-02 (NDA_TEXT Information Disclosure) | Aceito — texto legal é público para usuários autenticados |
| T-07-01-03 (InputField Tampering) | Mitigado — Controller + value/onChange controlados; sem dangerouslySetInnerHTML |

---

## Stubs Conhecidos

Nenhum stub — todos os artefatos estão completamente implementados e prontos para consumo pelos planos seguintes.

## Self-Check: PASSED

Arquivos verificados:
- FOUND: roteiro-unificado/src/components/ui/input-field.tsx
- FOUND: roteiro-unificado/src/constants/nda-text.ts
- FOUND: roteiro-unificado/src/lib/readiness.ts
- FOUND: roteiro-unificado/src/components/ui/index.ts (modificado)

Commits verificados:
- FOUND: 93a8af8 (Task 1 — InputField)
- FOUND: 67ecad4 (Task 2 — NDA_TEXT)
- FOUND: fed81c6 (Task 3 — calculateReadiness)
