import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemberTable } from '../MemberTable'
import type { OrgMemberWithEmail } from '@/types/database'

// Mock react-router-dom — sem dependência de Router
vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

const memberCompany: OrgMemberWithEmail = {
  id: 'member-1',
  org_id: 'org-1',
  user_id: 'user-1',
  role: 'company',
  created_at: '2026-01-01T00:00:00Z',
  email: 'company@example.com',
}

const memberAdmin: OrgMemberWithEmail = {
  id: 'member-2',
  org_id: 'org-1',
  user_id: 'user-2',
  role: 'admin',
  created_at: '2026-01-01T00:00:00Z',
  email: 'admin@example.com',
}

describe('MemberTable', () => {
  // N-03: Botão "Redefinir senha" deve aparecer apenas para membros com role 'company'
  it('exibe botão "Redefinir senha" para membro com role company', () => {
    render(<MemberTable members={[memberCompany]} isLoading={false} onResetPassword={vi.fn()} />)
    expect(screen.getByRole('button', { name: /redefinir senha/i })).toBeDefined()
  })

  // N-03: Botão "Redefinir senha" NÃO deve aparecer para membro com role 'admin'
  it('não exibe botão "Redefinir senha" para membro com role admin', () => {
    render(<MemberTable members={[memberAdmin]} isLoading={false} onResetPassword={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /redefinir senha/i })).toBeNull()
  })
})
