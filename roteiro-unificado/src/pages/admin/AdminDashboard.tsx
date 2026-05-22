import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui'
import { useOrgs } from '@/features/admin/useOrgs'
import { OrgTable } from '@/components/admin/OrgTable'
import { CreateOrgModal } from '@/components/admin/CreateOrgModal'
import { useToast } from '@/hooks/useToast'

const PAGE_SIZE = 10

export function AdminDashboard() {
  const { data: orgs = [], isLoading, isError, error } = useOrgs()
  const [page, setPage] = useState(1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (isError) {
      toast.error('Erro ao carregar organizações')
      console.error('useOrgs error:', error)
    }
  }, [isError, error, toast])

  const totalPages = Math.max(1, Math.ceil(orgs.length / PAGE_SIZE))
  const pagedOrgs = useMemo(
    () => orgs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [orgs, page]
  )

  const handleNewOrg = () => setIsCreateModalOpen(true)

  const handleArchive = (_orgId: string, _orgName: string) => {
    // será implementado no Plan 05 — abrir confirm dialog
    toast.info('Funcionalidade disponível em breve')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Organizações</h1>
        <Button
          variant="primary"
          className="bg-accent hover:bg-accent-600 text-white"
          onClick={handleNewOrg}
        >
          Nova Organização
        </Button>
      </div>

      <OrgTable orgs={pagedOrgs} isLoading={isLoading} onArchive={handleArchive} />

      {orgs.length > PAGE_SIZE && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span className="text-gray-600">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Próxima
          </Button>
        </div>
      )}
      <CreateOrgModal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  )
}
