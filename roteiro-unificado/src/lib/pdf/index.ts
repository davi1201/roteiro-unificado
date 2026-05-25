/**
 * Entry imperativo do chunk PDF — IMPORTAR APENAS VIA DYNAMIC IMPORT.
 * Nenhum import estático deste módulo deve existir no bundle principal.
 *
 * Exemplo de uso correto:
 *   const { generateAndOpenPDF } = await import('@/lib/pdf')
 */
import { createElement, type ReactElement } from 'react'
import { pdf, type DocumentProps } from '@react-pdf/renderer'
import { supabase } from '@/lib/supabase'
import type { AssessmentPDFData, GeneratePDFOptions } from './types'
import { PDFDocument } from './PDFDocument'

/**
 * Busca os dados da avaliação, gera o PDF e abre em nova aba.
 * O URL do blob é revogado automaticamente após 60 segundos.
 *
 * T-10-02: a query é protegida pela RLS do Supabase — SELECT em `assessments`
 * é bloqueado para orgs não autorizadas, sem necessidade de filtro adicional.
 */
export async function generateAndOpenPDF(opts: GeneratePDFOptions): Promise<void> {
  // 1. Buscar dados da avaliação (RLS filtra por org automaticamente)
  const { data, error } = await supabase
    .from('assessments')
    .select('id, version, form_data, readiness_level_mgmt, readiness_level_tech, submitted_at')
    .eq('id', opts.assessmentId)
    .single()

  if (error || !data) {
    throw new Error('Erro ao buscar dados da avaliação')
  }

  // 2. Montar o payload tipado para o PDFDocument
  const pdfData: AssessmentPDFData = {
    orgName: opts.orgName,
    cnpj: opts.cnpj,
    version: opts.version,
    grade: opts.grade,
    gradeTech: data.readiness_level_tech ?? null,
    generatedAt: new Date(),
    formData: (data.form_data as Record<string, unknown>) ?? {},
  }

  // 3. Gerar o blob via api imperativa do @react-pdf/renderer
  // Usa createElement para evitar JSX em arquivo .ts
  // Cast necessário: createElement retorna FunctionComponentElement<Props>,
  // mas pdf() espera ReactElement<DocumentProps> — o PDFDocument encapsula Document.
  const element = createElement(PDFDocument, { data: pdfData }) as ReactElement<DocumentProps>
  const blob = await pdf(element).toBlob()

  // 4. Abrir em nova aba e revogar o URL após 60 s
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
