import { describe, it, expect, beforeEach } from 'vitest'
import { createFormStore, clearFormStore, TabKey } from './formStore'

describe('formStore — lastSavedAt', () => {
  let tenantId: string

  beforeEach(() => {
    tenantId = `test-lastsaved-${Math.random().toString(36).slice(2)}`
  })

  it('Test 1: novo store tem lastSavedAt === null por default', () => {
    const store = createFormStore(tenantId)
    expect(store.getState().lastSavedAt).toBeNull()
  })

  it('Test 2: setLastSaved(new Date()) atualiza lastSavedAt para a data passada', () => {
    const store = createFormStore(tenantId)
    const date = new Date('2026-05-24')
    store.getState().setLastSaved(date)
    expect(store.getState().lastSavedAt).toBe(date)
  })

  it('Test 3: setLastSaved(null) reseta para null', () => {
    const store = createFormStore(tenantId)
    store.getState().setLastSaved(new Date())
    store.getState().setLastSaved(null)
    expect(store.getState().lastSavedAt).toBeNull()
  })

  it('Test 4: lastSavedAt NÃO é persistido em localStorage', () => {
    const store = createFormStore(tenantId)
    store.getState().setLastSaved(new Date('2026-05-24'))
    const raw = localStorage.getItem(`form-progress-${tenantId}`)
    expect(raw).toBeDefined()
    const parsed = JSON.parse(raw ?? '{}')
    expect(Object.prototype.hasOwnProperty.call(parsed.state ?? parsed, 'lastSavedAt')).toBe(false)
    clearFormStore(tenantId)
  })
})

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
