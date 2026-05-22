---
phase: 07-campos-habilita-es-nda-classifica-o-g1-g5
plan: "02"
subsystem: schemas
tags: [zod, schemas, habilitacoes, nda, classificacao, wave-1]
dependency_graph:
  requires: []
  provides:
    - habVendaSchema + HabVendaData + HAB_SCENARIOS + HabScenarioSlug + HAB_VENDA_REQUIRED_COUNT
    - habRepositoriosSchema + HabRepositoriosData + HAB_DOCUMENT_DOMAINS + HabDocumentSlug + HAB_REPOSITORIOS_REQUIRED_COUNT
    - habResponsaveisSchema + HabResponsaveisData + HAB_RESPONSIBILITIES + HabResponsabilidadeSlug + HAB_RESPONSAVEIS_REQUIRED_COUNT
    - habClassificacaoSchema + HabClassificacaoData + HAB_CLASSIFICACAO_REQUIRED_COUNT
    - ndaSchema + NdaData + NDA_REQUIRED_COUNT
  affects:
    - "07-03 e demais planos da Wave 2 (Section components consomem estes schemas)"
    - "07-05 (readiness.ts — habMap usa slugs 'hab-a'..'hab-e' de hab-classificacao.ts)"
    - "Qualquer plano que calcule completeness via REQUIRED_COUNT"
tech_stack:
  added: []
  patterns:
    - "Schema aninhado com objeto pai .optional() (padrão torreSiengeSchema) — replicado para 3 matrizes"
    - "Enum estruturado para repositorioPrincipal (D-09) em vez de string livre"
    - "z.literal(true) com { message } para campo obrigatório (Zod v4 API)"
key_files:
  created:
    - roteiro-unificado/src/schemas/hab-venda.ts
    - roteiro-unificado/src/schemas/hab-repositorios.ts
    - roteiro-unificado/src/schemas/hab-responsaveis.ts
    - roteiro-unificado/src/schemas/hab-classificacao.ts
    - roteiro-unificado/src/schemas/nda.ts
  modified: []
decisions:
  - "Zod v4 usa { message: string } em vez de { errorMap } — errorMap foi removido na v4"
  - "repositorioPrincipal em hab-repositorios.ts é enum (D-09), não string livre como no HTML"
  - "terceirosEnvolvidos incluído como string opcional (FORM-02 — paridade total com HTML)"
metrics:
  duration_seconds: 324
  completed_date: "2026-05-22"
  tasks_completed: 2
  files_created: 5
  files_modified: 0
---

# Phase 07 Plan 02: Schemas Zod das Abas Hab. Venda, Hab. Repositórios, Hab. Responsáveis, Hab. Classificação e NDA — Summary

**One-liner:** 5 schemas Zod criados com padrão aninhado (10/14/10 slugs as const) e z.literal(true) para aceitaTermos único campo obrigatório do formulário.

## O que foi construído

### 5 Schemas Zod para as abas restantes do formulário

| Schema | Arquivo | Tipo | Entradas de slug | REQUIRED_COUNT |
|--------|---------|------|-----------------|----------------|
| habVendaSchema | hab-venda.ts | Aninhado (padrão torre-sienge) | 10 (HAB_SCENARIOS) | 0 |
| habRepositoriosSchema | hab-repositorios.ts | Aninhado (padrão torre-sienge) | 14 (HAB_DOCUMENT_DOMAINS) | 0 |
| habResponsaveisSchema | hab-responsaveis.ts | Aninhado (padrão torre-sienge) | 10 (HAB_RESPONSIBILITIES) | 0 |
| habClassificacaoSchema | hab-classificacao.ts | Flat (padrão torre-classificacao) | — | 0 |
| ndaSchema | nda.ts | Flat com campo obrigatório | — | 1 |

### Detalhes de cada schema

**hab-venda.ts:**
- `scenarioSchema` interno (acontece, importancia, quemConduz, principalDificuldade, observacoes — todos opcionais)
- 6 campos flat: principalFormaVenda, quemPedeDocumentos, prazoTipico, perdeuOportunidade (enums), principaisExigencias, ondeCostumaTravar (strings)
- `scenarios: z.object({10 slugs}).optional()`
- `HAB_SCENARIOS` array as const com 10 entradas slug+label
- `HabScenarioSlug` tipo derivado

**hab-repositorios.ts:**
- `documentSchema` interno (existeControle enum, repositorioPrincipal enum per D-09, responsavelInterno string, terceirosEnvolvidos string, observacoes string — todos opcionais)
- `ondeDocumentosVivem` array de enum com 12 opções
- 4 campos flat de controle (existePadraoPastas, existePadraoNomes, controlamValidade, existeTrilhaVersao — enums Sim/Parcial/Não) + observacoesRepositorios
- `documents: z.object({14 slugs}).optional()`
- `HAB_DOCUMENT_DOMAINS` array as const com 14 entradas slug+label
- `HabDocumentSlug` tipo derivado

**hab-responsaveis.ts:**
- `responsabilidadeSchema` interno (quemFaz string, existeSubstituto enum, terceiroDependente enum, maiorDificuldade string, observacoes string — todos opcionais)
- `dificuldadesRecorrentes` array de enum com 12 opções
- 4 campos flat de controle (tempoMedioKit, existeChecklist, existeRenovacao, existeValidacao) + observacoesRotina
- `responsibilities: z.object({10 slugs}).optional()`
- `HAB_RESPONSIBILITIES` array as const com 10 entradas slug+label
- `HabResponsabilidadeSlug` tipo derivado

**hab-classificacao.ts:**
- `classificacaoFinal: z.enum(['hab-a','hab-b','hab-c','hab-d','hab-e']).optional()` — alimenta `calculateReadiness` via habMap em readiness.ts
- `abordagemRecomendada`, `escopoInicialSugerido`, `complexidadePreco` (enums opcionais)
- `fase1`, `fase2`, `riscosPrincipais`, `evidenciasEssenciais`, `observacoesFinais` (strings opcionais)

**nda.ts:**
- `nomeRepresentante`, `cargo`, `cpf` opcionais
- `dataAceite: z.string().default(() => new Date().toLocaleDateString('pt-BR'))` — auto-preenchida
- `aceitaTermos: z.literal(true, { message: 'Você deve aceitar os termos do NDA para continuar' })` — OBRIGATÓRIO
- `observacoes` opcional

## Desvios do Plano

### Desvios auto-corrigidos

**1. [Regra 1 - Bug] Zod v4 API — errorMap removido, substituído por { message }**
- **Encontrado durante:** Task 2 (criação do nda.ts)
- **Problema:** O plano especificava `z.literal(true, { errorMap: () => ({ message: '...' }) })`, mas a versão Zod 4.4.3 instalada removeu `errorMap` do segundo parâmetro de `z.literal()`. O TypeScript rejeitou a propriedade com `TS2769: No overload matches this call`.
- **Correção:** Substituído por `z.literal(true, { message: 'Você deve aceitar os termos do NDA para continuar' })` — API correta no Zod v4.
- **Arquivos modificados:** roteiro-unificado/src/schemas/nda.ts
- **Commit:** 7e090ef

**2. [Regra 3 - Bloqueador] node_modules ausente no worktree**
- **Encontrado durante:** Task 1 (primeira tentativa de commit)
- **Problema:** O hook pre-commit executa `cd roteiro-unificado && npx lint-staged` que invoca `eslint --fix`, mas o worktree não tinha `node_modules/` (somente o repositório principal tem). O hook falhou com `ENOENT`.
- **Correção:** Executado `npm install` no diretório `roteiro-unificado/` do worktree para instalar as dependências localmente.
- **Commits afetados:** b1f07de (segunda tentativa, bem-sucedida)

## Critérios de Sucesso — Verificação

- [x] 5 schemas Zod criados em `src/schemas/`
- [x] Todos compilam sem erros TypeScript (`npx tsc --noEmit` — saída vazia)
- [x] 4 schemas com REQUIRED_COUNT=0, NDA com REQUIRED_COUNT=1
- [x] HAB_SCENARIOS: 10 entradas, HAB_DOCUMENT_DOMAINS: 14 entradas, HAB_RESPONSIBILITIES: 10 entradas
- [x] Tipos derivados HabScenarioSlug, HabDocumentSlug, HabResponsabilidadeSlug exportados
- [x] `classificacaoFinal` usa slugs 'hab-a'..'hab-e' (lowercase) — compatível com habMap em readiness.ts
- [x] `aceitaTermos` em nda.ts é `z.literal(true)` com mensagem de erro em pt-br

## Commits

| Task | Commit | Descrição |
|------|--------|-----------|
| Task 1 | b1f07de | feat(07-02): criar schemas Zod das três matrizes de habilitação |
| Task 2 | 7e090ef | feat(07-02): criar schemas flat hab-classificacao e nda |

## Known Stubs

Nenhum — os schemas são definições estáticas completas. Não há dados mockados, valores hardcoded vazios ou placeholders que impeçam o objetivo do plano.

## Threat Flags

Nenhum — esta fase cria apenas definições de schema estáticas. Não há novos endpoints de rede, paths de autenticação, acesso a arquivos ou mudanças de schema em trust boundaries. As mitigações T-07-02-01 (z.literal(true)), T-07-02-02 (z.enum para selects) e T-07-02-03 (repositorioPrincipal enum) foram implementadas conforme o threat register.

## Self-Check: PASSED

- [x] hab-venda.ts existe: confirmado (listagem de diretório)
- [x] hab-repositorios.ts existe: confirmado
- [x] hab-responsaveis.ts existe: confirmado
- [x] hab-classificacao.ts existe: confirmado
- [x] nda.ts existe: confirmado
- [x] Commit b1f07de existe: confirmado (git log)
- [x] Commit 7e090ef existe: confirmado (git rev-parse HEAD)
- [x] TypeScript clean: confirmado (npx tsc --noEmit sem saída)
