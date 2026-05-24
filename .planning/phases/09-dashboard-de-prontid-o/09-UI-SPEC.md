---
phase: 9
slug: dashboard-de-prontidao
status: draft
shadcn_initialized: false
preset: none
created: 2026-05-24
---

# Phase 9 — UI Design Contract: Dashboard de Prontidão

> Contrato visual e de interação para a Fase 9. Gerado pelo gsd-ui-researcher; verificado pelo gsd-ui-checker.
> Linguagem dos artefatos de planejamento: pt-BR. Código, commits e nomes de arquivo: inglês.

---

## Design System

| Propriedade | Valor |
|-------------|-------|
| Ferramenta | none (Tailwind v4 custom via `@theme {}`) |
| Preset | não aplicável |
| Biblioteca de componentes | componentes próprios em `src/components/ui/` |
| Biblioteca de ícones | SVG inline (Heroicons outline pattern — padrão estabelecido em ProgressBadge.tsx) |
| Fonte | Inter (declarada via `--font-sans` em `src/index.css`) |

Fonte: `src/index.css` (tokens `@theme {}`), `src/components/ui/` (componentes existentes)

---

## Spacing Scale

Escala de 8 pontos já adotada no projeto. Valores declarados:

| Token | Valor | Uso nesta fase |
|-------|-------|----------------|
| xs | 4px (`gap-1`, `px-1`) | Gap entre ícone e label nos cards de seção |
| sm | 8px (`gap-2`, `p-2`) | Espaço interno de badges e pills de status |
| md | 16px (`p-4`, `gap-4`) | Padding interno de CompanyCard e SectionProgress cards |
| lg | 24px (`p-6`, `gap-6`) | Padding do header de página e seções do OrgDetail |
| xl | 32px (`py-8`) | Espaçamento vertical entre blocos de conteúdo |
| 2xl | 48px (`py-12`) | Padding vertical de empty states |
| 3xl | 64px | Reservado — não utilizado nesta fase |

Exceções: nenhuma. Todos os espaçamentos são múltiplos de 4px.

Fonte: padrão inferido de `HistoryPage.tsx` (`px-4 py-8`, `p-4`, `mt-8`, `space-y-4`) e Card.tsx (`p-6`).

---

## Typography

Fonte base: Inter via `--font-sans`. Sem shadcn — classes Tailwind puras.

| Papel | Tamanho | Peso | Line-height |
|-------|---------|------|-------------|
| Body | 14px (`text-sm`) | 400 regular | 1.5 (`leading-normal`) |
| Label / metadata | 12px (`text-xs`) | 600 semibold | 1.5 |
| Heading de página | 20px (`text-xl`) | 600 semibold (`font-semibold`) | 1.2 |
| Heading de seção / card | 16px (`text-base`) | 600 semibold | 1.2 |

Regras:
- `font-semibold` exclusivo para headings e labels de badge — nunca body text.
- `text-gray-900` para headings; `text-gray-600` para metadados secundários; `text-gray-500` para subtítulos de apoio.
- CNPJ truncado em CompanyCard: `text-sm text-gray-500 font-mono` (legibilidade de dígitos).

Fonte: padrão estabelecido em `HistoryPage.tsx` (`text-xl font-semibold text-gray-900`, `text-sm text-gray-500`).

---

## Color

Tokens definidos em `src/index.css` via `@theme {}`. Nunca hardcodar hex nos componentes.

| Papel | Token Tailwind | Hex equivalente | Uso |
|-------|---------------|-----------------|-----|
| Dominant (60%) | `bg-white` / `bg-gray-50` | #FFFFFF / #F9FAFB | Superfície de página, fundo do conteúdo principal |
| Secondary (30%) | `bg-white border-gray-200` | #FFFFFF + #E5E7EB | Cards (CompanyCard, SectionProgress cards, OrgDetail section) |
| Accent (10%) | `bg-accent` | #F28C28 | Somente: badge "Enviado", botão "Nova Organização", botão primário de CTA |
| Primary sidebar | `bg-primary` | #123B66 | Sidebar do AdminLayout (já existente — não alterar) |
| Destructive | `bg-g1` | vermelho semântico | Nenhuma ação destrutiva nesta fase |

**Accent reservado para:**
1. Badge de status "Enviado" (`bg-accent text-white rounded-full`) — padrão de `HistoryPage.tsx`
2. Botão "Nova Organização" no header do AdminDashboard
3. Nenhum outro uso — filtros, links e cards secundários usam `bg-white` / `text-primary`

**Paleta semântica G1–G5** (tokens já declarados em `@theme {}`):

| Grade | Token | Significado |
|-------|-------|-------------|
| G1 | `bg-g1 text-white` | Crítico — vermelho |
| G2 | `bg-g2 text-white` | Baixo — laranja |
| G3 | `bg-g3 text-primary-900` | Médio — amarelo |
| G4 | `bg-g4 text-white` | Bom — azul |
| G5 | `bg-g5 text-white` | Excelente — verde |
| Sem avaliação | `bg-gray-200 text-gray-600` | Estado neutro — cinza |

**Paleta de status SectionProgress** (3 estados, D-06 do CONTEXT.md):

| Estado | Cor do ícone (ProgressBadge) | Pill de texto |
|--------|------------------------------|---------------|
| Vazio | `text-primary-300` (círculo vazio) | `bg-gray-100 text-gray-600` "Não iniciado" |
| Em progresso | `text-accent` (ícone clock) | `bg-orange-100 text-orange-700` "Em progresso" |
| Completo | `text-green-500` (ícone check) | `bg-green-100 text-green-700` "Completo" |

Fonte: `src/index.css` tokens + `badge.tsx` + `ProgressBadge.tsx` + `HistoryPage.tsx` padrões.

---

## Component Inventory

Componentes existentes a reutilizar — não recriar:

| Componente | Arquivo | Uso nesta fase |
|------------|---------|----------------|
| `Badge` | `src/components/ui/badge.tsx` | Grade G1-G5 em CompanyCard e OrgDetail |
| `Card`, `CardHeader`, `CardContent` | `src/components/ui/card.tsx` | Container de CompanyCard e SectionProgress cards |
| `Button` | `src/components/ui/button.tsx` | Todos os botões; variante `primary` para CTAs, `ghost` para voltar, `secondary` para "Ver detalhes" |
| `Skeleton` | `src/components/ui/skeleton.tsx` | Loading state de CompanyCard (3 cards fake) e SectionProgress (10 cards fake) |
| `Spinner` | `src/components/ui/spinner.tsx` | Loading state de página inteira (cross-tenant guard) |
| `ProgressBadge` | `src/features/form/ProgressBadge.tsx` | Ícone de estado (vazio/em progresso/completo) nos cards de SectionProgress |
| `AdminLayout` | `src/components/layouts/AdminLayout.tsx` | Layout wrapper para AdminDashboard e OrgDetail — não alterar |
| `CreateOrgModal` | `src/components/admin/CreateOrgModal.tsx` | Mantido em AdminDashboard — não remover |
| `ArchiveOrgDialog` | `src/components/admin/ArchiveOrgDialog.tsx` | Permanece em OrgDetail — não mover |

Novos componentes a criar nesta fase:

| Componente | Caminho sugerido | Responsabilidade |
|------------|-----------------|-----------------|
| `CompanyCard` | `src/components/admin/CompanyCard.tsx` | Card de empresa no grid do AdminDashboard |
| `CompanyDashboard` | `src/features/form/CompanyDashboard.tsx` | Página `/form/:orgId/dashboard` da construtora |
| `SectionProgress` | `src/features/form/SectionProgress.tsx` | Grid de 10 cards de progresso por aba |
| `AssessmentSection` | `src/components/admin/AssessmentSection.tsx` | Seção de assessment adicionada ao OrgDetail |

---

## Layout e Composição de Telas

### AdminDashboard (`/admin/dashboard`)

```
AdminLayout
└── AdminDashboard
    ├── Header row: h1 "Painel de Prontidão" + Button "Nova Organização" (accent)
    ├── Filtros row: Input busca nome/CNPJ + Select nível (G1-G5 + Todos) + Button "Limpar" (ghost) + span "{N} empresa(s)"
    └── Grid de CompanyCards
        ├── Loading: 6 Skeleton cards (mesmas dimensões do CompanyCard)
        └── Cards: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3, gap-6
```

**Grid spec:** `grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3`

### CompanyCard

```
Card (border-gray-200 shadow-sm)
├── CardHeader (pb-3)
│   ├── row: nome da empresa (text-base font-semibold text-gray-900) + Badge G1-G5 (ou "Sem avaliação" cinza)
│   └── CNPJ truncado (text-xs text-gray-500 font-mono)
├── CardContent (pt-0)
│   ├── "Última avaliação: {data}" ou "—" (text-sm text-gray-500)
│   └── "Nível técnico: {string}" ou "—" (text-sm text-gray-600)
└── CardFooter (pt-3 border-t border-gray-100)
    └── Link "Ver detalhes →" como Button variant="ghost" size="sm" → /admin/orgs/:orgId
```

### Filtros do AdminDashboard

- Input busca: `placeholder="Buscar por nome ou CNPJ"`, width `w-full sm:w-64`, `rounded-md border border-gray-300 px-3 py-2 text-sm`
- Select nível: opções "Todos", "G1", "G2", "G3", "G4", "G5", "Sem avaliação"
- Contagem: `text-sm text-gray-500` à direita dos filtros — "{N} empresa(s) encontrada(s)"
- Botão "Limpar filtros": `Button variant="ghost" size="sm"` — visível apenas quando filtros ativos

### CompanyDashboard (`/form/:orgId/dashboard`)

```
div.mx-auto.max-w-4xl.px-4.py-8
├── Button "← Voltar ao Formulário" variant="ghost" size="sm" (mb-4)
├── h1 "Painel de Prontidão" (text-xl font-semibold text-gray-900)
├── p subtítulo (text-sm text-gray-500, mt-1)
├── Card de classificação atual
│   ├── Badge G1-G5 grande (px-4 py-1 text-sm) ou "Sem avaliação"
│   ├── "Última avaliação enviada: {data}" ou "Nenhuma avaliação enviada"
│   └── nível técnico string
├── SectionProgress (mt-8) — grid 10 abas
└── Footer actions (mt-8, flex gap-3)
    ├── Button "Continuar Avaliação" variant="primary" → /form/:orgId
    └── Button "Ver Histórico" variant="secondary" → /form/:orgId/history
```

### SectionProgress

```
div.grid.grid-cols-1.gap-3.sm:grid-cols-2.lg:grid-cols-3 (10 cards)

Por card:
Card (p-4)
├── row: ProgressBadge(completeness) + label da aba (text-sm font-medium text-gray-900)
└── pill de status (text-xs rounded-full px-2 py-0.5)
    ├── Vazio: "Não iniciado" — bg-gray-100 text-gray-600
    ├── Em progresso: "Em progresso" — bg-orange-100 text-orange-700
    └── Completo: "Completo" — bg-green-100 text-green-700
```

`completeness` para o `ProgressBadge`: `0` (vazio), `0.5` (em progresso — valor fixo para o ícone clock), `1` (completo).

### OrgDetail — Seção de Assessment adicionada

```
OrgDetail (layout existente — não alterar nada acima)
└── <section> "Avaliações" (mt-8, border-t border-gray-200 pt-8)
    ├── h2 "Avaliações" (text-lg font-semibold text-gray-900)
    └── lista de assessment cards (padrão de HistoryPage.tsx)
```

---

## Estados e Interações

### Estados obrigatórios por view

| View | Loading | Empty | Error | Data |
|------|---------|-------|-------|------|
| AdminDashboard | 6 Skeleton cards | "Nenhuma empresa cadastrada ainda" | toast.error | grid de CompanyCards |
| CompanyDashboard | Spinner de página + Skeleton cards SectionProgress | "Nenhuma avaliação enviada ainda" | toast.error | cards preenchidos |
| OrgDetail (section) | Skeleton 3 cards | "Nenhuma avaliação registrada" | toast.error | lista de versões |

### Filtros AdminDashboard — comportamento

- Filtro é **client-side** via `useMemo` — sem re-fetch.
- Busca: `toLowerCase().includes(searchTerm.toLowerCase())` sobre `org.name` e `org.cnpj`.
- Nível: comparação exata de `assessment?.readiness_level_mgmt === selectedGrade`; "Sem avaliação" filtra `!assessment`.
- "Limpar filtros": reset de ambos os estados para valor inicial ("" e "Todos").
- Contagem: `{filtered.length} empresa(s) encontrada(s)` — sempre visível quando filtros ativos.

### Cross-tenant guard — CompanyDashboard

Padrão idêntico ao `HistoryPage.tsx`:
```
if (authLoading || !orgId || !authOrgId) → <Spinner />
if (orgId !== authOrgId) → <Navigate to={`/form/${authOrgId}/dashboard`} replace />
```

### Interações de navegação

| Elemento | Destino |
|----------|---------|
| CompanyCard "Ver detalhes →" | `/admin/orgs/:orgId` |
| CompanyDashboard "Continuar Avaliação" | `/form/:orgId` |
| CompanyDashboard "Ver Histórico" | `/form/:orgId/history` |
| SectionProgress card (opcional) | `#${tabKey}` hash no `/form/:orgId` — somente se implementação for trivial; caso contrário omitir |
| OrgDetail link exportação | reservado para Phase 10/11 — botão presente mas desabilitado com tooltip "Em breve" |

---

## Copywriting Contract

| Elemento | Cópia |
|----------|-------|
| Título AdminDashboard | "Painel de Prontidão" |
| Subtítulo AdminDashboard | "Visão geral de todas as organizações do piloto" |
| CTA principal AdminDashboard | "Nova Organização" |
| Placeholder busca | "Buscar por nome ou CNPJ" |
| Label select filtro | "Nível de prontidão" |
| Botão limpar | "Limpar filtros" |
| Contagem de resultados | "{N} empresa(s) encontrada(s)" |
| Badge sem avaliação | "Sem avaliação" |
| CompanyCard data vazia | "—" (em campos sem valor) |
| Título CompanyDashboard | "Painel de Prontidão" |
| Subtítulo CompanyDashboard | "Acompanhe sua classificação e o progresso do formulário" |
| CTA continuar | "Continuar Avaliação" |
| Link histórico | "Ver Histórico" |
| Link voltar (ambas as views) | "← Voltar ao Formulário" |
| Empty state AdminDashboard heading | "Nenhuma empresa cadastrada" |
| Empty state AdminDashboard body | "Crie a primeira organização clicando em 'Nova Organização'." |
| Empty state AdminDashboard após filtro | "Nenhuma empresa encontrada para os filtros selecionados." |
| Empty state CompanyDashboard heading | "Nenhuma avaliação enviada ainda" |
| Empty state CompanyDashboard body | "Preencha o formulário e clique em 'Enviar Avaliação' para registrar sua prontidão." |
| Empty state OrgDetail section heading | "Nenhuma avaliação registrada" |
| Empty state OrgDetail section body | "Esta organização ainda não submeteu nenhuma avaliação." |
| Error state (toast) | "Erro ao carregar dados. Tente recarregar a página." |
| Status pill: Não iniciado | "Não iniciado" |
| Status pill: Em progresso | "Em progresso" |
| Status pill: Completo | "Completo" |
| Seção de avaliações em OrgDetail | "Avaliações" |

**Ações destrutivas nesta fase:** nenhuma. Botão "Arquivar" já existe em OrgDetail (Phase 4) — não alterar.

---

## Responsividade

| Breakpoint | Comportamento |
|------------|---------------|
| Mobile (< 640px) | CompanyCard grid: 1 coluna; SectionProgress grid: 1 coluna; filtros em coluna; botões full-width |
| Tablet (640px–1024px) | CompanyCard grid: 2 colunas; SectionProgress grid: 2 colunas; filtros em row |
| Desktop (> 1024px) | CompanyCard grid: 3 colunas; SectionProgress grid: 3 colunas; filtros em row compacto |

Breakpoints Tailwind: `sm:` = 640px, `lg:` = 1024px — padrão já adotado no projeto.

---

## Registry Safety

| Registry | Blocos usados | Safety Gate |
|----------|---------------|-------------|
| shadcn official | não aplicável — shadcn não inicializado | não requerido |
| Terceiros | nenhum | não requerido |

Nenhuma dependência nova de terceiros nesta fase. Todos os componentes são próprios ou já existentes.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
