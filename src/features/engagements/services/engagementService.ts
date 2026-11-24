import { apiClient } from '@/services/api/apiClient'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import type { ApiResponse } from '@/types/api.types'
import { AppApiError } from '@/services/api/apiErrors'
import type {
  Engagement,
  EngagementMilestone,
  CreateEngagementPayload,
  EngagementMember,
  InviteEngagementMemberPayload,
  InviteMemberResponse,
} from '../types'

export interface EngagementListParams {
  readonly status?: string
  readonly page?: number
  readonly limit?: number
  readonly search?: string
}

export const engagementService = {
  /**
   * Fetch paginated/filtered list of audit engagements for the authenticated user/organization.
   * If backend is not yet provisioned (404/501), returns an honest empty list.
   */
  async getEngagements(params?: EngagementListParams): Promise<ApiResponse<Engagement[]>> {
    try {
      const response = await apiClient.get<Engagement[]>(API_ENDPOINTS.ENGAGEMENTS.LIST, { params })
      if (response && response.data) return response
      return { success: true, data: [] }
    } catch (err: unknown) {
      if (err instanceof AppApiError && (err.status === 404 || err.status === 501)) {
        return {
          success: true,
          data: [],
          message: 'Engagements endpoint awaiting backend deployment.',
        }
      }
      throw err
    }
  },

  /**
   * Fetch single engagement by ID from the canonical backend endpoint.
   */
  async getEngagementById(id: string): Promise<ApiResponse<Engagement>> {
    return apiClient.get<Engagement>(API_ENDPOINTS.ENGAGEMENTS.DETAIL(id))
  },

  /**
   * Create a new client audit engagement workspace.
   */
  async createEngagement(payload: CreateEngagementPayload): Promise<ApiResponse<Engagement>> {
    return apiClient.post<Engagement>(API_ENDPOINTS.ENGAGEMENTS.CREATE, payload)
  },

  /**
   * Fetch milestone schedules for an engagement.
   */
  async getEngagementMilestones(id: string): Promise<ApiResponse<EngagementMilestone[]>> {
    try {
      return await apiClient.get<EngagementMilestone[]>(API_ENDPOINTS.ENGAGEMENTS.MILESTONES(id))
    } catch (err: unknown) {
      if (err instanceof AppApiError && (err.status === 404 || err.status === 501)) {
        return { success: true, data: [] }
      }
      throw err
    }
  },

  /**
   * Fetch connected client accounting team members for an engagement.
   */
  async getEngagementMembers(id: string): Promise<ApiResponse<EngagementMember[]>> {
    try {
      const res = await apiClient.get<EngagementMember[]>(API_ENDPOINTS.ENGAGEMENTS.MEMBERS(id))
      if (res && res.data) return res
      return { success: true, data: [] }
    } catch (err: unknown) {
      if (err instanceof AppApiError && (err.status === 404 || err.status === 501)) {
        return { success: true, data: [] }
      }
      throw err
    }
  },

  /**
   * Dispatch an engagement invitation to a client accounting team personnel.
   */
  async inviteMember(
    id: string,
    payload: InviteEngagementMemberPayload
  ): Promise<ApiResponse<InviteMemberResponse>> {
    return apiClient.post<InviteMemberResponse>(API_ENDPOINTS.ENGAGEMENTS.INVITATIONS(id), payload)
  },

  /**
   * Update engagement properties (status, target completion date, or title).
   */
  async updateEngagement(
    id: string,
    payload: Partial<CreateEngagementPayload> & {
      readonly status?: string
      readonly leadAuditorId?: string
      readonly leadAuditorName?: string
    }
  ): Promise<ApiResponse<Engagement>> {
    return apiClient.patch<Engagement>(API_ENDPOINTS.ENGAGEMENTS.UPDATE(id), payload)
  },

  /**
   * Assign or reassign a lead auditor to an engagement (Audit Engagement Manager action).
   */
  async assignAuditor(
    id: string,
    payload: { readonly auditorId: string; readonly auditorName: string }
  ): Promise<ApiResponse<Engagement>> {
    return apiClient.patch<Engagement>(API_ENDPOINTS.ENGAGEMENTS.UPDATE(id), {
      leadAuditorId: payload.auditorId,
      leadAuditorName: payload.auditorName,
    })
  },
}
