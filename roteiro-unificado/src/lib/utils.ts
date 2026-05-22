import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina classes CSS condicionalmente e resolve conflitos Tailwind.
 *
 * Uso:
 *   cn('bg-primary', isActive && 'opacity-100', className)
 *   cn('px-4 py-2', size === 'lg' && 'px-6 py-3')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
