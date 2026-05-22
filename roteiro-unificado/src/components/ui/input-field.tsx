import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { Input } from './input'

interface InputFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  control: Control<T>
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
}

export function InputField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  required,
  disabled,
  error,
}: InputFieldProps<T>) {
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
          <Input
            {...field}
            placeholder={placeholder}
            disabled={disabled}
            error={!!error}
            errorMessage={error}
          />
        )}
      />
      {error && <p className="text-g1 text-xs">{error}</p>}
    </div>
  )
}
