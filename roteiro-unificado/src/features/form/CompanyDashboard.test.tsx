import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CompanyDashboard } from './CompanyDashboard'

// ── Mock react-router-dom ─────────────────────────────────────────────────────
// Navigate renderiza um div com data-testid="navigate" e o destino em data-to
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
  useNavigate: () => mockNavigate,
  Navigate: ({ to }: { to: string }) =>
    createElement('div', { 'data-testid': 'navigate', 'data-to': to }),
}))

// ── Mock useAuth ──────────────────────────────────────────────────────────────
vi.mock('@/features/auth/useAuth', () => ({
  useAuth: vi.fn(),
}))

// ── Mock supabase ─────────────────────────────────────────────────────────────
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              })),
            })),
          })),
        })),
      })),
    })),
  },
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

import { useParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'

const mockedUseParams = useParams as ReturnType<typeof vi.fn>
const mockedUseAuth = useAuth as ReturnType<typeof vi.fn>

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CompanyDashboard — cross-tenant guard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza Spinner quando authLoading=true', () => {
    mockedUseParams.mockReturnValue({ orgId: 'org-123' })
    mockedUseAuth.mockReturnValue({
      orgId: null,
      isLoading: true,
    })

    render(createElement(CompanyDashboard), { wrapper: makeWrapper() })

    // Guard de loading: não deve mostrar conteúdo nem navegar
    expect(screen.queryByTestId('navigate')).toBeNull()
    // Deve mostrar o spinner de página inteira (bg-primary min-h-screen)
    const spinner =
      document.querySelector('.bg-primary.min-h-screen') ??
      document.querySelector('[class*="bg-primary"][class*="min-h-screen"]')
    expect(spinner).not.toBeNull()
  })

  it('renderiza <Navigate> para /form/{authOrgId}/dashboard quando orgId diverge de authOrgId', () => {
    mockedUseParams.mockReturnValue({ orgId: 'org-outra' })
    mockedUseAuth.mockReturnValue({
      orgId: 'org-minha',
      isLoading: false,
    })

    render(createElement(CompanyDashboard), { wrapper: makeWrapper() })

    const navigate = screen.getByTestId('navigate')
    expect(navigate).toBeDefined()
    expect(navigate.getAttribute('data-to')).toBe('/form/org-minha/dashboard')
  })

  it('renderiza conteúdo quando orgId === authOrgId', async () => {
    mockedUseParams.mockReturnValue({ orgId: 'org-minha' })
    mockedUseAuth.mockReturnValue({
      orgId: 'org-minha',
      isLoading: false,
    })

    render(createElement(CompanyDashboard), { wrapper: makeWrapper() })

    // Guard não deve aparecer
    expect(screen.queryByTestId('navigate')).toBeNull()
    // Conteúdo deve aparecer após a query resolver — título "Painel de Prontidão"
    // (waitFor aguarda o TanStack Query sair do estado loading)
    await waitFor(() => {
      expect(screen.getByText('Painel de Prontidão')).toBeDefined()
    })
  })
})
