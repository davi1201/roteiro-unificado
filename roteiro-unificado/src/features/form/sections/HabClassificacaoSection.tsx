import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFormStore, TabKey } from '@/stores/formStore'
import { habClassificacaoSchema, type HabClassificacaoData } from '@/schemas/hab-classificacao'
import { SelectField, TextareaField } from '@/components/ui'
import { FormCard } from '../FormCard'
import { FormCardRow } from '../FormCardRow'

// ─── Option constants ─────────────────────────────────────────────────────────

const classificacaoFinalOptions = [
  { value: 'hab-a', label: 'HAB-A — Pronta para operação' },
  { value: 'hab-b', label: 'HAB-B — Organizada com lacunas' },
  { value: 'hab-c', label: 'HAB-C — Controle parcial' },
  { value: 'hab-d', label: 'HAB-D — Risco alto' },
  { value: 'hab-e', label: 'HAB-E — Não recomendada sem ativação' },
]

const abordagemOptions = [
  { value: 'implantar-direto', label: 'Implantar direto' },
  { value: 'implantar-carga-assistida', label: 'Implantar com carga inicial assistida' },
  { value: 'ativar-repositorio-responsaveis', label: 'Ativar repositório e responsáveis primeiro' },
  { value: 'comecar-dossie-especifico', label: 'Começar por dossiê específico' },
  { value: 'fase-preparatoria', label: 'Fazer fase preparatória antes do produto' },
]

const escopoOptions = [
  { value: 'empresa-cnpj', label: 'Empresa/CNPJ' },
  { value: 'obra-empreendimento', label: 'Obra/empreendimento' },
  { value: 'financiamento', label: 'Financiamento' },
  { value: 'licitacao', label: 'Licitação' },
  { value: 'contrato-privado-homologacao', label: 'Contrato privado/homologação' },
  { value: 'fiscalizacao-auditoria', label: 'Fiscalização/auditoria' },
  { value: 'misto-reduzido', label: 'Misto reduzido' },
]

const complexidadeOptions = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
]

// ─── Component ────────────────────────────────────────────────────────────────

interface HabClassificacaoSectionProps {
  tenantId: string
}

export function HabClassificacaoSection({ tenantId }: HabClassificacaoSectionProps) {
  const store = useFormStore(tenantId)

  const {
    control,
    watch,
    formState: { errors },
  } = useForm<HabClassificacaoData>({
    resolver: zodResolver(habClassificacaoSchema),
    defaultValues: (store.sectionData[TabKey.HabClassificacao] ??
      {}) as Partial<HabClassificacaoData>,
    mode: 'onBlur',
  })

  // D-02: sync RHF → Zustand via subscription (evita loop infinito — watch() retorna
  // novo objeto a cada render, o que causaria deps instáveis no useEffect)
  useEffect(() => {
    const subscription = watch((values) => {
      store.updateSection(TabKey.HabClassificacao, values as Record<string, unknown>)
    })
    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form className="flex max-w-4xl flex-col gap-4" noValidate>
      {/* ROW 1 — full width: Classificação Habilitações */}
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
          title="Classificação Habilitações"
          subtitle="Nível de prontidão documental"
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

            <SelectField
              name="escopoInicialSugerido"
              control={control}
              label="Escopo inicial sugerido"
              options={escopoOptions}
              error={errors.escopoInicialSugerido?.message as string | undefined}
            />

            <SelectField
              name="complexidadePreco"
              control={control}
              label="Complexidade / preço"
              options={complexidadeOptions}
              error={errors.complexidadePreco?.message as string | undefined}
            />
          </div>
        </FormCard>
      </FormCardRow>

      {/* ROW 2 — full width: Plano por Dimensão */}
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
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          }
          iconColor="purple"
          title="Plano por Dimensão"
          subtitle="Fases, riscos e observações finais"
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
              name="riscosPrincipais"
              control={control}
              label="Riscos principais para contrato"
              error={errors.riscosPrincipais?.message as string | undefined}
            />

            <TextareaField
              name="evidenciasEssenciais"
              control={control}
              label="Evidências essenciais a solicitar"
              error={errors.evidenciasEssenciais?.message as string | undefined}
            />
          </div>

          <TextareaField
            name="observacoesFinais"
            control={control}
            label="Observações finais para proposta, escopo, preço e cronograma"
            error={errors.observacoesFinais?.message as string | undefined}
          />
        </FormCard>
      </FormCardRow>
    </form>
  )
}
