import { useEffect } from 'react'
import { useForm, type FieldPath } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFormStore, TabKey } from '@/stores/formStore'
import {
  torreSiengeSchema,
  type TorreSiengeData,
  type SiengeModuleSlug,
  SIENGE_MODULES,
} from '@/schemas/torre-sienge'
import { SelectField, TextareaField } from '@/components/ui'
import { FormCard } from '../FormCard'
import { FormCardRow } from '../FormCardRow'

// Opções para as 4 colunas select de cada módulo
const contratadoOptions = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
  { value: 'nao-sabe', label: 'Não sabe' },
  { value: 'nao-aplicavel', label: 'Não aplicável' },
]

const usoRealOptions = [
  { value: 'total', label: 'Total' },
  { value: 'parcial', label: 'Parcial' },
  { value: 'baixo', label: 'Baixo' },
  { value: 'nao-usa', label: 'Não usa' },
]

const confiancaOptions = [
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Média' },
  { value: 'baixa', label: 'Baixa' },
  { value: 'nao-confiavel', label: 'Não confiável' },
]

const paraleloOptions = [
  { value: 'nao', label: 'Não' },
  { value: 'excel', label: 'Sim, Excel' },
  { value: 'bi', label: 'Sim, BI' },
  { value: 'outro', label: 'Sim, outro sistema' },
  { value: 'informal', label: 'Sim, informal' },
]

// Tipo auxiliar para acessar errors.modules aninhados do RHF
// RHF tem suporte parcial a FieldErrors aninhados — cast controlado (T-06-04-04)
type ModuleErrors = Record<SiengeModuleSlug, Record<string, { message?: string }>>

interface TorreSiengeSectionProps {
  tenantId: string
}

export function TorreSiengeSection({ tenantId }: TorreSiengeSectionProps) {
  const store = useFormStore(tenantId)

  const {
    control,
    watch,
    formState: { errors },
  } = useForm<TorreSiengeData>({
    resolver: zodResolver(torreSiengeSchema),
    defaultValues: (store.sectionData[TabKey.TorreSienge] ?? {}) as Partial<TorreSiengeData>,
    mode: 'onBlur',
  })

  // D-02: sync RHF → Zustand via subscription (evita loop infinito — watch() retorna
  // novo objeto a cada render, o que causaria deps instáveis no useEffect)
  useEffect(() => {
    const subscription = watch((values) => {
      store.updateSection(TabKey.TorreSienge, values as Record<string, unknown>)
    })
    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const moduleErrors = (errors.modules as unknown as ModuleErrors) ?? {}

  return (
    <form className="flex max-w-4xl flex-col gap-4" noValidate>
      {/* ROW 1 — full width: Módulos do Sienge */}
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
                d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
              />
            </svg>
          }
          iconColor="blue"
          title="Módulos do Sienge"
          subtitle="12 módulos avaliados em 5 dimensões"
        >
          <div className="flex flex-col gap-4">
            {SIENGE_MODULES.map((module) => {
              const modErr = moduleErrors[module.slug] ?? {}
              return (
                <article
                  key={module.slug}
                  className="rounded-md border border-gray-200 bg-gray-50 p-4"
                >
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">{module.label}</h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <SelectField
                      name={`modules.${module.slug}.contratado` as FieldPath<TorreSiengeData>}
                      control={control}
                      label="Contratado no Sienge?"
                      options={contratadoOptions}
                      error={modErr.contratado?.message}
                    />
                    <SelectField
                      name={`modules.${module.slug}.usoReal` as FieldPath<TorreSiengeData>}
                      control={control}
                      label="Uso real"
                      options={usoRealOptions}
                      error={modErr.usoReal?.message}
                    />
                    <SelectField
                      name={`modules.${module.slug}.confiancaDado` as FieldPath<TorreSiengeData>}
                      control={control}
                      label="Confiança do dado"
                      options={confiancaOptions}
                      error={modErr.confiancaDado?.message}
                    />
                    <SelectField
                      name={`modules.${module.slug}.controleParalelo` as FieldPath<TorreSiengeData>}
                      control={control}
                      label="Controle paralelo?"
                      options={paraleloOptions}
                      error={modErr.controleParalelo?.message}
                    />
                  </div>
                  <div className="mt-3">
                    <TextareaField
                      name={`modules.${module.slug}.observacoes` as FieldPath<TorreSiengeData>}
                      control={control}
                      label="Observações"
                      rows={2}
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
