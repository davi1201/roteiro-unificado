import { Outlet, useLocation, useMatch } from 'react-router-dom'
import { useMemo } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed'
import { cn } from '@/lib/utils'
import type { BreadcrumbItem } from './AdminHeader'

export function AdminLayout() {
  const [collapsed] = useSidebarCollapsed()
  const location = useLocation()
  const orgDetailMatch = useMatch('/admin/orgs/:orgId')

  const breadcrumb = useMemo<BreadcrumbItem[]>(() => {
    if (orgDetailMatch) {
      const orgId = orgDetailMatch.params.orgId ?? ''
      return [
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Organizações', href: '/admin/dashboard' },
        { label: `Org ${orgId.slice(0, 8)}` },
      ]
    }
    if (location.pathname.startsWith('/admin/dashboard')) {
      return [{ label: 'Admin' }, { label: 'Organizações' }]
    }
    return [{ label: 'Admin' }]
  }, [orgDetailMatch, location.pathname])

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div
        className={cn(
          'flex min-h-screen flex-col transition-[margin-left] duration-[250ms] ease-out',
          collapsed ? 'ml-[60px]' : 'ml-60'
        )}
      >
        <AdminHeader breadcrumb={breadcrumb} />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
