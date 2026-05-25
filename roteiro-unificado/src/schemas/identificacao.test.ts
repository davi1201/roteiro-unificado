import { identificacaoSchema } from './identificacao'

describe('identificacaoSchema', () => {
  it('fails validation when empresa is missing (required)', () => {
    const result = identificacaoSchema.safeParse({
      cnpj: '12.345.678/0001-90',
    })
    expect(result.success).toBe(false)
  })

  it('fails validation when empresa is too short (less than 2 chars)', () => {
    const result = identificacaoSchema.safeParse({
      empresa: 'A',
      cnpj: '12.345.678/0001-90',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const empresaError = result.error.issues.find((i) => i.path.includes('empresa'))
      expect(empresaError).toBeDefined()
    }
  })

  it('passes validation when empresa has at least 2 chars', () => {
    const result = identificacaoSchema.safeParse({
      empresa: 'AB',
      cnpj: '12.345.678/0001-90',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid CNPJ format xx.xxx.xxx/xxxx-xx', () => {
    const result = identificacaoSchema.safeParse({
      empresa: 'Construtora XYZ',
      cnpj: '12.345.678/0001-90',
    })
    expect(result.success).toBe(true)
  })

  it('rejects CNPJ without formatting (raw digits only)', () => {
    const result = identificacaoSchema.safeParse({
      empresa: 'Construtora XYZ',
      cnpj: '12345678000190',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const cnpjError = result.error.issues.find((i) => i.path.includes('cnpj'))
      expect(cnpjError).toBeDefined()
    }
  })

  it('rejects CNPJ with incorrect separator pattern', () => {
    const result = identificacaoSchema.safeParse({
      empresa: 'Construtora XYZ',
      cnpj: '12-345-678/0001-90',
    })
    expect(result.success).toBe(false)
  })

  it('all non-required fields are optional (passes with only empresa + cnpj)', () => {
    const result = identificacaoSchema.safeParse({
      empresa: 'Empresa Teste',
      cnpj: '99.999.999/0001-99',
    })
    expect(result.success).toBe(true)
  })
})
