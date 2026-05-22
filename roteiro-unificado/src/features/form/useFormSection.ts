import { useFormStore, TabKey } from '@/stores/formStore'

/**
 * Hook de abstração para acessar o slice de dados de uma aba específica do formulário.
 *
 * Retorna:
 * - `data`: objeto com os campos preenchidos na aba (vazio se nunca tocada)
 * - `updateField`: mergea um campo no objeto da aba via updateSection
 * - `errors`: erros de validação por campo (sempre vazio em Phase 5 — Zod vem na Phase 6)
 * - `completeness`: proxy de completude; 0.01 se a aba foi visitada, 0 caso contrário (D-09)
 *
 * Phase 6+ pode sobrepor `completeness` com cálculo Zod real e otimizar a assinatura
 * para usar um selector específico em vez de assinar o snapshot completo da store.
 */
export function useFormSection(
  tenantId: string,
  tab: TabKey
): {
  data: Record<string, unknown>
  updateField: (field: string, value: unknown) => void
  errors: Record<string, string>
  completeness: number
} {
  const store = useFormStore(tenantId)

  // Slice da aba; objeto vazio se a aba ainda não foi tocada
  const data = store.sectionData[tab] ?? {}

  // Mergeia um campo no objeto da aba sem apagar os demais campos
  const updateField = (field: string, value: unknown) =>
    store.updateSection(tab, { ...data, [field]: value })

  // Phase 5 não tem schema Zod; erros sempre vazios
  const errors: Record<string, string> = {}

  // Proxy de completude: 0.01 se a aba foi visitada, 0 caso contrário (D-09)
  // Phase 6+ substitui por cálculo real baseado em campos obrigatórios preenchidos
  const completeness = store.visitedTabs.has(tab) ? 0.01 : 0

  return { data, updateField, errors, completeness }
}
