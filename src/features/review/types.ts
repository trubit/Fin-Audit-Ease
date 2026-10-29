import type { AuditDocument } from '@/features/documents/types'

/**
 * Auditor Review Workspace Types.
 */

export type ReviewStatus = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED'

export interface ReviewFeedback {
  readonly id: string
  readonly reviewerId: string
  readonly reviewerName: string
  readonly comment: string
  readonly targetType: 'DOCUMENT' | 'REQUEST' | 'CHECKLIST_ITEM'
  readonly targetId: string
  readonly createdAt: string
}

export interface ReviewItem {
  readonly id: string
  readonly engagementId: string
  readonly engagementName?: string
  readonly engagementStatus?: string
  readonly auditRequestId?: string
  readonly referenceCode?: string
  readonly title: string
  readonly description?: string
  readonly category?: string
  readonly priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  readonly status: ReviewStatus
  readonly submissionDate: string
  readonly dueDate?: string
  readonly submittedByUserName: string
  readonly assignedAccountingTeamMember?: string
  readonly documentId?: string
  readonly documentName?: string
  readonly documents?: readonly AuditDocument[]
  readonly rejectionReason?: string
  readonly privateNotes?: string
  readonly feedbackNotes: readonly ReviewFeedback[]
}

export interface ReviewListParams {
  readonly engagementId?: string
  readonly status?: ReviewStatus
  readonly search?: string
  readonly page?: number
  readonly limit?: number
}

export interface SubmitFeedbackPayload {
  readonly comment: string
  readonly targetType: 'DOCUMENT' | 'REQUEST' | 'CHECKLIST_ITEM'
  readonly targetId: string
}

export interface ReviewActionPayload {
  readonly notes?: string
}
