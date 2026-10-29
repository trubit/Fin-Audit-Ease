/**
 * Audit Request Domain Types.
 * Backend contract integration boundary for auditor Provided by Client requests.
 */

export type AuditRequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type AuditRequestStatus =
  | 'OPEN'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'ADDITIONAL_INFO_REQUIRED'
  | 'ACCEPTED'
  | 'REJECTED'

export interface AuditRequest {
  readonly id: string
  readonly engagementId: string
  readonly referenceCode: string // e.g. "REQ-2026-042"
  readonly title: string
  readonly description: string
  readonly category: string // e.g. "Cash & Equivalents", "Accounts Receivable"
  readonly priority: AuditRequestPriority
  readonly status: AuditRequestStatus
  readonly assigneeId?: string
  readonly assigneeName?: string
  readonly dueDate: string
  readonly attachedDocumentIds: readonly string[]
  readonly rejectionReason?: string
  readonly reviewNotes?: string
  readonly createdAt: string
  readonly updatedAt: string
}

export interface CreateAuditRequestPayload {
  readonly engagementId: string
  readonly title: string
  readonly description: string
  readonly category: string
  readonly priority: AuditRequestPriority
  readonly dueDate: string
  readonly assigneeId?: string
}

export interface UpdateAuditRequestStatusPayload {
  readonly status: AuditRequestStatus
  readonly rejectionReason?: string
  readonly reviewNotes?: string
}

export interface AuditRequestComment {
  readonly id: string
  readonly auditRequestId: string
  readonly authorId: string
  readonly authorName: string
  readonly content: string
  readonly createdAt: string
}
