import { TAB_CONFIG } from './tabConfig'
import { ProgressBadge } from './ProgressBadge'
import { computeTabStatus, STATUS_TO_COMPLETENESS } from '@/lib/sectionStatus'
import { TabKey } from '@/stores/formStore'
import { IDENTIFICACAO_REQUIRED_COUNT } from '@/schemas/identificacao'
import { TORRE_DECISAO_REQUIRED_COUNT } from '@/schemas/torre-decisao'
import { TORRE_SIENGE_REQUIRED_COUNT } from '@/schemas/torre-sienge'
import { TORRE_ACESSO_REQUIRED_COUNT } from '@/schemas/torre-acesso'
import { TORRE_CLASSIFICACAO_REQUIRED_COUNT } from '@/schemas/torre-classificacao'
import { HAB_VENDA_REQUIRED_COUNT } from '@/schemas/hab-venda'
import { HAB_REPOSITORIOS_REQUIRED_COUNT } from '@/schemas/hab-repositorios'
import { HAB_RESPONSAVEIS_REQUIRED_COUNT } from '@/schemas/hab-responsaveis'
import { HAB_CLASSIFICACAO_REQUIRED_COUNT } from '@/schemas/hab-classificacao'
import { NDA_REQUIRED_COUNT } from '@/schemas/nda'

// ─── Required counts per tab ──────────────────────────────────────────────────
// Nota (RESEARCH §REQUIRED_COUNT): apenas Identificação (2) e NDA (1) podem
// atingir 'complete'. As outras 8 abas têm requiredCount=0, portanto oscilam
// entre 'empty' e 'in-progress'. Isso é esperado — não corrigir.

const REQUIRED_COUNTS: Record<TabKey, number> = {
  [TabKey.Identificacao]: IDENTIFICACAO_REQUIRED_COUNT,
  [TabKey.TorreDecisao]: TORRE_DECISAO_REQUIRED_COUNT,
  [TabKey.TorreSienge]: TORRE_SIENGE_REQUIRED_COUNT,
  [TabKey.TorreAcesso]: TORRE_ACESSO_REQUIRED_COUNT,
  [TabKey.TorreClassificacao]: TORRE_CLASSIFICACAO_REQUIRED_COUNT,
  [TabKey.HabVenda]: HAB_VENDA_REQUIRED_COUNT,
  [TabKey.HabRepositorios]: HAB_REPOSITORIOS_REQUIRED_COUNT,
  [TabKey.HabResponsaveis]: HAB_RESPONSAVEIS_REQUIRED_COUNT,
  [TabKey.HabClassificacao]: HAB_CLASSIFICACAO_REQUIRED_COUNT,
  [TabKey.Nda]: NDA_REQUIRED_COUNT,
}

// ─── Status label/style config ────────────────────────────────────────────────

const STATUS_LABELS = {
  empty: { label: 'Não iniciado', className: 'bg-gray-100 text-gray-600' },
  'in-progress': { label: 'Em progresso', className: 'bg-orange-100 text-orange-700' },
  complete: { label: 'Completo', className: 'bg-green-100 text-green-700' },
} as const

// ─── Component ────────────────────────────────────────────────────────────────

interface SectionProgressProps {
  formData: Record<string, Record<string, unknown>> | null
}

/**
 * Grid de 10 cards mostrando o progresso de cada aba do formulário.
 *
 * Cada card exibe:
 * - ProgressBadge (ícone visual: vazio / relógio laranja / check verde)
 * - Label da aba
 * - Pill de status: "Não iniciado" / "Em progresso" / "Completo"
 *
 * Consome computeTabStatus de @/lib/sectionStatus — leitura pura do JSONB
 * do draft, independente do Zustand (D-05).
 *
 * T-09-INJ: formData é tratado apenas como dados numéricos/typeof;
 * pills exibem strings fixas; nunca dangerouslySetInnerHTML.
 */
export function SectionProgress({ formData }: SectionProgressProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {TAB_CONFIG.map(({ key, label }) => {
        const status = computeTabStatus(key, formData, REQUIRED_COUNTS[key])
        const completeness = STATUS_TO_COMPLETENESS[status]
        const { label: statusLabel, className: statusClassName } = STATUS_LABELS[status]

        return (
          <div key={key} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <ProgressBadge completeness={completeness} />
              <span className="text-sm font-medium text-gray-900">{label}</span>
            </div>
            <span
              className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs ${statusClassName}`}
            >
              {statusLabel}
            </span>
          </div>
        )
      })}
    </div>
  )
}
