import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface AdminHeaderProps {
  breadcrumb: BreadcrumbItem[]
  actions?: ReactNode
}

export function AdminHeader({ breadcrumb, actions }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-gray-500">
        {breadcrumb.map((item, idx) => {
          const isLast = idx === breadcrumb.length - 1
          return (
            <Fragment key={`${item.label}-${idx}`}>
              {idx > 0 && <span aria-hidden="true">›</span>}
              {item.href && !isLast ? (
                <Link to={item.href} className="hover:text-gray-700 hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(isLast && 'font-semibold text-gray-900')}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </Fragment>
          )
        })}
      </nav>
      <div className="flex items-center gap-2">{actions}</div>
    </header>
  )
}
