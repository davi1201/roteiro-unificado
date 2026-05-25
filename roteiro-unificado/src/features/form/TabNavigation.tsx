import { useFormStore, TabKey } from '@/stores/formStore'
import { TAB_CONFIG } from './tabConfig'
import { cn } from '@/lib/utils'

interface TabNavigationProps {
  tenantId: string
  /** View ativa no FormLayout: 'form' (default) ou 'historico'.
   * Controla destaque visual — quando 'historico', as etapas não aparecem ativas. */
  activeView?: 'form' | 'historico'
  /** Callback invocado ao clicar no item Histórico.
   * Se não for passado, o item Histórico não é renderizado — mantém compatibilidade
   * com qualquer uso sem sidebar (ex.: rota standalone HistoryPage). */
  onSelectHistory?: () => void
  /** Callback invocado ao clicar em qualquer etapa do formulário.
   * FormLayout usa isso para voltar para view='form' quando o usuário estava no histórico.
   * Invocado APÓS o handleSelect interno (setActiveTab + markTabVisited). */
  onSelectStep?: () => void
}

/**
 * Componente de navegação por abas do formulário de avaliação.
 *
 * Desktop (md+): stepper vertical — exibe ícone + label completo da aba
 * Mobile (<md): pills horizontais scrolláveis — exibe apenas ícone; aria-label
 *               no <button> garante acessibilidade quando label visual está oculto
 *
 * Restrições:
 * - Usa button type="button" em vez de NavLink/Link para evitar scroll-to-anchor
 * - Guard no hash impede loop infinito entre TabNavigation e o useEffect do FormLayout
 * - Cores via tokens semânticos; sem hex hardcoded
 * - NÃO renderiza o botão "Sair" — responsabilidade do FormLayout (Plan 04)
 * - NÃO renderiza a ProgressBar — responsabilidade do FormLayout (Plan 04)
 */
export function TabNavigation({
  tenantId,
  activeView = 'form',
  onSelectHistory,
  onSelectStep,
}: TabNavigationProps) {
  const store = useFormStore(tenantId)

  function handleSelect(tab: TabKey): void {
    // Guard anti-loop: só atualiza o hash se o valor mudou (T-05-03-01)
    // Sem este guard, o useEffect do FormLayout detecta mudança de hash, chama
    // setActiveTab, que re-renderiza TabNavigation, que escreve no hash novamente.
    // Usa replaceState em vez de atribuição direta para passar a regra react-hooks/immutability.
    if (window.location.hash !== '#' + tab) {
      window.history.replaceState(null, '', '#' + tab)
    }
    store.setActiveTab(tab)
    store.markTabVisited(tab)
    // Notifica o FormLayout para voltar para a view do formulário quando vinha do histórico
    onSelectStep?.()
  }

  return (
    <nav
      aria-label="Navegação do formulário"
      className="flex flex-row gap-1 overflow-x-auto md:flex-col md:overflow-x-visible"
    >
      {TAB_CONFIG.map((tab, index) => {
        // Quando activeView === 'historico', nenhuma etapa do formulário aparece ativa —
        // mesmo que store.activeTab aponte para uma delas (feedback visual correto)
        const isActive = activeView !== 'historico' && store.activeTab === tab.key
        const isVisited = store.visitedTabs.has(tab.key)

        return (
          <button
            type="button"
            key={tab.key}
            onClick={() => handleSelect(tab.key)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={tab.label}
            className={cn(
              'flex h-10 shrink-0 items-center gap-[10px] rounded-md px-2 text-left text-[12.5px] whitespace-nowrap',
              isActive
                ? 'bg-white/[0.12] font-semibold text-white'
                : 'text-white/55 hover:bg-white/[0.08] hover:text-white'
            )}
          >
            {/* Step number badge — matches sketch: active=accent, done=g4, default=white/12 */}
            <span
              aria-hidden="true"
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                isActive
                  ? 'bg-accent text-white'
                  : isVisited
                    ? 'bg-g4 text-white'
                    : 'bg-white/[0.12] text-white/55'
              )}
            >
              {index + 1}
            </span>
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        )
      })}

      {/* Item Histórico — renderizado apenas quando onSelectHistory é fornecido (compatibilidade) */}
      {onSelectHistory && (
        /* Separação visual: mt-1 + divisor + pt-1 distingue histórico das etapas do formulário */
        <div className="mt-1 border-t border-white/10 pt-1">
          <button
            type="button"
            onClick={onSelectHistory}
            aria-current={activeView === 'historico' ? 'page' : undefined}
            aria-label="Histórico"
            className={cn(
              'flex h-10 w-full shrink-0 items-center gap-[10px] rounded-md px-2 text-left text-[12.5px] whitespace-nowrap',
              activeView === 'historico'
                ? 'bg-white/[0.12] font-semibold text-white'
                : 'text-white/55 hover:bg-white/[0.08] hover:text-white'
            )}
          >
            {/* Ícone de relógio (clock) no slot do badge — mantém alinhamento com as etapas */}
            <span aria-hidden="true" className="flex h-5 w-5 shrink-0 items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
            <span className="hidden md:inline">Histórico</span>
          </button>
        </div>
      )}
    </nav>
  )
}
