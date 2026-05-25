/**
 * P03-A: AUTH-01 — Login page behavioral tests
 * P03-B: AUTH-04 — Login redirect tests
 *
 * Tests:
 * 1. Renders form when not loading
 * 2. Zod validation shows inline errors on submit with empty fields
 * 3. Generic error toast on auth failure
 * 4. Redirect to /admin/dashboard when role=admin
 * 5. Redirect to /form/:orgId when role=company+orgId
 */

import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  },
}))

vi.mock('@/features/auth/useAuth')

// Mock sonner toast to capture calls
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
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Login } from './Login'
import { useAuth } from '@/features/auth/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

function mockAuth(overrides: Partial<ReturnType<typeof useAuth>> = {}) {
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    session: null,
    role: null,
    orgId: null,
    isLoading: false,
    signOut: vi.fn(),
    ...overrides,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

function renderLogin(initialPath = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
        <Route path="/form/:orgId" element={<div>Form Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Login — renders form when not loading', () => {
  beforeEach(() => {
    mockAuth({ isLoading: false })
  })

  it('shows email and password inputs and submit button', () => {
    renderLogin()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('does NOT render a spinner when isLoading is false', () => {
    renderLogin()
    // The loading spinner should not be present in the non-loading state
    // The submit button spinner may appear on isSubmitting, but not on isLoading
    expect(screen.queryByText(/entrando/i)).not.toBeInTheDocument()
  })
})

describe('Login — shows spinner when isLoading', () => {
  it('shows spinner when isLoading is true', () => {
    mockAuth({ isLoading: true })
    renderLogin()
    expect(screen.getByRole('status', { name: /carregando/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /entrar/i })).not.toBeInTheDocument()
  })
})

describe('Login — Zod validation shows inline errors', () => {
  beforeEach(() => {
    mockAuth({ isLoading: false })
  })

  it('shows required error messages when form submitted empty', async () => {
    const user = userEvent.setup()
    renderLogin()

    const submitButton = screen.getByRole('button', { name: /entrar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/o email é obrigatório/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/a senha é obrigatória/i)).toBeInTheDocument()
  })

  it('shows invalid email error when email format is wrong', async () => {
    const user = userEvent.setup()
    renderLogin()

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'not-an-email')
    await user.tab() // trigger onBlur

    await waitFor(() => {
      expect(screen.getByText(/insira um email válido/i)).toBeInTheDocument()
    })
  })
})

describe('Login — error toast on auth failure', () => {
  beforeEach(() => {
    mockAuth({ isLoading: false })
  })

  it('shows generic error toast when signInWithPassword returns an error', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' } as unknown as Error,
    } as unknown as Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>)

    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com')
    await user.type(screen.getByLabelText(/senha/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(vi.mocked(toast.error).mock.calls.length).toBeGreaterThan(0)
      expect(vi.mocked(toast.error).mock.calls[0][0]).toBe('Email ou senha inválidos')
    })
  })
})

describe('Login — redirect after successful auth', () => {
  it('redirects to /admin/dashboard when role is admin and session exists', async () => {
    mockAuth({
      isLoading: false,
      session: { user: { id: 'u1' } } as ReturnType<typeof useAuth>['session'],
      role: 'admin',
      orgId: null,
    })

    renderLogin()

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
    })
  })

  it('redirects to /form/:orgId when role is company and orgId is set', async () => {
    mockAuth({
      isLoading: false,
      session: { user: { id: 'u2' } } as ReturnType<typeof useAuth>['session'],
      role: 'company',
      orgId: 'org-456',
    })

    renderLogin()

    await waitFor(() => {
      expect(screen.getByText('Form Page')).toBeInTheDocument()
    })
  })
})
