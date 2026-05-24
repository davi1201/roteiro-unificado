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
import { FormCard } from '../FormCard'
import { FormCardRow } from '../FormCardRow'

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
    <form className="flex max-w-4xl flex-col gap-4" noValidate>
      {/* ROW 1 — full width: Estrutura de Decisão */}
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
                d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
              />
            </svg>
          }
          iconColor="blue"
          title="Estrutura de Decisão"
          subtitle="Ritual, fontes de informação e BI"
        >
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
                <label className="text-sm font-semibold text-gray-700">
                  Qual ferramenta de BI?
                </label>
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
              <label className="text-sm font-semibold text-gray-700">
                Quem prepara a informação?
              </label>
              <Input
                type="text"
                placeholder="Controladoria, financeiro, engenharia, TI..."
                {...register('quemPreparaInfo')}
                error={!!errors.quemPreparaInfo}
                errorMessage={errors.quemPreparaInfo?.message}
              />
            </div>
          </div>
        </FormCard>
      </FormCardRow>

      {/* ROW 2 — cols-2: Nível Gerencial | Indicadores Atuais */}
      <FormCardRow cols={2}>
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
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          }
          iconColor="green"
          title="Nível Gerencial"
          subtitle="Maturidade atual de gestão"
        >
          <SelectField
            name="nivelGerencial"
            control={control}
            label="Nível gerencial atual"
            options={nivelGerencialOptions}
            placeholder="Selecione..."
            error={errors.nivelGerencial?.message}
          />
        </FormCard>

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
                d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
              />
            </svg>
          }
          iconColor="amber"
          title="Indicadores Atuais"
          subtitle="Relatórios e divergências"
        >
          <div className="flex flex-col gap-4">
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
        </FormCard>
      </FormCardRow>

      {/* ROW 3 — full width: Decisões a Melhorar */}
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
                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
              />
            </svg>
          }
          iconColor="purple"
          title="Decisões a Melhorar"
          subtitle="Prioridades da Torre 360"
        >
          <CheckboxGroupField
            name="decisoesMelhorar"
            control={control}
            label="Decisões que a Torre deve melhorar primeiro"
            options={decisoesMelhorarOptions}
            error={errors.decisoesMelhorar?.message as string | undefined}
          />
        </FormCard>
      </FormCardRow>
    </form>
  )
}
