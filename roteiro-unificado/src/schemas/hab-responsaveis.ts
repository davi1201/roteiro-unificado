import { z } from 'zod'

/**
 * Schema de matriz aninhada para a aba Hab. Responsáveis (padrão torreSiengeSchema).
 * Cada atividade de responsabilidade é representada como `responsibilities.{slug}.{coluna}`.
 * O objeto `responsibilities` é .optional() para evitar erros na montagem inicial com defaultValues vazio.
 *
 * Array de slugs+labels exportado: HAB_RESPONSIBILITIES (10 entradas).
 * Tipo de slug derivado: HabResponsabilidadeSlug.
 *
 * Fonte de verdade: roteiro_unificado_completo_torre360_habilitacoes_nda_piloto_sinduscon_v2.html
 * linhas 654-665 (array responsibilities) + aba id="h_responsabilidades".
 */

/**
 * Schema reutilizável para uma atividade de responsabilidade.
 * 5 campos: quemFaz (text livre), existeSubstituto (select),
 * terceiroDependente (select), maiorDificuldade (textarea), observacoes (textarea).
 */
const responsabilidadeSchema = z.object({
  quemFaz: z.string().optional(),
  existeSubstituto: z.enum(['sim', 'parcial', 'nao', 'nao-sabe']).optional(),
  terceiroDependente: z.enum(['sim', 'parcial', 'nao', 'nao-sabe']).optional(),
  maiorDificuldade: z.string().optional(),
  observacoes: z.string().optional(),
})

export const habResponsaveisSchema = z.object({
  // Campo flat — checkboxes múltiplos: dificuldades operacionais recorrentes (12 opções)
  dificuldadesRecorrentes: z
    .array(
      z.enum([
        'documento-vencido',
        'documento-nao-localizado',
        'dependencia-contador',
        'dependencia-juridico',
        'dependencia-engenharia',
        'dependencia-fornecedores',
        'duvida-aplicabilidade',
        'falta-padrao-envio',
        'retrabalho-kit',
        'documentos-whatsapp',
        'falta-historico',
        'sem-dono-processo',
      ])
    )
    .optional(),

  // Campos flat — controles gerais
  tempoMedioKit: z
    .enum(['mesmo-dia', '1-3-dias', 'ate-1-semana', 'mais-1-semana', 'nao-medem'])
    .optional(),
  existeChecklist: z.enum(['sim', 'parcial', 'nao']).optional(),
  existeRenovacao: z.enum(['sim', 'parcial', 'nao']).optional(),
  existeValidacao: z.enum(['sim', 'parcial', 'nao']).optional(),
  observacoesRotina: z.string().optional(),

  // Matriz de atividades de responsabilidade — 10 atividades, cada uma com 5 campos
  responsibilities: z
    .object({
      'solicitar-oportunidade': responsabilidadeSchema,
      'localizar-internos': responsabilidadeSchema,
      'solicitar-terceiros': responsabilidadeSchema,
      'validar-completude': responsabilidadeSchema,
      'renovar-certidoes': responsabilidadeSchema,
      'montar-kit': responsabilidadeSchema,
      'aprovar-envio': responsabilidadeSchema,
      'registrar-historico': responsabilidadeSchema,
      'acompanhar-pendencias': responsabilidadeSchema,
      'atualizar-repositorio': responsabilidadeSchema,
    })
    .optional(),
})

export type HabResponsaveisData = z.infer<typeof habResponsaveisSchema>

/**
 * Número de campos obrigatórios para cálculo de completeness.
 * Todos os campos desta aba são opcionais (diagnóstico, não cadastro).
 */
export const HAB_RESPONSAVEIS_REQUIRED_COUNT = 0

/**
 * As 10 atividades de responsabilidade em ordem do HTML de referência.
 * Cada item tem slug (chave do schema aninhado) e label (exibição ao usuário).
 * Exportado como const para preservar a tipagem literal dos slugs.
 *
 * Fonte: script JavaScript no HTML de referência (linhas 654-665), array responsibilities.
 */
export const HAB_RESPONSIBILITIES = [
  { slug: 'solicitar-oportunidade', label: 'Solicitar documentos para oportunidade comercial' },
  { slug: 'localizar-internos', label: 'Localizar documentos internos' },
  { slug: 'solicitar-terceiros', label: 'Solicitar documentos ao contador/jurídico/terceiros' },
  { slug: 'validar-completude', label: 'Validar validade e completude' },
  { slug: 'renovar-certidoes', label: 'Renovar certidões e documentos vencidos' },
  { slug: 'montar-kit', label: 'Montar kit/dossiê de habilitação' },
  { slug: 'aprovar-envio', label: 'Aprovar envio ao cliente/banco/órgão' },
  { slug: 'registrar-historico', label: 'Registrar histórico do que foi enviado' },
  { slug: 'acompanhar-pendencias', label: 'Acompanhar pendências e prazos' },
  { slug: 'atualizar-repositorio', label: 'Atualizar repositório após a entrega' },
] as const

export type HabResponsabilidadeSlug = (typeof HAB_RESPONSIBILITIES)[number]['slug']
