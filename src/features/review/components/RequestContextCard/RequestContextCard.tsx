import React from 'react'
import {
  FileText,
  Calendar,
  User,
  Clock,
  Tag,
  AlertTriangle,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/common/Badge/Badge'
import { formatDate, getDeadlineInfo } from '@/utils/dateUtils'
import type { ReviewStatus } from '../../types'

export interface RequestContextCardProps {
  readonly title: string
  readonly referenceCode?: string
  readonly description?: string
  readonly category?: string
  readonly assignedAccountingTeamMember?: string
  readonly priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  readonly submissionDate: string
  readonly dueDate?: string
  readonly status: ReviewStatus
}

export const RequestContextCard: React.FC<RequestContextCardProps> = ({
  title,
  referenceCode,
  description,
  category,
  assignedAccountingTeamMember,
  priority,
  submissionDate,
  dueDate,
  status,
}) => {
  const { t } = useTranslation()
  const deadlineInfo = getDeadlineInfo(dueDate)
  const isOverdue = dueDate && deadlineInfo.status === 'overdue' && status !== 'APPROVED'

  const getPriorityBadge = (p?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
    switch (p) {
      case 'CRITICAL':
        return <Badge variant="danger">{t('auditRequests.priorityCritical', 'Critical')}</Badge>
      case 'HIGH':
        return <Badge variant="danger">{t('auditRequests.priorityHigh', 'High')}</Badge>
      case 'MEDIUM':
        return <Badge variant="warning">{t('auditRequests.priorityMedium', 'Medium')}</Badge>
      case 'LOW':
      default:
        return <Badge variant="neutral">{t('auditRequests.priorityLow', 'Low')}</Badge>
    }
  }

  return (
    <section
      className="review-section-card"
      aria-labelledby="request-context-heading"
    >
      <div className="review-section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <FileText size={18} style={{ color: 'var(--color-primary-600)' }} aria-hidden="true" />
          <h2 id="request-context-heading" className="review-section-title">
            {t('review.requestContextTitle', 'Audit Request Context')}
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
          {referenceCode && (
            <span className="review-ref-code" title={t('review.referenceCode', 'Reference Code')}>
              {referenceCode}
            </span>
          )}
          {priority && getPriorityBadge(priority)}
          {isOverdue && (
            <Badge variant="danger">
              <AlertTriangle size={12} style={{ marginRight: '4px' }} aria-hidden="true" />
              {t('common.overdue', 'Overdue')}
            </Badge>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 'var(--spacing-4)' }}>
        <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-slate-900)', margin: '0 0 var(--spacing-2) 0' }}>
          {title}
        </h3>
        {description && (
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-slate-700)', lineHeight: 1.6, margin: 0 }}>
            {description}
          </p>
        )}
      </div>

      <div className="review-metadata-grid">
        {category && (
          <div className="review-meta-item">
            <span className="review-meta-label">
              <Tag size={13} aria-hidden="true" />
              {t('review.category', 'Category')}
            </span>
            <span className="review-meta-value">{category}</span>
          </div>
        )}

        <div className="review-meta-item">
          <span className="review-meta-label">
            <User size={13} aria-hidden="true" />
            {t('review.assignedAccountingTeamMember', 'Assigned Accounting Team Member')}
          </span>
          <span className="review-meta-value">
            {assignedAccountingTeamMember || t('review.unassigned', 'Not Assigned')}
          </span>
        </div>

        <div className="review-meta-item">
          <span className="review-meta-label">
            <Clock size={13} aria-hidden="true" />
            {t('review.submissionDate', 'Submitted')}
          </span>
          <span className="review-meta-value">{formatDate(submissionDate)}</span>
        </div>

        {dueDate && (
          <div className="review-meta-item">
            <span className="review-meta-label">
              <Calendar size={13} aria-hidden="true" />
              {t('review.dueDate', 'Due Date')}
            </span>
            <span className={`review-meta-value ${isOverdue ? 'review-meta-overdue' : ''}`}>
              {formatDate(dueDate)}
              {isOverdue && ` (${deadlineInfo.label})`}
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
