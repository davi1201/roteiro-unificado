---
sketch: "002"
name: form-inputs
question: "Como organizar inputs no formulário para reduzir carga cognitiva?"
winner: "B"
tags: [form, inputs, layout, ux]
---

# Sketch 002: Organização de Inputs no Formulário

## Design Question
Como agrupar e apresentar os campos do formulário (Identificação, responsáveis, escopo, prioridades) para facilitar o preenchimento e reduzir erros?

## Como Abrir
```
open .planning/sketches/002-form-inputs/index.html
```

## Variantes

- **A: Stacked + Seções** — Campos stacked com separadores visuais (header de seção com ícone colorido + divisor). Grid 2 colunas onde faz sentido (CNPJ + cidade, responsáveis lado a lado). Mais próximo do atual, com organização aprimorada.
- **B: Cards por Grupo** — Cada grupo de campos fica num card com header destacado (ícone emoji, título, subtítulo). Visual mais estruturado, separação física dos grupos. Mais scanning horizontal.
- **C: Floating Labels** — Labels flutuam para cima quando o campo está em foco ou preenchido. Visual mais limpo, menos poluição visual. Mais moderno mas pode gerar confusão em labels longos.

## O que Observar
- A vs B: sections com separador ou cards — qual separa melhor sem pesar?
- B: emoji como ícone de seção funciona? Ou ícone SVG seria mais sóbrio?
- C: floating label em labels longos (ex: "Quem conduz oportunidades comerciais?") — fica legível?
- Em todos: grid 2 colunas para responsáveis faz sentido ou sobra muito espaço?
- Sidebar de abas + topbar sticky — conteúdo tem espaço suficiente?
