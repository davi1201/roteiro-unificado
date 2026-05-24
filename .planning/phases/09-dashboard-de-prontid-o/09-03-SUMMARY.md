---
phase: 09-dashboard-de-prontidao
plan: 03
subsystem: dashboard-company
tags: [react, tanstack-query, tdd, security, cross-tenant, dashboard]
dependency_graph:
  requires:
    - roteiro-unificado/src/lib/sectionStatus.ts → computeTabStatus, STATUS_TO_COMPLETENESS (Plan 09-01)
    - roteiro-unificado/src/features/form/tabConfig.ts → TAB_CONFIG
    - roteiro-unificado/src/features/form/ProgressBadge.tsx
    - roteiro-unificado/src/schemas/*.ts → *_REQUIRED_COUNT (10 schemas)
    - roteiro-unificado/src/features/auth/useAuth.ts → orgId, isLoading
  provides:
    - roteiro-unificado/src/features/form/SectionProgress.tsx → SectionProgress
    - roteiro-unificado/src/features/form/CompanyDashboard.tsx → CompanyDashboard
  affects:
    - Wave 3 do Phase 09 (Plan 04: wiring das rotas usa CompanyDashboard)
tech_stack:
  added: []
  patterns:
    - Cross-tenant guard (orgId !== authOrgId → Navigate) idêntico ao HistoryPage
    - useQuery draft com queryKey ['assessment', 'draft', orgId] — cache TanStack Query reusado
    - TDD RED→GREEN: test antes de implementação
    - Cast tipado form_data (Record<string, Record<string, unknown>> | null) — nunca `as any`
key_files:
  created:
    - roteiro-unificado/src/features/form/SectionProgress.tsx
    - roteiro-unificado/src/features/form/CompanyDashboard.tsx
    - roteiro-unificado/src/features/form/CompanyDashboard.test.tsx
  modified: []
decisions:
  - "SectionProgress recebe formData diretamente como prop (não lê Zustand) — isolado do estado local, lê draft do JSONB via TanStack Query em CompanyDashboard (D-05)"
  - "Cast tipado form_data como Record<string, Record<string, unknown>> | null — nunca `as any` (conformidade com threat T-09-INJ e diretrizes do plano)"
  - "waitFor adicionado no teste 3 do guard — TanStack Query inicia em isLoading, título renderiza apenas após query resolver"
  - "Skeleton de loading no CompanyDashboard baseado no padrão HistoryPage (6 cards fake no grid)"
metrics:
  duration: 250s
  completed: "2026-05-24"
  tasks: 2
  files: 3
---

# Phase 09 Plan 03: SectionProgress e CompanyDashboard (Painel da Construtora)

**One-liner:** Grid de 10 cards de progresso `SectionProgress` (consumindo `computeTabStatus`) e página `/form/:orgId/dashboard` com cross-tenant guard, classificação atual e ações de navegação.

## O que foi construído

### Task 1: SectionProgress

Criado `src/features/form/SectionProgress.tsx` exportando `SectionProgress({ formData })`.

Estrutura:
- `REQUIRED_COUNTS: Record<TabKey, number>` mapeando os 10 TabKeys aos seus `*_REQUIRED_COUNT` dos schemas
- `STATUS_LABELS` com 3 entradas: `empty`/"Não iniciado" (gray), `in-progress`/"Em progresso" (orange), `complete`/"Completo" (green)
- Grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` iterando `TAB_CONFIG.map`
- Por card: `computeTabStatus(key, formData, REQUIRED_COUNTS[key])` → `STATUS_TO_COMPLETENESS[status]` → `ProgressBadge completeness={}` + label + pill de status

Nota implementada: apenas Identificação (requiredCount=2) e NDA (requiredCount=1) podem atingir `complete`. As outras 8 abas com requiredCount=0 oscilam entre `empty` e `in-progress` — comportamento esperado conforme RESEARCH §REQUIRED_COUNT.

### Task 2: CompanyDashboard (TDD — RED → GREEN)

**RED:** Criado `CompanyDashboard.test.tsx` com 3 testes do guard (import falha pois CompanyDashboard.tsx não existia). Commit `df7a00f`.

**GREEN:** Criado `CompanyDashboard.tsx` com dois componentes:

`CompanyDashboard` (guard wrapper):
- `useParams({ orgId })` + `useAuth()` → `authOrgId, authLoading`
- Guard idêntico ao HistoryPage: `authLoading || !orgId || !authOrgId` → Spinner `bg-primary min-h-screen`
- `orgId !== authOrgId` → `<Navigate to="/form/{authOrgId}/dashboard" replace />`
- Match → `<CompanyDashboardContent orgId={orgId} />`

`CompanyDashboardContent`:
- `useQuery` com `queryKey: ['assessment', 'draft', orgId]`, `staleTime: 30_000`, `enabled: !!orgId`
- Supabase query: `.select('form_data, ...')...eq('status', 'draft').order('version', {ascending: false}).limit(1).maybeSingle()`
- Cast: `const formData = draftQuery.data?.form_data as Record<string, Record<string, unknown>> | null`
- Skeleton durante `isLoading`; `useToast().error()` no `isError`
- Layout: botão "← Voltar ao Formulário", h1 "Painel de Prontidão", subtítulo, card de classificação (Badge G1-G5 ou pill "Sem avaliação", submitted_at pt-BR, readiness_level_tech)
- `<SectionProgress formData={formData} />` (formData=null → tudo "Não iniciado")
- Footer: `Button("Continuar Avaliação", primary)` + `Button("Ver Histórico", secondary)`

Commit `bd50693`.

## Verificação

```
Tests: 3 passed (3)
  - src/features/form/CompanyDashboard.test.tsx: 3 passed
    ✓ renderiza Spinner quando authLoading=true
    ✓ renderiza <Navigate> para /form/{authOrgId}/dashboard quando orgId diverge de authOrgId
    ✓ renderiza conteúdo quando orgId === authOrgId

TypeScript: 0 erros em SectionProgress.tsx e CompanyDashboard.tsx
Nenhum uso de `as any` — cast tipado obrigatório presente
```

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED (test) Task 2 | df7a00f | PASSED |
| GREEN (feat) Task 2 | bd50693 | PASSED |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocker] node_modules symlink no worktree**
- **Found during:** Task 1 (verificação tsc)
- **Issue:** O diretório `roteiro-unificado/node_modules` não existia no worktree — mesma situação do Plan 09-01
- **Fix:** Criado symlink `roteiro-unificado/node_modules → .../Roteiro Unificado/roteiro-unificado/node_modules` (idêntico à solução do Plan 01)
- **Files modified:** nenhum arquivo rastreado — apenas symlink de runtime
- **Commit:** N/A (symlink não rastreado pelo git)

**2. [Rule 1 - Bug] waitFor adicionado no teste 3 do guard**
- **Found during:** Task 2 GREEN phase (teste falhou porque TanStack Query inicia em isLoading)
- **Issue:** Teste 3 usava `screen.getByText('Painel de Prontidão')` sincronamente, mas o componente renderiza Skeleton durante `isLoading` — o título só aparece após a query resolver
- **Fix:** Adicionado `waitFor(() => { expect(screen.getByText(...)).toBeDefined() })` no teste 3
- **Files modified:** `CompanyDashboard.test.tsx`
- **Commit:** bd50693 (incluído no commit GREEN)

## Known Stubs

Nenhum. SectionProgress e CompanyDashboard não contêm dados hardcoded nem placeholders — todos os dados vêm do draft via TanStack Query.

## Threat Flags

Nenhum novo vetor. Threats cobertos conforme registrado no plano:
- **T-09-01 (Spoofing):** Mitigado — guard `orgId !== authOrgId → Navigate` implementado e testado
- **T-09-02 (Information Disclosure):** Aceito/RLS — query retorna 0 rows para org não autorizada; guard é defesa em profundidade
- **T-09-INJ (Tampering):** Mitigado — computeTabStatus trata form_data apenas como dados; pills exibem strings fixas; nunca dangerouslySetInnerHTML

## Self-Check: PASSED

- [x] `roteiro-unificado/src/features/form/SectionProgress.tsx` — criado e commitado (86a85a7)
- [x] `roteiro-unificado/src/features/form/CompanyDashboard.tsx` — criado e commitado (bd50693)
- [x] `roteiro-unificado/src/features/form/CompanyDashboard.test.tsx` — criado e commitado (df7a00f → bd50693)
- [x] 3 testes verdes, 0 erros TypeScript nos arquivos novos
- [x] Nenhum `as any`; cast tipado `Record<string, Record<string, unknown>> | null` presente
- [x] Textos obrigatórios: "Não iniciado", "Em progresso", "Completo", "Painel de Prontidão", "Continuar Avaliação", "Ver Histórico"
- [x] `TAB_CONFIG.map(` e `computeTabStatus(` e `STATUS_TO_COMPLETENESS` em SectionProgress
- [x] 10 imports `_REQUIRED_COUNT` em SectionProgress
- [x] `orgId !== authOrgId` e `<Navigate` e `queryKey: ['assessment', 'draft', orgId]` em CompanyDashboard
- [x] `<SectionProgress formData={` em CompanyDashboard
