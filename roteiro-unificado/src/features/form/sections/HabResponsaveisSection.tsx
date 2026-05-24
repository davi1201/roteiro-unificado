import { useEffect } from 'react'
import { useForm, type FieldPath } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFormStore, TabKey } from '@/stores/formStore'
import {
  habResponsaveisSchema,
  type HabResponsaveisData,
  type HabResponsabilidadeSlug,
  HAB_RESPONSIBILITIES,
} from '@/schemas/hab-responsaveis'
import { CheckboxGroupField, SelectField, TextareaField } from '@/components/ui'
import { FormCard } from '../FormCard'
import { FormCardRow } from '../FormCardRow'

// ─── Opções de campos flat ────────────────────────────────────────────────────

const dificuldadesOptions = [
  { value: 'documento-vencido', label: 'Documento vencido sem alerta' },
  { value: 'documento-nao-localizado', label: 'Documento não localizado' },
  { value: 'dependencia-contador', label: 'Dependência do contador' },
  { value: 'dependencia-juridico', label: 'Dependência do jurídico' },
  { value: 'dependencia-engenharia', label: 'Dependência da engenharia' },
  { value: 'dependencia-fornecedores', label: 'Dependência de fornecedores' },
  { value: 'duvida-aplicabilidade', label: 'Dúvida sobre aplicabilidade' },
  { value: 'falta-padrao-envio', label: 'Falta de padrão de envio' },
  { value: 'retrabalho-kit', label: 'Retrabalho para montar kit' },
  { value: 'documentos-whatsapp', label: 'Documentos em WhatsApp/e-mail' },
  { value: 'falta-historico', label: 'Falta de histórico' },
  { value: 'sem-dono-processo', label: 'Ninguém é dono do processo' },
]

const tempoMedioKitOptions = [
  { value: 'mesmo-dia', label: 'Mesmo dia' },
  { value: '1-3-dias', label: '1 a 3 dias' },
  { value: 'ate-1-semana', label: 'Até 1 semana' },
  { value: 'mais-1-semana', label: 'Mais de 1 semana' },
  { value: 'nao-medem', label: 'Não medem' },
]

const simParcialNaoOptions = [
  { value: 'sim', label: 'Sim' },
  { value: 'parcial', label: 'Parcial' },
  { value: 'nao', label: 'Não' },
]

const simParcialNaoSabeOptions = [
  { value: 'sim', label: 'Sim' },
  { value: 'parcial', label: 'Parcial' },
  { value: 'nao', label: 'Não' },
  { value: 'nao-sabe', label: 'Não sabe' },
]

// ─── Tipo auxiliar para acessar errors.responsibilities aninhados do RHF ─────
// RHF tem suporte parcial a FieldErrors aninhados — cast controlado (T-07-04-02)
type ResponsibilityErrors = Record<HabResponsabilidadeSlug, Record<string, { message?: string }>>

// ─── Component ────────────────────────────────────────────────────────────────

interface HabResponsaveisSectionProps {
  tenantId: string
}

export function HabResponsaveisSection({ tenantId }: HabResponsaveisSectionProps) {
  const store = useFormStore(tenantId)

  const {
    control,
    watch,
    formState: { errors },
  } = useForm<HabResponsaveisData>({
    resolver: zodResolver(habResponsaveisSchema),
    defaultValues: (store.sectionData[TabKey.HabResponsaveis] ??
      {}) as Partial<HabResponsaveisData>,
    mode: 'onBlur',
  })

  // D-02: sync RHF → Zustand via subscription (evita loop infinito — watch() retorna
  // novo objeto a cada render, o que causaria deps instáveis no useEffect)
  useEffect(() => {
    const subscription = watch((values) => {
      store.updateSection(TabKey.HabResponsaveis, values as Record<string, unknown>)
    })
    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const respErrors = (errors.responsibilities as unknown as ResponsibilityErrors) ?? {}

  return (
    <form className="flex max-w-4xl flex-col gap-4" noValidate>
      {/* ROW 1 — cols-2: Dificuldades Recorrentes | Controles Gerais */}
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
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          }
          iconColor="blue"
          title="Dificuldades Operacionais"
          subtitle="Problemas recorrentes observados"
        >
          <CheckboxGroupField
            name="dificuldadesRecorrentes"
            control={control}
            label="Selecione as dificuldades observadas"
            options={dificuldadesOptions}
            error={errors.dificuldadesRecorrentes?.message as string | undefined}
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
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          }
          iconColor="green"
          title="Controles Gerais"
          subtitle="Rotinas e práticas de gestão documental"
        >
          <div className="flex flex-col gap-4">
            <SelectField
              name="tempoMedioKit"
              control={control}
              label="Tempo médio para montar um kit"
              options={tempoMedioKitOptions}
              error={errors.tempoMedioKit?.message as string | undefined}
            />
            <SelectField
              name="existeChecklist"
              control={control}
              label="Existe checklist padrão?"
              options={simParcialNaoOptions}
              error={errors.existeChecklist?.message as string | undefined}
            />
            <SelectField
              name="existeRenovacao"
              control={control}
              label="Existe rotina de renovação?"
              options={simParcialNaoOptions}
              error={errors.existeRenovacao?.message as string | undefined}
            />
            <SelectField
              name="existeValidacao"
              control={control}
              label="Existe validação antes do envio?"
              options={simParcialNaoOptions}
              error={errors.existeValidacao?.message as string | undefined}
            />
            <TextareaField
              name="observacoesRotina"
              control={control}
              label="Observações sobre rotina e dificuldades"
              error={errors.observacoesRotina?.message as string | undefined}
            />
          </div>
        </FormCard>
      </FormCardRow>

      {/* ROW 2 — full width: Mapa de Responsabilidades (10 atividades) */}
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
                d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
              />
            </svg>
          }
          iconColor="amber"
          title="Mapa Rápido de Responsabilidades"
          subtitle="10 atividades documentais e seus responsáveis"
        >
          <div className="flex flex-col gap-4">
            {HAB_RESPONSIBILITIES.map((activity) => {
              const respErr = respErrors[activity.slug] ?? {}
              return (
                <article
                  key={activity.slug}
                  className="rounded-md border border-gray-200 bg-gray-50 p-4"
                >
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">{activity.label}</h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <TextareaField
                      name={
                        `responsibilities.${activity.slug}.quemFaz` as FieldPath<HabResponsaveisData>
                      }
                      control={control}
                      label="Quem faz hoje?"
                      rows={2}
                      error={respErr.quemFaz?.message}
                    />
                    <SelectField
                      name={
                        `responsibilities.${activity.slug}.existeSubstituto` as FieldPath<HabResponsaveisData>
                      }
                      control={control}
                      label="Existe substituto?"
                      options={simParcialNaoSabeOptions}
                      error={respErr.existeSubstituto?.message}
                    />
                    <SelectField
                      name={
                        `responsibilities.${activity.slug}.terceiroDependente` as FieldPath<HabResponsaveisData>
                      }
                      control={control}
                      label="Terceiro depende?"
                      options={simParcialNaoSabeOptions}
                      error={respErr.terceiroDependente?.message}
                    />
                    <TextareaField
                      name={
                        `responsibilities.${activity.slug}.maiorDificuldade` as FieldPath<HabResponsaveisData>
                      }
                      control={control}
                      label="Maior dificuldade"
                      rows={2}
                      error={respErr.maiorDificuldade?.message}
                    />
                  </div>
                  <div className="mt-3">
                    <TextareaField
                      name={
                        `responsibilities.${activity.slug}.observacoes` as FieldPath<HabResponsaveisData>
                      }
                      control={control}
                      label="Observações"
                      rows={2}
                      error={respErr.observacoes?.message}
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
