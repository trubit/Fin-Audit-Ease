import { describe, it, expect, vi, beforeEach } from 'vitest'
import { communicationService } from '../services/communicationService'
import { apiClient } from '@/services/api/apiClient'
import { AppApiError } from '@/services/api/apiErrors'
import type {
  Conversation,
  AuditMeeting,
  ScheduleMeetingPayload,
} from '../types'

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('Communication Service — Audit Communication and Meeting Centre', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches conversations from the confirmed backend endpoint', async () => {
    const mockConversations: Conversation[] = [
      {
        id: 'conv-001',
        type: 'GROUP',
        engagementId: 'eng-100',
        engagementTitle: 'FY2026 Statutory Audit',
        title: 'Engagement Group Channel',
        participants: [],
        createdAt: '2026-10-15T10:00:00Z',
        updatedAt: '2026-10-15T10:00:00Z',
        unreadCount: 0,
      },
    ]

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      success: true,
      data: mockConversations,
    })

    const result = await communicationService.getConversations('eng-100')
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/communication/conversations', {
      params: { engagementId: 'eng-100' },
    })
    expect(result.data).toHaveLength(1)
    expect(result.data?.[0].type).toBe('GROUP')
  })

  it('gracefully handles un-provisioned backend conversations endpoint returning genuine empty state without fabricating fake chats', async () => {
    const error404 = new AppApiError({
      code: 'NOT_FOUND',
      status: 404,
      userMessage: 'Endpoint not found',
    })
    vi.mocked(apiClient.get).mockRejectedValueOnce(error404)

    const result = await communicationService.getConversations('eng-100')
    expect(result.success).toBe(true)
    expect(result.data).toEqual([])
  })

  it('gracefully handles un-provisioned messages endpoint without inventing fake messages', async () => {
    const error501 = new AppApiError({
      code: 'SERVER_ERROR',
      status: 501,
      userMessage: 'Not implemented',
    })
    vi.mocked(apiClient.get).mockRejectedValueOnce(error501)

    const result = await communicationService.getMessages('conv-001')
    expect(result.success).toBe(true)
    expect(result.data).toEqual([])
  })

  it('dispatches meeting scheduling payload to the meeting endpoint', async () => {
    const payload: ScheduleMeetingPayload = {
      title: 'Controls Walkthrough Meeting',
      agenda: 'Walkthrough of cash controls and bank reconciliation procedures',
      meetingType: 'WALKTHROUGH',
      scheduledDate: '2026-10-25',
      startTime: '10:00',
      durationMinutes: 45,
      timezone: 'Africa/Lagos',
      engagementId: 'eng-100',
      participantUserIds: ['usr-1', 'usr-2'],
      recordingPolicy: 'MANDATORY',
    }

    const mockMeeting: AuditMeeting = {
      id: 'mtg-001',
      title: payload.title,
      agenda: payload.agenda,
      meetingType: payload.meetingType,
      status: 'SCHEDULED',
      scheduledDate: payload.scheduledDate,
      startTime: payload.startTime,
      durationMinutes: payload.durationMinutes,
      timezone: payload.timezone,
      engagementId: payload.engagementId,
      engagementTitle: 'FY2026 Audit',
      conversationId: 'conv-001',
      hostUserId: 'usr-1',
      hostName: 'Lead Auditor',
      recordingPolicy: 'MANDATORY',
      recordingConsentRequired: true,
      allConsentsGranted: false,
      participants: [
        {
          userId: 'usr-1',
          fullName: 'Lead Auditor',
          email: 'auditor@firm.ng',
          role: 'AUDITOR',
          consentStatus: 'GRANTED',
        },
        {
          userId: 'usr-2',
          fullName: 'Client Accountant',
          email: 'accountant@client.ng',
          role: 'FINANCE_USER',
          consentStatus: 'PENDING',
        },
      ],
      createdAt: '2026-10-21T10:00:00Z',
      updatedAt: '2026-10-21T10:00:00Z',
    }

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: mockMeeting,
    })

    const result = await communicationService.scheduleMeeting(payload)
    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/communication/meetings', payload)
    expect(result.data?.recordingPolicy).toBe('MANDATORY')
    expect(result.data?.recordingConsentRequired).toBe(true)
  })

  it('submits participant recording consent or declination', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: { id: 'mtg-001' } as unknown as AuditMeeting,
    })

    const result = await communicationService.submitMeetingConsent('mtg-001', {
      consent: 'GRANT',
    })
    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/communication/meetings/mtg-001/consent', {
      consent: 'GRANT',
    })
    expect(result.success).toBe(true)
  })

  it('inspects meeting provider readiness returning un-provisioned status when backend gateway is not deployed', async () => {
    const error404 = new AppApiError({
      code: 'NOT_FOUND',
      status: 404,
      userMessage: 'Endpoint not deployed',
    })
    vi.mocked(apiClient.get).mockRejectedValueOnce(error404)

    const result = await communicationService.getProviderStatus()
    expect(result.success).toBe(true)
    expect(result.data?.isConfigured).toBe(false)
    expect(result.data?.gatewayStatus).toBe('UNPROVISIONED')
    expect(result.data?.serverRecordingPipeline).toBe(false)
  })

  it('fetches recordings returning honest empty list when backend pipeline has delivered none', async () => {
    const error404 = new AppApiError({
      code: 'NOT_FOUND',
      status: 404,
      userMessage: 'Endpoint not deployed',
    })
    vi.mocked(apiClient.get).mockRejectedValueOnce(error404)

    const result = await communicationService.getRecordings({ engagementId: 'eng-100' })
    expect(result.success).toBe(true)
    expect(result.data).toEqual([])
  })
})
