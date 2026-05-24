import { z } from 'zod'

export const identificacaoSchema = z.object({
  empresa: z.string().trim().min(2, 'Mínimo 2 caracteres'),
  cnpj: z
    .string()
    .min(1, 'Campo obrigatório')
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'Formato inválido'),
  cidadeUf: z.string().max(100, 'Máximo 100 caracteres').optional(),
  dataReuniao: z.string().optional(),
  participantes: z.string().optional(),
  sponsorPiloto: z.string().optional(),
  responsavelSienge: z.string().optional(),
  responsavelHabilitacoes: z.string().optional(),
  quemConduzComercial: z.string().optional(),
  numCnpjsEscopo: z.string().optional(),
  numObrasAtivas: z.string().optional(),
  prioridadeTorre360: z.string().optional(),
  prioridadeHabilitacoes: z.string().optional(),
})

export type IdentificacaoData = z.infer<typeof identificacaoSchema>

export const IDENTIFICACAO_REQUIRED_COUNT = 2
