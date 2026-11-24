import React, { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { AdminLayout } from '@/layouts/AdminLayout'
import { AdminProtectedRoute } from '@/app/router/AdminProtectedRoute'

// Fallback skeleton loader for administrative route transitions
const AdminRouteSuspenseFallback: React.FC = () => (
  <div
    role="status"
    aria-busy="true"
    aria-label="Loading administrative console module..."
    style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      color: 'var(--color-neutral-600, #4b5563)',
      fontFamily: 'var(--font-body, "Times New Roman", Times, serif)',
    }}
  >
    <div
      style={{
        width: '36px',
        height: '36px',
        border: '3px solid rgba(15, 89, 56, 0.15)',
        borderTopColor: '#0F5938',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
      Loading FinAuditEase Administration Console...
    </span>
  </div>
)

// Admin Platform Pages (Lazy Loaded)
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
)
const AdminUsersPage = lazy(() =>
  import('@/pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage }))
)
const AdminOrganisationsPage = lazy(() =>
  import('@/pages/admin/AdminOrganisationsPage').then((m) => ({ default: m.AdminOrganisationsPage }))
)
const AdminAuditorsPage = lazy(() =>
  import('@/pages/admin/AdminAuditorsPage').then((m) => ({ default: m.AdminAuditorsPage }))
)
const AdminAuditManagersPage = lazy(() =>
  import('@/pages/admin/AdminAuditManagersPage').then((m) => ({ default: m.AdminAuditManagersPage }))
)
const AdminAccountingManagersPage = lazy(() =>
  import('@/pages/admin/AdminAccountingManagersPage').then((m) => ({ default: m.AdminAccountingManagersPage }))
)
const AdminEngagementsPage = lazy(() =>
  import('@/pages/admin/AdminEngagementsPage').then((m) => ({ default: m.AdminEngagementsPage }))
)
const AdminSubscriptionsPage = lazy(() =>
  import('@/pages/admin/AdminSubscriptionsPage').then((m) => ({ default: m.AdminSubscriptionsPage }))
)
const AdminCommunicationPage = lazy(() =>
  import('@/pages/admin/AdminCommunicationPage').then((m) => ({ default: m.AdminCommunicationPage }))
)
const AdminAuditTrailPage = lazy(() =>
  import('@/pages/admin/AdminAuditTrailPage').then((m) => ({ default: m.AdminAuditTrailPage }))
)
const AdminSecurityPage = lazy(() =>
  import('@/pages/admin/AdminSecurityPage').then((m) => ({ default: m.AdminSecurityPage }))
)
const AdminReportsPage = lazy(() =>
  import('@/pages/admin/AdminReportsPage').then((m) => ({ default: m.AdminReportsPage }))
)
const AdminSettingsPage = lazy(() =>
  import('@/pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage }))
)
const AdminNotificationsPage = lazy(() =>
  import('@/pages/admin/AdminNotificationsPage').then((m) => ({ default: m.AdminNotificationsPage }))
)
const AdminRolesPermissionsPage = lazy(() =>
  import('@/pages/admin/AdminRolesPermissionsPage').then((m) => ({ default: m.AdminRolesPermissionsPage }))
)
const AdminLoginPage = lazy(() =>
  import('@/pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage }))
)

export const adminRoutes: RouteObject[] = [
  // Standalone Administrative Authentication Gateway
  {
    path: '/login',
    element: (
      <Suspense fallback={<AdminRouteSuspenseFallback />}>
        <AdminLoginPage />
      </Suspense>
    ),
  },
  {
    path: '/admin/login',
    element: (
      <Suspense fallback={<AdminRouteSuspenseFallback />}>
        <AdminLoginPage />
      </Suspense>
    ),
  },

  // Protected Administrative Operations Group (Guarded strictly for role === 'ADMIN')
  {
    element: <AdminProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: '/',
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: '/admin',
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: '/dashboard',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminDashboardPage />
              </Suspense>
            ),
          },
          {
            path: '/admin/dashboard',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminDashboardPage />
              </Suspense>
            ),
          },
          {
            path: '/users',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminUsersPage />
              </Suspense>
            ),
          },
          {
            path: '/admin/users',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminUsersPage />
              </Suspense>
            ),
          },
          {
            path: '/organisations',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminOrganisationsPage />
              </Suspense>
            ),
          },
          {
            path: '/admin/organisations',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminOrganisationsPage />
              </Suspense>
            ),
          },
          {
            path: '/organizations',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminOrganisationsPage />
              </Suspense>
            ),
          },
          {
            path: '/admin/organizations',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminOrganisationsPage />
              </Suspense>
            ),
          },
          {
            path: '/auditors',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminAuditorsPage />
              </Suspense>
            ),
          },
          {
            path: '/admin/auditors',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminAuditorsPage />
              </Suspense>
            ),
          },
          {
            path: '/audit-managers',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminAuditManagersPage />
              </Suspense>
            ),
          },
          {
            path: '/admin/audit-managers',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminAuditManagersPage />
              </Suspense>
            ),
          },
          {
            path: '/accounting-managers',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminAccountingManagersPage />
              </Suspense>
            ),
          },
          {
            path: '/admin/accounting-managers',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminAccountingManagersPage />
              </Suspense>
            ),
          },
          {
            path: '/engagements',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminEngagementsPage />
              </Suspense>
            ),
          },
          {
            path: '/admin/engagements',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminEngagementsPage />
              </Suspense>
            ),
          },
          {
            path: '/subscriptions',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminSubscriptionsPage />
              </Suspense>
            ),
          },
          {
            path: '/admin/subscriptions',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminSubscriptionsPage />
              </Suspense>
            ),
          },
          {
            path: '/communication',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminCommunicationPage />
              </Suspense>
            ),
          },
          {
            path: '/admin/communication',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminCommunicationPage />
              </Suspense>
            ),
          },
          {
            path: '/audit-trail',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminAuditTrailPage />
              </Suspense>
            ),
          },
          {
            path: '/admin/audit-trail',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminAuditTrailPage />
              </Suspense>
            ),
          },
          {
            path: '/reports',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminReportsPage />
              </Suspense>
            ),
          },
          {
            path: '/admin/reports',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminReportsPage />
              </Suspense>
            ),
          },
          {
            path: '/notifications',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminNotificationsPage />
              </Suspense>
            ),
          },
          {
            path: '/admin/notifications',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminNotificationsPage />
              </Suspense>
            ),
          },
          {
            path: '/security',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminSecurityPage />
              </Suspense>
            ),
          },
          {
            path: '/admin/security',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminSecurityPage />
              </Suspense>
            ),
          },
          {
            path: '/settings',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminSettingsPage />
              </Suspense>
            ),
          },
          {
            path: '/admin/settings',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminSettingsPage />
              </Suspense>
            ),
          },
          {
            path: '/roles-permissions',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminRolesPermissionsPage />
              </Suspense>
            ),
          },
          {
            path: '/admin/roles-permissions',
            element: (
              <Suspense fallback={<AdminRouteSuspenseFallback />}>
                <AdminRolesPermissionsPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },

  // Fallback Catch-All
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]

