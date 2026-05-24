import { useEffect, useRef } from 'react'
import { createFormStore } from '@/stores/formStore'
import { calculateReadiness } from '@/lib/readiness'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import type { Database, Json } from '@/types/database'

type AssessmentUpdate = Database['public']['Tables']['assessments']['Update']
type AssessmentInsert = Database['public']['Tables']['assessments']['Insert']

/**
 * Hook de autosave para o formulário de avaliação.
 *
 * Observa `sectionData` da store Zustand via `subscribe()` e persiste
 * no Supabase após 1500ms de inatividade (debounce). Inclui os resultados
 * de `calculateReadiness` no payload para manter os níveis de prontidão
 * sincronizados com o rascunho salvo.
 *
 * Estratégia de persistência (substituiu upsert — fix 42P10):
 * - SELECT para verificar se draft existe para a org
 * - UPDATE no draft existente (por id + guard status='draft')
 * - INSERT se não existir draft
 *
 * O upsert anterior usava `onConflict: 'org_id,status'` que gerava
 * ON CONFLICT (org_id, status) sem predicado WHERE — incompatível com o
 * índice parcial `WHERE status='draft'` do PostgreSQL (PostgREST não suporta
 * índices parciais em ON CONFLICT). Erro original: code 42P10.
 *
 * Comportamento:
 * - Cada mudança em sectionData reinicia o timer de 1500ms
 * - Mudanças com referência idêntica são ignoradas (sem save desnecessário)
 * - Sucesso: toast "Salvo às HH:MM" por 2s
 * - Erro: toast "Falha ao salvar — tentando novamente"
 * - Cleanup: unsubscribe + clearTimeout ao desmontar (sem memory leak)
 *
 * Segurança (STRIDE T-08-04, T-08-05):
 * - tenantId vem de useParams + cross-tenant guard do FormLayout (Phase 5)
 * - Payload especifica colunas explicitamente — sem spread de user input
 */
export function useAutosave(tenantId: string): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // useRef estabiliza a referência ao toast — useToast() retorna objeto novo a cada render
  const toastRef = useRef(useToast())

  useEffect(() => {
    const store = createFormStore(tenantId)

    const unsubscribe = store.subscribe((state, prev) => {
      // Referência idêntica = sem mudança — não inicia timer
      if (state.sectionData === prev.sectionData) return

      // Cancela debounce anterior
      if (timerRef.current) clearTimeout(timerRef.current)

      // Inicia novo debounce de 1500ms
      timerRef.current = setTimeout(async () => {
        const { sectionData } = store.getState()
        const readiness = calculateReadiness(sectionData)

        const orgId = tenantId

        // Verificar se draft existe para esta org
        const { data: existing } = await supabase
          .from('assessments')
          .select('id')
          .eq('org_id', orgId)
          .eq('status', 'draft')
          .maybeSingle<{ id: string }>()

        let saveError: { message: string } | null = null

        if (existing?.id) {
          // Atualizar draft existente
          const updatePayload: AssessmentUpdate = {
            form_data: sectionData as unknown as Json,
            readiness_level_mgmt: readiness.gerencial,
            readiness_level_tech: readiness.habilitacoes,
          }
          const { error } = await supabase
            .from('assessments')
            .update(updatePayload)
            .eq('id', existing.id)
            .eq('status', 'draft') // guard extra contra condição de corrida
          saveError = error
        } else {
          // Criar novo draft
          const insertPayload: AssessmentInsert = {
            org_id: orgId,
            status: 'draft' as const,
            form_data: sectionData as unknown as Json,
            readiness_level_mgmt: readiness.gerencial,
            readiness_level_tech: readiness.habilitacoes,
          }
          const { error } = await supabase.from('assessments').insert(insertPayload)
          saveError = error
        }

        if (saveError) {
          toastRef.current.warning('Falha ao salvar — tentando novamente')
        } else {
          const time = new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })
          toastRef.current.success(`Salvo às ${time}`, { duration: 2000 })
        }
      }, 1500)
    })

    return () => {
      unsubscribe()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [tenantId])
}
