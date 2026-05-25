import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

/**
 * Hook leve para buscar nome e CNPJ de uma org pelo id.
 * Usado pelo ExportPdfButton para popular a capa do PDF.
 *
 * SELECT name, cnpj FROM orgs WHERE id = orgId (RLS aplica isolamento)
 */
export function useOrgInfo(orgId: string | undefined) {
  const { data, isLoading } = useQuery({
    queryKey: ['org-info', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orgs')
        .select('name, cnpj')
        .eq('id', orgId!)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!orgId,
    staleTime: 300_000,
  })

  return {
    orgName: data?.name,
    cnpj: data?.cnpj ?? null,
    isLoading,
  }
}
