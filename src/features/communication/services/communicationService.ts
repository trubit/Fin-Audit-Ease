import { apiClient } from '@/services/api/apiClient'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import type { ApiResponse } from '@/types/api.types'
import { AppApiError } from '@/services/api/apiErrors'
import type {
  Conversation,
  ChatMessage,
  SendMessagePayload,
  AuditMeeting,
  ScheduleMeetingPayload,
  SubmitConsentPayload,
  MeetingRecording,
  MeetingProviderStatus,
} from '../types'

export const communicationService = {
  /**
   * Fetch active conversations for the authenticated user / engagement.
   * If backend communication service has not yet been provisioned (404/501),
   * returns an empty list so the UI displays an honest awaiting-backend state
   * without fabricating fake mock conversations.
   */
  async getConversations(engagementId?: string): Promise<ApiResponse<Conversation[]>> {
    try {
      return await apiClient.get<Conversation[]>(API_ENDPOINTS.COMMUNICATION.CONVERSATIONS, {
        params: engagementId ? { engagementId } : undefined,
      })
    } catch (err: unknown) {
      if (err instanceof AppApiError && (err.status === 404 || err.status === 501)) {
        return {
          success: true,
          data: [],
          message: 'Backend Communication API is awaiting backend deployment.',
        }
      }
      throw err
    }
  },

  /**
   * Fetch single conversation details.
   */
  async getConversationById(id: string): Promise<ApiResponse<Conversation>> {
    return apiClient.get<Conversation>(API_ENDPOINTS.COMMUNICATION.CONVERSATION_DETAIL(id))
  },

  /**
   * Fetch historical messages for an authorized conversation.
   */
  async getMessages(conversationId: string): Promise<ApiResponse<ChatMessage[]>> {
    try {
      return await apiClient.get<ChatMessage[]>(
        API_ENDPOINTS.COMMUNICATION.MESSAGES(conversationId)
      )
    } catch (err: unknown) {
      if (err instanceof AppApiError && (err.status === 404 || err.status === 501)) {
        return {
          success: true,
          data: [],
          message: 'Backend Message Service endpoint is awaiting backend deployment.',
        }
      }
      throw err
    }
  },

  /**
   * Send a new message to an authorized conversation.
   * Enforces backend server persistence; ordinary clients cannot override immutability.
   */
  async sendMessage(
    conversationId: string,
    payload: SendMessagePayload
  ): Promise<ApiResponse<ChatMessage>> {
    return apiClient.post<ChatMessage>(
      API_ENDPOINTS.COMMUNICATION.MESSAGES(conversationId),
      payload
    )
  },

  /**
   * Fetch scheduled/historical audit meetings.
   */
  async getMeetings(engagementId?: string): Promise<ApiResponse<AuditMeeting[]>> {
    try {
      return await apiClient.get<AuditMeeting[]>(API_ENDPOINTS.COMMUNICATION.MEETINGS, {
        params: engagementId ? { engagementId } : undefined,
      })
    } catch (err: unknown) {
      if (err instanceof AppApiError && (err.status === 404 || err.status === 501)) {
        return {
          success: true,
          data: [],
          message: 'Backend Meeting Scheduling API is awaiting backend deployment.',
        }
      }
      throw err
    }
  },

  /**
   * Fetch single meeting details with participant consent records.
   */
  async getMeetingById(id: string): Promise<ApiResponse<AuditMeeting>> {
    return apiClient.get<AuditMeeting>(API_ENDPOINTS.COMMUNICATION.MEETING_DETAIL(id))
  },

  /**
   * Schedule a new audit meeting.
   */
  async scheduleMeeting(payload: ScheduleMeetingPayload): Promise<ApiResponse<AuditMeeting>> {
    return apiClient.post<AuditMeeting>(API_ENDPOINTS.COMMUNICATION.MEETINGS, payload)
  },

  /**
   * Submit participant recording consent or declination for a mandatory recorded session.
   */
  async submitMeetingConsent(
    meetingId: string,
    payload: SubmitConsentPayload
  ): Promise<ApiResponse<AuditMeeting>> {
    return apiClient.post<AuditMeeting>(
      API_ENDPOINTS.COMMUNICATION.MEETING_CONSENT(meetingId),
      payload
    )
  },

  /**
   * Fetch evidentiary recordings for an engagement or conversation.
   */
  async getRecordings(params?: {
    engagementId?: string
    conversationId?: string
  }): Promise<ApiResponse<MeetingRecording[]>> {
    try {
      return await apiClient.get<MeetingRecording[]>(API_ENDPOINTS.COMMUNICATION.RECORDINGS, {
        params,
      })
    } catch (err: unknown) {
      if (err instanceof AppApiError && (err.status === 404 || err.status === 501)) {
        return {
          success: true,
          data: [],
          message: 'Backend Evidentiary Recording API is awaiting backend deployment.',
        }
      }
      throw err
    }
  },

  /**
   * Fetch single recording metadata and retention details.
   */
  async getRecordingById(id: string): Promise<ApiResponse<MeetingRecording>> {
    return apiClient.get<MeetingRecording>(API_ENDPOINTS.COMMUNICATION.RECORDING_DETAIL(id))
  },

  /**
   * Check meeting provider integration capability & readiness status.
   */
  async getProviderStatus(): Promise<ApiResponse<MeetingProviderStatus>> {
    try {
      return await apiClient.get<MeetingProviderStatus>(
        API_ENDPOINTS.COMMUNICATION.PROVIDER_STATUS
      )
    } catch (err: unknown) {
      if (err instanceof AppApiError && (err.status === 404 || err.status === 501)) {
        return {
          success: true,
          data: {
            isConfigured: false,
            providerName: undefined,
            gatewayStatus: 'UNPROVISIONED',
            serverRecordingPipeline: false,
            consentLedgerIntegration: false,
            notes:
              'Meeting provider infrastructure (Zoom / Google Meet / WebRTC SFU) is awaiting server-side deployment and credentials provisioning.',
          },
        }
      }
      throw err
    }
  },
}
