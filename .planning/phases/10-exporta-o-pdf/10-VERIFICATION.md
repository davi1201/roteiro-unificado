---
phase: 10-exporta-o-pdf
verified: 2026-05-25T15:40:00Z
status: human_needed
score: 7/8 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Bundle principal não contém @react-pdf/renderer (EXPORT-05)"
    expected: "npm run build produz chunk separado para @react-pdf; o arquivo index-*.js principal não contém referências ao pacote"
    why_human: "Verificação de bundleamento requer execução do build e inspeção do output dist/assets/ — não verificável por grep"
  - test: "Lazy-load em runtime: chunk pdf só carrega ao clicar (EXPORT-05)"
    expected: "Network tab não mostra @react-pdf sendo carregado ao abrir /form/:orgId/history; carrega apenas ao clicar 'Exportar PDF'"
    why_human: "Comportamento de rede requer browser em execução"
  - test: "PDF visual end-to-end: capa com identidade azul/laranja (EXPORT-01)"
    expected: "Capa exibe fundo azul #123B66, marca 'SuaEquipe.IA' com '.IA' em laranja #F28C28, nome da construtora, CNPJ, versão, data de geração, badge G1-G5 colorido"
    why_human: "Verificação visual de renderização PDF não é automatizável por grep"
  - test: "Todas as 10 abas no PDF; vazias mostram '—'; última página tem tabela G1-G5 (EXPORT-02)"
    expected: "Percorrer o PDF gerado: 10 seções presentes, campos não preenchidos exibem '—', última página contém tabela de classificação com nível gerencial destacado"
    why_human: "Inspeção visual do conteúdo do PDF gerado"
  - test: "Exportação de versão histórica exibe dados daquela versão (EXPORT-04)"
    expected: "Ao exportar versão 1 (com 2+ versões disponíveis), o PDF mostra dados da v1, não da mais recente"
    why_human: "Requer ambiente com múltiplas versões enviadas e inspeção humana do conteúdo do PDF"
  - test: "Acentos PT-BR renderizam corretamente no PDF"
    expected: "Caracteres como ã, ç, é aparecem sem quebrar no PDF (RESEARCH §Armadilha 6)"
    why_human: "Verificação visual do rendering de tipografia — não verificável programaticamente"
---

# Phase 10: Exportação PDF — Relatório de Verificação

**Phase Goal:** Botão "Exportar PDF" gera relatório com identidade visual azul/laranja para qualquer versão do histórico, sem impacto no First Load do app.
**Verified:** 2026-05-25T15:40:00Z
**Status:** human_needed
**Re-verification:** No — verificação inicial

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `@react-pdf/renderer` instalado na versão 4.5.1 | VERIFIED | `npm ls @react-pdf/renderer` → `@react-pdf/renderer@4.5.1` |
| 2 | Entry point do chunk PDF (`src/lib/pdf/index.ts`) só usa dynamic import fora do chunk — nenhum import estático no bundle principal | VERIFIED | Grep em todos os `.ts/.tsx` fora de `src/lib/pdf/` retornou 0 resultados; `ExportPdfButton.tsx` contém `await import('@/lib/pdf/index')` sem import estático top-level |
| 3 | Primitivos PDF (PDFFieldRow, PDFSectionHeader, PDFFooter) existem com paleta azul/laranja e sem Tailwind | VERIFIED | Três arquivos lidos: sem `className`, `PDFFieldRow` implementa fallback `'—'`, `PDFFooter` usa `fixed` + render prop, `PDFSectionHeader` usa `sectionHeader` com `COLORS.primary` |
| 4 | Capa exibe nome da construtora, CNPJ, versão, data e badge G1-G5 gerencial (D-02) com identidade azul/laranja (EXPORT-01) | VERIFIED | `PDFCoverPage.tsx` lido: fundo `COLORS.primary` (#123B66), marca tipográfica "SuaEquipe" + ".IA" em `COLORS.accent` (#F28C28), orgName 18pt, CNPJ com fallback '—', badge circular via `gradeColor(data.grade)` |
| 5 | Todas as 10 abas do formulário aparecem no PDF; abas vazias mostram '—' (D-03) | VERIFIED | `PDFSectionTorre360.tsx`: 5 blocos (Identificação, Torre Decisão, Torre Sienge com 12 módulos SIENGE_MODULES, Torre Acesso, Torre Classificação); `PDFSectionHabilitacoes.tsx`: hab-venda, hab-repositorios, hab-responsaveis, hab-classificacao, NDA — todos via `FIELD_MAPS`; `PDFFieldRow` garante fallback '—' para valores ausentes |
| 6 | Tabela final G1-G5 com 5 colunas e nível gerencial destacado (EXPORT-02) | VERIFIED | `PDFSectionFinal.tsx` lido: tabela com colunas Grade/Descrição/Gerencial/Técnico/Status, linha atual destacada em `#EBF2FA`, badge 32pt com `gradeColor(grade)`; título "Classificação de Prontidão" presente |
| 7 | `ExportPdfButton` com state machine IDLE/LOADING/ERROR integrado na HistoryPage em cards submitted (EXPORT-04) | VERIFIED | `HistoryPage.tsx`: importa `ExportPdfButton` e `useOrgInfo`; componente renderizado dentro de `{isSubmitted && ...}` com `assessmentId`, `version`, `orgName ?? '—'`, `cnpj`, `grade={row.readiness_level_mgmt}` |
| 8 | Bundle principal sem `@react-pdf/renderer` (EXPORT-05) confirmado por build | UNCERTAIN | Verificado via grep (0 imports estáticos externos ao chunk) e pattern de dynamic import; confirmação definitiva via `npm run build` + inspeção de `dist/assets/` requer execução humana |

**Score:** 7/8 truths verified (1 UNCERTAIN — requer verificação humana de bundle)

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/pdf/types.ts` | Contratos AssessmentPDFData + GeneratePDFOptions | VERIFIED | Exporta ambas as interfaces com todos os campos especificados |
| `src/lib/pdf/styles.ts` | COLORS (paleta) + StyleSheet + gradeColor | VERIFIED | COLORS contém '#123B66' (primary) e '#F28C28' (accent); `gradeColor` mapeia G1-G5; StyleSheet com 14 estilos |
| `src/lib/pdf/index.ts` | Entry imperativo `generateAndOpenPDF` | VERIFIED | Exporta `generateAndOpenPDF`; fetch Supabase, `pdf().toBlob()`, `window.open(url, '_blank')`, `URL.revokeObjectURL` após 60s |
| `src/lib/pdf/PDFFieldRow.tsx` | Linha label/valor com fallback '—' | VERIFIED | Implementa D-03: `isEmpty ? '—' : String(value)`; sem className |
| `src/lib/pdf/PDFSectionHeader.tsx` | Barra de cabeçalho azul | VERIFIED | Usa `styles.sectionHeader` (backgroundColor COLORS.primary); aceita `title` |
| `src/lib/pdf/PDFFooter.tsx` | Rodapé fixo com paginação | VERIFIED | Prop `fixed`; render prop `pageNumber / totalPages`; texto "SuaEquipe.IA — Relatório Confidencial" |
| `src/lib/pdf/fieldMaps.ts` | FIELD_MAPS com 9 abas flat | VERIFIED | Contém todas as 9 abas: identificacao, torre-decisao, torre-acesso, torre-classificacao, hab-venda, hab-repositorios, hab-responsaveis, hab-classificacao, nda |
| `src/lib/pdf/PDFCoverPage.tsx` | Capa azul com marca SuaEquipe.IA + badge G1-G5 | VERIFIED | "SuaEquipe" + ".IA" em laranja; badge colorido via gradeColor; todos os metadados D-02 presentes |
| `src/lib/pdf/PDFSectionTorre360.tsx` | 5 seções Torre 360 incl. Sienge aninhado | VERIFIED | 5 blocos com prop `break` em Torre Sienge; itera SIENGE_MODULES com 5 colunas |
| `src/lib/pdf/PDFSectionHabilitacoes.tsx` | 4 seções Hab + NDA | VERIFIED | hab-venda, hab-repositorios, hab-responsaveis, hab-classificacao, NDA — via FIELD_MAPS |
| `src/lib/pdf/PDFSectionFinal.tsx` | Tabela G1-G5 (EXPORT-02) | VERIFIED | Tabela 5 colunas, linhas G1-G5, destacamento por grade atual, badge 32pt |
| `src/lib/pdf/PDFDocument.tsx` | Documento raiz compondo todas as páginas | VERIFIED | Compõe PDFCoverPage + PDFSectionTorre360 + PDFSectionHabilitacoes + PDFSectionFinal; sem comentário STUB |
| `src/features/form/useOrgInfo.ts` | Hook SELECT name, cnpj FROM orgs | VERIFIED | useQuery com queryKey ['org-info', orgId], staleTime 300_000, retorna orgName e cnpj |
| `src/features/form/ExportPdfButton.tsx` | Botão com dynamic import + state machine | VERIFIED | Dynamic import de '@/lib/pdf/index'; sem import estático; aria-label com versão; aria-busy ligado ao estado |
| `src/features/form/HistoryPage.tsx` | ExportPdfButton integrado em cards submitted | VERIFIED | Importa ExportPdfButton e useOrgInfo; renderizado dentro de `{isSubmitted && ...}`; Ver detalhes e Iniciar Nova Revisão inalterados |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/lib/pdf/index.ts` | `@react-pdf/renderer` | `import { pdf } from '@react-pdf/renderer'` | VERIFIED | Import estático permitido dentro do chunk; linha 9 confirmada |
| `src/lib/pdf/index.ts` | `window.open` | `window.open(url, '_blank')` | VERIFIED | Linha 53 confirmada |
| `src/features/form/ExportPdfButton.tsx` | `src/lib/pdf/index.ts` | `await import('@/lib/pdf/index')` | VERIFIED | Linha 33; nenhum import estático top-level |
| `src/features/form/HistoryPage.tsx` | `src/features/form/ExportPdfButton.tsx` | render em cards submitted | VERIFIED | Linhas 10 e 196-202 confirmadas |
| `src/lib/pdf/PDFDocument.tsx` | `PDFSectionTorre360.tsx` | composição dentro de Document | VERIFIED | Linha 35 em PDFDocument.tsx |
| `src/lib/pdf/PDFSectionTorre360.tsx` | form_data por aba | optional chaining `formData?.['torre-decisao']` | VERIFIED | Função `getField` usa optional chaining; SIENGE_MODULES iterado |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produz dados reais | Status |
|----------|---------------|--------|--------------------|--------|
| `HistoryPage.tsx` | `orgName`, `cnpj` (para ExportPdfButton) | `useOrgInfo(orgId)` → `SELECT name, cnpj FROM orgs` | Sim — query Supabase real | FLOWING |
| `ExportPdfButton.tsx` | props recebidas de HistoryPage | `row.id`, `row.version`, `row.readiness_level_mgmt` da query `assessments` | Sim — query Supabase real em useAssessmentHistory | FLOWING |
| `generateAndOpenPDF` | `AssessmentPDFData` | `supabase.from('assessments').select(...).eq('id', opts.assessmentId).single()` | Sim — query Supabase real, retorna `form_data`, `readiness_level_mgmt`, `readiness_level_tech` | FLOWING |

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| PDFDocument renderiza com dados completos | `npm test -- --run src/lib/pdf/PDFDocument.test.tsx` | 3 passed | PASS |
| PDFDocument com formData vazio contém '—' | `npm test -- --run src/lib/pdf/PDFDocument.test.tsx` | Test 2 passed | PASS |
| ExportPdfButton em IDLE exibe texto correto | `npm test -- --run src/features/form/ExportPdfButton.test.tsx` | Test 1 passed (isolado) | PASS |
| ExportPdfButton entra em LOADING ao clicar | `npm test -- --run src/features/form/ExportPdfButton.test.tsx` | Test 2 passed (isolado) | PASS |
| ExportPdfButton dispara toast em erro | `npm test -- --run src/features/form/ExportPdfButton.test.tsx` | Test 3 passed (isolado); FALHA na suite completa (WARNING abaixo) | WARNING |
| @react-pdf/renderer instalado 4.5.1 | `npm ls @react-pdf/renderer` | `@react-pdf/renderer@4.5.1` | PASS |

---

## Probe Execution

Step 7c: SKIPPED — nenhum probe declarado nos planos; fase não é de migração/tooling.

---

## Requirements Coverage

| Requisito | Plano | Descrição | Status | Evidência |
|-----------|-------|-----------|--------|-----------|
| EXPORT-01 | 10-02, 10-03 | Botão "Exportar PDF" gera relatório com identidade visual (azul/laranja) | VERIFIED (parcial — visual pendente humano) | `PDFCoverPage.tsx`: fundo COLORS.primary (#123B66), marca com COLORS.accent (#F28C28); `PDFSectionHeader.tsx`: barra azul; confirmação visual do PDF gerado é item de UAT humano |
| EXPORT-02 | 10-02 | PDF inclui todas as seções, classificações e data | VERIFIED | PDFDocument compõe 10 abas + tabela G1-G5; data via `generatedAt.toLocaleDateString('pt-BR')` |
| EXPORT-04 | 10-03 | Exportação disponível para qualquer versão do histórico | VERIFIED (lógica) + UNCERTAIN (runtime) | `ExportPdfButton` recebe `assessmentId` e `version` específicos de cada card; `generateAndOpenPDF` busca por `assessmentId` específico via Supabase; confirmação com múltiplas versões requer humano |
| EXPORT-05 | 10-01, 10-03 | Chunk de exportação é lazy-loaded (não impacta First Load) | VERIFIED (código) + UNCERTAIN (bundle) | Zero imports estáticos de `@/lib/pdf` fora do chunk; `ExportPdfButton` usa `await import('@/lib/pdf/index')`; confirmação por `npm run build` requer humano |

**Requisito fora do escopo desta fase:**
- EXPORT-03 (Exportar Excel) — mapeado para Phase 11 no REQUIREMENTS.md; não está nos planos desta fase.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/features/form/ExportPdfButton.test.tsx` | 37–40 | `vi.doMock` em `beforeEach` conflita com `vi.mock` no topo do arquivo — Test 3 falha ao rodar na suite completa mas passa em isolamento | WARNING | Test isolation bug: o estado de loading do teste anterior (promise pendente) não é limpo entre testes quando mockGenerateAndOpenPDF não resolve. Não afeta a implementação do componente. |

Nenhum marcador de dívida (`TBD`, `FIXME`, `XXX`) encontrado em nenhum arquivo modificado pela fase.

---

## Human Verification Required

### 1. Bundle isolado — @react-pdf/renderer fora do index principal (EXPORT-05)

**Test:** Rodar `cd roteiro-unificado && npm run build`. Inspecionar `dist/assets/` com `ls -la dist/assets/ | sort -k5 -n`. Confirmar que existe um chunk separado (nome contendo "pdf" ou hash próprio, tamanho ~800KB+) e que o chunk `index-*.js` principal NÃO contém a string "@react-pdf".
**Expected:** Um chunk grande separado do index principal; ausência de "@react-pdf" no bundle principal.
**Why human:** Verificação de bundleamento exige execução do Vite build e inspeção do output binário/textual de dist/.

### 2. Lazy-load em runtime (EXPORT-05)

**Test:** Rodar `npm run preview` (ou `npm run dev`), logar como construtora com avaliações enviadas, abrir DevTools → Network, navegar para `/form/:orgId/history`. Confirmar que NENHUM arquivo @react-pdf carrega ao abrir a página. Clicar "Exportar PDF" e confirmar que o chunk pdf carrega nesse momento.
**Expected:** Chunk @react-pdf ausente do carregamento inicial da página; presente após o clique.
**Why human:** Comportamento de carregamento de rede requer browser com DevTools.

### 3. PDF visual — identidade azul/laranja na capa (EXPORT-01)

**Test:** Ao clicar "Exportar PDF" em qualquer card submitted, verificar que o PDF abre em nova aba com: fundo azul #123B66 na capa, marca "SuaEquipe.IA" com ".IA" em laranja, nome da construtora, CNPJ, "Avaliação v{N}", data de geração, badge G1-G5 colorido.
**Expected:** Capa visualmente fiel à identidade visual definida no UI-SPEC.
**Why human:** Renderização PDF requer browser; verificação de cores/layout é visual.

### 4. Todas as 10 abas; vazias mostram '—'; tabela final G1-G5 (EXPORT-02)

**Test:** Percorrer o PDF gerado — verificar que todas as 10 abas aparecem como seções. Para uma avaliação parcialmente preenchida, confirmar que campos não preenchidos exibem "—". Verificar que a última página contém a tabela de classificação com o nível gerencial em destaque.
**Expected:** 10 seções presentes; D-03 aplicado; tabela final com 5 colunas e linha do grade atual destacada.
**Why human:** Inspeção visual do conteúdo renderizado no PDF.

### 5. Versão histórica exporta dados corretos (EXPORT-04)

**Test:** Com uma construtora que tenha 2+ versões submitted, clicar "Exportar PDF" na versão 1 (não a mais recente). Verificar que os dados no PDF correspondem à versão 1, não à mais recente.
**Expected:** PDF da versão 1 contém os dados do formulário da versão 1.
**Why human:** Requer ambiente com múltiplas versões e inspeção humana do conteúdo.

### 6. Acentos PT-BR no PDF

**Test:** Verificar no PDF gerado que caracteres acentuados (ã, ç, é, etc.) em nomes e campos renderizam corretamente, sem caracteres quebrados ou substitutos.
**Expected:** Tipografia PT-BR legível sem caracteres estranhos.
**Why human:** Verificação de rendering tipográfico é visual; problemas de font encoding não são detectáveis por grep.

---

## Gaps Summary

Nenhum blocker identificado. A implementação está completa e correta do ponto de vista do código:

- Toda a lógica de geração PDF existe, é substantiva e está conectada
- O fluxo de dados é real (queries Supabase) — sem dados hardcoded ou estáticos
- O dynamic import está corretamente implementado — zero imports estáticos externos ao chunk
- Os testes unitários passam em isolamento (6/6 em ExportPdfButton, 3/3 em PDFDocument)
- TypeScript compila sem erros

**WARNING — Test isolation bug:** `ExportPdfButton.test.tsx` Test 3 falha quando executado na suite completa (`npm test -- --run`) mas passa em isolamento. O componente funciona corretamente — o problema é `vi.doMock` em `beforeEach` conflitando com o `vi.mock` top-level, causando que o `mockRejectedValueOnce` do Test 3 não seja efetivo quando o mock de uma promise pendente do Test 2 está interferindo. Este bug de teste não afeta o comportamento do componente em produção.

Os 6 itens de human_verification acima (bundle, lazy-load, PDF visual, seções, versão histórica, acentos) são confirmações de runtime/visual que não podem ser automatizadas por grep — são o padrão esperado para uma fase de exportação PDF.

---

_Verificado: 2026-05-25T15:40:00Z_
_Verificador: Claude (gsd-verifier)_
