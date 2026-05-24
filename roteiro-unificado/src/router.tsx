import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Login } from '@/pages/Login'
import { ForgotPassword } from '@/pages/ForgotPassword'
import { ResetPassword } from '@/pages/ResetPassword'
import { ProtectedRoute } from '@/components/routing/ProtectedRoute'
import { AdminRoute } from '@/components/routing/AdminRoute'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { OrgDetail } from '@/pages/admin/OrgDetail'
import { FormLayout } from '@/features/form/FormLayout'
import { HistoryPage } from '@/features/form/HistoryPage'
import { CompanyDashboard } from '@/features/form/CompanyDashboard'

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
        element: <FormLayout />,
      },
      {
        path: '/form/:orgId/history',
        element: <HistoryPage />,
      },
      {
        path: '/form/:orgId/dashboard',
        element: <CompanyDashboard />,
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
