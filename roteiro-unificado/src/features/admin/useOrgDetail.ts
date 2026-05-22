import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database'

export function useOrgDetail(orgId: string | undefined) {
  const orgQuery = useQuery<Tables<'orgs'>>({
    queryKey: ['orgs', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orgs')
        .select('id, name, cnpj, active, created_at')
        .eq('id', orgId!)
        .single<Tables<'orgs'>>()
      if (error) throw error
      return data
    },
    enabled: !!orgId,
  })

  const membersQuery = useQuery<Tables<'org_members'>[]>({
    queryKey: ['org_members', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('org_members')
        .select('id, org_id, user_id, role, created_at')
        .eq('org_id', orgId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!orgId,
  })

  return {
    org: orgQuery.data,
    members: membersQuery.data,
    isLoading: orgQuery.isLoading || membersQuery.isLoading,
    isError: orgQuery.isError || membersQuery.isError,
    error: orgQuery.error || membersQuery.error,
  }
}
