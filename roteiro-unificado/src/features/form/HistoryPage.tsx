import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { Button, Spinner } from '@/components/ui'
import { useAuth } from '@/features/auth/useAuth'
import { HistoryContent } from './HistoryContent'

/**
 * Página /form/:orgId/history — histórico de versões de avaliações da organização.
 *
 * Aplica cross-tenant guard (mirrors FormLayout — Phase 5) e delega todo o
 * conteúdo para HistoryContent, que é a fonte única da lógica de fetch/render.
 * O wrapper de página (max-w-3xl, botão "← Voltar") permanece aqui.
 */
export function HistoryPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const { orgId: authOrgId, isLoading: authLoading } = useAuth()

  // Cross-tenant guard — mirrors FormLayout (Phase 5)
  if (authLoading || !orgId || !authOrgId) {
    return (
      <div className="bg-primary flex min-h-screen items-center justify-center">
        <Spinner size="lg" className="border-white border-t-transparent" />
      </div>
    )
  }

  if (orgId !== authOrgId) {
    return <Navigate to={`/form/${authOrgId}/history`} replace />
  }

  return <HistoryPageContent orgId={orgId} />
}

function HistoryPageContent({ orgId }: { orgId: string }) {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Botão voltar — acima do h1 (per UI-SPEC §HistoryPage) */}
      <Button variant="ghost" size="sm" onClick={() => navigate(`/form/${orgId}`)} className="mb-4">
        ← Voltar ao Formulário
      </Button>

      {/* HistoryContent renderiza h1, subtítulo, skeleton, empty state e lista de versões */}
      <HistoryContent orgId={orgId} showHeading />
    </div>
  )
}
