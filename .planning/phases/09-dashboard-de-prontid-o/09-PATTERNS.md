# Phase 09: Dashboard de Prontidão — Mapa de Padrões

**Mapeado:** 2026-05-24
**Arquivos analisados:** 10 (7 novos + 3 modificados)
**Analogs encontrados:** 10 / 10

---

## Classificação de Arquivos

| Arquivo Novo / Modificado | Role | Data Flow | Analog Mais Próximo | Qualidade |
|---|---|---|---|---|
| `src/features/admin/useOrgsWithReadiness.ts` | hook | CRUD / request-response | `src/features/admin/useOrgs.ts` | exact |
| `src/components/admin/CompanyCard.tsx` | component | request-response | `src/components/admin/OrgTable.tsx` | role-match |
| `src/components/admin/AssessmentSection.tsx` | component | CRUD / request-response | `src/features/form/HistoryPage.tsx` | exact |
| `src/features/form/CompanyDashboard.tsx` | component / page | request-response | `src/features/form/HistoryPage.tsx` | exact |
| `src/features/form/SectionProgress.tsx` | component | transform | `src/features/form/ReadinessClassification.tsx` | role-match |
| `src/lib/sectionStatus.ts` | utility | transform | `src/lib/readiness.ts` | exact |
| `src/pages/admin/AdminDashboard.tsx` *(modificar)* | page | request-response | si mesmo (estado atual) | exact |
| `src/pages/admin/OrgDetail.tsx` *(modificar)* | page | request-response | si mesmo (estado atual) | exact |
| `src/router.tsx` *(modificar)* | config | — | si mesmo (estado atual) | exact |
| Arquivos de teste (5 arquivos) | test | — | `src/lib/readiness.test.ts` + `src/features/form/useSubmitAssessment.test.ts` | role-match |

---

## Atribuições de Padrão

---

### `src/features/admin/useOrgsWithReadiness.ts` (hook, CRUD)

**Analog:** `src/features/admin/useOrgs.ts`

**Padrão de imports** (linhas 1-4 de `useOrgs.ts`):
```typescript
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database'
```

**Padrão de shape intermediário e normalização** (linhas 13-44 de `useOrgs.ts`):
```typescript
// PostgREST retorna relações como arrays — normalizar com map()
// Padrão: (data ?? []) as unknown as RawRow[] para contornar inferência limitada do PostgREST
type OrgRow = {
  id: string
  name: string
  cnpj: string | null
  active: boolean
  created_at: string
  org_members: { count: number }[]
}

export function useOrgs() {
  return useQuery<OrgWithMemberCount[]>({
    queryKey: ['orgs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orgs')
        .select('id, name, cnpj, active, created_at, org_members(count)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return ((data ?? []) as unknown as OrgRow[]).map((row) => ({
        id: row.id,
        name: row.name,
        cnpj: row.cnpj,
        active: row.active,
        created_at: row.created_at,
        member_count:
          Array.isArray(row.org_members) && row.org_members.length > 0
            ? (row.org_members[0] as { count: number }).count
            : 0,
      }))
    },
  })
}
```

**Diferença crítica para o novo hook:** NÃO adicionar `.eq('assessments.status', 'submitted')` como filtro da query — isso converte o LEFT JOIN em INNER JOIN e exclui orgs sem avaliação (D-04). Incluir `status` no `select()` da relação e filtrar no cliente dentro do `map()`. Adicionar `staleTime: 60_000`.

---

### `src/components/admin/CompanyCard.tsx` (component, request-response)

**Analog:** `src/components/admin/OrgTable.tsx`

**Padrão de imports** (linhas 1-5 de `OrgTable.tsx`):
```typescript
import { useNavigate } from 'react-router-dom'
import { Button, Skeleton } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { OrgWithMemberCount } from '@/features/admin/useOrgs'
```

**Para CompanyCard substituir por:**
```typescript
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge, type Grade } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { OrgWithReadiness } from '@/features/admin/useOrgsWithReadiness'
```

**Padrão de Skeleton durante loading** (linhas 73-97 de `OrgTable.tsx`):
```typescript
// 3 itens fake com Skeleton — padrão estabelecido em OrgTable e HistoryPage
{isLoading
  ? Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-16" />
      </div>
    ))
  : orgs.map((org) => <CompanyCard key={org.id} org={org} />)
}
```

**Padrão de badge de status inline** (linhas 109-117 de `OrgTable.tsx`):
```typescript
// Padrão de pill inline — replicar para badge "Sem avaliação" (badge cinza)
<span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
  Sem avaliação
</span>

// Badge G1-G5 — usar Badge component com grade prop (linhas 176-178 de HistoryPage.tsx)
{org.latestAssessment?.readiness_level_mgmt && (
  <Badge grade={org.latestAssessment.readiness_level_mgmt as Grade} />
)}
```

**Padrão de Link no CardFooter** (sem asChild — confirmado em `button.tsx` linhas 30-45):
```typescript
// Button NÃO suporta asChild — usar buttonVariants direto no Link
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'

<Link
  to={`/admin/orgs/${org.id}`}
  className={buttonVariants({ variant: 'ghost', size: 'sm' })}
>
  Ver detalhes →
</Link>
```

**Padrão de `article` com `aria-label`** (linha 149-152 de `HistoryPage.tsx`):
```typescript
<article
  aria-label={`${org.name} — ${org.latestAssessment ? org.latestAssessment.readiness_level_mgmt ?? 'sem nível' : 'Sem avaliação'}`}
  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
>
```

---

### `src/components/admin/AssessmentSection.tsx` (component, CRUD)

**Analog:** `src/features/form/HistoryPage.tsx` — extrai o padrão interno `useAssessmentHistory`

**Padrão de hook interno** (linhas 25-42 de `HistoryPage.tsx`):
```typescript
function useAssessmentHistory(orgId: string) {
  return useQuery({
    queryKey: ['assessments', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select(
          'id, version, status, submitted_at, readiness_level_mgmt, readiness_level_tech, created_at'
        )
        .eq('org_id', orgId)
        .order('version', { ascending: false })
      if (error) throw error
      return (data ?? []) as AssessmentRow[]
    },
    staleTime: 60_000,
    enabled: !!orgId,
  })
}
```

**Nota:** O `queryKey: ['assessments', orgId]` é idêntico ao `HistoryPage.tsx` — o cache TanStack Query é compartilhado por design. Admin e construtora lendo a mesma org compartilham o cache.

**Padrão de card por versão com badge** (linhas 148-210 de `HistoryPage.tsx`):
```typescript
<article
  key={row.id}
  aria-label={`Versão ${row.version} — ${isSubmitted ? 'Enviada' : 'Rascunho'}`}
  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6"
>
  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div className="space-y-2">
      <p className="text-sm font-semibold text-gray-900">Versão {row.version}</p>
      {/* Badge status e Grade */}
      {isSubmitted ? (
        <span className="bg-accent rounded-full px-3 py-1 text-xs font-semibold text-white">
          Enviado
        </span>
      ) : (
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
          Rascunho
        </span>
      )}
      {row.readiness_level_mgmt && (
        <Badge grade={row.readiness_level_mgmt as Grade} />
      )}
    </div>
  </div>
</article>
```

**Padrão de Skeleton** (linhas 79-93 de `HistoryPage.tsx`):
```typescript
if (isLoading) {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  )
}
```

**Padrão de empty state** (linhas 96-118 de `HistoryPage.tsx`):
```typescript
if (!history || history.length === 0) {
  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-white py-8 text-center">
      <h3 className="text-base font-semibold text-gray-900">Nenhuma avaliação enviada ainda</h3>
      <p className="mt-2 text-sm text-gray-500">...</p>
    </div>
  )
}
```

**Integração em `OrgDetail.tsx`** — adicionar após o Card de Membros existente (linha 80 de `OrgDetail.tsx`):
```typescript
// Após </Card> dos membros e antes dos modais
{orgId && <AssessmentSection orgId={orgId} />}
```

---

### `src/features/form/CompanyDashboard.tsx` (component / page, request-response)

**Analog:** `src/features/form/HistoryPage.tsx` — replicar exatamente o padrão de cross-tenant guard

**Padrão de cross-tenant guard** (linhas 52-71 de `HistoryPage.tsx`):
```typescript
export function HistoryPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const { orgId: authOrgId, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Cross-tenant guard — replicar exatamente este bloco
  if (authLoading || !orgId || !authOrgId) {
    return (
      <div className="bg-primary flex min-h-screen items-center justify-center">
        <Spinner size="lg" className="border-white border-t-transparent" />
      </div>
    )
  }

  if (orgId !== authOrgId) {
    return <Navigate to={`/form/${authOrgId}/history`} replace />
    // Para CompanyDashboard: <Navigate to={`/form/${authOrgId}/dashboard`} replace />
  }

  return <HistoryPageContent orgId={orgId} />
  // Para CompanyDashboard: return <CompanyDashboardContent orgId={orgId} />
}
```

**Padrão de imports** (linhas 1-9 de `HistoryPage.tsx`):
```typescript
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button, Spinner } from '@/components/ui'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/features/auth/useAuth'
```

**Padrão de useQuery para draft** — derivado do padrão do `HistoryPage` com `queryKey` específico:
```typescript
// O queryKey ['assessment', 'draft', orgId] permite reaproveitamento de cache
// com FormLayout.tsx quando o usuário alterna entre formulário e dashboard
const draftQuery = useQuery({
  queryKey: ['assessment', 'draft', orgId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('assessments')
      .select('form_data, readiness_level_mgmt, readiness_level_tech, submitted_at, version')
      .eq('org_id', orgId)
      .eq('status', 'draft')
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return data
  },
  staleTime: 30_000,
  enabled: !!orgId,
})
```

**Cast obrigatório de form_data** — o campo tem tipo `Json` genérico em `database.ts`:
```typescript
// NUNCA usar 'as any' — cast tipado preserva segurança de tipos
const formData = draftQuery.data?.form_data as Record<string, Record<string, unknown>> | null
```

**Padrão de navegação por botão** (linhas 128-131 de `HistoryPage.tsx`):
```typescript
// Botão voltar — padrão: variant="ghost" size="sm" com navigate()
<Button variant="ghost" size="sm" onClick={() => navigate(`/form/${orgId}`)} className="mb-4">
  ← Voltar ao Formulário
</Button>
```

---

### `src/features/form/SectionProgress.tsx` (component, transform)

**Analog:** `src/features/form/ReadinessClassification.tsx` — componente que transforma dados do form em UI visual

**Padrão de imports de múltiplos schemas** (linhas 1-4 de `ReadinessClassification.tsx`):
```typescript
import { useMemo } from 'react'
import { useFormStore } from '@/stores/formStore'
import { calculateReadiness } from '@/lib/readiness'
import { Badge, type Grade } from '@/components/ui'
```

**Para SectionProgress substituir por:**
```typescript
import { TAB_CONFIG } from './tabConfig'
import { ProgressBadge } from './ProgressBadge'
import { computeTabStatus, STATUS_TO_COMPLETENESS } from '@/lib/sectionStatus'
import { TabKey } from '@/stores/formStore'
// Importar REQUIRED_COUNT dos 10 schemas
import { IDENTIFICACAO_REQUIRED_COUNT } from '@/schemas/identificacao'
import { TORRE_DECISAO_REQUIRED_COUNT } from '@/schemas/torre-decisao'
// ... (10 imports de schemas)
```

**Padrão de habConfig em `ReadinessClassification.tsx`** (linhas 8-17) — reutilizar estrutura para STATUS_LABELS:
```typescript
// Padrão de mapa de configuração por estado — copiar estrutura
const habConfig: Record<...> = {
  'HAB-A': { bg: 'bg-green-100', text: 'text-green-700', label: 'HAB-A — Pronta' },
  // ...
}

// SectionProgress usa o mesmo padrão:
const STATUS_LABELS = {
  empty: { label: 'Não iniciado', className: 'bg-gray-100 text-gray-600' },
  'in-progress': { label: 'Em progresso', className: 'bg-orange-100 text-orange-700' },
  complete: { label: 'Completo', className: 'bg-green-100 text-green-700' },
} as const
```

**Padrão de ProgressBadge** (arquivo completo em `ProgressBadge.tsx`):
```typescript
// ProgressBadge mapeia completeness numérico para SVG:
// completeness === 1  → ícone check verde (circle-check)
// 0 < completeness < 1 → ícone clock laranja (bg-accent)
// completeness === 0  → círculo vazio (text-primary-300)
// aria-hidden="true" já implementado — não adicionar aria-label extra
<ProgressBadge completeness={STATUS_TO_COMPLETENESS[status]} />
```

**Padrão de grid responsivo** — derivado do padrão AdminDashboard e HistoryPage:
```typescript
<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
  {TAB_CONFIG.map(({ key, label }) => { ... })}
</div>
```

---

### `src/lib/sectionStatus.ts` (utility, transform)

**Analog:** `src/lib/readiness.ts` — função pura exportada para testabilidade sem montar componente

**Padrão de função pura com dependência de enum** (linhas 1-65 de `readiness.ts`):
```typescript
import { TabKey } from '@/stores/formStore'

// Função pura: sem React, sem efeitos colaterais
// Aceita dados de seção como parâmetro (não lê store diretamente)
export function calculateReadiness(
  sectionData: Partial<Record<TabKey, Record<string, unknown>>>
): ReadinessResult {
  const torreDecisao = sectionData[TabKey.TorreDecisao] ?? {}
  // ... lógica pura
}
```

**Para `sectionStatus.ts` replicar o mesmo contrato:**
```typescript
// Função pura exportada — testável sem React
export type TabStatus = 'empty' | 'in-progress' | 'complete'

export function computeTabStatus(
  tabKey: string,
  formData: Record<string, unknown> | null | undefined,
  requiredCount: number
): TabStatus {
  // ... lógica pura (sem useFormStore, sem useQuery)
}

// Constante de mapeamento para ProgressBadge
export const STATUS_TO_COMPLETENESS: Record<TabStatus, number> = {
  empty: 0,
  'in-progress': 0.5,
  complete: 1,
}
```

**Armadilha crítica — REQUIRED_COUNT=0:** A condição `filledCount >= requiredCount` retorna `true` para `0 >= 0`. Verificar explicitamente `if (requiredCount === 0) return 'in-progress'` antes da comparação. Apenas `identificacao` (2) e `nda` (1) podem retornar `'complete'`.

---

### `src/pages/admin/AdminDashboard.tsx` *(modificar)* (page, request-response)

**Analog:** si mesmo — estado atual a ser modificado

**O que remover** (linhas 9, 25-29 de `AdminDashboard.tsx`):
```typescript
// REMOVER — lógica de paginação que fica órfã após substituir OrgTable
const PAGE_SIZE = 10
// ...
const totalPages = Math.max(1, Math.ceil(orgs.length / PAGE_SIZE))
const pagedOrgs = useMemo(
  () => orgs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
  [orgs, page]
)
// E os botões Anterior/Próxima no JSX (linhas 52-74)
```

**O que substituir** (linha 50 de `AdminDashboard.tsx`):
```typescript
// DE:
<OrgTable orgs={pagedOrgs} isLoading={isLoading} onArchive={handleArchive} />

// PARA:
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {/* CompanyCard[] ou Skeleton[] */}
</div>
```

**Padrão de filtros via useMemo** — expandir `pagedOrgs` existente para filtros:
```typescript
// Padrão atual (linha 26-29 de AdminDashboard.tsx) — adaptar para filtros
const [searchTerm, setSearchTerm] = useState('')
const [gradeFilter, setGradeFilter] = useState<string>('Todos')

const filteredOrgs = useMemo(() => {
  return orgs.filter((org) => {
    const matchesSearch =
      searchTerm === '' ||
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org.cnpj ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGrade =
      gradeFilter === 'Todos' ||
      (gradeFilter === 'Sem avaliação'
        ? !org.latestAssessment
        : org.latestAssessment?.readiness_level_mgmt === gradeFilter)
    return matchesSearch && matchesGrade
  })
}, [orgs, searchTerm, gradeFilter])
```

**Padrão de tratamento de erro** (linhas 18-23 de `AdminDashboard.tsx` — manter):
```typescript
useEffect(() => {
  if (isError) {
    toast.error('Erro ao carregar organizações')
    console.error('useOrgs error:', error)
  }
}, [isError, error, toast])
```

**Padrão de header com botão "Nova Org"** (linhas 39-48 de `AdminDashboard.tsx` — manter intacto):
```typescript
<div className="flex items-center justify-between">
  <h1 className="text-xl font-semibold text-gray-900">Organizações</h1>
  <Button
    variant="primary"
    className="bg-accent hover:bg-accent-600 text-white"
    onClick={handleNewOrg}
  >
    Nova Organização
  </Button>
</div>
```

---

### `src/pages/admin/OrgDetail.tsx` *(modificar)* (page, request-response)

**Analog:** si mesmo — estado atual a ser modificado

**Onde inserir `AssessmentSection`** (após linha 80 de `OrgDetail.tsx`):
```typescript
// Após </Card> do bloco de Membros, antes dos modais
{orgId && <AssessmentSection orgId={orgId} />}

// Add member modal
{orgId && (
  <AddMemberModal ... />
)}
```

**Padrão de import de componente admin** (linhas 1-8 de `OrgDetail.tsx`):
```typescript
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, Card, CardHeader, CardContent, Spinner } from '@/components/ui'
import { useOrgDetail } from '@/features/admin/useOrgDetail'
import { MemberTable } from '@/components/admin/MemberTable'
import { AddMemberModal } from '@/components/admin/AddMemberModal'
import { ArchiveOrgDialog } from '@/components/admin/ArchiveOrgDialog'
// Adicionar:
import { AssessmentSection } from '@/components/admin/AssessmentSection'
```

---

### `src/router.tsx` *(modificar)* (config)

**Analog:** si mesmo — estado atual a ser modificado

**Padrão de rota folha dentro de ProtectedRoute** (linhas 32-42 de `router.tsx`):
```typescript
{
  element: <ProtectedRoute />,
  children: [
    {
      path: '/form/:orgId',
      element: <FormLayout />,
    },
    {
      path: '/form/:orgId/history',
      element: <HistoryPage />,
    },
    // Adicionar:
    {
      path: '/form/:orgId/dashboard',
      element: <CompanyDashboard />,
    },
  ],
},
```

---

### Arquivos de teste (5 arquivos) (test, transform)

**Analog 1 — testes de função pura:** `src/lib/readiness.test.ts`

**Padrão de teste de função pura** (arquivo completo):
```typescript
import { describe, it, expect } from 'vitest'
import { calculateReadiness } from './readiness'   // → substituir por computeTabStatus
import { TabKey } from '@/stores/formStore'

describe('computeTabStatus', () => {
  it('retorna "empty" se tabData vazio', () => {
    expect(computeTabStatus('identificacao', null, 2)).toBe('empty')
  })

  it('retorna "in-progress" se REQUIRED_COUNT=0 e tem dados', () => {
    expect(computeTabStatus('torre-decisao', { 'torre-decisao': { campo: 'valor' } }, 0)).toBe('in-progress')
  })
  // Sem mocks — função pura não tem dependências externas
})
```

**Analog 2 — testes de hook com QueryClient:** `src/features/form/useSubmitAssessment.test.ts`

**Padrão de wrapper QueryClientProvider** (linhas 73-80):
```typescript
function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
    // Para hooks de query: defaultOptions: { queries: { retry: false } }
  })
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
  return wrapper
}
```

**Padrão de mock supabase** (linhas 68-70):
```typescript
vi.mock('@/lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))
```

**Padrão de mock react-router-dom para componentes** (linhas 8-11):
```typescript
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  // Para componentes com Link:
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  Navigate: ({ to }: any) => <div data-testid="navigate" data-to={to} />,
  useParams: () => ({ orgId: 'test-org-id' }),
}))
```

---

## Padrões Compartilhados

### Autenticação / Cross-Tenant Guard
**Fonte:** `src/features/form/HistoryPage.tsx` linhas 52-71
**Aplicar a:** `CompanyDashboard.tsx`
```typescript
const { orgId } = useParams<{ orgId: string }>()
const { orgId: authOrgId, isLoading: authLoading } = useAuth()

if (authLoading || !orgId || !authOrgId) {
  return (
    <div className="bg-primary flex min-h-screen items-center justify-center">
      <Spinner size="lg" className="border-white border-t-transparent" />
    </div>
  )
}

if (orgId !== authOrgId) {
  return <Navigate to={`/form/${authOrgId}/dashboard`} replace />
}
```

### Tratamento de Erro com useToast
**Fonte:** `src/pages/admin/AdminDashboard.tsx` linhas 18-23 + `src/hooks/useToast.ts`
**Aplicar a:** Todos os componentes com `isError` de query
```typescript
const toast = useToast()

useEffect(() => {
  if (isError) {
    toast.error('Mensagem de erro — tente novamente')
    console.error('hook error:', error)
  }
}, [isError, error, toast])
```
**Regra:** Nunca usar Sonner diretamente. Sempre `useToast()` com `.error()`, `.success()`, `.warning()`.

### Tokens de Cor Tailwind
**Fonte:** `src/components/ui/badge.tsx` (bg-g1..bg-g5) + `src/components/ui/button.tsx` (bg-primary, bg-accent)
**Aplicar a:** Todos os arquivos novos
- `bg-primary` = #123B66 (nunca hardcodar hex)
- `bg-accent` = #F28C28 (nunca hardcodar hex)
- `bg-g1`..`bg-g5` = cores semânticas G1-G5 (via tokens CSS do Tailwind v4)

### Skeleton Loading (3 itens)
**Fonte:** `src/features/form/HistoryPage.tsx` linhas 79-93
**Aplicar a:** `CompanyCard` (grid) e `AssessmentSection`
```typescript
if (isLoading) {
  return (
    <div className="space-y-4"> {/* ou grid para CompanyCard */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  )
}
```

### TanStack Query v5 — staleTime padrão
**Fonte:** `src/features/form/HistoryPage.tsx` linha 39; `src/features/admin/useOrgs.ts` (sem staleTime — adicionar nos novos hooks)
**Aplicar a:** `useOrgsWithReadiness`, `AssessmentSection`, `CompanyDashboard`
```typescript
return useQuery({
  queryKey: [...],
  queryFn: async () => { ... },
  staleTime: 60_000,  // hooks admin
  // staleTime: 30_000, // draft (muda com mais frequência)
  enabled: !!orgId,
})
```

### Formatação de data pt-BR
**Fonte:** `src/features/form/HistoryPage.tsx` linhas 139-145
**Aplicar a:** `CompanyCard`, `AssessmentSection`
```typescript
const formattedDate = row.submitted_at
  ? new Date(row.submitted_at).toLocaleDateString('pt-BR') +
    ' às ' +
    new Date(row.submitted_at).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  : '—'
```

---

## Sem Analog Encontrado

Nenhum arquivo desta fase ficou sem analog no codebase. Todos os padrões têm correspondência direta em código existente.

---

## Metadados

**Escopo de busca:** `roteiro-unificado/src/` — todos os arquivos `.tsx` e `.ts`
**Arquivos escaneados:** 75
**Data de extração de padrões:** 2026-05-24
**Analogs principais consultados:**
- `src/features/form/HistoryPage.tsx` — cross-tenant guard, useQuery, Skeleton, card de versão, empty state
- `src/features/admin/useOrgs.ts` — padrão de hook PostgREST com normalização de shape
- `src/pages/admin/AdminDashboard.tsx` — estado atual a modificar; useMemo; useToast; header
- `src/pages/admin/OrgDetail.tsx` — estado atual a modificar; layout de Card + seção
- `src/lib/readiness.ts` — padrão de função pura exportável e testável
- `src/lib/readiness.test.ts` — padrão de teste de função pura sem mock
- `src/features/form/useSubmitAssessment.test.ts` — padrão de mock supabase + QueryClientProvider wrapper
- `src/components/ui/badge.tsx` — Grade type, gradeConfig, bg-g1..bg-g5
- `src/components/ui/button.tsx` — confirmação: sem asChild; `buttonVariants` exportado
- `src/features/form/ProgressBadge.tsx` — mapeamento completeness → SVG (0 / 0-1 / 1)
- `src/features/form/tabConfig.ts` — TAB_CONFIG com 10 abas e valores de TabKey
- `src/features/form/ReadinessClassification.tsx` — padrão de habConfig; useMemo sobre dados do form
