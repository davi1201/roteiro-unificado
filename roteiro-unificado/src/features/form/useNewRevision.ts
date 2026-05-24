import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import type { Json } from '@/types/database'

type SubmittedRow = {
  form_data: Json
  version: number
  readiness_level_mgmt: string | null
  readiness_level_tech: string | null
}

export function useNewRevision(orgId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const toast = useToast()

  return useMutation({
    mutationFn: async () => {
      // Busca versão submitted mais recente para copiar form_data
      const { data: latest, error: fetchError } = await supabase
        .from('assessments')
        .select('form_data, version, readiness_level_mgmt, readiness_level_tech')
        .eq('org_id', orgId)
        .eq('status', 'submitted')
        .order('version', { ascending: false })
        .limit(1)
        .single<SubmittedRow>()

      if (fetchError) throw fetchError

      // INSERT novo draft copiando form_data — append-only; versões submitted intocadas
      const { error: insertError } = await supabase.from('assessments').insert({
        org_id: orgId,
        form_data: latest.form_data,
        status: 'draft',
        version: latest.version + 1,
        readiness_level_mgmt: latest.readiness_level_mgmt,
        readiness_level_tech: latest.readiness_level_tech,
      } as never)

      if (insertError) throw insertError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment', 'draft', orgId] })
      queryClient.invalidateQueries({ queryKey: ['assessments', orgId] })
      toast.success('Nova revisão iniciada — continue preenchendo o formulário.')
      navigate(`/form/${orgId}`, { replace: true })
    },
    onError: () => {
      toast.error('Erro ao iniciar nova revisão — tente novamente')
    },
  })
}
