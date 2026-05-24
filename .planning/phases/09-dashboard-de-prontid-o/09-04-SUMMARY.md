---
plan: 09-04
phase: 09-dashboard-de-prontidao
status: complete
tasks_total: 3
tasks_complete: 3
checkpoint_type: human-verify
checkpoint_outcome: approved
completed_at: 2026-05-24
---

# Summary — Plan 09-04: Wiring Final + Checkpoint

## What Was Built

### Task 1: AdminDashboard reescrito com grid de CompanyCards + filtros
- `src/pages/admin/AdminDashboard.tsx` — substituiu `OrgTable` por grid `CompanyCard` consumindo `useOrgsWithReadiness`
- Filtros client-side por nome/CNPJ (busca texto), nível (G1-G5 + "Sem avaliação") via `useMemo`
- Contagem "{N} empresa(s) encontrada(s)" + botão "Limpar filtros"
- `src/pages/admin/AdminDashboard.test.tsx` — 6 testes verdes para `filterOrgs` (TDD: RED `3e80c79` → GREEN `9e1d9ed`)

### Task 2: AssessmentSection montada no OrgDetail + rota registrada
- `src/pages/admin/OrgDetail.tsx` — `<AssessmentSection orgId={orgId} />` adicionada após seção de membros
- `src/router.tsx` — rota `/form/:orgId/dashboard` registrada sob `ProtectedRoute` (`company` role)

### Task 3: Checkpoint humano — verificação visual aprovada
- Admin (`admin@suaequipe.ia`): `/admin/dashboard` com grid de cards, badges, filtros funcionando
- Construtora (`empresa1@teste.com`): `/form/:orgId/dashboard` com SectionProgress 10 abas e cross-tenant guard
- **Resultado:** APROVADO pelo usuário

## Commits

| Commit | Mensagem |
|--------|----------|
| `3e80c79` | test(09-04): add failing tests for AdminDashboard filterOrgs |
| `fb122d2` / `9e1d9ed` | feat(09-04): rewrite AdminDashboard with CompanyCard grid + filters |
| `64b0a8b` / `f599f75` | feat(09-04): mount AssessmentSection in OrgDetail and register /form/:orgId/dashboard route |

## Key Files Modified

- `roteiro-unificado/src/pages/admin/AdminDashboard.tsx` — grid + filtros client-side
- `roteiro-unificado/src/pages/admin/AdminDashboard.test.tsx` — 6 testes filterOrgs
- `roteiro-unificado/src/pages/admin/OrgDetail.tsx` — AssessmentSection integrada
- `roteiro-unificado/src/router.tsx` — rota CompanyDashboard registrada

## Deviations

Nenhum desvio de escopo. Pre-existing TypeScript errors em `HistoryPage.tsx` e `useSubmitAssessment.test.ts` fora do escopo — não introduzidos por este plano.

## Self-Check: PASSED

- [x] AdminDashboard usa `useOrgsWithReadiness` + grid `CompanyCard` (sem `OrgTable`)
- [x] Filtros client-side funcionam (6 testes verdes)
- [x] `AssessmentSection` montada em `OrgDetail`
- [x] Rota `/form/:orgId/dashboard` registrada no router
- [x] Checkpoint humano aprovado — dois painéis verificados no browser
