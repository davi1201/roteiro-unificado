---
phase: 6
slug: campos-do-formul-rio-torre-360
status: draft
shadcn_initialized: false
preset: none
created: 2026-05-22
---

# Phase 6 — UI Design Contract

> Contrato visual e de interação para os campos do formulário Torre 360.
> Gerado por gsd-ui-researcher. Fonte de verdade para o executor durante implementação.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none — Tailwind v4 manual com `@theme {}` |
| Preset | not applicable |
| Component library | Componentes internos em `src/components/ui/` |
| Icon library | SVG inline (ProgressBadge já usa; campo markers podem usar o mesmo padrão) |
| Font | Inter via `--font-sans` (definido em `index.css` `@theme {}`) |

Fonte: `roteiro-unificado/src/index.css` e `src/components/ui/` — codebase scan 2026-05-22.

---

## Spacing Scale

Declarado via Tailwind v4 — classes utilitárias mapeiam para a escala de 4px:

| Token | Value | Uso nesta fase |
|-------|-------|----------------|
| xs | 4px (`gap-1`, `p-1`) | Gap entre ícone e label, margin inline de badges |
| sm | 8px (`gap-2`, `p-2`, `mb-2`) | Espaço entre label e campo; gap entre radio options |
| md | 16px (`gap-4`, `p-4`, `mb-4`) | Padding de container de campo; espaço entre campos |
| lg | 24px (`gap-6`, `p-6`, `mb-6`) | Padding da `<main>` desktop (`p-6`); espaço entre grupos de campos |
| xl | 32px (`gap-8`, `mb-8`) | Separação entre seções dentro de uma aba |
| 2xl | 48px — reservado | Não usado em campos — reservado para layout (ProgressBar, sidebar) |
| 3xl | 64px — reservado | Não usado nesta fase |

Exceções:
- Touch target mínimo de botões radio/checkbox: `min-h-[44px]` para acessibilidade mobile
- Sidebar (`md:max-w-[300px] md:min-w-[220px]`) — herdado do FormLayout, não alterar
- Input height: `h-10` (40px) para Input, Select, botões de radio horizontal

Fonte: FormLayout.tsx (`p-4 md:p-6`), Button.tsx (`h-10 px-4`), Input.tsx (`h-10`).

---

## Typography

| Role | Size | Weight | Line Height | Uso |
|------|------|--------|-------------|-----|
| Body | 14px (`text-sm`) | 400 (regular) | 1.5 | Texto de campos, opções de radio/checkbox, placeholder |
| Label | 14px (`text-sm`) | 600 (semibold) | 1.4 | Labels de campo, headings de grupo de opções |
| Heading de seção | 20px (`text-xl`) | 600 (semibold) | 1.2 | `<h1>` da aba ativa no `<main>` (herdado de FormLayout) |
| Caption | 12px (`text-xs`) | 400 (regular) | 1.4 | Mensagens de erro inline, texto de ajuda |

Fonte: FormLayout.tsx (`text-xl font-semibold`), Input.tsx (`text-sm`), Badge.tsx (`text-xs font-semibold`).

Restrição: não introduzir novos tamanhos de fonte. Somente `text-xs`, `text-sm`, `text-xl` estão em uso no projeto.

---

## Color

| Role | Token | Valor | Uso |
|------|-------|-------|-----|
| Dominant (60%) | `bg-gray-50` / `bg-white` | #F9FAFB / #FFFFFF | Background da `<main>`, fundo de containers de campo, surface de input |
| Secondary (30%) | `bg-primary` (`--color-primary`) | #123B66 | Sidebar do FormLayout, aba ativa selecionada na TabNavigation |
| Accent (10%) | `--color-accent` | #F28C28 | Ver lista abaixo |
| Destructive | `--color-g1` | Vermelho semântico | Bordas de campo com erro, texto de mensagem de erro |

**Accent reservado exclusivamente para:**
1. Estado selecionado de RadioGroupField — ring e background: `ring-2 ring-primary bg-primary/10 text-primary font-medium` (nota: accent no texto de opções selecionadas em situações de destaque especial)
2. Ícone de "check" no ProgressBadge quando completeness === 1 (herdado de Phase 5)
3. CTA primário de submit/avanço (futuro — esta fase não tem submit; adiado para Phase 8)

**Cor primária (`bg-primary`, `text-primary`) usada para:**
- Estado selecionado de RadioGroupField (ring + tint)
- Botão "Sair" na sidebar (ghost text-white)
- Focus ring de todos os campos: `focus-visible:ring-primary/50`

**Cor de erro (`text-g1`, `border-g1`) usada para:**
- Borda de Input/Select/Textarea quando `error === true`
- Texto de mensagem de erro inline (`<p className="text-g1 text-xs">`)
- Nunca como cor de fundo de campo

Fonte: `index.css` `@theme {}`, `button.tsx`, `input.tsx`, `select.tsx`, `textarea.tsx`, `CONTEXT.md` §specifics.

---

## Componentes de Campo — API Visual

Esta seção especifica os contratos visuais dos 5 novos componentes de campo que esta fase cria.

### RadioGroupField

```
Estado normal (não selecionado):
  container: border border-gray-200 rounded-md px-3 py-2.5
  texto: text-sm text-gray-700
  hover: hover:bg-gray-50

Estado selecionado:
  container: ring-2 ring-primary bg-primary/10 rounded-md px-3 py-2.5
  texto: text-sm text-primary font-medium

Estado de erro (nenhuma opção selecionada e campo obrigatório):
  mensagem abaixo do grupo: text-xs text-g1
  nenhuma borda vermelha no container das opções individuais

Layout das opções:
  flex flex-col gap-2 (padrão vertical)
  Para grupos curtos (≤ 3 opções): flex flex-row flex-wrap gap-2 permitido
```

### CheckboxGroupField

```
Checkbox individual:
  tamanho: w-4 h-4, accent-color: primary
  label: text-sm text-gray-700 ml-2

Checkbox master "Selecionar todos" (Torre Sienge):
  exibido no topo do grupo
  label: text-sm font-semibold text-gray-800

Container do grupo: flex flex-col gap-2

Estado de erro: texto text-xs text-g1 abaixo do grupo
```

### SelectField

```
Herda estilo de src/components/ui/select.tsx:
  height: h-10, border-gray-300, rounded-md
  error: border-g1 focus-visible:ring-g1/50
  placeholder: disabled option value=""

Label acima do select: text-sm font-semibold text-gray-700 mb-1
```

### TextareaField

```
Herda estilo de src/components/ui/textarea.tsx:
  min-height: min-h-[80px]
  resize: resize-y
  error: border-g1

Label: text-sm font-semibold text-gray-700 mb-1
Texto de ajuda opcional: text-xs text-gray-500 mt-1
```

### ConditionalField

```
Wrapper sem estilos próprios — aplica show/hide via renderização condicional React.
Não usa display:none (campo oculto não deve existir no DOM para unregister funcionar).
Sem animação de transição (deferred para Phase 12).
```

### Layout de campo (wrapper padrão)

```
Cada campo é envolvido por:
  <div className="flex flex-col gap-1">
    <label className="text-sm font-semibold text-gray-700">
      {label}{required && <span className="text-g1 ml-0.5">*</span>}
    </label>
    {/* campo */}
    {/* mensagem de erro */}
  </div>

Espaço entre campos consecutivos: mb-4 (16px) no último filho do wrapper
Espaço entre grupos de campos dentro da seção: mb-6 (24px) com <hr className="border-gray-100">
```

---

## Copywriting Contract

| Elemento | Cópia |
|----------|-------|
| Label de campo obrigatório | Asterisco vermelho `*` imediatamente após o texto do label |
| Erro de campo obrigatório vazio | "Campo obrigatório" |
| Erro de formato inválido (CNPJ, email, telefone) | "Formato inválido" |
| Erro de campo de texto muito curto | "Mínimo {N} caracteres" |
| Placeholder de input texto | "Digite aqui..." (genérico) ou campo-específico conforme HTML de referência |
| Placeholder de select | "Selecione uma opção" |
| Heading da aba Identificação | "Identificação" (herdado do TAB_CONFIG) |
| Heading da aba Torre Decisão | "Torre Decisão" |
| Heading da aba Torre Sienge | "Torre Sienge" |
| Heading da aba Torre Acesso | "Torre Acesso" |
| Heading da aba Torre Classificação | "Torre Classificação" |
| Label do checkbox master (Sienge) | "Selecionar todos os módulos" |
| Estado vazio de campo condicional | Campo não renderizado — sem copy de estado vazio |
| CTA primário desta fase | Não há submit nesta fase — botões de navegação entre abas são do FormLayout (Phase 5) |
| Ação destrutiva desta fase | Nenhuma — sem confirmação necessária |

Fonte: CONTEXT.md §deferred (sem CTA de submit nesta fase), ROADMAP.md §Phase 6 UAT.

---

## Estados de Interação por Campo

| Estado | Comportamento Visual |
|--------|----------------------|
| Default | Borda `border-gray-300`, fundo `bg-white` |
| Hover | `hover:border-primary-400` |
| Focus | `focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none` |
| Preenchido / válido | Sem indicador positivo explícito (sem check mark em campo individual) |
| Erro | `border-g1`, mensagem `text-xs text-g1` abaixo do campo |
| Disabled | `opacity-50 cursor-not-allowed` |
| RadioGroup selecionado | `ring-2 ring-primary bg-primary/10 text-primary font-medium` |
| ConditionalField oculto | Não renderizado no DOM (unregister chamado) |

---

## Layout da Seção dentro da `<main>`

```
<main className="flex-1 p-4 md:p-6">
  <h1 className="text-xl font-semibold text-gray-900">{tab.label}</h1>
  <p className="mt-1 mb-6 text-sm text-gray-500">{subtítulo da aba se aplicável}</p>

  <form onSubmit={...} className="max-w-2xl">
    {/* grupos de campos */}
  </form>
</main>
```

Largura máxima do formulário: `max-w-2xl` (672px) — mantém legibilidade em desktop sem esticar ao infinito. Em tablet (768px) ocupa 100% da largura disponível (sem `max-w`).

Breakpoint de tablet (FORM-05, UX-02): layout de campo permanece em coluna única em `< md`. Em `md+`, alguns grupos de campos horizontais podem usar `grid grid-cols-2 gap-4` (ex: Cidade + Estado na aba Identificação).

---

## Registry Safety

| Registry | Blocos Usados | Safety Gate |
|----------|---------------|-------------|
| shadcn official | Nenhum — design system é manual | não aplicável |
| Terceiros | Nenhum declarado | não aplicável |

---

## Checklist de Decisões Pré-Populadas

| Fonte | Decisões incorporadas |
|-------|-----------------------|
| CONTEXT.md §decisions | 8 decisões de arquitetura (D-01 a D-08) |
| CONTEXT.md §specifics | RadioGroupField ring style, CheckboxGroup master, ConditionalField unregister |
| index.css @theme | Tokens de cor, font-family, border-radius |
| button.tsx / input.tsx / select.tsx / textarea.tsx | Padrões de height, border, focus ring, error state |
| FormLayout.tsx | Padding da main (p-4 md:p-6), heading h1 (text-xl font-semibold) |
| REQUIREMENTS.md §UX-02 | Responsividade tablet declarada |
| REQUIREMENTS.md §FORM-05, FORM-06 | Tipos corretos de campo e campos condicionais |
| ROADMAP.md §Phase 6 | max-w-2xl confirmado pela lógica de campo de formulário |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
