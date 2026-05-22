import { useEffect } from 'react'
import { useParams, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { useFormStore, TabKey } from '@/stores/formStore'
import { TAB_CONFIG } from './tabConfig'
import { TabNavigation } from './TabNavigation'
import { ProgressBar } from './ProgressBar'
import { Button, Spinner } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { IdentificacaoSection } from './sections/IdentificacaoSection'
import { TorreDecisaoSection } from './sections/TorreDecisaoSection'
import { TorreSiengeSection } from './sections/TorreSiengeSection'
import { TorreAcessoSection } from './sections/TorreAcessoSection'
import { TorreClassificacaoSection } from './sections/TorreClassificacaoSection'

/**
 * Renderiza o Section component correto para a aba ativa.
 * As 5 abas Torre 360 são cobertas por cases explícitos (Phase 6).
 * O default cobre as 5 abas Habilitações/NDA — serão implementadas na Phase 7.
 */
function renderSection(activeTab: TabKey, tenantId: string) {
  switch (activeTab) {
    case TabKey.Identificacao:
      return <IdentificacaoSection tenantId={tenantId} />
    case TabKey.TorreDecisao:
      return <TorreDecisaoSection tenantId={tenantId} />
    case TabKey.TorreSienge:
      return <TorreSiengeSection tenantId={tenantId} />
    case TabKey.TorreAcesso:
      return <TorreAcessoSection tenantId={tenantId} />
    case TabKey.TorreClassificacao:
      return <TorreClassificacaoSection tenantId={tenantId} />
    default:
      return (
        <p className="mt-2 text-sm text-gray-500">
          Esta seção ainda não possui campos. Em breve os campos estarão disponíveis aqui.
        </p>
      )
  }
}

/**
 * Shell principal do formulário de avaliação.
 *
 * Integra: sidebar bg-primary + TabNavigation (stepper) + ProgressBar (faixa sticky)
 * + botão Sair + hash sync com URL + cross-tenant guard.
 *
 * As 5 abas Torre 360 renderizam seus Section components via switch(activeTab).
 * As 5 abas Habilitações/NDA exibem placeholder até a Phase 7.
 */
export function FormLayout() {
  const { orgId: routeOrgId } = useParams<{ orgId: string }>()
  const { orgId: authOrgId, signOut, isLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()

  // tenantId é garantidamente string após o guard abaixo; usamos fallback '' só
  // para satisfazer o tipo de useFormStore — o store nunca é acessado quando vazio.
  const tenantId = routeOrgId ?? ''
  const store = useFormStore(tenantId)

  // Hash sync — sincroniza URL hash com activeTab no mount e nas navegações
  // CRITICAL: não incluir `store` nas deps — provoca loop infinito (T-05-04-04)
  useEffect(() => {
    if (!tenantId) return
    const hash = location.hash.replace('#', '')
    const validKeys = TAB_CONFIG.map((t) => t.key) as string[]
    const matched = validKeys.includes(hash) ? (hash as TabKey) : TabKey.Identificacao
    if (store.activeTab !== matched) {
      store.setActiveTab(matched)
    }
    store.markTabVisited(matched)
  }, [location.hash]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cross-tenant guard — renderizado ANTES de qualquer JSX que acesse a store
  if (isLoading || !routeOrgId || !authOrgId) {
    return (
      <div className="bg-primary flex min-h-screen items-center justify-center">
        <Spinner size="lg" className="border-white border-t-transparent" />
      </div>
    )
  }

  if (routeOrgId !== authOrgId) {
    return <Navigate to={`/form/${authOrgId}`} replace />
  }

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch {
      toast.error('Erro ao encerrar sessão')
    }
  }

  const activeTabConfig = TAB_CONFIG.find((t) => t.key === store.activeTab) ?? TAB_CONFIG[0]

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <ProgressBar tenantId={tenantId} />
      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="bg-primary flex w-full flex-col text-white md:max-w-[300px] md:min-w-[220px]">
          <div className="border-primary-800 hidden border-b px-4 py-4 md:block">
            <span className="text-base font-semibold">Roteiro Unificado</span>
          </div>
          <div className="flex-1 p-3">
            <TabNavigation tenantId={tenantId} />
          </div>
          <div className="border-primary-800 mt-auto hidden border-t p-3 md:block">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-primary-800 w-full justify-start text-white"
              onClick={handleSignOut}
            >
              Sair
            </Button>
          </div>
        </aside>
        <main className="flex-1 p-4 md:p-6">
          <h1 className="text-xl font-semibold text-gray-900">{activeTabConfig.label}</h1>
          {renderSection(store.activeTab, tenantId)}
        </main>
      </div>
    </div>
  )
}
