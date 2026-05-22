import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * Store de progresso do formulário de avaliação.
 *
 * Persiste o step atual e os steps concluídos em localStorage.
 *
 * ⚠️  FASE 3 — Multi-tenant: a chave 'form-progress' deve ser
 * namespaceada por tenantId para evitar vazamento entre empresas
 * que usem o mesmo browser. Substituir por:
 *   name: `form-progress-${tenantId}`
 * após implementar o contexto de autenticação na Fase 3.
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

export const useFormStore = create<FormStore>()(
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
      name: 'form-progress',
      // ⚠️  Fase 3: substituir 'form-progress' por `form-progress-${tenantId}`
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
