import { z } from 'zod'

export const torreAcessoSchema = z.object({
  // Selects — Ambiente e acessos
  ambienteSienge: z.enum(['nuvem-data-center', 'local', 'hibrido', 'confirmar']).optional(),
  subdominioTenant: z.enum(['sim', 'nao', 'confirmar']).optional(),
  usuarioLeitura: z.enum(['possivel', 'nao-possivel', 'confirmar']).optional(),
  ambienteHomologacao: z.enum(['sim', 'nao', 'confirmar']).optional(),
  apiRest: z.enum(['disponivel', 'nao-disponivel', 'confirmar', 'parcial']).optional(),
  bulkData: z.enum(['disponivel', 'nao-disponivel', 'confirmar', 'parcial']).optional(),
  pacoteLimiteApi: z.enum(['sim', 'nao', 'confirmar-sienge-ti']).optional(),
  webhooksRelevantes: z.enum(['sim', 'nao', 'confirmar', 'nao-aplicavel-fase-1']).optional(),

  // Textareas — Fontes e restrições
  outrasFontes: z.string().optional(),
  restricoesSeguranca: z.string().optional(),

  // Checkbox group — Se todos os dados estiverem no Sienge (6 opções)
  seTudoNoSienge: z
    .array(
      z.enum([
        'modulos-alimentados',
        'empresas-obras-centros',
        'historico-minimo',
        'api-bulk-autorizado',
        'limites-compativeis',
        'regras-validadas',
      ])
    )
    .optional(),

  // Textarea final
  observacaoTecnica: z.string().optional(),
})

export type TorreAcessoData = z.infer<typeof torreAcessoSchema>

/**
 * Nenhum campo é obrigatório nesta aba — todos os campos HTML são opcionais.
 * Exportado para o cálculo de completeness no useFormSection.
 */
export const TORRE_ACESSO_REQUIRED_COUNT = 0
