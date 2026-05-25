# Phase 12: Polimento UX, Performance & Deploy - Context

**Gathered:** 2026-05-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Fase final de QA e entrega: auditoria visual de responsividade (1280px/1024px/768px) e acessibilidade básica (WCAG AA), otimização de bundle via Vite rollupOptions, criação e configuração do projeto Supabase de produção, deploy no Vercel com CI obrigatório, e smoke tests validando todo o fluxo em produção.

Não adiciona nenhuma funcionalidade nova de negócio. Depende das Phases 10 + 11 (PDF e Excel export) estarem completas.

</domain>

<decisions>
## Implementation Decisions

### Supabase Produção

- **D-01:** **Novo projeto Supabase separado para produção** — não usar o projeto de dev em prod. Cria projeto novo no Supabase com as mesmas migrations. Credenciais de dev nunca chegam ao build de prod. Plano Free do Supabase permite 2 projetos ativos.
- **D-02:** **Migrations via `supabase db push`** — rodar `supabase db push` apontando para o projeto de produção manualmente durante a fase de deploy. Não automatizar migrations no CI por enquanto.
- **D-03:** **Seed de dados via app em produção** — após deploy, admin usa o próprio painel `/admin` do app em prod para criar as 5 orgs e contas de usuário do piloto. Testa o fluxo real ao mesmo tempo que provisiona dados.

### Deploy & CI

- **D-04:** **Repositório GitHub privado** — projeto cliente, código não público.
- **D-05:** **Auto-deploy: push para `main` → produção no Vercel** — integração GitHub + Vercel ativa. PRs geram preview URLs automaticamente.
- **D-06:** **GitHub Actions CI obrigatório** — workflow `.github/workflows/ci.yml` roda `npm run build` + `npm test` em cada PR. Branch protection rule em `main` bloqueia merge se CI falhar. Previne deploy de código quebrado.

### Claude's Discretion

- Targets de performance prescritos pelo ROADMAP: FCP < 1.5s, Lighthouse Performance ≥ 85 — implementador executa sem nova decisão.
- Configuração exata de bundle splitting (vendor vs supabase vs react-router) — implementador usa `build.rolldownOptions.output.codeSplitting.groups` (API Vite 8 / Rolldown). `manualChunks` e `rollupOptions` foram removidos/depreciados no Vite 8.
- Configuração `vercel.json` com SPA rewrites — implementador segue prescrição do ROADMAP Plan 5.
- Breakpoint 768px (responsividade) e escopo da auditoria de acessibilidade — não discutidos; implementador segue a lista de ROADMAP Plans 1 e 2 como guia completo.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Escopo e planos da fase
- `.planning/ROADMAP.md` §Phase 12 — 6 planos prescritos com detalhes de implementação, targets de Lighthouse, checklist de smoke tests e UAT completo

### Requisitos cobertos
- `.planning/REQUIREMENTS.md` §UX (UX-01 a UX-06) — verificação final como sistema completo

### Stack e config existente
- `roteiro-unificado/vite.config.ts` — config atual sem bundle splitting (base para Plan 3: adicionar `build.rolldownOptions.output.codeSplitting.groups` com Vite 8 / Rolldown API)
- `roteiro-unificado/.env.local` — variáveis de dev existentes (referência para criar .env.production)
- `roteiro-unificado/package.json` — scripts build/test que CI vai executar

### Contexto de design system (para auditoria de responsividade)
- `.planning/phases/09.5-layout-design-system-overhaul/09.5-CONTEXT.md` — tokens CSS, sidebar 240px/60px, breakpoints
- `.claude/skills/sketch-findings-roteiro-unificado/SKILL.md` — design decisions do sketch

### Fases de export (dependências)
- `.planning/phases/10-exportacao-pdf/` — quando existir: contexto da lib PDF usada
- `.planning/phases/11-exportacao-excel/` — quando existir: contexto da lib Excel usada

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `roteiro-unificado/src/components/layouts/AdminSidebar.tsx` — sidebar com colapso 240px/60px (Phase 9.5); referência para auditoria de responsividade
- `roteiro-unificado/src/components/layouts/FormLayout.tsx` — shell do formulário; verificar em 768px
- `roteiro-unificado/src/components/ui/` — componentes UI existentes; varificar contraste e aria-labels

### Established Patterns
- Tailwind tokens: `bg-primary` (#123B66), `bg-accent` (#F28C28) — cores auditadas para contraste WCAG AA
- Build: `npm run build` = `tsc -b && vite build` — base para CI workflow
- Tests: `npm test` = vitest — base para CI workflow

### Integration Points
- `vite.config.ts` → adicionar `build.rollupOptions.output.manualChunks` para separar vendor/supabase/react-router
- `.github/workflows/ci.yml` → novo arquivo; roda em `pull_request` targeting `main`
- `vercel.json` → novo arquivo na raiz `roteiro-unificado/` com SPA rewrites
- `.env.production` → novo arquivo com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` de prod (não commitar — configurar no Vercel Dashboard)

</code_context>

<specifics>
## Specific Ideas

- Seed via app: admin faz login em prod → `/admin` → cria 5 orgs → convida usuários das construtoras. Isso valida o fluxo de onboarding real ao mesmo tempo.
- `.env.production` não deve ser commitado no repositório — as env vars de prod ficam configuradas diretamente no painel do Vercel (Settings → Environment Variables).
- CI workflow mínimo: `actions/checkout`, `actions/setup-node@v4` com Node 20, `npm ci`, `npm run build`, `npm test`.

</specifics>

<deferred>
## Deferred Ideas

- Domínio customizado (ex: roteiro.suaequipe.ia) — não discutido; pode ser configurado no Vercel após deploy inicial se necessário
- Mudança do destino pós-login da construtora para `/form/:orgId/dashboard` — notado em Phase 9 como possível polimento; implementador pode incluir se simples, caso contrário defere
- Migrations automáticas no CI/CD (GitHub Actions roda `supabase db push` antes de deploy) — complexidade desnecessária para piloto; fica para quando o projeto crescer

</deferred>

---

*Phase: 12-polimento-ux-performance-deploy*
*Context gathered: 2026-05-25*
