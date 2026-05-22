---
phase: 07-campos-habilita-es-nda-classifica-o-g1-g5
plan: "05"
subsystem: frontend-form
tags: [ui-components, nda, readiness-classification, react-hook-form, zod, wave-2]
dependency_graph:
  requires:
    - 07-01 (NDA_TEXT, calculateReadiness, InputField)
    - 07-02 (ndaSchema + NdaData, NDA_REQUIRED_COUNT)
  provides:
    - NdaSection (src/features/form/sections/NdaSection.tsx)
    - ReadinessClassification (src/features/form/ReadinessClassification.tsx)
  affects:
    - 07-06 (FormLayout — integra NdaSection e ReadinessClassification no switch de activeTab)
    - Phase 8 (autosave consome sectionData[TabKey.Nda].aceitaTermos via ReadinessResult)
    - Phase 9 (dashboard exibe ReadinessResult calculado pelo calculateReadiness)
tech_stack:
  added: []
  patterns:
    - "Controller direto para checkbox boolean (z.literal(true)) — incompatível com CheckboxGroupField que gerencia arrays"
    - "aceitaTermos inicializado como false em defaultValues (não undefined) — garante mensagem de erro visível (RESEARCH Pitfall 3)"
    - "useMemo sobre store.sectionData para calculateReadiness — D-04: atualização em tempo real sem efeitos colaterais"
    - "habConfig externo ao componente (constante estável) — evita recriação a cada render"
key_files:
  created:
    - roteiro-unificado/src/features/form/sections/NdaSection.tsx
    - roteiro-unificado/src/features/form/ReadinessClassification.tsx
  modified: []
decisions:
  - "Controller direto (não CheckboxGroupField) para aceitaTermos — CheckboxGroupField.defaultValue é [] (array), incompatível com z.literal(true) boolean"
  - "aceitaTermos inicializado como false (não undefined) em defaultValues — z.literal(true) só produz erro visível se o valor inicial é false, não undefined (RESEARCH Pitfall 3)"
  - "habConfig definido fora do componente ReadinessClassification — constante estável, não recriada a cada render"
  - "Empty state exibido apenas quando gerencial === null E habilitacoes === null E ndaAceito === false — se qualquer um presente, mostrar badges correspondentes"
metrics:
  duration: ~10 minutos
  completed: 2026-05-22
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 0
---

# Phase 7 Plan 05: NdaSection e ReadinessClassification — Summary

**One-liner:** NdaSection com texto NDA scrollable + Controller boolean para aceitaTermos (z.literal(true)) + ReadinessClassification com useMemo sobre calculateReadiness exibindo Badge G1-G5 e HAB-A..E em tempo real.

> **Nota de aceitaTermos:** O campo foi inicializado como `false` (não `undefined`) em `defaultValues` — conforme RESEARCH Pitfall 3, esta é a única forma de garantir que `z.literal(true)` produza mensagem de erro visível ao tentar submeter sem marcar o checkbox.

---

## Tasks Concluídas

| Task | Nome | Commit | Arquivos |
|------|------|--------|---------|
| 1 | Implementar NdaSection com texto scrollable + campos de aceite + checkbox literal(true) | (pendente — aguarda Bash) | NdaSection.tsx (criado) |
| 2 | Implementar ReadinessClassification (badge de prontidão em tempo real) | (pendente — aguarda Bash) | ReadinessClassification.tsx (criado) |

---

## Verificação dos Critérios de Aceitação

### Task 1 — NdaSection

- `export function NdaSection` presente: **PASS** (linha 15)
- `TabKey.Nda` >= 2 ocorrências: **PASS** (linhas 25, 29, 37 — 3 ocorrências)
- `NDA_TEXT.map` presente: **PASS** (linha 46)
- `max-h-[400px] overflow-y-auto` presente: **PASS** (linha 45)
- `Controller` >= 2 (import + JSX): **PASS** (linhas 2 e 93)
- `name="aceitaTermos"` presente: **PASS** (linha 93)
- `type="checkbox"` presente: **PASS** (linha 98)
- `errors.aceitaTermos` presente: **PASS** (linha 111)
- `toLocaleDateString('pt-BR')` presente: **PASS** (linha 26)
- `CheckboxGroupField` ausente: **PASS** (não importado, não usado)
- `subscription.unsubscribe` presente: **PASS** (linha 39)
- `disabled` presente: **PASS** (linha 85 — campo dataAceite)

### Task 2 — ReadinessClassification

- `export function ReadinessClassification` presente: **PASS** (linha 25)
- `useMemo` >= 2 (import + uso): **PASS** (linhas 1 e 30)
- `calculateReadiness` >= 2 (import + chamada): **PASS** (linhas 3 e 30)
- `store.sectionData` presente: **PASS** (linha 30)
- `Badge` + `grade=` >= 2: **PASS** (linhas 4 e 45)
- `'HAB-A'|'HAB-B'|'HAB-C'|'HAB-D'|'HAB-E'` presentes: **PASS** (habConfig linhas 8-17)
- `NDA aceito|ndaAceito` >= 2: **PASS** (linhas 56 e 58)
- `Prontidão atual:` presente: **PASS** (linha 36)
- `Preencha as abas de classificação para ver o resultado` presente: **PASS** (linhas 40-41)
- `flex flex-wrap items-center gap-3` presente: **PASS** (linha 35)

---

## Desvios do Plano

Nenhum — plano executado exatamente como especificado. A implementação do Controller inline para `aceitaTermos` segue a decisão documentada no PLAN.md (D-07 + RESEARCH Pitfall 3) sem necessidade de ajustes.

---

## Ameaças Tratadas

| Threat ID | Status |
|-----------|--------|
| T-07-05-01 (Tampering: aceitaTermos checkbox) | Mitigado — `z.literal(true)` rejeita qualquer valor diferente de `true`; inicializado como `false` em defaultValues |
| T-07-05-02 (Information Disclosure: NDA_TEXT) | Aceito — texto legal é público para usuários autenticados |
| T-07-05-03 (Tampering: ReadinessClassification.useMemo) | Mitigado — `calculateReadiness` usa mapas explícitos; slugs desconhecidos retornam null |
| T-07-05-04 (Tampering: NdaSection.dataAceite) | Mitigado — campo `disabled`, preenchido via `new Date().toLocaleDateString('pt-BR')` em defaultValues |

---

## Stubs Conhecidos

Nenhum — ambos os componentes estão completamente implementados. NdaSection renderiza NDA_TEXT real (12 parágrafos) e ReadinessClassification consome calculateReadiness real da 07-01.

## Threat Flags

Nenhum — nenhuma nova superfície de rede, autenticação, acesso a arquivos ou schema introduzida. Ambos os componentes são client-side puros.

## Self-Check

Arquivos verificados:
- FOUND: roteiro-unificado/src/features/form/sections/NdaSection.tsx (criado via Write)
- FOUND: roteiro-unificado/src/features/form/ReadinessClassification.tsx (criado via Write)

Commits: aguardando Bash para executar git add + git commit + git rev-parse.

TypeScript: verificação `npx tsc --noEmit` aguarda Bash.
