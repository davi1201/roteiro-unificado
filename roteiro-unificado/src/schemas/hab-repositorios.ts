import { z } from 'zod'

/**
 * Schema de matriz aninhada para a aba Hab. Repositórios (padrão torreSiengeSchema).
 * Cada domínio de documento é representado como `documents.{slug}.{coluna}`.
 * O objeto `documents` é .optional() para evitar erros na montagem inicial com defaultValues vazio.
 *
 * Array de slugs+labels exportado: HAB_DOCUMENT_DOMAINS (14 entradas).
 * Tipo de slug derivado: HabDocumentSlug.
 *
 * Fonte de verdade: roteiro_unificado_completo_torre360_habilitacoes_nda_piloto_sinduscon_v2.html
 * linhas 638-653 (array documentData) + aba id="h_repositorios".
 *
 * Nota D-09: o campo "repositorioPrincipal" é SelectField (enum estruturado),
 * mesmo que o HTML original use textarea — decisão de UX para facilitar análise posterior.
 */

/**
 * Schema reutilizável para um domínio de documentos.
 * 5 campos: existeControle (select), repositorioPrincipal (select per D-09),
 * responsavelInterno (text livre), terceirosEnvolvidos (textarea — FORM-02),
 * e observacoes (textarea).
 */
const documentSchema = z.object({
  existeControle: z.enum(['sim', 'parcial', 'nao', 'nao-sabe']).optional(),
  repositorioPrincipal: z
    .enum(['ged', 'pasta-local', 'google-drive', 'sharepoint', 'nao-possui'])
    .optional(),
  responsavelInterno: z.string().optional(),
  terceirosEnvolvidos: z.string().optional(),
  observacoes: z.string().optional(),
})

export const habRepositoriosSchema = z.object({
  // Campo flat — checkboxes múltiplos: onde os documentos vivem hoje (12 opções)
  ondeDocumentosVivem: z
    .array(
      z.enum([
        'google-drive',
        'onedrive-sharepoint',
        'dropbox',
        'servidor-local',
        'sienge-erp',
        'sistema-juridico',
        'contador',
        'escritorio-juridico',
        'email-whatsapp',
        'pastas-fisicas',
        'terceiros-fornecedores',
        'nao-ha-padrao',
      ])
    )
    .optional(),

  // Campos flat — controles gerais (selects Sim/Parcial/Não)
  existePadraoPastas: z.enum(['sim', 'parcial', 'nao']).optional(),
  existePadraoNomes: z.enum(['sim', 'parcial', 'nao']).optional(),
  controlamValidade: z.enum(['sim', 'parcial', 'nao']).optional(),
  existeTrilhaVersao: z.enum(['sim', 'parcial', 'nao']).optional(),
  observacoesRepositorios: z.string().optional(),

  // Matriz de domínios de documentos — 14 domínios, cada um com 5 campos
  documents: z
    .object({
      'empresa-cnpj': documentSchema,
      'fiscal-tributario': documentSchema,
      'trabalhista-previdenciario': documentSchema,
      'contabil-financeiro': documentSchema,
      'obras-alvaras': documentSchema,
      'responsaveis-tecnicos': documentSchema,
      'contratos-procuracoes': documentSchema,
      'financiamentos-bancos': documentSchema,
      'seguros-caucoes': documentSchema,
      'fornecedores-terceiros': documentSchema,
      sst: documentSchema,
      'ambiental-cartorial': documentSchema,
      certificacoes: documentSchema,
      'kits-clientes': documentSchema,
    })
    .optional(),
})

export type HabRepositoriosData = z.infer<typeof habRepositoriosSchema>

/**
 * Número de campos obrigatórios para cálculo de completeness.
 * Todos os campos desta aba são opcionais (diagnóstico, não cadastro).
 */
export const HAB_REPOSITORIOS_REQUIRED_COUNT = 0

/**
 * Os 14 domínios de documentos em ordem do HTML de referência.
 * Cada item tem slug (chave do schema aninhado) e label (exibição ao usuário).
 * Exportado como const para preservar a tipagem literal dos slugs.
 *
 * Fonte: script JavaScript no HTML de referência (linhas 638-653), array documentData.
 */
export const HAB_DOCUMENT_DOMAINS = [
  { slug: 'empresa-cnpj', label: 'Empresa / CNPJ / societário' },
  { slug: 'fiscal-tributario', label: 'Fiscal e tributário' },
  { slug: 'trabalhista-previdenciario', label: 'Trabalhista e previdenciário' },
  { slug: 'contabil-financeiro', label: 'Contábil e econômico-financeiro' },
  { slug: 'obras-alvaras', label: 'Obras, alvarás e licenças' },
  { slug: 'responsaveis-tecnicos', label: 'Responsáveis técnicos, CREA/CAU e acervos' },
  { slug: 'contratos-procuracoes', label: 'Contratos, procurações e declarações' },
  { slug: 'financiamentos-bancos', label: 'Financiamentos, bancos e garantias' },
  { slug: 'seguros-caucoes', label: 'Seguros, cauções e apólices' },
  { slug: 'fornecedores-terceiros', label: 'Fornecedores, terceiros e subcontratados' },
  { slug: 'sst', label: 'SST, saúde e segurança do trabalho' },
  { slug: 'ambiental-cartorial', label: 'Ambiental, cartorial e imobiliário' },
  { slug: 'certificacoes', label: 'Certificações, qualidade e compliance' },
  { slug: 'kits-clientes', label: 'Kits para clientes, bancos ou editais' },
] as const

export type HabDocumentSlug = (typeof HAB_DOCUMENT_DOMAINS)[number]['slug']
