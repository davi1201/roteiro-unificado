---
phase: "07"
plan: "06"
subsystem: form
tags: [form, wiring, readiness-classification, phase7-complete]
dependency_graph:
  requires: [07-03, 07-04, 07-05]
  provides: [FormLayout completo com 10 abas + ReadinessClassification em tempo real]
  affects: [FormLayout.tsx]
tech_stack:
  added: []
  patterns: [switch-case enum fechado para renderSection, useMemo + calculateReadiness]
key_files:
  modified:
    - roteiro-unificado/src/features/form/FormLayout.tsx
decisions:
  - "FormLayout usa switch com todos os 10 TabKey cases explícitos + default defensivo 'Aba desconhecida.'"
  - "ReadinessClassification inserida entre <h1> e renderSection — visível em todas as abas"
metrics:
  duration: "Commit Task 1: cd66611 (2026-05-22)"
  completed_date: "2026-05-24"
---

# Phase 07 Plan 06: Wiring final FormLayout + ReadinessClassification

## Status

**Task 1: COMPLETO** | Task 2: Aguardando verificação humana (checkpoint)

## Uma frase

Wiring final do FormLayout com switch de 10 abas completo e ReadinessClassification em tempo real entre o título da aba e o conteúdo do formulário.

## O que foi entregue

### Task 1 — Imports + 5 cases novos no switch + ReadinessClassification (COMPLETO)

**Arquivo modificado:** `roteiro-unificado/src/features/form/FormLayout.tsx`

**Alterações realizadas:**

**(a) 6 novos imports adicionados:**
- `import { HabVendaSection } from './sections/HabVendaSection'`
- `import { HabRepositoriosSection } from './sections/HabRepositoriosSection'`
- `import { HabResponsaveisSection } from './sections/HabResponsaveisSection'`
- `import { HabClassificacaoSection } from './sections/HabClassificacaoSection'`
- `import { NdaSection } from './sections/NdaSection'`
- `import { ReadinessClassification } from './ReadinessClassification'`

**(b) 5 cases novos no switch `renderSection`:**
- `case TabKey.HabVenda: return <HabVendaSection tenantId={tenantId} />`
- `case TabKey.HabRepositorios: return <HabRepositoriosSection tenantId={tenantId} />`
- `case TabKey.HabResponsaveis: return <HabResponsaveisSection tenantId={tenantId} />`
- `case TabKey.HabClassificacao: return <HabClassificacaoSection tenantId={tenantId} />`
- `case TabKey.Nda: return <NdaSection tenantId={tenantId} />`

**(c) JSDoc atualizado:** Comentário reflete que todas as 10 abas têm cases explícitos após Phase 7.

**(d) Default defensivo:** `<p className="mt-2 text-sm text-gray-500">Aba desconhecida.</p>` — estado impossível em runtime.

**(e) ReadinessClassification no main:** `<ReadinessClassification tenantId={tenantId} />` inserida entre `<h1>` e `{renderSection(...)}` — visível em todas as abas.

**Verificação TypeScript:** Sem erros em FormLayout.tsx (`npx tsc --noEmit` retorna 0 erros para esse arquivo).

**Observacao:** Existem 3 erros TypeScript pré-existentes em `HistoryPage.tsx` (unused `navigate`) e `useSubmitAssessment.test.ts` (type assertions no mock), oriundos de Phase 08. Nao sao do escopo deste plano. O bundle Vite (`npx vite build`) compila com sucesso (786KB, 273 módulos).

**Commit:** `cd66611` — feat(07-06): religar FormLayout com 10 abas + ReadinessClassification

### Task 2 — Checkpoint visual (PENDENTE)

Verificacao humana das 10 abas, engine G1-G5, badge HAB-X, checkbox NDA e responsividade 768px. Aguarda confirmacao "approved" pelo usuario.

## Criterios UAT da Phase 7

| # | Criterio | Status |
|---|----------|--------|
| 1 | Construtora navega para qualquer uma das 5 novas abas e ve campos reais | Aguardando verificacao |
| 2 | ReadinessClassification aparece em todas as abas entre h1 e renderSection | Implementado — aguarda visual |
| 3 | Todas as 10 abas exibem conteudo ao clicar | Implementado — aguarda visual |
| 4 | Select 'Nivel gerencial' -> badge G1-G5 em tempo real | Implementado (calculateReadiness) — aguarda visual |
| 5 | Select 'Classificacao final' -> badge HAB-X em tempo real | Implementado (calculateReadiness) — aguarda visual |
| 6 | Checkbox NDA -> indicador 'NDA aceito' em tempo real | Implementado (calculateReadiness) — aguarda visual |
| 7 | Formulario operavel em 768px sem overflow (UX-02) | Aguarda verificacao |

## Commits

- `cd66611`: feat(07-06): religar FormLayout com 10 abas + ReadinessClassification

## Desvios

### Itens fora do escopo (pre-existentes de Phase 08)

Os seguintes erros TypeScript foram encontrados mas sao pre-existentes e fora do escopo deste plano:

1. `HistoryPage.tsx:55` — `navigate` declarado mas nao utilizado (variavel duplicada; a usada esta em `HistoryPageContent`)
2. `useSubmitAssessment.test.ts:126` — type assertion em `mock.calls[0][0]` — tuple `[]` sem elemento em index 0

Esses itens foram identificados durante a verificacao da Task 1 e fogem ao escopo da Phase 07-06.

## Known Stubs

Nenhum — todos os campos tem dados reais wired via RHF + Zustand + calculateReadiness.

## Proximo passo

Apos aprovacao do checkpoint humano (Task 2), a Phase 7 estara finalizada. O proximo passo e a **Phase 8** (autosave + submissao + versionamento) ja parcialmente executada.

## Self-Check: PASSED

- FormLayout.tsx existe e contem todos os 6 imports, 5 cases e ReadinessClassification: CONFIRMADO
- Commit cd66611 existe: CONFIRMADO
- Nenhum stub encontrado nos Section components: CONFIRMADO
- Build Vite: PASSOU (273 modulos, 786KB)
