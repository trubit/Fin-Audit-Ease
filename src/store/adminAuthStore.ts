import { create } from 'zustand'
import type { AdminProfile, AdminAuthState, AdminAuthStatus } from '@/features/admin-auth/types'
import { isDevAuthEnabled } from '@/features/dev-auth/utils/isDevAuthEnabled'
import { ADMIN_SESSION_STORAGE_KEY } from '@/features/admin-auth/services/adminAuthService'

export interface AdminAuthStoreState extends AdminAuthState {
  readonly setAuthenticatedAdmin: (adminUser: AdminProfile) => void
  readonly setUnauthenticatedAdmin: () => void
  readonly setAdminLoading: (loading: boolean) => void
}

const getInitialAdminSession = (): {
  adminUser: AdminProfile | null
  status: AdminAuthStatus
  isAuthenticated: boolean
  authMode: 'development' | 'real'
} => {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as AdminProfile
        if (parsed?.id && parsed?.role === 'ADMIN') {
          return {
            adminUser: parsed,
            status: 'authenticated',
            isAuthenticated: true,
            authMode: isDevAuthEnabled() ? 'development' : 'real',
          }
        }
      }
    } catch {
      // Ignore corrupted or inaccessible storage
    }
  }

  // Check if active dev auth session is explicitly ADMIN
  if (isDevAuthEnabled() && typeof window !== 'undefined') {
    try {
      const rawDev = window.sessionStorage.getItem('fae_dev_auth_session')
      if (rawDev) {
        const parsed = JSON.parse(rawDev)
        if (parsed?.role === 'ADMIN') {
          const mappedAdmin: AdminProfile = {
            id: parsed.id || 'admin_dev_001',
            email: parsed.email || 'admin@sabi-africa.ng',
            fullName: parsed.fullName || 'System Administrator',
            role: 'ADMIN',
            department: 'Sabi Africa Platform Operations',
            isTwoFactorEnabled: true,
            createdAt: parsed.createdAt || '2026-01-01T00:00:00Z',
          }
          return {
            adminUser: mappedAdmin,
            status: 'authenticated',
            isAuthenticated: true,
            authMode: 'development',
          }
        }
      }
    } catch {
      // Ignore dev session parse failure
    }
  }

  return {
    adminUser: null,
    status: 'unauthenticated',
    isAuthenticated: false,
    authMode: isDevAuthEnabled() ? 'development' : 'real',
  }
}

const initialState = getInitialAdminSession()

export const useAdminAuthStore = create<AdminAuthStoreState>((set) => ({
  adminUser: initialState.adminUser,
  status: initialState.status,
  isAuthenticated: initialState.isAuthenticated,
  authMode: initialState.authMode,

  setAuthenticatedAdmin: (adminUser: AdminProfile) => {
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(adminUser))
      } catch {
        // Storage restricted
      }
    }
    set({
      adminUser,
      status: 'authenticated',
      isAuthenticated: true,
    })
  },

  setUnauthenticatedAdmin: () => {
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY)
      } catch {
        // Storage restricted
      }
    }
    set({
      adminUser: null,
      status: 'unauthenticated',
      isAuthenticated: false,
    })
  },

  setAdminLoading: (loading: boolean) =>
    set({ status: loading ? 'loading' : 'unauthenticated' }),
}))

