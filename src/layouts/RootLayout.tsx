import React from 'react'
import { Outlet } from 'react-router-dom'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary/ErrorBoundary'
import { ToastProvider } from '@/components/feedback/Toast'
import { OfflineBanner } from '@/components/feedback/OfflineBanner/OfflineBanner'
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt'
import { SessionTimeoutModal } from '@/components/feedback/SessionTimeoutModal/SessionTimeoutModal'
import { useSessionTimeout } from '@/hooks/useSessionTimeout'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useInitializeAuth } from '@/features/auth/hooks/useInitializeAuth'

export const RootLayout: React.FC = () => {
  const { isAuthenticated, logout } = useAuth()

  // Initialize and revalidate active backend session on app load
  useInitializeAuth()

  // Activate session inactivity listener when user is authenticated
  useSessionTimeout(isAuthenticated)

  return (
    <ErrorBoundary>
      <ToastProvider>
        <OfflineBanner />
        <Outlet />
        <PWAInstallPrompt />
        {isAuthenticated && <SessionTimeoutModal onLogout={logout} />}
      </ToastProvider>
    </ErrorBoundary>
  )
}
