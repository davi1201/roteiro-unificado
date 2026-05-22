import { z } from 'zod'

export const createOrgSchema = z.object({
  name: z.string().trim().min(1, 'O nome é obrigatório'),
  cnpj: z
    .string()
    .min(1, 'O CNPJ é obrigatório')
    .regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos numéricos'),
})

export type CreateOrgFormData = z.infer<typeof createOrgSchema>
