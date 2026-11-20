import React from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAdminAuth } from '@/features/admin-auth/hooks/useAdminAuth'
import { useAuthStore } from '@/store/authStore'
import { useAdminAuthStore } from '@/store/adminAuthStore'
import { isDevAuthEnabled } from '@/features/dev-auth/utils/isDevAuthEnabled'
import type { AdminProfile } from '@/features/admin-auth/types'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton/LoadingSkeleton'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'

/**
 * Dedicated Administrator Route Guard.
 *
 * Exclusively guards the FinAuditEase Administration Platform.
 *
 * CRITICAL ARCHITECTURAL GUARANTEE:
 * - Unauthenticated users are redirected strictly to /admin/login (NOT the main user /login).
 * - Only verified accounts with role === 'ADMIN' are permitted.
 * - Rejects any standard user session (Auditors, Accounting Teams).
 */
export const AdminProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading, adminUser } = useAdminAuth()
  const location = useLocation()

  // 1. Loading Authentication State
  if (isLoading) {
    return (
      <PageContainer maxWidth="lg">
        <div
          role="status"
          aria-busy="true"
          aria-label="Verifying administrative session"
          style={{ padding: 'var(--spacing-12) 0' }}
        >
          <LoadingSkeleton height="2.5rem" width="40%" />
          <div style={{ marginTop: 'var(--spacing-6)' }}>
            <LoadingSkeleton height="12rem" width="100%" />
          </div>
        </div>
      </PageContainer>
    )
  }

  // 2. Development preview fallback sync:
  // If dev auth is enabled and the user is authenticated as ADMIN in dev preview mode, synchronize admin session
  if (isDevAuthEnabled() && (!isAuthenticated || !adminUser || adminUser.role !== 'ADMIN')) {
    const devUser = useAuthStore.getState().user
    if (devUser && devUser.role === 'ADMIN') {
      const devAdmin: AdminProfile = {
        id: devUser.id,
        email: devUser.email,
        fullName: devUser.fullName,
        role: 'ADMIN',
        department: 'Sabi Africa Platform Operations',
        isTwoFactorEnabled: true,
        createdAt: devUser.createdAt || '2026-01-01T00:00:00Z',
        lastLoginAt: devUser.createdAt || '2026-11-20T00:00:00.000Z',
      }
      useAdminAuthStore.getState().setAuthenticatedAdmin(devAdmin)
      return <Outlet />
    }
  }

  // 3. Unauthenticated Admin -> Redirect strictly to /admin/login
  if (!isAuthenticated || !adminUser || adminUser.role !== 'ADMIN') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  // 4. Authenticated Administrator
  return <Outlet />
}

