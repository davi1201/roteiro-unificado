import { useEffect, useRef } from 'react'
import { createFormStore } from '@/stores/formStore'
import { calculateReadiness } from '@/lib/readiness'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import type { Json } from '@/types/database'

/**
 * Hook de autosave para o formulário de avaliação.
 *
 * Observa `sectionData` da store Zustand via `subscribe()` e faz upsert
 * no Supabase após 1500ms de inatividade (debounce). Inclui os resultados
 * de `calculateReadiness` no payload para manter os níveis de prontidão
 * sincronizados com o rascunho salvo.
 *
 * Comportamento:
 * - Cada mudança em sectionData reinicia o timer de 1500ms
 * - Mudanças com referência idêntica são ignoradas (sem upsert desnecessário)
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

        const payload = {
          org_id: tenantId,
          form_data: sectionData as unknown as Json,
          status: 'draft' as const,
          readiness_level_mgmt: readiness.gerencial,
          readiness_level_tech: readiness.habilitacoes,
        }

        const { error } = await supabase
          .from('assessments')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .upsert(payload as any, { onConflict: 'org_id,status' })

        if (error) {
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
