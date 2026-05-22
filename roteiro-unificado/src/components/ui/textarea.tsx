import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
  errorMessage?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, errorMessage, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm transition-colors',
          'placeholder:text-gray-400',
          'focus-visible:ring-primary/50 focus-visible:ring-2 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-y',
          error ? 'border-g1 focus-visible:ring-g1/50' : 'hover:border-primary-400 border-gray-300',
          className
        )}
        {...props}
      />
      {error && errorMessage ? <p className="text-g1 text-xs">{errorMessage}</p> : null}
    </div>
  )
)
Textarea.displayName = 'Textarea'
