import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResetPasswordModal } from '../ResetPasswordModal'

// Mock supabase — sem chamadas reais
vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: { invoke: vi.fn() },
  },
}))

// Mock useToast
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}))

// Mock @tanstack/react-query — useMutation stub
vi.mock('@tanstack/react-query', async () => {
  const real = await vi.importActual('@tanstack/react-query')
  return {
    ...real,
    useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  }
})

describe('ResetPasswordModal', () => {
  // Quando open=true: dialog renderiza e exibe título "Redefinir senha"
  it('renderiza o título "Redefinir senha" quando open=true', () => {
    render(
      <ResetPasswordModal
        userId="user-1"
        memberEmail="company@example.com"
        open={true}
        onClose={vi.fn()}
      />
    )
    expect(screen.getByText(/redefinir senha/i)).toBeDefined()
  })

  // Quando open=false: conteúdo do dialog não está visível
  it('não renderiza conteúdo visível quando open=false', () => {
    render(
      <ResetPasswordModal
        userId="user-1"
        memberEmail="company@example.com"
        open={false}
        onClose={vi.fn()}
      />
    )
    expect(screen.queryByText(/redefinir senha/i)).toBeNull()
  })
})
