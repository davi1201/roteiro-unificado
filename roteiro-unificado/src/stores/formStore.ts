import { create, useStore } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { StoreApi } from 'zustand'

/**
 * Store de progresso do formulário de avaliação.
 *
 * A persist key é namespaceada por tenantId (`form-progress-${tenantId}`)
 * para garantir isolamento entre empresas que usem o mesmo browser —
 * evita cross-tenant leakage quando um usuário alterna entre contas.
 *
 * Use `useFormStore(tenantId)` em componentes React.
 * Use `createFormStore(tenantId)` quando precisar do StoreApi diretamente.
 */

interface FormState {
  currentStep: number
  completedSteps: Set<number>
}

interface FormActions {
  setCurrentStep: (step: number) => void
  markStepComplete: (step: number) => void
  markStepIncomplete: (step: number) => void
  reset: () => void
}

type FormStore = FormState & FormActions

const initialState: FormState = {
  currentStep: 0,
  completedSteps: new Set<number>(),
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
        }),
        {
          name: `form-progress-${tenantId}`,
          storage: createJSONStorage(() => localStorage),

          // Serializa Set como Array para localStorage (JSON não suporta Set)
          partialize: (state) => ({
            currentStep: state.currentStep,
            completedSteps: [...state.completedSteps],
          }),

          // Reconverte Array de volta para Set ao reidratar do localStorage
          onRehydrateStorage: () => (state) => {
            if (state) {
              state.completedSteps = new Set(state.completedSteps as unknown as number[])
            }
          },
        }
      )
    )
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
