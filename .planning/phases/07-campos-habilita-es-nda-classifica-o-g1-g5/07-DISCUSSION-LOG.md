# Phase 7: Campos — Habilitações, NDA & Classificação G1-G5 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-22
**Phase:** 07-campos-habilita-es-nda-classifica-o-g1-g5
**Areas discussed:** Engine G1-G5, Matriz de habilitações, NDA — conteúdo renderizado

---

## Engine G1-G5

| Option | Description | Selected |
|--------|-------------|----------|
| Select direto do consultor | O HTML já tem um `<select>` 'Nível gerencial' na aba Torre Decisão. Consultor escolhe G1–G5 explicitamente. `calculateReadiness` apenas lê esse valor. Simples, sem surpresas. | ✓ |
| Score calculado de múltiplas respostas | Função pontua respostas das abas Torre + Habilitações e deriva G1–G5 automaticamente. Mais complexo, possível discrepância com julgamento do consultor. | |
| Select direto + sugestão calculada | Sistema calcula sugestão mas consultor confirma ou sobrescreve. Melhor UX, implementação mais longa. | |

**User's choice:** Select direto do consultor

---

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, select direto | Mesmo padrão do G1-G5. HTML já tem `<select>` 'Classificação final' na aba Hab. Classificação. Consistência total. | ✓ |
| Não, calculado de outro jeito | Lógica diferente para HAB vs. gerencial. | |

**User's choice:** Sim, select direto (HAB-A a HAB-E também é select direto)

---

| Option | Description | Selected |
|--------|-------------|----------|
| gerencial + habilitacoes + nda_aceito | Leitura direta dos selects/checkbox. Simples e suficiente para badge + dashboard. | ✓ |
| gerencial + tecnico + operacional + documental | Output com 4 dimensões como descrito no ROADMAP. Precisa mapear respostas para cada dimensão. | |
| Você decide | Discretion do implementador. | |

**User's choice:** `{ gerencial, habilitacoes, ndaAceito }`

---

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, tempo real via useMemo | `calculateReadiness(sectionData)` em `useMemo`. Badge reflete seleção atual imediatamente. UAT já exige isso. | ✓ |
| Apenas ao salvar/submeter | Só atualiza quando usuário salva. Menos responsivo. | |

**User's choice:** Tempo real via useMemo

---

## Matriz de habilitações

| Option | Description | Selected |
|--------|-------------|----------|
| Lista de selects agrupados por domínio | Cada domínio = grupo de campos com SelectField, input text, TextareaField. Reutiliza components Phase 6. Sem component novo. | ✓ |
| Tabela com dropdown por célula | `<table>` com `<select>` em cada célula. Visual fiel ao HTML. Requer component novo, menos responsivo. | |
| Accordion rows por domínio | Cada domínio = row expansível. Visual limpo mas esconde informação. | |

**User's choice:** Lista de selects agrupados por domínio

---

| Option | Description | Selected |
|--------|-------------|----------|
| Select + Select + Select + Textarea | 'Existe controle?' = SelectField, 'Repositório principal' = SelectField, 'Responsável interno' = text input, 'Observações' = TextareaField. | ✓ |
| Tudo textarea livre | Máxima flexibilidade, menos estruturado. | |
| Você decide baseado no HTML | Discretion do implementador. | |

**User's choice:** Select + Select + Select + Textarea

---

## NDA — conteúdo renderizado

| Option | Description | Selected |
|--------|-------------|----------|
| Texto completo + campos ao final | Texto legal integral em `<div>` scrollable + campos de aceite (nome, CPF, cargo, checkbox, data). Fidelidade total ao documento. | ✓ |
| Só campos de aceite | Apenas campos obrigatórios. Mais limpo, perde o conteúdo jurídico. | |
| Texto colapsável + campos | Accordion 'Ver texto completo' + campos sempre visíveis. Meio-termo. | |

**User's choice:** Texto completo + campos ao final

---

| Option | Description | Selected |
|--------|-------------|----------|
| Hardcoded como constante TypeScript | Texto em `src/constants/nda-text.ts`. Sem dependência externa, simples de atualizar. | ✓ |
| Arquivo .md importado como módulo | Mais legível para editar, requer plugin Vite. | |
| Renderizado direto do HTML de referência | Iframe/fetch do HTML local. Complexo. | |

**User's choice:** Hardcoded em `src/constants/nda-text.ts`

---

| Option | Description | Selected |
|--------|-------------|----------|
| Opcional | HTML não marca CPF como required. Só checkbox é obrigatório (UAT já define isso). | ✓ |
| Obrigatório | Zod exige CPF preenchido. Bloqueia submissão sem CPF. | |

**User's choice:** CPF opcional — só checkbox `aceitaTermos` é obrigatório

---

## Claude's Discretion

- **Domínios específicos da matriz** — quais linhas incluir (fiscal, ambiental, previdenciário, etc.) extraídos do HTML campo a campo pelo implementador.
- **Placement do ReadinessClassification preview** — sidebar, sticky bottom ou badge no header. Implementador decide o menos intrusivo.
- **Máscara de CPF** — incluir se houver lib de mask já instalada, senão campo text simples.

## Deferred Ideas

- Score automático derivado de sub-respostas (substituindo select direto) — descartado para v1, possível em versão futura.
- Tooltip no badge com breakdown da classificação — deferred para Phase 12 (polimento).
- Máscara de CPF — deferred para Phase 12.
