import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import type { Grade } from '@/components/ui/badge'
import { useNewRevision } from './useNewRevision'
import { ExportPdfButton } from './ExportPdfButton'
import { useOrgInfo } from './useOrgInfo'

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
 * Não exportado — encapsulado dentro do módulo HistoryContent.
 * HistoryPage delega todo o render para HistoryContent, sem precisar do hook diretamente.
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

interface HistoryContentProps {
  orgId: string
  /** Controla se o h1 "Histórico de Avaliações" + subtítulo são renderizados.
   * Default true — HistoryPage mantém o cabeçalho completo;
   * FormLayout passa false pois a topbar do main já mostra o contexto. */
  showHeading?: boolean
}

/**
 * Conteúdo reutilizável do histórico de avaliações, sem wrapper de página.
 *
 * Responsabilidade: renderizar skeleton / empty state / lista de versões.
 * NÃO inclui: wrapper mx-auto max-w-3xl, botão "← Voltar", cross-tenant guard.
 * O caller controla padding/largura e acesso.
 *
 * Reutilizado por:
 * - HistoryPage (rota standalone /form/:orgId/history) — showHeading=true
 * - FormLayout (item Histórico da sidebar embutido no main) — showHeading=false
 */
export function HistoryContent({ orgId, showHeading = true }: HistoryContentProps) {
  const { data: history, isLoading } = useAssessmentHistory(orgId)
  const newRevisionMutation = useNewRevision(orgId)
  const { orgName, cnpj } = useOrgInfo(orgId)

  // Skeleton durante carregamento — 3 cards fake (per UI-SPEC §Skeleton da HistoryPage)
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

  // Empty state — nenhuma avaliação enviada (per UI-SPEC §Copywriting Contract)
  if (!history || history.length === 0) {
    return (
      <div className="space-y-4">
        {showHeading && (
          <>
            <h1 className="text-xl font-semibold text-gray-900">Histórico de Avaliações</h1>
            <p className="mt-1 text-sm text-gray-500">Todas as versões enviadas pela sua empresa</p>
          </>
        )}
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
    <div className="space-y-4">
      {showHeading && (
        <>
          <h1 className="text-xl font-semibold text-gray-900">Histórico de Avaliações</h1>
          <p className="mt-1 text-sm text-gray-500">Todas as versões enviadas pela sua empresa</p>
        </>
      )}

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
                    <>
                      <Button variant="secondary" size="sm">
                        Ver detalhes
                      </Button>
                      <ExportPdfButton
                        assessmentId={row.id}
                        version={row.version}
                        orgName={orgName ?? '—'}
                        cnpj={cnpj}
                        grade={row.readiness_level_mgmt}
                      />
                    </>
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
