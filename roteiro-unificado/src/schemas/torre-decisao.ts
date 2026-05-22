import { z } from 'zod'

/**
 * Schema Zod para a aba Torre Decisão do formulário de avaliação Torre 360.
 *
 * Todos os campos são `.optional()` porque o HTML de referência
 * (id="t_decisao") não marca nenhum campo como required (CONTEXT.md A3 [ASSUMED]).
 *
 * Enums usam slugs — nunca labels acentuadas (RESEARCH §Armadilha 5).
 * Campo condicional qualBI é z.string().optional() (RESEARCH §Armadilha 3).
 */

// --- Selects ---

export const torreDecisaoSchema = z.object({
  /** Frequência da reunião de gestão */
  reuniaoGestao: z
    .enum(['semanal', 'quinzenal', 'mensal', 'eventual', 'nao-estruturada'])
    .optional(),

  /** Canal predominante de entrega da informação à diretoria */
  comoInformacaoChega: z
    .enum(['bi-dashboard', 'excel', 'relatorios-sienge', 'pdf', 'email-whatsapp', 'misto'])
    .optional(),

  /** Existência de ferramenta de BI ativa */
  existeBI: z.enum(['sim-power-bi', 'sim-outra', 'em-implantacao', 'nao']).optional(),

  /** Nível gerencial de maturidade da empresa (G1 a G5) */
  nivelGerencial: z.enum(['g1', 'g2', 'g3', 'g4', 'g5']).optional(),

  // --- Campo condicional (FORM-06) ---

  /**
   * Nome da ferramenta de BI utilizada.
   * Visível apenas quando existeBI === 'sim-power-bi' ou 'sim-outra'.
   * Deve ser z.string().optional() para compatibilidade com ConditionalField + unregister.
   */
  qualBI: z.string().optional(),

  // --- Inputs e textareas livres ---

  /** Responsável pela preparação das informações de gestão */
  quemPreparaInfo: z.string().optional(),

  /** Relatórios e dashboards utilizados pela diretoria */
  relatoriosDiretoria: z.string().optional(),

  /** Números questionados ou com divergências identificadas */
  numerosQuestionados: z.string().optional(),

  /** Observações gerenciais essenciais para o projeto */
  observacoesGerenciais: z.string().optional(),

  // --- Checkboxes (array) ---

  /**
   * Decisões prioritárias que a Torre 360 deve melhorar primeiro.
   * 9 opções com slugs correspondentes às labels do HTML de referência.
   */
  decisoesMelhorar: z
    .array(
      z.enum([
        'caixa',
        'contas',
        'inadimplencia',
        'margem',
        'orcado-realizado',
        'avanco-fisico',
        'compras-criticas',
        'vendas-estoque',
        'pos-obra',
      ])
    )
    .optional(),
})

export type TorreDecisaoData = z.infer<typeof torreDecisaoSchema>

/**
 * Contagem de campos obrigatórios nesta aba.
 * Zero porque o HTML de referência não marca nenhum campo como required.
 * Usado por useFormSection para cálculo de completeness.
 */
export const TORRE_DECISAO_REQUIRED_COUNT = 0
