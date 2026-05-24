import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useNewRevision } from './useNewRevision'

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
// useNewRevision does:
//   1. SELECT form_data, version, readiness_level_mgmt, readiness_level_tech
//      FROM assessments WHERE org_id=? AND status='submitted'
//      ORDER BY version DESC LIMIT 1 SINGLE
//   2. INSERT { org_id, form_data, status: 'draft', version: latest.version + 1, ... }
//
// SAVE-04 key requirement: no UPDATE on submitted records — only INSERT creates new rows.

type RevisionMockOptions = {
  latestSubmitted?: {
    form_data: Record<string, unknown>
    version: number
    readiness_level_mgmt: string | null
    readiness_level_tech: string | null
  } | null
  fetchError?: object | null
  insertError?: object | null
}

function makeRevisionMock({
  latestSubmitted = {
    form_data: { identificacao: { empresa: 'Acme' } },
    version: 2,
    readiness_level_mgmt: 'G2',
    readiness_level_tech: 'HAB-B',
  },
  fetchError = null,
  insertError = null,
}: RevisionMockOptions = {}) {
  const mockSingle = vi.fn().mockResolvedValue({
    data: latestSubmitted,
    error: fetchError,
  })
  const mockLimit = vi.fn(() => ({ single: mockSingle }))
  const mockOrder = vi.fn(() => ({ limit: mockLimit }))
  const mockEqSelect2 = vi.fn(() => ({ order: mockOrder }))
  const mockEqSelect1 = vi.fn(() => ({ eq: mockEqSelect2 }))
  const mockSelect = vi.fn(() => ({ eq: mockEqSelect1 }))

  const mockInsert = vi.fn().mockResolvedValue({ error: insertError })

  // SAVE-04: there must be no update() call — only insert()
  const mockUpdate = vi.fn()

  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate, // present so we can assert it's NEVER called
  }))

  return { mockFrom, mockSelect, mockSingle, mockInsert, mockUpdate }
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

describe('useNewRevision', () => {
  it('SAVE-04: não sobrescreve registros submitted — usa INSERT', async () => {
    const { supabase } = await import('@/lib/supabase')
    const { mockFrom, mockInsert, mockUpdate } = makeRevisionMock()
    vi.mocked(supabase.from).mockImplementation(mockFrom as never)

    const { result } = renderHook(() => useNewRevision('org-append-only'), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      result.current.mutate()
    })

    await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true))

    // INSERT must be called to create the new draft
    expect(mockInsert).toHaveBeenCalled()
    // UPDATE must NEVER be called — submitted rows are immutable
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('SAVE-05: copia form_data da versão submitted mais recente', async () => {
    const { supabase } = await import('@/lib/supabase')
    const originalFormData = {
      identificacao: { empresa: 'Construtora X' },
      nda: { aceitaTermos: true },
    }
    const { mockFrom, mockInsert } = makeRevisionMock({
      latestSubmitted: {
        form_data: originalFormData,
        version: 5,
        readiness_level_mgmt: 'G3',
        readiness_level_tech: 'HAB-C',
      },
    })
    vi.mocked(supabase.from).mockImplementation(mockFrom as never)

    const { result } = renderHook(() => useNewRevision('org-copy-formdata'), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      result.current.mutate()
    })

    await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true))

    // The INSERT payload must contain the exact form_data from the submitted record
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ form_data: originalFormData })
    )
  })

  it('SAVE-05: incrementa version no INSERT (latest.version + 1)', async () => {
    const { supabase } = await import('@/lib/supabase')
    const latestVersion = 4
    const { mockFrom, mockInsert } = makeRevisionMock({
      latestSubmitted: {
        form_data: {},
        version: latestVersion,
        readiness_level_mgmt: null,
        readiness_level_tech: null,
      },
    })
    vi.mocked(supabase.from).mockImplementation(mockFrom as never)

    const { result } = renderHook(() => useNewRevision('org-version-increment'), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      result.current.mutate()
    })

    await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true))

    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ version: latestVersion + 1 }))
  })

  it('navega para /form/:orgId após sucesso', async () => {
    const { supabase } = await import('@/lib/supabase')
    const orgId = 'org-nav-revision'
    const { mockFrom } = makeRevisionMock()
    vi.mocked(supabase.from).mockImplementation(mockFrom as never)

    const { result } = renderHook(() => useNewRevision(orgId), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      result.current.mutate()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockNavigate).toHaveBeenCalledWith(`/form/${orgId}`, { replace: true })
  })

  it('exibe toast de erro em caso de falha no INSERT', async () => {
    const { supabase } = await import('@/lib/supabase')
    const { mockFrom } = makeRevisionMock({
      insertError: { message: 'unique_violation on draft' },
    })
    vi.mocked(supabase.from).mockImplementation(mockFrom as never)

    const { result } = renderHook(() => useNewRevision('org-insert-error'), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      result.current.mutate()
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(mockError).toHaveBeenCalledWith('Erro ao iniciar nova revisão — tente novamente')
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
