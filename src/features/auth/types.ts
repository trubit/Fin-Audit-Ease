/**
 * Authentication & Authorization Types.
 * Defines the contract consumed by frontend routing guards, session handlers, and API services.
 */

export type UserRole = 'AUDITOR' | 'FINANCE_USER' | 'ADMIN' | 'AUDIT_MANAGER'

export interface UserProfile {
  readonly id: string
  readonly email: string
  readonly fullName: string
  readonly role: UserRole
  readonly organizationId: string
  readonly organizationName: string
  readonly isTwoFactorEnabled: boolean
  readonly membershipNumber?: string
  readonly jobTitle?: string
  readonly accountingYearEndDate?: string
  readonly commencementDate?: string
  readonly preferredLanguage?: string
  readonly createdAt: string
}

export interface AuthState {
  readonly user: UserProfile | null
  readonly status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated'
  readonly isAuthenticated: boolean
  readonly authMode?: 'real' | 'development'
}

export interface LoginCredentials {
  readonly email: string
  readonly password: string
  readonly rememberMe?: boolean
}

export interface LoginResponse {
  readonly user?: UserProfile
  readonly id?: string
  readonly email?: string
  readonly role?: UserRole
  readonly fullName?: string
  readonly organizationId?: string
  readonly organizationName?: string
  readonly isTwoFactorEnabled?: boolean
  readonly requires2FA?: boolean
  readonly temporaryToken?: string
  readonly channel?: 'email' | 'authenticator' | 'sms'
  readonly maskedDestination?: string
  readonly tokenExpiresAt?: string
}

export type ProfessionalAccountingBody = 'ICAN' | 'ACCA' | 'ICAEW'

export interface AuditorSignUpPayload {
  readonly fullName: string
  readonly email: string
  readonly password: string
  readonly confirmPassword?: string
  readonly role?: 'AUDITOR'
  readonly firmName: string
  readonly professionalBody: ProfessionalAccountingBody
  readonly membershipNumber: string
  readonly preferredLanguage: string
  readonly termsAccepted: boolean
}

export interface AccountingTeamSignUpPayload {
  readonly fullName: string
  readonly email: string
  readonly password: string
  readonly confirmPassword?: string
  readonly role?: 'FINANCE_USER'
  readonly companyName: string
  readonly jobTitle: string
  readonly accountingYearEndDate: string
  readonly commencementDate?: string
  readonly preferredLanguage: string
  readonly termsAccepted: boolean
}

export type SignUpPayload = AuditorSignUpPayload | AccountingTeamSignUpPayload

export interface SignUpResponse {
  readonly user?: UserProfile
  readonly requiresVerification?: boolean
  readonly message?: string
}

export interface ForgotPasswordPayload {
  readonly email: string
}

export interface ForgotPasswordResponse {
  readonly message?: string
  readonly deliveryConfirmed?: boolean
}

export interface PasswordResetPayload {
  readonly token: string
  readonly newPassword: string
  readonly confirmPassword?: string
}

export interface PasswordResetResponse {
  readonly message?: string
}

export interface TwoFactorVerificationPayload {
  readonly code: string
  readonly temporaryToken: string
}

export interface TwoFactorVerificationResponse {
  readonly user?: UserProfile
  readonly id?: string
  readonly email?: string
  readonly role?: UserRole
  readonly fullName?: string
  readonly organizationId?: string
  readonly organizationName?: string
  readonly isTwoFactorEnabled?: boolean
  readonly createdAt?: string
}

export interface TwoFactorResendResponse {
  readonly message?: string
  readonly channel?: string
  readonly maskedDestination?: string
}

export interface AcceptInvitationPayload {
  readonly invitationToken: string
  readonly fullName: string
  readonly email?: string
  readonly password: string
  readonly confirmPassword?: string
  readonly preferredLanguage?: string
  readonly termsAccepted?: boolean
}

export interface AcceptInvitationResponse {
  readonly user?: UserProfile
  readonly message?: string
}

export interface InvitationDetails {
  readonly organizationName: string
  readonly invitedEmail: string
  readonly role: UserRole
  readonly expiresAt?: string
  readonly inviterName?: string
  readonly engagementTitle?: string
  readonly status?: string
}
