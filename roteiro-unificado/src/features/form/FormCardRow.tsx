import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * FormCardRow — wrapper de grid para FormCard.
 *
 * cols=1 → full-width (default)
 * cols=2 → lado a lado em viewport ≥ 768px; empilha em mobile (< 768px)
 *
 * Regra de uso (CONTEXT.md): usar cols=2 quando dois grupos têm densidade
 * similar, são complementares e nenhum tem textarea longa.
 */

export interface FormCardRowProps {
  cols?: 1 | 2
  children: ReactNode
  className?: string
}

export function FormCardRow({ cols = 1, children, className }: FormCardRowProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        cols === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1',
        className
      )}
    >
      {children}
    </div>
  )
}
