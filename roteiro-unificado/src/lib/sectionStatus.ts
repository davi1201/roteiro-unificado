/**
 * Status de completude de uma aba do formulário de avaliação.
 *
 * - `empty`: aba sem nenhum dado preenchido
 * - `in-progress`: aba com pelo menos um campo mas sem atingir o mínimo de campos obrigatórios
 * - `complete`: aba com todos os campos obrigatórios preenchidos
 */
export type TabStatus = 'empty' | 'in-progress' | 'complete'

/**
 * Mapeia TabStatus para um valor numérico de completude (0 a 1).
 * Usado para calcular o progresso geral do formulário.
 */
export const STATUS_TO_COMPLETENESS: Record<TabStatus, number> = {
  empty: 0,
  'in-progress': 0.5,
  complete: 1,
}

/**
 * Computa o status de uma aba do formulário a partir de seu form_data JSONB.
 *
 * Função pura e testável — sem React, sem Zustand, sem efeitos colaterais.
 * Espelha o contrato de `calculateReadiness` em readiness.ts.
 *
 * @param tabKey   - Chave da aba com hífen (ex: 'torre-decisao', 'identificacao', 'nda')
 * @param formData - Objeto form_data completo do assessment (ou null/undefined se não carregado)
 * @param requiredCount - Número mínimo de campos preenchidos para considerar a aba 'complete'
 *
 * Lógica (em ordem de verificação):
 * 1. Ler `tabData = formData?.[tabKey]`
 * 2. Se tabData ausente, não-objeto ou objeto vazio → retornar 'empty'
 * 3. Se requiredCount === 0 → retornar 'in-progress'
 *    (verificação ANTES de comparar filledCount — `0 >= 0` seria sempre true)
 * 4. Contar filledCount = valores que não são null, undefined, '' ou array vazio
 * 5. Retornar 'complete' se filledCount >= requiredCount, senão 'in-progress'
 *
 * Segurança (T-09-INJ): trata form_data apenas como dados (typeof/Object.keys/contagem)
 * — nunca executa nem renderiza o conteúdo JSONB. Saída é enum de string fixo.
 */
export function computeTabStatus(
  tabKey: string,
  formData: Record<string, unknown> | null | undefined,
  requiredCount: number
): TabStatus {
  // Passo 1: ler os dados da aba específica
  const tabData = formData?.[tabKey]

  // Passo 2: verificar se a aba tem dados
  if (!tabData || typeof tabData !== 'object' || Object.keys(tabData as object).length === 0) {
    return 'empty'
  }

  // Passo 3: REQUIRED_COUNT=0 nunca produz 'complete' — verificação explícita antes de filledCount
  // (abas sem campos obrigatórios ficam em 'in-progress' quando têm qualquer dado)
  if (requiredCount === 0) {
    return 'in-progress'
  }

  // Passo 4: contar campos preenchidos (excluindo null, undefined, string vazia e array vazio)
  const tabValues = Object.values(tabData as Record<string, unknown>)
  const filledCount = tabValues.filter((value) => {
    if (value === null || value === undefined || value === '') return false
    if (Array.isArray(value) && value.length === 0) return false
    return true
  }).length

  // Passo 5: retornar status baseado na contagem
  return filledCount >= requiredCount ? 'complete' : 'in-progress'
}
