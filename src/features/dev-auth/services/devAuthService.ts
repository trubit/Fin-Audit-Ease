import { useAuthStore } from '@/store/authStore'
import { useAdminAuthStore } from '@/store/adminAuthStore'
import { useSessionStore } from '@/store/sessionStore'
import { queryClient } from '@/lib/queryClient'
import { DEV_USERS } from '../constants'
import { isDevAuthEnabled } from '../utils/isDevAuthEnabled'
import type { DevRole } from '../types'
import type { AdminProfile } from '@/features/admin-auth/types'

/**
 * Temporary Development Authentication Service.
 *
 * CRITICAL ARCHITECTURAL GUARANTEES:
 * 1. Enforced by isDevAuthEnabled() (defaults to enabled for UI preview, disabled when VITE_ENABLE_DEV_AUTH="false").
 * 2. Zero network requests sent to backend.
 * 3. Zero fake tokens or authorization headers generated.
 * 4. Clears TanStack Query cache on login, role switch, and logout to guarantee tenant isolation.
 */
class DevAuthService {
  /**
   * Log in to the application as a development preview user.
   */
  loginAsDev(role: DevRole): void {
    if (!isDevAuthEnabled()) {
      throw new Error('Development authentication is disabled.')
    }

    // 1. Purge any stale queries from previous sessions
    queryClient.clear()

    // 2. Set dev user in store
    const userPreset = DEV_USERS[role]
    useAuthStore.getState().setDevAuthenticatedUser(userPreset)

    // 3. Reset session inactivity timer
    useSessionStore.getState().recordUserActivity()

    // 4. Synchronize administration platform session store for ADMIN role
    if (role === 'ADMIN') {
      const adminProfile: AdminProfile = {
        id: userPreset.id,
        email: userPreset.email,
        fullName: userPreset.fullName,
        role: 'ADMIN',
        department: 'Sabi Africa Platform Operations',
        isTwoFactorEnabled: true,
        createdAt: userPreset.createdAt,
        lastLoginAt: new Date().toISOString(),
      }
      useAdminAuthStore.getState().setAuthenticatedAdmin(adminProfile)
    } else {
      useAdminAuthStore.getState().setUnauthenticatedAdmin()
    }
  }

  /**
   * Switch active role while in development preview mode.
   */
  switchDevRole(role: DevRole): void {
    if (!isDevAuthEnabled()) {
      throw new Error('Development authentication is disabled.')
    }

    // 1. Clear query cache to prevent role-mismatched or stale private data
    queryClient.clear()

    // 2. Update role profile
    const userPreset = DEV_USERS[role]
    useAuthStore.getState().setDevAuthenticatedUser(userPreset)

    // 3. Reset session activity timestamp
    useSessionStore.getState().recordUserActivity()

    // 4. Synchronize administration platform session store for ADMIN role
    if (role === 'ADMIN') {
      const adminProfile: AdminProfile = {
        id: userPreset.id,
        email: userPreset.email,
        fullName: userPreset.fullName,
        role: 'ADMIN',
        department: 'Sabi Africa Platform Operations',
        isTwoFactorEnabled: true,
        createdAt: userPreset.createdAt,
        lastLoginAt: new Date().toISOString(),
      }
      useAdminAuthStore.getState().setAuthenticatedAdmin(adminProfile)
    } else {
      useAdminAuthStore.getState().setUnauthenticatedAdmin()
    }
  }

  /**
   * Exit development preview mode and clear state.
   */
  logoutDev(): void {
    queryClient.clear()
    useAuthStore.getState().setUnauthenticated()
    useAdminAuthStore.getState().setUnauthenticatedAdmin()
    useSessionStore.getState().resetSessionState()
  }
}

export const devAuthService = new DevAuthService()
