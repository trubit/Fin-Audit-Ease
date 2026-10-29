import React from 'react'
import { Badge } from '@/components/common/Badge/Badge'
import { useTranslation } from 'react-i18next'
import './StatusBadge.css'

export type StatusType =
  | 'OPEN'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'ADDITIONAL_INFO_REQUIRED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'ARCHIVED'
  | 'OVERDUE'
  | 'PENDING'
  | 'APPROVED'
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'

export interface StatusBadgeProps {
  readonly status: StatusType | string
  readonly label?: string
  readonly size?: 'sm' | 'md'
  readonly className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  className = '',
}) => {
  const { t } = useTranslation()

  const normalized = (status || '').toUpperCase()

  let variant: 'neutral' | 'success' | 'warning' | 'danger' | 'info' = 'neutral'
  let defaultLabel = status

  switch (normalized) {
    case 'APPROVED':
    case 'ACCEPTED':
      variant = 'success'
      defaultLabel = t('auditRequests.statusAccepted', 'Approved')
      break
    case 'ACTIVE':
      variant = 'success'
      defaultLabel = t('engagements.statusActive', 'Active')
      break
    case 'COMPLETED':
      variant = 'neutral'
      defaultLabel = t('engagements.statusCompleted', 'Completed')
      break
    case 'ARCHIVED':
      variant = 'neutral'
      defaultLabel = t('engagements.statusArchived', 'Archived')
      break
    case 'OVERDUE':
    case 'REJECTED':
      variant = 'danger'
      defaultLabel = normalized === 'OVERDUE'
        ? t('dashboard.overdueBadge', 'Overdue')
        : t('auditRequests.statusRejected', 'Rejected')
      break
    case 'CRITICAL':
      variant = 'danger'
      defaultLabel = t('auditRequests.priorityCritical', 'Critical')
      break
    case 'HIGH':
      variant = 'danger'
      defaultLabel = t('auditRequests.priorityHigh', 'High')
      break
    case 'IN_REVIEW':
    case 'UNDER_REVIEW':
      variant = 'warning'
      defaultLabel = t('auditRequests.statusInReview', 'In Review')
      break
    case 'ADDITIONAL_INFO_REQUIRED':
      variant = 'warning'
      defaultLabel = t('auditRequests.statusAdditionalInfo', 'Info Required')
      break
    case 'MEDIUM':
      variant = 'warning'
      defaultLabel = t('auditRequests.priorityMedium', 'Medium')
      break
    case 'OPEN':
      variant = 'warning'
      defaultLabel = t('auditRequests.statusOpen', 'Pending Action')
      break
    case 'SUBMITTED':
      variant = 'info'
      defaultLabel = t('auditRequests.statusSubmitted', 'Submitted')
      break
    case 'PENDING':
      variant = 'neutral'
      defaultLabel = t('review.statusPending', 'Pending')
      break
    case 'LOW':
      variant = 'neutral'
      defaultLabel = t('auditRequests.priorityLow', 'Low')
      break
    default:
      variant = 'neutral'
      defaultLabel = label || status
  }

  const displayText = label || defaultLabel

  return (
    <Badge
      variant={variant}
      className={`status-badge status-badge-${size} ${className}`}
      aria-label={`Status: ${displayText}`}
    >
      <span className="status-badge-dot" aria-hidden="true" />
      <span className="status-badge-text">{displayText}</span>
    </Badge>
  )
}
