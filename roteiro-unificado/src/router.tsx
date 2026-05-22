import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Login } from '@/pages/Login'
import { ForgotPassword } from '@/pages/ForgotPassword'
import { ResetPassword } from '@/pages/ResetPassword'
import { ProtectedRoute } from '@/components/routing/ProtectedRoute'
import { AdminRoute } from '@/components/routing/AdminRoute'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { OrgDetail } from '@/pages/admin/OrgDetail'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/form/:orgId',
        element: <div>Form Page — Phase 5</div>,
      },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin/dashboard', element: <AdminDashboard /> },
          { path: '/admin/orgs/:orgId', element: <OrgDetail /> },
        ],
      },
    ],
  },
])
