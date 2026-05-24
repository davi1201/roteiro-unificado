import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

/**
 * Tipo retornado por useOrgsWithReadiness.
 *
 * latestAssessment: a avaliação submetida (status='submitted') de maior version,
 * ou null quando a org não tem nenhuma avaliação submetida.
 * O campo `status` é omitido intencionalmente — foi usado apenas para filtrar no cliente.
 */
export type OrgWithReadiness = {
  id: string
  name: string
  cnpj: string | null
  active: boolean
  latestAssessment: {
    id: string
    readiness_level_mgmt: string | null
    readiness_level_tech: string | null
    submitted_at: string | null
    version: number
  } | null
}

// Shape raw retornado pelo PostgREST ao usar LEFT JOIN via `assessments!left`
type AssessmentRow = {
  id: string
  readiness_level_mgmt: string | null
  readiness_level_tech: string | null
  submitted_at: string | null
  version: number
  status: string
}

type OrgRow = {
  id: string
  name: string
  cnpj: string | null
  active: boolean
  assessments: AssessmentRow[] | null
}

/**
 * Hook TanStack Query que busca todas as orgs ativas com a última avaliação submetida.
 *
 * Query: `orgs!left(assessments)` com LEFT JOIN via PostgREST.
 *
 * CRÍTICO: NÃO usar `.eq('assessments.status', 'submitted')` na query —
 * isso converte o LEFT JOIN em INNER JOIN e exclui orgs sem avaliação (viola D-04).
 * O campo `status` é incluído no select e o filtro é feito no cliente (.filter no .map).
 *
 * Segurança (T-09-IDOR): RLS `orgs_select`/`assessments_select` já restringe no servidor
 * (admin vê tudo, company vê só is_org_member). Este hook não altera políticas.
 */
export function useOrgsWithReadiness() {
  return useQuery<OrgWithReadiness[]>({
    queryKey: ['orgs', 'with-readiness'],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orgs')
        .select(
          'id, name, cnpj, active, assessments!left(id, readiness_level_mgmt, readiness_level_tech, submitted_at, version, status)'
        )
        .eq('active', true)
        .order('name', { ascending: true })

      if (error) throw error

      return ((data ?? []) as unknown as OrgRow[]).map((row) => {
        const assessments = Array.isArray(row.assessments) ? row.assessments : []

        // Filtrar apenas assessments submetidos no cliente (manter LEFT JOIN intacto)
        const submitted = assessments
          .filter((a) => a.status === 'submitted')
          .sort((a, b) => b.version - a.version)

        const latest = submitted[0] ?? null

        return {
          id: row.id,
          name: row.name,
          cnpj: row.cnpj,
          active: row.active,
          latestAssessment: latest
            ? {
                id: latest.id,
                readiness_level_mgmt: latest.readiness_level_mgmt,
                readiness_level_tech: latest.readiness_level_tech,
                submitted_at: latest.submitted_at,
                version: latest.version,
                // status é omitido intencionalmente — não faz parte do contrato OrgWithReadiness
              }
            : null,
        }
      })
    },
  })
}
