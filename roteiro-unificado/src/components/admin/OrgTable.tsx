import { useNavigate } from 'react-router-dom'
import { Button, Skeleton } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { OrgWithMemberCount } from '@/features/admin/useOrgs'

interface OrgTableProps {
  orgs: OrgWithMemberCount[]
  isLoading: boolean
  onArchive: (orgId: string, orgName: string) => void
}

function formatCnpj(cnpj: string | null): string {
  if (!cnpj) return '—'
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export function OrgTable({ orgs, isLoading, onArchive }: OrgTableProps) {
  const navigate = useNavigate()

  if (!isLoading && orgs.length === 0) {
    return (
      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <h3 className="text-base font-semibold text-gray-900">Nenhuma organização cadastrada</h3>
          <p className="mt-1 text-sm text-gray-500">
            Crie a primeira organização para começar a gerenciar o piloto.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
              Nome
            </th>
            <th
              scope="col"
              className="w-40 px-4 py-3 text-left text-sm font-semibold text-gray-600"
            >
              CNPJ
            </th>
            <th
              scope="col"
              className="w-20 px-4 py-3 text-center text-sm font-semibold text-gray-600"
            >
              Membros
            </th>
            <th
              scope="col"
              className="hidden w-32 px-4 py-3 text-left text-sm font-semibold text-gray-600 md:table-cell"
            >
              Criado em
            </th>
            <th
              scope="col"
              className="w-24 px-4 py-3 text-left text-sm font-semibold text-gray-600"
            >
              Status
            </th>
            <th
              scope="col"
              className="w-20 px-4 py-3 text-center text-sm font-semibold text-gray-600"
            >
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-t border-gray-200">
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-48" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="mx-auto h-4 w-8" />
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="mx-auto h-4 w-16" />
                  </td>
                </tr>
              ))
            : orgs.map((org) => (
                <tr
                  key={org.id}
                  className={cn('cursor-pointer border-t border-gray-200 hover:bg-gray-50')}
                  onClick={() => navigate(`/admin/orgs/${org.id}`)}
                >
                  <td className="max-w-[200px] truncate px-4 py-3">{org.name}</td>
                  <td className="px-4 py-3">{formatCnpj(org.cnpj)}</td>
                  <td className="px-4 py-3 text-center">{org.member_count}</td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    {new Date(org.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    {org.active ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        Ativa
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        Arquivada
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onArchive(org.id, org.name)}
                      disabled={!org.active}
                    >
                      {org.active ? 'Arquivar' : '—'}
                    </Button>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  )
}
