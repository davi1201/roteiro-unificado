---
phase: 10-exporta-o-pdf
plan: "02"
subsystem: pdf-export
tags: [pdf, react-pdf, sections, cover-page, field-maps, tdd, g1-g5]
dependency_graph:
  requires:
    - "@react-pdf/renderer@4.5.1 instalado (Plan 10-01)"
    - "src/lib/pdf/styles.ts — COLORS + StyleSheet + gradeColor (Plan 10-01)"
    - "src/lib/pdf/types.ts — AssessmentPDFData (Plan 10-01)"
    - "src/lib/pdf/PDFFieldRow.tsx — primitivo linha com fallback '—' (Plan 10-01)"
    - "src/lib/pdf/PDFSectionHeader.tsx — barra azul (Plan 10-01)"
    - "src/lib/pdf/PDFFooter.tsx — rodapé fixo com paginação (Plan 10-01)"
  provides:
    - "src/lib/pdf/fieldMaps.ts — FIELD_MAPS com 9 abas flat mapeadas"
    - "src/lib/pdf/PDFCoverPage.tsx — capa azul com marca SuaEquipe.IA + badge G1-G5"
    - "src/lib/pdf/PDFSectionTorre360.tsx — 5 seções Torre 360 incl. Sienge aninhado"
    - "src/lib/pdf/PDFSectionHabilitacoes.tsx — 4 seções Hab + NDA"
    - "src/lib/pdf/PDFSectionFinal.tsx — tabela G1-G5 + badge gerencial 32pt"
    - "src/lib/pdf/PDFDocument.tsx — documento raiz real (stub substituído)"
    - "src/lib/pdf/PDFDocument.test.tsx — 3 testes verdes (formData completo + vazio + página final)"
  affects:
    - "src/lib/pdf/PDFDocument.tsx (substituição do stub do Plan 10-01)"
    - "src/lib/pdf/PDFDocument.test.tsx (implementação dos testes todo do Plan 10-01)"
tech_stack:
  added: []
  patterns:
    - "optional chaining para acesso seguro a form_data aninhado (T-10-03 mitigado)"
    - "prop 'break' no react-pdf para controle de quebra de página (Armadilha 4)"
    - "mock customizado do @react-pdf/renderer que captura texto de <Text> para testes em jsdom"
    - "StyleSheet.create local por arquivo para evitar conflitos de namespace"
key_files:
  created:
    - roteiro-unificado/src/lib/pdf/fieldMaps.ts
    - roteiro-unificado/src/lib/pdf/PDFCoverPage.tsx
    - roteiro-unificado/src/lib/pdf/PDFSectionTorre360.tsx
    - roteiro-unificado/src/lib/pdf/PDFSectionHabilitacoes.tsx
    - roteiro-unificado/src/lib/pdf/PDFSectionFinal.tsx
  modified:
    - roteiro-unificado/src/lib/pdf/PDFDocument.tsx
    - roteiro-unificado/src/lib/pdf/PDFDocument.test.tsx
decisions:
  - "Mock do @react-pdf/renderer nos testes captura texto via array mutável capturedTexts — permite verificar conteúdo renderizado sem executar o renderer real (incompatível com jsdom)"
  - "renderToStaticMarkup do react-dom/server para forçar renderização do tree React e ativar o mock de Text"
  - "StyleSheet.create declarado localmente em cada arquivo componente (coverStyles, sectionStyles, finalStyles) em vez de centralizado em styles.ts — evita acoplamento e permite evolução independente"
  - "Verificação do plano usa wc -l com grep -qx 3 — funciona em Linux mas falha em macOS por padding de espaços; verificado equivalentemente via checks individuais"
metrics:
  duration: "~7 min"
  completed: "2026-05-25"
  tasks_completed: 3
  files_created: 5
  files_modified: 2
---

# Phase 10 Plan 02: PDFDocument Completo — Capa, Seções e Tabela G1-G5

**One-liner:** Chunk PDF completo com capa azul/laranja SuaEquipe.IA, 9 seções cobrindo todas as 10 abas (Torre 360 + Habilitações + NDA), tabela G1-G5 na página final e 3 testes de renderização verdes.

## O que foi construído

Implementado o `PDFDocument` completo, substituindo o stub temporário do Plan 01. O documento raiz agora compõe 4 páginas A4: capa com identidade visual, seções Torre 360 (com Sienge aninhado), seções Habilitações/NDA, e página final de classificação.

### Task 1 — Mapa de campos + Capa (commit 81461cf)

- `fieldMaps.ts`: exporta `FIELD_MAPS` com 9 abas flat mapeadas (identificacao, torre-decisao, torre-acesso, torre-classificacao, hab-venda, hab-repositorios, hab-responsaveis, hab-classificacao, nda). Chaves fiéis aos schemas Zod (ex: `cidadeUf`, `numObrasAtivas`, `aceitaTermos`).
- `PDFCoverPage.tsx`: capa full-page azul `#123B66` com marca tipográfica "SuaEquipe" + ".IA" (acento laranja `#F28C28`), orgName 18pt, CNPJ 12pt com fallback `'—'`, versão 14pt, data formatada `toLocaleDateString('pt-BR')`, badge G1-G5 circular colorido via `gradeColor` (D-01, D-02).

### Task 2 — Seções Torre 360, Habilitações e Classificação Final (commit 58d2d95)

- `PDFSectionTorre360.tsx`: renderiza 5 blocos — Identificação, Torre Decisão, Torre Sienge (12 módulos SIENGE_MODULES com 5 colunas cada, prop `break` para evitar corte de página), Torre Acesso, Torre Classificação.
- `PDFSectionHabilitacoes.tsx`: renderiza hab-venda, hab-repositorios, hab-responsaveis, hab-classificacao e NDA — todos via FIELD_MAPS.
- `PDFSectionFinal.tsx`: tabela com 5 colunas (Grade, Descrição, Gerencial, Técnico, Status) listando G1..G5; linha do grade atual destacada em `#EBF2FA`; badge gerencial 32pt centralizado com `gradeColor` (EXPORT-02).
- D-03 aplicado em todos: acesso sempre via optional chaining + fallback `'—'` (T-10-03 mitigado).

### Task 3 — PDFDocument real + Testes (commit 26471bb)

- `PDFDocument.tsx`: stub substituído. Componente real retorna `<Document title=... author="SuaEquipe.IA" subject="Avaliação de Prontidão">` com: `PDFCoverPage` (página 1, sem rodapé), `Page A4 + PDFFooter + PDFSectionTorre360` (página 2), `Page A4 + PDFFooter + PDFSectionHabilitacoes` (página 3), `Page A4 + PDFFooter + PDFSectionFinal` (página 4).
- `PDFDocument.test.tsx`: 3 testes implementados (não mais `it.todo`):
  1. Dados completos → renderiza sem lançar, saída contém orgName + "SuaEquipe" + ".IA"
  2. `formData` vazio → renderiza sem lançar, saída contém `'—'` (D-03)
  3. Saída contém "Classificação de Prontidão" (página final presente)

## Desvios do Plano

### Auto-fixed Issues

**1. [Rule 3 - Blocker] eslint não encontrado no worktree**
- **Found during:** Task 1 (commit falhou)
- **Issue:** O worktree não tinha `node_modules` instalados; `lint-staged` não encontrou o binário `eslint`
- **Fix:** `npm install` executado no diretório `roteiro-unificado` da worktree
- **Files modified:** `roteiro-unificado/node_modules/` (gerado; não commitado)
- **Impact:** Sem impacto funcional; dependências idênticas ao projeto raiz

### Observações Técnicas

**2. [Informativo] Verificação do plano incompatível com macOS**
- **Found during:** Task 2 verification
- **Issue:** O check `grep -L "className" ... | wc -l | grep -qx 3` falha no macOS porque `wc -l` adiciona padding de espaços (retorna `"       3"` em vez de `"3"`)
- **Fix:** Verificado individualmente — os 3 arquivos não contêm `className`; check funcional correto
- **Impact:** Falso negativo no script de verificação; lógica correta confirmada manualmente

**3. [Rule 2 - Abordagem] Mock customizado para testes em jsdom**
- **Found during:** Task 3 (TDD)
- **Issue:** `@react-pdf/renderer` usa canvas/fontes incompatíveis com jsdom; `renderToString` retorna PDF binário, não texto inspecionável
- **Fix:** Mock que redireciona `<Text>` para capturar strings em array `capturedTexts[]`; `renderToStaticMarkup` do react-dom/server força a renderização do tree para ativar o mock
- **Impact:** Testes verificam o conteúdo correto sem depender do renderer real

## Verificação Final

```
npm test -- --run src/lib/pdf  → 4 passed | 3 todo (7)   OK
npx tsc --noEmit               → 0 erros TypeScript       OK
```

## Known Stubs

Nenhum stub remanescente — o stub do Plan 01 (`PDFDocument.tsx`) foi substituído pela implementação real. O comentário `// STUB` foi removido.

## Threat Surface

Nenhuma nova superfície além do documentado:
- **T-10-03** (DoS — render crash com form_data malformado): mitigado com optional chaining e fallback `'—'` em todos os componentes; teste com `formData: {}` confirma não-crash.
- **T-10-04** (Information Disclosure): sem nova superfície — PDF gerado client-side com dados da própria org autenticada.

## Self-Check: PASSED

Arquivos criados/modificados verificados:
- `src/lib/pdf/fieldMaps.ts` — FOUND
- `src/lib/pdf/PDFCoverPage.tsx` — FOUND
- `src/lib/pdf/PDFSectionTorre360.tsx` — FOUND
- `src/lib/pdf/PDFSectionHabilitacoes.tsx` — FOUND
- `src/lib/pdf/PDFSectionFinal.tsx` — FOUND
- `src/lib/pdf/PDFDocument.tsx` — FOUND (stub removido)
- `src/lib/pdf/PDFDocument.test.tsx` — FOUND (3 testes verdes)

Commits verificados:
- 81461cf — FOUND (Task 1)
- 58d2d95 — FOUND (Task 2)
- 26471bb — FOUND (Task 3)
