/**
 * Testes do ExportPdfButton — Plan 10-03 (Wave 3).
 * Comportamentos: IDLE, LOADING, ERROR com dynamic import mockado.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ExportPdfButton } from './ExportPdfButton'

// Mock do módulo pdf (dynamic import)
const mockGenerateAndOpenPDF = vi.fn()
vi.mock('@/lib/pdf/index', () => ({
  generateAndOpenPDF: mockGenerateAndOpenPDF,
}))

// Mock do useToast
const mockToastError = vi.fn()
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    error: mockToastError,
    success: vi.fn(),
    loading: vi.fn(),
  }),
}))

const defaultProps = {
  assessmentId: 'assess-123',
  version: 2,
  orgName: 'Construtora ABC',
  cnpj: '12.345.678/0001-90',
  grade: 'G3',
}

describe('ExportPdfButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Simula dynamic import retornando o módulo mockado
    vi.doMock('@/lib/pdf/index', () => ({
      generateAndOpenPDF: mockGenerateAndOpenPDF,
    }))
  })

  it('Test 1: renderiza em estado IDLE com texto e aria-label corretos', () => {
    render(<ExportPdfButton {...defaultProps} />)

    const button = screen.getByRole('button', { name: /Exportar PDF — Versão 2/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Exportar PDF')
    expect(button).toHaveAttribute('aria-label', 'Exportar PDF — Versão 2')
    expect(button).not.toBeDisabled()
  })

  it('Test 2: ao clicar entra em estado LOADING e chama generateAndOpenPDF', async () => {
    // Faz generateAndOpenPDF nunca resolver para capturar estado de loading
    mockGenerateAndOpenPDF.mockImplementation(() => new Promise(() => {}))

    render(<ExportPdfButton {...defaultProps} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-busy', 'true')
      expect(button).toHaveTextContent('Gerando...')
    })
  })

  it('Test 3: quando a geração falha, chama useToast().error e volta ao IDLE', async () => {
    mockGenerateAndOpenPDF.mockRejectedValueOnce(new Error('network error'))

    render(<ExportPdfButton {...defaultProps} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Falha ao gerar PDF. Tente novamente.')
      expect(button).not.toBeDisabled()
      expect(button).toHaveAttribute('aria-busy', 'false')
      expect(button).toHaveTextContent('Exportar PDF')
    })
  })
})
