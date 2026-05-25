/**
 * PDFDocument — Documento raiz do Relatório de Prontidão Gerencial.
 * Compõe: PDFCoverPage + PDFSectionTorre360 + PDFSectionHabilitacoes + PDFSectionFinal.
 * Cada Page de conteúdo inclui PDFFooter fixo.
 * Usa apenas primitivos de @react-pdf/renderer — sem hooks React, sem Tailwind.
 */
import { Document, Page } from '@react-pdf/renderer'
import { styles } from './styles'
import { PDFCoverPage } from './PDFCoverPage'
import { PDFSectionTorre360 } from './PDFSectionTorre360'
import { PDFSectionHabilitacoes } from './PDFSectionHabilitacoes'
import { PDFSectionFinal } from './PDFSectionFinal'
import { PDFFooter } from './PDFFooter'
import type { AssessmentPDFData } from './types'

interface PDFDocumentProps {
  data: AssessmentPDFData
}

export function PDFDocument({ data }: PDFDocumentProps) {
  const formData = (data.formData ?? {}) as Record<string, unknown>

  return (
    <Document
      title={`Relatório de Prontidão Gerencial — ${data.orgName} v${data.version}`}
      author="SuaEquipe.IA"
      subject="Avaliação de Prontidão"
    >
      {/* Página 1 — Capa (sem rodapé) */}
      <PDFCoverPage data={data} />

      {/* Página 2 — Seções Torre 360 */}
      <Page size="A4" style={styles.page}>
        <PDFFooter />
        <PDFSectionTorre360 formData={formData} />
      </Page>

      {/* Página 3 — Seções Habilitações + NDA */}
      <Page size="A4" style={styles.page}>
        <PDFFooter />
        <PDFSectionHabilitacoes formData={formData} />
      </Page>

      {/* Página 4 — Classificação Final G1-G5 */}
      <Page size="A4" style={styles.page}>
        <PDFFooter />
        <PDFSectionFinal grade={data.grade} gradeTech={data.gradeTech} />
      </Page>
    </Document>
  )
}
