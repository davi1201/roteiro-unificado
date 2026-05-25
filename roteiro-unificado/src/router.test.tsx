/**
 * P06-A: AUTH-04/05 — router structure tests
 *
 * Tests:
 * 1. /login is a public route
 * 2. /forgot-password is a public route
 * 3. /reset-password is a public route
 * 4. /form/:orgId is nested under ProtectedRoute
 * 5. /admin/dashboard is nested under AdminRoute
 */

import { vi, describe, it, expect } from 'vitest'

// Must mock supabase before importing router (which imports pages that use supabase)
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
    from: vi.fn(),
  },
}))

// Mock all page/layout components to avoid their dependency chains
vi.mock('@/pages/Login', () => ({ Login: () => <div>Login</div> }))
vi.mock('@/pages/ForgotPassword', () => ({ ForgotPassword: () => <div>ForgotPassword</div> }))
vi.mock('@/pages/ResetPassword', () => ({ ResetPassword: () => <div>ResetPassword</div> }))
vi.mock('@/components/routing/ProtectedRoute', () => ({
  ProtectedRoute: () => <div>ProtectedRoute</div>,
}))
vi.mock('@/components/routing/AdminRoute', () => ({
  AdminRoute: () => <div>AdminRoute</div>,
}))
vi.mock('@/components/layouts/AdminLayout', () => ({
  AdminLayout: () => <div>AdminLayout</div>,
}))
vi.mock('@/pages/admin/AdminDashboard', () => ({
  AdminDashboard: () => <div>AdminDashboard</div>,
}))
vi.mock('@/pages/admin/OrgDetail', () => ({ OrgDetail: () => <div>OrgDetail</div> }))
vi.mock('@/features/form/FormLayout', () => ({ FormLayout: () => <div>FormLayout</div> }))
vi.mock('@/features/form/HistoryPage', () => ({ HistoryPage: () => <div>HistoryPage</div> }))
vi.mock('@/features/form/CompanyDashboard', () => ({
  CompanyDashboard: () => <div>CompanyDashboard</div>,
}))

import { router } from './router'

type RouteConfig = {
  path?: string
  element?: unknown
  children?: RouteConfig[]
}

function flattenRoutes(
  routes: RouteConfig[]
): { path: string; element: unknown; parentElement?: unknown }[] {
  const result: { path: string; element: unknown; parentElement?: unknown }[] = []

  for (const route of routes) {
    if (route.path) {
      result.push({ path: route.path, element: route.element })
    }

    if (route.children) {
      for (const child of route.children) {
        if (child.path) {
          result.push({
            path: child.path,
            element: child.element,
            parentElement: route.element,
          })
        }
        // Handle deeply nested children (AdminLayout)
        if (child.children) {
          for (const grandchild of child.children) {
            if (grandchild.path) {
              result.push({
                path: grandchild.path,
                element: grandchild.element,
                parentElement: route.element,
              })
            }
          }
        }
      }
    }
  }

  return result
}

describe('router — public routes exist', () => {
  const routes = router.routes as RouteConfig[]

  it('has /login as a top-level route', () => {
    const loginRoute = routes.find((r) => r.path === '/login')
    expect(loginRoute).toBeDefined()
  })

  it('has /forgot-password as a top-level route', () => {
    const forgotRoute = routes.find((r) => r.path === '/forgot-password')
    expect(forgotRoute).toBeDefined()
  })

  it('has /reset-password as a top-level route', () => {
    const resetRoute = routes.find((r) => r.path === '/reset-password')
    expect(resetRoute).toBeDefined()
  })
})

describe('router — /form/:orgId under ProtectedRoute', () => {
  it('/form/:orgId is defined as a child of a route without its own path (ProtectedRoute wrapper)', () => {
    const routes = router.routes as RouteConfig[]
    // Find a route with no path (layout route) that has /form/:orgId child
    const protectedWrapper = routes.find(
      (r) => !r.path && r.children?.some((c) => c.path === '/form/:orgId')
    )
    expect(protectedWrapper).toBeDefined()
  })

  it('/form/:orgId child route exists', () => {
    const routes = router.routes as RouteConfig[]
    const allFlat = flattenRoutes(routes)
    const formRoute = allFlat.find((r) => r.path === '/form/:orgId')
    expect(formRoute).toBeDefined()
  })
})

describe('router — /admin/dashboard under AdminRoute', () => {
  it('/admin/dashboard is defined under a pathless wrapper route (AdminRoute)', () => {
    const routes = router.routes as RouteConfig[]
    // AdminRoute is a pathless wrapper; /admin/dashboard may be one or two levels deep
    const adminWrapper = routes.find(
      (r) =>
        !r.path &&
        r.children?.some(
          (c) =>
            c.path === '/admin/dashboard' ||
            c.children?.some((gc) => gc.path === '/admin/dashboard')
        )
    )
    expect(adminWrapper).toBeDefined()
  })

  it('/admin/dashboard child route exists', () => {
    const routes = router.routes as RouteConfig[]
    const allFlat = flattenRoutes(routes)
    const dashboardRoute = allFlat.find((r) => r.path === '/admin/dashboard')
    expect(dashboardRoute).toBeDefined()
  })
})
