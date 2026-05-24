/**
 * AutosaveIndicator — componente 100% presentacional.
 *
 * Exibe o estado de autosave: "Não salvo", "Salvando...", "Salvo há X min"
 * ou "Falha ao salvar". Não usa useFormStore nem useAutosave — o wiring com
 * lastSavedAt real é responsabilidade do FormLayout (Plano 03).
 *
 * STRIDE T-09.5-03: componente só renderiza timestamp relativo ("Salvo há 3 min")
 * — sem PII, sem tokens, sem dados de formulário.
 */

export interface AutosaveIndicatorProps {
  lastSaved: Date | null
  isSaving?: boolean
  error?: boolean
  className?: string
}

function formatRelativeMinutes(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 60_000
  if (diff < 1) return 'menos de 1 min'
  if (diff < 60) return `${Math.floor(diff)} min`
  return `${Math.floor(diff / 60)} h`
}

export function AutosaveIndicator({
  lastSaved,
  isSaving = false,
  error = false,
  className,
}: AutosaveIndicatorProps) {
  return (
    <div className={`flex items-center gap-1.5 text-[11px] text-gray-500 ${className ?? ''}`}>
      {error ? (
        <span className="text-g1">Falha ao salvar</span>
      ) : isSaving ? (
        <span>Salvando...</span>
      ) : lastSaved === null ? (
        <span>Não salvo</span>
      ) : (
        <>
          <span className="bg-g5 h-1.5 w-1.5 rounded-full" aria-hidden="true" />
          <span>Salvo há {formatRelativeMinutes(lastSaved)}</span>
        </>
      )}
    </div>
  )
}
