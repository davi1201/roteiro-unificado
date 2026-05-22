import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  errorMessage?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, errorMessage, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      <input
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm transition-colors',
          'placeholder:text-gray-400',
          'focus-visible:ring-primary/50 focus-visible:ring-2 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-g1 focus-visible:ring-g1/50' : 'hover:border-primary-400 border-gray-300',
          className
        )}
        {...props}
      />
      {error && errorMessage ? <p className="text-g1 text-xs">{errorMessage}</p> : null}
    </div>
  )
)
Input.displayName = 'Input'
