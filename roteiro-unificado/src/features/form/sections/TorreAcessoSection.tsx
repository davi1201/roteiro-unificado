import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFormStore, TabKey } from '@/stores/formStore'
import { torreAcessoSchema, type TorreAcessoData } from '@/schemas/torre-acesso'
import { SelectField, TextareaField, CheckboxGroupField } from '@/components/ui'

// ─── Option constants (slug values + Portuguese labels matching HTML) ─────────

const ambienteOptions = [
  { value: 'nuvem-data-center', label: 'Nuvem/Data Center' },
  { value: 'local', label: 'Local' },
  { value: 'hibrido', label: 'Híbrido' },
  { value: 'confirmar', label: 'Confirmar' },
]

/** Reutilizado por subdominioTenant e ambienteHomologacao */
const simNaoConfirmarOptions = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
  { value: 'confirmar', label: 'Confirmar' },
]

const usuarioLeituraOptions = [
  { value: 'possivel', label: 'Possível' },
  { value: 'nao-possivel', label: 'Não possível' },
  { value: 'confirmar', label: 'Confirmar' },
]

/** Reutilizado por apiRest e bulkData */
const apiBulkOptions = [
  { value: 'disponivel', label: 'Disponível' },
  { value: 'nao-disponivel', label: 'Não disponível' },
  { value: 'confirmar', label: 'Confirmar' },
  { value: 'parcial', label: 'Parcial' },
]

const pacoteOptions = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
  { value: 'confirmar-sienge-ti', label: 'Confirmar com Sienge/TI' },
]

const webhooksOptions = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
  { value: 'confirmar', label: 'Confirmar' },
  { value: 'nao-aplicavel-fase-1', label: 'Não aplicável na fase 1' },
]

const seTudoOptions = [
  { value: 'modulos-alimentados', label: 'Módulos realmente alimentados' },
  { value: 'empresas-obras-centros', label: 'Empresas, obras e centros corretos' },
  { value: 'historico-minimo', label: 'Dados com histórico mínimo' },
  { value: 'api-bulk-autorizado', label: 'API/Bulk com acesso autorizado' },
  { value: 'limites-compativeis', label: 'Limites compatíveis com o volume' },
  { value: 'regras-validadas', label: 'Regras de indicadores validadas' },
]

// ─── Component ────────────────────────────────────────────────────────────────

interface TorreAcessoSectionProps {
  tenantId: string
}

export function TorreAcessoSection({ tenantId }: TorreAcessoSectionProps) {
  const store = useFormStore(tenantId)

  const {
    control,
    watch,
    formState: { errors },
  } = useForm<TorreAcessoData>({
    resolver: zodResolver(torreAcessoSchema),
    defaultValues: (store.sectionData[TabKey.TorreAcesso] ?? {}) as Partial<TorreAcessoData>,
    mode: 'onBlur',
  })

  // D-02: sync RHF → Zustand via subscription (evita loop infinito — watch() retorna
  // novo objeto a cada render, o que causaria deps instáveis no useEffect)
  useEffect(() => {
    const subscription = watch((values) => {
      store.updateSection(TabKey.TorreAcesso, values as Record<string, unknown>)
    })
    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form className="max-w-2xl" noValidate>
      {/* ── Grupo 1: Ambiente e acessos ─────────────────────────────────── */}
      <div className="space-y-4">
        <SelectField
          name="ambienteSienge"
          control={control}
          label="Ambiente Sienge"
          options={ambienteOptions}
          error={errors.ambienteSienge?.message as string | undefined}
        />

        {/* Par curto: Subdomínio + Usuário leitura */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectField
            name="subdominioTenant"
            control={control}
            label="Subdomínio/tenant conhecido?"
            options={simNaoConfirmarOptions}
            error={errors.subdominioTenant?.message as string | undefined}
          />
          <SelectField
            name="usuarioLeitura"
            control={control}
            label="Usuário técnico somente leitura?"
            options={usuarioLeituraOptions}
            error={errors.usuarioLeitura?.message as string | undefined}
          />
        </div>

        {/* Par curto: Homologação + Pacote/limite */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectField
            name="ambienteHomologacao"
            control={control}
            label="Ambiente de homologação?"
            options={simNaoConfirmarOptions}
            error={errors.ambienteHomologacao?.message as string | undefined}
          />
          <SelectField
            name="pacoteLimiteApi"
            control={control}
            label="Pacote/limite de API conhecido?"
            options={pacoteOptions}
            error={errors.pacoteLimiteApi?.message as string | undefined}
          />
        </div>

        {/* Par curto: API REST + Bulk Data */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectField
            name="apiRest"
            control={control}
            label="API REST"
            options={apiBulkOptions}
            error={errors.apiRest?.message as string | undefined}
          />
          <SelectField
            name="bulkData"
            control={control}
            label="Bulk Data"
            options={apiBulkOptions}
            error={errors.bulkData?.message as string | undefined}
          />
        </div>

        <SelectField
          name="webhooksRelevantes"
          control={control}
          label="Webhooks relevantes agora?"
          options={webhooksOptions}
          error={errors.webhooksRelevantes?.message as string | undefined}
        />

        <TextareaField
          name="outrasFontes"
          control={control}
          label="Outras fontes oficiais ou relevantes"
          error={errors.outrasFontes?.message as string | undefined}
        />

        <TextareaField
          name="restricoesSeguranca"
          control={control}
          label="Restrições de segurança/confidencialidade"
          error={errors.restricoesSeguranca?.message as string | undefined}
        />
      </div>

      <hr className="my-6 border-gray-100" />

      {/* ── Grupo 2: Se todos os dados estiverem no Sienge ─────────────── */}
      <CheckboxGroupField
        name="seTudoNoSienge"
        control={control}
        label="Checklist de viabilidade (se todos os dados estiverem no Sienge)"
        options={seTudoOptions}
        error={errors.seTudoNoSienge?.message as string | undefined}
      />

      <hr className="my-6 border-gray-100" />

      {/* ── Grupo 3: Observação técnica ──────────────────────────────────── */}
      <TextareaField
        name="observacaoTecnica"
        control={control}
        label="Observação técnica essencial"
        error={errors.observacaoTecnica?.message as string | undefined}
      />
    </form>
  )
}
