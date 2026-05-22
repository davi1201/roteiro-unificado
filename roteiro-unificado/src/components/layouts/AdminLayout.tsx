import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <AdminHeader />
      <main className="mt-14 ml-60 p-8">
        <Outlet />
      </main>
    </div>
  )
}
