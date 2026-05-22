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
    <form className="max-w-5xl" noValidate>
      <h2 className="mb-2 text-base font-semibold text-gray-900">Avaliação dos módulos Sienge</h2>
      <p className="mb-4 text-sm text-gray-500">
        Para cada módulo, avalie a situação atual no Sienge.
      </p>

      {SIENGE_MODULES.map((module) => {
        const modErr = moduleErrors[module.slug] ?? {}
        return (
          <article
            key={module.slug}
            className="mb-4 rounded-md border border-gray-200 bg-white p-4"
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
    </form>
  )
}
