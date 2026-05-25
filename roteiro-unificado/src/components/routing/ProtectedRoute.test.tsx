/**
 * P05-A: AUTH-05 — ProtectedRoute behavioral tests
 *
 * Tests:
 * 1. Redirects to /login when no session
 * 2. Shows Outlet content when session exists
 * 3. Shows spinner when isLoading
 */

import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { onAuthStateChange: vi.fn(), signOut: vi.fn() },
    from: vi.fn(),
  },
}))

vi.mock('@/features/auth/useAuth')

import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { useAuth } from '@/features/auth/useAuth'

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

function renderProtectedRoute() {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/protected" element={<div>Protected Content</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute — redirects when no session', () => {
  beforeEach(() => {
    mockAuth({ isLoading: false, session: null })
  })

  it('redirects to /login when session is null', () => {
    renderProtectedRoute()
    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})

describe('ProtectedRoute — shows Outlet when session exists', () => {
  beforeEach(() => {
    mockAuth({
      isLoading: false,
      session: { user: { id: 'u1' } } as ReturnType<typeof useAuth>['session'],
    })
  })

  it('renders child route when session is present', () => {
    renderProtectedRoute()
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })
})

describe('ProtectedRoute — shows spinner when isLoading', () => {
  beforeEach(() => {
    mockAuth({ isLoading: true, session: null })
  })

  it('renders spinner when isLoading is true', () => {
    renderProtectedRoute()
    expect(screen.getByRole('status', { name: /carregando/i })).toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
