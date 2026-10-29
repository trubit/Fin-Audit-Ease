import { apiClient } from '@/services/api/apiClient'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import type { ApiResponse } from '@/types/api.types'
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
   */
  async getEngagements(params?: EngagementListParams): Promise<ApiResponse<Engagement[]>> {
    return apiClient.get<Engagement[]>(API_ENDPOINTS.ENGAGEMENTS.LIST, { params })
  },

  /**
   * Fetch single engagement by ID.
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
    return apiClient.get<EngagementMilestone[]>(API_ENDPOINTS.ENGAGEMENTS.MILESTONES(id))
  },

  /**
   * Fetch connected client accounting team members for an engagement.
   */
  async getEngagementMembers(id: string): Promise<ApiResponse<EngagementMember[]>> {
    return apiClient.get<EngagementMember[]>(API_ENDPOINTS.ENGAGEMENTS.MEMBERS(id))
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
}
