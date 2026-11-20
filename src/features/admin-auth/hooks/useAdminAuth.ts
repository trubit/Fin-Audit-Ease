import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuthStore } from '@/store/adminAuthStore'
import { adminAuthService } from '../services/adminAuthService'
import type { AdminLoginCredentials, AdminVerify2FAPayload } from '../types'

/**
 * Dedicated Admin Authentication Hook.
 *
 * Exclusively serves the FinAuditEase Administration Platform.
 * Isolated from the standard user authentication context.
 */
export const useAdminAuth = () => {
  const navigate = useNavigate()
  const adminUser = useAdminAuthStore((state) => state.adminUser)
  const status = useAdminAuthStore((state) => state.status)
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated)
  const authMode = useAdminAuthStore((state) => state.authMode)
  const setAuthenticatedAdmin = useAdminAuthStore((state) => state.setAuthenticatedAdmin)
  const setUnauthenticatedAdmin = useAdminAuthStore((state) => state.setUnauthenticatedAdmin)
  const setAdminLoading = useAdminAuthStore((state) => state.setAdminLoading)

  const login = useCallback(
    async (credentials: AdminLoginCredentials) => {
      setAdminLoading(true)
      try {
        const response = await adminAuthService.login(credentials)
        if (response.data.adminUser && !response.data.requires2FA) {
          setAuthenticatedAdmin(response.data.adminUser)
        }
        return response.data
      } finally {
        setAdminLoading(false)
      }
    },
    [setAdminLoading, setAuthenticatedAdmin]
  )

  const verify2FA = useCallback(
    async (payload: AdminVerify2FAPayload) => {
      setAdminLoading(true)
      try {
        const response = await adminAuthService.verify2FA(payload)
        if (response.data.adminUser) {
          setAuthenticatedAdmin(response.data.adminUser)
        }
        return response.data
      } finally {
        setAdminLoading(false)
      }
    },
    [setAdminLoading, setAuthenticatedAdmin]
  )

  const logout = useCallback(
    async (destination = '/admin/login') => {
      try {
        await adminAuthService.logout()
      } catch {
        // Graceful cleanup on network failure
      } finally {
        setUnauthenticatedAdmin()
        navigate(destination, { replace: true })
      }
    },
    [navigate, setUnauthenticatedAdmin]
  )

  return {
    adminUser,
    status,
    isAuthenticated,
    authMode,
    isLoading: status === 'loading',
    login,
    verify2FA,
    logout,
    setAuthenticatedAdmin,
    setUnauthenticatedAdmin,
  }
}

