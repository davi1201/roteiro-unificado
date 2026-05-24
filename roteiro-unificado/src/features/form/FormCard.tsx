import type { ReactNode } from 'react'

/**
 * FormCard — componente 100% presentacional para grupos semânticos de campos.
 *
 * Cada grupo de campos do formulário vira um card com header colorido (ícone +
 * título + subtítulo opcional) e body. Segue o padrão do sketch 002 (Variante B).
 *
 * Cores de ícone usam tokens do projeto:
 * - blue  → bg-primary (#123B66 — cor do projeto, NÃO o #1e3a5f do sketch)
 * - amber → bg-accent  (#F28C28)
 * - green → bg-g5      (verde da escala G5)
 * - purple → bg-[#7c3aed] (cor do sketch, sem token equivalente no projeto)
 */

export type FormCardIconColor = 'blue' | 'amber' | 'green' | 'purple'

export interface FormCardProps {
  icon: ReactNode
  iconColor: FormCardIconColor
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}

const iconColorClass: Record<FormCardIconColor, string> = {
  blue: 'bg-primary',
  amber: 'bg-accent',
  green: 'bg-g5',
  purple: 'bg-[#7c3aed]',
}

export function FormCard({ icon, iconColor, title, subtitle, children, className }: FormCardProps) {
  return (
    <section
      className={`overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm${className ? ` ${className}` : ''}`}
    >
      <header className="flex items-center gap-2.5 border-b border-gray-200 bg-gray-50 px-4 py-3">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white ${iconColorClass[iconColor]}`}
        >
          {icon}
        </span>
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-gray-900">{title}</span>
          {subtitle && <span className="text-[11px] text-gray-500">{subtitle}</span>}
        </div>
      </header>
      <div className="p-4">{children}</div>
    </section>
  )
}
