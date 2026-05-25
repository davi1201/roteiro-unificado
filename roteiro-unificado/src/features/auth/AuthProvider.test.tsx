/**
 * P01-A: AUTH-01/02 — AuthProvider behavioral tests
 *
 * Tests:
 * 1. isLoading starts true and becomes false after SIGNED_OUT event
 * 2. SIGNED_OUT clears user/session/role/orgId state
 * 3. SIGNED_IN sets user and session, then org_members fetch sets role and orgId
 * 4. isLoading becomes false after org_members fetch resolves
 */

import { vi, describe, it, expect, beforeEach } from 'vitest'

// MUST mock before any import that uses supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  },
}))

vi.mock('@/stores/formStore', () => ({
  clearFormStore: vi.fn(),
}))

import { renderHook, act, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { AuthProvider } from './AuthProvider'
import { useAuth } from './useAuth'
import { supabase } from '@/lib/supabase'

// Helper to capture the onAuthStateChange callback
let capturedAuthCallback: ((event: string, session: unknown) => void) | null = null

function setupMocks() {
  capturedAuthCallback = null

  vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((cb) => {
    capturedAuthCallback = cb
    return {
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    } as unknown as ReturnType<typeof supabase.auth.onAuthStateChange>
  })

  // Default org_members mock — not called unless user has a session
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: { message: 'no rows' } }),
  } as unknown as ReturnType<typeof supabase.from>)
}

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('AuthProvider — isLoading lifecycle', () => {
  beforeEach(() => {
    setupMocks()
  })

  it('isLoading starts as true before any auth event fires', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isLoading).toBe(true)
  })

  it('isLoading becomes false after SIGNED_OUT event', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isLoading).toBe(true)

    act(() => {
      capturedAuthCallback!('SIGNED_OUT', null)
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })
})

describe('AuthProvider — SIGNED_OUT clears state', () => {
  beforeEach(() => {
    setupMocks()
  })

  it('SIGNED_OUT sets user, session, role, and orgId to null', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      capturedAuthCallback!('SIGNED_OUT', null)
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.session).toBeNull()
    expect(result.current.role).toBeNull()
    expect(result.current.orgId).toBeNull()
  })
})

describe('AuthProvider — org_members fetch sets role and orgId', () => {
  beforeEach(() => {
    setupMocks()
  })

  it('SIGNED_IN triggers org_members fetch, which sets role and orgId then clears isLoading', async () => {
    const fakeUser = { id: 'user-abc', email: 'test@example.com' }
    const fakeSession = { user: fakeUser, access_token: 'tok' }

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { org_id: 'org-123', role: 'company' },
        error: null,
      }),
    } as unknown as ReturnType<typeof supabase.from>)

    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      capturedAuthCallback!('SIGNED_IN', fakeSession)
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toEqual(fakeUser)
    expect(result.current.session).toEqual(fakeSession)
    expect(result.current.role).toBe('company')
    expect(result.current.orgId).toBe('org-123')
  })

  it('org_members fetch error leaves role and orgId null, clears isLoading', async () => {
    const fakeUser = { id: 'user-xyz', email: 'other@example.com' }
    const fakeSession = { user: fakeUser, access_token: 'tok2' }

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'not found' },
      }),
    } as unknown as ReturnType<typeof supabase.from>)

    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      capturedAuthCallback!('SIGNED_IN', fakeSession)
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.role).toBeNull()
    expect(result.current.orgId).toBeNull()
  })
})
