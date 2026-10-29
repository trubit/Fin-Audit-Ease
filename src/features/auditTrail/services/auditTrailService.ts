import { apiClient } from '@/services/api/apiClient'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import type { ApiResponse } from '@/types/api.types'
import type {
  AuditTrailRecord,
  AuditTrailFilterParams,
  AuditTrailExportParams,
} from '../types'

export const auditTrailService = {
  /**
   * Fetch immutable audit trail records for an engagement with optional filters.
   */
  async getAuditTrail(
    params?: AuditTrailFilterParams
  ): Promise<ApiResponse<AuditTrailRecord[]>> {
    return apiClient.get<AuditTrailRecord[]>(API_ENDPOINTS.AUDIT_TRAIL.LIST, {
      params,
    })
  },

  /**
   * Request authoritative audit trail PDF export from the backend.
   * Returns binary Blob for browser-safe download.
   */
  async exportAuditTrail(
    params: AuditTrailExportParams
  ): Promise<Blob> {
    return apiClient.getBlob(API_ENDPOINTS.AUDIT_TRAIL.EXPORT, {
      params: {
        engagementId: params.engagementId,
        startDate: params.startDate,
        endDate: params.endDate,
        format: params.format || 'pdf',
      },
    })
  },
}
