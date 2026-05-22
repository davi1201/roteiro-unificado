import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { Select } from './select'

interface SelectFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  control: Control<T>
  label: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
  required?: boolean
  error?: string
}

export function SelectField<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder,
  required,
  error,
}: SelectFieldProps<T>) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-g1 ml-0.5">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            options={options}
            placeholder={placeholder ?? 'Selecione uma opção'}
            error={!!error}
            errorMessage={error}
          />
        )}
      />
      {error && <p className="text-g1 text-xs">{error}</p>}
    </div>
  )
}
