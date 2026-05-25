---
slug: org-layout-sketch-mismatch
status: resolved
trigger: manual
goal: find_and_fix
created: 2026-05-24T20:02:39Z
updated: 2026-05-24T20:15:00Z
---

# Debug: Layout Orgs Diferente do Sketch

## Symptoms

Layout da seção de identificação/organização no formulário estava diferente do que foi especificado no sketch 002-form-inputs (Variant B — vencedora).

- **Sketch reference:** `.planning/sketches/002-form-inputs/index.html`
- **Reported by:** user

## Evidence

- timestamp: 2026-05-24T20:10:00Z
  file: roteiro-unificado/src/features/form/sections/IdentificacaoSection.tsx
  finding: |
    DISCREPÂNCIA 1 — Row 2, Escopo do Piloto:
    Sketch: campos empilhados (flex-col, gap-field), com hints abaixo do label
    Implementação anterior: grid-cols-2 dentro do card (campos lado a lado), sem hints
    
    DISCREPÂNCIA 2 — Row 2, Responsáveis:
    Sketch: "Resp. Torre 360" + hint "Nome e contato (ex.: João · 99999-9999)"
            "Resp. Habilitações" + hint "Nome e contato"
    Implementação anterior: "Responsável técnico/Sienge" (sem hint)
                             "Resp. habilitações/documentos" (sem hint)
    
    DISCREPÂNCIA 3 — Ordem e estrutura geral:
    Sketch: Row 1 Dados | Row 2 Responsáveis+Escopo | Row 3 Prioridades
    Implementação anterior: usava mesmos rows mas com layouting interno errado

## Hypotheses

1. [x] Escopo usa grid interno errado (cols-2 ao invés de coluna única)
2. [x] Labels dos Responsáveis diferem do sketch
3. [x] Card "Reunião e Participantes" inserido (mantido — campos no schema)
4. [x] Hints ausentes nos campos de Responsáveis e Escopo

## Resolution

- **root_cause:** IdentificacaoSection.tsx divergia do sketch 002 Variant B em dois pontos críticos:
  (a) Card "Escopo do Piloto" usava `grid-cols-2` interno colocando os dois campos lado a lado, quando o sketch especifica flex-col com campos empilhados e hints por campo;
  (b) Card "Responsáveis" usava labels diferentes do sketch ("Responsável técnico/Sienge" em vez de "Resp. Torre 360") e não exibia os hints de campo.
- **fix:** Aplicado em `roteiro-unificado/src/features/form/sections/IdentificacaoSection.tsx`:
  - Escopo do Piloto: removido `grid-cols-2`, campos agora `flex-col gap-3`, hints adicionados
  - Responsáveis: labels renomeados para "Resp. Torre 360" e "Resp. Habilitações", hints adicionados conforme sketch
  - Placeholders alinhados com sketch (ex.: "Ex.: 3 CNPJs — holding + 2 SPEs")
  - Card "Reunião e Participantes" mantido (campos existem no schema), posicionado como Row 3 antes de Prioridades
  - tsc --noEmit: sem erros
