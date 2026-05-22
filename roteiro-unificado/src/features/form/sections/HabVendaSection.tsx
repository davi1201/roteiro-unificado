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
    <form className="max-w-5xl" noValidate>
      {/* ── Grupo flat: Canais e situações comerciais ─────────────────────── */}
      <div className="mb-6 space-y-4">
        <h2 className="mb-2 text-base font-semibold text-gray-900">
          Canais e situações comerciais
        </h2>

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

      <hr className="my-6 border-gray-100" />

      {/* ── Grupo matriz: Cenários de habilitação ────────────────────────── */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          Matriz de cenários de habilitação
        </h2>

        {HAB_SCENARIOS.map((scenario) => {
          const scErr = scenarioErrors[scenario.slug] ?? {}
          return (
            <article
              key={scenario.slug}
              className="mb-4 rounded-md border border-gray-200 bg-white p-4"
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
    </form>
  )
}
