# Phase 12: Polimento UX, Performance & Deploy - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-25
**Phase:** 12-polimento-ux-performance-deploy
**Areas discussed:** Supabase produção, Deploy & CI

---

## Supabase produção

| Option | Description | Selected |
|--------|-------------|----------|
| Novo projeto de produção | Cria projeto separado; dados de teste nunca misturam com dados reais | ✓ |
| Mesmo projeto de dev | Simples para piloto; RLS isola por org, mas dados dev ficam no mesmo banco | |

**User's choice:** Novo projeto de produção

---

| Option | Description | Selected |
|--------|-------------|----------|
| supabase db push | Rodar manualmente apontando para o projeto de prod | ✓ |
| Supabase CLI migrations via CI | Migrations automáticas no CD pipeline antes do deploy Vercel | |

**User's choice:** supabase db push

---

| Option | Description | Selected |
|--------|-------------|----------|
| Criar manualmente via Supabase Dashboard | Admin cria 5 orgs e usuários no painel Supabase de prod | |
| Script de seed SQL | seed.sql com INSERTs para as 5 orgs e contas de teste | |
| Criar pelo próprio app em produção | Admin usa painel /admin do app em prod para criar orgs | ✓ |

**User's choice:** Criar pelo próprio app em produção
**Notes:** Valida o fluxo real de onboarding ao mesmo tempo que provisiona dados.

---

## Deploy & CI

| Option | Description | Selected |
|--------|-------------|----------|
| Privado | Projeto cliente — código não público | ✓ |
| Público | Sem restrições de licença | |

**User's choice:** Repositório privado

---

| Option | Description | Selected |
|--------|-------------|----------|
| main → produção (auto-deploy) | Push para main = deploy automático no Vercel; PRs geram preview URLs | ✓ |
| Deploy manual via CLI | `vercel --prod` rodado manualmente; mais controle | |

**User's choice:** main → produção (auto-deploy)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, CI obrigatório | .github/workflows/ci.yml com build + test; branch protection bloqueia merge se falhar | ✓ |
| Não, sem CI agora | Piloto pequeno; overhead não justifica | |

**User's choice:** CI obrigatório (build + test)

---

## Claude's Discretion

- Targets de performance (FCP < 1.5s, Lighthouse ≥ 85) — prescritos pelo ROADMAP, sem nova decisão
- Configuração exata de manualChunks — prescrição do ROADMAP Plan 3
- Configuração vercel.json SPA rewrites — prescrição do ROADMAP Plan 5
- Breakpoints de responsividade e escopo exato da auditoria de acessibilidade — ROADMAP Plans 1 e 2 são guia suficiente

## Deferred Ideas

- Domínio customizado (ex: roteiro.suaequipe.ia) — não discutido; configurável no Vercel após deploy
- Migrations automáticas no CI/CD — complexidade desnecessária para piloto
- Mudança do destino pós-login da construtora — notado em Phase 9; implementador decide se inclui em Phase 12
