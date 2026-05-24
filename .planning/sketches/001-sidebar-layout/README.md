---
sketch: "001"
name: sidebar-layout
question: "Qual estrutura de layout com sidebar fixa funciona melhor para o painel admin?"
winner: "B"
tags: [layout, sidebar, admin, navegação]
---

# Sketch 001: Sidebar Layout

## Design Question
Qual estrutura de layout com sidebar fixa organiza melhor a navegação admin e o conteúdo das organizações?

## Como Abrir
```
open .planning/sketches/001-sidebar-layout/index.html
```

## Variantes

- **A: Sidebar Fixa + Topbar** — Sidebar sempre visível à esquerda, topbar sticky com título e ações. Perfil do usuário e logout no rodapé da sidebar. Stats em destaque no topo do conteúdo.
- **B: Sidebar Colapsável** — Sidebar pode ser recolhida para ícones apenas (clicando no botão de toggle). Topbar usa breadcrumb em vez de título. Mais espaço horizontal quando colapsada.
- **C: Sidebar + Context Bar** — Sidebar sem topbar separado; barra de contexto sticky sob a sidebar que consolida título, KPIs e ações da página num único bloco de destaque.

## O que Observar
- A: Testa se sidebar com rodapé de usuário + logout resolve o botão "Sair" que ficou perdido
- B: Testa se colapsável agrega valor (app pequeno, 5 empresas — vale a complexidade?)
- C: Testa se consolidar título + KPIs + ações numa context-bar reduz ruído visual
- Em todos: sidebar fixa funciona? scroll do conteúdo não interfere com sidebar?
