import { apiClient } from '@/services/api/apiClient'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import type { ApiResponse } from '@/types/api.types'
import { AppApiError } from '@/services/api/apiErrors'
import type {
  Checklist,
  ChecklistItem,
  ChecklistListParams,
  UpdateChecklistItemPayload,
  SignOffChecklistPayload,
} from '../types'

export const checklistService = {
  /**
   * Fetch the weekly checkpoints checklist for an organization/engagement.
   */
  async getWeeklyChecklist(params?: ChecklistListParams): Promise<ApiResponse<Checklist | null>> {
    try {
      return await apiClient.get<Checklist>(API_ENDPOINTS.CHECKLISTS.WEEKLY, { params })
    } catch (err: unknown) {
      if (err instanceof AppApiError && (err.status === 404 || err.status === 501)) {
        return {
          success: true,
          data: null,
          message: 'Weekly checklist endpoint awaiting backend deployment.',
        }
      }
      throw err
    }
  },

  /**
   * Fetch the month-end close checklist for an engagement.
   */
  async getMonthEndChecklist(params?: ChecklistListParams): Promise<ApiResponse<Checklist | null>> {
    try {
      return await apiClient.get<Checklist>(API_ENDPOINTS.CHECKLISTS.MONTH_END, { params })
    } catch (err: unknown) {
      if (err instanceof AppApiError && (err.status === 404 || err.status === 501)) {
        return {
          success: true,
          data: null,
          message: 'Month-end checklist endpoint awaiting backend deployment.',
        }
      }
      throw err
    }
  },

  /**
   * Fetch the pre-audit readiness checklist for an engagement.
   */
  async getPreAuditChecklist(params?: ChecklistListParams): Promise<ApiResponse<Checklist | null>> {
    try {
      return await apiClient.get<Checklist>(API_ENDPOINTS.CHECKLISTS.PRE_AUDIT, { params })
    } catch (err: unknown) {
      if (err instanceof AppApiError && (err.status === 404 || err.status === 501)) {
        return {
          success: true,
          data: null,
          message: 'Pre-audit checklist endpoint awaiting backend deployment.',
        }
      }
      throw err
    }
  },

  /**
   * Update the status, notes, difference explanation, target dates, or N/A reason of a checklist item.
   */
  async updateChecklistItem(
    checklistId: string,
    itemId: string,
    payload: UpdateChecklistItemPayload
  ): Promise<ApiResponse<ChecklistItem>> {
    return apiClient.put<ChecklistItem>(
      API_ENDPOINTS.CHECKLISTS.UPDATE_ITEM(checklistId, itemId),
      payload
    )
  },

  /**
   * Submit completed checklist period for supervisor/manager review.
   */
  async submitChecklistForReview(checklistId: string): Promise<ApiResponse<Checklist>> {
    return apiClient.post<Checklist>(
      API_ENDPOINTS.CHECKLISTS.SUBMIT_FOR_REVIEW(checklistId),
      {}
    )
  },

  /**
   * Reviewer/Manager records formal sign-off on the checklist.
   */
  async signOffChecklist(
    checklistId: string,
    payload?: SignOffChecklistPayload
  ): Promise<ApiResponse<Checklist>> {
    return apiClient.post<Checklist>(
      API_ENDPOINTS.CHECKLISTS.SIGN_OFF(checklistId),
      payload || {}
    )
  },

  /**
   * Lock the reporting period permanently against modifications.
   */
  async lockChecklist(checklistId: string): Promise<ApiResponse<Checklist>> {
    return apiClient.post<Checklist>(
      API_ENDPOINTS.CHECKLISTS.LOCK(checklistId),
      {}
    )
  },
}
