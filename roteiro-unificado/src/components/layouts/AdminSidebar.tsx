import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function AdminSidebar() {
  return (
    <aside className="bg-primary fixed top-0 bottom-0 left-0 z-30 flex w-60 flex-col text-white">
      {/* Sidebar header */}
      <div className="border-primary-800 border-b px-4 py-4">
        <span className="text-base font-semibold">Roteiro Unificado</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Navegação admin">
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
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"
            />
          </svg>
          <span>Organizações</span>
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
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.5h18M3 9h9m-9 9h18M3 4.5h18"
            />
          </svg>
          <span>Dashboard</span>
          <span className="text-primary-300 ml-auto text-xs">Em breve</span>
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
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          <span>Exportações</span>
          <span className="text-primary-300 ml-auto text-xs">Em breve</span>
        </span>
      </nav>
    </aside>
  )
}
