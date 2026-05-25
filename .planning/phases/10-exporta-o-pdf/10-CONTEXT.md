# Phase 10: Exportação PDF - Context

**Gathered:** 2026-05-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Implementar geração client-side de relatório PDF para qualquer versão do histórico de avaliações. O PDF carrega via lazy-loading (chunk separado, sem impacto no First Load), exibe identidade visual azul/laranja, e é acionado via BlobProvider que abre preview em nova aba do browser. Implementar botão "Exportar PDF" na HistoryPage (construtora). Não adiciona nenhuma funcionalidade nova de negócio além do relatório PDF.

</domain>

<decisions>
## Implementation Decisions

### Identidade Visual — Capa

- **D-01:** **Texto estilizado "SuaEquipe.IA" sem asset de logo** — projeto não tem logo PNG/SVG disponível. A capa usa o nome "SuaEquipe.IA" em tipografia estilizada com cor azul `#123B66` e acento/sublinhado laranja `#F28C28`. Nenhum asset externo necessário — implementado diretamente via estilos do `@react-pdf/renderer`.
- **D-02:** **Capa exibe: nome da construtora + CNPJ + versão + data + G1-G5** — capa contém: nome da empresa (org name), CNPJ, número da versão (ex: "Avaliação v3"), data de geração do PDF, e a classificação G1-G5 gerencial em destaque. Sem campo de responsável ou data de submissão original na capa.

### Campos e Seções Vazias

- **D-03:** **Seções não preenchidas aparecem com "—" em todos os campos** — mesmo quando uma aba inteira (ex: Torre Sienge) não foi preenchida, a seção aparece no PDF com título e todos os campos exibindo "—". Documento completo independente de preenchimento — facilita auditoria e evita ambiguidade sobre campos omitidos vs. não respondidos.

### Trigger de Download

- **D-04:** **Preview em nova aba via BlobProvider** — clicar "Exportar PDF" usa `BlobProvider` do `@react-pdf/renderer`, que abre o PDF em nova aba do browser para visualização prévia. O usuário salva manualmente via Ctrl+S ou botão do browser. Não usar `PDFDownloadLink` (download direto automático). Spinner mostrado durante geração enquanto aguarda o blob.

### Claude's Discretion

- **Biblioteca PDF:** `@react-pdf/renderer` — prescrita pelo ROADMAP Plan 2. Sem alternativa a avaliar (jsPDF + html2canvas descartada por problemas com Tailwind e scroll).
- **Lazy-loading:** chunk isolado via `React.lazy(() => import('./PDFDocument'))` — prescrito pelo ROADMAP Plan 1. `@react-pdf/renderer` nunca no bundle principal.
- **Localização do botão:** HistoryPage (construtora) é o foco prescrito pelo ROADMAP Plan 5. Não discutido para AssessmentSection (admin) — implementador pode incluir se simples, caso contrário defere para Phase 11/12.
- **Nome do arquivo PDF:** `assessment_v{N}_{empresa}_{data}.pdf` — prescrito pelo ROADMAP. Implementador usa como especificado.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Escopo e planos da fase

- `.planning/ROADMAP.md` §Phase 10 — 6 planos prescritos com detalhe de implementação, UAT e estrutura de seções do PDF

### Requisitos cobertos

- `.planning/REQUIREMENTS.md` §EXPORT — EXPORT-01, EXPORT-02, EXPORT-04, EXPORT-05 (EXPORT-03 e Excel ficam na Phase 11)

### Código existente — pontos de integração

- `roteiro-unificado/src/features/form/HistoryPage.tsx` — página onde o botão "Exportar PDF" será adicionado; lista avaliações por versão; hook `useAssessmentHistory` disponível
- `roteiro-unificado/src/components/admin/AssessmentSection.tsx` — visualização admin de histórico (referência de padrão — Claude's discretion para adicionar botão aqui)
- `roteiro-unificado/src/components/ui/badge.tsx` — `Badge` com `grade` prop (G1-G5) e `habConfig` de cores — reutilizar na capa do PDF para referência de cores
- `roteiro-unificado/src/types/database.ts` — colunas de `assessments`: `form_data` (JSONB), `readiness_level_mgmt`, `readiness_level_tech`, `version`, `submitted_at`, `status`

### Contexto de fases anteriores

- `.planning/phases/08-autosave-submiss-o-versionamento/08-CONTEXT.md` — `readiness_level_mgmt` e `readiness_level_tech` salvos no autosave; disponíveis por versão sem recalcular
- `.planning/phases/09-dashboard-de-prontid-o/09-CONTEXT.md` — D-05: `form_data` JSONB por versão acessível via query Supabase; padrão de `useQuery` com `queryKey: ['assessments', orgId]`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `roteiro-unificado/src/features/form/HistoryPage.tsx` — `useAssessmentHistory` hook já busca todas as versões com `form_data`; ponto de integração direto para botão por card de versão
- `roteiro-unificado/src/components/ui/badge.tsx` — cores G1-G5 (`habConfig`) já mapeadas; referência para capa do PDF
- `roteiro-unificado/src/components/ui/index.ts` — `Spinner` disponível para feedback durante geração do blob

### Established Patterns

- Lazy-loading: `React.lazy` + `Suspense` com fallback `Spinner` — padrão do projeto (Phase 5)
- `useToast()` — `.success()`, `.error()` — padrão obrigatório para feedback de ações
- `useQuery` com `@tanstack/react-query` — padrão consolidado para fetch de dados por versão

### Integration Points

- `roteiro-unificado/src/features/form/HistoryPage.tsx` → adicionar botão "Exportar PDF" em cada card de versão; lazy-load do `PDFDocument` ao clicar
- `roteiro-unificado/src/lib/` → criar `pdf/index.ts` como entry point do chunk separado
- `roteiro-unificado/src/router.tsx` → sem mudanças de rota necessárias para esta fase

</code_context>

<specifics>
## Specific Ideas

- **BlobProvider com `window.open`**: ao resolver o blob, chamar `window.open(URL.createObjectURL(blob))` para abrir em nova aba. Alternativa: usar `<BlobProvider>` render prop do react-pdf que expõe `{ blob, url, loading }`.
- **Spinner durante geração**: enquanto `loading === true` no BlobProvider, exibir spinner no lugar do botão. Após resolve, chamar `window.open(url)` automaticamente.
- **Seção de Classificação Final**: última página do PDF com tabela G1-G5 por dimensão e classificação gerencial em destaque — ROADMAP Plan 4 especifica isso como EXPORT-02.
- **Fontes embutidas**: `@react-pdf/renderer` exige fontes registradas via `Font.register()` para evitar fallback genérico. Implementador usa fonte segura (ex: Helvetica built-in) ou registra uma Google Font.

</specifics>

<deferred>
## Deferred Ideas

- **Botão "Exportar PDF" no painel admin (AssessmentSection/OrgDetail)** — não discutido. EXPORT-04 cobre "qualquer versão do histórico" mas o foco desta fase é a HistoryPage da construtora. Admin pode exportar via Phase 12 (polimento) se necessário.
- **Download direto automático** — preferência foi por preview em nova aba. Download direto via `PDFDownloadLink` pode ser considerado em feedback pós-piloto.

</deferred>

---

*Phase: 10-Exportação PDF*
*Context gathered: 2026-05-25*
