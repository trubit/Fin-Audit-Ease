/**
 * Pre-Audit, Month-End Close & Weekly Checklist Domain Types.
 * Strictly adheres to FinAuditEase frontend architecture and authorization boundaries.
 */

export type ChecklistType = 'WEEKLY_CHECKPOINT' | 'MONTH_END_CLOSE' | 'PRE_AUDIT_READINESS'

export type ChecklistItemStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED' // Mapped to user-facing "Done"
  | 'DONE'
  | 'REVIEWED'
  | 'NOT_APPLICABLE'

export interface ChecklistAttachedDocument {
  readonly id: string
  readonly name: string
  readonly url?: string
  readonly sizeBytes?: number
  readonly uploadedAt?: string
  readonly uploadedBy?: string
}

export interface ChecklistItem {
  readonly id: string
  readonly checklistId: string
  readonly itemNumber?: number
  readonly title: string
  readonly description?: string
  readonly category?: string
  readonly status: ChecklistItemStatus
  readonly assignedToUserId?: string
  readonly assignedToUserName?: string
  readonly dueDate?: string
  readonly statutoryDueDate?: string
  readonly internalTargetDate?: string // Labeled user-facing as "Complete by"
  readonly isOverdue?: boolean
  readonly isInternalTargetPassed?: boolean
  readonly notes?: string
  readonly differenceExplanation?: string
  readonly notApplicableReason?: string
  readonly attachedDocumentCount: number
  readonly attachedDocuments?: readonly ChecklistAttachedDocument[]
  readonly hasMissingEvidence?: boolean
  readonly completedAt?: string
  readonly completedByUserName?: string
  readonly reviewedAt?: string
  readonly reviewedByUserName?: string
  readonly timeTakenMinutes?: number
  readonly isCarriedOver?: boolean
  readonly originalReportingPeriod?: string
  readonly carryOverReason?: string
  readonly requiresEvidence?: boolean
  readonly auditRequestId?: string
}

export interface Checklist {
  readonly id: string
  readonly engagementId?: string
  readonly organizationId?: string
  readonly type: ChecklistType
  readonly title: string
  readonly periodLabel: string // e.g. "Week 43 (19 Oct – 25 Oct 2026)" or "October 2026"
  readonly reportingWeek?: number
  readonly startDate?: string
  readonly endDate?: string
  readonly items: readonly ChecklistItem[]
  readonly totalItemsCount: number
  readonly completedItemsCount: number
  readonly reviewedItemsCount?: number
  readonly notApplicableItemsCount?: number
  readonly overdueItemsCount?: number
  readonly missingEvidenceItemsCount?: number
  readonly isSubmittedForReview?: boolean
  readonly submittedAt?: string
  readonly submittedByUserName?: string
  readonly isSignedOff?: boolean
  readonly signedOffAt?: string
  readonly signedOffByUserName?: string
  readonly isLocked?: boolean
  readonly lockedAt?: string
  readonly lockedByUserName?: string
  readonly isArchived?: boolean
}

export interface ChecklistListParams {
  readonly engagementId?: string
  readonly organizationId?: string
  readonly type?: ChecklistType
  readonly search?: string
  readonly period?: string
  readonly weekNumber?: number
}

export interface UpdateChecklistItemPayload {
  readonly status?: ChecklistItemStatus
  readonly notes?: string
  readonly differenceExplanation?: string
  readonly notApplicableReason?: string
  readonly internalTargetDate?: string
  readonly assignedToUserId?: string
  readonly assignedToUserName?: string
  readonly timeTakenMinutes?: number
}

export interface SignOffChecklistPayload {
  readonly comments?: string
  readonly lockPeriod?: boolean
}
