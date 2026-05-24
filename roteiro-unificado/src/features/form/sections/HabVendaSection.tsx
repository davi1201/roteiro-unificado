import { useEffect } from 'react'
import { useForm, type FieldPath } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFormStore, TabKey } from '@/stores/formStore'
import {
  habVendaSchema,
  type HabVendaData,
  type HabScenarioSlug,
  HAB_SCENARIOS,
} from '@/schemas/hab-venda'
import { SelectField, TextareaField } from '@/components/ui'
import { FormCard } from '../FormCard'
import { FormCardRow } from '../FormCardRow'

// ─── Option constants (slug values + Portuguese labels matching HTML) ─────────

const principalFormaVendaOptions = [
  { value: 'venda-propria', label: 'Venda própria / incorporação' },
  { value: 'contratos-privados', label: 'Contratos privados' },
  { value: 'licitacoes', label: 'Licitações' },
  { value: 'obras-terceiros', label: 'Obras para terceiros' },
  { value: 'financiamento-habitacional', label: 'Financiamento habitacional' },
  { value: 'misto', label: 'Misto' },
]

const quemPedeDocumentosOptions = [
  { value: 'bancos', label: 'Bancos' },
  { value: 'clientes-privados', label: 'Clientes privados' },
  { value: 'orgaos-publicos', label: 'Órgãos públicos' },
  { value: 'seguradoras', label: 'Seguradoras' },
  { value: 'cartorios', label: 'Cartórios' },
  { value: 'investidores', label: 'Investidores' },
  { value: 'misto', label: 'Misto' },
]

const prazoTipicoOptions = [
  { value: 'mesmo-dia', label: 'Mesmo dia' },
  { value: '1-3-dias', label: '1 a 3 dias' },
  { value: 'ate-1-semana', label: 'Até 1 semana' },
  { value: 'mais-1-semana', label: 'Mais de 1 semana' },
  { value: 'sem-padrao', label: 'Não há padrão' },
]

const perdeuOportunidadeOptions = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
  { value: 'quase', label: 'Quase perdeu' },
  { value: 'nao-sabe', label: 'Não sabe' },
]

const aconteceOptions = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
  { value: 'parcial', label: 'Parcial' },
  { value: 'nao-sabe', label: 'Não sabe' },
]

const importanciaOptions = [
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Média' },
  { value: 'baixa', label: 'Baixa' },
  { value: 'eventual', label: 'Eventual' },
]

// Tipo auxiliar para acessar errors.scenarios aninhados do RHF
// RHF tem suporte parcial a FieldErrors aninhados — cast controlado (T-07-03-01)
type ScenarioErrors = Record<HabScenarioSlug, Record<string, { message?: string }>>

interface HabVendaSectionProps {
  tenantId: string
}

export function HabVendaSection({ tenantId }: HabVendaSectionProps) {
  const store = useFormStore(tenantId)

  const {
    control,
    watch,
    formState: { errors },
  } = useForm<HabVendaData>({
    resolver: zodResolver(habVendaSchema),
    defaultValues: (store.sectionData[TabKey.HabVenda] ?? {}) as Partial<HabVendaData>,
    mode: 'onBlur',
  })

  // D-02: sync RHF → Zustand via subscription (evita loop infinito — watch() retorna
  // novo objeto a cada render, o que causaria deps instáveis no useEffect)
  useEffect(() => {
    const subscription = watch((values) => {
      store.updateSection(TabKey.HabVenda, values as Record<string, unknown>)
    })
    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const scenarioErrors = (errors.scenarios as unknown as ScenarioErrors) ?? {}

  return (
    <form className="flex max-w-4xl flex-col gap-4" noValidate>
      {/* ROW 1 — full width: Visão Geral de Venda */}
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
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
          }
          iconColor="blue"
          title="Visão Geral de Venda"
          subtitle="Canais e situações comerciais"
        >
          <div className="flex flex-col gap-4">
            <SelectField
              name="principalFormaVenda"
              control={control}
              label="Principal forma de venda"
              options={principalFormaVendaOptions}
              error={errors.principalFormaVenda?.message as string | undefined}
            />

            <SelectField
              name="quemPedeDocumentos"
              control={control}
              label="Quem pede documentos?"
              options={quemPedeDocumentosOptions}
              error={errors.quemPedeDocumentos?.message as string | undefined}
            />

            <SelectField
              name="prazoTipico"
              control={control}
              label="Prazo típico para reunir documentos"
              options={prazoTipicoOptions}
              error={errors.prazoTipico?.message as string | undefined}
            />

            <SelectField
              name="perdeuOportunidade"
              control={control}
              label="Já perdeu oportunidade por documentação?"
              options={perdeuOportunidadeOptions}
              error={errors.perdeuOportunidade?.message as string | undefined}
            />

            <TextareaField
              name="principaisExigencias"
              control={control}
              label="Principais exigências recorrentes"
              error={errors.principaisExigencias?.message as string | undefined}
            />

            <TextareaField
              name="ondeCostumaTravar"
              control={control}
              label="Onde costuma travar?"
              error={errors.ondeCostumaTravar?.message as string | undefined}
            />
          </div>
        </FormCard>
      </FormCardRow>

      {/* ROW 2 — full width: Cenários de Venda (10 cenários × 5 colunas) */}
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
                d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125h-1.5m2.625-1.5V5.625M6 18.375V5.625m15.75 0A1.125 1.125 0 0 0 20.625 4.5H3.375A1.125 1.125 0 0 0 2.25 5.625m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h1.5m-1.5 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h17.25"
              />
            </svg>
          }
          iconColor="amber"
          title="Matriz de Cenários de Habilitação"
          subtitle="10 cenários de venda avaliados por importância e dificuldade"
        >
          <div className="flex flex-col gap-4">
            {HAB_SCENARIOS.map((scenario) => {
              const scErr = scenarioErrors[scenario.slug] ?? {}
              return (
                <article
                  key={scenario.slug}
                  className="rounded-md border border-gray-200 bg-gray-50 p-4"
                >
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">{scenario.label}</h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <SelectField
                      name={`scenarios.${scenario.slug}.acontece` as FieldPath<HabVendaData>}
                      control={control}
                      label="Acontece hoje?"
                      options={aconteceOptions}
                      error={scErr.acontece?.message}
                    />
                    <SelectField
                      name={`scenarios.${scenario.slug}.importancia` as FieldPath<HabVendaData>}
                      control={control}
                      label="Importância"
                      options={importanciaOptions}
                      error={scErr.importancia?.message}
                    />
                    <TextareaField
                      name={`scenarios.${scenario.slug}.quemConduz` as FieldPath<HabVendaData>}
                      control={control}
                      label="Quem conduz"
                      rows={2}
                      error={scErr.quemConduz?.message}
                    />
                    <TextareaField
                      name={
                        `scenarios.${scenario.slug}.principalDificuldade` as FieldPath<HabVendaData>
                      }
                      control={control}
                      label="Principal dificuldade"
                      rows={2}
                      error={scErr.principalDificuldade?.message}
                    />
                  </div>
                  <div className="mt-3">
                    <TextareaField
                      name={`scenarios.${scenario.slug}.observacoes` as FieldPath<HabVendaData>}
                      control={control}
                      label="Observações para escopo"
                      rows={2}
                      error={scErr.observacoes?.message}
                    />
                  </div>
                </article>
              )
            })}
          </div>
        </FormCard>
      </FormCardRow>
    </form>
  )
}
