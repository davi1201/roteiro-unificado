import { z } from 'zod'

/**
 * Schema flat para a aba Hab. Classificação (padrão torre-classificacao.ts).
 * Todos os campos são opcionais — o consultor preenche o que faz sentido
 * para o diagnóstico da construtora.
 *
 * Campo-chave: `classificacaoFinal` — alimenta `calculateReadiness` em src/lib/readiness.ts.
 * Os slugs lowercase ('hab-a'..'hab-e') são mapeados pelo `habMap` em readiness.ts para
 * os labels de display 'HAB-A'..'HAB-E'. Os slugs DEVEM ser lowercase para o mapeamento funcionar.
 *
 * Fonte de verdade: roteiro_unificado_completo_torre360_habilitacoes_nda_piloto_sinduscon_v2.html
 * aba id="h_fechamento".
 */

export const habClassificacaoSchema = z.object({
  // Selects — Síntese para planejamento
  classificacaoFinal: z.enum(['hab-a', 'hab-b', 'hab-c', 'hab-d', 'hab-e']).optional(),
  abordagemRecomendada: z
    .enum([
      'implantar-direto',
      'implantar-carga-assistida',
      'ativar-repositorio-responsaveis',
      'comecar-dossie-especifico',
      'fase-preparatoria',
    ])
    .optional(),
  escopoInicialSugerido: z
    .enum([
      'empresa-cnpj',
      'obra-empreendimento',
      'financiamento',
      'licitacao',
      'contrato-privado-homologacao',
      'fiscalizacao-auditoria',
      'misto-reduzido',
    ])
    .optional(),
  complexidadePreco: z.enum(['baixa', 'media', 'alta', 'critica']).optional(),

  // Textareas — Plano macro
  fase1: z.string().optional(),
  fase2: z.string().optional(),
  riscosPrincipais: z.string().optional(),
  evidenciasEssenciais: z.string().optional(),
  observacoesFinais: z.string().optional(),
})

export type HabClassificacaoData = z.infer<typeof habClassificacaoSchema>

/**
 * Número de campos obrigatórios para cálculo de completeness.
 * Todos os campos desta aba são opcionais (diagnóstico, não cadastro).
 */
export const HAB_CLASSIFICACAO_REQUIRED_COUNT = 0
