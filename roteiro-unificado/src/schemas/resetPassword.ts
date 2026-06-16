import { z } from 'zod'

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
})

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
