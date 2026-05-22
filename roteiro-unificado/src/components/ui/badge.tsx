import { cn } from '@/lib/utils'

const gradeConfig = {
  G1: { label: 'G1 — Crítico', bg: 'bg-g1', text: 'text-white' },
  G2: { label: 'G2 — Baixo', bg: 'bg-g2', text: 'text-white' },
  G3: { label: 'G3 — Médio', bg: 'bg-g3', text: 'text-primary-900' },
  G4: { label: 'G4 — Bom', bg: 'bg-g4', text: 'text-white' },
  G5: { label: 'G5 — Excelente', bg: 'bg-g5', text: 'text-white' },
} as const

export type Grade = keyof typeof gradeConfig

interface BadgeProps {
  grade: Grade
  className?: string
}

export function Badge({ grade, className }: BadgeProps) {
  const { label, bg, text } = gradeConfig[grade]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        bg,
        text,
        className
      )}
    >
      {label}
    </span>
  )
}
