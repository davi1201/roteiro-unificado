import { torreDecisaoSchema } from './torre-decisao'

describe('torreDecisaoSchema', () => {
  it('passes with empty object (all fields are optional)', () => {
    const result = torreDecisaoSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('qualBI is optional — passes when qualBI is missing', () => {
    const result = torreDecisaoSchema.safeParse({
      existeBI: 'sim-power-bi',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.qualBI).toBeUndefined()
    }
  })

  it('existeBI accepts valid enum value: sim-power-bi', () => {
    const result = torreDecisaoSchema.safeParse({ existeBI: 'sim-power-bi' })
    expect(result.success).toBe(true)
  })

  it('existeBI accepts valid enum value: sim-outra', () => {
    const result = torreDecisaoSchema.safeParse({ existeBI: 'sim-outra' })
    expect(result.success).toBe(true)
  })

  it('existeBI accepts valid enum value: em-implantacao', () => {
    const result = torreDecisaoSchema.safeParse({ existeBI: 'em-implantacao' })
    expect(result.success).toBe(true)
  })

  it('existeBI accepts valid enum value: nao', () => {
    const result = torreDecisaoSchema.safeParse({ existeBI: 'nao' })
    expect(result.success).toBe(true)
  })

  it('existeBI rejects invalid enum value', () => {
    const result = torreDecisaoSchema.safeParse({ existeBI: 'sim-tableau' })
    expect(result.success).toBe(false)
  })

  it('decisoesMelhorar accepts valid array of enum slugs', () => {
    const result = torreDecisaoSchema.safeParse({
      decisoesMelhorar: ['caixa', 'margem', 'vendas-estoque'],
    })
    expect(result.success).toBe(true)
  })

  it('decisoesMelhorar rejects invalid slug in array', () => {
    const result = torreDecisaoSchema.safeParse({
      decisoesMelhorar: ['caixa', 'invalid-slug'],
    })
    expect(result.success).toBe(false)
  })
})
