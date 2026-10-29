/**
 * Immutable Audit Trail Domain Types.
 * Backend contract integration boundary for compliance, provenance, and historical verification.
 */

export type AuditActionType =
  | 'ENGAGEMENT_CREATED'
  | 'ENGAGEMENT_COMPLETED'
  | 'ENGAGEMENT_LOCKED'
  | 'REQUEST_CREATED'
  | 'REQUEST_ASSIGNED'
  | 'REQUEST_STATUS_CHANGED'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_VIEWED'
  | 'DOCUMENT_DOWNLOADED'
  | 'DOCUMENT_REVIEWED'
  | 'REVIEW_APPROVED'
  | 'DOCUMENT_APPROVED'
  | 'REVIEW_REJECTED'
  | 'DOCUMENT_REJECTED'
  | 'DOCUMENT_RESUBMITTED'
  | 'CHECKLIST_ITEM_COMPLETED'
  | 'REMINDER_SENT'
  | 'NOTIFICATION_READ'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'AUDIT_TRAIL_EXPORTED'
  | (string & {})

export interface AuditTrailRecord {
  readonly id: string
  readonly timestamp: string
  readonly actorId: string
  readonly actorName: string
  readonly actorEmail?: string
  readonly actorRole?: string
  readonly action: AuditActionType
  readonly description?: string
  readonly resourceType?: string
  readonly resourceId?: string
  readonly engagementId?: string
  readonly auditRequestId?: string
  readonly documentId?: string
  readonly reviewId?: string
  readonly ipAddress?: string
  readonly userAgent?: string
  readonly metadata?: Record<string, unknown>
  readonly hash?: string
  readonly previousHash?: string
  readonly isVerified?: boolean
}

export type IntegrityStatus = 'VERIFIED' | 'FAILED' | 'UNVERIFIED' | 'UNAVAILABLE'

export interface AuditTrailIntegrityInfo {
  readonly status: IntegrityStatus
  readonly verifiedAt?: string
  readonly rootHash?: string
  readonly algorithm?: string
  readonly message?: string
}

export interface AuditTrailFilterParams {
  readonly engagementId?: string
  readonly startDate?: string
  readonly endDate?: string
  readonly actorId?: string
  readonly action?: string
  readonly auditRequestId?: string
  readonly page?: number
  readonly limit?: number
  readonly search?: string
}

export interface AuditTrailExportParams {
  readonly engagementId: string
  readonly startDate?: string
  readonly endDate?: string
  readonly format?: 'pdf'
}
