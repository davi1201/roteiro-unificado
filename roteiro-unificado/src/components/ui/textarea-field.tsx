import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { Textarea } from './textarea'

interface TextareaFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  control: Control<T>
  label: string
  placeholder?: string
  required?: boolean
  error?: string
  rows?: number
  helpText?: string
}

export function TextareaField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  required,
  error,
  rows,
  helpText,
}: TextareaFieldProps<T>) {
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
          <Textarea
            {...field}
            placeholder={placeholder}
            rows={rows}
            error={!!error}
            errorMessage={error}
          />
        )}
      />
      {helpText && !error && <p className="text-xs text-gray-500">{helpText}</p>}
      {error && <p className="text-g1 text-xs">{error}</p>}
    </div>
  )
}
