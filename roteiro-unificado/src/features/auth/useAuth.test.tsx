/**
 * P01-B: AUTH-01 — useAuth throws when used outside AuthProvider
 */

import { vi, describe, it, expect } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  },
}))

import { renderHook } from '@testing-library/react'
import { useAuth } from './useAuth'

describe('useAuth — context guard', () => {
  it('throws an error when used outside AuthProvider', () => {
    // Suppress React error boundary noise from console
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth deve ser usado dentro de AuthProvider')

    consoleSpy.mockRestore()
  })
})
