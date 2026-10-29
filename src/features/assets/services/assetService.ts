import { apiClient } from '@/services/api/apiClient'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import type { ApiResponse } from '@/types/api.types'
import { AppApiError } from '@/services/api/apiErrors'
import type {
  AssetRecord,
  AssetFilterParams,
  CreateAssetPayload,
  VerifyAssetPayload,
  AssetAccessRequestPayload,
  AssetAccessRequestResponse,
} from '../types'

export const assetService = {
  /**
   * Fetch asset verification register records.
   * If the backend endpoint has not yet been provisioned, returns an empty list
   * so the interface can display a genuine empty state without fabricating fake records.
   */
  async getAssets(params?: AssetFilterParams): Promise<ApiResponse<AssetRecord[]>> {
    try {
      return await apiClient.get<AssetRecord[]>(API_ENDPOINTS.ASSETS.LIST, { params })
    } catch (err: unknown) {
      if (err instanceof AppApiError && (err.status === 404 || err.status === 501)) {
        return {
          success: true,
          data: [],
          message: 'Asset Verification Register endpoint awaiting backend deployment.',
        }
      }
      throw err
    }
  },

  /**
   * Fetch single asset by ID.
   */
  async getAssetById(id: string): Promise<ApiResponse<AssetRecord>> {
    return apiClient.get<AssetRecord>(API_ENDPOINTS.ASSETS.DETAIL(id))
  },

  /**
   * Create an asset in the register (Accounting Team only).
   */
  async createAsset(payload: CreateAssetPayload): Promise<ApiResponse<AssetRecord>> {
    return apiClient.post<AssetRecord>(API_ENDPOINTS.ASSETS.CREATE, payload)
  },

  /**
   * Record physical verification balances, status, comments, and attachments.
   */
  async verifyAsset(id: string, payload: VerifyAssetPayload): Promise<ApiResponse<AssetRecord>> {
    return apiClient.put<AssetRecord>(API_ENDPOINTS.ASSETS.VERIFY(id), payload)
  },

  /**
   * Request access to the asset register (Auditors only).
   * Does NOT auto-grant access.
   */
  async requestAccess(payload?: AssetAccessRequestPayload): Promise<ApiResponse<AssetAccessRequestResponse>> {
    return apiClient.post<AssetAccessRequestResponse>(API_ENDPOINTS.ASSETS.REQUEST_ACCESS, payload)
  },
}
