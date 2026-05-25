// STUB — substituído no Plan 10-02
// Este stub existe apenas para permitir a compilação do chunk pdf/ no Plan 10-01.
// O Plan 10-02 substitui este arquivo pela implementação completa com todas as seções.
import { Document, Page, Text } from '@react-pdf/renderer'
import type { AssessmentPDFData } from './types'

interface PDFDocumentProps {
  data: AssessmentPDFData
}

export function PDFDocument({ data }: PDFDocumentProps) {
  return (
    <Document title={`Avaliação — ${data.orgName}`}>
      <Page>
        <Text>placeholder</Text>
      </Page>
    </Document>
  )
}
