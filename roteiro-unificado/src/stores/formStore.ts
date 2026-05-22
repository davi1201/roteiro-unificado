import { create, useStore } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { StoreApi } from 'zustand'

/**
 * Enum com as 10 abas do formulário de avaliação.
 * Os valores string matcheiam os URL hashes (#torre-decisao, etc.).
 * Exportado de formStore.ts para ser reutilizado em tabConfig.ts e demais componentes.
 */
export enum TabKey {
  Identificacao = 'identificacao',
  TorreDecisao = 'torre-decisao',
  TorreSienge = 'torre-sienge',
  TorreAcesso = 'torre-acesso',
  TorreClassificacao = 'torre-classificacao',
  HabVenda = 'hab-venda',
  HabRepositorios = 'hab-repositorios',
  HabResponsaveis = 'hab-responsaveis',
  HabClassificacao = 'hab-classificacao',
  Nda = 'nda',
}

/**
 * Store de progresso do formulário de avaliação.
 *
 * A persist key é namespaceada por tenantId (`form-progress-${tenantId}`)
 * para garantir isolamento entre empresas que usem o mesmo browser —
 * evita cross-tenant leakage quando um usuário alterna entre contas.
 *
 * Storage split (D-03):
 * - localStorage (via persist): currentStep, completedSteps, activeTab, visitedTabs
 * - sessionStorage (via subscriber manual): sectionData — dados de rascunho não persistem
 *   após fechar a aba; Supabase é a persistência real (Phase 8).
 *
 * Use `useFormStore(tenantId)` em componentes React.
 * Use `createFormStore(tenantId)` quando precisar do StoreApi diretamente.
 */

interface FormState {
  currentStep: number
  completedSteps: Set<number>
  activeTab: TabKey
  visitedTabs: Set<TabKey>
  sectionData: Partial<Record<TabKey, Record<string, unknown>>>
}

interface FormActions {
  setCurrentStep: (step: number) => void
  markStepComplete: (step: number) => void
  markStepIncomplete: (step: number) => void
  reset: () => void
  setActiveTab: (tab: TabKey) => void
  markTabVisited: (tab: TabKey) => void
  updateSection: (tab: TabKey, data: Record<string, unknown>) => void
  resetForm: () => void
}

type FormStore = FormState & FormActions

const initialState: FormState = {
  currentStep: 0,
  completedSteps: new Set<number>(),
  activeTab: TabKey.Identificacao,
  visitedTabs: new Set<TabKey>(),
  sectionData: {},
}

const storesByTenant = new Map<string, StoreApi<FormStore>>()

/**
 * Factory que cria (ou retorna a instância memoizada de) uma FormStore
 * para o tenant especificado. A persist key é `form-progress-${tenantId}`.
 */
export function createFormStore(tenantId: string): StoreApi<FormStore> {
  if (!storesByTenant.has(tenantId)) {
    const store = create<FormStore>()(
      persist(
        (set) => ({
          ...initialState,

          setCurrentStep: (step) => set({ currentStep: step }),

          markStepComplete: (step) =>
            set((state) => ({
              completedSteps: new Set([...state.completedSteps, step]),
            })),

          markStepIncomplete: (step) =>
            set((state) => {
              const next = new Set(state.completedSteps)
              next.delete(step)
              return { completedSteps: next }
            }),

          reset: () => set({ ...initialState, completedSteps: new Set<number>() }),

          setActiveTab: (tab) => set({ activeTab: tab }),

          markTabVisited: (tab) =>
            set((state) => ({ visitedTabs: new Set([...state.visitedTabs, tab]) })),

          updateSection: (tab, data) =>
            set((state) => ({ sectionData: { ...state.sectionData, [tab]: data } })),

          resetForm: () =>
            set({
              ...initialState,
              completedSteps: new Set<number>(),
              visitedTabs: new Set<TabKey>(),
              sectionData: {},
            }),
        }),
        {
          name: `form-progress-${tenantId}`,
          storage: createJSONStorage(() => localStorage),

          // Serializa Sets como Arrays para localStorage (JSON não suporta Set).
          // sectionData é EXCLUÍDO aqui — persiste apenas em sessionStorage via subscriber manual.
          partialize: (state) => ({
            currentStep: state.currentStep,
            completedSteps: [...state.completedSteps],
            activeTab: state.activeTab,
            visitedTabs: [...state.visitedTabs],
          }),

          // Reconverte Arrays de volta para Sets ao reidratar do localStorage
          onRehydrateStorage: () => (state) => {
            if (state) {
              state.completedSteps = new Set(state.completedSteps as unknown as number[])
              state.visitedTabs = new Set(state.visitedTabs as unknown as TabKey[])
            }
          },
        }
      )
    )

    // Subscriber manual para sessionStorage — persiste sectionData por sessão de aba.
    // A chave é namespaceada por tenantId para evitar cross-tenant leakage.
    const SESSION_KEY = `form-data-${tenantId}`

    // Hidratação inicial: restaura sectionData do sessionStorage ao criar a store
    try {
      const saved = sessionStorage.getItem(SESSION_KEY)
      if (saved) {
        store.setState({ sectionData: JSON.parse(saved) })
      }
    } catch {}

    // Subscriber: persiste sectionData no sessionStorage sempre que mudar
    store.subscribe((state, prev) => {
      if (state.sectionData !== prev.sectionData) {
        try {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(state.sectionData))
        } catch {}
      }
    })

    storesByTenant.set(tenantId, store)
  }
  return storesByTenant.get(tenantId)!
}

/**
 * Hook React para acessar a FormStore do tenant especificado.
 * Memoiza a store por tenantId — chamadas repetidas com o mesmo tenantId
 * retornam sempre a mesma instância de store.
 */
export function useFormStore(tenantId: string): FormStore {
  return useStore(createFormStore(tenantId))
}
