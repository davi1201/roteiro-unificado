---
phase: 4
slug: gestao-organizacoes-painel-admin
status: draft
shadcn_initialized: false
preset: none
created: 2026-05-22
---

# Phase 4 — UI Design Contract
## Gestão de Organizações & Painel Admin

> Contrato visual e de interação para o painel administrativo interno. Gerado por gsd-ui-researcher.
> Fonte de verdade visual para gsd-planner, gsd-executor e gsd-ui-auditor.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (Tailwind v4 manual) |
| Preset | not applicable |
| Component library | Radix UI Primitives (apenas Dialog — novo) |
| Icon library | Heroicons via inline SVG ou `lucide-react` (a decidir no plano) |
| Font | Inter, ui-sans-serif, system-ui, sans-serif (via `--font-sans` em `@theme {}`) |

**Nota:** `components.json` não existe no projeto. shadcn não foi inicializado — correto para este projeto
que usa Tailwind v4 com `@theme {}` manual. Todos os tokens vêm de `src/index.css`.

---

## Spacing Scale

Escala de 8 pontos, múltiplos de 4. Usando classes Tailwind v4 nativas.

| Token | Value | Classes Tailwind | Usage |
|-------|-------|-----------------|-------|
| xs | 4px | `gap-1`, `p-1` | Gaps entre ícone e label na sidebar, separadores inline |
| sm | 8px | `gap-2`, `p-2` | Padding interno de badge, gap entre itens de linha na tabela |
| md | 16px | `gap-4`, `p-4` | Espaçamento padrão entre elementos de formulário, padding de cells |
| lg | 24px | `gap-6`, `p-6` | Padding de cards (CardHeader/CardContent já usa `p-6`), seções do modal |
| xl | 32px | `gap-8`, `p-8` | Gap entre sidebar e conteúdo principal |
| 2xl | 48px | `gap-12`, `py-12` | Margens verticais de seções de página |
| 3xl | 64px | `gap-16` | Não usado nesta fase |

**Exceções:**
- Sidebar width: 240px fixo (`w-60`) — não segue escala de 8pt mas é valor padrão de layout
- Touch targets mínimos: 40px height (`h-10`) para todos os itens de nav e botões — padrão já no Button `size="md"`
- Header height: 56px (`h-14`) — valor de layout, não segue escala

---

## Typography

Sistema tipográfico extraído de `src/index.css` (`--font-sans: 'Inter'`) e dos padrões já estabelecidos
em `Login.tsx` e nos componentes UI.

**Pesos declarados (máximo 2):** 400 (regular) e 600 (semibold).

| Role | Size | Weight | Line Height | Tailwind classes | Usage nesta fase |
|------|------|--------|-------------|-----------------|-----------------|
| Body | 14px | 400 (regular) | 1.5 | `text-sm font-normal` | Células da tabela, labels de formulário, texto do tooltip |
| Label | 14px | 600 (semibold) | 1.4 | `text-sm font-semibold` | Cabeçalhos de coluna da tabela, labels de campo obrigatório |
| Heading | 20px | 600 (semibold) | 1.2 | `text-xl font-semibold` | Título da página (ex: "Organizações"), título do modal, nome da org no detalhe |
| Display | 24px | 600 (semibold) | 1.2 | `text-2xl font-semibold` | Não usado nesta fase (reservado para Dashboard de Prontidão) |

**Nota:** Inter carrega via fallback `system-ui` até o piloto ter CDN configurado. Não adicionar `@font-face`
nesta fase — seguir o padrão já estabelecido.

---

## Color

Paleta consolidada de `src/index.css`. Nenhum hex novo nesta fase.

| Role | Token CSS / Tailwind | Hex aproximado | Usage |
|------|---------------------|----------------|-------|
| Dominant (60%) | `bg-white` / `bg-gray-50` | #FFFFFF / #F9FAFB | Background da área de conteúdo, fundo da página admin, células da tabela |
| Secondary (30%) | `bg-primary` / `bg-primary-800` | #123B66 | Sidebar background, header background |
| Accent (10%) | `bg-accent` / `text-accent` | #F28C28 | Botão primário de ação "Nova Organização" APENAS |
| Destructive | `bg-g1` / `text-g1` | vermelho (`color-g1`) | Botão "Arquivar" (variante `danger` já existe em `Button`) |

**Accent reservado para:** botão "Nova Organização" (CTA primário da listagem) exclusivamente.
Todos os outros botões de ação usam `variant="primary"` (azul `#123B66`) ou `variant="secondary"`.

**Superfícies secundárias:**
- Sidebar: `bg-primary text-white` — item ativo: `bg-primary-800`; item hover: `bg-primary-800/70`
- Header: `bg-primary text-white` — mesma cor da sidebar para continuidade visual
- Tabela: header `bg-gray-50`, rows `bg-white` com `hover:bg-gray-50`
- Modal overlay: `bg-black/50` (semitransparente)
- Modal panel: `bg-white`

**Status de organização:**
- Ativa: Badge verde customizado — `bg-green-100 text-green-800` (não usar escala G1-G5 aqui)
- Arquivada: Badge cinza — `bg-gray-100 text-gray-600`

**Role de membro:**
- `admin`: Badge `bg-primary-100 text-primary-800`
- `company`: Badge `bg-gray-100 text-gray-600`

---

## Component Inventory

### Componentes reutilizados (existem em `src/components/ui/`)

| Componente | Arquivo | Uso nesta fase |
|-----------|---------|----------------|
| `Button` | `button.tsx` | "Nova Organização" (`variant="primary"`, classe accent override), "Salvar", "Arquivar" (`variant="danger"`), "Descartar" (`variant="secondary"`), "Encerrar sessão" (`variant="ghost"`) |
| `Input` | `input.tsx` | Campos: Nome da org, CNPJ, Email do membro, Senha temporária |
| `Card` / `CardHeader` / `CardContent` | `card.tsx` | Wrapper da área de conteúdo principal (tabela + formulário de detalhe) |
| `Spinner` | `spinner.tsx` | Loading inline no botão de submit do modal, loading da tabela |
| `Skeleton` | `skeleton.tsx` | Placeholder de linha da tabela durante fetch de orgs/membros |

**Nota sobre Badge:** O `Badge` existente é exclusivo para G1-G5. Para status de org e role de membro,
criar spans inline com classes Tailwind — não estender o Badge atual com novas grades.

### Componente novo: `Dialog`

**Arquivo:** `src/components/ui/dialog.tsx`

**Implementação:** Radix UI Primitive (`@radix-ui/react-dialog`) — sem instalação extra se já disponível,
ou implementação simples com `role="dialog"` + `aria-modal="true"` + foco trap manual se Radix não estiver
instalado.

**Verificar antes de implementar:**
```bash
grep "@radix-ui/react-dialog" roteiro-unificado/package.json
```

**API contratada:**

```tsx
<Dialog open={boolean} onOpenChange={(open) => void}>
  <DialogTrigger asChild>
    <Button>Nova Organização</Button>
  </DialogTrigger>
  <DialogOverlay />       {/* bg-black/50, fixed inset-0, z-40 */}
  <DialogPanel>           {/* bg-white, rounded-lg, shadow-xl, z-50, max-w-md, w-full, p-6 */}
    <DialogTitle />       {/* text-xl font-semibold text-gray-900 */}
    <DialogDescription /> {/* text-sm text-gray-500, mt-1 */}
    {/* conteúdo */}
    <DialogFooter />      {/* flex justify-end gap-3, mt-6 */}
  </DialogPanel>
</Dialog>
```

**Comportamento:**
- Fecha ao clicar no overlay
- Fecha ao pressionar Escape
- Foco vai para primeiro campo do formulário ao abrir
- Foco retorna ao trigger ao fechar
- Scroll do body bloqueado enquanto aberto

### Componente novo: `AdminLayout`

**Arquivo:** `src/components/layouts/AdminLayout.tsx`

**Estrutura:**

```
<div class="flex min-h-screen">
  <Sidebar />          {/* w-60, bg-primary, flex-none, fixed left-0 top-0 bottom-0 */}
  <div class="flex flex-col flex-1 ml-60">
    <Header />         {/* h-14, bg-primary, border-b border-primary-800 */}
    <main class="flex-1 bg-gray-50 p-8">
      <Outlet />
    </main>
  </div>
</div>
```

### Componente novo: `AdminSidebar`

**Arquivo:** `src/components/layouts/AdminSidebar.tsx`

**Itens de navegação (D-06 — completa desde Phase 4):**

| Item | Rota | Estado nesta fase | Ícone sugerido |
|------|------|-------------------|----------------|
| Organizações | `/admin/dashboard` | Ativo/clicável | `BuildingOfficeIcon` |
| Dashboard | `#` | Desabilitado | `ChartBarIcon` |
| Exportações | `#` | Desabilitado | `ArrowDownTrayIcon` |

**Anatomia de item de nav:**

```
<NavLink>                          {/* ou <a> para desabilitados */}
  <Icon class="h-5 w-5" />
  <span class="text-sm font-medium">Label</span>
  [<span class="text-xs text-primary-300">Em breve</span>]  {/* apenas desabilitados */}
</NavLink>
```

**Estados visuais de item de nav:**
- Default: `text-primary-100 hover:bg-primary-800 hover:text-white`
- Ativo (rota atual): `bg-primary-800 text-white font-semibold`
- Desabilitado: `text-primary-300 cursor-not-allowed opacity-60` — `aria-disabled="true"`, sem `onClick`

**Tooltip "Em breve":** texto inline no item (não tooltip flutuante) — mais simples e acessível para o piloto.

---

## Layout Contract

### AdminLayout — dimensões fixas

```
┌──────────────────────────────────────────────────────────┐
│ Header (h-14, bg-primary)                               │
│  [logo/title]               [admin name]  [Sair btn]   │
├──────┬───────────────────────────────────────────────────┤
│      │ Page content (bg-gray-50, p-8)                   │
│  S   │                                                   │
│  i   │  <Outlet />                                       │
│  d   │                                                   │
│  e   │                                                   │
│  b   │                                                   │
│  a   │                                                   │
│  r   │                                                   │
│      │                                                   │
│ w-60 │ flex-1                                            │
└──────┴───────────────────────────────────────────────────┘
```

- Sidebar: `w-60` (240px), `fixed`, `top-0 left-0 bottom-0`, `bg-primary`, `z-30`
- Header: `h-14`, `bg-primary`, `border-b border-primary-800`, `fixed top-0 left-60 right-0`, `z-20`
- Main: `ml-60 mt-14`, `flex-1`, `bg-gray-50`, `min-h-screen`, `p-8`

**Responsividade (D-07 — sidebar sempre visível):**
- Desktop (≥1024px): layout padrão conforme acima
- Tablet (768px–1023px): sidebar permanece visível; conteúdo comprime (`p-4` em vez de `p-8`)
- Mobile (<768px): fora do escopo do piloto admin — painel é uso exclusivo interno desktop/tablet

### Listagem de Organizações — `/admin/dashboard`

**Ponto focal:** botão "Nova Organização" (accent) no canto superior direito — âncora visual principal da listagem.

```
Page header row:
  [h1: "Organizações"]                    [Button: "Nova Organização"]  ← focal point (accent)

Table card (Card wrapper, rounded-lg, shadow-sm):
  Table header row (bg-gray-50, text-sm font-semibold text-gray-600):
    | Nome | CNPJ | Membros | Criado em | Status | Ações |

  Table body rows (hover:bg-gray-50, cursor-pointer):
    | string | XX.XXX.XXX/XXXX-XX | number | DD/MM/YYYY | badge | [Arquivar btn] |

  Empty state (se nenhuma org):
    centered, py-12, ícone + heading + body + CTA

  Loading state:
    3× Skeleton rows (h-12 each, w-full)

  Paginação (client-side, se > 10 orgs):
    flex row, justify-end, gap-2: [Anterior] [página atual] [Próxima]
```

**Larguras de coluna sugeridas:**

| Coluna | Largura |
|--------|---------|
| Nome | auto (flex-1) |
| CNPJ | 160px |
| Membros | 80px (center) |
| Criado em | 120px |
| Status | 100px |
| Ações | 80px (center) |

### Detalhe da Organização — `/admin/orgs/:orgId`

```
Breadcrumb: "Organizações" → "Nome da Org"    (text-sm, text-gray-500)

Page header:
  [h1: nome da org]       [Badge status]       [Button: "Arquivar" danger]

Members card:
  CardHeader: "Membros" (h2 text-xl font-semibold) + count badge
  Table: Email | Role | Adicionado em | Ações
  Footer: [Button secondary "Convidar Membro"]

Add member form (inline below table or in separate Dialog):
  Input: email
  Input: senha temporária (type="password")
  Button primary: "Adicionar Membro"
```

---

## Interaction Contract

### Modal de criação de organização

**Trigger:** Botão "Nova Organização" na listagem.

**Fluxo completo:**

1. Click em "Nova Organização" → `Dialog` abre com animação `fade-in + scale-up` (150ms ease-out)
2. Foco vai para input "Nome" automaticamente
3. Usuário preenche Nome + CNPJ
4. Validação RHF onBlur: erro inline abaixo do campo, borda vermelha (`border-g1`)
5. Click "Criar Organização": `isLoading=true` no botão → Spinner inline → botão desabilitado
6. **Sucesso:** Dialog fecha (animação `fade-out` 150ms) → toast success → TanStack Query invalida `['orgs']` → nova org aparece na tabela
7. **Erro:** Dialog permanece aberto → toast error com mensagem específica → botão volta ao estado normal

**Estados do botão "Criar Organização":**
- Default: `variant="primary"` enabled
- Loading: `isLoading={true}` — Spinner + texto "Criando..." — `disabled`
- Erro de validação local: enabled (usuário precisa corrigir)

### Dialog de confirmação de arquivamento

**Trigger:** Botão "Arquivar" em linha da tabela ou no header do detalhe da org.

**Fluxo:**

1. Click "Arquivar" → Dialog de confirmação abre
2. Título: "Arquivar organização"
3. Corpo: texto de confirmação (ver Copywriting Contract)
4. Footer: [Manter organização (secondary)] [Arquivar (danger, isLoading)]
5. **Confirmar:** botão "Arquivar" ativa isLoading → UPDATE `active = false` → toast success → query invalida → org some da listagem
6. **Manter organização / Escape / click overlay:** Dialog fecha, nenhuma ação realizada

### Clique em linha da tabela

- Área clicável: toda a linha (`cursor-pointer`, `hover:bg-gray-50`)
- Exceção: célula "Ações" — click no botão "Arquivar" não propaga para a linha
- Navegação: `navigate('/admin/orgs/:orgId')`

### Adição de membro na página de detalhe

**Fluxo:**

1. Admin preenche email + senha temporária
2. Click "Adicionar Membro": `isLoading=true`
3. Chamada para Edge Function `create-user` com `{ email, password, org_id }`
4. **Sucesso:** form limpa → toast success → query invalida `['org-members', orgId]` → novo membro aparece na tabela
5. **Erro (email já existe):** toast error "Email já cadastrado no sistema"
6. **Erro (Edge Function falhou):** toast error genérico + orientação a tentar novamente

### Toast feedback (via `useToast`)

| Ação | Tipo | Duração | Copy |
|------|------|---------|------|
| Org criada | `success` | 4s | "Organização criada com sucesso" |
| Membro adicionado | `success` | 4s | "Membro adicionado com sucesso" |
| Org arquivada | `success` | 4s | "Organização arquivada" |
| Erro de criação de org | `error` | 6s | "Erro ao criar organização. Tente novamente." |
| Erro ao adicionar membro | `error` | 6s | "Não foi possível adicionar o membro. Verifique o email." |
| Erro ao arquivar | `error` | 6s | "Erro ao arquivar organização. Tente novamente." |
| Email já existe | `error` | 6s | "Este email já está cadastrado no sistema." |

---

## Copywriting Contract

### Botões e CTAs

| Elemento | Copy | Variante Button |
|---------|------|-----------------|
| CTA primário da listagem | "Nova Organização" | `primary` com classe `bg-accent` |
| Submit do modal de criação | Default: "Criar Organização" / Loading: "Criando..." | `primary` |
| Dispensar modal de criação | "Descartar" | `secondary` |
| Botão de arquivamento | "Arquivar" | `danger` |
| Confirmar arquivamento (dialog) | "Sim, arquivar" | `danger` |
| Dispensar dialog de arquivamento | "Manter organização" | `secondary` |
| Adicionar membro | "Adicionar Membro" | `primary` |
| Logout no header | "Encerrar sessão" | `ghost` |

### Estados vazios

**Tabela de organizações — sem nenhuma org cadastrada:**
- Heading: "Nenhuma organização cadastrada"
- Body: "Crie a primeira organização para começar a gerenciar o piloto."
- CTA: "Nova Organização" (mesmo botão primário da página)

**Tabela de membros — org sem membros:**
- Heading: "Nenhum membro nesta organização"
- Body: "Adicione o primeiro usuário para que a construtora possa fazer login."
- CTA inline (não duplicar o botão da página)

### Dialog de confirmação de arquivamento

- **Título:** "Arquivar organização"
- **Corpo:** "Tem certeza que deseja arquivar **{nome da org}**? A organização e seus dados serão mantidos, mas ela não aparecerá mais na listagem ativa."
- **Botão confirmar:** "Sim, arquivar"
- **Botão dispensar:** "Manter organização"

### Labels de formulário (modal de criação de org)

| Campo | Label | Placeholder | Erro de formato | Erro obrigatório |
|-------|-------|-------------|-----------------|-----------------|
| Nome | "Nome da organização" | "Ex: Construtora Silva Ltda." | — | "O nome é obrigatório" |
| CNPJ | "CNPJ" | "00000000000000" | "CNPJ deve ter 14 dígitos numéricos" | "O CNPJ é obrigatório" |

**Nota CNPJ:** aceitar 14 dígitos sem máscara (regex `/^\d{14}$/`). Não aplicar máscara de input
nesta fase. Placeholder explica o formato esperado.

### Labels de formulário (adição de membro)

| Campo | Label | Placeholder | Erro |
|-------|-------|-------------|------|
| Email | "Email do usuário" | "usuario@construtora.com" | "Insira um email válido" |
| Senha temporária | "Senha temporária" | "Mínimo 8 caracteres" | "Senha deve ter no mínimo 8 caracteres" |

### Sidebar — item de nav

- Logo/marca no topo da sidebar: "Roteiro Unificado" (text-white text-base font-semibold)
- Seção label opcional: "Navegação" (text-primary-300 text-xs uppercase tracking-wider)
- Item desabilitado badge: "Em breve" (texto inline, text-primary-300 text-xs)

### Header admin

- Texto de boas-vindas: "Olá, {nome do admin}" ou simplesmente o email do admin (de `useAuth().user.email`)
- Botão logout: "Encerrar sessão"

### Estados de loading

- Tabela carregando: Skeleton 3 linhas, sem texto (visual apenas)
- Modal enviando: "Criando..." no botão
- Membro sendo adicionado: "Adicionando..." no botão

### Breadcrumb na página de detalhe

- Nível 1: "Organizações" (link para `/admin/dashboard`, `text-gray-500 hover:text-gray-900`)
- Separador: "/" (`text-gray-400 mx-2`)
- Nível 2: `{nome da org}` (`text-gray-900 font-medium`)

---

## Responsive Contract

| Breakpoint | Behavior |
|------------|----------|
| ≥1280px (desktop large) | Layout padrão: sidebar 240px, conteúdo `p-8`, tabela com todas as colunas |
| 1024px–1279px (desktop) | Sem mudança de layout; tabela pode truncar coluna "Nome" com `truncate` |
| 768px–1023px (tablet) | Sidebar permanece (D-07); conteúdo `p-4`; tabela oculta coluna "Criado em" (`hidden md:table-cell`) |
| <768px (mobile) | Fora do escopo — painel admin é uso interno; sem requerimento mobile para o piloto |

**Truncamento de texto em tabela:**
- Coluna "Nome": `max-w-[200px] truncate` em 1024px
- CNPJ: nunca truncar (sempre 14 chars)
- Email na tabela de membros: `truncate max-w-[200px]`

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| npm / @radix-ui | `@radix-ui/react-dialog` (se não instalado) | Pacote oficial Radix UI — sem vetting adicional necessário |
| shadcn official | Nenhum | not applicable — shadcn não inicializado |
| Third-party | Nenhum | not applicable |

**Nota:** verificar se `@radix-ui/react-dialog` já está no `package.json` antes de instalar.
Se não estiver, instalar via `npm install @radix-ui/react-dialog`. Alternativa: implementação
DOM nativa com `role="dialog"` + focus trap manual (mais simples para o piloto).

---

## Accessibility Contract

- Todos os botões de ação (ícone-only, se houver) devem ter `aria-label`
- Dialog: `aria-labelledby` apontando para `DialogTitle`, `aria-modal="true"`, `role="dialog"`
- Links desabilitados na sidebar: `aria-disabled="true"`, não usar `disabled` em `<a>` (não é atributo válido)
- Tabela: `<thead>` com `scope="col"` em cada `<th>`
- Foco visível em todos os elementos interativos: `focus-visible:ring-2 focus-visible:ring-primary/50` (já padrão no Button e Input)
- Contraste: texto branco sobre `bg-primary` (#123B66) — ratio ≥ 4.5:1 ✓

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending

---

## Pre-Population Sources

| Decision / Valor | Fonte |
|-----------------|-------|
| Primary `#123B66`, Accent `#F28C28` | CONTEXT.md + `src/index.css` @theme tokens |
| `--font-sans: 'Inter'` | `src/index.css` @theme |
| Sidebar 240px, sempre visível | CONTEXT.md D-06, D-07 |
| Dialog (não rota separada) | CONTEXT.md D-04 |
| Validação CNPJ `/^\d{14}$/` | CONTEXT.md Claude's Discretion |
| `Button` variantes (primary/secondary/ghost/danger) | `src/components/ui/button.tsx` |
| `Input` com `error` + `errorMessage` props | `src/components/ui/input.tsx` |
| TanStack Query invalidation após mutação | CONTEXT.md D-05 |
| `useToast` para feedback | CONTEXT.md Reusable Assets |
| Rotas `/admin/dashboard` e `/admin/orgs/:orgId` já existem | `src/router.tsx` |
| shadcn não inicializado | Scan do codebase — `components.json` ausente |
| Typography: 2 pesos (400 + 600), sem 700 | Correção BLOCK 2 — checker revision 2026-05-22 |
| "Descartar" no modal de criação | Correção BLOCK 1 — checker revision 2026-05-22 |
| "Manter organização" no dialog de arquivamento | Correção BLOCK 1 — checker revision 2026-05-22 |
| "Encerrar sessão" no header | Melhoria FLAG 1 — checker revision 2026-05-22 |
| Ponto focal declarado na listagem | Melhoria FLAG 2 — checker revision 2026-05-22 |
