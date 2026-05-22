# Phase 7: Campos — Habilitações, NDA & Classificação G1-G5 — Pesquisa

**Pesquisado:** 2026-05-22
**Domínio:** Formulário React (React Hook Form + Zod) — abas de habilitações, NDA e engine de classificação
**Confiança:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** G1-G5 gerencial via select direto — o consultor escolhe o nível gerencial explicitamente no select "Nível gerencial" da aba Torre Decisão (já existe). Sem score automático.
- **D-02:** HAB-A a HAB-E via select direto — consultor seleciona classificação de maturidade na aba Hab. Classificação. Sem algoritmo de inferência.
- **D-03:** `calculateReadiness(sectionData): ReadinessResult` — função pura em `src/lib/readiness.ts`. Lê `sectionData[TabKey.TorreDecisao].nivelGerencial`, `sectionData[TabKey.HabClassificacao].classificacaoFinal`, e `sectionData[TabKey.Nda].aceitaTermos`. Retorna `{ gerencial: 'G1'|...|'G5' | null, habilitacoes: 'HAB-A'|...|'HAB-E' | null, ndaAceito: boolean }`. Null quando o campo ainda não foi preenchido.
- **D-04:** Atualização em tempo real via `useMemo` — `calculateReadiness` é chamado via `useMemo` no componente `ReadinessClassification`, observando `sectionData` da store. Badge reflete a seleção atual imediatamente sem salvar.
- **D-05:** Texto completo do NDA + campos ao final — aba NDA renderiza o texto legal integral em `<div>` scrollable, seguido dos campos de aceite: nome do representante, cargo, CPF, data de aceite (auto-preenchida), e checkbox obrigatório.
- **D-06:** Texto hardcoded em `src/constants/nda-text.ts` — conteúdo extraído do HTML de referência como constante TypeScript. Sem dependência externa.
- **D-07:** Somente checkbox é obrigatório — `aceitaTermos: z.literal(true)`. Nome, CPF e cargo são `z.string().optional()`. Data preenchida automaticamente.
- **D-08:** Matriz de habilitações como grupos de campos — cada domínio é um grupo `<section>` com título + 4 campos (sem tabela HTML).
- **D-09:** Mapeamento de tipos por coluna — "Existe controle?" = SelectField (Sim/Não/Parcial), "Repositório principal" = SelectField, "Responsável interno" = texto livre, "Observações" = TextareaField.

### Claude's Discretion

- Domínios específicos da matriz de habilitações — extraídos do HTML de referência.
- Placement do `ReadinessClassification` — sticky bar na área de conteúdo do FormLayout (definido pelo UI-SPEC: inline bar acima da seção ativa, não flutuante).
- Formato do CPF — campo text simples (sem mask library instalada).

### Deferred Ideas (OUT OF SCOPE)

- Cálculo de score por sub-respostas.
- Tooltip no badge mostrando quais campos influenciam a classificação.
- Máscara de CPF na aba NDA.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Descrição | Suporte da Pesquisa |
|----|-----------|---------------------|
| FORM-02 | Todos os campos do HTML atual preservados na versão React (nenhuma seção omitida) | Inventário completo de campos extraído do HTML de referência para as 4 seções Hab + NDA; 3 tabelas dinâmicas mapeadas para schemas aninhados (padrão TorreSienge já validado) |
| FORM-03 | Validação de campos obrigatórios via Zod + React Hook Form | Pattern estabelecido na Phase 6: `mode: 'onBlur'`, `zodResolver`, `z.literal(true)` para checkbox obrigatório — totalmente replicável |
| FORM-07 | Classificação de prontidão G1-G5 calculada automaticamente | Engine é função pura que lê selects já existentes; `useMemo` sobre `sectionData` da store — sem dependência externa |
| UX-02 | Layout responsivo — desktop e tablet 768px | Grid 1-col/2-col com `md:grid-cols-2`, `max-w-2xl`, `flex-wrap` no badge bar — padrões já estabelecidos |
</phase_requirements>

---

## Resumo

A Phase 7 é uma fase de **expansão de padrões estabelecidos**, não de nova arquitetura. Toda a infraestrutura existe: store com `TabKey` para as 5 abas novas, `TAB_CONFIG` com labels, `FormLayout.tsx` com switch pronto para casos novos, e uma biblioteca completa de field components. A tarefa é criar 5 Section components + 1 lib function + 1 componente de display + 1 arquivo de constante, todos seguindo o modelo exato de `TorreClassificacaoSection.tsx`.

O ponto não-trivial desta fase é o **mapeamento completo das tabelas dinâmicas do HTML** para schemas Zod aninhados. O HTML usa `<tbody id="scenarioRowsH">` (10 linhas), `<tbody id="documentRowsH">` (14 domínios) e `<tbody id="responsibilityRowsH">` (10 atividades), todos gerados por JavaScript via `forEach`. Esses arrays são a fonte de verdade para os slugs de campo. O padrão de schema aninhado `modules.{slug}.{column}` do `TorreSiengeSection` é o modelo correto a replicar.

O segundo ponto relevante é que `calculateReadiness` lê um campo que já **existe** na aba Torre Decisão (`nivelGerencial` no schema `torre-decisao.ts`) — não há campo novo na Torre. A função é puramente de leitura do `sectionData` já sincronizado pelo Zustand.

**Recomendação primária:** Implementar os 5 Section components usando `TorreClassificacaoSection.tsx` e `TorreSiengeSection.tsx` como templates; criar `src/lib/readiness.ts` como função pura testável; montar `ReadinessClassification` acima do `renderSection` call no `<main>` do `FormLayout.tsx`.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Campos Hab. Venda (selects, checkboxes, textareas) | Frontend Client | — | Formulário puro; sem chamada de API nesta fase |
| Campos Hab. Repositórios (matriz 14 domínios) | Frontend Client | — | Schema aninhado + field mapping local |
| Campos Hab. Responsáveis (tabela 10 atividades + checkboxes) | Frontend Client | — | Idem |
| Campos Hab. Classificação (2 selects + textarea) | Frontend Client | — | Inputs que alimentam a engine G1-G5 |
| Campos NDA (texto legal + aceite) | Frontend Client | — | Sem persistência nesta fase; texto em constante TS |
| Engine `calculateReadiness` | Frontend Client (lib) | — | Função pura — sem I/O externo |
| Badge `ReadinessClassification` | Frontend Client | — | Display derivado do store via `useMemo` |
| Sincronização RHF → Zustand | Frontend Client (store) | — | `watch()` subscription para cada Section |
| Persistência de dados | Não implementada nesta fase | Supabase (Phase 8) | Phase 7 usa apenas sessionStorage via store |

---

## Stack Padrão

### Core (já instalado — sem novas dependências)

| Biblioteca | Versão em Uso | Propósito | Confirmação |
|------------|--------------|-----------|-------------|
| `react-hook-form` | 7.76.0 | Forms com `useForm`, `Controller`, `watch` | [VERIFIED: npm registry] — v7.76.0 confirmado |
| `@hookform/resolvers` | 5.4.0 | Bridge `zodResolver` | [VERIFIED: npm registry] — v5.4.0 confirmado |
| `zod` | 4.4.3 | Schema validation | [VERIFIED: npm registry] — v4.4.3 confirmado |
| `zustand` | 5.0.13 | Store global de formulário | [VERIFIED: npm registry] — v5.0.13 confirmado |
| `tailwindcss` | 4.3.0 | Estilos via Tailwind v4 tokens | [VERIFIED: npm registry] |

### Sem Dependências Novas

Esta fase não instala pacotes externos. Todos os componentes são criados internamente ou reutilizados do codebase:

- `src/components/ui/` — todos os field components prontos
- `src/stores/formStore.ts` — TabKey e store para as 5 abas novas já definidos
- `src/features/form/tabConfig.ts` — labels das 5 abas já definidos
- `src/components/ui/badge.tsx` — Badge G1-G5 com `Grade` type e `gradeConfig` prontos

---

## Package Legitimacy Audit

> Fase sem instalação de pacotes externos. Todos os pacotes utilizados estão presentes no `package.json` e foram instalados em fases anteriores.

| Package | Registry | Situação | slopcheck | Disposition |
|---------|----------|----------|-----------|-------------|
| react-hook-form | npm | Instalado (v7.76.0) | N/A | Aprovado — já em uso |
| zod | npm | Instalado (v4.4.3) | N/A | Aprovado — já em uso |
| @hookform/resolvers | npm | Instalado (v5.4.0) | N/A | Aprovado — já em uso |
| zustand | npm | Instalado (v5.0.13) | N/A | Aprovado — já em uso |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

*Nenhuma instalação nova nesta fase — auditoria de legitimidade não aplicável.*

---

## Inventário Completo de Campos do HTML

> Este inventário é a fonte de verdade para FORM-02. Extraído de `roteiro_unificado_completo_torre360_habilitacoes_nda_piloto_sinduscon_v2.html`.

### Aba Hab. Venda (`id="h_venda"`)

**Seção: Canais e situações comerciais**

| Campo (label HTML) | Tipo | Opções / Placeholder |
|--------------------|------|----------------------|
| Principal forma de venda | select | Venda própria/incorporação, Contratos privados, Licitações, Obras para terceiros, Financiamento habitacional, Misto |
| Quem pede documentos? | select | Bancos, Clientes privados, Órgãos públicos, Seguradoras, Cartórios, Investidores, Misto |
| Prazo típico para reunir documentos | select | Mesmo dia, 1 a 3 dias, Até 1 semana, Mais de 1 semana, Não há padrão |
| Já perdeu oportunidade por documentação? | select | Sim, Não, Quase perdeu, Não sabe |
| Principais exigências recorrentes | textarea | — |
| Onde costuma travar? | textarea | — |

**Seção: Matriz de cenários de habilitação** (tabela dinâmica — 10 linhas)

Gerada por `scenarioData` array no JavaScript. Cada linha representa um cenário com 5 campos:

| Cenário | Acontece hoje? | Importância | Quem conduz | Principal dificuldade | Observações para escopo |
|---------|----------------|-------------|-------------|----------------------|-------------------------|
| Venda própria de unidades / incorporação | select (Sim/Não/Parcial/Não sabe) | select (Alta/Média/Baixa/Eventual) | textarea | textarea | textarea |
| Contratos privados com clientes ou investidores | idem | idem | textarea | textarea | textarea |
| Financiamento habitacional | idem | idem | textarea | textarea | textarea |
| Financiamento para investimento / obra | idem | idem | textarea | textarea | textarea |
| Licitações públicas | idem | idem | textarea | textarea | textarea |
| Homologação como fornecedor | idem | idem | textarea | textarea | textarea |
| Programas, convênios ou parcerias institucionais | idem | idem | textarea | textarea | textarea |
| Seguros, garantias e cauções | idem | idem | textarea | textarea | textarea |
| Fiscalizações, auditorias ou exigências de órgãos | idem | idem | textarea | textarea | textarea |
| Abertura ou regularização de obra/empreendimento | idem | idem | textarea | textarea | textarea |

**Schema recomendado:** schema aninhado `scenarios.{slug}.{coluna}` — padrão `torreSiengeSchema`.

---

### Aba Hab. Repositórios (`id="h_repositorios"`)

**Seção: Onde os documentos vivem hoje** (checkboxes múltiplos)

Opções: Google Drive, OneDrive / SharePoint, Dropbox, Servidor local, Sienge / ERP, Sistema jurídico, Contador, Escritório jurídico, E-mail / WhatsApp, Pastas físicas, Terceiros / fornecedores, Não há repositório padrão

**Seção: Controles gerais** (selects)

| Campo | Tipo | Opções |
|-------|------|--------|
| Existe padrão de pastas? | select | Sim, Parcial, Não |
| Existe padrão de nomes? | select | Sim, Parcial, Não |
| Controlam validade? | select | Sim, Parcial, Não |
| Existe trilha de versão? | select | Sim, Parcial, Não |
| Observações sobre repositórios | textarea | — |

**Seção: Matriz enxuta de habilitações e documentos críticos** (tabela dinâmica — 14 domínios)

Gerada por `documentData` array. Cada linha tem 5 campos:

| Domínio | Existe controle? | Repositório principal | Responsável interno | Terceiros envolvidos | Observações que mudam escopo |
|---------|-----------------|----------------------|---------------------|---------------------|------------------------------|
| Empresa / CNPJ / societário | select (Sim/Parcial/Não/Não sabe) | textarea livre | textarea livre | textarea livre | textarea livre |
| Fiscal e tributário | idem | textarea | textarea | textarea | textarea |
| Trabalhista e previdenciário | idem | idem | idem | idem | idem |
| Contábil e econômico-financeiro | idem | idem | idem | idem | idem |
| Obras, alvarás e licenças | idem | idem | idem | idem | idem |
| Responsáveis técnicos, CREA/CAU e acervos | idem | idem | idem | idem | idem |
| Contratos, procurações e declarações | idem | idem | idem | idem | idem |
| Financiamentos, bancos e garantias | idem | idem | idem | idem | idem |
| Seguros, cauções e apólices | idem | idem | idem | idem | idem |
| Fornecedores, terceiros e subcontratados | idem | idem | idem | idem | idem |
| SST, saúde e segurança do trabalho | idem | idem | idem | idem | idem |
| Ambiental, cartorial e imobiliário | idem | idem | idem | idem | idem |
| Certificações, qualidade e compliance | idem | idem | idem | idem | idem |
| Kits para clientes, bancos ou editais | idem | idem | idem | idem | idem |

**Nota do HTML:** o campo "Repositório principal" e "Terceiros envolvidos" aparecem como `textarea` no HTML (não select), com placeholder "Drive, Sienge, contador...". A decisão D-09 do CONTEXT.md define "Repositório principal" como SelectField (GED/Pasta local/etc.). A decisão D-09 tem prioridade sobre o HTML bruto — o HTML de referência usa textarea como fallback, mas a decisão de UX é usar select estruturado para facilitar análise posterior.

**Schema recomendado:** schema aninhado `documents.{slug}.{coluna}` — padrão `torreSiengeSchema`.

---

### Aba Hab. Responsáveis (`id="h_responsabilidades"`)

**Seção: Dificuldades operacionais recorrentes** (checkboxes múltiplos)

Opções (12): Documento vencido sem alerta, Documento não localizado, Dependência do contador, Dependência do jurídico, Dependência da engenharia, Dependência de fornecedores, Dúvida sobre aplicabilidade, Falta de padrão de envio, Retrabalho para montar kit, Documentos em WhatsApp/e-mail, Falta de histórico, Ninguém é dono do processo

**Seção: Controles gerais** (selects + textarea)

| Campo | Tipo | Opções |
|-------|------|--------|
| Tempo médio para montar um kit | select | Mesmo dia, 1 a 3 dias, Até 1 semana, Mais de 1 semana, Não medem |
| Existe checklist padrão? | select | Sim, Parcial, Não |
| Existe rotina de renovação? | select | Sim, Parcial, Não |
| Existe validação antes do envio? | select | Sim, Parcial, Não |
| Observações sobre rotina e dificuldades | textarea | — |

**Seção: Mapa rápido de responsabilidades** (tabela dinâmica — 10 atividades)

Gerada por `responsibilities` array. Cada linha tem 5 campos:

| Atividade | Quem faz hoje? | Existe substituto? | Terceiro depende? | Maior dificuldade | Observações |
|-----------|----------------|--------------------|--------------------|-------------------|-------------|
| Solicitar documentos para oportunidade comercial | textarea | select (Sim/Parcial/Não/Não sabe) | select | textarea | textarea |
| Localizar documentos internos | idem | idem | idem | idem | idem |
| Solicitar documentos ao contador/jurídico/terceiros | idem | idem | idem | idem | idem |
| Validar validade e completude | idem | idem | idem | idem | idem |
| Renovar certidões e documentos vencidos | idem | idem | idem | idem | idem |
| Montar kit/dossiê de habilitação | idem | idem | idem | idem | idem |
| Aprovar envio ao cliente/banco/órgão | idem | idem | idem | idem | idem |
| Registrar histórico do que foi enviado | idem | idem | idem | idem | idem |
| Acompanhar pendências e prazos | idem | idem | idem | idem | idem |
| Atualizar repositório após a entrega | idem | idem | idem | idem | idem |

**Schema recomendado:** schema aninhado `responsibilities.{slug}.{coluna}`.

---

### Aba Hab. Classificação (`id="h_fechamento"`)

**Seção: Síntese para planejamento**

| Campo | Tipo | Opções |
|-------|------|--------|
| Classificação final | select | HAB-A — Pronta para operação, HAB-B — Organizada com lacunas, HAB-C — Controle parcial, HAB-D — Risco alto, HAB-E — Não recomendada sem ativação |
| Abordagem recomendada | select | Implantar direto, Implantar com carga inicial assistida, Ativar repositório e responsáveis primeiro, Começar por dossiê específico, Fazer fase preparatória antes do produto |
| Escopo inicial sugerido | select | Empresa/CNPJ, Obra/empreendimento, Financiamento, Licitação, Contrato privado/homologação, Fiscalização/auditoria, Misto reduzido |
| Complexidade/preço | select | Baixa, Média, Alta, Crítica |
| Fase 1 sugerida | textarea | — |
| Fase 2 sugerida | textarea | — |
| Riscos principais para contrato | textarea | — |
| Evidências essenciais a solicitar | textarea | — |
| Observações finais para proposta, escopo, preço e cronograma | textarea | — |

**Campo que alimenta `calculateReadiness`:** `classificacaoFinal` com enum `['hab-a', 'hab-b', 'hab-c', 'hab-d', 'hab-e']`.

---

### Aba NDA (`id="nda"`)

**Campos de identificação (no HTML original — adaptados conforme D-05/D-07):**

O HTML original contém campos para Parte A e Parte B separados (construtora e SuaEquipe.IA), CNPJ de ambas, representantes, data, vigência, foro. Conforme D-05, a versão React simplifica para os campos de aceite do representante da construtora apenas, com o texto NDA exibido integralmente como referência.

| Campo React | Tipo | Obrigatoriedade |
|-------------|------|-----------------|
| Nome do representante legal | InputField | opcional |
| Cargo | InputField | opcional |
| CPF do representante | InputField | opcional |
| Data de aceite | InputField (disabled) | auto-preenchida |
| Li e aceito os termos do NDA mútuo | CheckboxField (single) | **obrigatório** — `z.literal(true)` |
| Observações adicionais | TextareaField | opcional |

**Texto NDA:** 10 cláusulas extraídas do HTML (linhas 542–586 do HTML de referência). A constante `NDA_TEXT` deve incluir todos os parágrafos das cláusulas 1 a 11.

---

## Architecture Patterns

### Diagrama de Fluxo de Dados

```
HTML Form Input
      │
      ▼
useForm (RHF + zodResolver)
      │
      ├── control → Field Components (SelectField, RadioGroupField, etc.)
      │
      └── watch() subscription ──► store.updateSection(TabKey.X, values)
                                          │
                                          ▼
                              Zustand FormStore (sectionData)
                                          │
                              ┌───────────┴────────────────┐
                              │                            │
                              ▼                            ▼
               calculateReadiness(sectionData)     sessionStorage
                              │                    (persistência de sessão)
                              ▼
               ReadinessClassification component
               (useMemo → badge G1-G5 + HAB-X + NDA aceito)
```

### Estrutura de Arquivos Novos

```
src/
├── lib/
│   └── readiness.ts              # calculateReadiness — função pura
├── constants/
│   └── nda-text.ts               # NDA_TEXT — constante TypeScript
├── schemas/
│   ├── hab-venda.ts              # habVendaSchema + HAB_VENDA_REQUIRED_COUNT
│   ├── hab-repositorios.ts       # habRepositoriosSchema + HAB_REPOSITORIOS_REQUIRED_COUNT
│   ├── hab-responsaveis.ts       # habResponsaveisSchema + HAB_RESPONSAVEIS_REQUIRED_COUNT
│   ├── hab-classificacao.ts      # habClassificacaoSchema + HAB_CLASSIFICACAO_REQUIRED_COUNT
│   └── nda.ts                    # ndaSchema (z.literal(true) para aceitaTermos) + NDA_REQUIRED_COUNT
├── components/ui/
│   └── input-field.tsx           # InputField wrapper RHF — criar se não existir
└── features/form/
    ├── FormLayout.tsx             # MODIFICAR: 5 novos cases no switch + ReadinessClassification
    ├── ReadinessClassification.tsx  # Componente de badge em tempo real
    └── sections/
        ├── HabVendaSection.tsx
        ├── HabRepositoriosSection.tsx
        ├── HabResponsaveisSection.tsx
        ├── HabClassificacaoSection.tsx
        └── NdaSection.tsx
```

### Padrão 1: Section Component (modelo TorreClassificacaoSection)

**O que é:** Componente RHF isolado por aba, com `useForm` + `zodResolver` + subscription Zustand.

**Quando usar:** Para cada uma das 5 novas abas.

**Template:**
```typescript
// Source: src/features/form/sections/TorreClassificacaoSection.tsx (codebase existente)
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFormStore, TabKey } from '@/stores/formStore'
import { habVendaSchema, type HabVendaData } from '@/schemas/hab-venda'
import { SelectField, TextareaField, CheckboxGroupField } from '@/components/ui'

interface HabVendaSectionProps {
  tenantId: string
}

export function HabVendaSection({ tenantId }: HabVendaSectionProps) {
  const store = useFormStore(tenantId)

  const { control, watch, formState: { errors } } = useForm<HabVendaData>({
    resolver: zodResolver(habVendaSchema),
    defaultValues: (store.sectionData[TabKey.HabVenda] ?? {}) as Partial<HabVendaData>,
    mode: 'onBlur',
  })

  // CRÍTICO: sem deps — watch() retorna novo objeto a cada render; deps instáveis causam loop
  useEffect(() => {
    const subscription = watch((values) => {
      store.updateSection(TabKey.HabVenda, values as Record<string, unknown>)
    })
    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form className="max-w-2xl" noValidate>
      {/* grupos de campos */}
    </form>
  )
}
```

### Padrão 2: Schema Aninhado para Matrizes (modelo TorreSiengeSchema)

**O que é:** `z.object({ items: z.object({ slug1: itemSchema, slug2: itemSchema }).optional() })`

**Quando usar:** Hab. Venda (10 cenários), Hab. Repositórios (14 domínios), Hab. Responsáveis (10 atividades).

**Slugs recomendados para `scenarioData` (Hab. Venda):**
```typescript
// Source: script JavaScript no HTML de referência (linhas 626-637)
export const HAB_SCENARIOS = [
  { slug: 'venda-propria', label: 'Venda própria de unidades / incorporação' },
  { slug: 'contratos-privados', label: 'Contratos privados com clientes ou investidores' },
  { slug: 'financiamento-habitacional', label: 'Financiamento habitacional' },
  { slug: 'financiamento-investimento', label: 'Financiamento para investimento / obra' },
  { slug: 'licitacoes', label: 'Licitações públicas' },
  { slug: 'homologacao', label: 'Homologação como fornecedor' },
  { slug: 'programas-convenios', label: 'Programas, convênios ou parcerias institucionais' },
  { slug: 'seguros-garantias', label: 'Seguros, garantias e cauções' },
  { slug: 'fiscalizacoes', label: 'Fiscalizações, auditorias ou exigências de órgãos' },
  { slug: 'abertura-obra', label: 'Abertura ou regularização de obra/empreendimento' },
] as const
```

**Slugs recomendados para `documentData` (Hab. Repositórios — 14 domínios):**
```typescript
// Source: script JavaScript no HTML de referência (linhas 638-653)
export const HAB_DOCUMENT_DOMAINS = [
  { slug: 'empresa-cnpj', label: 'Empresa / CNPJ / societário' },
  { slug: 'fiscal-tributario', label: 'Fiscal e tributário' },
  { slug: 'trabalhista-previdenciario', label: 'Trabalhista e previdenciário' },
  { slug: 'contabil-financeiro', label: 'Contábil e econômico-financeiro' },
  { slug: 'obras-alvaras', label: 'Obras, alvarás e licenças' },
  { slug: 'responsaveis-tecnicos', label: 'Responsáveis técnicos, CREA/CAU e acervos' },
  { slug: 'contratos-procuracoes', label: 'Contratos, procurações e declarações' },
  { slug: 'financiamentos-bancos', label: 'Financiamentos, bancos e garantias' },
  { slug: 'seguros-caucoes', label: 'Seguros, cauções e apólices' },
  { slug: 'fornecedores-terceiros', label: 'Fornecedores, terceiros e subcontratados' },
  { slug: 'sst', label: 'SST, saúde e segurança do trabalho' },
  { slug: 'ambiental-cartorial', label: 'Ambiental, cartorial e imobiliário' },
  { slug: 'certificacoes', label: 'Certificações, qualidade e compliance' },
  { slug: 'kits-clientes', label: 'Kits para clientes, bancos ou editais' },
] as const
```

**Slugs recomendados para `responsibilities` (Hab. Responsáveis — 10 atividades):**
```typescript
// Source: script JavaScript no HTML de referência (linhas 654-665)
export const HAB_RESPONSIBILITIES = [
  { slug: 'solicitar-oportunidade', label: 'Solicitar documentos para oportunidade comercial' },
  { slug: 'localizar-internos', label: 'Localizar documentos internos' },
  { slug: 'solicitar-terceiros', label: 'Solicitar documentos ao contador/jurídico/terceiros' },
  { slug: 'validar-completude', label: 'Validar validade e completude' },
  { slug: 'renovar-certidoes', label: 'Renovar certidões e documentos vencidos' },
  { slug: 'montar-kit', label: 'Montar kit/dossiê de habilitação' },
  { slug: 'aprovar-envio', label: 'Aprovar envio ao cliente/banco/órgão' },
  { slug: 'registrar-historico', label: 'Registrar histórico do que foi enviado' },
  { slug: 'acompanhar-pendencias', label: 'Acompanhar pendências e prazos' },
  { slug: 'atualizar-repositorio', label: 'Atualizar repositório após a entrega' },
] as const
```

### Padrão 3: `calculateReadiness` — Função Pura

**O que é:** Lê `nivelGerencial` e `classificacaoFinal` do sectionData, retorna result tipado.

**Implementação:**
```typescript
// Source: CONTEXT.md D-03 (decisão do usuário)
// Arquivo: src/lib/readiness.ts
import { TabKey } from '@/stores/formStore'

export interface ReadinessResult {
  gerencial: 'G1' | 'G2' | 'G3' | 'G4' | 'G5' | null
  habilitacoes: 'HAB-A' | 'HAB-B' | 'HAB-C' | 'HAB-D' | 'HAB-E' | null
  ndaAceito: boolean
}

export function calculateReadiness(
  sectionData: Partial<Record<TabKey, Record<string, unknown>>>
): ReadinessResult {
  const torreDecisao = sectionData[TabKey.TorreDecisao] ?? {}
  const habClassificacao = sectionData[TabKey.HabClassificacao] ?? {}
  const nda = sectionData[TabKey.Nda] ?? {}

  const rawGerencial = torreDecisao['nivelGerencial'] as string | undefined
  const rawHab = habClassificacao['classificacaoFinal'] as string | undefined

  // Mapa de slugs do schema (lower) → display labels (G1-G5, HAB-A a HAB-E)
  const gerencialMap: Record<string, ReadinessResult['gerencial']> = {
    g1: 'G1', g2: 'G2', g3: 'G3', g4: 'G4', g5: 'G5',
  }
  const habMap: Record<string, ReadinessResult['habilitacoes']> = {
    'hab-a': 'HAB-A', 'hab-b': 'HAB-B', 'hab-c': 'HAB-C', 'hab-d': 'HAB-D', 'hab-e': 'HAB-E',
  }

  return {
    gerencial: rawGerencial ? (gerencialMap[rawGerencial] ?? null) : null,
    habilitacoes: rawHab ? (habMap[rawHab] ?? null) : null,
    ndaAceito: nda['aceitaTermos'] === true,
  }
}
```

### Padrão 4: `ReadinessClassification` com `useMemo`

**O que é:** Componente display que calcula o resultado em tempo real via `useMemo`.

**Placement:** Dentro do `<main>` do `FormLayout.tsx`, após o `<h1>` e antes do `renderSection()`.

```typescript
// Source: CONTEXT.md D-04; UI-SPEC placement section
import { useMemo } from 'react'
import { useFormStore } from '@/stores/formStore'
import { calculateReadiness } from '@/lib/readiness'
import { Badge } from '@/components/ui'

interface ReadinessClassificationProps {
  tenantId: string
}

export function ReadinessClassification({ tenantId }: ReadinessClassificationProps) {
  const store = useFormStore(tenantId)
  const result = useMemo(
    () => calculateReadiness(store.sectionData),
    [store.sectionData]
  )
  // ... render badges
}
```

### Padrão 5: `InputField` — Wrapper RHF para `<input>` simples

**O que é:** Componente que ainda não existe em `src/components/ui/`. Necessário para campos de texto livre no NDA e "Responsável interno" na matriz.

**Template:**
```typescript
// Source: padrão SelectField existente em src/components/ui/select-field.tsx
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { Input } from './input'

interface InputFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  control: Control<T>
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
}

export function InputField<T extends FieldValues>({
  name, control, label, placeholder, required, disabled, error,
}: InputFieldProps<T>) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-g1 ml-0.5">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input {...field} placeholder={placeholder} disabled={disabled} error={!!error} errorMessage={error} />
        )}
      />
      {error && <p className="text-g1 text-xs">{error}</p>}
    </div>
  )
}
```

### Padrão 6: NDA Schema com `z.literal(true)`

**O que é:** Único campo obrigatório de toda a Phase 7.

```typescript
// Source: CONTEXT.md D-07
import { z } from 'zod'

export const ndaSchema = z.object({
  nomeRepresentante: z.string().optional(),
  cargo: z.string().optional(),
  cpf: z.string().optional(),
  dataAceite: z.string().default(() => new Date().toLocaleDateString('pt-BR')),
  aceitaTermos: z.literal(true, {
    errorMap: () => ({ message: 'Você deve aceitar os termos do NDA para continuar' }),
  }),
  observacoes: z.string().optional(),
})
```

### Anti-Patterns a Evitar

- **`watch()` em deps do `useEffect`:** `watch()` retorna novo objeto a cada render — colocá-lo em deps cria loop infinito. Usar `useEffect(() => { const sub = watch(v => ...); return () => sub.unsubscribe() }, [])` sem deps. [VERIFIED: codebase — comentário D-02 em TorreClassificacaoSection.tsx]
- **Tabelas HTML nativas para matrizes:** O HTML de referência usa `<table>`. Não replicar tabelas HTML — usar `<section>` + grid responsivo conforme D-08. Tabelas não são responsivas em mobile sem scroll horizontal.
- **Hardcodar hex no JSX:** Usar sempre tokens Tailwind v4 (`bg-primary`, `text-accent`, `bg-g1..g5`). Hex quebra quando os tokens são atualizados em `src/index.css`.
- **`z.object({})` sem `.optional()` para objetos aninhados:** O campo `modules` no TorreSiengeSchema é `.optional()` para evitar erro na montagem inicial quando `defaultValues` é `{}`. Replicar para todos os schemas de matriz aninhada.
- **Checkbox single com `CheckboxGroupField`:** `CheckboxGroupField` gerencia arrays. Para `aceitaTermos` (boolean/literal), implementar `Controller` direto com `<input type="checkbox">` no NdaSection.

---

## Don't Hand-Roll

| Problema | Não Construir | Usar Em Vez | Motivo |
|----------|---------------|-------------|--------|
| Bridge RHF → Zod | Validação manual | `zodResolver(@hookform/resolvers)` | Gerencia tipos, mensagens, modo de validação |
| Sincronização form → store | `onChange` manual por campo | `watch()` subscription + `store.updateSection` | Padrão estabelecido — elimina render loops |
| Wrapper de campo de texto com label | `<div>` inline no JSX | `InputField` (criar seguindo padrão SelectField) | Consistência visual, tratamento de erro padronizado |
| Componente de badge de nível | Spans inline com lógica de cor | `Badge` existente em `src/components/ui/badge.tsx` | Já tem `gradeConfig` G1-G5, tipos corretos |
| Persistência de sessão | `localStorage.setItem` manual | Zustand store (já persiste em sessionStorage via subscriber) | Já implementado em `createFormStore` com namespace por tenant |

**Insight chave:** Toda a infraestrutura de formulário já existe. O trabalho desta fase é exclusivamente _criar conteúdo_ (campos, schemas, lógica de display) — não _criar infraestrutura_.

---

## Common Pitfalls

### Pitfall 1: `watch()` em deps do useEffect causa loop infinito

**O que acontece:** O formulário entra em loop de render infinito, travando o browser.
**Por que acontece:** `watch()` retorna um novo objeto a cada chamada — se usado como dep, o efeito dispara continuamente. Registrado em produção na Phase 6 (commit `fc7040a`).
**Como evitar:** `useEffect(() => { const sub = watch(v => store.updateSection(tab, v)); return () => sub.unsubscribe() }, [])` — array de deps vazio, eslint-disable para a linha.
**Sinal de alerta:** Browser trava ao abrir uma aba; CPU a 100%.

### Pitfall 2: Schema Zod aninhado sem `.optional()` no objeto pai

**O que acontece:** RHF lança erro de tipo ou falha em `defaultValues` quando o objeto pai não foi inicializado.
**Por que acontece:** `z.object({...})` sem `.optional()` cria campo required no schema; `defaultValues: {}` não satisfaz esse requisito.
**Como evitar:** Sempre envolver o objeto pai em `.optional()`: `scenarios: z.object({...}).optional()`. Ver `torreSiengeSchema.modules.optional()`.
**Sinal de alerta:** Erros de validação Zod ao montar o formulário com `defaultValues: {}`.

### Pitfall 3: `z.literal(true)` para checkbox — `undefined` não passa na validação

**O que acontece:** Ao submeter sem marcar o checkbox, o erro não é exibido porque `aceitaTermos` é `undefined`, não `false`.
**Por que acontece:** `z.literal(true)` aceita apenas exatamente `true`. `undefined` falha com erro genérico ou sem mensagem.
**Como evitar:** Definir `errorMap` explícito: `z.literal(true, { errorMap: () => ({ message: 'Você deve aceitar...' }) })`. Confirmar que o Controller inicializa o campo como `false` no defaultValues, não `undefined`.
**Sinal de alerta:** Checkbox sem erro visível ao submeter sem marcar.

### Pitfall 4: `calculateReadiness` acessa `nivelGerencial` em snake_case mas o schema usa lowercase (`g1`)

**O que acontece:** `result.gerencial` retorna `null` mesmo quando o campo está preenchido.
**Por que acontece:** O schema `torreDecisaoSchema` usa slugs `'g1'...'g5'` (minúsculo), mas o display usa `'G1'...'G5'` (maiúsculo). A função precisa mapear.
**Como evitar:** Usar o `gerencialMap` definido no Padrão 3 acima. Nunca comparar slug diretamente com label.
**Sinal de alerta:** Badge fica em estado "null" mesmo após selecionar nível gerencial.

### Pitfall 5: `FieldPath<T>` em schemas aninhados requer cast explícito

**O que acontece:** TypeScript recusa `name="scenarios.venda-propria.acontece"` por não inferir o path aninhado.
**Por que acontece:** `FieldPath<T>` infere paths de template literal, mas slugs com hífens podem não ser inferencíados automaticamente.
**Como evitar:** Usar cast: `` name={`scenarios.${item.slug}.acontece` as FieldPath<HabVendaData>} `` — padrão estabelecido em `TorreSiengeSection.tsx` linha 92.
**Sinal de alerta:** Erro TypeScript em `name=` de SelectField com path aninhado.

### Pitfall 6: `index.ts` de `src/components/ui/` não exporta `InputField`

**O que acontece:** Importar `{ InputField }` de `@/components/ui` lança erro de módulo não encontrado.
**Por que acontece:** Arquivo novo criado em `src/components/ui/input-field.tsx` sem adicionar export no `index.ts`.
**Como evitar:** Após criar `input-field.tsx`, adicionar `export { InputField } from './input-field'` no `index.ts`.
**Sinal de alerta:** Erro de importação no componente NdaSection ou na matriz de habilitações.

---

## Integração com FormLayout.tsx

O `FormLayout.tsx` atual tem `default` no switch que exibe placeholder para as 5 abas novas. A modificação necessária:

```typescript
// Source: src/features/form/FormLayout.tsx (codebase existente — MODIFICAR)
// ADICIONAR antes do default:
case TabKey.HabVenda:
  return <HabVendaSection tenantId={tenantId} />
case TabKey.HabRepositorios:
  return <HabRepositoriosSection tenantId={tenantId} />
case TabKey.HabResponsaveis:
  return <HabResponsaveisSection tenantId={tenantId} />
case TabKey.HabClassificacao:
  return <HabClassificacaoSection tenantId={tenantId} />
case TabKey.Nda:
  return <NdaSection tenantId={tenantId} />
```

E o `ReadinessClassification` fica no `<main>`, entre o `<h1>` e o `renderSection()`:

```tsx
// Source: UI-SPEC placement; CONTEXT.md D-04
<main className="flex-1 p-4 md:p-6">
  <h1 className="text-xl font-semibold text-gray-900">{activeTabConfig.label}</h1>
  <ReadinessClassification tenantId={tenantId} />
  {renderSection(store.activeTab, tenantId)}
</main>
```

---

## State of the Art

| Abordagem Antiga | Abordagem Atual | Impacto |
|-----------------|-----------------|---------|
| `useEffect` com `watch` em deps | `watch()` subscription sem deps + cleanup | Sem render loop — decisão tomada em Phase 6 |
| `window.location.hash = tab` | `window.history.replaceState` | Sem erro de ESLint hooks v7 — decisão tomada em Phase 5 |
| Schema Zod com campos obrigatórios | Todos os campos `.optional()` salvo checkbox NDA | Formulário de diagnóstico não bloqueia navegação |

---

## Assumptions Log

| # | Claim | Seção | Risco se Errado |
|---|-------|-------|-----------------|
| A1 | O campo `nivelGerencial` em `torreDecisaoSchema` usa slugs `'g1'..'g5'` (minúsculo) | Engine `calculateReadiness` | `calculateReadiness` retornaria null mesmo com campo preenchido — exige ajuste no gerencialMap |
| A2 | `CheckboxGroupField` não suporta boolean único — `aceitaTermos` requer Controller direto | NdaSection | Se CheckboxGroupField suportar boolean, implementação inline é desnecessária mas não incorreta |
| A3 | O campo "Repositório principal" na Matriz de Documentos (Hab. Repositórios) usa SelectField com opções estruturadas conforme D-09 — mesmo o HTML usando textarea | HabRepositoriosSection | Se o revisor preferir textarea (fidelidade ao HTML), o schema muda de enum para string.optional() |

**Verificação de A1:** Confirmado em `src/schemas/torre-decisao.ts` linha 30 — `nivelGerencial: z.enum(['g1', 'g2', 'g3', 'g4', 'g5'])`. [VERIFIED: codebase]

**Verificação de A2:** `CheckboxGroupField` gerencia arrays de string (linha 34 em checkbox-group-field.tsx: `defaultValue={[] as unknown as T[typeof name]}`). Para literal boolean, implementar Controller direto. [VERIFIED: codebase]

**Nota sobre A3:** CONTEXT.md D-09 tem precedência explícita — "Repositório principal = SelectField (opções: GED, Pasta local, Google Drive, SharePoint, Não possui)". Não é assumption, é decisão trancada.

---

## Open Questions (RESOLVED)

1. **Campo "Terceiros envolvidos" na Matriz de Documentos**
   - O que sabemos: O HTML original inclui coluna "Terceiros envolvidos" na tabela de documentos (linha 419 do HTML). A decisão D-08/D-09 não menciona essa coluna explicitamente.
   - O que não está claro: Deve ser incluída na versão React? D-09 define 4 campos por domínio — "Existe controle?", "Repositório principal", "Responsável interno", "Observações". "Terceiros envolvidos" seria o 5º campo.
   - Recomendação: Incluir como `TextareaField` para manter FORM-02 (100% dos campos). Se o planner tiver contexto contrário, omitir.
   - **RESOLVED:** campo `terceirosEnvolvidos` incluído como `TextareaField` em `hab-repositorios.ts` e `HabRepositoriosSection.tsx` (per FORM-02 — manter paridade total com o HTML de referência).

2. **Campos NDA — Parte B (SuaEquipe.IA)**
   - O que sabemos: O HTML original tem campos para representante e CNPJ da Parte B (SuaEquipe.IA). D-05 define apenas campos do representante da construtora.
   - O que não está claro: Os campos da Parte B (SuaEquipe.IA) devem aparecer no formulário ou estão excluídos por decisão?
   - Recomendação: Excluir Parte B — são dados do prestador de serviço, não da construtora. D-05 é claro em focar nos campos de aceite.
   - **RESOLVED:** campos da Parte B excluídos per D-05 — aba NDA foca apenas no aceite do representante da construtora (Parte A). Dados da SuaEquipe.IA não fazem parte do formulário do piloto.

---

## Environment Availability

> Esta fase é puramente de código front-end sem dependências externas além das já instaladas.

| Dependência | Requerida por | Disponível | Versão | Fallback |
|-------------|--------------|-----------|--------|---------|
| Node.js | Build + dev server | Sim (inferido pelo projeto rodando) | 20.19.3 (STATE.md) | — |
| npm | Gerenciamento de pacotes | Sim | — | — |
| Vite | Dev server + build | Sim | 8.0.14 | — |
| TypeScript | Type checking | Sim | ~6.0.0 | — |

**Dependências ausentes sem fallback:** nenhuma.

---

## Validation Architecture

### Test Framework

| Propriedade | Valor |
|-------------|-------|
| Framework | Não detectado — sem `jest.config.*`, `vitest.config.*`, `pytest.ini` ou diretório `tests/` no codebase |
| Config file | Nenhum — Wave 0 deve criar se testes forem necessários |
| Quick run command | N/A — sem framework instalado |
| Full suite command | N/A |

### Phase Requirements → Test Map

| Req ID | Comportamento | Tipo de Teste | Comando | Arquivo Existe? |
|--------|--------------|---------------|---------|----------------|
| FORM-02 | Todos os campos do HTML presentes | Manual (auditoria visual) | — inspeção manual campo a campo | N/A |
| FORM-03 | `aceitaTermos` obrigatório — erro inline sem marcar | Manual / Unit | — sem framework | Não |
| FORM-07 | `calculateReadiness` retorna G1-G5 correto e null para campos vazios | Unit | `vitest` se instalado | Não |
| UX-02 | Formulário operável em 768px sem overflow | Manual (resize browser) | — | N/A |

### Wave 0 Gaps

- [ ] Framework de testes não instalado — `calculateReadiness` é função pura, idealmente coberta por testes unitários com Vitest. Adicionar `vitest` é opcional mas recomendado para esta função.
- [ ] Se Vitest instalado: criar `src/lib/readiness.test.ts` cobrindo: campo vazio → null, slug `'g1'` → `'G1'`, slug `'hab-a'` → `'HAB-A'`, `aceitaTermos: true` → `ndaAceito: true`

*(Se a equipe decidir não instalar framework de testes agora, os testes UAT manuais descritos no ROADMAP cobrem os critérios de aceitação.)*

---

## Security Domain

> `security_enforcement` não está explicitamente configurado — tratado como habilitado.

### Applicable ASVS Categories

| Categoria ASVS | Aplica | Controle Padrão |
|----------------|--------|-----------------|
| V2 Autenticação | Não | — (Phase 3 já implementou) |
| V3 Session Management | Não | — (sessionStorage namespaceado por tenantId — já implementado) |
| V4 Access Control | Não | — (RLS Supabase + cross-tenant guard no FormLayout — já implementado) |
| V5 Input Validation | Sim | `zodResolver` + schemas Zod com tipos estritos — sem validação manual |
| V6 Cryptografia | Não | — (sem dados sensíveis tratados client-side nesta fase) |

### Known Threat Patterns

| Padrão | STRIDE | Mitigação Padrão |
|--------|--------|-----------------|
| Cross-tenant data leakage | Information Disclosure | `form-progress-${tenantId}` e `form-data-${tenantId}` — isolamento por tenantId já implementado |
| Bypass do campo obrigatório NDA | Tampering | `z.literal(true)` no schema Zod — não é possível submeter valor diferente de `true` |
| XSS via campos de texto livre | Tampering | React escapa automaticamente JSX; dados vão para store, não para innerHTML |

---

## Componente `ReadinessClassification` — Detalhes de Implementação

Conforme UI-SPEC `07-UI-SPEC.md` (aprovado), o badge de prontidão:

- **Placement:** `<main>` entre `<h1>` e `renderSection()` — visível em todas as abas
- **Layout:** `flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 mb-4`
- **Badge G1-G5:** Reutiliza componente `Badge` existente com `grade={gerencial as Grade}`
- **Badge HAB-X:** Span inline com classes Tailwind v4 padrão (não token customizado): `bg-green-100 text-green-700` (HAB-A), `bg-blue-100 text-blue-700` (HAB-B), `bg-yellow-100 text-yellow-700` (HAB-C), `bg-orange-100 text-orange-700` (HAB-D), `bg-red-100 text-red-700` (HAB-E)
- **Estado vazio:** `<span className="text-sm text-gray-400">Preencha as abas de classificação para ver o resultado</span>`
- **NDA aceito:** `<span className="text-xs text-green-700 font-medium">NDA aceito</span>`

---

## Sources

### Primary (HIGH confidence)
- `src/features/form/sections/TorreClassificacaoSection.tsx` — modelo exato de Section component
- `src/features/form/sections/TorreSiengeSection.tsx` — modelo exato de Section com schema aninhado
- `src/schemas/torre-classificacao.ts` — padrão de schema com REQUIRED_COUNT
- `src/schemas/torre-decisao.ts` — confirmação dos slugs `g1..g5` para `nivelGerencial`
- `src/stores/formStore.ts` — API completa da store com TabKey, updateSection, sectionData
- `src/components/ui/*.tsx` — API de todos os field components
- `roteiro_unificado_completo_torre360_habilitacoes_nda_piloto_sinduscon_v2.html` — fonte de verdade dos campos
- `.planning/phases/07-*/07-CONTEXT.md` — decisões D-01 a D-09 trancadas
- `.planning/phases/07-*/07-UI-SPEC.md` — design contract aprovado

### Secondary (MEDIUM confidence)
- `package.json` — versões exatas das dependências confirmadas via `npm view`
- `.planning/STATE.md` — histórico de decisões de fases anteriores

### Tertiary (LOW confidence)
- Nenhuma claim LOW nesta pesquisa — todo conteúdo baseado em codebase existente e decisões trancadas.

---

## Metadata

**Breakdown de confiança:**
- Stack padrão: HIGH — todo codebase está disponível e inspecionado
- Arquitetura: HIGH — padrões estabelecidos e validados na Phase 6
- Pitfalls: HIGH — baseados em erros reais registrados no STATE.md e comentários no código
- Mapeamento de campos: HIGH — extraído diretamente do HTML de referência linha a linha

**Data da pesquisa:** 2026-05-22
**Válido até:** 2026-06-22 (30 dias — stack estável, sem dependências externas novas)
