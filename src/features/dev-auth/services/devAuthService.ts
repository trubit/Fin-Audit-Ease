import { useAuthStore } from '@/store/authStore'
import { useSessionStore } from '@/store/sessionStore'
import { queryClient } from '@/lib/queryClient'
import { DEV_USERS } from '../constants'
import type { DevRole } from '../types'

/**
 * Temporary Development Authentication Service.
 *
 * CRITICAL ARCHITECTURAL GUARANTEES:
 * 1. Enforced strictly by import.meta.env.DEV.
 * 2. Zero network requests sent to backend.
 * 3. Zero fake tokens or authorization headers generated.
 * 4. Clears TanStack Query cache on login, role switch, and logout to guarantee tenant isolation.
 */
class DevAuthService {
  /**
   * Log in to the application as a development preview user.
   */
  loginAsDev(role: DevRole): void {
    if (!import.meta.env.DEV) {
      throw new Error('Development authentication is strictly disabled in production builds.')
    }

    // 1. Purge any stale queries from previous sessions
    queryClient.clear()

    // 2. Set dev user in store
    const userPreset = DEV_USERS[role]
    useAuthStore.getState().setDevAuthenticatedUser(userPreset)

    // 3. Reset session inactivity timer
    useSessionStore.getState().recordUserActivity()
  }

  /**
   * Switch active role while in development preview mode.
   */
  switchDevRole(role: DevRole): void {
    if (!import.meta.env.DEV) {
      throw new Error('Development authentication is strictly disabled in production builds.')
    }

    // 1. Clear query cache to prevent role-mismatched or stale private data
    queryClient.clear()

    // 2. Update role profile
    const userPreset = DEV_USERS[role]
    useAuthStore.getState().setDevAuthenticatedUser(userPreset)

    // 3. Reset session activity timestamp
    useSessionStore.getState().recordUserActivity()
  }

  /**
   * Exit development preview mode and clear state.
   */
  logoutDev(): void {
    queryClient.clear()
    useAuthStore.getState().setUnauthenticated()
    useSessionStore.getState().resetSessionState()
  }
}

export const devAuthService = new DevAuthService()
