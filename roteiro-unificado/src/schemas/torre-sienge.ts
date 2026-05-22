import { z } from 'zod'

/**
 * Schema reutilizável para um módulo Sienge.
 * Cada módulo tem 5 colunas de avaliação: contratado, usoReal,
 * confiancaDado, controleParalelo e observacoes.
 * Todos os campos são .optional() para permitir defaultValues vazio
 * na primeira montagem (RESEARCH §Armadilha 4).
 */
const moduleSchema = z.object({
  contratado: z.enum(['sim', 'nao', 'nao-sabe', 'nao-aplicavel']).optional(),
  usoReal: z.enum(['total', 'parcial', 'baixo', 'nao-usa']).optional(),
  confiancaDado: z.enum(['alta', 'media', 'baixa', 'nao-confiavel']).optional(),
  controleParalelo: z.enum(['nao', 'excel', 'bi', 'outro', 'informal']).optional(),
  observacoes: z.string().optional(),
})

/**
 * Schema aninhado para a aba Torre Sienge.
 * Usa estrutura modules.{moduleSlug}.{column} (NÃO 60 campos flat).
 * O objeto modules é .optional() para evitar erros na montagem inicial.
 * RESEARCH §Armadilha 1: schema aninhado com moduleSchema reutilizado 12x.
 */
export const torreSiengeSchema = z.object({
  modules: z
    .object({
      cadastros: moduleSchema,
      financeiro: moduleSchema,
      inadimplencia: moduleSchema,
      orcamento: moduleSchema,
      planejamento: moduleSchema,
      medicoes: moduleSchema,
      compras: moduleSchema,
      comercial: moduleSchema,
      unidades: moduleSchema,
      contabilidade: moduleSchema,
      posObra: moduleSchema,
      bi: moduleSchema,
    })
    .optional(),
})

export type TorreSiengeData = z.infer<typeof torreSiengeSchema>

/**
 * Número de campos obrigatórios para cálculo de completeness.
 * Todos os campos desta aba são opcionais (diagnóstico, não cadastro).
 */
export const TORRE_SIENGE_REQUIRED_COUNT = 0

/**
 * Os 12 módulos Sienge em ordem do HTML de referência.
 * Cada item tem slug (chave do schema aninhado) e label (exibição ao usuário).
 * Exportado como const para preservar a tipagem literal dos slugs.
 */
export const SIENGE_MODULES = [
  {
    slug: 'cadastros',
    label: 'Cadastros: empresas, obras, empreendimentos e centros de custo',
  },
  {
    slug: 'financeiro',
    label: 'Financeiro: contas a pagar, receber, caixa e bancos',
  },
  {
    slug: 'inadimplencia',
    label: 'Inadimplência e carteira de recebíveis',
  },
  {
    slug: 'orcamento',
    label: 'Orçamento de obra e orçado x realizado',
  },
  {
    slug: 'planejamento',
    label: 'Planejamento, cronograma e avanço físico',
  },
  {
    slug: 'medicoes',
    label: 'Medições e contratos de empreiteiros',
  },
  {
    slug: 'compras',
    label: 'Compras, suprimentos e custo comprometido',
  },
  {
    slug: 'comercial',
    label: 'Comercial: vendas, reservas e contratos',
  },
  {
    slug: 'unidades',
    label: 'Unidades, estoque imobiliário e tabela de preços',
  },
  {
    slug: 'contabilidade',
    label: 'Contabilidade/fiscal e visão societária',
  },
  {
    slug: 'posObra',
    label: 'Pós-obra, assistência técnica e qualidade',
  },
  {
    slug: 'bi',
    label: 'BI, planilhas de diretoria e controles paralelos',
  },
] as const

export type SiengeModuleSlug = (typeof SIENGE_MODULES)[number]['slug']
