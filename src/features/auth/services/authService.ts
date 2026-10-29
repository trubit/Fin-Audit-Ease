import { apiClient } from '@/services/api/apiClient'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import type { ApiResponse, RequestOptions } from '@/types/api.types'
import type {
  LoginCredentials,
  LoginResponse,
  SignUpPayload,
  SignUpResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  PasswordResetPayload,
  PasswordResetResponse,
  TwoFactorVerificationPayload,
  TwoFactorVerificationResponse,
  TwoFactorResendResponse,
  AcceptInvitationPayload,
  AcceptInvitationResponse,
  InvitationDetails,
  UserProfile,
} from '../types'

/**
 * Authentication API Service.
 * Centralizes all HTTP communication with backend authentication endpoints.
 * Never logs credentials, tokens, or passwords.
 */
export const authService = {
  /**
   * Submit credentials for authentication.
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials)
  },

  /**
   * Register a new corporate / auditor organization account.
   */
  async signup(payload: SignUpPayload): Promise<ApiResponse<SignUpResponse>> {
    return apiClient.post<SignUpResponse>(API_ENDPOINTS.AUTH.REGISTER, payload)
  },

  /**
   * Terminate active server-side session.
   */
  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT)
  },

  /**
   * Dispatch password recovery request for the given email.
   */
  async forgotPassword(payload: ForgotPasswordPayload): Promise<ApiResponse<ForgotPasswordResponse>> {
    return apiClient.post<ForgotPasswordResponse>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, payload)
  },

  /**
   * Submit new password confirmed by cryptographic recovery token.
   */
  async resetPassword(payload: PasswordResetPayload): Promise<ApiResponse<PasswordResetResponse>> {
    return apiClient.post<PasswordResetResponse>(API_ENDPOINTS.AUTH.RESET_PASSWORD, payload)
  },

  /**
   * Verify two-factor authentication code for a pending login session.
   */
  async verify2FA(payload: TwoFactorVerificationPayload): Promise<ApiResponse<TwoFactorVerificationResponse>> {
    return apiClient.post<TwoFactorVerificationResponse>(API_ENDPOINTS.AUTH.TWO_FACTOR_VERIFY, payload)
  },

  /**
   * Request resend of 2FA verification code.
   */
  async resend2FA(temporaryToken: string): Promise<ApiResponse<TwoFactorResendResponse>> {
    return apiClient.post<TwoFactorResendResponse>(API_ENDPOINTS.AUTH.TWO_FACTOR_RESEND, { temporaryToken })
  },

  /**
   * Validate and accept engagement invitation token.
   */
  async acceptInvitation(payload: AcceptInvitationPayload): Promise<ApiResponse<AcceptInvitationResponse>> {
    return apiClient.post<AcceptInvitationResponse>(API_ENDPOINTS.AUTH.ACCEPT_INVITATION, payload)
  },

  /**
   * Fetch invitation details for display prior to acceptance.
   */
  async getInvitationDetails(token: string): Promise<ApiResponse<InvitationDetails>> {
    return apiClient.get<InvitationDetails>(API_ENDPOINTS.AUTH.INVITATION_DETAILS(token))
  },

  /**
   * Fetch profile of currently authenticated user session.
   * Supports passing abort signals and timeout limits.
   */
  async getCurrentUser(options?: RequestOptions): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<UserProfile>(API_ENDPOINTS.AUTH.ME, options)
  },
}
