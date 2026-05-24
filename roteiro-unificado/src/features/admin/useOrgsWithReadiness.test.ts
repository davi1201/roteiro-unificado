import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useOrgsWithReadiness } from './useOrgsWithReadiness'

// ── Mock supabase ──────────────────────────────────────────────────────────────
vi.mock('@/lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

// ── Helper: wrap hook in QueryClientProvider ───────────────────────────────────
function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
  return wrapper
}

// ── Helper: build mock supabase chain ─────────────────────────────────────────
// Simulates: supabase.from('orgs').select(...).eq('active', true).order('name', {...})
function makeMockChain(resolvedData: object) {
  const mockOrder = vi.fn().mockResolvedValue(resolvedData)
  const mockEq = vi.fn(() => ({ order: mockOrder }))
  const mockSelect = vi.fn(() => ({ eq: mockEq }))
  const mockFrom = vi.fn(() => ({ select: mockSelect }))
  return { mockFrom, mockSelect, mockEq, mockOrder }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useOrgsWithReadiness', () => {
  // Caso 1: org sem assessment com status='submitted' → latestAssessment=null
  it('retorna latestAssessment=null quando não há assessment submetido', async () => {
    const { supabase } = await import('@/lib/supabase')
    const rawData = [
      {
        id: 'org-1',
        name: 'Construtora Alpha',
        cnpj: '00.000.000/0001-00',
        active: true,
        assessments: [
          {
            id: 'ass-1',
            readiness_level_mgmt: 'G2',
            readiness_level_tech: null,
            submitted_at: null,
            version: 1,
            status: 'draft',
          },
        ],
      },
    ]
    const { mockFrom } = makeMockChain({ data: rawData, error: null })
    vi.mocked(supabase.from).mockImplementation(mockFrom as never)

    const { result } = renderHook(() => useOrgsWithReadiness(), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data![0].latestAssessment).toBeNull()
  })

  // Caso 2: múltiplos submitted → retorna o de maior version
  it('retorna o assessment de maior version quando há múltiplos submitted', async () => {
    const { supabase } = await import('@/lib/supabase')
    const rawData = [
      {
        id: 'org-2',
        name: 'Construtora Beta',
        cnpj: null,
        active: true,
        assessments: [
          {
            id: 'ass-v1',
            readiness_level_mgmt: 'G1',
            readiness_level_tech: 'T1',
            submitted_at: '2026-01-01T00:00:00Z',
            version: 1,
            status: 'submitted',
          },
          {
            id: 'ass-v3',
            readiness_level_mgmt: 'G3',
            readiness_level_tech: 'T3',
            submitted_at: '2026-03-01T00:00:00Z',
            version: 3,
            status: 'submitted',
          },
          {
            id: 'ass-v2',
            readiness_level_mgmt: 'G2',
            readiness_level_tech: 'T2',
            submitted_at: '2026-02-01T00:00:00Z',
            version: 2,
            status: 'submitted',
          },
        ],
      },
    ]
    const { mockFrom } = makeMockChain({ data: rawData, error: null })
    vi.mocked(supabase.from).mockImplementation(mockFrom as never)

    const { result } = renderHook(() => useOrgsWithReadiness(), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const latest = result.current.data![0].latestAssessment
    expect(latest).not.toBeNull()
    expect(latest!.id).toBe('ass-v3')
    expect(latest!.version).toBe(3)
    expect(latest!.readiness_level_mgmt).toBe('G3')
  })

  // Caso 3: assessment com status='draft' NÃO aparece em latestAssessment
  it('não inclui assessment com status=draft em latestAssessment', async () => {
    const { supabase } = await import('@/lib/supabase')
    const rawData = [
      {
        id: 'org-3',
        name: 'Construtora Gamma',
        cnpj: '11.111.111/0001-11',
        active: true,
        assessments: [
          {
            id: 'ass-submitted',
            readiness_level_mgmt: 'G4',
            readiness_level_tech: null,
            submitted_at: '2026-04-01T00:00:00Z',
            version: 1,
            status: 'submitted',
          },
          {
            id: 'ass-draft',
            readiness_level_mgmt: 'G5',
            readiness_level_tech: 'T5',
            submitted_at: null,
            version: 2,
            status: 'draft',
          },
        ],
      },
    ]
    const { mockFrom } = makeMockChain({ data: rawData, error: null })
    vi.mocked(supabase.from).mockImplementation(mockFrom as never)

    const { result } = renderHook(() => useOrgsWithReadiness(), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const latest = result.current.data![0].latestAssessment
    expect(latest).not.toBeNull()
    // Deve usar o submitted (v1), NÃO o draft (v2 que é maior)
    expect(latest!.id).toBe('ass-submitted')
    expect(latest!.version).toBe(1)
    expect(latest!.readiness_level_mgmt).toBe('G4')
  })

  // Caso 4: latestAssessment preserva campos corretos e omite status
  it('latestAssessment preserva id, readiness_level_mgmt, readiness_level_tech, submitted_at, version — sem status', async () => {
    const { supabase } = await import('@/lib/supabase')
    const submittedAt = '2026-05-01T12:00:00Z'
    const rawData = [
      {
        id: 'org-4',
        name: 'Construtora Delta',
        cnpj: '22.222.222/0001-22',
        active: true,
        assessments: [
          {
            id: 'ass-check',
            readiness_level_mgmt: 'G3',
            readiness_level_tech: 'T2',
            submitted_at: submittedAt,
            version: 5,
            status: 'submitted',
          },
        ],
      },
    ]
    const { mockFrom } = makeMockChain({ data: rawData, error: null })
    vi.mocked(supabase.from).mockImplementation(mockFrom as never)

    const { result } = renderHook(() => useOrgsWithReadiness(), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const latest = result.current.data![0].latestAssessment
    expect(latest).not.toBeNull()
    expect(latest!.id).toBe('ass-check')
    expect(latest!.readiness_level_mgmt).toBe('G3')
    expect(latest!.readiness_level_tech).toBe('T2')
    expect(latest!.submitted_at).toBe(submittedAt)
    expect(latest!.version).toBe(5)
    // status NÃO deve estar presente no objeto final
    expect('status' in latest!).toBe(false)
  })
})
