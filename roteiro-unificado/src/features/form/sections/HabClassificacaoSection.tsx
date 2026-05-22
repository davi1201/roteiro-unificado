import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFormStore, TabKey } from '@/stores/formStore'
import { habClassificacaoSchema, type HabClassificacaoData } from '@/schemas/hab-classificacao'
import { SelectField, TextareaField } from '@/components/ui'

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
    <form className="max-w-2xl" noValidate>
      {/* ── Grupo 1: Síntese para planejamento ────────────────────────────── */}
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

      <hr className="my-6 border-gray-100" />

      {/* ── Grupo 2: Plano e riscos ────────────────────────────────────────── */}
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

        <TextareaField
          name="observacoesFinais"
          control={control}
          label="Observações finais para proposta, escopo, preço e cronograma"
          error={errors.observacoesFinais?.message as string | undefined}
        />
      </div>
    </form>
  )
}
