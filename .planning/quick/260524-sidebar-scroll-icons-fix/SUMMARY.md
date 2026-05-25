---
slug: sidebar-scroll-icons-fix
status: complete
date: 2026-05-24
commit: 109a411
---

# Summary

## O que foi feito

**FormLayout.tsx**
- Inner wrapper: `flex min-h-screen flex-col md:flex-row` → `flex flex-1 flex-col md:flex-row`
  - `min-h-screen` removido do wrapper interno (outer já tem); `flex-1` garante que preenche espaço restante
- Aside: adicionado `md:self-start md:top-1 md:h-[calc(100vh-4px)]`
  - `self-start` previne `align-items: stretch` de crescer o aside até a altura do conteúdo
  - `top-1` (4px) compensa o ProgressBar que é `h-1` (4px)
  - `h-[calc(100vh-4px)]` preenche viewport restante abaixo do ProgressBar

**TabNavigation.tsx**
- Removido: `ProgressBadge` import, `completenessFor()` function
- Adicionado: círculos numerados 1–10 inline, matching sketch 002:
  - active → `bg-accent text-white`
  - visited/done → `bg-g4 text-white`
  - default → `bg-white/[0.12] text-white/55`
- Nav item gap atualizado para `gap-[10px]` e font-size `text-[12.5px]` conforme sketch
