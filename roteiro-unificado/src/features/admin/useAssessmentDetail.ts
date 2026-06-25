import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type AssessmentDetail = {
  id: string
  version: number
  status: string
  submitted_at: string | null
  readiness_level_mgmt: string | null
  readiness_level_tech: string | null
  form_data: Record<string, Record<string, unknown>>
  org_id: string
}

export function useAssessmentDetail(assessmentId: string | undefined) {
  return useQuery<AssessmentDetail>({
    queryKey: ['assessment', assessmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select(
          'id, version, status, submitted_at, readiness_level_mgmt, readiness_level_tech, form_data, org_id'
        )
        .eq('id', assessmentId!)
        .single()
      if (error) throw error
      return data as AssessmentDetail
    },
    enabled: !!assessmentId,
    staleTime: 60_000,
  })
}
