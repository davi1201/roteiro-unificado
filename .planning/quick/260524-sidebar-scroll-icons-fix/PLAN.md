---
slug: sidebar-scroll-icons-fix
date: 2026-05-24
status: in-progress
---

# Sidebar Scroll + Ícones Menu Fix

## Problema
1. Sidebar scroll junto com conteúdo ao invés de ficar fixa
2. Ícones no menu (ProgressBadge SVG) diferem do sketch — sketch usa círculos numerados 1–10

## Root Cause
1. `flex-row` com `align-items: stretch` (padrão) faz o aside crescer até a altura do conteúdo.
   `position: sticky` não ativa quando o elemento tem a mesma altura do pai.
   Fix: `md:self-start` + remover `min-h-screen` do wrapper interno.
2. `ProgressBadge` renderiza SVGs. Sketch especifica círculos numerados com:
   - active = bg-accent (âmbar) + texto branco
   - done (visitado) = bg-g4 (verde) + texto branco
   - default = bg-white/12 + texto white/55

## Tasks
- [x] FormLayout.tsx: inner wrapper `min-h-screen` → `flex-1`; aside add `md:self-start md:top-1 md:h-[calc(100vh-4px)]`
- [x] TabNavigation.tsx: substituir ProgressBadge por span numerado com estados active/done/default
- [x] Remover import ProgressBadge e função completenessFor
- [x] Commit atômico
