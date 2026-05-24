import { describe, it, expect } from 'vitest'
import { computeTabStatus, STATUS_TO_COMPLETENESS } from './sectionStatus'

describe('computeTabStatus', () => {
  // Caso 1: formData null → empty
  it('retorna empty quando formData é null', () => {
    expect(computeTabStatus('identificacao', null, 2)).toBe('empty')
  })

  // Caso 2: formData {} → empty (sem chave da aba)
  it('retorna empty quando formData é objeto vazio', () => {
    expect(computeTabStatus('identificacao', {}, 2)).toBe('empty')
  })

  // Caso 3: tabData existe mas é objeto vazio → empty
  it('retorna empty quando objeto da aba está vazio', () => {
    expect(computeTabStatus('identificacao', { identificacao: {} }, 2)).toBe('empty')
  })

  // Caso 4: REQUIRED_COUNT=0 com campos preenchidos → in-progress (nunca complete)
  it('retorna in-progress quando REQUIRED_COUNT=0 (nunca complete)', () => {
    expect(computeTabStatus('torre-decisao', { 'torre-decisao': { campo: 'valor' } }, 0)).toBe(
      'in-progress'
    )
  })

  // Caso 5: identificacao com ≥2 campos preenchidos → complete
  it('retorna complete quando filledCount >= requiredCount', () => {
    expect(
      computeTabStatus(
        'identificacao',
        { identificacao: { empresa: 'X', cnpj: '00.000.000/0001-00' } },
        2
      )
    ).toBe('complete')
  })

  // Caso 6: nda com 1 campo preenchido e REQUIRED_COUNT=1 → complete
  it('retorna complete para nda com 1 campo preenchido e requiredCount=1', () => {
    expect(computeTabStatus('nda', { nda: { nome: 'X' } }, 1)).toBe('complete')
  })

  // Caso 7: nda com valor vazio → in-progress (filledCount=0 < 1)
  it('retorna in-progress quando campo existe mas valor é vazio', () => {
    expect(computeTabStatus('nda', { nda: { extra: '' } }, 1)).toBe('in-progress')
  })

  // Caso 8: chave com hífen acessada corretamente
  it('usa chave com hífen para acessar form_data', () => {
    const formData = { 'torre-decisao': { campo1: 'a', campo2: 'b' } }
    // requiredCount=0 → in-progress (não busca camelCase)
    expect(computeTabStatus('torre-decisao', formData, 0)).toBe('in-progress')
  })

  // Caso 9: valor null não conta como preenchido
  it('não conta valores null como preenchidos', () => {
    expect(
      computeTabStatus('identificacao', { identificacao: { empresa: null, cnpj: null } }, 2)
    ).toBe('in-progress')
  })
})

describe('STATUS_TO_COMPLETENESS', () => {
  it('mapeia empty→0, in-progress→0.5, complete→1', () => {
    expect(STATUS_TO_COMPLETENESS['empty']).toBe(0)
    expect(STATUS_TO_COMPLETENESS['in-progress']).toBe(0.5)
    expect(STATUS_TO_COMPLETENESS['complete']).toBe(1)
  })
})
