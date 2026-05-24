import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFormStore, TabKey } from '@/stores/formStore'
import {
  torreClassificacaoSchema,
  type TorreClassificacaoData,
} from '@/schemas/torre-classificacao'
import { SelectField, TextareaField, CheckboxGroupField } from '@/components/ui'
import { FormCard } from '../FormCard'
import { FormCardRow } from '../FormCardRow'

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

  // D-02: sync RHF → Zustand via subscription (evita loop infinito — watch() retorna
  // novo objeto a cada render, o que causaria deps instáveis no useEffect)
  useEffect(() => {
    const subscription = watch((values) => {
      store.updateSection(TabKey.TorreClassificacao, values as Record<string, unknown>)
    })
    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form className="flex max-w-4xl flex-col gap-4" noValidate>
      {/* ROW 1 — full width: Classificação Torre 360 */}
      <FormCardRow cols={1}>
        <FormCard
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"
              />
            </svg>
          }
          iconColor="blue"
          title="Classificação Torre 360"
          subtitle="Nível de prontidão para integração"
        >
          <div className="flex flex-col gap-4">
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
        </FormCard>
      </FormCardRow>

      {/* ROW 2 — full width: Plano Macro por Fases */}
      <FormCardRow cols={1}>
        <FormCard
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
              />
            </svg>
          }
          iconColor="green"
          title="Plano Macro por Fases"
          subtitle="Etapas, escopo e riscos"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

          <TextareaField
            name="proximosPassos"
            control={control}
            label="Próximos passos"
            error={errors.proximosPassos?.message as string | undefined}
          />
        </FormCard>
      </FormCardRow>

      {/* ROW 3 — full width: Evidências a Solicitar */}
      <FormCardRow cols={1}>
        <FormCard
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          }
          iconColor="purple"
          title="Evidências a Solicitar"
          subtitle="Documentos e dados necessários"
        >
          <CheckboxGroupField
            name="evidenciasSolicitar"
            control={control}
            label="Selecione as evidências a solicitar"
            options={evidenciasOptions}
            error={errors.evidenciasSolicitar?.message as string | undefined}
          />
        </FormCard>
      </FormCardRow>
    </form>
  )
}
