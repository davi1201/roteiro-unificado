import { z } from 'zod'

export const torreClassificacaoSchema = z.object({
  // Selects — Classificação da empresa
  classificacaoFinal: z.enum(['t360-a', 't360-b', 't360-c', 't360-d', 't360-e']).optional(),
  abordagemRecomendada: z
    .enum([
      'integracao-sienge',
      'hibrida-sienge-bi',
      'ativacao-dados',
      'reconciliacao-bi',
      'projeto-preparatorio',
    ])
    .optional(),

  // Textareas livres — Classificação e plano macro
  justificativa: z.string().optional(),
  fase1: z.string().optional(),
  fase2: z.string().optional(),
  foraEscopo: z.string().optional(),
  riscos: z.string().optional(),

  // Checkbox group — Evidências essenciais a solicitar (9 opções)
  evidenciasSolicitar: z
    .array(
      z.enum([
        'modulos-contratados',
        'confirmacao-api-bulk',
        'relatorios-diretoria',
        'bi-atual',
        'planilhas-criticas',
        'cnpjs-obras',
        'fluxo-caixa',
        'orcamento-realizado',
        'responsaveis-area',
      ])
    )
    .optional(),

  // Textarea final
  proximosPassos: z.string().optional(),
})

export type TorreClassificacaoData = z.infer<typeof torreClassificacaoSchema>

/**
 * Nenhum campo é obrigatório nesta aba — todos os campos HTML são opcionais.
 * Exportado para o cálculo de completeness no useFormSection.
 */
export const TORRE_CLASSIFICACAO_REQUIRED_COUNT = 0
