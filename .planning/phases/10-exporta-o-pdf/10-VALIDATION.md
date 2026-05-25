---
phase: 10
slug: exporta-o-pdf
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-25
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.7 |
| **Config file** | `roteiro-unificado/vitest.config.ts` |
| **Quick run command** | `cd roteiro-unificado && npm test -- --run src/lib/pdf src/features/form/ExportPdfButton` |
| **Full suite command** | `cd roteiro-unificado && npm test -- --run` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd roteiro-unificado && npm test -- --run src/lib/pdf src/features/form/ExportPdfButton`
- **After every plan wave:** Run `cd roteiro-unificado && npm test -- --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 10-01-T1 | 10-01 | 1 | EXPORT-05 | — | N/A | manual build check | `npm run build && ls -la roteiro-unificado/dist/assets/ \| grep react-pdf` | ❌ W0 | ⬜ pending |
| 10-01-T2 | 10-01 | 1 | EXPORT-02 | — | Campos vazios exibem "—" | unit | `cd roteiro-unificado && npm test -- --run src/lib/pdf/PDFDocument.test.ts` | ❌ W0 | ⬜ pending |
| 10-01-T3 | 10-01 | 1 | EXPORT-05 | — | Chunk PDF carregável apenas via dynamic import | unit | `cd roteiro-unificado && npm test -- --run src/lib/pdf/index.test.ts` | ❌ W0 | ⬜ pending |
| 10-02-T1 | 10-02 | 2 | EXPORT-01, EXPORT-02 | T-PDF-01 | Capa exibe orgName, CNPJ, versão, data, G1-G5 | unit | `cd roteiro-unificado && npm test -- --run src/lib/pdf/PDFDocument.test.ts` | ❌ W0 | ⬜ pending |
| 10-02-T2 | 10-02 | 2 | EXPORT-02 | — | Seções exibem campos preenchidos e "—" para vazios | unit | `cd roteiro-unificado && npm test -- --run src/lib/pdf/PDFDocument.test.ts` | ❌ W0 | ⬜ pending |
| 10-02-T3 | 10-02 | 2 | EXPORT-02 | — | Tabela G1-G5 final corretamente renderizada | unit (tdd) | `cd roteiro-unificado && npm test -- --run src/lib/pdf/PDFDocument.test.ts` | ❌ W0 | ⬜ pending |
| 10-03-T1 | 10-03 | 3 | EXPORT-01, EXPORT-04, EXPORT-05 | T-PDF-01 | PDF abre em nova aba; `window.open` chamado; chunk carregado via dynamic import | unit (tdd) | `cd roteiro-unificado && npm test -- --run src/features/form/ExportPdfButton.test.tsx` | ❌ W0 | ⬜ pending |
| 10-03-T2 | 10-03 | 3 | EXPORT-04 | — | Botão aparece por card de histórico; clique aciona geração | unit | `cd roteiro-unificado && npm test -- --run src/features/form/ExportPdfButton.test.tsx` | ❌ W0 | ⬜ pending |
| 10-03-T3 | 10-03 | 3 | EXPORT-01, EXPORT-02, EXPORT-04 | — | E2E visual (manual): PDF com acentos PT-BR corretos, paginação, cores, versão correta | manual | checkpoint humano no Plan 10-03 Task 3 | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/pdf/index.test.ts` — testa `generateAndOpenPDF` com supabase mockado; verifica chamada a `window.open` (cobre EXPORT-05)
- [ ] `src/features/form/ExportPdfButton.test.tsx` — testa estados IDLE/LOADING/ERROR; verifica `aria-label` e `aria-busy` (cobre EXPORT-01, EXPORT-04)
- [ ] `src/lib/pdf/PDFDocument.test.ts` — testa renderização com dados completos e vazios (campos "—") (cobre EXPORT-02)

*Todos os três scaffolds são criados no Plan 10-01, Wave 1.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Chunk PDF ausente do bundle inicial (First Load) | EXPORT-05 | Verificação de bundle só possível após `npm run build` | `npm run build && ls -la roteiro-unificado/dist/assets/ \| grep react-pdf` — arquivo deve existir (chunk separado) mas não aparecer no entry point |
| Acentos PT-BR em Helvetica built-in renderizados corretamente | EXPORT-02 | Depende de renderização de PDF real — não testável por unit | Abrir PDF gerado com dados contendo ã, ç, ê, ú; verificar glyphs; se falhar → `Font.register()` com Inter TTF |
| PDF abre em nova aba sem popup blocker | EXPORT-01 | Comportamento de browser — não testável por unit | Clicar botão "Exportar PDF"; verificar que nova aba abre com PDF; testar no Chrome, Firefox, Safari |
| Versão correta do histórico exportada | EXPORT-04 | Requer dados reais no banco seed | Exportar versão 1 de uma avaliação com histórico; verificar que PDF mostra dados da v1, não da mais recente |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
