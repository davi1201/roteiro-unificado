import { describe, it, expect } from 'vitest'
import { calculateReadiness } from './readiness'
import { TabKey } from '@/stores/formStore'

describe('calculateReadiness', () => {
  it('retorna null para gerencial quando sectionData está vazio', () => {
    const result = calculateReadiness({})

    expect(result.gerencial).toBeNull()
    expect(result.habilitacoes).toBeNull()
    expect(result.ndaAceito).toBe(false)
  })

  it('retorna G1 quando critérios mínimos de gestão estão presentes', () => {
    const sectionData = {
      [TabKey.TorreDecisao]: { nivelGerencial: 'g1' },
    }

    const result = calculateReadiness(sectionData)

    expect(result.gerencial).toBe('G1')
  })

  it('retorna HAB-A quando critérios de habilitação estão presentes', () => {
    const sectionData = {
      [TabKey.HabClassificacao]: { classificacaoFinal: 'hab-a' },
    }

    const result = calculateReadiness(sectionData)

    expect(result.habilitacoes).toBe('HAB-A')
  })

  it('ndaAceito é false quando campo nda não está preenchido', () => {
    // sectionData with NDA section present but aceitaTermos not set to true
    const sectionData = {
      [TabKey.Nda]: { aceitaTermos: false },
    }

    const result = calculateReadiness(sectionData)

    expect(result.ndaAceito).toBe(false)
  })
})
