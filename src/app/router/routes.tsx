import { lazy, Suspense } from 'react'
import { Navigate, type RouteObject } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminProtectedRoute } from './AdminProtectedRoute'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton/LoadingSkeleton'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { isDevAuthEnabled } from '@/features/dev-auth/utils/isDevAuthEnabled'

// Route Loading Fallback
const RouteSuspenseFallback = () => (
  <PageContainer maxWidth="lg">
    <div style={{ padding: 'var(--spacing-8) 0' }}>
      <LoadingSkeleton height="2rem" width="30%" />
      <div style={{ marginTop: 'var(--spacing-4)' }}>
        <LoadingSkeleton height="8rem" width="100%" />
      </div>
    </div>
  </PageContainer>
)

// Public Pages (Lazy Loaded)
const HomePage = lazy(() => import('@/pages/public/HomePage').then((m) => ({ default: m.HomePage })))
const LoginPage = lazy(() => import('@/pages/public/LoginPage').then((m) => ({ default: m.LoginPage })))
const SignupPage = lazy(() => import('@/pages/public/SignupPage').then((m) => ({ default: m.SignupPage })))
const ForgotPasswordPage = lazy(() =>
  import('@/pages/public/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
)
const ResetPasswordPage = lazy(() =>
  import('@/pages/public/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage }))
)
const TwoFactorPage = lazy(() =>
  import('@/pages/public/TwoFactorPage').then((m) => ({ default: m.TwoFactorPage }))
)
const AcceptInvitationPage = lazy(() =>
  import('@/pages/public/AcceptInvitationPage').then((m) => ({ default: m.AcceptInvitationPage }))
)
const SignedOutPage = lazy(() =>
  import('@/pages/public/SignedOutPage').then((m) => ({ default: m.SignedOutPage }))
)
const TermsAndConditionsPage = lazy(() =>
  import('@/pages/public/TermsAndConditionsPage').then((m) => ({ default: m.TermsAndConditionsPage }))
)

// Development Preview Login Page
const DevLoginPage = lazy(() =>
  import('@/features/dev-auth/pages/DevLoginPage').then((m) => ({ default: m.DevLoginPage }))
)

// Application Pages (Lazy Loaded)
const DashboardPage = lazy(() =>
  import('@/pages/app/DashboardPage').then((m) => ({ default: m.DashboardPage }))
)
const EngagementsPage = lazy(() =>
  import('@/pages/app/EngagementsPage').then((m) => ({ default: m.EngagementsPage }))
)
const EngagementDetailPage = lazy(() =>
  import('@/pages/app/EngagementDetailPage').then((m) => ({ default: m.EngagementDetailPage }))
)
const AuditRequestsPage = lazy(() =>
  import('@/pages/app/AuditRequestsPage').then((m) => ({ default: m.AuditRequestsPage }))
)
const CreateAuditRequestPage = lazy(() =>
  import('@/pages/app/CreateAuditRequestPage').then((m) => ({ default: m.CreateAuditRequestPage }))
)
const AuditRequestDetailPage = lazy(() =>
  import('@/pages/app/AuditRequestDetailPage').then((m) => ({ default: m.AuditRequestDetailPage }))
)
const DocumentsPage = lazy(() =>
  import('@/pages/app/DocumentsPage').then((m) => ({ default: m.DocumentsPage }))
)
const ReviewPage = lazy(() => import('@/pages/app/ReviewPage').then((m) => ({ default: m.ReviewPage })))
const ReviewDetailPage = lazy(() =>
  import('@/pages/app/ReviewDetailPage').then((m) => ({ default: m.ReviewDetailPage }))
)
const ChecklistsPage = lazy(() =>
  import('@/pages/app/ChecklistsPage').then((m) => ({ default: m.ChecklistsPage }))
)
const PreAuditPage = lazy(() =>
  import('@/pages/app/PreAuditPage').then((m) => ({ default: m.PreAuditPage }))
)
const MonthEndPage = lazy(() =>
  import('@/pages/app/MonthEndPage').then((m) => ({ default: m.MonthEndPage }))
)
const WeeklyChecklistPage = lazy(() =>
  import('@/pages/app/WeeklyChecklistPage').then((m) => ({ default: m.WeeklyChecklistPage }))
)
const AssetVerificationPage = lazy(() =>
  import('@/pages/app/AssetVerificationPage').then((m) => ({ default: m.AssetVerificationPage }))
)
const NotificationsPage = lazy(() =>
  import('@/pages/app/NotificationsPage').then((m) => ({ default: m.NotificationsPage }))
)
const AuditTrailPage = lazy(() =>
  import('@/pages/app/AuditTrailPage').then((m) => ({ default: m.AuditTrailPage }))
)
const CreateEngagementPage = lazy(() =>
  import('@/pages/app/CreateEngagementPage').then((m) => ({ default: m.CreateEngagementPage }))
)
const ProfilePage = lazy(() =>
  import('@/pages/app/ProfilePage').then((m) => ({ default: m.ProfilePage }))
)
const CommunicationPage = lazy(() =>
  import('@/pages/app/CommunicationPage').then((m) => ({ default: m.CommunicationPage }))
)

// Feedback Pages (Lazy Loaded)
const UnauthorizedPage = lazy(() =>
  import('@/pages/feedback/UnauthorizedPage').then((m) => ({ default: m.UnauthorizedPage }))
)
const NotFoundPage = lazy(() =>
  import('@/pages/feedback/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
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
const AdminEngagementsPage = lazy(() =>
  import('@/pages/admin/AdminEngagementsPage').then((m) => ({ default: m.AdminEngagementsPage }))
)
const AdminSubscriptionsPage = lazy(() =>
  import('@/pages/admin/AdminSubscriptionsPage').then((m) => ({ default: m.AdminSubscriptionsPage }))
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
const AdminLoginPage = lazy(() =>
  import('@/pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage }))
)
const AdminAuditManagersPage = lazy(() =>
  import('@/pages/admin/AdminAuditManagersPage').then((m) => ({ default: m.AdminAuditManagersPage }))
)
const AdminCommunicationPage = lazy(() =>
  import('@/pages/admin/AdminCommunicationPage').then((m) => ({ default: m.AdminCommunicationPage }))
)
const AdminNotificationsPage = lazy(() =>
  import('@/pages/admin/AdminNotificationsPage').then((m) => ({ default: m.AdminNotificationsPage }))
)
const AdminRolesPermissionsPage = lazy(() =>
  import('@/pages/admin/AdminRolesPermissionsPage').then((m) => ({ default: m.AdminRolesPermissionsPage }))
)

export const appRoutes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      // Public Marketing Website Route Group (Includes Marketing AppHeader and AppFooter)
      {
        element: <PublicLayout />,
        children: [
          {
            path: '/',
            element: (
              <Suspense fallback={<RouteSuspenseFallback />}>
                <HomePage />
              </Suspense>
            ),
          },
          {
            path: '/unauthorized',
            element: (
              <Suspense fallback={<RouteSuspenseFallback />}>
                <UnauthorizedPage />
              </Suspense>
            ),
          },
          {
            path: '/terms-and-conditions',
            element: (
              <Suspense fallback={<RouteSuspenseFallback />}>
                <TermsAndConditionsPage />
              </Suspense>
            ),
          },
          {
            path: '/terms',
            element: (
              <Suspense fallback={<RouteSuspenseFallback />}>
                <TermsAndConditionsPage />
              </Suspense>
            ),
          },
        ],
      },

      // Authentication & Onboarding Route Group (Self-Contained AuthLayout with Brand Badge & Security Footer)
      {
        children: [
          ...(isDevAuthEnabled()
            ? [
                {
                  path: '/dev-login',
                  element: (
                    <Suspense fallback={<RouteSuspenseFallback />}>
                      <DevLoginPage />
                    </Suspense>
                  ),
                },
                {
                  path: '/dev-auth',
                  element: (
                    <Suspense fallback={<RouteSuspenseFallback />}>
                      <DevLoginPage />
                    </Suspense>
                  ),
                },
              ]
            : []),
          {
            path: '/login',
            element: (
              <Suspense fallback={<RouteSuspenseFallback />}>
                <LoginPage />
              </Suspense>
            ),
          },
          {
            path: '/signed-out',
            element: (
              <Suspense fallback={<RouteSuspenseFallback />}>
                <SignedOutPage />
              </Suspense>
            ),
          },
          {
            path: '/signup',
            element: (
              <Suspense fallback={<RouteSuspenseFallback />}>
                <SignupPage />
              </Suspense>
            ),
          },
          {
            path: '/forgot-password',
            element: (
              <Suspense fallback={<RouteSuspenseFallback />}>
                <ForgotPasswordPage />
              </Suspense>
            ),
          },
          {
            path: '/reset-password',
            element: (
              <Suspense fallback={<RouteSuspenseFallback />}>
                <ResetPasswordPage />
              </Suspense>
            ),
          },
          {
            path: '/2fa',
            element: (
              <Suspense fallback={<RouteSuspenseFallback />}>
                <TwoFactorPage />
              </Suspense>
            ),
          },
          {
            path: '/accept-invitation',
            element: (
              <Suspense fallback={<RouteSuspenseFallback />}>
                <AcceptInvitationPage />
              </Suspense>
            ),
          },
        ],
      },

      // Application Route Group (Protected Boundary)
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                path: '/dashboard',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <DashboardPage />
                  </Suspense>
                ),
              },
              {
                path: '/engagements',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <EngagementsPage />
                  </Suspense>
                ),
              },
              {
                path: '/engagements/:id',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <EngagementDetailPage />
                  </Suspense>
                ),
              },
              {
                path: '/profile',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <ProfilePage />
                  </Suspense>
                ),
              },
              {
                path: '/audit-requests',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <AuditRequestsPage />
                  </Suspense>
                ),
              },
              {
                path: '/audit-requests/:id',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <AuditRequestDetailPage />
                  </Suspense>
                ),
              },
              {
                path: '/documents',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <DocumentsPage />
                  </Suspense>
                ),
              },
              {
                path: '/checklists',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <ChecklistsPage />
                  </Suspense>
                ),
              },
              {
                path: '/weekly',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <WeeklyChecklistPage />
                  </Suspense>
                ),
              },
              {
                path: '/checklists/weekly',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <WeeklyChecklistPage />
                  </Suspense>
                ),
              },
              {
                path: '/checklists/month-end',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <MonthEndPage />
                  </Suspense>
                ),
              },
              {
                path: '/checklists/pre-audit',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <PreAuditPage />
                  </Suspense>
                ),
              },
              {
                path: '/pre-audit',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <PreAuditPage />
                  </Suspense>
                ),
              },
              {
                path: '/month-end',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <MonthEndPage />
                  </Suspense>
                ),
              },
              {
                path: '/asset-verification',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <AssetVerificationPage />
                  </Suspense>
                ),
              },
              {
                path: '/notifications',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <NotificationsPage />
                  </Suspense>
                ),
              },
              {
                path: '/communication',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <CommunicationPage />
                  </Suspense>
                ),
              },
              // Auditor-Only Guarded Routes (Phase 5 Section 9)
              {
                element: <ProtectedRoute allowedRoles={['AUDITOR', 'AUDIT_MANAGER', 'ADMIN']} />,
                children: [
                  {
                    path: '/engagements/create',
                    element: (
                      <Suspense fallback={<RouteSuspenseFallback />}>
                        <CreateEngagementPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: '/audit-requests/create',
                    element: (
                      <Suspense fallback={<RouteSuspenseFallback />}>
                        <CreateAuditRequestPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: '/review',
                    element: (
                      <Suspense fallback={<RouteSuspenseFallback />}>
                        <ReviewPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: '/review/:id',
                    element: (
                      <Suspense fallback={<RouteSuspenseFallback />}>
                        <ReviewDetailPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: '/audit-trail',
                    element: (
                      <Suspense fallback={<RouteSuspenseFallback />}>
                        <AuditTrailPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: '/engagements/:engagementId/audit-trail',
                    element: (
                      <Suspense fallback={<RouteSuspenseFallback />}>
                        <AuditTrailPage />
                      </Suspense>
                    ),
                  },
                ],
              },
            ],
          },
        ],
      },

      // Dedicated Enterprise Administration Platform Authentication Gateway
      {
        path: '/admin/login',
        element: (
          <Suspense fallback={<RouteSuspenseFallback />}>
            <AdminLoginPage />
          </Suspense>
        ),
      },

      // Enterprise Administrator Platform Route Group (Guarded strictly for ADMIN via AdminProtectedRoute)
      {
        element: <AdminProtectedRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                path: '/admin',
                element: <Navigate to="/admin/dashboard" replace />,
              },
              {
                path: '/admin/dashboard',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <AdminDashboardPage />
                  </Suspense>
                ),
              },
              {
                path: '/admin/users',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <AdminUsersPage />
                  </Suspense>
                ),
              },
              {
                path: '/admin/organisations',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <AdminOrganisationsPage />
                  </Suspense>
                ),
              },
              {
                path: '/admin/organizations',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <AdminOrganisationsPage />
                  </Suspense>
                ),
              },
              {
                path: '/admin/auditors',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <AdminAuditorsPage />
                  </Suspense>
                ),
              },
              {
                path: '/admin/audit-managers',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <AdminAuditManagersPage />
                  </Suspense>
                ),
              },
              {
                path: '/admin/engagements',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <AdminEngagementsPage />
                  </Suspense>
                ),
              },
              {
                path: '/admin/subscriptions',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <AdminSubscriptionsPage />
                  </Suspense>
                ),
              },
              {
                path: '/admin/communication',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <AdminCommunicationPage />
                  </Suspense>
                ),
              },
              {
                path: '/admin/audit-trail',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <AdminAuditTrailPage />
                  </Suspense>
                ),
              },
              {
                path: '/admin/reports',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <AdminReportsPage />
                  </Suspense>
                ),
              },
              {
                path: '/admin/notifications',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <AdminNotificationsPage />
                  </Suspense>
                ),
              },
              {
                path: '/admin/security',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <AdminSecurityPage />
                  </Suspense>
                ),
              },
              {
                path: '/admin/settings',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <AdminSettingsPage />
                  </Suspense>
                ),
              },
              {
                path: '/admin/roles-permissions',
                element: (
                  <Suspense fallback={<RouteSuspenseFallback />}>
                    <AdminRolesPermissionsPage />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },

      // Not Found Route (404)
      {
        element: <PublicLayout />,
        children: [
          {
            path: '*',
            element: (
              <Suspense fallback={<RouteSuspenseFallback />}>
                <NotFoundPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
]
