# Phase 9: Dashboard de Prontidão - Context

**Gathered:** 2026-05-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Implementar dois painéis de prontidão distintos: (1) admin vê todas as organizações em grid de CompanyCards com badge G1-G5, filtros por nome/CNPJ/nível e link para detalhe; (2) construtora vê seu próprio painel em `/form/:orgId/dashboard` com classificação atual, progresso por seção (10 abas via SectionProgress) e link para formulário/histórico. AdminDashboard existente tem OrgTable substituída por grid de cards. OrgDetail ganha seção de assessment (histórico + prontidão). Nenhuma mudança nos hooks de auth ou no FormLayout — ambas as rotas novas são folhas.

</domain>

<decisions>
## Implementation Decisions

### Admin Dashboard — Layout

- **D-01:** **OrgTable substituída por grid de CompanyCards** — `AdminDashboard` não renderiza mais `OrgTable`; substitui por grid de `CompanyCard` components exibindo prontidão de cada org. As duas views não coexistem na mesma tela.
- **D-02:** **Botão "Nova Org" permanece no header do AdminDashboard** — `CreateOrgModal` e seu gatilho ficam em `AdminDashboard`. Botão "Arquivar" permanece no `OrgDetail` (já implementado em Phase 4 — sem mudança). `CompanyCard` tem apenas link "Ver detalhes" → `/admin/orgs/:orgId`.
- **D-03:** **CompanyCard exibe dados da última avaliação com `status = 'submitted'`** — query JOIN `orgs` + `assessments` filtrando `status = 'submitted'`, `ORDER BY version DESC LIMIT 1 per org`. Draft ativo não aparece no painel admin — apenas avaliações formalmente enviadas.
- **D-04:** **Empresa sem avaliação submetida renderiza badge cinza "Sem avaliação"** — card ainda aparece no grid (admin vê quem ainda não enviou). Badge cinza com label "Sem avaliação" no lugar do G1-G5. Data e nível técnico exibem "—". Link "Ver detalhes" funciona normalmente.

### SectionProgress — Cálculo de Completude

- **D-05:** **SectionProgress lê `form_data` do JSONB do assessment via TanStack Query** — dashboard da construtora busca o draft ativo (`status = 'draft'`) via `useQuery`. `SectionProgress` recebe `formData` como prop e analisa por aba. Independente do Zustand — não requer `FormLayout` montado.
- **D-06:** **3 estados por aba: Vazio / Em progresso / Completo** — sem percentual numérico exibido. Barra ou ícone indica estado por cor/ícone.
- **D-07:** **"Completo" via `REQUIRED_COUNT` dos schemas** — importar `IDENTIFICACAO_REQUIRED_COUNT`, `TORRE_DECISAO_REQUIRED_COUNT`, etc. dos 10 schemas já existentes em `src/schemas/`. Contar campos obrigatórios preenchidos em `form_data[tabKey]` e comparar com `REQUIRED_COUNT`. "Vazio" se `Object.keys(form_data[tabKey] ?? {}).length === 0`. "Em progresso" caso contrário.

### Claude's Discretion

- **Destino pós-login da construtora** — não discutido. Manter redirect para `/form/:orgId` (sem mudança no `AuthProvider` ou `useUser`). Dashboard acessível via link no FormLayout (botão ou banner). Não forçar construtora a passar pelo dashboard antes do formulário.
- **OrgDetail — integração de assessment** — não discutido. ROADMAP especifica "combina dashboard empresa + histórico + link exportação". Implementador adiciona seção de assessment abaixo do Card de org existente (nova `<section>` com `useQuery` próprio buscando avaliações da org). Manter layout atual intacto acima.
- **Data fetch do admin dashboard** — query Supabase com JOIN via `.from('orgs').select('*, assessments!left(id, version, status, readiness_level_mgmt, readiness_level_tech, submitted_at)').order('version', { ascending: false })` ou subquery. Implementador escolhe abordagem mais legível com PostgREST.
- **Ícones do SectionProgress** — usar SVG inline simples por estado (círculo vazio, clock, check) — mesmo padrão do `ProgressBadge` existente (Phase 5).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requisitos e escopo da fase
- `.planning/ROADMAP.md` §Phase 9 — 6 planos prescritos, UAT e layout de cada view (CompanyCard, SectionProgress, OrgDetail)
- `.planning/REQUIREMENTS.md` §DASH (DASH-01 a DASH-05) — requisitos de dashboard admin e construtora

### Código existente (substituir — atenção especial)
- `roteiro-unificado/src/pages/admin/AdminDashboard.tsx` — **SUBSTITUIR** `OrgTable` por grid de `CompanyCard`; manter botão "Nova Org" e `CreateOrgModal`
- `roteiro-unificado/src/pages/admin/OrgDetail.tsx` — **ADICIONAR** seção de assessment abaixo do Card existente

### Código existente (reutilizar — não recriar)
- `roteiro-unificado/src/components/ui/badge.tsx` — `Badge` com `grade` prop (G1-G5); `habConfig` de cores em `ReadinessClassification.tsx`
- `roteiro-unificado/src/components/ui/skeleton.tsx` — `Skeleton` para loading states
- `roteiro-unificado/src/components/ui/index.ts` — barrel export de todos os UI components
- `roteiro-unificado/src/features/admin/useOrgs.ts` — hook existente; pode precisar de JOIN com assessments
- `roteiro-unificado/src/features/admin/useOrgDetail.ts` — hook existente; expandir ou criar hook paralelo para assessment data
- `roteiro-unificado/src/hooks/useToast.ts` — `useToast()` com `.success()`, `.error()`, `.warning()` — padrão obrigatório
- `roteiro-unificado/src/features/form/HistoryPage.tsx` — padrão de card por versão e badge de status — referência visual para OrgDetail

### Schemas (REQUIRED_COUNT)
- `roteiro-unificado/src/schemas/identificacao.ts` — exportar `IDENTIFICACAO_REQUIRED_COUNT`
- `roteiro-unificado/src/schemas/torre-decisao.ts` — exportar `TORRE_DECISAO_REQUIRED_COUNT`
- `roteiro-unificado/src/schemas/torre-sienge.ts` — exportar `TORRE_SIENGE_REQUIRED_COUNT`
- `roteiro-unificado/src/schemas/torre-acesso.ts` — exportar `TORRE_ACESSO_REQUIRED_COUNT`
- `roteiro-unificado/src/schemas/torre-classificacao.ts` — exportar `TORRE_CLASSIFICACAO_REQUIRED_COUNT`
- `roteiro-unificado/src/schemas/hab-venda.ts` — exportar `HAB_VENDA_REQUIRED_COUNT`
- `roteiro-unificado/src/schemas/hab-repositorios.ts` — exportar `HAB_REPOSITORIOS_REQUIRED_COUNT`
- `roteiro-unificado/src/schemas/hab-responsaveis.ts` — exportar `HAB_RESPONSAVEIS_REQUIRED_COUNT`
- `roteiro-unificado/src/schemas/hab-classificacao.ts` — exportar `HAB_CLASSIFICACAO_REQUIRED_COUNT`
- `roteiro-unificado/src/schemas/nda.ts` — exportar `NDA_REQUIRED_COUNT`

### Schema do banco
- `roteiro-unificado/src/types/database.ts` §assessments — colunas `readiness_level_mgmt`, `readiness_level_tech`, `status`, `version`, `submitted_at`, `form_data`

### Router (adicionar novas rotas)
- `roteiro-unificado/src/router.tsx` — adicionar `/form/:orgId/dashboard` dentro de `<ProtectedRoute>`

### Fases anteriores (contexto de integração)
- `.planning/phases/08-autosave-submiss-o-versionamento/08-CONTEXT.md` — D-05 (`readiness_level_mgmt` e `readiness_level_tech` salvos no autosave — disponíveis para o dashboard sem recalcular)
- `.planning/phases/04-gest-o-de-organiza-es-painel-admin/04-CONTEXT.md` — padrões de AdminLayout, useOrgs, OrgDetail

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Badge` (`src/components/ui/badge.tsx`) — `<Badge grade="G1" />` com cores semânticas já configuradas (G1=vermelho ... G5=verde)
- `habConfig` em `ReadinessClassification.tsx` — mapa de cores HAB-A..HAB-E; copiar ou exportar para uso em CompanyCard
- `Skeleton` (`src/components/ui/skeleton.tsx`) — usar durante carregamento de CompanyCard e SectionProgress
- `useOrgs` (`src/features/admin/useOrgs.ts`) — hook existente; potencialmente expandir query com JOIN assessments
- `ProgressBadge.tsx` (Phase 5) — SVG inline de 3 estados (vazio/clock/check) — reutilizável como ícone de SectionProgress
- `useAssessmentHistory` (inline em `HistoryPage.tsx`) — padrão de query `['assessments', orgId]`; extrair ou adaptar para OrgDetail
- `TAB_CONFIG` (`src/features/form/tabConfig.ts`) — array de 10 abas com label, ícone e TabKey — usar para gerar os 10 cards do SectionProgress

### Established Patterns
- TanStack Query v5: `useQuery({ queryKey: [...], queryFn: async () => {...}, staleTime: 60_000 })`
- Skeleton: 3 cards fake durante `isLoading` (padrão HistoryPage)
- Badge de status: `bg-accent text-white` para enviado; `bg-gray-100 text-gray-700` para rascunho/vazio
- Cross-tenant guard: `if (orgId !== authOrgId) return <Navigate ... />` — replicar em `/form/:orgId/dashboard`
- `useToast()` para todos os toasts de erro — nunca Sonner direto
- Tailwind tokens: `bg-primary` (#123B66), `bg-accent` (#F28C28) — nunca hardcodar hex

### Integration Points
- `router.tsx` → adicionar `{ path: '/form/:orgId/dashboard', element: <CompanyDashboard /> }` em `<ProtectedRoute>`
- `AdminDashboard.tsx` → substituir `<OrgTable ...>` por `<div className="grid ..."><CompanyCard ... /></div>` + manter `CreateOrgModal`
- `OrgDetail.tsx` → adicionar `<AssessmentSection orgId={orgId} />` após os Cards existentes
- `src/features/form/tabConfig.ts` → consumir `TAB_CONFIG` no `SectionProgress` para os 10 cards (label + TabKey)
- `src/schemas/` → importar `*_REQUIRED_COUNT` de cada um dos 10 schemas para o `SectionProgress`

</code_context>

<specifics>
## Specific Ideas

- `CompanyCard` query: `supabase.from('orgs').select('id, name, cnpj, assessments!left(readiness_level_mgmt, readiness_level_tech, submitted_at, version)').eq('assessments.status', 'submitted').order('assessments.version', { ascending: false, referencedTable: 'assessments' })` — ou via hook `useOrgsWithReadiness`.
- Status "Vazio" para aba: `!form_data?.[tabKey] || Object.keys(form_data[tabKey]).length === 0`
- Status "Completo" para aba: contar campos não-nulos/não-string-vazia em `form_data[tabKey]` e comparar com `REQUIRED_COUNT` do schema.
- `SectionProgress` card por aba: ícone (ProgressBadge existente), label (de `TAB_CONFIG[tab].label`), status pill colorido (cinza/amarelo/verde).
- Filtros do admin: client-side via `useMemo` — busca por nome/CNPJ (`toLowerCase().includes`); select de nível G1-G5; botão "Limpar filtros"; contagem de resultados exibidos.

</specifics>

<deferred>
## Deferred Ideas

- Mudança do destino pós-login para `/form/:orgId/dashboard` — pode ser implementada em Phase 12 (polimento) se o piloto demonstrar que usuários preferem landing no dashboard.
- Notificação ao admin quando construtora submete avaliação — fora de escopo (PROJECT.md Out of Scope: notificações por e-mail/WhatsApp).
- Drill-down de seção no SectionProgress (clicar na aba e ir direto para ela no formulário) — implementador pode incluir se simples via `#hash` URL, caso contrário defere para Phase 12.

</deferred>

---

*Phase: 09-dashboard-de-prontid-o*
*Context gathered: 2026-05-24*
