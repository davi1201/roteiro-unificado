/**
 * P04-A: AUTH-03 — ForgotPassword behavioral tests
 *
 * Tests:
 * 1. Calls resetPasswordForEmail on submit with valid email
 * 2. Shows success toast when error is null
 * 3. Shows error toast when error is non-null
 */

import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn(),
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
import { ForgotPassword } from './ForgotPassword'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

function renderForgotPassword() {
  return render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>
  )
}

describe('ForgotPassword — calls resetPasswordForEmail on submit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls supabase.auth.resetPasswordForEmail with the entered email', async () => {
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
      data: {},
      error: null,
    } as Awaited<ReturnType<typeof supabase.auth.resetPasswordForEmail>>)

    const user = userEvent.setup()
    renderForgotPassword()

    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.click(screen.getByRole('button', { name: /enviar link/i }))

    await waitFor(() => {
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'user@example.com',
        expect.objectContaining({ redirectTo: expect.stringContaining('/reset-password') })
      )
    })
  })

  it('shows success toast when error is null', async () => {
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
      data: {},
      error: null,
    } as Awaited<ReturnType<typeof supabase.auth.resetPasswordForEmail>>)

    const user = userEvent.setup()
    renderForgotPassword()

    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.click(screen.getByRole('button', { name: /enviar link/i }))

    await waitFor(() => {
      expect(vi.mocked(toast.success).mock.calls.length).toBeGreaterThan(0)
      const firstCallArg = vi.mocked(toast.success).mock.calls[0][0]
      expect(firstCallArg).toContain('Link enviado')
    })
  })

  it('shows error toast when resetPasswordForEmail returns an error', async () => {
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
      data: {},
      error: { message: 'Rate limited' } as unknown as Error,
    } as Awaited<ReturnType<typeof supabase.auth.resetPasswordForEmail>>)

    const user = userEvent.setup()
    renderForgotPassword()

    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.click(screen.getByRole('button', { name: /enviar link/i }))

    await waitFor(() => {
      expect(vi.mocked(toast.error).mock.calls.length).toBeGreaterThan(0)
      const firstCallArg = vi.mocked(toast.error).mock.calls[0][0]
      expect(firstCallArg).toContain('Não foi possível enviar o link')
    })
  })
})
