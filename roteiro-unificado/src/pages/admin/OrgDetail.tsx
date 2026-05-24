import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, Card, CardHeader, CardContent, Spinner } from '@/components/ui'
import { useOrgDetail } from '@/features/admin/useOrgDetail'
import { MemberTable } from '@/components/admin/MemberTable'
import { AddMemberModal } from '@/components/admin/AddMemberModal'
import { ArchiveOrgDialog } from '@/components/admin/ArchiveOrgDialog'
import { AssessmentSection } from '@/components/admin/AssessmentSection'

export function OrgDetail() {
  const { orgId } = useParams<{ orgId: string }>()
  const { org, members, isLoading } = useOrgDetail(orgId)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isArchiveOpen, setIsArchiveOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!org) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-gray-900">Organização não encontrada</h1>
        <Link to="/admin/dashboard" className="text-primary text-sm hover:underline">
          ← Voltar para Organizações
        </Link>
      </div>
    )
  }

  // Status badge inline (mesmo padrao de OrgTable mas so leitura)
  const statusBadge = org.active ? (
    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
      Ativa
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
      Arquivada
    </span>
  )

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm" aria-label="Breadcrumb">
        <Link to="/admin/dashboard" className="text-gray-500 hover:text-gray-900">
          Organizações
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="font-medium text-gray-900">{org.name}</span>
      </nav>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-900">{org.name}</h1>
          {statusBadge}
        </div>
        <Button variant="danger" onClick={() => setIsArchiveOpen(true)} disabled={!org.active}>
          {org.active ? 'Arquivar' : 'Arquivada'}
        </Button>
      </div>

      {/* Members card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Membros{members ? ` (${members.length})` : ''}
          </h2>
          <Button variant="primary" onClick={() => setIsAddMemberOpen(true)} disabled={!org.active}>
            Convidar Membro
          </Button>
        </CardHeader>
        <CardContent>
          <MemberTable members={members} isLoading={false} />
        </CardContent>
      </Card>

      {/* Assessment section — histórico de avaliações (Plan 09-04) */}
      {orgId && <AssessmentSection orgId={orgId} />}

      {/* Add member modal */}
      {orgId && (
        <AddMemberModal
          orgId={orgId}
          open={isAddMemberOpen}
          onClose={() => setIsAddMemberOpen(false)}
        />
      )}
      <ArchiveOrgDialog
        open={isArchiveOpen}
        orgId={org.id}
        orgName={org.name}
        onClose={() => setIsArchiveOpen(false)}
      />
    </div>
  )
}
