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
import { FormCard } from '../FormCard'
import { FormCardRow } from '../FormCardRow'

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
    <form className="flex max-w-4xl flex-col gap-4" noValidate>
      {/* ROW 1 — cols-2: Tipos de Repositório | Configuração */}
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
                d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
              />
            </svg>
          }
          iconColor="blue"
          title="Tipos de Repositório"
          subtitle="Onde os documentos vivem hoje"
        >
          <CheckboxGroupField
            name="ondeDocumentosVivem"
            control={control}
            label="Selecione os repositórios utilizados"
            options={ondeDocumentosVivemOptions}
            error={errors.ondeDocumentosVivem?.message as string | undefined}
            showSelectAll
            selectAllLabel="Selecionar todos"
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
                d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          }
          iconColor="green"
          title="Controles Gerais"
          subtitle="Padrões e governança documental"
        >
          <div className="flex flex-col gap-4">
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
        </FormCard>
      </FormCardRow>

      {/* ROW 2 — full width: Domínios do Repositório (14 domínios × 5 colunas) */}
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
          title="Matriz de Habilitações e Documentos Críticos"
          subtitle="14 domínios documentais avaliados por controle e responsável"
        >
          <div className="flex flex-col gap-4">
            {HAB_DOCUMENT_DOMAINS.map((domain) => {
              const docErr = documentErrors[domain.slug] ?? {}
              return (
                <article
                  key={domain.slug}
                  className="rounded-md border border-gray-200 bg-gray-50 p-4"
                >
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">{domain.label}</h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <SelectField
                      name={
                        `documents.${domain.slug}.existeControle` as FieldPath<HabRepositoriosData>
                      }
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
                      name={
                        `documents.${domain.slug}.observacoes` as FieldPath<HabRepositoriosData>
                      }
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
        </FormCard>
      </FormCardRow>
    </form>
  )
}
