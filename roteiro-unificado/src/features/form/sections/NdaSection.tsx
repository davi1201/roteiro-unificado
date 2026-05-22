import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFormStore, TabKey } from '@/stores/formStore'
import { ndaSchema, type NdaData } from '@/schemas/nda'
import { InputField, TextareaField } from '@/components/ui'
import { NDA_TEXT } from '@/constants/nda-text'

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
    <form className="max-w-2xl" noValidate>
      {/* ── Texto legal do NDA em container scrollable ─────────────────── */}
      <div className="mb-6 max-h-[400px] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed">
        {NDA_TEXT.map((paragraph, i) => (
          <p key={i} className="mb-3 text-gray-700 last:mb-0">
            {paragraph}
          </p>
        ))}
      </div>

      {/* ── Campos de aceite ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="mb-2 text-base font-semibold text-gray-900">Aceite</h2>

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

        <TextareaField
          name="observacoes"
          control={control}
          label="Observações adicionais"
          rows={3}
          error={errors.observacoes?.message as string | undefined}
        />
      </div>
    </form>
  )
}
