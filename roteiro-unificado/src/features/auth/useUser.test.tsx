/**
 * P02-A: AUTH-05 — useUser behavioral tests
 *
 * Tests:
 * 1. isAdmin=true when role='admin'
 * 2. isAdmin=false when role='company'
 * 3. profile=null when user is null
 */

import { vi, describe, it, expect } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { onAuthStateChange: vi.fn(), signOut: vi.fn() },
    from: vi.fn(),
  },
}))

vi.mock('./useAuth')

import { renderHook } from '@testing-library/react'
import { useUser } from './useUser'
import { useAuth } from './useAuth'

function mockAuthContext(overrides: Partial<ReturnType<typeof useAuth>>) {
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

describe('useUser — isAdmin', () => {
  it('isAdmin is true when role is admin', () => {
    mockAuthContext({ role: 'admin' })
    const { result } = renderHook(() => useUser())
    expect(result.current.isAdmin).toBe(true)
  })

  it('isAdmin is false when role is company', () => {
    mockAuthContext({ role: 'company' })
    const { result } = renderHook(() => useUser())
    expect(result.current.isAdmin).toBe(false)
  })

  it('isAdmin is false when role is null', () => {
    mockAuthContext({ role: null })
    const { result } = renderHook(() => useUser())
    expect(result.current.isAdmin).toBe(false)
  })
})

describe('useUser — profile', () => {
  it('profile is null when user is null', () => {
    mockAuthContext({ user: null })
    const { result } = renderHook(() => useUser())
    expect(result.current.profile).toBeNull()
  })

  it('profile contains id and email when user exists', () => {
    mockAuthContext({
      user: { id: 'user-001', email: 'admin@test.com' } as ReturnType<typeof useAuth>['user'],
    })
    const { result } = renderHook(() => useUser())
    expect(result.current.profile).toEqual({ id: 'user-001', email: 'admin@test.com' })
  })
})
