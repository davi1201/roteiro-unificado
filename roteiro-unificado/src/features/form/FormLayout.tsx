import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/useAuth'
import { useFormStore, createFormStore, TabKey } from '@/stores/formStore'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog'
import { useAutosave } from '@/hooks/useAutosave'
import { useSubmitAssessment } from './useSubmitAssessment'
import { TAB_CONFIG } from './tabConfig'
import { TabNavigation } from './TabNavigation'
import { ProgressBar } from './ProgressBar'
import { AutosaveIndicator } from './AutosaveIndicator'
import { Button, Spinner } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { IdentificacaoSection } from './sections/IdentificacaoSection'
import { TorreDecisaoSection } from './sections/TorreDecisaoSection'
import { TorreSiengeSection } from './sections/TorreSiengeSection'
import { TorreAcessoSection } from './sections/TorreAcessoSection'
import { TorreClassificacaoSection } from './sections/TorreClassificacaoSection'
import { HabVendaSection } from './sections/HabVendaSection'
import { HabRepositoriosSection } from './sections/HabRepositoriosSection'
import { HabResponsaveisSection } from './sections/HabResponsaveisSection'
import { HabClassificacaoSection } from './sections/HabClassificacaoSection'
import { NdaSection } from './sections/NdaSection'
import { ReadinessClassification } from './ReadinessClassification'

/**
 * Renderiza o Section component correto para a aba ativa.
 * Todas as 10 abas têm cases explícitos após Phase 7. O `default` é fallback
 * defensivo para o tipo enum exhaustivo (não deve ser acionado em runtime).
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
    case TabKey.HabVenda:
      return <HabVendaSection tenantId={tenantId} />
    case TabKey.HabRepositorios:
      return <HabRepositoriosSection tenantId={tenantId} />
    case TabKey.HabResponsaveis:
      return <HabResponsaveisSection tenantId={tenantId} />
    case TabKey.HabClassificacao:
      return <HabClassificacaoSection tenantId={tenantId} />
    case TabKey.Nda:
      return <NdaSection tenantId={tenantId} />
    default:
      return <p className="mt-2 text-sm text-gray-500">Aba desconhecida.</p>
  }
}

/**
 * Shell principal do formulário de avaliação.
 *
 * Integra: sidebar bg-primary + TabNavigation (stepper) + ProgressBar (faixa sticky)
 * + botão Sair + hash sync com URL + cross-tenant guard + autosave + draft hydration
 * + sticky footer "Enviar Avaliação" (aba NDA) + dialog de confirmação de submissão.
 *
 * Todas as 10 abas renderizam seus Section components via switch(activeTab) — Phase 7 completa.
 * Autosave ativo via useAutosave(tenantId) — Phase 8.
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

  // Estado local para controlar abertura do dialog de confirmação de submissão
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)

  // useQuery para carregar draft existente do Supabase (D-01, D-03)
  const draftQuery = useQuery({
    queryKey: ['assessment', 'draft', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('org_id', tenantId)
        .eq('status', 'draft')
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle<Tables<'assessments'>>() // retorna null se não existe draft — sem throw (D-03)
      if (error) throw error
      return data
    },
    staleTime: 30_000, // 30s — evita re-fetch em cada troca de aba (D-01)
    enabled: !!tenantId,
  })

  // Hidratação do store com dados do draft — TanStack v5 sem onSuccess em useQuery
  // CRÍTICO: createFormStore(tenantId).getState() acessa o store sem criar subscription React
  // — evita loop infinito (Armadilha 2 do RESEARCH.md)
  useEffect(() => {
    if (draftQuery.data?.form_data) {
      createFormStore(tenantId).getState().hydrateFromAssessment(draftQuery.data.form_data)
    }
  }, [draftQuery.data, tenantId])

  // Autosave — persiste rascunhos automaticamente com debounce 1500ms
  useAutosave(tenantId)

  // Mutation de submissão formal
  const submitMutation = useSubmitAssessment(tenantId)

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
  const activeIndex = TAB_CONFIG.findIndex((t) => t.key === store.activeTab)
  const prevTab = activeIndex > 0 ? TAB_CONFIG[activeIndex - 1] : null
  const nextTab =
    activeIndex >= 0 && activeIndex < TAB_CONFIG.length - 1 ? TAB_CONFIG[activeIndex + 1] : null
  const isNdaTab = store.activeTab === TabKey.Nda

  function goToTab(key: TabKey) {
    store.setActiveTab(key)
    window.history.replaceState(null, '', `#${key}`)
    store.markTabVisited(key)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar: fixed — mirrors AdminSidebar exactly */}
      <aside className="bg-primary fixed top-0 bottom-0 left-0 z-20 hidden w-[240px] flex-col overflow-y-auto text-white md:flex">
        <div className="border-primary-800 border-b px-4 py-4">
          <span className="text-base font-semibold">Roteiro Unificado</span>
        </div>
        <div className="flex-1 p-3">
          <TabNavigation tenantId={tenantId} />
        </div>
        <div className="border-primary-800 mt-auto border-t p-3">
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
      {/* Content wrapper — offset by sidebar width on desktop (AdminLayout pattern) */}
      <div className="flex min-h-screen flex-col md:ml-[240px]">
        <ProgressBar tenantId={tenantId} />
        {/* Mobile horizontal tab bar — hidden on desktop */}
        <div className="bg-primary overflow-x-auto px-3 py-2 md:hidden">
          <TabNavigation tenantId={tenantId} />
        </div>
        <main className="flex flex-1 flex-col p-6 md:p-8">
          <div className="-mx-6 mb-4 flex h-10 items-center justify-between border-b border-gray-200 bg-white px-6 md:-mx-8 md:px-8">
            <span className="text-[13px] font-semibold text-gray-900">{activeTabConfig.label}</span>
            <AutosaveIndicator lastSaved={store.lastSavedAt} />
          </div>
          <ReadinessClassification tenantId={tenantId} />
          {draftQuery.isLoading ? (
            <div className="mt-4 space-y-4" aria-busy="true">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : draftQuery.isError ? (
            <div
              className="border-g1/30 bg-g1/5 mt-4 flex flex-col items-start gap-3 rounded-md border p-4"
              role="alert"
              aria-live="polite"
            >
              <p className="text-g1 text-sm font-semibold">
                Não foi possível carregar seu rascunho
              </p>
              <p className="text-sm text-gray-700">
                Verifique sua conexão e tente novamente. Seus dados anteriores não foram perdidos.
              </p>
              <Button variant="secondary" size="sm" onClick={() => draftQuery.refetch()}>
                Tentar novamente
              </Button>
            </div>
          ) : (
            renderSection(store.activeTab, tenantId)
          )}

          {/* Footer universal — filho de <main>, não coluna do flex externo */}
          {!draftQuery.isLoading && !draftQuery.isError && (
            <div className="sticky bottom-0 z-10 -mx-6 mt-auto flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 md:-mx-8 md:px-6">
              <Button
                variant="ghost"
                size="md"
                disabled={!prevTab}
                onClick={() => prevTab && goToTab(prevTab.key)}
                aria-label="Aba anterior"
              >
                ← Anterior
              </Button>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline"
                  onClick={() =>
                    toast.info
                      ? toast.info('Rascunho será salvo automaticamente em 1.5s')
                      : toast.success('Salvo automaticamente')
                  }
                  aria-label="Salvar rascunho manualmente"
                >
                  Salvar rascunho
                </Button>
                {isNdaTab ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsSubmitOpen(true)}
                    aria-label="Enviar avaliação"
                  >
                    Enviar Avaliação
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    disabled={!nextTab}
                    onClick={() => nextTab && goToTab(nextTab.key)}
                    aria-label="Próxima aba"
                  >
                    Próxima aba →
                  </Button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Dialog de confirmação de submissão (per UI-SPEC §Dialog de Confirmação) */}
      <Dialog open={isSubmitOpen} onClose={() => setIsSubmitOpen(false)}>
        <DialogHeader>
          <DialogTitle>Enviar Avaliação?</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <DialogDescription>
            Após o envio, esta versão ficará imutável. Você poderá iniciar uma nova revisão a partir
            dela.
          </DialogDescription>
        </DialogContent>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            size="md"
            disabled={submitMutation.isPending}
            onClick={() => setIsSubmitOpen(false)}
          >
            Manter Rascunho
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            isLoading={submitMutation.isPending}
            onClick={() => {
              submitMutation.mutate(undefined, {
                onSuccess: () => setIsSubmitOpen(false),
              })
            }}
          >
            {submitMutation.isPending ? 'Enviando...' : 'Confirmar Envio'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
