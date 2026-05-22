import { useEffect } from 'react'
import { useForm, type FieldPath } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFormStore, TabKey } from '@/stores/formStore'
import {
  habRepositoriosSchema,
  type HabRepositoriosData,
  type HabDocumentSlug,
  HAB_DOCUMENT_DOMAINS,
} from '@/schemas/hab-repositorios'
import { SelectField, TextareaField, CheckboxGroupField, InputField } from '@/components/ui'

// ─── Option constants (slug values + Portuguese labels matching HTML) ─────────

const ondeDocumentosVivemOptions = [
  { value: 'google-drive', label: 'Google Drive' },
  { value: 'onedrive-sharepoint', label: 'OneDrive / SharePoint' },
  { value: 'dropbox', label: 'Dropbox' },
  { value: 'servidor-local', label: 'Servidor local' },
  { value: 'sienge-erp', label: 'Sienge / ERP' },
  { value: 'sistema-juridico', label: 'Sistema jurídico' },
  { value: 'contador', label: 'Contador' },
  { value: 'escritorio-juridico', label: 'Escritório jurídico' },
  { value: 'email-whatsapp', label: 'E-mail / WhatsApp' },
  { value: 'pastas-fisicas', label: 'Pastas físicas' },
  { value: 'terceiros-fornecedores', label: 'Terceiros / fornecedores' },
  { value: 'nao-ha-padrao', label: 'Não há repositório padrão' },
]

const simParcialNaoOptions = [
  { value: 'sim', label: 'Sim' },
  { value: 'parcial', label: 'Parcial' },
  { value: 'nao', label: 'Não' },
]

const existeControleOptions = [
  { value: 'sim', label: 'Sim' },
  { value: 'parcial', label: 'Parcial' },
  { value: 'nao', label: 'Não' },
  { value: 'nao-sabe', label: 'Não sabe' },
]

const repositorioPrincipalOptions = [
  { value: 'ged', label: 'GED' },
  { value: 'pasta-local', label: 'Pasta local' },
  { value: 'google-drive', label: 'Google Drive' },
  { value: 'sharepoint', label: 'SharePoint' },
  { value: 'nao-possui', label: 'Não possui' },
]

// Tipo auxiliar para acessar errors.documents aninhados do RHF
// RHF tem suporte parcial a FieldErrors aninhados — cast controlado (T-07-03-01)
type DocumentErrors = Record<HabDocumentSlug, Record<string, { message?: string }>>

interface HabRepositoriosSectionProps {
  tenantId: string
}

export function HabRepositoriosSection({ tenantId }: HabRepositoriosSectionProps) {
  const store = useFormStore(tenantId)

  const {
    control,
    watch,
    formState: { errors },
  } = useForm<HabRepositoriosData>({
    resolver: zodResolver(habRepositoriosSchema),
    defaultValues: (store.sectionData[TabKey.HabRepositorios] ??
      {}) as Partial<HabRepositoriosData>,
    mode: 'onBlur',
  })

  // D-02: sync RHF → Zustand via subscription (evita loop infinito — watch() retorna
  // novo objeto a cada render, o que causaria deps instáveis no useEffect)
  useEffect(() => {
    const subscription = watch((values) => {
      store.updateSection(TabKey.HabRepositorios, values as Record<string, unknown>)
    })
    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const documentErrors = (errors.documents as unknown as DocumentErrors) ?? {}

  return (
    <form className="max-w-5xl" noValidate>
      {/* ── Grupo: Onde os documentos vivem hoje ──────────────────────────── */}
      <div className="mb-6 space-y-4">
        <h2 className="mb-2 text-base font-semibold text-gray-900">
          Onde os documentos vivem hoje
        </h2>

        <CheckboxGroupField
          name="ondeDocumentosVivem"
          control={control}
          label="Selecione os repositórios utilizados"
          options={ondeDocumentosVivemOptions}
          error={errors.ondeDocumentosVivem?.message as string | undefined}
          showSelectAll
          selectAllLabel="Selecionar todos"
        />
      </div>

      <hr className="my-6 border-gray-100" />

      {/* ── Grupo: Controles gerais ────────────────────────────────────────── */}
      <div className="mb-6 space-y-4">
        <h2 className="mb-2 text-base font-semibold text-gray-900">Controles gerais</h2>

        <SelectField
          name="existePadraoPastas"
          control={control}
          label="Existe padrão de pastas?"
          options={simParcialNaoOptions}
          error={errors.existePadraoPastas?.message as string | undefined}
        />

        <SelectField
          name="existePadraoNomes"
          control={control}
          label="Existe padrão de nomes?"
          options={simParcialNaoOptions}
          error={errors.existePadraoNomes?.message as string | undefined}
        />

        <SelectField
          name="controlamValidade"
          control={control}
          label="Controlam validade?"
          options={simParcialNaoOptions}
          error={errors.controlamValidade?.message as string | undefined}
        />

        <SelectField
          name="existeTrilhaVersao"
          control={control}
          label="Existe trilha de versão?"
          options={simParcialNaoOptions}
          error={errors.existeTrilhaVersao?.message as string | undefined}
        />

        <TextareaField
          name="observacoesRepositorios"
          control={control}
          label="Observações sobre repositórios"
          error={errors.observacoesRepositorios?.message as string | undefined}
        />
      </div>

      <hr className="my-6 border-gray-100" />

      {/* ── Grupo matriz: Habilitações e documentos críticos ─────────────── */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          Matriz enxuta de habilitações e documentos críticos
        </h2>

        {HAB_DOCUMENT_DOMAINS.map((domain) => {
          const docErr = documentErrors[domain.slug] ?? {}
          return (
            <article
              key={domain.slug}
              className="mb-4 rounded-md border border-gray-200 bg-white p-4"
            >
              <h3 className="mb-3 text-sm font-semibold text-gray-900">{domain.label}</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <SelectField
                  name={`documents.${domain.slug}.existeControle` as FieldPath<HabRepositoriosData>}
                  control={control}
                  label="Existe controle?"
                  options={existeControleOptions}
                  error={docErr.existeControle?.message}
                />
                <SelectField
                  name={
                    `documents.${domain.slug}.repositorioPrincipal` as FieldPath<HabRepositoriosData>
                  }
                  control={control}
                  label="Repositório principal"
                  options={repositorioPrincipalOptions}
                  error={docErr.repositorioPrincipal?.message}
                />
                <InputField
                  name={
                    `documents.${domain.slug}.responsavelInterno` as FieldPath<HabRepositoriosData>
                  }
                  control={control}
                  label="Responsável interno"
                  placeholder="Nome da pessoa"
                  error={docErr.responsavelInterno?.message}
                />
                <TextareaField
                  name={
                    `documents.${domain.slug}.terceirosEnvolvidos` as FieldPath<HabRepositoriosData>
                  }
                  control={control}
                  label="Terceiros envolvidos"
                  rows={2}
                  error={docErr.terceirosEnvolvidos?.message}
                />
              </div>
              <div className="mt-3">
                <TextareaField
                  name={`documents.${domain.slug}.observacoes` as FieldPath<HabRepositoriosData>}
                  control={control}
                  label="Observações que mudam escopo"
                  rows={2}
                  error={docErr.observacoes?.message}
                />
              </div>
            </article>
          )
        })}
      </div>
    </form>
  )
}
