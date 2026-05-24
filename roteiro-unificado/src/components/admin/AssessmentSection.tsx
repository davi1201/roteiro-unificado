import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import type { Grade } from '@/components/ui/badge'
import { useToast } from '@/hooks/useToast'

type AssessmentRow = {
  id: string
  version: number
  status: string
  submitted_at: string | null
  readiness_level_mgmt: string | null
  readiness_level_tech: string | null
}

/**
 * Hook interno — análogo a useAssessmentHistory do HistoryPage.
 * queryKey ['assessments', orgId] é compartilhado de propósito para reusar cache.
 */
function useOrgAssessments(orgId: string) {
  return useQuery<AssessmentRow[]>({
    queryKey: ['assessments', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select('id, version, status, submitted_at, readiness_level_mgmt, readiness_level_tech')
        .eq('org_id', orgId)
        .order('version', { ascending: false })
      if (error) throw error
      return (data ?? []) as AssessmentRow[]
    },
    staleTime: 60_000,
    enabled: !!orgId,
  })
}

interface AssessmentSectionProps {
  orgId: string
}

/**
 * AssessmentSection — seção de histórico de avaliações para o OrgDetail (Plan 04).
 *
 * Renderiza lista de versões com loading/empty/error states:
 * - Loading: 3 Skeleton cards (padrão HistoryPage)
 * - Error: toast de erro (useToast — nunca sonner direto)
 * - Empty: cópia exata do 09-UI-SPEC §Copywriting
 * - Data: card por versão com pill de status, Badge G1-G5 opcional, data pt-BR
 *
 * Segurança (T-09-XTEN): RLS assessments_select garante isolamento.
 * Valores de avaliação usados apenas como texto em JSX — sem dangerouslySetInnerHTML (T-09-INJ).
 */
export function AssessmentSection({ orgId }: AssessmentSectionProps) {
  const { data: assessments, isLoading, isError } = useOrgAssessments(orgId)
  const toast = useToast()

  // Erro → toast de alerta (useToast, nunca sonner direto)
  useEffect(() => {
    if (isError) {
      console.error('[AssessmentSection] Erro ao carregar avaliações', { orgId })
      toast.error('Erro ao carregar dados. Tente recarregar a página.')
    }
  }, [isError]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="mt-8 border-t border-gray-200 pt-8">
      <h2 className="text-lg font-semibold text-gray-900">Avaliações</h2>

      {/* Loading — 3 Skeleton cards (padrão HistoryPage linhas 79-93) */}
      {isLoading && (
        <div className="mt-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state — nenhuma avaliação registrada (cópia exata 09-UI-SPEC §Copywriting) */}
      {!isLoading && !isError && assessments?.length === 0 && (
        <div className="mt-8 rounded-lg border border-gray-200 bg-white py-12 text-center">
          <h3 className="text-base font-semibold text-gray-900">Nenhuma avaliação registrada</h3>
          <p className="mt-2 text-sm text-gray-500">
            Esta organização ainda não submeteu nenhuma avaliação.
          </p>
        </div>
      )}

      {/* Data — lista de versões */}
      {!isLoading && !isError && assessments && assessments.length > 0 && (
        <div className="mt-4 space-y-4">
          {assessments.map((row) => {
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
                aria-label={`Versão ${row.version} — ${isSubmitted ? 'Enviado' : 'Rascunho'}`}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-900">Versão {row.version}</p>

                    {formattedDate && (
                      <p className="text-sm text-gray-500">Enviada em {formattedDate}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Pill de status (padrão HistoryPage) */}
                      {isSubmitted ? (
                        <span className="bg-accent rounded-full px-3 py-1 text-xs font-semibold text-white">
                          Enviado
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                          Rascunho
                        </span>
                      )}

                      {/* Badge G1-G5 quando readiness_level_mgmt presente */}
                      {row.readiness_level_mgmt && (
                        <Badge grade={row.readiness_level_mgmt as Grade} />
                      )}

                      {/* Nível técnico — texto direto */}
                      {row.readiness_level_tech && (
                        <span className="text-sm text-gray-600">{row.readiness_level_tech}</span>
                      )}
                    </div>
                  </div>

                  {/* Botão exportação — reservado para Phase 10/11 */}
                  <button
                    disabled
                    title="Em breve"
                    className="shrink-0 rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-400 disabled:pointer-events-none disabled:opacity-50"
                  >
                    Exportar
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
