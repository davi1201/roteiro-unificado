import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFormStore, TabKey } from '@/stores/formStore'
import {
  torreClassificacaoSchema,
  type TorreClassificacaoData,
} from '@/schemas/torre-classificacao'
import { SelectField, TextareaField, CheckboxGroupField } from '@/components/ui'

// ─── Option constants (slug values + Portuguese labels matching HTML) ─────────

const classificacaoFinalOptions = [
  { value: 't360-a', label: 'T360-A — Pronta para integração' },
  { value: 't360-b', label: 'T360-B — Integração híbrida' },
  { value: 't360-c', label: 'T360-C — Exige ativação de dados' },
  { value: 't360-d', label: 'T360-D — Risco alto' },
  { value: 't360-e', label: 'T360-E — Não recomendada agora' },
]

const abordagemOptions = [
  { value: 'integracao-sienge', label: 'Integração Sienge/API/Bulk' },
  { value: 'hibrida-sienge-bi', label: 'Híbrida: Sienge + BI/planilhas' },
  { value: 'ativacao-dados', label: 'Ativação de dados primeiro' },
  { value: 'reconciliacao-bi', label: 'Reconciliação com BI atual' },
  { value: 'projeto-preparatorio', label: 'Projeto preparatório' },
]

const evidenciasOptions = [
  { value: 'modulos-contratados', label: 'Lista de módulos Sienge contratados' },
  { value: 'confirmacao-api-bulk', label: 'Confirmação API REST/Bulk' },
  { value: 'relatorios-diretoria', label: 'Relatórios usados pela diretoria' },
  { value: 'bi-atual', label: 'BI atual: prints, links ou descrição' },
  { value: 'planilhas-criticas', label: 'Planilhas críticas' },
  { value: 'cnpjs-obras', label: 'Lista de CNPJs e obras ativas' },
  { value: 'fluxo-caixa', label: 'Exemplo de fluxo de caixa' },
  { value: 'orcamento-realizado', label: 'Exemplo de orçamento x realizado' },
  { value: 'responsaveis-area', label: 'Responsáveis por área' },
]

// ─── Component ────────────────────────────────────────────────────────────────

interface TorreClassificacaoSectionProps {
  tenantId: string
}

export function TorreClassificacaoSection({ tenantId }: TorreClassificacaoSectionProps) {
  const store = useFormStore(tenantId)

  const {
    control,
    watch,
    formState: { errors },
  } = useForm<TorreClassificacaoData>({
    resolver: zodResolver(torreClassificacaoSchema),
    defaultValues: (store.sectionData[TabKey.TorreClassificacao] ??
      {}) as Partial<TorreClassificacaoData>,
    mode: 'onBlur',
  })

  // D-02: sync RHF → Zustand (store excluído das deps para evitar loop — T-06-06-01)
  const values = watch()
  useEffect(() => {
    store.updateSection(TabKey.TorreClassificacao, values as Record<string, unknown>)
  }, [values]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form className="max-w-2xl" noValidate>
      {/* ── Grupo 1: Classificação da empresa ───────────────────────────── */}
      <div className="space-y-4">
        <SelectField
          name="classificacaoFinal"
          control={control}
          label="Classificação final"
          options={classificacaoFinalOptions}
          error={errors.classificacaoFinal?.message as string | undefined}
        />

        <SelectField
          name="abordagemRecomendada"
          control={control}
          label="Abordagem recomendada"
          options={abordagemOptions}
          error={errors.abordagemRecomendada?.message as string | undefined}
        />

        <TextareaField
          name="justificativa"
          control={control}
          label="Justificativa curta"
          error={errors.justificativa?.message as string | undefined}
        />
      </div>

      <hr className="my-6 border-gray-100" />

      {/* ── Grupo 2: Plano macro e riscos ──────────────────────────────── */}
      <div className="space-y-4">
        <TextareaField
          name="fase1"
          control={control}
          label="Fase 1 sugerida"
          error={errors.fase1?.message as string | undefined}
        />

        <TextareaField
          name="fase2"
          control={control}
          label="Fase 2 sugerida"
          error={errors.fase2?.message as string | undefined}
        />

        <TextareaField
          name="foraEscopo"
          control={control}
          label="Fora do escopo inicial"
          error={errors.foraEscopo?.message as string | undefined}
        />

        <TextareaField
          name="riscos"
          control={control}
          label="Riscos para contrato, preço e cronograma"
          error={errors.riscos?.message as string | undefined}
        />
      </div>

      <hr className="my-6 border-gray-100" />

      {/* ── Grupo 3: Evidências essenciais a solicitar ─────────────────── */}
      <div className="space-y-4">
        <CheckboxGroupField
          name="evidenciasSolicitar"
          control={control}
          label="Selecione as evidências a solicitar"
          options={evidenciasOptions}
          error={errors.evidenciasSolicitar?.message as string | undefined}
        />

        <TextareaField
          name="proximosPassos"
          control={control}
          label="Próximos passos"
          error={errors.proximosPassos?.message as string | undefined}
        />
      </div>
    </form>
  )
}
