---
phase: 5
slug: shell-do-formul-rio-navega-o-por-abas
status: draft
shadcn_initialized: false
preset: none
created: 2026-05-22
---

# Phase 5 — UI Design Contract

> Contrato visual e de interação para o shell do formulário e navegação por abas.
> Gerado por gsd-ui-researcher. Verificado por gsd-ui-checker.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none — biblioteca de componentes própria com Tailwind v4 |
| Preset | not applicable |
| Component library | Componentes customizados em `src/components/ui/` (Button, Badge, Spinner, Skeleton, Card, Input, Textarea, Select, Dialog) |
| Icon library | Heroicons inline SVG (padrão estabelecido em AdminSidebar) |
| Font | Inter via `--font-sans` (`src/index.css @theme`) |

**Fonte:** `src/index.css`, `src/components/ui/`, `src/components/layouts/AdminSidebar.tsx` — padrões já estabelecidos.

---

## Spacing Scale

Escala de 4 pontos — alinhada ao padrão Tailwind v4 já em uso no projeto:

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px (`gap-1`, `p-1`) | Gaps entre ícone e label no stepper; separadores finos |
| sm | 8px (`gap-2`, `p-2`) | Padding interno de pills mobile; gap entre ícone de status e label |
| md | 16px (`gap-4`, `p-4`) | Padding do conteúdo principal; espaçamento entre campos placeholder |
| lg | 24px (`gap-6`, `p-6`) | Padding da área de conteúdo da aba ativa |
| xl | 32px (`gap-8`, `p-8`) | Margem superior da área de conteúdo (offset da progress bar) |
| 2xl | 48px | Não usado nesta fase |
| 3xl | 64px | Não usado nesta fase |

Exceptions:
- Progress bar fixa no topo: `h-1` (4px) — faixa thin sem padding
- Itens do stepper: `px-3 py-2` (12px × 8px) — segue padrão AdminSidebar (`h-10` = 40px touch target)
- Largura da sidebar: `min-w-[220px] max-w-[300px]` — adapta a labels longos (D-08)
- Botão Sair no rodapé: `mt-auto pt-4 border-t` — separação visual por linha divisória

---

## Typography

Fonte: Inter (`--font-sans`). Pesos: 400 (regular) e 600 (semibold) — padrão estabelecido no projeto.

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px (`text-sm`) | 400 (regular) | 1.5 |
| Label | 14px (`text-sm`) | 600 (semibold) | 1.4 |
| Tab label (sidebar) | 14px (`text-sm`) | 400 — ativo: 500 (`font-medium`) | 1.4 |
| Section heading (conteúdo) | 20px (`text-xl`) | 600 (semibold) | 1.2 |

**Nota:** Nesta fase os headings de conteúdo são placeholders. "Tab label ativo" usa `font-medium` (500) conforme D-06 e padrão AdminSidebar.

**Fonte:** `src/components/layouts/AdminSidebar.tsx` (`text-sm`, `font-semibold`) + padrão estabelecido em Phase 1.

---

## Color

Tokens declarados em `src/index.css @theme`. Nunca usar hex diretamente nos componentes.

| Role | Token | Hex aproximado | Usage |
|------|-------|----------------|-------|
| Dominant (60%) | `bg-gray-50` / `bg-white` | #F9FAFB / #FFFFFF | Fundo da tela, área de conteúdo da aba ativa |
| Secondary (30%) | `bg-primary` | #123B66 | Sidebar do stepper (fundo azul), igual ao AdminSidebar |
| Accent (10%) | `text-accent` / `bg-accent` | #F28C28 | Ícone de status "em progresso" (D-11); progresso da barra no topo |
| Destructive | `bg-g1` | vermelho | Botão Sair — apenas se confirmação de ação destrutiva (n/a nesta fase) |

**Accent reservado para:**
1. Ícone de status "em progresso" (`completeness > 0 && < 1`) no stepper sidebar
2. Barra de progresso geral no topo — parte preenchida (`bg-accent` ou `bg-primary` — ver abaixo)
3. Estado hover do item ativo da aba no mobile (pill selecionado)

**Barra de progresso no topo:** `bg-primary` para a parte preenchida, `bg-gray-200` para o fundo — conforme D-05 (`bg-primary`). Fundo cinza claro é o estado inicial.

**Ícones de status (D-11):**
- Não iniciado (`completeness === 0`): círculo vazio, `text-primary-300` (cinza-azulado apagado sobre fundo azul)
- Em progresso (`completeness > 0 && < 1`): meio-preenchido, `text-accent` (laranja)
- Completo (`completeness === 1`): check, `text-green-500` — mapeado para `oklch(0.59 0.16 150)` (`bg-g5`/`text-g5`)

**Item de aba ativo na sidebar:**
- Fundo: `bg-primary-800` (azul mais escuro, padrão AdminSidebar)
- Texto: `text-white font-medium`

**Item de aba não ativo na sidebar:**
- Texto: `text-primary-100`
- Hover: `hover:bg-primary-800 hover:text-white`

**Fonte:** `src/index.css` (tokens), `src/components/layouts/AdminSidebar.tsx` (padrão de cor ativa/inativa), `05-CONTEXT.md` D-05, D-06, D-11.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | "Continuar" — botão de navegação entre abas (avançar para próxima aba); sem CTA de submit nesta fase |
| Tab labels (10 abas) | Identificação / Torre Decisão / Torre Sienge / Torre Acesso / Torre Classificação / Hab. Venda / Hab. Repositórios / Hab. Responsáveis / Hab. Classificação / NDA |
| Conteúdo placeholder por aba | "[Nome da Aba] — campos serão implementados na Phase 6" (texto descritivo, não exibido ao usuário final) |
| Empty state (aba sem conteúdo) | "Esta seção ainda não possui campos. Em breve os campos estarão disponíveis aqui." |
| Erro de carregamento da store | "Não foi possível carregar os dados do formulário. Tente recarregar a página." |
| Botão Sair | "Sair" com ícone de logout (ArrowRightOnRectangle / power-off) — `Button variant="ghost"` |
| Tooltip de status (diferido) | DIFERIDO para Phase 6 — não implementar nesta fase |
| Nome da empresa na sidebar | Exibir `orgId` ou nome da org obtido via `useAuth().orgId` — texto truncado com `truncate` se necessário |
| Loading state (store rehidratando) | `Spinner` centralizado na área de conteúdo — sem texto adicional |

**Ações destrutivas nesta fase:** Apenas "Sair" (signOut). Sem dialog de confirmação — ação direta via `signOut()` do `useAuth()`. Não é destrutiva para dados (dados ficam em localStorage/sessionStorage).

**Fonte:** `05-CONTEXT.md` D-06, D-07; REQUIREMENTS.md FORM-01; padrão AdminHeader ("Encerrar sessão" → simplificado para "Sair" no contexto de construtora).

---

## Component Inventory

Componentes a criar nesta fase em `src/features/form/`:

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| `FormLayout` | `src/features/form/FormLayout.tsx` | Layout principal: `flex h-screen`, sidebar + `flex-1` conteúdo. Responsivo: `flex-col` em `< md`, `flex-row` em `>= md` |
| `TabNavigation` | `src/features/form/TabNavigation.tsx` | Lista das 10 abas como stepper vertical (desktop) ou pills horizontais scrolláveis (mobile). Lê `activeTab` e `visitedTabs` da store |
| `ProgressBar` | `src/features/form/ProgressBar.tsx` | Faixa sticky `h-1` no topo. Largura calculada a partir de `completeness` agregado de todas as abas |
| `ProgressBadge` | `src/features/form/ProgressBadge.tsx` | Ícone SVG inline por estado: círculo vazio / meio-preenchido / check. Props: `completeness: number` |
| `useFormSection` | `src/features/form/useFormSection.ts` | Hook: `{ data, updateField, errors, completeness }` para a aba solicitada (D-10) |
| `tabConfig` | `src/features/form/tabConfig.ts` | Array `{ key: TabKey, label: string }` com os 10 itens. Fonte única de labels |

Componentes reutilizados de `src/components/ui/`:
- `Button` (variant `ghost`, size `sm`) — botão Sair
- `Spinner` — loading state da store
- `Skeleton` — não requerido nesta fase, mas disponível para Phase 6+

**Fonte:** `05-CONTEXT.md` (seção Claude's Discretion, code_context), `src/components/ui/index.ts`.

---

## Layout Contract

### Desktop (`>= md`, 768px+)

```
┌─────────────────────────────────────────────────────────┐
│ Progress Bar (h-1, sticky, full width, bg-primary)      │ ← topo absoluto
├──────────────────┬──────────────────────────────────────┤
│                  │                                       │
│  Sidebar         │  Conteúdo da Aba Ativa               │
│  bg-primary      │  bg-white / bg-gray-50               │
│  min-w-[220px]   │  flex-1, p-6                         │
│  max-w-[300px]   │                                       │
│                  │  Placeholder da aba ou conteúdo       │
│  [Roteiro        │  (Phase 6+ injeta campos aqui)        │
│   Unificado]     │                                       │
│                  │                                       │
│  ○ Identificação │                                       │
│  ◑ Torre Decisão │                                       │
│  ✓ Torre Sienge  │                                       │
│  ○ ...           │                                       │
│                  │                                       │
│  ─────────────── │                                       │
│  [Sair]          │                                       │
└──────────────────┴──────────────────────────────────────┘
```

### Mobile (`< md`, < 768px)

```
┌─────────────────────────────────────────────────────────┐
│ Progress Bar (h-1, sticky)                              │
├─────────────────────────────────────────────────────────┤
│ Pills horizontais scrolláveis (overflow-x-auto)         │
│ [○ Ident.] [◑ Torre D.] [✓ Torre S.] [○ ...]           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Conteúdo da Aba Ativa (full width, p-4)               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Nota mobile:** Pills sem label completo — apenas ícone de status + abreviação se couber. `scrollIntoView()` ao trocar de aba é DIFERIDO para Phase 12.

**Fonte:** `05-CONTEXT.md` D-05, D-08, specifics; REQUIREMENTS.md UX-02.

---

## Interaction Contract

| Interação | Comportamento |
|-----------|---------------|
| Clique em aba da sidebar | `setActiveTab(tab)` + `window.location.hash = tabKey` + `markTabVisited(tab)` |
| Browser back/forward | `popstate` via `useLocation().hash` (React Router v6) sincroniza `activeTab` na store |
| Deep-link via URL hash | Ao montar `FormLayout`, ler `location.hash` e definir `activeTab` correspondente (fallback: `TabKey.Identificacao`) |
| Hover em aba inativa | `hover:bg-primary-800 hover:text-white` — sem delay |
| Loading da store | `Spinner` centralizado; não renderizar `TabNavigation` nem `ProgressBar` até store reidratada |
| Signout (botão Sair) | Chama `signOut()` → `navigate('/login', { replace: true })` — sem dialog de confirmação |
| Resize para mobile | CSS-only via breakpoint `md:` — sem JavaScript resize listener |
| Animação de transição entre abas | DIFERIDO para Phase 12 |

**Fonte:** `05-CONTEXT.md` D-03, D-07, D-09; seção Claude's Discretion (URL hash).

---

## States Per Component

### ProgressBar

| State | Visual |
|-------|--------|
| 0% (nenhuma aba visitada) | Barra invisível ou largura 0 (`w-0`) sobre fundo `bg-gray-200` |
| Parcial (1–99%) | Largura proporcional `style={{ width: \`${pct}%\` }}`, `bg-primary`, transição `transition-all duration-300` |
| 100% | Largura `w-full`, `bg-primary` |

### TabNavigation Item

| State | Classes |
|-------|---------|
| Não visitado (padrão) | `text-primary-100 hover:bg-primary-800 hover:text-white` |
| Ativo | `bg-primary-800 text-white font-medium` |
| Visitado (em progresso) | `text-primary-100` + ícone `text-accent` |
| Completo | `text-primary-100` + ícone `text-green-500` |

### ProgressBadge (ícone inline SVG)

| completeness | Ícone | Cor |
|--------------|-------|-----|
| `=== 0` | Círculo vazio (outline) | `text-primary-300` |
| `> 0 && < 1` | Meio-preenchido (semi-circle outline) | `text-accent` |
| `=== 1` | Checkmark (sólido) | `text-green-500` |

Tamanho: `h-4 w-4` (16px) — inline no item do stepper.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| n/a — sem shadcn | não aplicável | não aplicável |

Projeto usa biblioteca de componentes própria. Nenhum registry de terceiros envolvido nesta fase.

---

## Pre-Population Sources

| Campo | Fonte | Decisão |
|-------|-------|---------|
| Paleta de cores (primary/accent/g1-g5) | `src/index.css @theme` | Tokens já definidos em Phase 1 |
| Componentes reutilizáveis | `src/components/ui/` | Button, Badge, Spinner, Skeleton existentes |
| Padrão sidebar (cores, navegação) | `AdminSidebar.tsx`, `AdminLayout.tsx` | FormLayout replica padrão AdminLayout |
| Sidebar width | `05-CONTEXT.md` D-08 | `min-w-[220px] max-w-[300px]` |
| Progress bar position/style | `05-CONTEXT.md` D-05 | `h-1` sticky topo, `bg-primary` |
| Ícones de status (3 estados) | `05-CONTEXT.md` D-06, D-11 | Cinza / Laranja / Verde |
| Botão Sair | `05-CONTEXT.md` D-07 | `mt-auto`, ghost, rodapé sidebar |
| 10 tab keys + labels | `05-CONTEXT.md` D-04 + HTML referência | `enum TabKey`, `tabConfig.ts` |
| Mobile layout (pills) | `05-CONTEXT.md` specifics | `flex overflow-x-auto`, breakpoint `md` |
| Font | Phase 1 `src/index.css` | Inter, `--font-sans` |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
