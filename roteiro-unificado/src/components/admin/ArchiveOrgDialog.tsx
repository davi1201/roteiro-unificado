import {
  Button,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from '@/components/ui'
import { useArchiveOrg } from '@/features/admin/useArchiveOrg'

interface ArchiveOrgDialogProps {
  open: boolean
  orgId: string | null
  orgName: string | null
  onClose: () => void
}

export function ArchiveOrgDialog({ open, orgId, orgName, onClose }: ArchiveOrgDialogProps) {
  const archiveOrgMutation = useArchiveOrg()

  const handleConfirm = () => {
    if (!orgId) return
    archiveOrgMutation.mutate(orgId, {
      onSuccess: () => onClose(),
    })
  }

  // Só renderiza Dialog quando há org alvo
  if (!orgId || !orgName) return null

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Arquivar organização</DialogTitle>
      </DialogHeader>

      <DialogContent>
        <p className="text-sm text-gray-700">
          Tem certeza que deseja arquivar <strong className="font-semibold">{orgName}</strong>? A
          organização e seus dados serão mantidos, mas ela não aparecerá mais como ativa na
          listagem.
        </p>
      </DialogContent>

      <DialogFooter>
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={archiveOrgMutation.isPending}
        >
          Manter organização
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={handleConfirm}
          isLoading={archiveOrgMutation.isPending}
        >
          {archiveOrgMutation.isPending ? 'Arquivando...' : 'Sim, arquivar'}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
