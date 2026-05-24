import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button, Spinner } from '@/components/ui'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import type { Grade } from '@/components/ui/badge'
import { useAuth } from '@/features/auth/useAuth'
import { useToast } from '@/hooks/useToast'
import { SectionProgress } from './SectionProgress'

// ─── Types ────────────────────────────────────────────────────────────────────

type DraftRow = {
  form_data: Record<string, Record<string, unknown>> | null
  readiness_level_mgmt: string | null
  readiness_level_tech: string | null
  submitted_at: string | null
  version: number
}

// ─── CompanyDashboard (guard wrapper) ─────────────────────────────────────────

/**
 * Página /form/:orgId/dashboard — painel individual da construtora.
 *
 * Aplica o cross-tenant guard idêntico ao HistoryPage (Phase 8):
 *   - authLoading → Spinner de página inteira
 *   - orgId !== authOrgId → Navigate para /form/{authOrgId}/dashboard
 *   - orgId === authOrgId → CompanyDashboardContent
 *
 * Segurança (T-09-01): impede construtora de ver dashboard de outra org
 * via manipulação de URL. RLS (T-09-02) é defesa em profundidade no servidor.
 */
export function CompanyDashboard() {
  const { orgId } = useParams<{ orgId: string }>()
  const { orgId: authOrgId, isLoading: authLoading } = useAuth()

  // Cross-tenant guard — idêntico ao HistoryPage.tsx (Phase 8)
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

  return <CompanyDashboardContent orgId={orgId} />
}

// ─── CompanyDashboardContent (conteúdo) ──────────────────────────────────────

function CompanyDashboardContent({ orgId }: { orgId: string }) {
  const navigate = useNavigate()
  const { error: toastError } = useToast()

  // Query do draft — mesmo queryKey do FormLayout para reuso do cache TanStack Query
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
      return data as DraftRow | null
    },
    staleTime: 30_000,
    enabled: !!orgId,
  })

  // Cast obrigatório — form_data é tipo Json no database.ts; NUNCA `as any`
  const formData = draftQuery.data?.form_data as Record<string, Record<string, unknown>> | null

  // Erro na query do draft
  if (draftQuery.isError) {
    toastError('Erro ao carregar dados. Tente recarregar a página.')
  }

  // Skeleton durante carregamento (padrão HistoryPage)
  if (draftQuery.isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
          <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
            <div className="space-y-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-2 h-5 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Formatação da data de submitted_at
  const submittedDate = draftQuery.data?.submitted_at
    ? new Date(draftQuery.data.submitted_at).toLocaleDateString('pt-BR')
    : null

  const readinessMgmt = draftQuery.data?.readiness_level_mgmt
  const readinessTech = draftQuery.data?.readiness_level_tech

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Botão voltar — acima do h1 (padrão HistoryPage) */}
      <Button variant="ghost" size="sm" onClick={() => navigate(`/form/${orgId}`)} className="mb-4">
        ← Voltar ao Formulário
      </Button>

      {/* Cabeçalho */}
      <h1 className="text-xl font-semibold text-gray-900">Painel de Prontidão</h1>
      <p className="mt-1 text-sm text-gray-500">
        Acompanhe sua classificação e o progresso do formulário
      </p>

      {/* Card de classificação atual */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-sm font-semibold text-gray-700">Classificação atual</p>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          {readinessMgmt ? (
            <Badge grade={readinessMgmt as Grade} />
          ) : (
            <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
              Sem avaliação
            </span>
          )}

          {readinessTech && <span className="text-sm text-gray-600">{readinessTech}</span>}
        </div>

        <p className="mt-2 text-sm text-gray-500">
          {submittedDate
            ? `Última avaliação enviada: ${submittedDate}`
            : 'Nenhuma avaliação enviada'}
        </p>
      </div>

      {/* Grid de progresso por seção */}
      <div className="mt-8">
        <SectionProgress formData={formData} />
      </div>

      {/* Ações de navegação */}
      <div className="mt-8 flex gap-3">
        <Button variant="primary" onClick={() => navigate(`/form/${orgId}`)}>
          Continuar Avaliação
        </Button>
        <Button variant="secondary" onClick={() => navigate(`/form/${orgId}/history`)}>
          Ver Histórico
        </Button>
      </div>
    </div>
  )
}
