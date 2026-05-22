import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { cn } from '@/lib/utils'

interface RadioGroupFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  control: Control<T>
  label: string
  options: Array<{ value: string; label: string }>
  required?: boolean
  error?: string
  layout?: 'vertical' | 'horizontal'
}

export function RadioGroupField<T extends FieldValues>({
  name,
  control,
  label,
  options,
  required,
  error,
  layout = 'vertical',
}: RadioGroupFieldProps<T>) {
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
          <div
            className={cn(
              'flex gap-2',
              layout === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'
            )}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => field.onChange(opt.value)}
                className={cn(
                  'min-h-[44px] rounded-md px-3 py-2.5 text-left text-sm transition-colors',
                  field.value === opt.value
                    ? 'ring-primary bg-primary/10 text-primary font-medium ring-2'
                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      />
      {error && <p className="text-g1 text-xs">{error}</p>}
    </div>
  )
}
