import { resetPasswordSchema } from './resetPassword'

describe('resetPasswordSchema', () => {
  it('rejects password shorter than 8 characters', () => {
    const result = resetPasswordSchema.safeParse({ password: '1234567' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const passwordError = result.error.issues.find((i) => i.path.includes('password'))
      expect(passwordError).toBeDefined()
    }
  })

  it('accepts password with exactly 8 characters', () => {
    const result = resetPasswordSchema.safeParse({ password: '12345678' })
    expect(result.success).toBe(true)
  })

  it('accepts password longer than 8 characters', () => {
    const result = resetPasswordSchema.safeParse({ password: 'senha_super_segura' })
    expect(result.success).toBe(true)
  })

  it('rejects empty password', () => {
    const result = resetPasswordSchema.safeParse({ password: '' })
    expect(result.success).toBe(false)
  })

  it('rejects missing password field', () => {
    const result = resetPasswordSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
