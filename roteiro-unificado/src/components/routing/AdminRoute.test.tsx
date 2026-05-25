/**
 * P05-B: AUTH-05 — AdminRoute behavioral tests
 *
 * Tests:
 * 1. Redirects to /login when no session
 * 2. Redirects to /login when role='company'
 * 3. Shows Outlet when role='admin'
 * 4. Shows spinner when isLoading
 */

import { vi, describe, it, expect } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { onAuthStateChange: vi.fn(), signOut: vi.fn() },
    from: vi.fn(),
  },
}))

vi.mock('@/features/auth/useAuth')

import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AdminRoute } from './AdminRoute'
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

function renderAdminRoute() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<div>Admin Content</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('AdminRoute — redirects when no session', () => {
  it('redirects to /login when session is null', () => {
    mockAuth({ isLoading: false, session: null, role: null })
    renderAdminRoute()
    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })
})

describe('AdminRoute — redirects company role', () => {
  it('redirects to /login when role is company', () => {
    mockAuth({
      isLoading: false,
      session: { user: { id: 'u1' } } as ReturnType<typeof useAuth>['session'],
      role: 'company',
    })
    renderAdminRoute()
    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })
})

describe('AdminRoute — shows Outlet for admin role', () => {
  it('renders admin child route when role is admin', () => {
    mockAuth({
      isLoading: false,
      session: { user: { id: 'u2' } } as ReturnType<typeof useAuth>['session'],
      role: 'admin',
    })
    renderAdminRoute()
    expect(screen.getByText('Admin Content')).toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })
})

describe('AdminRoute — shows spinner when isLoading', () => {
  it('renders spinner when isLoading is true', () => {
    mockAuth({ isLoading: true, session: null, role: null })
    renderAdminRoute()
    expect(screen.getByRole('status', { name: /carregando/i })).toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })
})
