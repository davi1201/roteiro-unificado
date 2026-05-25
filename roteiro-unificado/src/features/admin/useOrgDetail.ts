import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables, OrgMemberWithEmail } from '@/types/database'

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

  // Uses get_org_members_with_email RPC (SECURITY DEFINER) to JOIN auth.users
  // and return email alongside each member row. Non-admins receive an empty set.
  const membersQuery = useQuery<OrgMemberWithEmail[]>({
    queryKey: ['org_members', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_org_members_with_email', { p_org_id: orgId! })
      if (error) throw error
      return (data as OrgMemberWithEmail[]) ?? []
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
