import { describe, it, expect, vi } from 'vitest'
import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ChangePasswordModal } from '../ChangePasswordModal'

// Mock supabase — sem chamadas reais
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(),
      signInWithPassword: vi.fn(),
    },
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

// Mock useAuth
vi.mock('@/features/auth/useAuth', () => ({
  useAuth: () => ({ user: { email: 'test@example.com' } }),
}))

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0 } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children)
}

describe('ChangePasswordModal', () => {
  // N-04: modal exibe três campos de senha quando open=true
  it('exibe os três campos de senha quando open=true', () => {
    render(<ChangePasswordModal open={true} onClose={vi.fn()} />, {
      wrapper: makeWrapper(),
    })
    expect(screen.getByLabelText(/senha atual/i)).toBeDefined()
    expect(screen.getByLabelText(/nova senha/i)).toBeDefined()
    expect(screen.getByLabelText(/confirmar nova senha/i)).toBeDefined()
  })

  // Botões Salvar e Cancelar devem estar presentes quando open=true
  it('exibe botões "Salvar" e "Cancelar" quando open=true', () => {
    render(<ChangePasswordModal open={true} onClose={vi.fn()} />, {
      wrapper: makeWrapper(),
    })
    expect(screen.getByRole('button', { name: /salvar/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeDefined()
  })

  // Conteúdo não visível quando open=false
  it('não renderiza conteúdo visível quando open=false', () => {
    render(<ChangePasswordModal open={false} onClose={vi.fn()} />, {
      wrapper: makeWrapper(),
    })
    expect(screen.queryByLabelText(/senha atual/i)).toBeNull()
  })
})
