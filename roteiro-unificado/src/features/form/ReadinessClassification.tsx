import { useMemo } from 'react'
import { useFormStore } from '@/stores/formStore'
import { calculateReadiness } from '@/lib/readiness'
import { Badge, type Grade } from '@/components/ui'

// ─── HAB badge configuration (fora do componente — constante estável) ────────

const habConfig: Record<
  'HAB-A' | 'HAB-B' | 'HAB-C' | 'HAB-D' | 'HAB-E',
  { bg: string; text: string; label: string }
> = {
  'HAB-A': { bg: 'bg-green-100', text: 'text-green-700', label: 'HAB-A — Pronta' },
  'HAB-B': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'HAB-B — Organizada' },
  'HAB-C': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'HAB-C — Parcial' },
  'HAB-D': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'HAB-D — Risco alto' },
  'HAB-E': { bg: 'bg-red-100', text: 'text-red-700', label: 'HAB-E — Não recomendada' },
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ReadinessClassificationProps {
  tenantId: string
}

export function ReadinessClassification({ tenantId }: ReadinessClassificationProps) {
  const store = useFormStore(tenantId)

  // D-04: useMemo observa sectionData inteiro, recalcula apenas quando o objeto muda.
  // calculateReadiness é função pura — seguro chamar via useMemo sem efeitos colaterais.
  const result = useMemo(() => calculateReadiness(store.sectionData), [store.sectionData])

  const hasAnyData = result.gerencial !== null || result.habilitacoes !== null || result.ndaAceito

  return (
    <div className="sticky top-1 z-30 mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
      <span className="text-sm font-semibold text-gray-700">Prontidão atual:</span>

      {!hasAnyData && (
        <span className="text-sm text-gray-400">
          Preencha as abas de classificação para ver o resultado
        </span>
      )}

      {result.gerencial && <Badge grade={result.gerencial as Grade} />}

      {result.habilitacoes && (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${habConfig[result.habilitacoes].bg} ${habConfig[result.habilitacoes].text}`}
        >
          {habConfig[result.habilitacoes].label}
        </span>
      )}

      {result.ndaAceito === true && (
        <span className="text-xs font-medium text-green-700">NDA aceito</span>
      )}
    </div>
  )
}
