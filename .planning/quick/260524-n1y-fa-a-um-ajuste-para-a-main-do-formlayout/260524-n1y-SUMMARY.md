---
quick_id: 260524-n1y
status: complete
date: 2026-05-24
commit: 542ea0b
---

# Summary: main do FormLayout ocupa 100% do espaço

## O que foi feito

**FormLayout.tsx linha 179:** Inner wrapper div (container de aside+main) alterado de `flex-1` para `min-h-screen`, seguindo exatamente a lógica do AdminLayout.

```diff
- <div className="flex flex-1 flex-col md:flex-row">
+ <div className="flex min-h-screen flex-col md:flex-row">
```

## Por que funciona

- AdminLayout usa `min-h-screen` no content wrapper div — garante que a área de conteúdo sempre cobre 100vh
- Com `flex-1`, o container media `100vh - 4px` (ProgressBar sticky h-1 ocupa 4px no flow), causando divergência com o aside `md:h-screen`
- Com `min-h-screen`, container é pelo menos 100vh — alinha com aside, e `align-items: stretch` (padrão flex) estica o main para cobrir toda a altura disponível

## Commit

`542ea0b` — fix(260524-n1y): make FormLayout main fill full height following AdminLayout pattern
