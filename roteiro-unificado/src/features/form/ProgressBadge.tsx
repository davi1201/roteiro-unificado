import { cn } from '@/lib/utils'

interface ProgressBadgeProps {
  completeness: number
  className?: string
}

export function ProgressBadge({ completeness, className }: ProgressBadgeProps) {
  if (completeness === 1) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={cn('h-4 w-4 text-green-500', className)}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
        />
      </svg>
    )
  }

  if (completeness > 0 && completeness < 1) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={cn('text-accent h-4 w-4', className)}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
        />
      </svg>
    )
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={cn('text-primary-300 h-4 w-4', className)}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

ProgressBadge.displayName = 'ProgressBadge'
