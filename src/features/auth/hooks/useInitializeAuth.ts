import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useSessionStore } from '@/store/sessionStore'
import { authService } from '../services/authService'
import type { UserProfile } from '../types'

/**
 * useInitializeAuth
 *
 * Restores and verifies authenticated user sessions upon page load or browser refresh
 * via GET /api/v1/auth/me without causing layout shifts or authentication flashes.
 *
 * CRITICAL ARCHITECTURAL GUARANTEE:
 * - Authoritative session identity is verified by the backend.
 * - Zero tokens or fake user profiles are created or assumed.
 * - If the session cookie is valid, populates the client store.
 * - If unauthenticated (401), safely transitions to unauthenticated state.
 */
export const useInitializeAuth = () => {
  const setAuthenticatedUser = useAuthStore((s) => s.setAuthenticatedUser)
  const setUnauthenticated = useAuthStore((s) => s.setUnauthenticated)
  const setLoading = useAuthStore((s) => s.setLoading)

  useEffect(() => {
    // If already authenticated (e.g. dev preview session restored synchronously from sessionStorage)
    if (useAuthStore.getState().isAuthenticated) {
      setLoading(false)
      return
    }

    const abortController = new AbortController()

    const verifySession = async () => {
      setLoading(true)
      try {
        const response = await authService.getCurrentUser({
          signal: abortController.signal,
          timeoutMs: 3500,
        })

        if (abortController.signal.aborted) return

        // Robust extraction: user can be response.data directly or response.data.user
        const user =
          response.data?.id
            ? (response.data as unknown as UserProfile)
            : (response.data as { user?: UserProfile })?.user

        if (user?.id && user?.role) {
          setAuthenticatedUser(user)
          useSessionStore.getState().recordUserActivity()
        } else {
          setUnauthenticated()
        }
      } catch {
        if (!abortController.signal.aborted) {
          setUnauthenticated()
        }
      }
    }

    void verifySession()

    return () => {
      abortController.abort()
    }
  }, [setAuthenticatedUser, setUnauthenticated, setLoading])
}
