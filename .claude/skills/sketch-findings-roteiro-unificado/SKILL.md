---
name: sketch-findings-roteiro-unificado
description: Validated design decisions, CSS patterns, and visual direction from sketch experiments. Auto-loaded during UI implementation on roteiro-unificado. Covers sidebar colapsável, card grid para formulários, tokens de cor/espaçamento.
---

<context>
## Project: roteiro-unificado

Layout admin limpo e funcional para uso interno do time SuaEquipe.IA. Sidebar sempre visível é prioridade. Formulário com alta densidade de informação deve ser navegável sem scroll excessivo. Vibe: profissional/operacional — pensa em ferramenta de trabalho, não landing page.

**Reference points:** Tailwind stack (bg-primary = azul escuro #1e3a5f, accent = âmbar #f59e0b), sidebar padrão de admin dashboards SaaS (Vercel, Linear, Notion).

Sketch sessions wrapped: 2026-05-24
</context>

<design_direction>
## Overall Direction

**Layout:** Sidebar colapsável à esquerda (240px ↔ 60px), conteúdo principal à direita com topbar sticky. Breadcrumb substitui título grande de página. Estrutura fixa que não oscila com scroll.

**Formulários:** Grupos semânticos em cards com header colorido (ícone SVG + título + subtítulo). Cards em grid — menores ficam lado a lado, cards com textarea ficam full-width. Reduz scroll sem perder clareza.

**Palette:** Azul escuro primário, âmbar como accent/CTA, verde/laranja/vermelho para grades G1-G5. Superfícies brancas com bordas `#e5e7eb`. Backgrounds de seção `#f8fafc`.

**Typography:** Inter (system-ui fallback), 13-14px para corpo, 12.5px para labels de campo, 10-11px para hints/meta. Font-weight 600 para labels e itens ativos.

**Spacing:** Base de 4px. Cards com `padding: 16px`, gaps entre cards de `16px`, gaps entre fields de `12px`.

**Interactions:** Transições 0.15s ease em hover/focus. Focus ring: `box-shadow: 0 0 0 3px rgba(37,99,235,0.1)`. Validação visual no blur (verde = ok, vermelho = erro).
</design_direction>

<findings_index>
## Design Areas

| Área | Referência | Decisão Principal |
|------|-----------|-------------------|
| Layout & Navegação | references/layout-navegacao.md | Sidebar colapsável 240px↔60px, topbar com breadcrumb |
| Form Controls | references/form-controls.md | Cards em grid, menores lado a lado, textareas full-width |

## Theme

Arquivo de tema em: `sources/themes/default.css`

Tokens principais:
```css
--color-primary: #1e3a5f;
--color-accent:  #f59e0b;
--sidebar-width: 240px;
--sidebar-width-collapsed: 60px;
--header-height: 56px;
--radius-lg: 8px;
--radius-md: 6px;
```

## Source Files

HTML originais preservados em `sources/` para referência completa:
- `sources/001-sidebar-layout/index.html` — 3 variantes de sidebar (B é vencedora)
- `sources/002-form-inputs/index.html` — 3 variantes de form (B★ é vencedora)
</findings_index>

<metadata>
## Processed Sketches

- 001-sidebar-layout (winner: B — Sidebar Colapsável)
- 002-form-inputs (winner: B — Cards em Grid)
</metadata>
