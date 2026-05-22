---
phase: 3
slug: authentication-roteamento-por-role
status: draft
shadcn_initialized: false
preset: none
created: 2026-05-22
---

# Phase 3 — UI Design Contract

> Contrato visual e de interação para a fase de autenticação e roteamento por role.
> Gerado por gsd-ui-researcher. Verificado por gsd-ui-checker.

---

## Design System

| Propriedade        | Valor                                                                 |
|--------------------|-----------------------------------------------------------------------|
| Tool               | none — Tailwind v4 com `@theme {}` customizado em `src/index.css`    |
| Preset             | not applicable                                                        |
| Component library  | Componentes próprios em `src/components/ui/` (sem Radix/shadcn)      |
| Icon library       | none — esta fase não usa ícones decorativos                          |
| Font               | Inter (via `--font-sans` em `@theme {}`)                             |

Fonte: `src/index.css` — tokens já definidos na Phase 1. Nenhuma alteração necessária.

---

## Spacing Scale

Escala baseada em múltiplos de 4, via utilitários Tailwind v4 (`p-4` = 16px, etc.):

| Token | Valor  | Uso nesta fase                                       |
|-------|--------|------------------------------------------------------|
| xs    | 4px    | Gap entre ícone de spinner e texto do botão          |
| sm    | 8px    | Gap entre label e input; gap entre inputs no card    |
| md    | 16px   | Padding interno dos inputs; espaçamento de seções    |
| lg    | 24px   | Padding interno do card (`p-6` = 24px)               |
| xl    | 32px   | Margem superior do logotipo dentro do card           |
| 2xl   | 48px   | Espaçamento não utilizado nesta fase                 |
| 3xl   | 64px   | Espaçamento não utilizado nesta fase                 |

Exceções: nenhuma.

Fonte: padrão 8-point scale; card usa `p-6` (24px) conforme implementação existente de `CardHeader` e `CardContent`.

---

## Typography

| Papel        | Tamanho | Peso              | Line Height | Elemento                                  |
|--------------|---------|-------------------|-------------|-------------------------------------------|
| Display      | 24px    | 700 (bold)        | 1.2         | Nome do app "Roteiro Unificado" no card   |
| Heading      | 14px    | 400 (regular)     | 1.4         | Subtítulo "Piloto Sinduscon" no card      |
| Label        | 14px    | 500 (medium)      | 1.4         | Labels de campo (email, senha)            |
| Body         | 14px    | 400 (regular)     | 1.5         | Texto geral, mensagens de erro inline     |
| Small        | 12px    | 400 (regular)     | 1.4         | Mensagem de erro inline abaixo do input   |

Pesos usados nesta fase: **400** (regular) e **700** (bold) — máximo 2 pesos conforme padrão.
Font: Inter via `--font-sans` do `@theme {}` em `index.css`.

Fonte: padrões definidos na Phase 1; tamanho de erro (`text-xs` = 12px) já implementado em `Input.tsx` linha 24.

---

## Color

| Papel           | Token Tailwind      | Hex equivalente | Uso                                                             |
|-----------------|---------------------|-----------------|-----------------------------------------------------------------|
| Dominant (60%)  | `bg-primary`        | `#123B66`       | Fundo full-screen de todas as páginas de auth (`min-h-screen`) |
| Secondary (30%) | `bg-white`          | `#FFFFFF`       | Card de login, card forgot-password, card reset-password        |
| Accent (10%)    | `bg-accent`         | `#F28C28`       | Botão primário "Entrar" e botões de submit de todos os forms    |
| Destructive     | `bg-g1` / `text-g1` | vermelho via `--color-g1` | Mensagens de erro inline abaixo dos inputs (borda e texto) |

**Accent reservado exclusivamente para:** botão "Entrar" na página `/login`, botão "Enviar link" na página `/forgot-password`, botão "Redefinir senha" na página `/reset-password`.

Nota: o `Button` variant `primary` atualmente usa `bg-primary` (azul). Para esta fase o botão de submit deve usar `bg-accent text-white hover:bg-accent-600` ou um novo variant `accent` no Button — ver seção de componentes abaixo. Decidido: usar `className` override `bg-accent hover:bg-accent-600 text-white` no botão de submit, sem alterar os variants existentes.

Spinner de auth flicker: `Spinner` com `className="border-white"` sobre `bg-primary` full-screen.
Spinner inline no botão de loading: `Spinner size="sm"` com `className="border-white mr-2"`.

Fonte: D-01, D-07, D-08 do `03-CONTEXT.md`; tokens em `src/index.css`.

---

## Copywriting Contract

### Página `/login`

| Elemento                    | Texto                                                  | Fonte   |
|-----------------------------|--------------------------------------------------------|---------|
| Título do card              | Roteiro Unificado                                      | D-02    |
| Subtítulo do card           | Piloto Sinduscon                                       | D-02    |
| Label campo email           | Email                                                  | padrão  |
| Placeholder campo email     | seu@email.com                                          | padrão  |
| Label campo senha           | Senha                                                  | padrão  |
| Placeholder campo senha     | ••••••••                                               | padrão  |
| Link recuperação            | Esqueci minha senha                                    | D-03    |
| Botão submit (idle)         | Entrar                                                 | D-02    |
| Botão submit (loading)      | Entrando...                                            | padrão  |
| Erro auth (toast)           | Email ou senha inválidos                               | D-04    |
| Erro campo email vazio      | O email é obrigatório                                  | Zod/RHF |
| Erro campo email inválido   | Insira um email válido                                 | Zod/RHF |
| Erro campo senha vazio      | A senha é obrigatória                                  | Zod/RHF |

### Página `/forgot-password`

| Elemento                    | Texto                                                          | Fonte       |
|-----------------------------|----------------------------------------------------------------|-------------|
| Título do card              | Recuperar senha                                                | padrão      |
| Subtítulo / instrução       | Insira seu email e enviaremos um link para redefinir sua senha | padrão      |
| Label campo email           | Email                                                          | padrão      |
| Botão submit (idle)         | Enviar link                                                    | padrão      |
| Botão submit (loading)      | Enviando...                                                    | padrão      |
| Sucesso (toast)             | Link enviado. Verifique sua caixa de entrada                   | padrão      |
| Erro (toast)                | Não foi possível enviar o link. Tente novamente                | padrão      |
| Erro campo email vazio      | O email é obrigatório                                          | Zod/RHF     |
| Link voltar                 | Voltar para o login                                            | padrão      |

### Página `/reset-password`

| Elemento                    | Texto                                                          | Fonte       |
|-----------------------------|----------------------------------------------------------------|-------------|
| Título do card              | Redefinir senha                                                | padrão      |
| Label nova senha            | Nova senha                                                     | padrão      |
| Label confirmar senha       | Confirmar nova senha                                           | padrão      |
| Botão submit (idle)         | Redefinir senha                                                | padrão      |
| Botão submit (loading)      | Redefinindo...                                                 | padrão      |
| Sucesso (toast + redirect)  | Senha redefinida com sucesso                                   | CONTEXT.md  |
| Erro token expirado         | Link expirado. Solicite um novo link de recuperação            | CONTEXT.md  |
| Link reenviar               | Solicitar novo link                                            | CONTEXT.md  |
| Erro senhas divergentes     | As senhas não coincidem                                        | Zod/RHF     |
| Erro senha muito curta      | A senha deve ter pelo menos 8 caracteres                       | Zod/RHF     |

### Estado de carregamento inicial (auth flicker)

| Elemento             | Texto / Visual                        | Fonte  |
|----------------------|---------------------------------------|--------|
| aria-label do spinner | Carregando                           | D-08   |
| Fundo                | `bg-primary` full-screen (sem texto) | D-08   |

Fonte: D-08, D-09, D-10, e decisões de discretion do `03-CONTEXT.md`.

---

## Component Inventory

Componentes existentes a reutilizar (sem modificação):

| Componente  | Import                          | Uso nesta fase                                     |
|-------------|---------------------------------|----------------------------------------------------|
| `Button`    | `@/components/ui`               | Submit de todos os forms; `isLoading` prop para D-07 |
| `Input`     | `@/components/ui`               | Campos email e senha; `error` + `errorMessage` props para D-06 |
| `Card`, `CardHeader`, `CardContent` | `@/components/ui` | Container do formulário de login (D-01) |
| `Spinner`   | `@/components/ui`               | Auth flicker full-screen (D-08); inline no botão via `isLoading` do Button |

Comportamento do botão de loading: usar `Button` com `isLoading={isSubmitting}` — o componente já renderiza `<span className="mr-2 h-4 w-4 animate-spin ...">` internamente. A cor do spinner herdará `border-current` (branco sobre fundo escuro).

Nota sobre variante de botão: o `Button` variant `primary` usa `bg-primary` (azul). O botão "Entrar" deve ser laranja (accent) conforme decisão visual. Usar `className="bg-accent hover:bg-accent-600 text-white"` como override, sem criar novo variant nesta fase.

---

## Layout Contracts

### Página `/login` — Layout

```
┌─────────────────────────────────────────────┐
│  bg-primary  (100vh, flex center center)     │
│                                             │
│    ┌─────────────────────────────────┐      │
│    │  Card — bg-white, rounded-lg,   │      │
│    │  shadow-md, w-full max-w-[400px]│      │
│    │  p-6 (CardHeader + CardContent) │      │
│    │                                 │      │
│    │  [Logo/Título]                  │      │
│    │  Roteiro Unificado  (text-2xl)  │      │
│    │  Piloto Sinduscon   (text-sm)   │      │
│    │                                 │      │
│    │  [Label] Email                  │      │
│    │  [Input email]                  │      │
│    │                                 │      │
│    │  [Label] Senha                  │      │
│    │  [Input senha type=password]    │      │
│    │  [Link: Esqueci minha senha →]  │      │
│    │                                 │      │
│    │  [Button: Entrar — full width]  │      │
│    └─────────────────────────────────┘      │
│                                             │
└─────────────────────────────────────────────┘
```

- Container: `min-h-screen bg-primary flex items-center justify-center px-4`
- Card: `w-full max-w-[400px] bg-white rounded-lg shadow-md`
- CardHeader: `flex flex-col items-center gap-1 text-center p-6`
- CardContent: `p-6 pt-0 flex flex-col gap-4`
- Link "Esqueci minha senha": `text-sm text-primary hover:underline self-end` (alinhado à direita, D-03)
- Botão: `w-full` (largura total do card)

### Auth Flicker Loading State — Layout

```
┌─────────────────────────────────────────────┐
│  bg-primary  (100vh, flex center center)     │
│                                             │
│              [Spinner lg branco]            │
│                                             │
└─────────────────────────────────────────────┘
```

- Container: `min-h-screen bg-primary flex items-center justify-center`
- Spinner: `<Spinner size="lg" className="border-white border-t-transparent" />`

### Páginas `/forgot-password` e `/reset-password` — Layout

Mesma estrutura da página de login: fundo azul, card centralizado, max-w-[400px].
Diferença: sem link "Esqueci minha senha"; adicionar link "Voltar para o login" no rodapé do card.

---

## Interaction States

### Botão de submit

| Estado    | Visual                                                    |
|-----------|-----------------------------------------------------------|
| Idle      | `bg-accent text-white` — habilitado                       |
| Loading   | `disabled opacity-50` + spinner animado inline (herdado do Button `isLoading`) |
| Hover     | `hover:bg-accent-600`                                     |
| Focus     | `focus-visible:ring-2 focus-visible:ring-primary/50`      |

### Input de campo

| Estado    | Visual                                                    |
|-----------|-----------------------------------------------------------|
| Idle      | `border-gray-300 bg-white`                                |
| Focus     | `focus-visible:ring-2 focus-visible:ring-primary/50`      |
| Hover     | `hover:border-primary-400`                                |
| Error     | `border-g1 focus-visible:ring-g1/50` + `<p className="text-g1 text-xs">` abaixo |
| Disabled  | `disabled:opacity-50 disabled:cursor-not-allowed`         |

Fonte: implementação existente em `src/components/ui/input.tsx`.

### Toast de erro de autenticação

- Posição: canto inferior direito (padrão Sonner)
- Variante: `toast.error()` via `useToast` hook
- Mensagem: sempre "Email ou senha inválidos" (genérica, D-04)
- Duração: padrão Sonner (4s)

### Redirect silencioso (sessão expirada / logout)

- Nenhum toast ou feedback visual
- React Router redireciona diretamente para `/login`
- Fonte: D-09, D-10

---

## Accessibility Baseline

| Elemento                      | Contrato                                                        |
|-------------------------------|-----------------------------------------------------------------|
| Inputs de formulário          | `id` + `htmlFor` label associado; `type="email"` e `type="password"` corretos |
| Spinner full-screen           | `role="status" aria-label="Carregando"` (já implementado em `spinner.tsx`) |
| Link "Esqueci minha senha"    | Texto descritivo suficiente (`aria-label` não necessário)       |
| Botão em loading              | `disabled` semanticamente correto (já implementado via `isLoading` prop) |
| Contraste fundo/texto         | Branco sobre `bg-primary` (#123B66): ratio ≥ 4.5:1 — aprovado WCAG AA |
| Contraste botão accent        | Branco sobre `#F28C28`: verificar — laranja médio pode estar abaixo de 4.5:1 para texto branco; usar `text-white font-semibold` para compensar |

Nota de contraste: `#F28C28` (laranja) com texto branco tem contraste aproximado de 3.0:1 — abaixo do WCAG AA (4.5:1). Para texto de botão, usar `font-semibold` (600) que melhora legibilidade. Auditoria formal de contraste será realizada na Phase 12.

---

## Registry Safety

| Registry          | Blocos usados     | Safety Gate           |
|-------------------|-------------------|-----------------------|
| shadcn oficial    | nenhum            | not required          |
| third-party       | nenhum            | not required          |

Esta fase não utiliza shadcn nem registros de terceiros. Todos os componentes são próprios da Phase 1.

---

## Decisões Pre-Populadas de CONTEXT.md

| Decisão | ID    | Valor bloqueado                                                         |
|---------|-------|-------------------------------------------------------------------------|
| Layout login | D-01 | Card centralizado, fundo azul sólido `#123B66`, card branco      |
| Conteúdo card | D-02 | "Roteiro Unificado" + "Piloto Sinduscon" + form                  |
| Link esqueci | D-03 | Abaixo do campo senha, alinhado à direita, leva para `/forgot-password` |
| Erro genérico | D-04 | "Email ou senha inválidos" — nunca revela se email existe        |
| Canal de erro | D-05 | Toast via `toast.error()` do `useToast`                          |
| Validação inline | D-06 | Zod/RHF — erros abaixo do campo via `errorMessage` prop do Input |
| Botão loading | D-07 | `disabled` + Spinner inline via `isLoading` prop                 |
| Auth flicker | D-08 | Spinner full-screen sobre `bg-primary`, Spinner branco           |
| Sessão expirada | D-09 | Redirect silencioso para `/login`                               |
| Logout | D-10 | Redirect direto para `/login` sem toast                              |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
