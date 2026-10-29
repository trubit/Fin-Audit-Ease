import { apiClient } from '@/services/api/apiClient'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import type { ApiResponse } from '@/types/api.types'
import type { AppNotification, NotificationListParams } from '../types'

export const notificationService = {
  /**
   * Fetch user notifications list.
   */
  async getNotifications(params?: NotificationListParams): Promise<ApiResponse<AppNotification[]>> {
    return apiClient.get<AppNotification[]>(API_ENDPOINTS.NOTIFICATIONS.LIST, { params })
  },

  /**
   * Mark a single notification as read.
   */
  async markAsRead(id: string): Promise<ApiResponse<AppNotification>> {
    return apiClient.put<AppNotification>(API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(id))
  },

  /**
   * Mark all user notifications as read.
   */
  async markAllRead(): Promise<ApiResponse<void>> {
    return apiClient.put<void>(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ)
  },
}
