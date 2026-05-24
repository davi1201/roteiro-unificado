import { describe, it, expect, beforeEach } from 'vitest'
import { createFormStore, TabKey } from './formStore'

describe('formStore — hydrateFromAssessment', () => {
  let store: ReturnType<typeof createFormStore>

  beforeEach(() => {
    // Usa um tenantId único por teste para isolar instâncias do Map
    store = createFormStore(`test-hydrate-${Math.random().toString(36).slice(2)}`)
  })

  it('hydrateFromAssessment(null) não modifica sectionData', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.getState().hydrateFromAssessment(null as any)
    expect(store.getState().sectionData).toEqual({})
  })

  it('hydrateFromAssessment({}) não adiciona entradas a sectionData', () => {
    store.getState().hydrateFromAssessment({})
    expect(store.getState().sectionData).toEqual({})
  })

  it('hydrateFromAssessment com tab válida popula sectionData corretamente', () => {
    store.getState().hydrateFromAssessment({ identificacao: { empresa: 'Acme' } })
    expect(store.getState().sectionData[TabKey.Identificacao]).toEqual({ empresa: 'Acme' })
  })

  it('hydrateFromAssessment com chave inválida não modifica sectionData', () => {
    store.getState().hydrateFromAssessment({ 'chave-invalida': { x: 1 } })
    expect(store.getState().sectionData).toEqual({})
  })

  it('hydrateFromAssessment ignora valores não-objeto (string)', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.getState().hydrateFromAssessment({ identificacao: 'string' as any })
    expect(store.getState().sectionData[TabKey.Identificacao]).toBeUndefined()
  })

  it('hydrateFromAssessment não afeta tabs não incluídas no payload', () => {
    store.getState().updateSection(TabKey.Nda, { aceitaTermos: true })
    store.getState().hydrateFromAssessment({ identificacao: { empresa: 'Acme' } })
    // Nda deve permanecer intacta
    expect(store.getState().sectionData[TabKey.Nda]).toEqual({ aceitaTermos: true })
    // Identificacao deve ter sido hidratada
    expect(store.getState().sectionData[TabKey.Identificacao]).toEqual({ empresa: 'Acme' })
  })
})
