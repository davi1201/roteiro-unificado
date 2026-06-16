import { changePasswordSchema } from './changePassword'

describe('changePasswordSchema', () => {
  it('accepts valid data with matching passwords', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'abc',
      newPassword: 'senha123',
      confirmPassword: 'senha123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects when newPassword and confirmPassword do not match', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'abc',
      newPassword: 'senha123',
      confirmPassword: 'senha999',
    })
    expect(result.success).toBe(false)
  })

  it('places refine error on confirmPassword path when passwords do not match', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'abc',
      newPassword: 'senha123',
      confirmPassword: 'senha999',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const confirmError = result.error.issues.find((i) => i.path.includes('confirmPassword'))
      expect(confirmError).toBeDefined()
      expect(confirmError?.message).toBe('As senhas não coincidem')
    }
  })

  it('rejects empty currentPassword', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: '',
      newPassword: 'senha123',
      confirmPassword: 'senha123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const currentPasswordError = result.error.issues.find((i) =>
        i.path.includes('currentPassword')
      )
      expect(currentPasswordError).toBeDefined()
    }
  })

  it('rejects newPassword shorter than 8 characters', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'abc',
      newPassword: 'curta',
      confirmPassword: 'curta',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const newPasswordError = result.error.issues.find((i) => i.path.includes('newPassword'))
      expect(newPasswordError).toBeDefined()
    }
  })

  it('rejects missing confirmPassword', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'abc',
      newPassword: 'senha123',
    })
    expect(result.success).toBe(false)
  })
})
