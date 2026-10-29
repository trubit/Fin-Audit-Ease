/**
 * Notification Center Domain Types.
 * Strictly aligned with confirmed backend notification contract.
 */

export type NotificationSeverity = 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL'

export type NotificationType =
  | 'REQUEST_CREATED'
  | 'REQUEST_REMINDER'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_APPROVED'
  | 'DOCUMENT_REJECTED'
  | 'DEADLINE_7_DAYS'
  | 'DEADLINE_3_DAYS'
  | 'DEADLINE_1_DAY'
  | 'OVERDUE'
  | 'ESCALATION'
  | 'ENGAGEMENT_COMPLETED'
  | 'ENGAGEMENT_LOCKED'
  | 'REVIEW_REQUIRED'
  | 'ALL_REQUESTS_RESPONDED'
  | 'GENERAL'
  | (string & {})

export interface AppNotification {
  readonly id: string
  readonly title: string
  readonly message: string
  readonly severity: NotificationSeverity
  readonly type?: NotificationType
  readonly userId?: string
  readonly isRead: boolean
  readonly linkUrl?: string
  readonly engagementId?: string
  readonly engagementName?: string
  readonly auditRequestId?: string
  readonly documentId?: string
  readonly reviewId?: string
  readonly metadata?: Record<string, unknown>
  readonly createdAt: string
}

export interface NotificationListParams {
  readonly unreadOnly?: boolean
  readonly page?: number
  readonly limit?: number
}
