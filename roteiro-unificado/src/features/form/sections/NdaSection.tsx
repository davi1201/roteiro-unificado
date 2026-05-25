import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFormStore, TabKey } from '@/stores/formStore'
import { ndaSchema, type NdaData } from '@/schemas/nda'
import { InputField, TextareaField } from '@/components/ui'
import { NDA_TEXT } from '@/constants/nda-text'
import { FormCard } from '../FormCard'
import { FormCardRow } from '../FormCardRow'

// ─── Component ────────────────────────────────────────────────────────────────

interface NdaSectionProps {
  tenantId: string
}

export function NdaSection({ tenantId }: NdaSectionProps) {
  const store = useFormStore(tenantId)

  const {
    control,
    watch,
    formState: { errors },
  } = useForm<NdaData>({
    resolver: zodResolver(ndaSchema),
    defaultValues: {
      ...(store.sectionData[TabKey.Nda] ?? {}),
      dataAceite: new Date().toLocaleDateString('pt-BR'),
      // aceitaTermos deve ser inicializado como false (não undefined) para que
      // z.literal(true) produza erro visível ao tentar submeter (RESEARCH Pitfall 3)
      aceitaTermos: (store.sectionData[TabKey.Nda]?.aceitaTermos as boolean | undefined) ?? false,
    } as Partial<NdaData>,
    mode: 'onBlur',
  })

  // Sync RHF → Zustand via subscription (anti-loop: sem deps instáveis)
  useEffect(() => {
    const subscription = watch((values) => {
      store.updateSection(TabKey.Nda, values as Record<string, unknown>)
    })
    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form className="flex flex-col gap-4" noValidate>
      {/* ROW 1 — full width: Termo de Confidencialidade (texto NDA scrollable + aceite) */}
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
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          }
          iconColor="blue"
          title="Termo de Confidencialidade"
          subtitle="NDA mútuo — leia antes de assinar"
        >
          <div className="flex flex-col gap-4">
            {/* Texto legal do NDA em container scrollable */}
            <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed">
              {NDA_TEXT.map((paragraph, i) => (
                <p key={i} className="mb-3 text-gray-700 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Checkbox aceitaTermos via Controller direto — NÃO usar CheckboxGroupField
                (esse gerencia arrays com defaultValue={[] as ...}, linha 33 do componente).
                Para boolean literal z.literal(true), usar Controller inline. */}
            <div className="flex flex-col gap-1">
              <Controller
                name="aceitaTermos"
                control={control}
                render={({ field }) => (
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      className="accent-primary h-4 w-4"
                      checked={field.value === true}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      Li e aceito os termos do NDA mútuo
                      <span className="text-g1 ml-0.5">*</span>
                    </span>
                  </label>
                )}
              />
              {errors.aceitaTermos && (
                <p className="text-g1 text-xs">{errors.aceitaTermos.message as string}</p>
              )}
            </div>
          </div>
        </FormCard>
      </FormCardRow>

      {/* ROW 2 — full width: Dados do Signatário */}
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
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          }
          iconColor="amber"
          title="Dados do Signatário"
          subtitle="Representante legal que assina o NDA"
        >
          <div className="flex flex-col gap-4">
            <InputField
              name="nomeRepresentante"
              control={control}
              label="Nome do representante legal"
              placeholder="Nome completo"
              error={errors.nomeRepresentante?.message as string | undefined}
            />

            <InputField
              name="cargo"
              control={control}
              label="Cargo"
              placeholder="Ex: Diretor, Sócio-administrador"
              error={errors.cargo?.message as string | undefined}
            />

            <InputField
              name="cpf"
              control={control}
              label="CPF do representante"
              placeholder="000.000.000-00"
              error={errors.cpf?.message as string | undefined}
            />

            <InputField
              name="dataAceite"
              control={control}
              label="Data de aceite"
              disabled
              error={errors.dataAceite?.message as string | undefined}
            />

            <TextareaField
              name="observacoes"
              control={control}
              label="Observações adicionais"
              rows={3}
              error={errors.observacoes?.message as string | undefined}
            />
          </div>
        </FormCard>
      </FormCardRow>
    </form>
  )
}
