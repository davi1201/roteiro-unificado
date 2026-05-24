---
phase: 09-dashboard-de-prontidao
plan: 02
subsystem: dashboard-ui-components
tags: [react, ui-components, tdd, badge, admin, readiness, card]
dependency_graph:
  requires:
    - roteiro-unificado/src/features/admin/useOrgsWithReadiness.ts (Plan 09-01)
    - roteiro-unificado/src/components/ui/badge.tsx
    - roteiro-unificado/src/components/ui/card.tsx
    - roteiro-unificado/src/components/ui/button.tsx (buttonVariants)
    - roteiro-unificado/src/hooks/useToast.ts
  provides:
    - roteiro-unificado/src/components/admin/CompanyCard.tsx → CompanyCard (DASH-02)
    - roteiro-unificado/src/components/admin/AssessmentSection.tsx → AssessmentSection
  affects:
    - Wave 3 do Phase 09 — AdminDashboard compõe CompanyCard no grid
    - Plan 09-04 — OrgDetail monta AssessmentSection
tech_stack:
  added: []
  patterns:
    - Card com Badge condicional (G1-G5 vs pill cinza — padrão DASH-02/D-04)
    - buttonVariants no Link sem asChild (padrão HistoryPage)
    - Hook interno useOrgAssessments com queryKey compartilhado ['assessments', orgId]
    - useToast() para erros (nunca import direto de sonner)
    - Skeleton de 3 cards durante loading (padrão HistoryPage)
key_files:
  created:
    - roteiro-unificado/src/components/admin/CompanyCard.tsx
    - roteiro-unificado/src/components/admin/CompanyCard.test.tsx
    - roteiro-unificado/src/components/admin/AssessmentSection.tsx
  modified: []
decisions:
  - "CompanyCard usa buttonVariants({ variant: 'ghost', size: 'sm' }) no Link — Button não suporta asChild no projeto"
  - "AssessmentSection usa queryKey ['assessments', orgId] idêntico ao HistoryPage para reusar cache TanStack Query"
  - "Testes CompanyCard usam toBeDefined()/toBeNull() em vez de toBeInTheDocument() — projeto não tem setupFiles com @testing-library/jest-dom"
  - "Botão exportação em AssessmentSection: disabled + title='Em breve' (preparando Phase 10/11)"
metrics:
  duration: 240s
  completed: "2026-05-24"
  tasks: 2
  files: 3
---

# Phase 09 Plan 02: CompanyCard e AssessmentSection — Componentes Apresentacionais

**One-liner:** CompanyCard com Badge G1-G5 ou pill cinza (D-04) e AssessmentSection com hook próprio `useOrgAssessments`, queryKey compartilhado com HistoryPage e estados loading/empty/error/data.

## O que foi construído

### Task 1: CompanyCard (TDD — RED → GREEN)

Criado `src/components/admin/CompanyCard.tsx` exportando `CompanyCard({ org: OrgWithReadiness })`.

Estrutura implementada:
- `<article>` com `<Card border-gray-200 shadow-sm>`
- `CardHeader`: linha com nome (`text-base font-semibold text-gray-900`) + Badge G1-G5 OU pill cinza
- CNPJ: `text-xs text-gray-500 font-mono` (condicional — exibido se `org.cnpj` presente)
- `CardContent`: "Última avaliação: {data pt-BR}" e "Nível técnico: {tech}"
- `CardFooter`: `<Link to={/admin/orgs/${org.id}} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>Ver detalhes →</Link>`

Lógica condicional:
- `latestAssessment === null` → pill `<span className="...bg-gray-200...text-gray-600">Sem avaliação</span>` e `formattedDate = '—'`, `techLevel = '—'`
- `latestAssessment.readiness_level_mgmt` truthy → `<Badge grade={...as Grade} />`; data formatada pt-BR; tech = `readiness_level_tech ?? '—'`

Criado `CompanyCard.test.tsx` cobrindo 6 casos behavior. Nota: assertions usam `toBeDefined()/toBeNull()` em vez de `toBeInTheDocument()` — o projeto não configura `@testing-library/jest-dom` no vitest setup.

### Task 2: AssessmentSection

Criado `src/components/admin/AssessmentSection.tsx` exportando `AssessmentSection({ orgId: string })`.

Hook interno `useOrgAssessments(orgId)`:
- `queryKey: ['assessments', orgId]` — idêntico ao HistoryPage para cache reusado
- `queryFn`: `supabase.from('assessments').select(...).eq('org_id', orgId).order('version', { ascending: false })`
- `staleTime: 60_000`, `enabled: !!orgId`

Estados renderizados:
- **Loading**: 3 Skeleton cards (padrão HistoryPage linhas 79-93)
- **Error**: `useToast().error('Erro ao carregar dados. Tente recarregar a página.')` em `useEffect` sobre `isError`
- **Empty**: `<h3>Nenhuma avaliação registrada</h3>` + texto "Esta organização ainda não submeteu nenhuma avaliação." (cópia exata 09-UI-SPEC)
- **Data**: `<article>` por versão com pill de status ("Enviado" `bg-accent text-white` / "Rascunho" `bg-gray-100 text-gray-700`), Badge G1-G5 condicional, data pt-BR, nível técnico direto
- Botão "Exportar" desabilitado com `title="Em breve"` (Phase 10/11)

## Verificação

```
Tests:    6 passed — src/components/admin/CompanyCard.test.tsx
TypeScript: 0 erros relativos a CompanyCard.tsx e AssessmentSection.tsx
sonner:   nenhum import direto em AssessmentSection (apenas useToast())
```

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED (test) Task 1 | b4bf7b3 | PASSED |
| GREEN (feat) Task 1 | 663eb22 | PASSED |
| Task 2 (não-TDD) | 6f18641 | N/A |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocker] node_modules symlink ausente no worktree**
- **Found during:** Task 1 RED phase (teste não executava)
- **Issue:** O diretório `roteiro-unificado/node_modules` não existia no worktree isolado
- **Fix:** `ln -s /main-repo/roteiro-unificado/node_modules ./roteiro-unificado/node_modules`
- **Files modified:** nenhum arquivo rastreado — symlink de runtime
- **Commit:** N/A (symlink não rastreado pelo git)

**2. [Rule 1 - Bug] Assertions de teste incompatíveis com setup vitest do projeto**
- **Found during:** Task 1 GREEN phase (6 testes falhando com "Invalid Chai property: toBeInTheDocument")
- **Issue:** O projeto não configura `setupFiles` com `@testing-library/jest-dom` no vitest.config.ts — `toBeInTheDocument()` não está disponível
- **Fix:** Reescreveu assertions para usar `toBeDefined()`, `toBeNull()`, `getAttribute()` (vitest nativo) — padrão dos outros testes do projeto (CompanyDashboard.test.tsx)
- **Files modified:** `roteiro-unificado/src/components/admin/CompanyCard.test.tsx`
- **Commit:** incluído no commit 663eb22

## Known Stubs

Nenhum. Ambos componentes são folha apresentacional sem dados hardcoded.

## Threat Flags

Nenhum novo vetor de superfície. Ameaças cobertas pelo threat register do plano:
- T-09-XTEN: aceito — RLS `assessments_select` garante isolamento; `AdminRoute` protege a rota
- T-09-INJ: mitigado — `readiness_level_*` e `version` renderizados apenas como texto JSX; sem `dangerouslySetInnerHTML`

## Self-Check: PASSED

- [x] `roteiro-unificado/src/components/admin/CompanyCard.tsx` — criado e commitado (663eb22)
- [x] `roteiro-unificado/src/components/admin/CompanyCard.test.tsx` — criado e commitado (663eb22)
- [x] `roteiro-unificado/src/components/admin/AssessmentSection.tsx` — criado e commitado (6f18641)
- [x] 6 testes verdes no CompanyCard.test.tsx
- [x] 0 erros TypeScript nos arquivos novos
- [x] Nenhum import direto de sonner em AssessmentSection
