import { useState } from 'react'
import { Button } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

interface ExportPdfButtonProps {
  assessmentId: string
  version: number
  orgName: string
  cnpj: string | null
  grade: string | null
}

/**
 * Botão "Exportar PDF" com state machine IDLE/LOADING/ERROR.
 *
 * O chunk pdf é carregado APENAS via dynamic import ao clicar (EXPORT-05).
 * NUNCA fazer import estático de '@/lib/pdf/index' neste arquivo.
 */
export function ExportPdfButton({
  assessmentId,
  version,
  orgName,
  cnpj,
  grade,
}: ExportPdfButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  async function handleExport() {
    setIsLoading(true)
    try {
      // Dynamic import — garante chunk isolado (EXPORT-05)
      const { generateAndOpenPDF } = await import('@/lib/pdf/index')
      await generateAndOpenPDF({ assessmentId, version, orgName, cnpj, grade })
    } catch {
      toast.error('Falha ao gerar PDF. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      isLoading={isLoading}
      onClick={handleExport}
      aria-label={`Exportar PDF — Versão ${version}`}
      aria-busy={isLoading}
    >
      {isLoading ? 'Gerando...' : 'Exportar PDF'}
    </Button>
  )
}
