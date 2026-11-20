import { apiClient } from '@/services/api/apiClient'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import type { ApiResponse } from '@/types/api.types'
import { isDevAuthEnabled } from '@/features/dev-auth/utils/isDevAuthEnabled'
import type {
  AdminProfile,
  AdminLoginCredentials,
  AdminLoginResponse,
  AdminVerify2FAPayload,
} from '../types'

export const ADMIN_SESSION_STORAGE_KEY = 'fae_admin_session'

export const adminAuthService = {
  /**
   * Submit credentials for Administrator authentication.
   * Dedicated endpoint: POST /api/v1/admin/auth/login
   */
  async login(credentials: AdminLoginCredentials): Promise<ApiResponse<AdminLoginResponse>> {
    try {
      return await apiClient.post<AdminLoginResponse>(
        API_ENDPOINTS.ADMIN.AUTH.LOGIN,
        credentials
      )
    } catch (err: unknown) {
      // In development preview mode, allow simulated admin login if dev auth is enabled
      if (isDevAuthEnabled()) {
        const trimmedEmail = credentials.email.trim().toLowerCase()
        // Strictly require admin email format in dev preview
        if (trimmedEmail.includes('admin') || trimmedEmail.endsWith('@sabi-africa.ng')) {
          const devAdminProfile: AdminProfile = {
            id: 'admin_dev_001',
            email: credentials.email.trim(),
            fullName: 'Platform Operations Administrator',
            role: 'ADMIN',
            department: 'Sabi Africa Platform Operations',
            isTwoFactorEnabled: true,
            createdAt: '2026-01-01T00:00:00Z',
            lastLoginAt: new Date().toISOString(),
          }

          // If 2FA code is not provided, simulate 2FA requirement
          if (!credentials.twoFactorCode) {
            return {
              success: true,
              data: {
                requires2FA: true,
                temporaryToken: 'tmp_admin_2fa_token_' + Date.now(),
                channel: 'authenticator',
                tokenExpiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
              },
            }
          }

          // If 2FA code provided, return authenticated admin
          return {
            success: true,
            data: {
              adminUser: devAdminProfile,
              requires2FA: false,
            },
          }
        }
      }
      throw err
    }
  },

  /**
   * Verify Administrator Two-Factor Authentication TOTP code.
   * Dedicated endpoint: POST /api/v1/admin/auth/2fa/verify
   */
  async verify2FA(payload: AdminVerify2FAPayload): Promise<ApiResponse<AdminLoginResponse>> {
    try {
      return await apiClient.post<AdminLoginResponse>(
        API_ENDPOINTS.ADMIN.AUTH.VERIFY_2FA,
        payload
      )
    } catch (err: unknown) {
      if (isDevAuthEnabled() && payload.temporaryToken.startsWith('tmp_admin_2fa_')) {
        // Require 6-digit code
        if (payload.code.trim().length === 6) {
          const devAdminProfile: AdminProfile = {
            id: 'admin_dev_001',
            email: 'admin@sabi-africa.ng',
            fullName: 'Platform Operations Administrator',
            role: 'ADMIN',
            department: 'Sabi Africa Platform Operations',
            isTwoFactorEnabled: true,
            createdAt: '2026-01-01T00:00:00Z',
            lastLoginAt: new Date().toISOString(),
          }
          return {
            success: true,
            data: {
              adminUser: devAdminProfile,
              requires2FA: false,
            },
          }
        }
      }
      throw err
    }
  },

  /**
   * Terminate Administrator Session.
   * Dedicated endpoint: POST /api/v1/admin/auth/logout
   */
  async logout(): Promise<ApiResponse<void>> {
    try {
      return await apiClient.post<void>(API_ENDPOINTS.ADMIN.AUTH.LOGOUT)
    } catch (err) {
      // In dev preview, logout gracefully
      if (isDevAuthEnabled()) {
        return { success: true, data: undefined as void }
      }
      throw err
    }
  },

  /**
   * Query authenticated Administrator Profile.
   * Dedicated endpoint: GET /api/v1/admin/auth/me
   */
  async getProfile(): Promise<ApiResponse<AdminProfile>> {
    return apiClient.get<AdminProfile>(API_ENDPOINTS.ADMIN.AUTH.ME)
  },
}

