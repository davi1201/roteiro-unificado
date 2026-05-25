import { createElement } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ── Mocks must be hoisted before imports ─────────────────────────────────────

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
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}))

vi.mock('react-router-dom', () => ({
  useParams: vi.fn(() => ({ orgId: 'tenant-layout-test' })),
  useLocation: vi.fn(() => ({ hash: '#identificacao' })),
  useNavigate: vi.fn(() => vi.fn()),
  Navigate: ({ to }: { to: string }) =>
    createElement('div', { 'data-testid': 'navigate', 'data-to': to }),
}))

vi.mock('@/features/auth/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'u1' },
    session: {},
    role: 'company',
    orgId: 'tenant-layout-test',
    isLoading: false,
    signOut: vi.fn(),
  })),
}))

vi.mock('@/hooks/useAutosave', () => ({ useAutosave: vi.fn() }))
vi.mock('@/hooks/useToast', () => ({
  useToast: vi.fn(() => ({ error: vi.fn(), success: vi.fn(), info: vi.fn() })),
}))

vi.mock('./useSubmitAssessment', () => ({
  useSubmitAssessment: vi.fn(() => ({ isPending: false, mutate: vi.fn() })),
}))

// Mock all Section components with identifiable stubs
vi.mock('./sections/IdentificacaoSection', () => ({
  IdentificacaoSection: () => createElement('div', { 'data-testid': 'section-identificacao' }),
}))
vi.mock('./sections/TorreDecisaoSection', () => ({
  TorreDecisaoSection: () => createElement('div', { 'data-testid': 'section-torre-decisao' }),
}))
vi.mock('./sections/TorreSiengeSection', () => ({
  TorreSiengeSection: () => createElement('div', { 'data-testid': 'section-torre-sienge' }),
}))
vi.mock('./sections/TorreAcessoSection', () => ({
  TorreAcessoSection: () => createElement('div', { 'data-testid': 'section-torre-acesso' }),
}))
vi.mock('./sections/TorreClassificacaoSection', () => ({
  TorreClassificacaoSection: () =>
    createElement('div', { 'data-testid': 'section-torre-classificacao' }),
}))
vi.mock('./sections/HabVendaSection', () => ({
  HabVendaSection: () => createElement('div', { 'data-testid': 'section-hab-venda' }),
}))
vi.mock('./sections/HabRepositoriosSection', () => ({
  HabRepositoriosSection: () => createElement('div', { 'data-testid': 'section-hab-repositorios' }),
}))
vi.mock('./sections/HabResponsaveisSection', () => ({
  HabResponsaveisSection: () => createElement('div', { 'data-testid': 'section-hab-responsaveis' }),
}))
vi.mock('./sections/HabClassificacaoSection', () => ({
  HabClassificacaoSection: () =>
    createElement('div', { 'data-testid': 'section-hab-classificacao' }),
}))
vi.mock('./sections/NdaSection', () => ({
  NdaSection: () => createElement('div', { 'data-testid': 'section-nda' }),
}))
vi.mock('./ReadinessClassification', () => ({
  ReadinessClassification: () => null,
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

import { useParams, useLocation } from 'react-router-dom'
import { TabKey, createFormStore, clearFormStore } from '@/stores/formStore'
import { FormLayout } from './FormLayout'

const mockedUseParams = useParams as ReturnType<typeof vi.fn>
const mockedUseLocation = useLocation as ReturnType<typeof vi.fn>

const TENANT = 'tenant-layout-test'

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0 } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children)
}

function renderLayout() {
  return render(createElement(FormLayout), { wrapper: makeWrapper() })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('FormLayout renderSection routing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseParams.mockReturnValue({ orgId: TENANT })
    // Reset tenant store to Identificacao tab
    createFormStore(TENANT).getState().setActiveTab(TabKey.Identificacao)
  })

  afterEach(() => {
    clearFormStore(TENANT)
  })

  it('renders IdentificacaoSection when activeTab = TabKey.Identificacao', async () => {
    mockedUseLocation.mockReturnValue({ hash: `#${TabKey.Identificacao}` })
    createFormStore(TENANT).getState().setActiveTab(TabKey.Identificacao)

    renderLayout()
    // Wait for draftQuery to resolve (moves from loading → success → shows section)
    await waitFor(() => {
      expect(screen.getByTestId('section-identificacao')).toBeInTheDocument()
    })
  })

  it('renders TorreDecisaoSection when activeTab = TabKey.TorreDecisao', async () => {
    mockedUseLocation.mockReturnValue({ hash: `#${TabKey.TorreDecisao}` })
    createFormStore(TENANT).getState().setActiveTab(TabKey.TorreDecisao)

    renderLayout()
    await waitFor(() => {
      expect(screen.getByTestId('section-torre-decisao')).toBeInTheDocument()
    })
  })

  it('does not render IdentificacaoSection when activeTab = TorreDecisao', async () => {
    mockedUseLocation.mockReturnValue({ hash: `#${TabKey.TorreDecisao}` })
    createFormStore(TENANT).getState().setActiveTab(TabKey.TorreDecisao)

    renderLayout()
    await waitFor(() => {
      expect(screen.getByTestId('section-torre-decisao')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('section-identificacao')).not.toBeInTheDocument()
  })
})
