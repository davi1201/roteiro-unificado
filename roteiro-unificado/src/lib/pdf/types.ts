/**
 * Contratos de tipos para o chunk de exportação PDF.
 * Importar apenas via dynamic import — nunca estático no bundle principal.
 */

/** Dados completos de uma avaliação para renderização do PDF. */
export interface AssessmentPDFData {
  /** Nome da organização/construtora */
  orgName: string
  /** CNPJ da organização (pode ser nulo) */
  cnpj: string | null
  /** Número da versão da avaliação */
  version: number
  /** Nível de prontidão gerencial G1-G5 (pode ser nulo) */
  grade: string | null
  /** Nível de prontidão técnico (pode ser nulo) */
  gradeTech: string | null
  /** Data/hora de geração do PDF */
  generatedAt: Date
  /** Dados do formulário indexados pelo TabKey */
  formData: Record<string, unknown>
}

/** Opções para gerar e abrir o PDF de uma avaliação. */
export interface GeneratePDFOptions {
  /** ID da avaliação no banco de dados */
  assessmentId: string
  /** Número da versão */
  version: number
  /** Nome da organização */
  orgName: string
  /** CNPJ da organização */
  cnpj: string | null
  /** Nível de prontidão gerencial G1-G5 */
  grade: string | null
}
