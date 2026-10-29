import { apiClient } from '@/services/api/apiClient'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import type { ApiResponse } from '@/types/api.types'
import type {
  AuditRequest,
  CreateAuditRequestPayload,
  UpdateAuditRequestStatusPayload,
  AuditRequestComment,
} from '../types'

export interface AuditRequestListParams {
  readonly engagementId?: string
  readonly status?: string
  readonly priority?: string
  readonly page?: number
  readonly limit?: number
  readonly search?: string
}

export const auditRequestService = {
  /**
   * Fetch paginated/filtered list of audit requests.
   */
  async getAuditRequests(params?: AuditRequestListParams): Promise<ApiResponse<AuditRequest[]>> {
    return apiClient.get<AuditRequest[]>(API_ENDPOINTS.AUDIT_REQUESTS.LIST, { params })
  },

  /**
   * Fetch single audit request by ID.
   */
  async getAuditRequestById(id: string): Promise<ApiResponse<AuditRequest>> {
    return apiClient.get<AuditRequest>(API_ENDPOINTS.AUDIT_REQUESTS.DETAIL(id))
  },

  /**
   * Create a new auditor Provided by Client request.
   */
  async createAuditRequest(payload: CreateAuditRequestPayload): Promise<ApiResponse<AuditRequest>> {
    return apiClient.post<AuditRequest>(API_ENDPOINTS.AUDIT_REQUESTS.CREATE, payload)
  },

  /**
   * Update the status of an audit request (e.g. SUBMITTED, IN_REVIEW, ACCEPTED, REJECTED).
   */
  async updateAuditRequestStatus(
    id: string,
    payload: UpdateAuditRequestStatusPayload
  ): Promise<ApiResponse<AuditRequest>> {
    return apiClient.patch<AuditRequest>(API_ENDPOINTS.AUDIT_REQUESTS.UPDATE_STATUS(id), payload)
  },

  /**
   * Add a comment to an audit request.
   */
  async addComment(id: string, content: string): Promise<ApiResponse<AuditRequestComment>> {
    return apiClient.post<AuditRequestComment>(API_ENDPOINTS.AUDIT_REQUESTS.COMMENTS(id), { content })
  },
}
