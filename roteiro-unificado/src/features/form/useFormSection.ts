import { useFormStore, TabKey } from '@/stores/formStore'
import { useFormState, type Control, type FieldValues, type FieldErrors } from 'react-hook-form'

/**
 * Hook de abstração para acessar o slice de dados de uma aba específica do formulário.
 *
 * ## Assinatura (Phase 6 — D-03)
 *
 * ```ts
 * useFormSection(tenantId, tab)                            // comportamento Phase 5 (compat)
 * useFormSection(tenantId, tab, control)                   // errors reais + completeness derivado
 * useFormSection(tenantId, tab, control, totalRequired)    // completeness = filledRequired/total
 * ```
 *
 * ## Compatibilidade retroativa
 *
 * Quando `control` é ausente, o hook mantém o comportamento exato da Phase 5:
 * - `errors`: sempre `{}`
 * - `completeness`: `0.01` se a aba foi visitada, `0` caso contrário (D-09)
 *
 * ## Com control fornecido
 *
 * - `errors`: mapa achatado `field → mensagem` derivado de `formState.errors` via RHF
 * - `completeness`: se `totalRequired > 0`, `filledRequired / totalRequired` em `[0, 1]`;
 *   se `totalRequired` ausente/0, usa `isDirty && errorCount === 0 ? 1 : (visitedTabs ? 0.5 : 0)`
 *
 * ## Regra de hooks
 *
 * `useFormState` é chamado incondicionalmente — o `control` opcional é passado diretamente
 * para o hook (RHF trata `control: undefined` como "sem subscription", retornando estado vazio).
 * Isso garante conformidade com a regra rules-of-hooks sem sub-hooks ou flags condicionais.
 *
 * @see .planning/phases/06-campos-do-formul-rio-torre-360/06-CONTEXT.md D-03
 */

// ---------------------------------------------------------------------------
// Helpers locais
// ---------------------------------------------------------------------------

/**
 * Achata um objeto FieldErrors aninhado em Record<string, string>.
 * Campos aninhados usam dot-notation como chave (ex: "modules.cadastros.contratado").
 */
function flattenErrors(errs: FieldErrors, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, val] of Object.entries(errs ?? {})) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (val && typeof val === 'object') {
      if ('message' in val && typeof (val as { message?: unknown }).message === 'string') {
        out[fullKey] = (val as { message: string }).message
      } else {
        // Nó intermediário: recursar com prefixo acumulado
        Object.assign(out, flattenErrors(val as FieldErrors, fullKey))
      }
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useFormSection<T extends FieldValues = FieldValues>(
  tenantId: string,
  tab: TabKey,
  control?: Control<T>,
  totalRequired?: number
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

  // CRÍTICO (rules-of-hooks): useFormState SEMPRE chamado, nunca condicionalmente.
  // Quando control é undefined, RHF retorna estado vazio: errors={}, isDirty=false.
  const formState = useFormState({ control: control as Control<FieldValues> | undefined })

  // Cálculo de errors e completeness — bifurca em compat (Phase 5) vs. real (Phase 6+)
  let errors: Record<string, string>
  let completeness: number

  if (control) {
    // Phase 6+: errors derivados do formState real
    errors = flattenErrors(formState.errors as FieldErrors)
    const errorCount = Object.keys(errors).length

    if (totalRequired && totalRequired > 0) {
      // totalRequired fornecido: completeness = campos preenchidos sem erro / total obrigatório
      const filled = Math.max(0, totalRequired - errorCount)
      completeness = filled / totalRequired
    } else {
      // totalRequired ausente: aba completa se foi tocada (isDirty) e sem erros
      completeness =
        formState.isDirty && errorCount === 0 ? 1 : store.visitedTabs.has(tab) ? 0.5 : 0
    }
  } else {
    // Phase 5 compat: sentinels originais preservados (D-09)
    errors = {}
    completeness = store.visitedTabs.has(tab) ? 0.01 : 0
  }

  return { data, updateField, errors, completeness }
}
