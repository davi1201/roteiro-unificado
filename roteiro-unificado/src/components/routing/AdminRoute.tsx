import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { Spinner } from '@/components/ui'

export function AdminRoute() {
  const { session, role, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="bg-primary flex min-h-screen items-center justify-center">
        <Spinner size="lg" className="border-white border-t-transparent" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
