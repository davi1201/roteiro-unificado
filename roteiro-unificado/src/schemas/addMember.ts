import { z } from 'zod'

export const addMemberSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Insira um email válido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
})

export type AddMemberFormData = z.infer<typeof addMemberSchema>
