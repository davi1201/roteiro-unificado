import { Skeleton } from '@/components/ui'
import type { Tables } from '@/types/database'

interface MemberTableProps {
  members: Tables<'org_members'>[] | undefined
  isLoading: boolean
}

export function MemberTable({ members, isLoading }: MemberTableProps) {
  if (!isLoading && members && members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <h3 className="text-base font-semibold text-gray-900">Nenhum membro nesta organização</h3>
        <p className="mt-1 text-sm text-gray-500">
          Adicione o primeiro usuário para que a construtora possa fazer login.
        </p>
      </div>
    )
  }

  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
            Usuário
          </th>
          <th scope="col" className="w-28 px-4 py-3 text-left text-sm font-semibold text-gray-600">
            Role
          </th>
          <th
            scope="col"
            className="hidden w-36 px-4 py-3 text-left text-sm font-semibold text-gray-600 md:table-cell"
          >
            Adicionado em
          </th>
        </tr>
      </thead>
      <tbody>
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <tr key={i} className="border-t border-gray-200">
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-40" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <Skeleton className="h-4 w-24" />
                </td>
              </tr>
            ))
          : (members ?? []).map((member) => (
              <tr key={member.id} className="border-t border-gray-200">
                {/* Exibicao de email completo deferred — schema auth.users requer view ou RPC */}
                <td className="px-4 py-3 font-mono text-xs text-gray-600">
                  {member.user_id.slice(0, 8)}…
                </td>
                <td className="px-4 py-3">
                  {member.role === 'admin' ? (
                    <span className="bg-primary-100 text-primary-800 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                      admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      company
                    </span>
                  )}
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  {new Date(member.created_at).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
      </tbody>
    </table>
  )
}
