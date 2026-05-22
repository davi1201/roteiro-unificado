import { useFormStore, TabKey } from '@/stores/formStore'
import { TAB_CONFIG } from './tabConfig'
import { ProgressBadge } from './ProgressBadge'
import { cn } from '@/lib/utils'

interface TabNavigationProps {
  tenantId: string
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
export function TabNavigation({ tenantId }: TabNavigationProps) {
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
  }

  function completenessFor(tab: TabKey): number {
    return store.visitedTabs.has(tab) ? 0.01 : 0
  }

  return (
    <nav
      aria-label="Navegação do formulário"
      className="flex flex-row gap-1 overflow-x-auto md:flex-col md:overflow-x-visible"
    >
      {TAB_CONFIG.map((tab) => {
        const isActive = store.activeTab === tab.key
        const completeness = completenessFor(tab.key)

        return (
          <button
            type="button"
            key={tab.key}
            onClick={() => handleSelect(tab.key)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={tab.label}
            className={cn(
              'flex h-10 shrink-0 items-center gap-3 rounded-md px-3 text-left text-sm whitespace-nowrap',
              isActive
                ? 'bg-primary-800 font-semibold text-white'
                : 'text-primary-100 hover:bg-primary-800 hover:text-white'
            )}
          >
            <ProgressBadge completeness={completeness} />
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
