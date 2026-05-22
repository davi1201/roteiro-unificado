import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database'

export type OrgWithMemberCount = Pick<
  Tables<'orgs'>,
  'id' | 'name' | 'cnpj' | 'active' | 'created_at'
> & {
  member_count: number
}

// Shape retornado pelo PostgREST ao usar select com count agregado em relação inversa
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
      // Normaliza o shape: PostgREST retorna org_members como array com objeto { count }
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
