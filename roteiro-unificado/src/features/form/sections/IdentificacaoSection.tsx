import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useFormStore, TabKey } from '@/stores/formStore'
import { identificacaoSchema, type IdentificacaoData } from '@/schemas/identificacao'
import { Input, TextareaField } from '@/components/ui'
import { FormCard } from '../FormCard'
import { FormCardRow } from '../FormCardRow'

interface IdentificacaoSectionProps {
  tenantId: string
}

function formatCnpj(raw: string): string {
  return raw
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export function IdentificacaoSection({ tenantId }: IdentificacaoSectionProps) {
  const store = useFormStore(tenantId)

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IdentificacaoData>({
    resolver: zodResolver(identificacaoSchema),
    defaultValues: (store.sectionData[TabKey.Identificacao] ?? {}) as Partial<IdentificacaoData>,
    mode: 'onBlur',
  })

  // D-02: sync RHF → Zustand via subscription (evita loop infinito — watch() retorna
  // novo objeto a cada render, o que causaria deps instáveis no useEffect)
  useEffect(() => {
    const subscription = watch((values) => {
      store.updateSection(TabKey.Identificacao, values as Record<string, unknown>)
    })
    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form className="flex max-w-4xl flex-col gap-4" noValidate>
      {/* ROW 1 — full width: Dados da Empresa (campos críticos) */}
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
                d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"
              />
            </svg>
          }
          iconColor="blue"
          title="Dados da Empresa"
          subtitle="Identificação básica no piloto"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Empresa / grupo<span className="text-g1 ml-0.5">*</span>
              </label>
              <Input
                type="text"
                placeholder="Digite aqui..."
                error={!!errors.empresa}
                errorMessage={errors.empresa?.message}
                {...register('empresa')}
              />
            </div>
            <div className="flex max-w-xs flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                CNPJ principal<span className="text-g1 ml-0.5">*</span>
              </label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="00.000.000/0000-00"
                maxLength={18}
                value={watch('cnpj') ?? ''}
                error={!!errors.cnpj}
                errorMessage={errors.cnpj?.message}
                onChange={(e) =>
                  setValue('cnpj', formatCnpj(e.target.value), { shouldValidate: true })
                }
              />
            </div>
          </div>
        </FormCard>
      </FormCardRow>

      {/* ROW 2 — cols-2: Reunião | Responsáveis (densidade similar, complementares, sem textareas longas) */}
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
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
              />
            </svg>
          }
          iconColor="green"
          title="Reunião e Participantes"
          subtitle="Quando e quem participou"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Data da reunião</label>
              <Input
                type="date"
                error={!!errors.dataReuniao}
                errorMessage={errors.dataReuniao?.message}
                {...register('dataReuniao')}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Sponsor do piloto</label>
              <Input
                type="text"
                placeholder="Nome e cargo"
                error={!!errors.sponsorPiloto}
                errorMessage={errors.sponsorPiloto?.message}
                {...register('sponsorPiloto')}
              />
            </div>
            <TextareaField
              name="participantes"
              control={control}
              label="Participantes e papéis"
              placeholder="Diretoria, financeiro, engenharia..."
              error={errors.participantes?.message}
            />
          </div>
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
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          }
          iconColor="amber"
          title="Responsáveis"
          subtitle="Quem responde por cada frente"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Responsável técnico/Sienge
              </label>
              <Input
                type="text"
                placeholder="Nome e contato"
                error={!!errors.responsavelSienge}
                errorMessage={errors.responsavelSienge?.message}
                {...register('responsavelSienge')}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Resp. habilitações/documentos
              </label>
              <Input
                type="text"
                placeholder="Nome e contato"
                error={!!errors.responsavelHabilitacoes}
                errorMessage={errors.responsavelHabilitacoes?.message}
                {...register('responsavelHabilitacoes')}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Conduz oportunidades comerciais?
              </label>
              <Input
                type="text"
                placeholder="Diretoria, comercial..."
                error={!!errors.quemConduzComercial}
                errorMessage={errors.quemConduzComercial?.message}
                {...register('quemConduzComercial')}
              />
            </div>
          </div>
        </FormCard>
      </FormCardRow>

      {/* ROW 3 — full width: Escopo (2 campos curtos lado a lado) */}
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
          iconColor="green"
          title="Escopo do Piloto"
          subtitle="Abrangência"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Nº de CNPJs/SPEs no escopo
              </label>
              <Input
                type="text"
                placeholder="Quantidade e observações"
                error={!!errors.numCnpjsEscopo}
                errorMessage={errors.numCnpjsEscopo?.message}
                {...register('numCnpjsEscopo')}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Nº de obras/empreendimentos
              </label>
              <Input
                type="text"
                placeholder="Quantidade, status e observações"
                error={!!errors.numObrasAtivas}
                errorMessage={errors.numObrasAtivas?.message}
                {...register('numObrasAtivas')}
              />
            </div>
          </div>
        </FormCard>
      </FormCardRow>

      {/* ROW 4 — full width: Prioridades (textareas lado a lado dentro do card) */}
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
                d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
              />
            </svg>
          }
          iconColor="purple"
          title="Prioridades"
          subtitle="Principais focos do piloto"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextareaField
              name="prioridadeTorre360"
              control={control}
              label="Principal prioridade para Torre 360"
              placeholder="Descreva a principal prioridade..."
              error={errors.prioridadeTorre360?.message}
            />
            <TextareaField
              name="prioridadeHabilitacoes"
              control={control}
              label="Principal prioridade para Habilitações"
              placeholder="Descreva a principal prioridade..."
              error={errors.prioridadeHabilitacoes?.message}
            />
          </div>
        </FormCard>
      </FormCardRow>
    </form>
  )
}
