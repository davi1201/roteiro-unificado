import { useState } from 'react'
import { Button } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { supabase } from '@/lib/supabase'

interface ExportJsonButtonProps {
  assessmentId: string
  version: number
  orgName: string
}

/**
 * Botão "Exportar JSON" — faz download do form_data da avaliação como arquivo .json.
 *
 * Segue o mesmo padrão do ExportPdfButton:
 * - State machine IDLE/LOADING/ERROR
 * - Toast em caso de falha
 * - RLS do Supabase protege o SELECT (sem filtro adicional necessário)
 */
export function ExportJsonButton({ assessmentId, version, orgName }: ExportJsonButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  async function handleExport() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('form_data, submitted_at, readiness_level_mgmt, readiness_level_tech')
        .eq('id', assessmentId)
        .single()

      if (error || !data) {
        throw new Error('Erro ao buscar dados da avaliação')
      }

      const payload = {
        assessmentId,
        version,
        orgName,
        exportedAt: new Date().toISOString(),
        submittedAt: data.submitted_at,
        readinessLevelMgmt: data.readiness_level_mgmt,
        readinessLevelTech: data.readiness_level_tech,
        formData: data.form_data,
      }

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      // Sanitiza o nome da org para uso em filename
      const safeName = orgName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      const filename = `avaliacao-v${version}-${safeName}.json`

      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      anchor.click()

      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch {
      toast.error('Falha ao exportar JSON. Tente novamente.')
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
      aria-label={`Exportar JSON — Versão ${version}`}
      aria-busy={isLoading}
    >
      {isLoading ? 'Exportando...' : 'Exportar JSON'}
    </Button>
  )
}
