import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFormStore, TabKey } from '@/stores/formStore'
import { torreDecisaoSchema, type TorreDecisaoData } from '@/schemas/torre-decisao'
import {
  Input,
  SelectField,
  TextareaField,
  CheckboxGroupField,
  ConditionalField,
} from '@/components/ui'

// ---------------------------------------------------------------------------
// Options — values usam slugs do schema; labels são texto do HTML de referência
// ---------------------------------------------------------------------------

const reuniaoOptions = [
  { value: 'semanal', label: 'Semanal' },
  { value: 'quinzenal', label: 'Quinzenal' },
  { value: 'mensal', label: 'Mensal' },
  { value: 'eventual', label: 'Eventual' },
  { value: 'nao-estruturada', label: 'Não estruturada' },
]

const infoOptions = [
  { value: 'bi-dashboard', label: 'BI/dashboard' },
  { value: 'excel', label: 'Excel/planilhas' },
  { value: 'relatorios-sienge', label: 'Relatórios Sienge' },
  { value: 'pdf', label: 'PDF/apresentação' },
  { value: 'email-whatsapp', label: 'E-mail/WhatsApp' },
  { value: 'misto', label: 'Misto' },
]

const biOptions = [
  { value: 'sim-power-bi', label: 'Sim, Power BI' },
  { value: 'sim-outra', label: 'Sim, outra ferramenta' },
  { value: 'em-implantacao', label: 'Em implantação' },
  { value: 'nao', label: 'Não' },
]

const nivelGerencialOptions = [
  { value: 'g1', label: 'G1 — Decisão informal' },
  { value: 'g2', label: 'G2 — Relatórios manuais' },
  { value: 'g3', label: 'G3 — BI parcial' },
  { value: 'g4', label: 'G4 — Gestão orientada por dados' },
  { value: 'g5', label: 'G5 — Gestão avançada' },
]

const decisoesMelhorarOptions = [
  { value: 'caixa', label: 'Caixa realizado/projetado' },
  { value: 'contas', label: 'Contas a pagar/receber' },
  { value: 'inadimplencia', label: 'Inadimplência' },
  { value: 'margem', label: 'Margem por obra' },
  { value: 'orcado-realizado', label: 'Orçado x realizado' },
  { value: 'avanco-fisico', label: 'Avanço físico/prazo' },
  { value: 'compras-criticas', label: 'Compras críticas' },
  { value: 'vendas-estoque', label: 'Vendas/estoque' },
  { value: 'pos-obra', label: 'Pós-obra/qualidade' },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface TorreDecisaoSectionProps {
  tenantId: string
}

export function TorreDecisaoSection({ tenantId }: TorreDecisaoSectionProps) {
  const store = useFormStore(tenantId)

  const {
    control,
    watch,
    unregister,
    register,
    formState: { errors },
  } = useForm<TorreDecisaoData>({
    resolver: zodResolver(torreDecisaoSchema),
    defaultValues: (store.sectionData[TabKey.TorreDecisao] ?? {}) as Partial<TorreDecisaoData>,
    mode: 'onBlur',
  })

  // D-02: sync RHF → Zustand via subscription (evita loop infinito — watch() retorna
  // novo objeto a cada render, o que causaria deps instáveis no useEffect)
  useEffect(() => {
    const subscription = watch((values) => {
      store.updateSection(TabKey.TorreDecisao, values as Record<string, unknown>)
    })
    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // FORM-06: campo condicional qualBI — aparece quando BI está ativo
  const watchedExisteBI = watch('existeBI')
  const mostraQualBI = watchedExisteBI === 'sim-power-bi' || watchedExisteBI === 'sim-outra'

  return (
    <form className="max-w-2xl" noValidate>
      {/* ------------------------------------------------------------------ */}
      {/* Grupo 1: Ritual e fontes de decisão                                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-4">
        <SelectField
          name="reuniaoGestao"
          control={control}
          label="Existe reunião de gestão?"
          options={reuniaoOptions}
          placeholder="Selecione..."
          error={errors.reuniaoGestao?.message}
        />

        <SelectField
          name="comoInformacaoChega"
          control={control}
          label="Como a informação chega?"
          options={infoOptions}
          placeholder="Selecione..."
          error={errors.comoInformacaoChega?.message}
        />

        <SelectField
          name="existeBI"
          control={control}
          label="Existe BI hoje?"
          options={biOptions}
          placeholder="Selecione..."
          error={errors.existeBI?.message}
        />

        {/* Campo condicional FORM-06: qualBI */}
        <ConditionalField
          condition={mostraQualBI}
          fieldName="qualBI"
          unregisterFn={unregister as (name: string, options?: { keepValue?: boolean }) => void}
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Qual ferramenta de BI?</label>
            <Input
              type="text"
              placeholder="Ex: Power BI Pro, Looker, Tableau..."
              {...register('qualBI')}
              error={!!errors.qualBI}
              errorMessage={errors.qualBI?.message}
            />
          </div>
        </ConditionalField>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Quem prepara a informação?</label>
          <Input
            type="text"
            placeholder="Controladoria, financeiro, engenharia, TI..."
            {...register('quemPreparaInfo')}
            error={!!errors.quemPreparaInfo}
            errorMessage={errors.quemPreparaInfo?.message}
          />
        </div>

        <TextareaField
          name="relatoriosDiretoria"
          control={control}
          label="Relatórios/dashboards usados pela diretoria"
          error={errors.relatoriosDiretoria?.message}
        />

        <TextareaField
          name="numerosQuestionados"
          control={control}
          label="Números questionados ou divergentes"
          error={errors.numerosQuestionados?.message}
        />
      </div>

      <hr className="my-6 border-gray-100" />

      {/* ------------------------------------------------------------------ */}
      {/* Grupo 2: Decisões prioritárias                                        */}
      {/* ------------------------------------------------------------------ */}
      <CheckboxGroupField
        name="decisoesMelhorar"
        control={control}
        label="Decisões que a Torre deve melhorar primeiro"
        options={decisoesMelhorarOptions}
        error={errors.decisoesMelhorar?.message as string | undefined}
      />

      <hr className="my-6 border-gray-100" />

      {/* ------------------------------------------------------------------ */}
      {/* Grupo 3: Nível gerencial e observações                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-4">
        <SelectField
          name="nivelGerencial"
          control={control}
          label="Nível gerencial atual"
          options={nivelGerencialOptions}
          placeholder="Selecione..."
          error={errors.nivelGerencial?.message}
        />

        <TextareaField
          name="observacoesGerenciais"
          control={control}
          label="Observações gerenciais essenciais"
          error={errors.observacoesGerenciais?.message}
        />
      </div>
    </form>
  )
}
