/**
 * Secure Audit Communication and Meeting Centre Domain Types.
 *
 * ARCHITECTURAL CONTRACT:
 * Strictly aligns with the FinAuditEase regulatory assurance architecture:
 * - Engagement-isolated group channels and authorized one-to-one channels.
 * - Non-overridable server-side message and evidence retention.
 * - Mandatory meeting recording governance with participant consent enforcement.
 * - No client-side mock data fabrication.
 */

export type ConversationType = 'GROUP' | 'PRIVATE'

export interface Participant {
  readonly id: string
  readonly userId: string
  readonly fullName: string
  readonly email: string
  readonly role: string
  readonly organizationId: string
  readonly organizationName?: string
}

export interface ChatAttachment {
  readonly id: string
  readonly fileName: string
  readonly fileSizeBytes: number
  readonly mimeType: string
  readonly documentId?: string
  readonly downloadUrl?: string
}

export type MessageDeliveryStatus = 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'

export interface ChatMessage {
  readonly id: string
  readonly conversationId: string
  readonly senderId: string
  readonly senderName: string
  readonly senderRole: string
  readonly content: string
  readonly createdAt: string
  readonly updatedAt?: string
  readonly isEdited?: boolean
  readonly deliveryStatus: MessageDeliveryStatus
  readonly attachments?: readonly ChatAttachment[]
}

export interface Conversation {
  readonly id: string
  readonly type: ConversationType
  readonly engagementId?: string
  readonly engagementTitle?: string
  readonly title: string
  readonly participants: readonly Participant[]
  readonly createdAt: string
  readonly updatedAt: string
  readonly lastMessage?: ChatMessage
  readonly unreadCount: number
}

export type MeetingType =
  | 'PLANNING'
  | 'WALKTHROUGH'
  | 'INTERIM_REVIEW'
  | 'EVIDENCE_INSPECTION'
  | 'CLOSING_MEETING'
  | 'STATUS_UPDATE'

export type MeetingStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export type RecordingPolicy = 'MANDATORY' | 'OPTIONAL' | 'NONE'

export type RecordingConsentStatus = 'PENDING' | 'GRANTED' | 'DECLINED'

export interface ParticipantConsentRecord {
  readonly userId: string
  readonly fullName: string
  readonly email: string
  readonly role: string
  readonly consentStatus: RecordingConsentStatus
  readonly consentTimestamp?: string
  readonly declinationReason?: string
}

export interface AuditMeeting {
  readonly id: string
  readonly title: string
  readonly agenda: string
  readonly meetingType: MeetingType
  readonly status: MeetingStatus
  readonly scheduledDate: string
  readonly startTime: string
  readonly durationMinutes: number
  readonly timezone: string
  readonly engagementId: string
  readonly engagementTitle: string
  readonly conversationId: string
  readonly hostUserId: string
  readonly hostName: string
  readonly recordingPolicy: RecordingPolicy
  readonly recordingConsentRequired: boolean
  readonly allConsentsGranted: boolean
  readonly participants: readonly ParticipantConsentRecord[]
  readonly recordingId?: string
  readonly joinUrl?: string
  readonly createdAt: string
  readonly updatedAt: string
}

export interface ScheduleMeetingPayload {
  readonly title: string
  readonly agenda: string
  readonly meetingType: MeetingType
  readonly scheduledDate: string
  readonly startTime: string
  readonly durationMinutes: number
  readonly timezone: string
  readonly engagementId: string
  readonly conversationId?: string
  readonly participantUserIds: readonly string[]
  readonly recordingPolicy: RecordingPolicy
}

export type RecordingProcessingStatus = 'PROCESSING' | 'PROCESSED' | 'FAILED'

export interface AccessHistoryEntry {
  readonly userId: string
  readonly userName: string
  readonly accessedAt: string
  readonly action: string
}

export interface MeetingRecording {
  readonly id: string
  readonly meetingId: string
  readonly meetingTitle: string
  readonly engagementId: string
  readonly engagementTitle: string
  readonly conversationId: string
  readonly conversationType: ConversationType
  readonly recordedAt: string
  readonly durationSeconds: number
  readonly processingStatus: RecordingProcessingStatus
  readonly sha256Checksum?: string
  readonly fileSizeBytes?: number
  readonly authorizedParticipantUserIds: readonly string[]
  readonly streamUrl?: string
  readonly downloadUrl?: string
  readonly transcriptAvailable: boolean
  readonly transcriptText?: string
  readonly retentionPolicy: string
  readonly retentionExpiresAt: string
  readonly accessHistory?: readonly AccessHistoryEntry[]
}

export interface MeetingProviderStatus {
  readonly isConfigured: boolean
  readonly providerName?: string
  readonly gatewayStatus: 'ONLINE' | 'OFFLINE' | 'UNPROVISIONED'
  readonly serverRecordingPipeline: boolean
  readonly consentLedgerIntegration: boolean
  readonly notes: string
}

export interface SendMessagePayload {
  readonly content: string
  readonly attachmentIds?: readonly string[]
}

export interface SubmitConsentPayload {
  readonly consent: 'GRANT' | 'DECLINE'
  readonly reason?: string
}
