import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFormStore, TabKey } from '@/stores/formStore'
import { torreAcessoSchema, type TorreAcessoData } from '@/schemas/torre-acesso'
import { SelectField, TextareaField, CheckboxGroupField } from '@/components/ui'
import { FormCard } from '../FormCard'
import { FormCardRow } from '../FormCardRow'

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
    <form className="flex flex-col gap-4" noValidate>
      {/* ROW 1 — full width: Ambiente e Configuração de Acesso */}
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
                d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z"
              />
            </svg>
          }
          iconColor="blue"
          title="Ambiente e Configuração de Acesso"
          subtitle="Infraestrutura Sienge e integrações"
        >
          <div className="flex flex-col gap-4">
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
          </div>
        </FormCard>
      </FormCardRow>

      {/* ROW 2 — cols-2: Checklist de Viabilidade | Observações Técnicas */}
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
          title="Checklist de Viabilidade"
          subtitle="Pré-requisitos para integração"
        >
          <CheckboxGroupField
            name="seTudoNoSienge"
            control={control}
            label="Se todos os dados estiverem no Sienge"
            options={seTudoOptions}
            error={errors.seTudoNoSienge?.message as string | undefined}
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
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          }
          iconColor="amber"
          title="Observações Técnicas"
          subtitle="Fontes alternativas e restrições"
        >
          <div className="flex flex-col gap-4">
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

            <TextareaField
              name="observacaoTecnica"
              control={control}
              label="Observação técnica essencial"
              error={errors.observacaoTecnica?.message as string | undefined}
            />
          </div>
        </FormCard>
      </FormCardRow>
    </form>
  )
}
