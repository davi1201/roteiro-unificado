import { useFormStore, TabKey } from '@/stores/formStore'
import { TAB_CONFIG } from './tabConfig'

interface ProgressBarProps {
  tenantId: string
}

/**
 * Faixa h-1 sticky no topo da página com largura proporcional ao progresso médio
 * das 10 abas do formulário (D-05).
 *
 * Em Phase 5, completeness de cada aba é 0.01 se visitada ou 0 se não visitada.
 * Com 10 abas, o valor máximo de pct é 0.01 × 10 / 10 × 100 = 1% por visita.
 * Phase 6+ substitui o proxy visitedTabs por cálculo Zod real por campo preenchido.
 *
 * - Sem exibição de percentual numérico (D-05)
 * - role="progressbar" + aria-valuenow para acessibilidade
 * - transition-all duration-300 para transição suave ao trocar de aba
 */
export function ProgressBar({ tenantId }: ProgressBarProps) {
  const store = useFormStore(tenantId)

  // Calcula média de completeness ponderada pelos TAB_CONFIG entries
  const pct =
    (TAB_CONFIG.reduce((acc, t) => acc + (store.visitedTabs.has(t.key as TabKey) ? 0.01 : 0), 0) /
      TAB_CONFIG.length) *
    100

  return (
    <div
      className="sticky top-0 z-40 h-1 w-full bg-gray-200"
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progresso geral do formulário"
    >
      <div className="bg-primary h-full transition-all duration-300" style={{ width: `${pct}%` }} />
    </div>
  )
}
