/**
 * Auditor & Finance Engagement Types.
 * Backend contract integration boundary.
 */

export type EngagementStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'IN_REVIEW'
  | 'COMPLETED'
  | 'ARCHIVED'
  | 'OVERDUE'

export interface Engagement {
  readonly id: string
  readonly title: string
  readonly fiscalYear: number
  readonly clientOrganizationId: string
  readonly clientOrganizationName: string
  readonly leadAuditorId: string
  readonly leadAuditorName: string
  readonly auditorFirmName?: string
  readonly status: EngagementStatus
  readonly startDate: string
  readonly targetCompletionDate: string
  readonly totalRequestsCount: number
  readonly completedRequestsCount: number
  readonly createdAt: string
  readonly updatedAt: string
}

export interface EngagementMilestone {
  readonly id: string
  readonly engagementId: string
  readonly title: string
  readonly dueDate: string
  readonly isCompleted: boolean
}

export interface CreateEngagementPayload {
  readonly title: string
  readonly clientOrganizationName: string
  readonly fiscalYear: number
  readonly startDate: string
  readonly targetCompletionDate: string
}

export interface EngagementMember {
  readonly id: string
  readonly engagementId: string
  readonly userId: string
  readonly fullName: string
  readonly email: string
  readonly role: 'ACCOUNTING_TEAM_LEAD' | 'ACCOUNTING_MEMBER' | 'FINANCE_USER' | 'AUDITOR' | string
  readonly status: 'ACTIVE' | 'INVITED' | 'INACTIVE' | string
  readonly joinedAt?: string
}

export interface InviteEngagementMemberPayload {
  readonly email: string
  readonly role?: string
}

export interface InviteMemberResponse {
  readonly message?: string
  readonly invitationToken?: string
  readonly invitationLink?: string
  readonly email?: string
  readonly expiresAt?: string
}
