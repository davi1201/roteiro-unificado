import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui'
import { Skeleton } from '@/components/ui/skeleton'
import { useOrgsWithReadiness } from '@/features/admin/useOrgsWithReadiness'
import type { OrgWithReadiness } from '@/features/admin/useOrgsWithReadiness'
import { CompanyCard } from '@/components/admin/CompanyCard'
import { CreateOrgModal } from '@/components/admin/CreateOrgModal'
import { useToast } from '@/hooks/useToast'

/**
 * Função pura de filtragem exportada para testabilidade (Plan 09-04 Task 1).
 *
 * @param orgs       lista de OrgWithReadiness
 * @param searchTerm texto de busca (nome ou CNPJ) — '' = sem filtro
 * @param gradeFilter 'Todos' | 'G1'..'G5' | 'Sem avaliação'
 */
export function filterOrgs(
  orgs: OrgWithReadiness[],
  searchTerm: string,
  gradeFilter: string
): OrgWithReadiness[] {
  return orgs.filter((org) => {
    const matchesSearch =
      searchTerm === '' ||
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org.cnpj ?? '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesGrade =
      gradeFilter === 'Todos' ||
      (gradeFilter === 'Sem avaliação'
        ? !org.latestAssessment
        : org.latestAssessment?.readiness_level_mgmt === gradeFilter)

    return matchesSearch && matchesGrade
  })
}

const GRADE_OPTIONS = ['Todos', 'G1', 'G2', 'G3', 'G4', 'G5', 'Sem avaliação']

export function AdminDashboard() {
  const { data: orgs = [], isLoading, isError, error } = useOrgsWithReadiness()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [gradeFilter, setGradeFilter] = useState('Todos')
  const toast = useToast()

  useEffect(() => {
    if (isError) {
      toast.error('Erro ao carregar organizações')
      console.error('useOrgsWithReadiness error:', error)
    }
  }, [isError, error, toast])

  const filteredOrgs = useMemo(
    () => filterOrgs(orgs, searchTerm, gradeFilter),
    [orgs, searchTerm, gradeFilter]
  )

  const hasActiveFilters = searchTerm !== '' || gradeFilter !== 'Todos'

  const handleNewOrg = () => setIsCreateModalOpen(true)

  const handleClearFilters = () => {
    setSearchTerm('')
    setGradeFilter('Todos')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Painel de Prontidão</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Visão geral de todas as organizações do piloto
          </p>
        </div>
        <Button
          variant="primary"
          className="bg-accent hover:bg-accent-600 text-white"
          onClick={handleNewOrg}
        >
          Nova Organização
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Busca por nome ou CNPJ */}
        <div className="flex min-w-[220px] flex-1 flex-col gap-1">
          <label htmlFor="search" className="text-sm font-medium text-gray-700">
            Busca
          </label>
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou CNPJ"
            className="focus:border-primary focus:ring-primary rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
          />
        </div>

        {/* Nível de prontidão */}
        <div className="flex flex-col gap-1">
          <label htmlFor="grade-filter" className="text-sm font-medium text-gray-700">
            Nível de prontidão
          </label>
          <select
            id="grade-filter"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="focus:border-primary focus:ring-primary rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
          >
            {GRADE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Limpar filtros */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Contagem de resultados */}
      {!isLoading && (
        <p className="text-sm text-gray-500">{filteredOrgs.length} empresa(s) encontrada(s)</p>
      )}

      {/* Grid de cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Loading: 6 skeleton cards */}
        {isLoading &&
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}

        {/* Empty inicial: nenhuma empresa cadastrada */}
        {!isLoading && orgs.length === 0 && (
          <div className="col-span-full rounded-lg border border-gray-200 bg-white py-12 text-center">
            <p className="text-base font-semibold text-gray-900">Nenhuma empresa cadastrada</p>
            <p className="mt-2 text-sm text-gray-500">
              Clique em "Nova Organização" para adicionar a primeira empresa.
            </p>
          </div>
        )}

        {/* Empty pós-filtro */}
        {!isLoading && orgs.length > 0 && filteredOrgs.length === 0 && (
          <div className="col-span-full rounded-lg border border-gray-200 bg-white py-12 text-center">
            <p className="text-base font-semibold text-gray-900">
              Nenhuma empresa encontrada para os filtros selecionados.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Tente ajustar os filtros de busca ou nível de prontidão.
            </p>
          </div>
        )}

        {/* Dados: grid de CompanyCards */}
        {!isLoading && filteredOrgs.map((org) => <CompanyCard key={org.id} org={org} />)}
      </div>

      <CreateOrgModal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  )
}
