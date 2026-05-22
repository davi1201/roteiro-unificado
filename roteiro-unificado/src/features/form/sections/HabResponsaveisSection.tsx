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
    <form className="max-w-5xl" noValidate>
      {/* ── Grupo 1: Dificuldades operacionais recorrentes ─────────────────── */}
      <div className="mb-6">
        <h2 className="mb-2 text-base font-semibold text-gray-900">
          Dificuldades operacionais recorrentes
        </h2>
        <CheckboxGroupField
          name="dificuldadesRecorrentes"
          control={control}
          label="Selecione as dificuldades observadas"
          options={dificuldadesOptions}
          error={errors.dificuldadesRecorrentes?.message as string | undefined}
        />
      </div>

      <hr className="my-6 border-gray-100" />

      {/* ── Grupo 2: Controles gerais ──────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="mb-2 text-base font-semibold text-gray-900">Controles gerais</h2>
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

      <hr className="my-6 border-gray-100" />

      {/* ── Grupo 3: Mapa rápido de responsabilidades ─────────────────────── */}
      <h2 className="mb-4 text-base font-semibold text-gray-900">
        Mapa rápido de responsabilidades
      </h2>
      {HAB_RESPONSIBILITIES.map((activity) => {
        const respErr = respErrors[activity.slug] ?? {}
        return (
          <article
            key={activity.slug}
            className="mb-4 rounded-md border border-gray-200 bg-white p-4"
          >
            <h3 className="mb-3 text-sm font-semibold text-gray-900">{activity.label}</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <TextareaField
                name={`responsibilities.${activity.slug}.quemFaz` as FieldPath<HabResponsaveisData>}
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
    </form>
  )
}
