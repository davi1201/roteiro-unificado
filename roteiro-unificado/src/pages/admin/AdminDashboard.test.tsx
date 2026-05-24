import { describe, it, expect, vi } from 'vitest'

// Mock supabase before any other import that triggers it
vi.mock('@/lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

// Mock hooks/dependencies that import supabase transitively
vi.mock('@/features/admin/useOrgsWithReadiness', () => ({
  useOrgsWithReadiness: vi.fn(),
}))

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
    promise: vi.fn(),
    dismiss: vi.fn(),
  }),
}))

vi.mock('@/components/admin/CompanyCard', () => ({
  CompanyCard: () => null,
}))

vi.mock('@/components/admin/CreateOrgModal', () => ({
  CreateOrgModal: () => null,
}))

vi.mock('@/components/admin/ArchiveOrgDialog', () => ({
  ArchiveOrgDialog: () => null,
}))

import { filterOrgs } from './AdminDashboard'
import type { OrgWithReadiness } from '@/features/admin/useOrgsWithReadiness'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const ORG_G2: OrgWithReadiness = {
  id: 'org-g2',
  name: 'Construtora XYZ',
  cnpj: '12.345.678/0001-00',
  active: true,
  latestAssessment: {
    id: 'a1',
    readiness_level_mgmt: 'G2',
    readiness_level_tech: 'T2',
    submitted_at: '2026-05-01T00:00:00Z',
    version: 1,
  },
}

const ORG_G3: OrgWithReadiness = {
  id: 'org-g3',
  name: 'Construtora ABC',
  cnpj: '98.765.432/0001-11',
  active: true,
  latestAssessment: {
    id: 'a2',
    readiness_level_mgmt: 'G3',
    readiness_level_tech: 'T3',
    submitted_at: '2026-05-02T00:00:00Z',
    version: 2,
  },
}

const ORG_SEM_AVALIACAO: OrgWithReadiness = {
  id: 'org-sem',
  name: 'Construtora DEF',
  cnpj: null,
  active: true,
  latestAssessment: null,
}

const ALL_ORGS = [ORG_G2, ORG_G3, ORG_SEM_AVALIACAO]

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('filterOrgs', () => {
  it('retorna todas as orgs quando searchTerm="" e gradeFilter="Todos"', () => {
    const result = filterOrgs(ALL_ORGS, '', 'Todos')
    expect(result.length).toBe(3)
  })

  it('filtra por nome case-insensitive (busca "xyz" encontra "Construtora XYZ")', () => {
    const result = filterOrgs(ALL_ORGS, 'xyz', 'Todos')
    expect(result.length).toBe(1)
    expect(result[0].id).toBe('org-g2')
  })

  it('filtra por CNPJ case-insensitive sobre org.cnpj', () => {
    const result = filterOrgs(ALL_ORGS, '98.765', 'Todos')
    expect(result.length).toBe(1)
    expect(result[0].id).toBe('org-g3')
  })

  it('gradeFilter="G2" retorna apenas orgs com latestAssessment.readiness_level_mgmt === "G2"', () => {
    const result = filterOrgs(ALL_ORGS, '', 'G2')
    expect(result.length).toBe(1)
    expect(result[0].id).toBe('org-g2')
  })

  it('gradeFilter="Sem avaliação" retorna apenas orgs com latestAssessment === null', () => {
    const result = filterOrgs(ALL_ORGS, '', 'Sem avaliação')
    expect(result.length).toBe(1)
    expect(result[0].id).toBe('org-sem')
  })

  it('"Limpar filtros" (searchTerm="" e gradeFilter="Todos") retorna todas as orgs', () => {
    // Simula limpar filtros após ter filtrado
    const withFilter = filterOrgs(ALL_ORGS, 'xyz', 'G2')
    expect(withFilter.length).toBe(0) // sem match

    const cleared = filterOrgs(ALL_ORGS, '', 'Todos')
    expect(cleared.length).toBe(3)
  })
})
