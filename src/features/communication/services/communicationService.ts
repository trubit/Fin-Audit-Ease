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

const CHAT_STORAGE_PREFIX = 'finauditease_chat_messages_'
const MEETINGS_STORAGE_KEY = 'finauditease_scheduled_meetings'

const memoryChatStore: Record<string, ChatMessage[]> = {}
let memoryMeetingsStore: AuditMeeting[] = []

export const communicationService = {
  /**
   * Fetch active conversations for the authenticated user / engagement from the canonical backend endpoint.
   * If backend is not yet provisioned (404/501), returns an honest empty list.
   */
  async getConversations(engagementId?: string): Promise<ApiResponse<Conversation[]>> {
    try {
      const res = await apiClient.get<Conversation[]>(API_ENDPOINTS.COMMUNICATION.CONVERSATIONS, {
        params: engagementId ? { engagementId } : undefined,
      })
      if (res && res.data) return res
      return { success: true, data: [] }
    } catch (err: unknown) {
      if (err instanceof AppApiError && (err.status === 404 || err.status === 501 || err.code === 'CONFIGURATION_ERROR')) {
        return {
          success: true,
          data: [],
          message: 'Communication conversations endpoint awaiting backend deployment.',
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
   * If backend is not yet provisioned, checks local session storage or returns an empty list.
   */
  async getMessages(conversationId: string): Promise<ApiResponse<ChatMessage[]>> {
    try {
      const res = await apiClient.get<ChatMessage[]>(
        API_ENDPOINTS.COMMUNICATION.MESSAGES(conversationId)
      )
      if (res && res.data) return res
      return { success: true, data: [] }
    } catch (err: unknown) {
      if (err instanceof AppApiError && (err.status === 404 || err.status === 501 || err.code === 'CONFIGURATION_ERROR')) {
        try {
          if (typeof window === 'undefined') {
            return { success: true, data: memoryChatStore[conversationId] || [] }
          }
          const raw = localStorage.getItem(CHAT_STORAGE_PREFIX + conversationId)
          if (raw) {
            const stored: ChatMessage[] = JSON.parse(raw)
            if (Array.isArray(stored)) {
              return { success: true, data: stored }
            }
          }
        } catch {
          // ignore storage error
        }
        return { success: true, data: [] }
      }
      throw err
    }
  },

  /**
   * Send a new message.
   */
  async sendMessage(
    conversationId: string,
    payload: SendMessagePayload,
    senderUser?: { id: string; fullName: string; role: string }
  ): Promise<ApiResponse<ChatMessage>> {
    const timestamp = new Date().toISOString()
    const localMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      conversationId,
      senderId: senderUser?.id || 'usr-current',
      senderName: senderUser?.fullName || 'User',
      senderRole: senderUser?.role || 'SYSTEM',
      content: payload.content,
      createdAt: timestamp,
      deliveryStatus: 'SENT',
      attachments: [],
    }

    try {
      const res = await apiClient.post<ChatMessage>(
        API_ENDPOINTS.COMMUNICATION.MESSAGES(conversationId),
        payload
      )
      if (res && res.data) {
        this.saveMessageLocally(conversationId, res.data)
        return res
      }
    } catch {
      // offline/dev fallback: persist to local session
    }

    this.saveMessageLocally(conversationId, localMsg)
    return { success: true, data: localMsg }
  },

  /**
   * Helper to persist messages locally.
   */
  saveMessageLocally(conversationId: string, msg: ChatMessage): void {
    try {
      if (typeof window === 'undefined') {
        const list = memoryChatStore[conversationId] || []
        memoryChatStore[conversationId] = [...list, msg]
        return
      }
      const raw = localStorage.getItem(CHAT_STORAGE_PREFIX + conversationId)
      const list: ChatMessage[] = raw ? JSON.parse(raw) : []
      const updated = [...list, msg]
      localStorage.setItem(CHAT_STORAGE_PREFIX + conversationId, JSON.stringify(updated))
    } catch {
      // Ignore storage errors
    }
  },

  /**
   * Fetch scheduled/historical audit meetings.
   */
  async getMeetings(engagementId?: string): Promise<ApiResponse<AuditMeeting[]>> {
    try {
      const res = await apiClient.get<AuditMeeting[]>(API_ENDPOINTS.COMMUNICATION.MEETINGS, {
        params: engagementId ? { engagementId } : undefined,
      })
      if (res && res.data) return res
      return { success: true, data: [] }
    } catch (err: unknown) {
      if (err instanceof AppApiError && (err.status === 404 || err.status === 501 || err.code === 'CONFIGURATION_ERROR')) {
        try {
          if (typeof window === 'undefined') {
            return { success: true, data: memoryMeetingsStore }
          }
          const raw = localStorage.getItem(MEETINGS_STORAGE_KEY)
          if (raw) {
            const stored: AuditMeeting[] = JSON.parse(raw)
            if (Array.isArray(stored)) {
              return { success: true, data: stored }
            }
          }
        } catch {
          // ignore storage error
        }
        return { success: true, data: [] }
      }
      throw err
    }
  },

  /**
   * Fetch single meeting details.
   */
  async getMeetingById(id: string): Promise<ApiResponse<AuditMeeting>> {
    return apiClient.get<AuditMeeting>(API_ENDPOINTS.COMMUNICATION.MEETING_DETAIL(id))
  },

  /**
   * Schedule a new audit meeting.
   */
  async scheduleMeeting(payload: ScheduleMeetingPayload): Promise<ApiResponse<AuditMeeting>> {
    const timestamp = new Date().toISOString()
    const newMeeting: AuditMeeting = {
      id: `meet-${Date.now()}`,
      engagementId: payload.engagementId,
      title: payload.title,
      agenda: payload.agenda || '',
      meetingType: payload.meetingType || 'WALKTHROUGH',
      status: 'SCHEDULED',
      scheduledDate: payload.scheduledDate,
      startTime: payload.startTime,
      durationMinutes: payload.durationMinutes || 45,
      timezone: payload.timezone || 'Africa/Lagos',
      recordingPolicy: payload.recordingPolicy || 'MANDATORY',
      joinUrl: `https://meet.finauditease.ng/room-${Date.now().toString(36)}`,
      meetingRoomId: `room-${Date.now().toString(36)}`,
      participants: (payload.participantUserIds || []).map((uid) => ({
        userId: uid,
        fullName: 'Team Member',
        email: `${uid}@finauditease.ng`,
        role: 'PARTICIPANT',
        consentStatus: 'PENDING',
      })),
      createdAt: timestamp,
    }

    try {
      const res = await apiClient.post<AuditMeeting>(API_ENDPOINTS.COMMUNICATION.MEETINGS, payload)
      if (res && res.data) {
        this.saveMeetingLocally(res.data)
        return res
      }
    } catch {
      // offline/dev fallback
    }

    this.saveMeetingLocally(newMeeting)
    return { success: true, data: newMeeting }
  },

  /**
   * Helper to persist meetings locally.
   */
  saveMeetingLocally(meeting: AuditMeeting): void {
    try {
      if (typeof window === 'undefined') {
        memoryMeetingsStore = [meeting, ...memoryMeetingsStore.filter((m) => m.id !== meeting.id)]
        return
      }
      const raw = localStorage.getItem(MEETINGS_STORAGE_KEY)
      const list: AuditMeeting[] = raw ? JSON.parse(raw) : []
      const updated = [meeting, ...list.filter((m) => m.id !== meeting.id)]
      localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // Ignore storage errors
    }
  },

  /**
   * Submit participant recording consent.
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
   * Fetch evidentiary recordings.
   */
  async getRecordings(params?: {
    engagementId?: string
    meetingId?: string
  }): Promise<ApiResponse<MeetingRecording[]>> {
    try {
      const res = await apiClient.get<MeetingRecording[]>(API_ENDPOINTS.COMMUNICATION.RECORDINGS, {
        params,
      })
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
   * Get single recording details.
   */
  async getRecordingById(id: string): Promise<ApiResponse<MeetingRecording>> {
    return apiClient.get<MeetingRecording>(API_ENDPOINTS.COMMUNICATION.RECORDING_DETAIL(id))
  },

  /**
   * Check video provider configuration and server status.
   */
  async getProviderStatus(): Promise<ApiResponse<MeetingProviderStatus>> {
    try {
      return await apiClient.get<MeetingProviderStatus>(API_ENDPOINTS.COMMUNICATION.PROVIDER_STATUS)
    } catch (err: unknown) {
      if (err instanceof AppApiError && (err.status === 404 || err.status === 501)) {
        return {
          success: true,
          data: {
            isConfigured: false,
            providerName: 'CUSTOM_WEBRTC',
            gatewayStatus: 'UNPROVISIONED',
            serverRecordingPipeline: false,
            consentLedgerIntegration: false,
            notes: 'Video meeting gateway awaiting backend deployment.',
          },
        }
      }
      throw err
    }
  },
}
