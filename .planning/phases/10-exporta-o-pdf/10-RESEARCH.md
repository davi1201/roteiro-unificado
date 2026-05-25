# Phase 10: Exportação PDF — Research

**Data de pesquisa:** 2026-05-25
**Domínio:** Geração client-side de PDF com @react-pdf/renderer; lazy-loading de chunk; integração com HistoryPage existente
**Confiança geral:** HIGH

---

<user_constraints>
## Restrições do Usuário (de CONTEXT.md)

### Decisões Travadas

- **D-01:** Texto estilizado "SuaEquipe.IA" sem asset de logo — tipografia estilizada com azul `#123B66` e acento/sublinhado laranja `#F28C28`. Nenhum asset externo.
- **D-02:** Capa exibe: nome da construtora + CNPJ + versão + data de geração + classificação G1-G5 gerencial. Sem campo de responsável ou data de submissão original.
- **D-03:** Seções não preenchidas aparecem com "—" em todos os campos — documento completo independente de preenchimento.
- **D-04:** Preview em nova aba via BlobProvider — usa `BlobProvider` + `window.open(url, '_blank')`. Não usar `PDFDownloadLink`.

### Claude's Discretion

- **Biblioteca PDF:** `@react-pdf/renderer` prescrita. Sem alternativa.
- **Lazy-loading:** chunk isolado via `React.lazy(() => import('./PDFDocument'))` — `@react-pdf/renderer` nunca no bundle principal.
- **Localização do botão:** HistoryPage (construtora) é o foco. Admin pode ser incluído se simples, caso contrário defere.
- **Nome do arquivo PDF:** `assessment_v{N}_{empresa}_{data}.pdf` — prescrito pelo ROADMAP.

### Ideias Deferidas (FORA DO ESCOPO)

- Botão "Exportar PDF" no painel admin (AssessmentSection/OrgDetail) — não discutido nesta fase.
- Download direto automático via `PDFDownloadLink` — preferência foi por preview em nova aba.
</user_constraints>

<phase_requirements>
## Requisitos da Fase

| ID | Descrição | Suporte da Pesquisa |
|----|-----------|---------------------|
| EXPORT-01 | Botão "Exportar PDF" gera relatório com identidade visual azul/laranja | D-01, D-02, API BlobProvider verificada |
| EXPORT-02 | PDF inclui todas as seções preenchidas, classificações calculadas e data | Estrutura de 10 abas mapeada; `form_data` JSONB disponível no banco |
| EXPORT-04 | Exportação disponível para qualquer versão do histórico | `useAssessmentHistory` retorna todas as versões; query separada por `id` de versão já possível |
| EXPORT-05 | Chunk de exportação é lazy-loaded (não impacta First Load) | `React.lazy` + dynamic import confirmados; vite.config.ts usa rolldownOptions — compatível |
</phase_requirements>

---

## Resumo

A Phase 10 implementa geração client-side de PDF para qualquer versão do histórico de avaliações via `@react-pdf/renderer` v4.5.1. O pacote é carregado via dynamic import isolado (`React.lazy`) que garante que `@react-pdf/renderer` nunca entre no bundle principal do app — requisito EXPORT-05. O PDF é aberto em preview numa nova aba do browser via `BlobProvider` + `window.open(url, '_blank')` conforme decisão D-04.

O ponto de integração principal é `HistoryPage.tsx`, onde cada card de versão com `status === 'submitted'` recebe um botão "Exportar PDF". Ao clicar, o chunk PDF é lazy-loaded, os dados da versão específica são buscados do Supabase via query por `assessments.id`, e o `BlobProvider` renderiza o `PDFDocument` enquanto o botão exibe estado de loading. Ao resolver o blob, `window.open(url, '_blank')` abre o PDF em nova aba — sem download automático.

A renderização do PDF usa exclusivamente a API do `@react-pdf/renderer`: `Document`, `Page`, `View`, `Text`, `StyleSheet.create()`. Fontes built-in Helvetica são suficientes (sem `Font.register()` para esta fase). A UI do PDF segue a paleta `#123B66` / `#F28C28` definida em D-01 e codificada como strings hex diretas (os tokens Tailwind CSS não existem no contexto de StyleSheet do react-pdf).

**Recomendação principal:** Usar `pdf().toBlob()` imperativo dentro de um handler `onClick` assíncrono como padrão — em vez de `BlobProvider` como componente montado permanentemente — para evitar o pitfall de re-render reativo do BlobProvider.

---

## Mapa de Responsabilidade Arquitetural

| Capacidade | Tier Primário | Tier Secundário | Racional |
|------------|--------------|-----------------|----------|
| Lazy-load do chunk PDF | Browser / Client | — | `React.lazy` resolve no runtime do browser; bundle isolado por Vite/Rolldown |
| Geração do PDF (renderização) | Browser / Client | — | @react-pdf/renderer opera inteiramente client-side; sem servidor de renderização |
| Fetch dos dados da versão | API / Backend (Supabase) | Browser fetch | Query `assessments` por `id` específico via Supabase client (já existe padrão) |
| Preview do PDF | Browser / Client | — | `window.open(url, '_blank')` — tab nativa do browser |
| Botão "Exportar PDF" | Browser / Client (HistoryPage) | — | HistoryPage já existe; adição de botão por card submitted |
| Estado de loading do botão | Browser / Client | — | Estado local `useState` no componente de botão |

---

## Stack Padrão

### Core

| Biblioteca | Versão | Propósito | Por que Padrão |
|------------|--------|-----------|----------------|
| `@react-pdf/renderer` | `4.5.1` | Geração de PDF client-side com componentes React | Prescrita pelo ROADMAP e CONTEXT.md; ~900k downloads/semana; 15k+ stars [VERIFIED: npm registry] |
| `React.lazy` + `Suspense` | nativo React 19 | Lazy-load do chunk PDF | Padrão do projeto (Phase 5); já em uso em outros módulos [VERIFIED: codebase] |
| `@tanstack/react-query` | `^5.100.11` | Fetch dos dados da versão específica | Padrão consolidado do projeto para todos os fetches Supabase [VERIFIED: codebase] |

### Suporte

| Biblioteca | Versão | Propósito | Quando Usar |
|------------|--------|-----------|-------------|
| `@supabase/supabase-js` | `^2.106.1` | Query `assessments` por `id` de versão | Já instalado; fetch do `form_data` JSONB para a versão selecionada |
| `useToast` (hook interno) | — | Feedback de erro ao gerar PDF | Padrão obrigatório do projeto; nunca importar `toast` do Sonner diretamente |

### Alternativas Consideradas

| Em vez de | Poderia Usar | Tradeoff |
|-----------|-------------|----------|
| `pdf().toBlob()` imperativo | `BlobProvider` componente | BlobProvider tem issue de re-render reativo e null URL em conditional rendering — imperativo é mais controlado |
| `pdf().toBlob()` imperativo | `usePDF` hook | usePDF é reativo (re-renderiza quando props mudam) — para single-shot export, imperativo é preferível |
| Helvetica (built-in) | `Font.register()` Google Fonts | Font.register requer rede e pode falhar offline; Helvetica é zero-dependency |

**Instalação:**
```bash
cd roteiro-unificado && npm install @react-pdf/renderer@4.5.1
```

---

## Auditoria de Legitimidade de Pacotes

| Pacote | Registro | Idade | Downloads | Repositório | slopcheck | Disposição |
|--------|----------|-------|-----------|-------------|-----------|------------|
| `@react-pdf/renderer` | npm | ~7 anos (monorepo diegomura/react-pdf) | ~900k/semana | github.com/diegomura/react-pdf | [ASSUMED — slopcheck indisponível] | Aprovado — confirmado via npm view + site oficial react-pdf.org + 15k+ stars GitHub |

**Pacotes removidos por veredito [SLOP]:** nenhum
**Pacotes sinalizados como suspeitos [SUS]:** nenhum

*slopcheck estava indisponível em tempo de research. O pacote `@react-pdf/renderer` é verificável via `npm view @react-pdf/renderer` (v4.5.1, sem postinstall script), repositório GitHub público com histórico de 7+ anos, e site oficial https://react-pdf.org. Risco de slop: BAIXO.*

---

## Padrões de Arquitetura

### Diagrama de Arquitetura do Sistema

```
HistoryPage.tsx
    │
    ├── useAssessmentHistory(orgId)        ← query existente (sem form_data)
    │       │
    │       └── Supabase: SELECT id, version, status, ...
    │
    ├── [card de versão]
    │       │
    │       └── <ExportPdfButton assessment={row} orgName={...} cnpj={...} />
    │               │
    │               ├── [onClick] → setState(LOADING)
    │               │
    │               ├── import('./PDFDocument')          ← dynamic import (chunk isolado)
    │               │       │
    │               │       └── fetchAssessmentData(id)
    │               │               │
    │               │               └── Supabase: SELECT form_data, readiness_level_mgmt, ...
    │               │                       WHERE id = {assessmentId}
    │               │
    │               ├── pdf(<PDFDocument data={...} />).toBlob()   ← @react-pdf/renderer imperativo
    │               │       │
    │               │       └── [blob pronto] → window.open(URL.createObjectURL(blob), '_blank')
    │               │
    │               └── [erro] → useToast().error('Falha ao gerar PDF. Tente novamente.')
```

### Estrutura de Projeto Recomendada

```
src/
├── lib/
│   └── pdf/
│       ├── index.ts              # Entry point do chunk: exporta generateAndOpenPDF()
│       ├── PDFDocument.tsx       # Componente raiz <Document><Page>...</Page></Document>
│       ├── PDFCoverPage.tsx      # Capa: SuaEquipe.IA, nome, CNPJ, versão, data, G1-G5
│       ├── PDFSectionHeader.tsx  # Barra horizontal #123B66 com label branco
│       ├── PDFFieldRow.tsx       # Linha label/valor em duas colunas (40%/60%)
│       ├── PDFSectionTorre360.tsx    # 5 seções Torre 360
│       ├── PDFSectionHabilitacoes.tsx # 4 seções Hab + NDA
│       └── PDFSectionFinal.tsx   # Página final com tabela G1-G5
├── features/
│   └── form/
│       ├── HistoryPage.tsx       # MODIFICADO: adiciona <ExportPdfButton>
│       └── ExportPdfButton.tsx   # NOVO: botão com state machine IDLE/LOADING/ERROR
```

### Padrão 1: Dynamic Import Isolado (lazy-loading EXPORT-05)

**O que é:** O chunk `src/lib/pdf/index.ts` contém toda a lógica de geração do PDF, incluindo o import de `@react-pdf/renderer`. O import é feito apenas quando o usuário clica "Exportar PDF".

**Quando usar:** Sempre — `@react-pdf/renderer` é uma biblioteca pesada (~350kb min) e não deve estar no bundle principal.

**Exemplo:**
```typescript
// src/features/form/ExportPdfButton.tsx
// Source: padrão estabelecido na Phase 5 do projeto + react-pdf.org/advanced
import { useState } from 'react'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'

interface ExportPdfButtonProps {
  assessmentId: string
  version: number
  orgName: string
  cnpj: string | null
  grade: string | null
}

export function ExportPdfButton({ assessmentId, version, orgName, cnpj, grade }: ExportPdfButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const handleExport = async () => {
    setIsLoading(true)
    try {
      // dynamic import — chunk isolado, @react-pdf/renderer nunca no bundle principal
      const { generateAndOpenPDF } = await import('@/lib/pdf/index')
      await generateAndOpenPDF({ assessmentId, version, orgName, cnpj, grade })
    } catch {
      toast.error('Falha ao gerar PDF. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      isLoading={isLoading}
      onClick={handleExport}
      aria-label={`Exportar PDF — Versão ${version}`}
      aria-busy={isLoading}
    >
      {isLoading ? 'Gerando...' : 'Exportar PDF'}
    </Button>
  )
}
```

### Padrão 2: API Imperativa `pdf().toBlob()` (geração e abertura em nova aba)

**O que é:** A função `pdf()` do `@react-pdf/renderer` gera o blob diretamente sem montar um componente. Mais controlado que `BlobProvider` para o padrão single-shot de exportação.

**Quando usar:** Quando a geração é disparada por um evento (clique), não reativa. Evita o pitfall de re-render do `BlobProvider`.

**Exemplo:**
```typescript
// src/lib/pdf/index.ts
// Source: react-pdf.org/advanced (seção Imperative API)
import { pdf } from '@react-pdf/renderer'
import { supabase } from '@/lib/supabase'
import { PDFDocument } from './PDFDocument'

export async function generateAndOpenPDF({
  assessmentId,
  version,
  orgName,
  cnpj,
  grade,
}: GeneratePDFOptions): Promise<void> {
  // 1. Fetch dos dados completos da versão (incluindo form_data)
  const { data, error } = await supabase
    .from('assessments')
    .select('form_data, readiness_level_mgmt, readiness_level_tech, submitted_at, version')
    .eq('id', assessmentId)
    .single()

  if (error || !data) throw new Error('Erro ao buscar dados da avaliação')

  // 2. Gerar blob do PDF
  const blob = await pdf(
    <PDFDocument
      formData={data.form_data}
      orgName={orgName}
      cnpj={cnpj}
      version={data.version}
      grade={grade}
      generatedAt={new Date()}
    />
  ).toBlob()

  // 3. Abrir preview em nova aba (D-04)
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  // Revogar URL após timeout para liberar memória
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
```

### Padrão 3: StyleSheet do @react-pdf/renderer (paleta azul/laranja)

**O que é:** Os estilos do PDF são definidos com `StyleSheet.create()`. Não usa classes Tailwind — usa hex diretos e flexbox.

**Quando usar:** Para todos os componentes internos do `PDFDocument`.

**Exemplo:**
```typescript
// Source: react-pdf.org/styling
import { StyleSheet, Text, View } from '@react-pdf/renderer'

// Cores hardcoded (tokens Tailwind não existem no contexto react-pdf)
const COLORS = {
  primary: '#123B66',
  accent: '#F28C28',
  white: '#FFFFFF',
  textPrimary: '#111827',
  textMuted: '#6B7280',
  textEmpty: '#9CA3AF',
  border: '#E5E7EB',
  // Escala G1-G5
  g1: '#B91C1C',
  g2: '#F28C28',
  g3: '#D97706',
  g4: '#1D4ED8',
  g5: '#16A34A',
} as const

const styles = StyleSheet.create({
  // Página
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10 },
  // Capa
  coverPage: { backgroundColor: COLORS.primary, padding: 40, flexDirection: 'column', justifyContent: 'center' },
  coverBrand: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: COLORS.white, marginBottom: 4 },
  coverBrandAccent: { color: COLORS.accent },
  coverOrgName: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: COLORS.white, marginBottom: 8 },
  coverMeta: { fontSize: 12, color: '#CBD5E1', marginBottom: 4 },
  // Header de seção
  sectionHeader: { backgroundColor: COLORS.primary, padding: 6, marginBottom: 8 },
  sectionHeaderText: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: COLORS.white },
  // Linha de campo
  fieldRow: { flexDirection: 'row', marginBottom: 4, paddingVertical: 2 },
  fieldLabel: { width: '40%', fontSize: 10, color: COLORS.textMuted },
  fieldValue: { width: '60%', fontSize: 10, color: COLORS.textPrimary },
  fieldEmpty: { width: '60%', fontSize: 10, color: COLORS.textEmpty },
  // Rodapé
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 6 },
  footerText: { fontSize: 9, color: COLORS.textMuted },
})
```

### Padrão 4: Rodapé com número de página (fixo em todas as páginas)

```typescript
// Source: react-pdf.org/advanced (seção Dynamic Content)
import { Text, View } from '@react-pdf/renderer'

function PDFFooter() {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>SuaEquipe.IA — Relatório Confidencial</Text>
      <Text
        style={styles.footerText}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </View>
  )
}
```

### Anti-padrões a Evitar

- **BlobProvider como componente montado em lista:** Montar um `BlobProvider` por card de versão na HistoryPage congela a página ao gerar múltiplos PDFs simultaneamente. Usar o padrão imperativo `pdf().toBlob()` em vez disso.
- **Importar `@react-pdf/renderer` no nível do módulo (top-level):** Qualquer import estático de `@react-pdf/renderer` inclui a biblioteca no bundle principal. SEMPRE usar dynamic import.
- **Usar tokens Tailwind v4 no StyleSheet:** `bg-primary` não funciona dentro de `StyleSheet.create()`. Usar hex diretos: `backgroundColor: '#123B66'`.
- **Usar `window.location.href = blobUrl`:** Navega na mesma aba, destruindo o estado da HistoryPage. Usar `window.open(url, '_blank')`.
- **Esquecer de revogar o Object URL:** `URL.createObjectURL()` cria uma referência que persiste em memória até a aba fechar. Usar `setTimeout(() => URL.revokeObjectURL(url), 60_000)` para liberar.
- **Chamar `@hookform/resolvers` ou hooks do React dentro do módulo pdf/:** O chunk pdf deve ser puro — sem hooks React, sem stores Zustand, sem react-router. Apenas `@react-pdf/renderer`, dados passados como props e funções puras.

---

## Não Construir na Mão

| Problema | Não Construir | Usar Em Vez Disso | Por Quê |
|----------|--------------|------------------|---------|
| Geração de PDF | Serialização HTML → canvas → imagem → PDF | `@react-pdf/renderer` | html2canvas falha com Tailwind v4, overflow, scroll; react-pdf lida com layout, paginação e fontes automaticamente |
| Lazy-load de chunk | Lógica manual de script injection | `React.lazy` + dynamic import | Vite 8 + Rolldown detecta e cria chunk automaticamente; zero config adicional |
| Paginação automática | Calcular alturas e quebrar manualmente | `Page` com `wrap` padrão | react-pdf quebra automaticamente quando o conteúdo excede a altura da página |
| Rodapé em todas as páginas | Duplicar o rodapé em cada seção | `fixed` prop no `<View>` | Componente com `fixed` renderiza em todas as páginas sem lógica adicional |
| Fontes embutidas | Hospedar e servir fontes customizadas | Helvetica (built-in) | Helvetica, Courier e Times-Roman já estão incluídos no react-pdf sem nenhuma configuração |

**Insight chave:** `@react-pdf/renderer` usa um motor de layout próprio (não CSS/DOM), então tentar usar componentes HTML ou estilos Tailwind dentro de componentes PDF é um erro categórico — cada componente deve ser primitivo do react-pdf.

---

## Armadilhas Comuns

### Armadilha 1: Re-render reativo do BlobProvider causa freeze

**O que dá errado:** `<BlobProvider document={<MyDoc />}>` re-renderiza e re-gera o PDF toda vez que qualquer prop do documento muda, inclusive se o componente estiver montado na lista de cards. Em uma HistoryPage com 5-10 versões, isso causaria 5-10 gerações simultâneas ao montar a página.

**Por que acontece:** BlobProvider é reativo por design — equivale a um `useEffect` que observa o documento e regera o blob quando muda.

**Como evitar:** Usar a API imperativa `pdf().toBlob()` dentro do `onClick` do botão — o PDF só é gerado quando o usuário clica, não ao montar o componente.

**Sinais de alerta:** Página fica lenta ou congela ao navegar para HistoryPage; múltiplas requisições de rede ao abrir o histórico.

### Armadilha 2: Null URL no BlobProvider com conditional rendering

**O que dá errado:** `BlobProvider` dentro de `{condition && <BlobProvider ...>}` retorna `url: null` ao re-montar após ter sido desmontado. O PDF aparenta estar pronto mas a URL está vazia.

**Por que acontece:** Issue reportado no GitHub diegomura/react-pdf#1433 — o estado interno do blob é descartado ao desmontar e não inicializa corretamente ao remontar.

**Como evitar:** Usar a API imperativa — não há conditional rendering envolvido.

### Armadilha 3: Import estático de @react-pdf/renderer no bundle principal

**O que dá errado:** `import { Document, Page } from '@react-pdf/renderer'` no topo de qualquer arquivo que já está no bundle principal (ex: `src/lib/pdf/PDFDocument.tsx` importado estaticamente em HistoryPage) inclui a biblioteca (~350kb) no chunk inicial.

**Por que acontece:** Vite/Rolldown inclui qualquer módulo transitivamente importado no chunk do importador.

**Como evitar:** O arquivo `src/lib/pdf/index.ts` deve ser importado APENAS via `import('./lib/pdf/index')` (dynamic import). Nunca adicionar import estático na HistoryPage ou em qualquer outro arquivo do bundle principal. Verificar no Network tab após build.

**Sinais de alerta:** Build output mostra `@react-pdf` no chunk `index.js`; Lighthouse First Load alto após a fase.

### Armadilha 4: Quebra de página cortando conteúdo no meio de uma seção

**O que dá errado:** Linhas de campos longas (ex: TorreSienge com 12 módulos × 5 colunas) são cortadas no meio entre páginas.

**Por que acontece:** O layout do react-pdf quebra quando a altura disponível na página é insuficiente e não encontra um break point adequado.

**Como evitar:** Usar `break` prop no primeiro `<View>` de cada seção principal para forçar seção a começar em nova página quando necessário. Alternativamente, usar `wrap={false}` em grupos de campos pequenos para mantê-los juntos. Testar com dados reais de seed antes de finalizar o layout.

### Armadilha 5: `form_data` JSONB com estrutura aninhada inesperada

**O que dá errado:** O campo `form_data` da tabela `assessments` é JSONB livre — pode ter estruturas diferentes entre versões antigas e novas (ex: `modules.cadastros.contratado` vs. um formato flat antigo de uma versão inicial do formulário).

**Por que acontece:** O schema Zustand evoluiu durante as fases; versões antigas podem ter estrutura ligeiramente diferente.

**Como evitar:** Sempre usar optional chaining ao acessar campos do `form_data` no template PDF: `formData?.['torre-decisao']?.['nivelGerencial'] ?? '—'`. Nunca assumir que um campo existe.

---

## Exemplos de Código

### Estrutura do PDFDocument raiz

```typescript
// Source: react-pdf.org/components
import { Document, Page } from '@react-pdf/renderer'
import { PDFCoverPage } from './PDFCoverPage'
import { PDFSectionTorre360 } from './PDFSectionTorre360'
import { PDFSectionHabilitacoes } from './PDFSectionHabilitacoes'
import { PDFSectionFinal } from './PDFSectionFinal'
import { PDFFooter } from './PDFFooter'
import type { AssessmentPDFData } from './types'

interface PDFDocumentProps {
  data: AssessmentPDFData
}

export function PDFDocument({ data }: PDFDocumentProps) {
  return (
    <Document
      title={`Relatório de Prontidão Gerencial — ${data.orgName} v${data.version}`}
      author="SuaEquipe.IA"
      subject="Avaliação de Prontidão"
    >
      {/* Página de capa — sem rodapé */}
      <PDFCoverPage data={data} />

      {/* Páginas de conteúdo — com rodapé fixo */}
      <Page size="A4" style={styles.page}>
        <PDFFooter />
        <PDFSectionTorre360 formData={data.formData} />
      </Page>
      <Page size="A4" style={styles.page}>
        <PDFFooter />
        <PDFSectionHabilitacoes formData={data.formData} />
      </Page>
      <Page size="A4" style={styles.page}>
        <PDFFooter />
        <PDFSectionFinal grade={data.grade} />
      </Page>
    </Document>
  )
}
```

### Fetch da versão específica com form_data

```typescript
// Fonte: padrão consolidado useQuery do projeto (Phase 9)
// A query principal de HistoryPage NÃO inclui form_data (pesado)
// Esta query separada só é feita ao exportar
async function fetchAssessmentData(assessmentId: string) {
  const { data, error } = await supabase
    .from('assessments')
    .select('id, version, form_data, readiness_level_mgmt, readiness_level_tech, submitted_at')
    .eq('id', assessmentId)
    .single()
  if (error) throw error
  return data
}
```

### Linha de campo com fallback "—" (D-03)

```typescript
// Source: react-pdf.org/components + decisão D-03
import { Text, View } from '@react-pdf/renderer'

function PDFFieldRow({ label, value }: { label: string; value: unknown }) {
  const display = value !== undefined && value !== null && value !== ''
    ? String(value)
    : '—'
  const isEmpty = display === '—'

  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={isEmpty ? styles.fieldEmpty : styles.fieldValue}>{display}</Text>
    </View>
  )
}
```

### Integração na HistoryPage (adição mínima)

```typescript
// Modificação em HistoryPage.tsx — apenas onde está o bloco de botões de ação
// Fonte: código existente roteiro-unificado/src/features/form/HistoryPage.tsx

{/* Botões de ação — ANTES (Phase 9): */}
<div className="flex shrink-0 items-center gap-2">
  {isSubmitted && (
    <Button variant="secondary" size="sm">Ver detalhes</Button>
  )}
  {/* ... Iniciar Nova Revisão ... */}
</div>

{/* Botões de ação — DEPOIS (Phase 10): */}
<div className="flex shrink-0 items-center gap-2">
  {isSubmitted && (
    <>
      <Button variant="secondary" size="sm">Ver detalhes</Button>
      <ExportPdfButton
        assessmentId={row.id}
        version={row.version}
        orgName={orgName}         // obtido da query da org ou do useAuth
        cnpj={orgCnpj}            // idem
        grade={row.readiness_level_mgmt}
      />
    </>
  )}
  {/* ... Iniciar Nova Revisão ... */}
</div>
```

**Nota sobre `orgName` e `cnpj`:** A `HistoryPage` atual não busca dados da org (nome + CNPJ). O plano precisa incluir uma query ou prop adicional para esses campos — são necessários para a capa do PDF (D-02). Opções: (a) adicionar `useQuery` para `orgs` pelo `orgId` dentro de `HistoryPageContent`, ou (b) passar como props via rota.

---

## Estado da Arte

| Abordagem Antiga | Abordagem Atual | Quando Mudou | Impacto |
|-----------------|----------------|--------------|---------|
| `manualChunks` no Vite | `rolldownOptions.output.codeSplitting.groups` | Vite 8 / Rolldown | `manualChunks` removido — projeto já usa rolldownOptions (verificado em vite.config.ts) |
| `BlobProvider` como componente reativo | `pdf().toBlob()` imperativo | react-pdf v3+ | Mais controle; sem re-render indesejado; recomendado para single-shot export |
| `Font.register()` obrigatório | Helvetica built-in | Desde v1 | react-pdf inclui Helvetica/Courier/Times-Roman — zero config para fontes básicas |
| `PDFDownloadLink` para download | `BlobProvider` + `window.open` para preview | Decisão D-04 | Preview em nova aba > download automático para UX de revisão |

**Obsoleto/Deprecado:**
- `onSuccess` do TanStack Query v4: removido no v5 — projeto usa `useEffect` com deps para hidratação (já consolidado na Phase 8)
- `ReactPDF.renderToStream()`: apenas para Node.js/SSR — irrelevante neste contexto client-side

---

## Inventário de Estado em Runtime

> Esta fase não é de rename/refactor/migration. Nenhuma renomeação de entidades ocorre.

Não aplicável — a fase adiciona funcionalidade nova (geração de PDF) sem modificar dados existentes no banco, sem renomear strings, sem alterar state de serviços externos.

---

## Log de Suposições

| # | Afirmação | Seção | Risco se Errado |
|---|-----------|-------|-----------------|
| A1 | A query existente de `useAssessmentHistory` não inclui `form_data` (coluna pesada) — uma query separada por `id` é necessária para exportação | Padrão 2, Exemplos de Código | Se `form_data` já estiver incluído no hook, a query extra é desnecessária — impacto baixo (duplicação de fetch) |
| A2 | `HistoryPage` não tem acesso ao `orgName` e `cnpj` da org — serão necessários para a capa do PDF | Integração na HistoryPage | Se o contexto já tiver orgName/cnpj disponível (ex: via useAuth ou outro hook), nenhuma query adicional é necessária |
| A3 | `@react-pdf/renderer` não está no bundle da Phase 9.5 (nenhum import estático introduzido) | Stack Padrão | Se algum import estático foi acidentalmente adicionado, o lazy-load não será efetivo |
| A4 | Helvetica built-in renderiza corretamente caracteres acentuados do português (é, ã, ç) | UI-SPEC §Tipografia | Helvetica pode não ter glyphs corretos para acentos PT-BR — se falhar, Font.register com Inter TTF seria necessário |
| A5 | `window.open(url, '_blank')` não é bloqueado pelo popup blocker porque é chamado dentro de um handler de clique do usuário | Padrão 2 | Em alguns browsers/configurações, mesmo cliques podem ser bloqueados como popup — fallback: `window.location.href = url` (mesma aba) |

---

## Questões em Aberto

1. **`orgName` e `cnpj` na HistoryPage**
   - O que sabemos: A `HistoryPage` atual usa `useAssessmentHistory(orgId)` e `useAuth()` — mas `useAuth()` retorna `orgId`, não `orgName` nem `cnpj`.
   - O que está incerto: Qual é a forma mais limpa de obter esses dados para a capa do PDF sem introduzir query extra pesada.
   - Recomendação: Adicionar `useOrgDetail(orgId)` (já existe em `src/features/admin/useOrgDetail.ts`) ou criar um hook leve `useOrgInfo(orgId)` que faz `SELECT name, cnpj FROM orgs WHERE id = orgId`.

2. **Acentos em Helvetica built-in**
   - O que sabemos: react-pdf documenta Helvetica como built-in; português contém acentos extensos (ã, ç, ê, ú etc.).
   - O que está incerto: Se Helvetica no motor do react-pdf v4 renderiza todos os glyphs PT-BR corretamente.
   - Recomendação: Testar no Plan 6 (testes e ajuste de layout) com campos reais que contenham acentos. Se falhar, registrar Inter via `Font.register()` com um arquivo TTF local (sem depender de URL externa).

3. **Tamanho real do chunk @react-pdf/renderer**
   - O que sabemos: A biblioteca é descrita como pesada (~350kb estimado baseado em treino).
   - O que está incerto: Tamanho exato após instalação e tree-shaking pelo Vite 8.
   - Recomendação: Após instalação, rodar `npm run build` e verificar tamanho do chunk no output. Se > 1MB, considerar usar a opção de web worker mencionada na documentação para documentos grandes (>30 páginas).

---

## Disponibilidade de Ambiente

| Dependência | Necessária Por | Disponível | Versão | Fallback |
|------------|---------------|-----------|--------|----------|
| Node.js | npm install + build | ✓ | v20.19.3 | — |
| npm | install @react-pdf/renderer | ✓ | 11.6.4 | — |
| `@react-pdf/renderer` | Geração do PDF | ✗ (não instalado) | — | Nenhum — instalar no Wave 0 |
| Supabase (banco remoto) | Fetch form_data por assessmentId | ✓ (credenciais .env.local) | — | — |
| Browser com suporte a Blob API | window.open + createObjectURL | ✓ | nativo | — |

**Dependências faltando sem fallback:**
- `@react-pdf/renderer` — deve ser instalado no Wave 0 (Plan 1) antes de qualquer implementação.

---

## Arquitetura de Validação

### Framework de Testes

| Propriedade | Valor |
|-------------|-------|
| Framework | Vitest 4.1.7 |
| Arquivo de config | `roteiro-unificado/vitest.config.ts` |
| Comando rápido | `cd roteiro-unificado && npm test -- --run src/lib/pdf` |
| Suite completa | `cd roteiro-unificado && npm test -- --run` |

### Mapa Requisitos → Testes

| Req ID | Comportamento | Tipo de Teste | Comando | Arquivo Existe? |
|--------|---------------|---------------|---------|-----------------|
| EXPORT-05 | Chunk PDF não incluído no bundle principal | Teste de build (manual) | `npm run build && ls -la dist/assets/ \| grep react-pdf` | ❌ Wave 0 (verificação manual no Plan 1) |
| EXPORT-01 | Botão "Exportar PDF" aparece apenas em versões submitted | Unit | `npm test -- --run src/features/form/ExportPdfButton.test.tsx` | ❌ Wave 0 |
| EXPORT-04 | Cada versão tem seu próprio botão de exportação | Unit (render) | Incluso em ExportPdfButton.test.tsx | ❌ Wave 0 |
| EXPORT-02 | Campos vazios exibem "—" | Unit puro | `npm test -- --run src/lib/pdf/PDFDocument.test.ts` | ❌ Wave 0 |
| EXPORT-01 | PDF abre em nova aba (window.open chamado) | Unit (mock) | Incluso em ExportPdfButton.test.tsx | ❌ Wave 0 |

### Taxa de Amostragem

- **Por commit de tarefa:** `cd roteiro-unificado && npm test -- --run src/lib/pdf src/features/form/ExportPdfButton`
- **Por merge de wave:** `cd roteiro-unificado && npm test -- --run`
- **Gate da fase:** Suite completa verde antes de `/gsd:verify-work`

### Lacunas do Wave 0

- [ ] `src/lib/pdf/index.test.ts` — testa `generateAndOpenPDF` com supabase mockado e verifica chamada a `window.open`
- [ ] `src/features/form/ExportPdfButton.test.tsx` — testa IDLE/LOADING/ERROR state machine; verifica `aria-label` e `aria-busy`
- [ ] `src/lib/pdf/PDFDocument.test.ts` — testa renderização do documento com dados completos e vazios (campos "—")

---

## Domínio de Segurança

### Categorias ASVS Aplicáveis

| Categoria ASVS | Aplica | Controle Padrão |
|----------------|--------|----------------|
| V2 Autenticação | não | Fluxo de auth existente (Phase 3) — exportação não requer autenticação adicional |
| V3 Gestão de Sessão | não | Sessão existente via Supabase Auth — sem estado de sessão novo |
| V4 Controle de Acesso | sim | RLS do Supabase — query por `assessmentId` respeita RLS; construtora só acessa seus dados |
| V5 Validação de Entrada | parcial | `assessmentId` é UUID gerado pelo Supabase; `form_data` é lido, não escrito nesta fase |
| V6 Criptografia | não | PDF é gerado client-side e aberto localmente — sem transmissão de dados sensíveis |

### Padrões de Ameaça Conhecidos para esta Stack

| Padrão | STRIDE | Mitigação Padrão |
|--------|--------|-----------------|
| Acesso a `form_data` de outra org via UUID manipulation | Spoofing / Tampering | RLS do Supabase bloqueia `SELECT` de `assessments` de outras orgs — verificado em Phase 2 e 8.1 |
| Popup blocker impedindo `window.open` | Denial of Service (UX) | Chamada dentro de handler de clique (evento de usuário) — popup blockers geralmente permitem; fallback documentado em A5 |
| Blob URL persistindo em memória | — | `URL.revokeObjectURL()` com `setTimeout(60s)` libera memória após uso |
| Cross-tenant leakage em cross-tenant guard | Spoofing | `HistoryPage` já tem cross-tenant guard: `if (orgId !== authOrgId) redirect` — sem mudança necessária |

---

## Fontes

### Primárias (confiança ALTA)

- `https://react-pdf.org/components` — API de componentes: Document, Page, View, Text, BlobProvider, PDFDownloadLink
- `https://react-pdf.org/advanced` — API imperativa `pdf().toBlob()`, `usePDF` hook, rodapé com `fixed`, dynamic content com `render` prop
- `https://react-pdf.org/fonts` — Built-in fonts (Helvetica, Courier, Times-Roman), `Font.register()` API
- `https://react-pdf.org/styling` — Propriedades CSS suportadas, flexbox, cores, bordas, tipografia
- Codebase do projeto: `HistoryPage.tsx`, `button.tsx`, `badge.tsx`, `useToast.ts`, `formStore.ts`, `readiness.ts`, `vite.config.ts` — verificados diretamente
- `npm view @react-pdf/renderer` — versão 4.5.1, publicado 2026-04-15, sem postinstall script

### Secundárias (confiança MÉDIA)

- GitHub diegomura/react-pdf#1921 — BlobProvider + PDFDownloadLink performance com múltiplos PDFs
- GitHub diegomura/react-pdf#1433 — BlobProvider null URL em conditional rendering
- GitHub diegomura/react-pdf#936 — Suspense/lazy com react-pdf (workaround via dynamic import)
- WebSearch confirmando ~900k downloads/semana e 15k+ stars (múltiplas fontes: npmtrends, socket.dev)

### Terciárias (confiança BAIXA)

- app.studyraid.com — otimização de react-pdf para produção (conteúdo gerado por IA, verificado parcialmente)

---

## Metadados

**Breakdown de confiança:**
- Stack padrão: HIGH — versão verificada via npm; API verificada via docs oficiais
- Arquitetura: HIGH — baseada em código existente do projeto e padrões consolidados de fases anteriores
- Armadilhas: MEDIUM/HIGH — pitfalls 1-3 verificados em GitHub issues; pitfall 4-5 baseados em padrões do projeto

**Data de pesquisa:** 2026-05-25
**Válido até:** 2026-06-25 (react-pdf estável; Vite 8 estável)
