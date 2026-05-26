/**
 * Testes do ExportJsonButton.
 * Comportamentos: IDLE, LOADING, ERROR + download bem-sucedido.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ExportJsonButton } from './ExportJsonButton'

// Mocks hoisted — definidos antes do vi.mock (que é hoisted pelo vitest)
const mockSingle = vi.hoisted(() => vi.fn())
const mockToastError = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: mockSingle,
        }),
      }),
    }),
  },
}))

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
}

const mockAssessmentData = {
  form_data: { campo1: 'valor1', campo2: 'valor2' },
  submitted_at: '2026-05-20T10:00:00Z',
  readiness_level_mgmt: 'G3',
  readiness_level_tech: 'T2',
}

describe('ExportJsonButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock de URL API — jsdom não implementa createObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = vi.fn()
    // Mock de HTMLAnchorElement.click — jsdom não implementa download via click
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(vi.fn())
  })

  it('Test 1: renderiza em estado IDLE com texto e aria-label corretos', () => {
    render(<ExportJsonButton {...defaultProps} />)

    const button = screen.getByRole('button', { name: /Exportar JSON — Versão 2/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Exportar JSON')
    expect(button).toHaveAttribute('aria-label', 'Exportar JSON — Versão 2')
    expect(button).not.toBeDisabled()
  })

  it('Test 2: ao clicar entra em estado LOADING enquanto fetch está pendente', async () => {
    mockSingle.mockImplementation(() => new Promise(() => {}))

    render(<ExportJsonButton {...defaultProps} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-busy', 'true')
      expect(button).toHaveTextContent('Exportando...')
    })
  })

  it('Test 3: quando fetch falha, chama toast.error e volta ao IDLE', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: new Error('network error') })

    render(<ExportJsonButton {...defaultProps} />)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Falha ao exportar JSON. Tente novamente.')
      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
      expect(button).toHaveAttribute('aria-busy', 'false')
      expect(button).toHaveTextContent('Exportar JSON')
    })
  })

  it('Test 4: sucesso — cria blob com form_data e dispara download', async () => {
    mockSingle.mockResolvedValueOnce({ data: mockAssessmentData, error: null })

    render(<ExportJsonButton {...defaultProps} />)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalled()
      expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled()
      expect(mockToastError).not.toHaveBeenCalled()
      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('Exportar JSON')
    })
  })
})
