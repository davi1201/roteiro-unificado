import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'

export function useArchiveOrg() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: async (orgId: string) => {
      const { error } = await supabase
        .from('orgs')
        .update({ active: false } as never)
        .eq('id', orgId)
      if (error) throw error
    },
    onSuccess: (_data, orgId) => {
      queryClient.invalidateQueries({ queryKey: ['orgs'] })
      queryClient.invalidateQueries({ queryKey: ['orgs', orgId] })
      toast.success('Organização arquivada')
    },
    onError: () => {
      toast.error('Erro ao arquivar organização. Tente novamente.')
    },
  })
}
