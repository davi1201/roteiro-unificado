import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button, Spinner } from '@/components/ui'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import type { Grade } from '@/components/ui/badge'
import { useAuth } from '@/features/auth/useAuth'
import { useNewRevision } from './useNewRevision'

type AssessmentRow = {
  id: string
  version: number
  status: string
  submitted_at: string | null
  readiness_level_mgmt: string | null
  readiness_level_tech: string | null
  created_at: string
}

/**
 * Hook interno para buscar o histórico de avaliações de uma org.
 * Não é exportado — encapsulado dentro do módulo HistoryPage.
 */
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

/**
 * Página /form/:orgId/history — histórico de versões de avaliações da organização.
 *
 * - Lista todas as avaliações ordenadas por version DESC
 * - Skeleton de 3 cards durante carregamento
 * - Card por versão com badge de status, nível de prontidão e botões de ação
 * - "Iniciar Nova Revisão" apenas na versão mais recente (index 0) com status submitted
 */
export function HistoryPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const { orgId: authOrgId, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Cross-tenant guard — mirrors FormLayout (Phase 5)
  if (authLoading || !orgId || !authOrgId) {
    return (
      <div className="bg-primary flex min-h-screen items-center justify-center">
        <Spinner size="lg" className="border-white border-t-transparent" />
      </div>
    )
  }

  if (orgId !== authOrgId) {
    return <Navigate to={`/form/${authOrgId}/history`} replace />
  }

  return <HistoryPageContent orgId={orgId} />
}

function HistoryPageContent({ orgId }: { orgId: string }) {
  const navigate = useNavigate()
  const { data: history, isLoading } = useAssessmentHistory(orgId)
  const newRevisionMutation = useNewRevision(orgId)

  // Skeleton durante carregamento — 3 cards fake (per UI-SPEC §Skeleton da HistoryPage)
  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Empty state — nenhuma avaliação enviada (per UI-SPEC §Copywriting Contract)
  if (!history || history.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/form/${orgId}`)}
          className="mb-4"
        >
          ← Voltar ao Formulário
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">Histórico de Avaliações</h1>
        <p className="mt-1 text-sm text-gray-500">Todas as versões enviadas pela sua empresa</p>
        <div className="mt-8 rounded-lg border border-gray-200 bg-white py-12 text-center">
          <h2 className="text-base font-semibold text-gray-900">Nenhuma avaliação enviada ainda</h2>
          <p className="mt-2 text-sm text-gray-500">
            Preencha o formulário e clique em &apos;Enviar Avaliação&apos; para criar sua primeira
            versão.
          </p>
        </div>
      </div>
    )
  }

  // Determina se o botão "Iniciar Nova Revisão" deve aparecer:
  // Apenas na versão mais recente (index 0) E somente se status === 'submitted'
  // Se history[0].status === 'draft', já existe um rascunho ativo — não exibir o botão
  const mostRecentIsSubmitted = history[0].status === 'submitted'

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Botão voltar — acima do h1 (per UI-SPEC §HistoryPage) */}
      <Button variant="ghost" size="sm" onClick={() => navigate(`/form/${orgId}`)} className="mb-4">
        ← Voltar ao Formulário
      </Button>

      <h1 className="text-xl font-semibold text-gray-900">Histórico de Avaliações</h1>
      <p className="mt-1 text-sm text-gray-500">Todas as versões enviadas pela sua empresa</p>

      {/* Lista de versões */}
      <div className="mt-8 space-y-4">
        {history.map((row, index) => {
          const isSubmitted = row.status === 'submitted'
          const formattedDate = row.submitted_at
            ? new Date(row.submitted_at).toLocaleDateString('pt-BR') +
              ' às ' +
              new Date(row.submitted_at).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : null

          return (
            <article
              key={row.id}
              aria-label={`Versão ${row.version} — ${isSubmitted ? 'Enviada' : 'Rascunho'}`}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* Metadados da versão */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-900">Versão {row.version}</p>

                  {formattedDate && (
                    <p className="text-sm text-gray-500">Enviada em {formattedDate}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Badge de status (per UI-SPEC §Card de Versão) */}
                    {isSubmitted ? (
                      <span className="bg-accent rounded-full px-3 py-1 text-xs font-semibold text-white">
                        Enviado
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        Rascunho
                      </span>
                    )}

                    {/* Nível gerencial — Badge G1-G5 */}
                    {row.readiness_level_mgmt && (
                      <Badge grade={row.readiness_level_mgmt as Grade} />
                    )}

                    {/* Nível técnico — string direta */}
                    {row.readiness_level_tech && (
                      <span className="text-sm text-gray-600">{row.readiness_level_tech}</span>
                    )}
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex shrink-0 items-center gap-2">
                  {isSubmitted && (
                    <Button variant="secondary" size="sm">
                      Ver detalhes
                    </Button>
                  )}

                  {/* "Iniciar Nova Revisão" — apenas na versão mais recente com status submitted */}
                  {index === 0 && mostRecentIsSubmitted && (
                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={newRevisionMutation.isPending}
                      onClick={() => newRevisionMutation.mutate()}
                    >
                      Iniciar Nova Revisão
                    </Button>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
