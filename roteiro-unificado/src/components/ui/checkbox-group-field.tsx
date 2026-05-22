import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'

interface CheckboxGroupFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  control: Control<T>
  label: string
  options: Array<{ value: string; label: string }>
  required?: boolean
  error?: string
  showSelectAll?: boolean
  selectAllLabel?: string
}

export function CheckboxGroupField<T extends FieldValues>({
  name,
  control,
  label,
  options,
  required,
  error,
  showSelectAll = false,
  selectAllLabel = 'Selecionar todos os módulos',
}: CheckboxGroupFieldProps<T>) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-g1 ml-0.5">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        defaultValue={[] as unknown as T[typeof name]}
        render={({ field }) => (
          <div className="flex flex-col gap-2">
            {showSelectAll && (
              <label className="mb-2 flex items-center gap-2 border-b border-gray-100 pb-2">
                <input
                  type="checkbox"
                  className="accent-primary h-4 w-4"
                  checked={(field.value as string[] | undefined)?.length === options.length}
                  onChange={(e) => {
                    field.onChange(e.target.checked ? options.map((o) => o.value) : [])
                  }}
                />
                <span className="text-sm font-semibold text-gray-800">{selectAllLabel}</span>
              </label>
            )}
            {options.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-primary h-4 w-4"
                  checked={(field.value as string[] | undefined)?.includes(opt.value) ?? false}
                  onChange={(e) => {
                    const current = (field.value as string[] | undefined) ?? []
                    field.onChange(
                      e.target.checked
                        ? [...current, opt.value]
                        : current.filter((v) => v !== opt.value)
                    )
                  }}
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        )}
      />
      {error && <p className="text-g1 text-xs">{error}</p>}
    </div>
  )
}
