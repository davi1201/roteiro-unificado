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
    <form className="flex flex-col gap-4" noValidate>
      {/* ROW 1 — full width: Dados da Empresa
          Grid 3-col: [Empresa/grupo col-span-2 | Cidade/UF] + CNPJ abaixo (max-w-[280px])
          Fonte: sketch 002 Variant B, card-body g3 */}
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
          subtitle="Identificação básica no piloto Sinduscon"
        >
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-[12.5px] font-semibold text-gray-800">
                  Empresa / grupo<span className="ml-0.5 text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Nome da construtora ou grupo"
                  error={!!errors.empresa}
                  errorMessage={errors.empresa?.message}
                  {...register('empresa')}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12.5px] font-semibold text-gray-800">Cidade/UF sede</label>
                <Input
                  type="text"
                  placeholder="São Paulo/SP"
                  maxLength={100}
                  error={!!errors.cidadeUf}
                  errorMessage={errors.cidadeUf?.message}
                  {...register('cidadeUf')}
                />
              </div>
            </div>
            <div className="flex max-w-[280px] flex-col gap-1">
              <label className="text-[12.5px] font-semibold text-gray-800">
                CNPJ principal<span className="ml-0.5 text-red-500">*</span>
              </label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="00.000.000/0001-00"
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

      {/* ROW 2 — cols-2: Responsáveis (amber) | Escopo do Piloto (green)
          Fonte: sketch 002 Variant B, card-row cols-2
          Responsáveis: campos empilhados com hints
          Escopo: campos empilhados (não grid-cols-2) com hints */}
      <FormCardRow cols={2}>
        {/* Card: Responsáveis */}
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
                d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
              />
            </svg>
          }
          iconColor="amber"
          title="Responsáveis"
          subtitle="Quem responde pelo processo"
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[12.5px] font-semibold text-gray-800">
                Resp. Torre 360<span className="ml-0.5 text-red-500">*</span>
              </label>
              <p className="text-[11px] text-gray-500">Nome e contato (ex.: João · 99999-9999)</p>
              <Input
                type="text"
                placeholder="Nome e contato"
                error={!!errors.responsavelSienge}
                errorMessage={errors.responsavelSienge?.message}
                {...register('responsavelSienge')}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12.5px] font-semibold text-gray-800">
                Resp. Habilitações<span className="ml-0.5 text-red-500">*</span>
              </label>
              <p className="text-[11px] text-gray-500">Nome e contato</p>
              <Input
                type="text"
                placeholder="Nome e contato"
                error={!!errors.responsavelHabilitacoes}
                errorMessage={errors.responsavelHabilitacoes?.message}
                {...register('responsavelHabilitacoes')}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12.5px] font-semibold text-gray-800">
                Conduz oportunidades comerciais?
              </label>
              <Input
                type="text"
                placeholder="Diretoria, time comercial..."
                error={!!errors.quemConduzComercial}
                errorMessage={errors.quemConduzComercial?.message}
                {...register('quemConduzComercial')}
              />
            </div>
          </div>
        </FormCard>

        {/* Card: Escopo do Piloto — campos empilhados (não grid interno), cada um com hint */}
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
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
              />
            </svg>
          }
          iconColor="green"
          title="Escopo do Piloto"
          subtitle="Abrangência da avaliação"
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[12.5px] font-semibold text-gray-800">
                Nº de CNPJs/SPEs no escopo
              </label>
              <p className="text-[11px] text-gray-500">Quantidade e observações relevantes</p>
              <Input
                type="text"
                placeholder="Ex.: 3 CNPJs — holding + 2 SPEs"
                error={!!errors.numCnpjsEscopo}
                errorMessage={errors.numCnpjsEscopo?.message}
                {...register('numCnpjsEscopo')}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12.5px] font-semibold text-gray-800">
                Nº de obras/empreendimentos ativos
              </label>
              <p className="text-[11px] text-gray-500">Quantidade, status e observações</p>
              <Input
                type="text"
                placeholder="Ex.: 4 obras — 2 em andamento, 2 lançamento"
                error={!!errors.numObrasAtivas}
                errorMessage={errors.numObrasAtivas?.message}
                {...register('numObrasAtivas')}
              />
            </div>
          </div>
        </FormCard>
      </FormCardRow>

      {/* ROW 3 — full width: Reunião e Participantes
          Nota: não presente no sketch 002, mas campos existem no schema.
          Mantido após Row 2 para não perder dados já coletados. */}
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
          title="Reunião e Participantes"
          subtitle="Quando e quem participou"
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[12.5px] font-semibold text-gray-800">Data da reunião</label>
              <Input
                type="date"
                error={!!errors.dataReuniao}
                errorMessage={errors.dataReuniao?.message}
                {...register('dataReuniao')}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12.5px] font-semibold text-gray-800">Sponsor do piloto</label>
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
      </FormCardRow>

      {/* ROW 4 — full width: Prioridades
          Textareas lado a lado (g2), maxLength=500
          Fonte: sketch 002 Variant B, card-body g2 */}
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
          title="Prioridades"
          subtitle="O que mais importa para sua empresa neste piloto"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextareaField
              name="prioridadeTorre360"
              control={control}
              label="Principal prioridade para Torre 360"
              placeholder="Descreva a principal prioridade da construtora com o Torre 360..."
              error={errors.prioridadeTorre360?.message}
              maxLength={500}
            />
            <TextareaField
              name="prioridadeHabilitacoes"
              control={control}
              label="Principal prioridade para Habilitações"
              placeholder="Descreva a principal prioridade com Habilitações..."
              error={errors.prioridadeHabilitacoes?.message}
              maxLength={500}
            />
          </div>
        </FormCard>
      </FormCardRow>
    </form>
  )
}
