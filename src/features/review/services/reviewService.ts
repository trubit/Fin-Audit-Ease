import { apiClient } from '@/services/api/apiClient'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import type { ApiResponse } from '@/types/api.types'
import type {
  ReviewItem,
  ReviewFeedback,
  ReviewListParams,
  SubmitFeedbackPayload,
  ReviewActionPayload,
} from '../types'

export const reviewService = {
  /**
   * Fetch paginated/filtered list of review items.
   */
  async getReviews(params?: ReviewListParams): Promise<ApiResponse<ReviewItem[]>> {
    return apiClient.get<ReviewItem[]>(API_ENDPOINTS.REVIEWS.LIST, { params })
  },

  /**
   * Fetch single review item by ID.
   */
  async getReviewById(id: string): Promise<ApiResponse<ReviewItem>> {
    return apiClient.get<ReviewItem>(API_ENDPOINTS.REVIEWS.DETAIL(id))
  },

  /**
   * Submit reviewer feedback note on a document, request, or checklist item.
   */
  async submitFeedback(
    id: string,
    payload: SubmitFeedbackPayload
  ): Promise<ApiResponse<ReviewFeedback>> {
    return apiClient.post<ReviewFeedback>(API_ENDPOINTS.REVIEWS.SUBMIT_FEEDBACK(id), payload)
  },

  /**
   * Approve review submission.
   */
  async approveReview(
    id: string,
    payload?: ReviewActionPayload
  ): Promise<ApiResponse<ReviewItem>> {
    return apiClient.post<ReviewItem>(API_ENDPOINTS.REVIEWS.APPROVE(id), payload)
  },

  /**
   * Reject review submission.
   */
  async rejectReview(
    id: string,
    payload?: ReviewActionPayload
  ): Promise<ApiResponse<ReviewItem>> {
    return apiClient.post<ReviewItem>(API_ENDPOINTS.REVIEWS.REJECT(id), payload)
  },
}
