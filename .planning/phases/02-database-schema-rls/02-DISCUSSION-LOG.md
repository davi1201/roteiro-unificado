# Phase 2: Database Schema & RLS - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-22
**Phase:** 02-database-schema-rls
**Areas discussed:** Form data storage

---

## Form data storage

### Questão 1: Armazenamento de respostas do formulário

| Option | Description | Selected |
|--------|-------------|----------|
| JSONB blob (como o ROADMAP diz) | `assessments.form_data JSONB` — uma coluna para o formulário inteiro | ✓ |
| Tabela relacional de respostas | `assessment_answers (assessment_id, field_key, value)` — uma linha por campo | |
| Híbrido | JSONB + colunas indexadas para campos usados em filtros/scoring | |

**User's choice:** JSONB blob  
**Notes:** Alinhado com o ROADMAP. Escala do piloto (5 construtoras) não exige tabela relacional normalizada.

---

### Questão 2: Armazenamento da classificação de prontidão

| Option | Description | Selected |
|--------|-------------|----------|
| Colunas separadas em `assessments` | `readiness_level_mgmt` e `readiness_level_tech` como colunas diretas | ✓ |
| Dentro do JSONB | Classificação dentro do `form_data` — queries mais lentas | |
| Tabela separada de resultados | `assessment_results (assessment_id, dimension, level)` | |

**User's choice:** Colunas separadas  
**Notes:** Necessário para queries rápidas no dashboard admin (DASH-01/05).

---

### Questão 3: Validação do schema do form_data

| Option | Description | Selected |
|--------|-------------|----------|
| Só no app (Zod) | Banco aceita qualquer JSON; validação fica no TypeScript | ✓ |
| Constraint JSON Schema no Postgres | `CHECK constraint` — rígido, requer migration a cada mudança de campo | |
| Você decide | Detalhe de implementação para o planejador | |

**User's choice:** Só no app (Zod)  
**Notes:** Flexibilidade para evoluir campos sem migrations extras.

---

### Questão 4: Escopo do JSONB (snapshot vs sparse)

| Option | Description | Selected |
|--------|-------------|----------|
| Formulário completo (snapshot) | Salva todos os campos, mesmo os sem resposta (null) | ✓ |
| Só campos preenchidos (sparse) | Apenas campos com valor — menor tamanho, mas precisa de merge na leitura | |

**User's choice:** Formulário completo (snapshot)  
**Notes:** Facilita restaurar qualquer versão histórica e simplifica exportação Excel.

---

## Claude's Discretion

- **Admin identity model**: Identificação de admins SuaEquipe.IA (role em org interna vs flag global)
- **Schema management workflow**: Supabase CLI migrations vs SQL no dashboard
- **TypeScript types strategy**: Manter tipos escritos manualmente vs geração automática

## Deferred Ideas

Nenhuma — discussão focada no escopo da fase.
