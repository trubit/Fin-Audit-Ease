/**
 * Admin Authentication & Authorization Types.
 * Defines the contract consumed exclusively by the FinAuditEase Administration Platform.
 *
 * CRITICAL ARCHITECTURAL GUARANTEE:
 * - Completely isolated from normal user authentication.
 * - Only administrators ('ADMIN' role) may possess an AdminProfile.
 * - Public self-registration is strictly unsupported.
 */

export interface AdminProfile {
  readonly id: string
  readonly email: string
  readonly fullName: string
  readonly role: 'ADMIN'
  readonly department: string
  readonly isTwoFactorEnabled: boolean
  readonly lastLoginAt?: string
  readonly createdAt: string
}

export type AdminAuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

export interface AdminAuthState {
  readonly adminUser: AdminProfile | null
  readonly status: AdminAuthStatus
  readonly isAuthenticated: boolean
  readonly authMode?: 'real' | 'development'
}

export interface AdminLoginCredentials {
  readonly email: string
  readonly password: string
  readonly twoFactorCode?: string
}

export interface AdminLoginResponse {
  readonly adminUser?: AdminProfile
  readonly requires2FA?: boolean
  readonly temporaryToken?: string
  readonly channel?: 'authenticator' | 'email'
  readonly tokenExpiresAt?: string
}

export interface AdminVerify2FAPayload {
  readonly temporaryToken: string
  readonly code: string
}

