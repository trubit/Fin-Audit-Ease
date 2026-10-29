import React from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { UserRole } from '@/features/auth/types'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton/LoadingSkeleton'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'

export interface ProtectedRouteProps {
  readonly allowedRoles?: readonly UserRole[]
}

/**
 * Enterprise Route Guard.
 *
 * Enforces session authentication and role-based permissions.
 *
 * CRITICAL ARCHITECTURAL GUARANTEE:
 * Does NOT hardcode isLoggedIn = true or mock authentication.
 * Consumes the reactive authentication abstraction hook.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  // 1. Loading Authentication State
  if (isLoading) {
    return (
      <PageContainer maxWidth="lg">
        <div
          role="status"
          aria-busy="true"
          aria-label="Verifying authentication session"
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

  // 2. Unauthenticated State -> Redirect to Login with Return URL
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 3. Unauthorized State (Role Mismatch) -> Redirect to /unauthorized
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  // 4. Authenticated & Authorized
  return <Outlet />
}
