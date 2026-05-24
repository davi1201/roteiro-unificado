import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'

export function useSubmitAssessment(orgId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const toast = useToast()

  return useMutation({
    mutationFn: async () => {
      // Busca version atual antes de incrementar (evita race condition — Armadilha 4)
      const { data: draft, error: fetchError } = await supabase
        .from('assessments')
        .select('version')
        .eq('org_id', orgId)
        .eq('status', 'draft')
        .single<{ version: number }>()

      if (fetchError) throw fetchError

      // UPDATE atômico: transiciona draft para submitted, incrementa version
      const { error } = await supabase
        .from('assessments')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          version: draft.version + 1,
        } as never)
        .eq('org_id', orgId)
        .eq('status', 'draft')

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment', 'draft', orgId] })
      queryClient.invalidateQueries({ queryKey: ['assessments', orgId] })
      toast.success('Avaliação enviada com sucesso!')
      navigate(`/form/${orgId}/history`, { replace: true })
    },
    onError: () => {
      toast.error('Erro ao enviar avaliação — tente novamente')
    },
  })
}
