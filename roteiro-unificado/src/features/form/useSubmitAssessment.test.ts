import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useSubmitAssessment } from './useSubmitAssessment'

// ── Mock navigate ────────────────────────────────────────────────────────────
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

// ── Mock toast ───────────────────────────────────────────────────────────────
const mockSuccess = vi.fn()
const mockError = vi.fn()
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    success: mockSuccess,
    error: mockError,
    warning: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
    promise: vi.fn(),
    dismiss: vi.fn(),
  }),
}))

// ── Mock supabase ─────────────────────────────────────────────────────────────
// useSubmitAssessment does a two-step:
//   1. supabase.from('assessments').select('version').eq(...).eq(...).maybeSingle<{version}>()
//   2. supabase.from('assessments').update({...}).eq('org_id', ...).eq('status', 'draft')
//
// The factory returns captured spies so tests can assert payload details.

type SubmitMockOptions = {
  draftVersion?: number | null // null = no draft found
  fetchError?: object | null
  updateError?: object | null
}

function makeSubmitMock({
  draftVersion = 1,
  fetchError = null,
  updateError = null,
}: SubmitMockOptions = {}) {
  const mockMaybeSingle = vi.fn().mockResolvedValue({
    data: draftVersion !== null ? { version: draftVersion } : null,
    error: fetchError,
  })
  const mockEqSelect2 = vi.fn(() => ({ maybeSingle: mockMaybeSingle }))
  const mockEqSelect1 = vi.fn(() => ({ eq: mockEqSelect2 }))
  const mockSelect = vi.fn(() => ({ eq: mockEqSelect1 }))

  // The chain: update({...}).eq('org_id', x).eq('status', 'draft')
  // The final .eq() must be thenable (awaitable) — resolve to { error }
  const mockEqUpdate2 = vi.fn().mockResolvedValue({ error: updateError })
  const mockEqUpdate1 = vi.fn(() => ({ eq: mockEqUpdate2 }))
  const mockUpdate = vi.fn(() => ({ eq: mockEqUpdate1 }))

  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    update: mockUpdate,
  }))

  return { mockFrom, mockSelect, mockMaybeSingle, mockUpdate, mockEqUpdate1, mockEqUpdate2 }
}

vi.mock('@/lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

// ── Helper: wrap hook in QueryClientProvider ──────────────────────────────────
function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useSubmitAssessment', () => {
  it('SAVE-03: muda status do draft para submitted via UPDATE', async () => {
    const { supabase } = await import('@/lib/supabase')
    const { mockFrom, mockUpdate } = makeSubmitMock({ draftVersion: 2 })
    vi.mocked(supabase.from).mockImplementation(mockFrom as never)

    const orgId = 'org-submit-test'
    const { result } = renderHook(() => useSubmitAssessment(orgId), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      result.current.mutate()
    })

    await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true))

    // update() must have been called with status: 'submitted'
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 'submitted' }))
  })

  it('SAVE-03: inclui submitted_at com timestamp atual', async () => {
    const { supabase } = await import('@/lib/supabase')
    const { mockFrom, mockUpdate } = makeSubmitMock({ draftVersion: 1 })
    vi.mocked(supabase.from).mockImplementation(mockFrom as never)

    const before = new Date()

    const { result } = renderHook(() => useSubmitAssessment('org-ts-test'), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      result.current.mutate()
    })

    await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true))

    const after = new Date()

    const callArg = vi.mocked(mockUpdate).mock.calls[0][0] as { submitted_at: string }
    const submittedAt = new Date(callArg.submitted_at)

    expect(submittedAt.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000)
    expect(submittedAt.getTime()).toBeLessThanOrEqual(after.getTime() + 1000)
  })

  it('SAVE-03: incrementa version no UPDATE', async () => {
    const { supabase } = await import('@/lib/supabase')
    const currentVersion = 3
    const { mockFrom, mockUpdate } = makeSubmitMock({ draftVersion: currentVersion })
    vi.mocked(supabase.from).mockImplementation(mockFrom as never)

    const { result } = renderHook(() => useSubmitAssessment('org-version-test'), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      result.current.mutate()
    })

    await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true))

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ version: currentVersion + 1 })
    )
  })

  it('navega para /form/:orgId/history após sucesso', async () => {
    const { supabase } = await import('@/lib/supabase')
    const orgId = 'org-navigate-test'
    const { mockFrom } = makeSubmitMock({ draftVersion: 1 })
    vi.mocked(supabase.from).mockImplementation(mockFrom as never)

    const { result } = renderHook(() => useSubmitAssessment(orgId), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      result.current.mutate()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockNavigate).toHaveBeenCalledWith(`/form/${orgId}/history`, { replace: true })
  })

  it('exibe toast de erro e não navega em caso de falha', async () => {
    const { supabase } = await import('@/lib/supabase')
    const { mockFrom } = makeSubmitMock({
      draftVersion: 1,
      updateError: { message: 'DB constraint violation' },
    })
    vi.mocked(supabase.from).mockImplementation(mockFrom as never)

    const { result } = renderHook(() => useSubmitAssessment('org-error-test'), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      result.current.mutate()
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(mockError).toHaveBeenCalledWith('Erro ao enviar avaliação — tente novamente')
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
