# Roteiro Unificado — App Web

## What This Is

Aplicação web multi-tenant para conduzir e registrar avaliações de prontidão gerencial, técnica, operacional e documental de construtoras no piloto Sinduscon (SuaEquipe.IA). Cada construtora acessa com login próprio, preenche o formulário unificado (Torre 360 + Habilitações + NDA) e o time interno acompanha o status e histórico de prontidão. Substitui o HTML estático atual por uma plataforma colaborativa com persistência, dashboard e exportação.

## Core Value

Qualquer construtora do piloto consegue preencher, salvar e retomar sua avaliação de prontidão — e o time da SuaEquipe.IA visualiza o status de todas as empresas em um único lugar.

## Requirements

### Validated

(Nenhum ainda — entregar para validar)

### Active

- [ ] Autenticação via Supabase Auth (login para construtoras + time interno)
- [ ] Multi-tenant: cada construtora tem escopo isolado de dados
- [ ] Formulário redesenhado com todas as seções do HTML atual (Torre 360, Habilitações, NDA)
- [ ] Persistência de respostas no Supabase (salvar progresso, retomar depois)
- [ ] Dashboard de prontidão — status por empresa (nível gerencial, técnico, documental)
- [ ] Histórico de revisões por empresa (versioning das avaliações)
- [ ] Exportação de relatório em PDF e Excel
- [ ] Identidade visual mantida: paleta azul (#123B66) e laranja (#F28C28)
- [ ] Classificação final de prontidão gerada a partir das respostas

### Out of Scope

- Integração direta com Sienge API — avaliação inicial é manual; integração técnica é fase posterior
- Módulo de assinatura eletrônica do NDA — o NDA é registrado no formulário, não assinado digitalmente na v1
- App mobile nativo — web responsiva cobre o caso de uso
- Notificações por e-mail/WhatsApp — fora do MVP

## Context

- O HTML atual (`roteiro_unificado_completo_torre360_habilitacoes_nda_piloto_sinduscon_v2.html`) é o documento de referência para campos, lógica de abas e linguagem do domínio
- Público primário: construtoras participantes do piloto Sinduscon (5 empresas inicialmente)
- Público secundário: consultores/time interno da SuaEquipe.IA que conduzem as reuniões
- O formulário tem seções bem delimitadas: Identificação, Torre 360 (decisão, Sienge, acesso, classificação), Habilitações (venda, repositórios, responsáveis, classificação), NDA
- Classificação final de prontidão (G1–G5 gerencial; níveis técnicos) precisa ser preservada e calculada automaticamente

## Constraints

- **Stack (frontend)**: React + Vite + Tailwind v4 — decisão do usuário, não negociável
- **Backend/BaaS**: Supabase (PostgreSQL + Auth + Storage + RLS) — decisão do usuário
- **Multi-tenant**: isolamento via Row Level Security (RLS) do Supabase — cada construtora vê apenas seus dados
- **Escala inicial**: piloto com 5 construtoras; arquitetura deve suportar crescimento sem reescrita
- **Export PDF**: biblioteca client-side (ex: react-pdf ou jsPDF) para não depender de servidor de renderização
- **Export Excel**: SheetJS (xlsx) — client-side

## Key Decisions

| Decisão                        | Racional                                                                | Outcome   |
| ------------------------------ | ----------------------------------------------------------------------- | --------- |
| Supabase como BaaS             | Auth + DB + RLS integrados, sem backend custom para o MVP               | — Pending |
| Tailwind v4                    | Requisito explícito do usuário                                          | — Pending |
| Versionamento de avaliações    | Preservar histórico por empresa é requisito v1 (não deixar para depois) | — Pending |
| Construtoras com acesso direto | Reduz intermediação; construtoras preenchem por conta própria           | — Pending |

## Evolution

Este documento evolui a cada transição de fase e milestone.

**Após cada fase** (via `/gsd-transition`):

1. Requisitos invalidados? → Mover para Out of Scope com motivo
2. Requisitos validados? → Mover para Validated com referência de fase
3. Novos requisitos surgiram? → Adicionar em Active
4. Decisões a registrar? → Adicionar em Key Decisions
5. "What This Is" ainda preciso? → Atualizar se derivou

**Após cada milestone** (via `/gsd:complete-milestone`):

1. Revisão completa de todas as seções
2. Core Value check — ainda a prioridade certa?
3. Auditar Out of Scope — motivos ainda válidos?

---

_Last updated: 2026-05-22 após inicialização_
