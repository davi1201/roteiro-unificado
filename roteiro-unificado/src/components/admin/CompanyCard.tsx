import { Link } from 'react-router-dom'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import type { Grade } from '@/components/ui/badge'
import type { OrgWithReadiness } from '@/features/admin/useOrgsWithReadiness'

interface CompanyCardProps {
  org: OrgWithReadiness
}

/**
 * CompanyCard — card de empresa para o grid do AdminDashboard (DASH-02).
 *
 * - Exibe Badge G1-G5 quando há avaliação submetida com readiness_level_mgmt
 * - Exibe pill cinza "Sem avaliação" quando latestAssessment é null (D-04)
 * - "—" em campos vazios (data, nível técnico)
 * - Link "Ver detalhes →" → /admin/orgs/:orgId via buttonVariants (sem asChild)
 */
export function CompanyCard({ org }: CompanyCardProps) {
  const { latestAssessment } = org

  const formattedDate = latestAssessment?.submitted_at
    ? new Date(latestAssessment.submitted_at).toLocaleDateString('pt-BR') +
      ' às ' +
      new Date(latestAssessment.submitted_at).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

  const techLevel = latestAssessment?.readiness_level_tech ?? '—'

  return (
    <article aria-label={`Empresa ${org.name}`}>
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          {/* Linha: nome + badge/pill */}
          <div className="flex items-start justify-between gap-2">
            <span className="text-base font-semibold text-gray-900">{org.name}</span>

            {latestAssessment?.readiness_level_mgmt ? (
              <Badge grade={latestAssessment.readiness_level_mgmt as Grade} />
            ) : (
              <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                Sem avaliação
              </span>
            )}
          </div>

          {/* CNPJ */}
          {org.cnpj && <span className="font-mono text-xs text-gray-500">{org.cnpj}</span>}
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-sm text-gray-500">Última avaliação: {formattedDate}</p>
          <p className="text-sm text-gray-600">Nível técnico: {techLevel}</p>
        </CardContent>

        <CardFooter className="border-t border-gray-100 pt-3">
          <Link
            to={`/admin/orgs/${org.id}`}
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          >
            Ver detalhes →
          </Link>
        </CardFooter>
      </Card>
    </article>
  )
}
