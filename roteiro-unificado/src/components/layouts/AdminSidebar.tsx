import { NavLink, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed'
import { useAuth } from '@/features/auth/useAuth'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui'

export function AdminSidebar() {
  const [collapsed, toggleCollapsed] = useSidebarCollapsed()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch {
      toast.error('Erro ao encerrar sessão')
    }
  }

  return (
    <aside
      className={cn(
        'bg-primary fixed top-0 bottom-0 left-0 z-30 flex flex-col overflow-hidden text-white transition-[width] duration-[250ms] ease-out',
        collapsed ? 'w-[60px]' : 'w-60'
      )}
    >
      {/* Toggle button — absolute, on the right edge */}
      <button
        type="button"
        aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        onClick={toggleCollapsed}
        className="absolute top-3 -right-3 z-[31] flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
      >
        {collapsed ? (
          /* ChevronRight — sidebar is collapsed, click to expand */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="#374151"
            width={14}
            height={14}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        ) : (
          /* ChevronLeft — sidebar is expanded, click to collapse */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="#374151"
            width={14}
            height={14}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        )}
      </button>

      {/* Sidebar header / brand */}
      <div className="border-primary-800 flex items-center gap-2.5 border-b px-4 py-4">
        {/* Logo icon — always visible */}
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white/20 text-xs font-bold text-white">
          R
        </span>
        <span className={cn('text-base font-semibold whitespace-nowrap', collapsed && 'hidden')}>
          Roteiro Unificado
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 overflow-hidden p-3" aria-label="Navegação admin">
        {/* Organizações — active/navigable */}
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            cn(
              'flex h-10 items-center gap-3 rounded-md px-3 text-sm',
              isActive
                ? 'bg-primary-800 font-semibold text-white'
                : 'text-primary-100 hover:bg-primary-800 hover:text-white'
            )
          }
        >
          {/* BuildingOffice icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-5 w-5 shrink-0"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"
            />
          </svg>
          <span className={cn('whitespace-nowrap', collapsed && 'hidden')}>Organizações</span>
        </NavLink>

        {/* Dashboard — disabled */}
        <span
          aria-disabled="true"
          className="text-primary-300 flex h-10 cursor-not-allowed items-center gap-3 rounded-md px-3 text-sm opacity-60"
        >
          {/* ChartBar icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-5 w-5 shrink-0"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.5h18M3 9h9m-9 9h18M3 4.5h18"
            />
          </svg>
          <span className={cn('whitespace-nowrap', collapsed && 'hidden')}>Dashboard</span>
          <span className={cn('ml-auto text-xs', collapsed && 'hidden')}>Em breve</span>
        </span>

        {/* Exportações — disabled */}
        <span
          aria-disabled="true"
          className="text-primary-300 flex h-10 cursor-not-allowed items-center gap-3 rounded-md px-3 text-sm opacity-60"
        >
          {/* ArrowDownTray icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-5 w-5 shrink-0"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          <span className={cn('whitespace-nowrap', collapsed && 'hidden')}>Exportações</span>
          <span className={cn('ml-auto text-xs', collapsed && 'hidden')}>Em breve</span>
        </span>
      </nav>

      {/* Footer — user pill */}
      <div className="border-primary-800 mt-auto border-t p-3">
        {/* Avatar — always visible */}
        <div
          className="bg-primary-800 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold uppercase"
          title={user?.email ?? ''}
        >
          {user?.email?.[0] ?? '?'}
        </div>

        {/* Email + sign-out — only when expanded */}
        {!collapsed && (
          <div className="mt-2 flex flex-col gap-2">
            <span
              className="text-primary-100 max-w-full truncate text-xs"
              title={user?.email ?? ''}
            >
              {user?.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-primary-800 w-full justify-start text-white"
              onClick={handleSignOut}
            >
              Sair
            </Button>
          </div>
        )}
      </div>
    </aside>
  )
}
