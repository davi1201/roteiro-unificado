import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CompanyCard } from './CompanyCard'
import type { OrgWithReadiness } from '@/features/admin/useOrgsWithReadiness'

// Mock react-router-dom Link — sem dependência de Router
vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

const orgBase: OrgWithReadiness = {
  id: 'org-1',
  name: 'Construtora Alpha',
  cnpj: '12345678000195',
  active: true,
  latestAssessment: null,
}

const orgWithAssessment: OrgWithReadiness = {
  ...orgBase,
  latestAssessment: {
    id: 'ass-1',
    readiness_level_mgmt: 'G2',
    readiness_level_tech: 'T2 — Intermediário',
    submitted_at: '2026-05-01T12:30:00Z',
    version: 1,
  },
}

describe('CompanyCard', () => {
  // Caso 1: latestAssessment=null → pill "Sem avaliação", NÃO Badge G1-G5
  it('exibe pill "Sem avaliação" quando latestAssessment é null', () => {
    render(<CompanyCard org={orgBase} />)
    expect(screen.getByText('Sem avaliação')).toBeDefined()
    // Badge G1-G5 não deve aparecer (não há texto G1, G2, etc.)
    expect(screen.queryByText(/^G[1-5] —/)).toBeNull()
  })

  // Caso 2: latestAssessment=null → "—" nos campos de data e nível técnico
  it('exibe "—" em data e nível técnico quando latestAssessment é null', () => {
    render(<CompanyCard org={orgBase} />)
    // Deve haver pelo menos um "—" na tela
    const dashes = screen.getAllByText(/—/)
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  // Caso 3: latestAssessment presente → renderiza Badge G1-G5
  it('renderiza Badge G1-G5 quando latestAssessment está presente', () => {
    render(<CompanyCard org={orgWithAssessment} />)
    // Badge G2 → label "G2 — Baixo"
    expect(screen.getByText('G2 — Baixo')).toBeDefined()
    // Pill "Sem avaliação" NÃO deve aparecer
    expect(screen.queryByText('Sem avaliação')).toBeNull()
  })

  // Caso 4: latestAssessment presente → exibe data formatada pt-BR
  it('exibe data formatada em pt-BR quando latestAssessment está presente', () => {
    render(<CompanyCard org={orgWithAssessment} />)
    // "2026-05-01T12:30:00Z" → "01/05/2026" (formato pt-BR)
    expect(screen.getByText(/01\/05\/2026/)).toBeDefined()
  })

  // Caso 5: Link "Ver detalhes →" aponta para /admin/orgs/{org.id}
  it('renderiza Link "Ver detalhes →" com href para /admin/orgs/{org.id}', () => {
    render(<CompanyCard org={orgBase} />)
    const link = screen.getByRole('link', { name: /ver detalhes/i })
    expect(link).toBeDefined()
    expect(link.getAttribute('href')).toBe('/admin/orgs/org-1')
  })

  // Caso 6: exibe nome da empresa e CNPJ com classe font-mono
  it('exibe nome da empresa e CNPJ', () => {
    render(<CompanyCard org={orgBase} />)
    expect(screen.getByText('Construtora Alpha')).toBeDefined()
    // CNPJ deve aparecer na tela com classe font-mono
    const cnpjEl = screen.getByText('12345678000195')
    expect(cnpjEl).toBeDefined()
    expect(cnpjEl.className).toContain('font-mono')
  })
})
