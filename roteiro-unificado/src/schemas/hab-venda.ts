import { z } from 'zod'

/**
 * Schema de matriz aninhada para a aba Hab. Venda (padrão torreSiengeSchema).
 * Cada cenário de habilitação é representado como `scenarios.{slug}.{coluna}`.
 * O objeto `scenarios` é .optional() para evitar erros na montagem inicial com defaultValues vazio.
 *
 * Array de slugs+labels exportado: HAB_SCENARIOS (10 entradas).
 * Tipo de slug derivado: HabScenarioSlug.
 *
 * Fonte de verdade: roteiro_unificado_completo_torre360_habilitacoes_nda_piloto_sinduscon_v2.html
 * linhas 626-637 (array scenarioData) + aba id="h_venda".
 */

/**
 * Schema reutilizável para um cenário de habilitação de venda.
 * Cada cenário tem 5 colunas de avaliação, todas opcionais.
 */
const scenarioSchema = z.object({
  acontece: z.enum(['sim', 'nao', 'parcial', 'nao-sabe']).optional(),
  importancia: z.enum(['alta', 'media', 'baixa', 'eventual']).optional(),
  quemConduz: z.string().optional(),
  principalDificuldade: z.string().optional(),
  observacoes: z.string().optional(),
})

export const habVendaSchema = z.object({
  // Campos flat — Canais e situações comerciais
  principalFormaVenda: z
    .enum([
      'venda-propria',
      'contratos-privados',
      'licitacoes',
      'obras-terceiros',
      'financiamento-habitacional',
      'misto',
    ])
    .optional(),
  quemPedeDocumentos: z
    .enum([
      'bancos',
      'clientes-privados',
      'orgaos-publicos',
      'seguradoras',
      'cartorios',
      'investidores',
      'misto',
    ])
    .optional(),
  prazoTipico: z
    .enum(['mesmo-dia', '1-3-dias', 'ate-1-semana', 'mais-1-semana', 'sem-padrao'])
    .optional(),
  perdeuOportunidade: z.enum(['sim', 'nao', 'quase', 'nao-sabe']).optional(),
  principaisExigencias: z.string().optional(),
  ondeCostumaTravar: z.string().optional(),

  // Matriz de cenários de habilitação — 10 cenários, cada um com 5 campos
  scenarios: z
    .object({
      'venda-propria': scenarioSchema,
      'contratos-privados': scenarioSchema,
      'financiamento-habitacional': scenarioSchema,
      'financiamento-investimento': scenarioSchema,
      licitacoes: scenarioSchema,
      homologacao: scenarioSchema,
      'programas-convenios': scenarioSchema,
      'seguros-garantias': scenarioSchema,
      fiscalizacoes: scenarioSchema,
      'abertura-obra': scenarioSchema,
    })
    .optional(),
})

export type HabVendaData = z.infer<typeof habVendaSchema>

/**
 * Número de campos obrigatórios para cálculo de completeness.
 * Todos os campos desta aba são opcionais (diagnóstico, não cadastro).
 */
export const HAB_VENDA_REQUIRED_COUNT = 0

/**
 * Os 10 cenários de habilitação de venda em ordem do HTML de referência.
 * Cada item tem slug (chave do schema aninhado) e label (exibição ao usuário).
 * Exportado como const para preservar a tipagem literal dos slugs.
 *
 * Fonte: script JavaScript no HTML de referência (linhas 626-637), array scenarioData.
 */
export const HAB_SCENARIOS = [
  { slug: 'venda-propria', label: 'Venda própria de unidades / incorporação' },
  { slug: 'contratos-privados', label: 'Contratos privados com clientes ou investidores' },
  { slug: 'financiamento-habitacional', label: 'Financiamento habitacional' },
  { slug: 'financiamento-investimento', label: 'Financiamento para investimento / obra' },
  { slug: 'licitacoes', label: 'Licitações públicas' },
  { slug: 'homologacao', label: 'Homologação como fornecedor' },
  { slug: 'programas-convenios', label: 'Programas, convênios ou parcerias institucionais' },
  { slug: 'seguros-garantias', label: 'Seguros, garantias e cauções' },
  { slug: 'fiscalizacoes', label: 'Fiscalizações, auditorias ou exigências de órgãos' },
  { slug: 'abertura-obra', label: 'Abertura ou regularização de obra/empreendimento' },
] as const

export type HabScenarioSlug = (typeof HAB_SCENARIOS)[number]['slug']
