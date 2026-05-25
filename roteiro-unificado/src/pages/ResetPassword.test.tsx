/**
 * P04-B: AUTH-03 — ResetPassword behavioral tests
 *
 * Tests:
 * 1. Spinner while checking session (hasValidSession === null)
 * 2. Expired message when no session (hasValidSession === false)
 * 3. Form shown when valid session (hasValidSession === true)
 * 4. Zod .refine: confirmPassword mismatch shows error
 */

import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    promise: vi.fn(),
    dismiss: vi.fn(),
  },
}))

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ResetPassword } from './ResetPassword'
import { supabase } from '@/lib/supabase'

function renderResetPassword() {
  return render(
    <MemoryRouter>
      <ResetPassword />
    </MemoryRouter>
  )
}

describe('ResetPassword — spinner while checking session', () => {
  it('shows spinner while session check is in progress (never resolves)', () => {
    vi.mocked(supabase.auth.getSession).mockReturnValue(new Promise(() => {}))
    renderResetPassword()
    expect(screen.getByRole('status', { name: /carregando/i })).toBeInTheDocument()
  })
})

describe('ResetPassword — expired message when no session', () => {
  beforeEach(() => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as Awaited<ReturnType<typeof supabase.auth.getSession>>)
  })

  it('shows expired link message when session is null', async () => {
    renderResetPassword()

    await waitFor(() => {
      expect(screen.getByText(/link expirado/i)).toBeInTheDocument()
    })
  })

  it('does NOT show the password form when session is null', async () => {
    renderResetPassword()

    await waitFor(() => {
      expect(screen.queryByLabelText(/nova senha/i)).not.toBeInTheDocument()
    })
  })
})

describe('ResetPassword — form shown when valid session', () => {
  beforeEach(() => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: { id: 'u1' }, access_token: 'tok' } },
      error: null,
    } as unknown as Awaited<ReturnType<typeof supabase.auth.getSession>>)
  })

  it('shows password form when session is valid', async () => {
    renderResetPassword()

    await waitFor(() => {
      // "Nova senha" label is associated with #password input
      expect(screen.getByRole('button', { name: /redefinir senha/i })).toBeInTheDocument()
    })
    expect(screen.getByLabelText('Nova senha')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirmar nova senha')).toBeInTheDocument()
  })

  it('Zod refine: shows confirmPassword mismatch error when passwords do not match', async () => {
    const user = userEvent.setup()
    renderResetPassword()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /redefinir senha/i })).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText('Nova senha'), 'StrongPass1!')
    await user.type(screen.getByLabelText('Confirmar nova senha'), 'DifferentPass2!')
    await user.click(screen.getByRole('button', { name: /redefinir senha/i }))

    await waitFor(() => {
      expect(screen.getByText(/as senhas não coincidem/i)).toBeInTheDocument()
    })
  })
})
