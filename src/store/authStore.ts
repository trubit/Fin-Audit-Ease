import { create } from 'zustand'
import type { UserProfile, AuthState } from '@/features/auth/types'
import { setAppLanguage } from '@/i18n'
import { APP_CONFIG, type SupportedLocale } from '@/config/app.config'
import { isDevAuthEnabled } from '@/features/dev-auth/utils/isDevAuthEnabled'

export interface AuthStoreState extends AuthState {
  readonly setAuthenticatedUser: (user: UserProfile) => void
  readonly setDevAuthenticatedUser: (user: UserProfile) => void
  readonly setUnauthenticated: () => void
  readonly setLoading: (loading: boolean) => void
}

const DEV_SESSION_KEY = 'fae_dev_auth_session'

const applyUserPreferredLanguage = (preferredLanguage?: string) => {
  if (!preferredLanguage) return
  try {
    const saved = localStorage.getItem('finauditease_locale')
    if (!saved && (APP_CONFIG.supportedLocales as readonly string[]).includes(preferredLanguage)) {
      setAppLanguage(preferredLanguage as SupportedLocale)
    }
  } catch {
    // Ignore storage errors
  }
}

const getInitialDevSession = (): {
  user: UserProfile | null
  status: 'authenticated' | 'loading'
  isAuthenticated: boolean
  authMode: 'development' | 'real'
} => {
  if (isDevAuthEnabled() && typeof window !== 'undefined') {
    try {
      const raw = window.sessionStorage.getItem(DEV_SESSION_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as UserProfile
        if (parsed?.id && parsed?.role) {
          applyUserPreferredLanguage(parsed.preferredLanguage)
          return {
            user: parsed,
            status: 'authenticated',
            isAuthenticated: true,
            authMode: 'development',
          }
        }
      }
    } catch {
      // Ignore corrupted or inaccessible sessionStorage
    }
  }
  return {
    user: null,
    status: 'loading',
    isAuthenticated: false,
    authMode: 'real',
  }
}

const initialSession = getInitialDevSession()

/**
 * Shared Client Authentication Store.
 *
 * CRITICAL ARCHITECTURAL GUARANTEE:
 * - Default state is STRICTLY unauthenticated (or dev-session restored in DEV).
 * - Zero tokens, passwords, or secret credentials are stored here.
 * - Only confirmed backend profile data is held for client UI presentation.
 * - Development authentication is strictly isolated and runtime/compile-time guarded.
 */
export const useAuthStore = create<AuthStoreState>((set) => ({
  user: initialSession.user,
  status: initialSession.status,
  isAuthenticated: initialSession.isAuthenticated,
  authMode: initialSession.authMode,

  setAuthenticatedUser: (user: UserProfile) => {
    applyUserPreferredLanguage(user?.preferredLanguage)
    if (isDevAuthEnabled() && typeof window !== 'undefined') {
      try {
        window.sessionStorage.removeItem(DEV_SESSION_KEY)
      } catch {
        // Ignore storage errors
      }
    }
    set({
      user,
      status: 'authenticated',
      isAuthenticated: true,
      authMode: 'real',
    })
  },

  setDevAuthenticatedUser: (user: UserProfile) => {
    if (!isDevAuthEnabled()) {
      return
    }
    applyUserPreferredLanguage(user?.preferredLanguage)
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem(DEV_SESSION_KEY, JSON.stringify(user))
      } catch {
        // Ignore quota/private mode errors
      }
    }
    set({
      user,
      status: 'authenticated',
      isAuthenticated: true,
      authMode: 'development',
    })
  },

  setUnauthenticated: () => {
    if (isDevAuthEnabled() && typeof window !== 'undefined') {
      try {
        window.sessionStorage.removeItem(DEV_SESSION_KEY)
      } catch {
        // Ignore storage errors
      }
    }
    set({
      user: null,
      status: 'unauthenticated',
      isAuthenticated: false,
      authMode: 'real',
    })
  },

  setLoading: (loading: boolean) =>
    set({
      status: loading ? 'loading' : 'unauthenticated',
    }),
}))
