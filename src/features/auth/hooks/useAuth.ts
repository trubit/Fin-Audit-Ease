import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useSessionStore } from '@/store/sessionStore'
import { queryClient } from '@/lib/queryClient'
import { authService } from '../services/authService'

/**
 * Authentication Abstraction Hook.
 *
 * Provides a clean interface for route guards, session timeout listeners,
 * and user session management.
 *
 * CRITICAL ARCHITECTURAL GUARANTEE:
 * - Default state is strictly unauthenticated.
 * - Reactive state is backed by the shared client auth store.
 * - Never bypasses backend authentication.
 */
export const useAuth = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const status = useAuthStore((state) => state.status)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const authMode = useAuthStore((state) => state.authMode)
  const setAuthenticatedUser = useAuthStore((state) => state.setAuthenticatedUser)
  const setDevAuthenticatedUser = useAuthStore((state) => state.setDevAuthenticatedUser)
  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated)

  const logout = useCallback(async (destination = '/signed-out') => {
    try {
      if (authMode === 'real') {
        await authService.logout()
      }
    } catch {
      // Gracefully continue local cleanup if server is unreachable
    } finally {
      queryClient.clear()
      setUnauthenticated()
      useSessionStore.getState().resetSessionState()
      navigate(destination, { replace: true })
    }
  }, [authMode, navigate, setUnauthenticated])

  return {
    user,
    status,
    isAuthenticated,
    authMode,
    isLoading: status === 'loading',
    setAuthenticatedUser,
    setDevAuthenticatedUser,
    logout,
  }
}
