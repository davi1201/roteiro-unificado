import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useFormStore, TabKey } from '@/stores/formStore'
import { identificacaoSchema, type IdentificacaoData } from '@/schemas/identificacao'
import { Input, TextareaField } from '@/components/ui'

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

  // D-02: sync RHF → Zustand
  // CRÍTICO: store NÃO entra nas deps — causa loop infinito (T-05-04-04)
  const values = watch()
  useEffect(() => {
    store.updateSection(TabKey.Identificacao, values as Record<string, unknown>)
  }, [values]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form className="max-w-2xl" noValidate>
      {/* Grupo 1: Dados da empresa */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            Empresa / grupo
            <span className="text-g1 ml-0.5">*</span>
          </label>
          <Input
            type="text"
            placeholder="Digite aqui..."
            error={!!errors.empresa}
            errorMessage={errors.empresa?.message}
            {...register('empresa')}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            CNPJ principal
            <span className="text-g1 ml-0.5">*</span>
          </label>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="00.000.000/0000-00"
            maxLength={18}
            value={watch('cnpj') ?? ''}
            error={!!errors.cnpj}
            errorMessage={errors.cnpj?.message}
            onChange={(e) => setValue('cnpj', formatCnpj(e.target.value), { shouldValidate: true })}
          />
        </div>
      </div>

      <hr className="my-6 border-gray-100" />

      {/* Grupo 2: Reunião e participantes */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
        </div>

        <TextareaField
          name="participantes"
          control={control}
          label="Participantes e papéis"
          placeholder="Diretoria, financeiro, engenharia..."
          error={errors.participantes?.message}
        />
      </div>

      <hr className="my-6 border-gray-100" />

      {/* Grupo 3: Responsáveis */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              Responsável por habilitações/documentos
            </label>
            <Input
              type="text"
              placeholder="Nome e contato"
              error={!!errors.responsavelHabilitacoes}
              errorMessage={errors.responsavelHabilitacoes?.message}
              {...register('responsavelHabilitacoes')}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            Quem conduz oportunidades comerciais?
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

      <hr className="my-6 border-gray-100" />

      {/* Grupo 4: Escopo */}
      <div className="mb-6 space-y-4">
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
      </div>

      <hr className="my-6 border-gray-100" />

      {/* Grupo 5: Prioridades */}
      <div className="mb-6 space-y-4">
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
    </form>
  )
}
