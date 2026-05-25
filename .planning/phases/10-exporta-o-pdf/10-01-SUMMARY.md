---
phase: 10-exporta-o-pdf
plan: "01"
subsystem: pdf-export
tags: [pdf, react-pdf, chunk-isolation, lazy-loading, primitives, test-scaffolds]
dependency_graph:
  requires: []
  provides:
    - "@react-pdf/renderer@4.5.1 instalado"
    - "src/lib/pdf/types.ts — contratos AssessmentPDFData + GeneratePDFOptions"
    - "src/lib/pdf/styles.ts — COLORS (paleta) + StyleSheet compartilhado + gradeColor"
    - "src/lib/pdf/PDFFieldRow.tsx — primitivo linha label/valor com fallback '—'"
    - "src/lib/pdf/PDFSectionHeader.tsx — primitivo barra de cabeçalho azul"
    - "src/lib/pdf/PDFFooter.tsx — primitivo rodapé fixo com paginação"
    - "src/lib/pdf/index.ts — entry imperativo generateAndOpenPDF (lazy-loading)"
    - "src/lib/pdf/PDFDocument.tsx — stub temporário (substituído no Plan 10-02)"
    - "3 scaffolds de teste Wave 0 executáveis"
  affects:
    - "roteiro-unificado/package.json (nova dependência @react-pdf/renderer)"
tech_stack:
  added:
    - "@react-pdf/renderer@4.5.1"
  patterns:
    - "Chunk PDF isolado — importável apenas via dynamic import"
    - "API imperativa pdf().toBlob() + window.open + URL.revokeObjectURL"
    - "React.createElement para JSX-free .ts entry point"
    - "Stub TEMPORÁRIO para destravar compilação sem implementação completa"
key_files:
  created:
    - roteiro-unificado/src/lib/pdf/types.ts
    - roteiro-unificado/src/lib/pdf/styles.ts
    - roteiro-unificado/src/lib/pdf/PDFFieldRow.tsx
    - roteiro-unificado/src/lib/pdf/PDFSectionHeader.tsx
    - roteiro-unificado/src/lib/pdf/PDFFooter.tsx
    - roteiro-unificado/src/lib/pdf/index.ts
    - roteiro-unificado/src/lib/pdf/PDFDocument.tsx
    - roteiro-unificado/src/lib/pdf/index.test.ts
    - roteiro-unificado/src/lib/pdf/PDFDocument.test.tsx
    - roteiro-unificado/src/features/form/ExportPdfButton.test.tsx
  modified:
    - roteiro-unificado/package.json
    - roteiro-unificado/package-lock.json
decisions:
  - "React.createElement em index.ts para evitar JSX em arquivo .ts — mantém extensão .ts conforme especificado no plano"
  - "Cast para ReactElement<DocumentProps> necessário: createElement retorna FunctionComponentElement, mas pdf() espera DocumentProps"
  - "vi.spyOn(URL, 'createObjectURL') em vez de vi.stubGlobal('URL', ...) — preserva URL como constructor no ambiente de teste"
metrics:
  duration: "~25 min"
  completed: "2026-05-25"
  tasks_completed: 3
  files_created: 10
---

# Phase 10 Plan 01: Fundação do Chunk PDF — Instalação, Primitivos e Entry Point

**One-liner:** Chunk `src/lib/pdf/` isolado com `@react-pdf/renderer@4.5.1`, contratos de tipos, paleta/StyleSheet, 3 primitivos reutilizáveis e entry imperativo `generateAndOpenPDF` com fetch Supabase + blob + window.open.

## O que foi construído

Estabelecida a fundação completa do chunk de exportação PDF, isolando toda a dependência pesada `@react-pdf/renderer` em um entry point lazy-loadável. O chunk nunca entra no bundle principal — apenas importações dinâmicas são permitidas.

### Task 1 — Instalação + Contratos + Estilos (commit d301a06)

- `@react-pdf/renderer@4.5.1` instalado (legitimidade verificada via checkpoint blocking-human)
- `types.ts` exporta `AssessmentPDFData` e `GeneratePDFOptions`
- `styles.ts` exporta `COLORS` (12 chaves hex), `StyleSheet` compartilhado e `gradeColor(grade)`

### Task 2 — Primitivos PDF (commit 0ee9d68)

- `PDFFieldRow`: linha label/valor com fallback `'—'` em `textEmpty (#9CA3AF)` para campos vazios (D-03)
- `PDFSectionHeader`: barra azul `#123B66` com texto branco para separação de seções
- `PDFFooter`: rodapé `fixed` com "SuaEquipe.IA — Relatório Confidencial" e paginação `pageNumber / totalPages` via render prop
- Nenhum `className`, hook React, Zustand ou react-router nos três componentes

### Task 3 — Entry Imperativo + Stub + Scaffolds de Teste (commit 2cab662)

- `index.ts` exporta `generateAndOpenPDF(opts)`: busca `assessments` por id (RLS Supabase aplica isolamento), monta `AssessmentPDFData`, gera blob via `pdf().toBlob()`, abre em nova aba e revoga URL após 60 s
- `PDFDocument.tsx` stub TEMPORÁRIO para destravar compilação — Plan 10-02 o substitui
- 3 scaffolds de teste Wave 0: `index.test.ts` (1 teste ativo + 3 todo), `PDFDocument.test.tsx` (4 todo), `ExportPdfButton.test.tsx` (6 todo)

## Desvios do Plano

### Auto-fixed Issues

**1. [Rule 1 - Bug] JSX em arquivo .ts causaria erro de compilação**
- **Found during:** Task 3
- **Issue:** `index.ts` precisava de `<PDFDocument data={...} />` mas `.ts` não processa JSX
- **Fix:** Substituído por `React.createElement(PDFDocument, { data: pdfData })` com cast `as ReactElement<DocumentProps>`
- **Files modified:** `src/lib/pdf/index.ts`
- **Commit:** 2cab662

**2. [Rule 1 - Bug] vi.stubGlobal('URL', ...) destruía URL como constructor**
- **Found during:** Task 3 (execução do teste)
- **Issue:** `TypeError: URL is not a constructor` ao stubbar o objeto URL inteiro
- **Fix:** Substituído por `vi.spyOn(URL, 'createObjectURL')` e `vi.spyOn(URL, 'revokeObjectURL')` para preservar a classe
- **Files modified:** `src/lib/pdf/index.test.ts`
- **Commit:** 2cab662

## Known Stubs

| Stub | Arquivo | Linha | Razão |
|------|---------|-------|-------|
| `<Text>placeholder</Text>` | `src/lib/pdf/PDFDocument.tsx` | 15 | Stub TEMPORÁRIO para destravar compilação — Plan 10-02 implementa o PDFDocument completo com todas as seções |

O stub é intencional e documentado com comentário `// STUB — substituído no Plan 10-02`. Não impede o objetivo deste plan (fundação do chunk), que é provido pelo entry point e pelos primitivos.

## Threat Surface

Nenhuma nova superfície de segurança além do documentado no `<threat_model>` do plano:

- **T-10-01** (Tampering — npm install): mitigado via checkpoint blocking-human (Task 1.5), legitimidade confirmada
- **T-10-02** (Information Disclosure — fetch form_data): protegido por RLS Supabase; query usa `.eq('id', opts.assessmentId)` com o cliente autenticado da sessão

## Verificação Final

```
npm ls @react-pdf/renderer  → @react-pdf/renderer@4.5.1  OK
npx tsc --noEmit            → 0 erros TypeScript           OK
npm test --run src/lib/pdf  → 1 passed, 7 todo             OK
```

## Self-Check: PASSED

Arquivos criados verificados:
- `src/lib/pdf/types.ts` — FOUND
- `src/lib/pdf/styles.ts` — FOUND
- `src/lib/pdf/PDFFieldRow.tsx` — FOUND
- `src/lib/pdf/PDFSectionHeader.tsx` — FOUND
- `src/lib/pdf/PDFFooter.tsx` — FOUND
- `src/lib/pdf/index.ts` — FOUND
- `src/lib/pdf/PDFDocument.tsx` — FOUND
- `src/lib/pdf/index.test.ts` — FOUND
- `src/lib/pdf/PDFDocument.test.tsx` — FOUND
- `src/features/form/ExportPdfButton.test.tsx` — FOUND

Commits verificados:
- d301a06 — FOUND (Task 1)
- 0ee9d68 — FOUND (Task 2)
- 2cab662 — FOUND (Task 3)
