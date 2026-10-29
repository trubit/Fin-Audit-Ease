import React from 'react'
import {
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Lock,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ReviewStatus } from '../../types'

export interface AuditorDecisionCardProps {
  readonly status: ReviewStatus
  readonly isLocked: boolean
  readonly isSubmitting: boolean
  readonly onApprove: () => void
  readonly onReject: () => void
}

export const AuditorDecisionCard: React.FC<AuditorDecisionCardProps> = ({
  status,
  isLocked,
  isSubmitting,
  onApprove,
  onReject,
}) => {
  const { t } = useTranslation()

  return (
    <section
      className="review-section-card review-decision-card"
      aria-labelledby="auditor-decision-heading"
    >
      <div className="review-section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <AlertOctagon size={18} style={{ color: 'var(--color-slate-700)' }} aria-hidden="true" />
          <h2 id="auditor-decision-heading" className="review-section-title">
            {t('review.auditorDecisionTitle', 'Auditor Decision & Sign-Off')}
          </h2>
        </div>
      </div>

      <p className="review-section-subtitle">
        {t(
          'review.auditorDecisionSubtitle',
          'Consequential action: approving or rejecting submitted audit evidence. Decisions are recorded in the permanent audit record.'
        )}
      </p>

      {isLocked ? (
        <div className="review-locked-banner" role="status">
          <Lock size={16} />
          <span>
            {t(
              'review.engagementLockedNotice',
              'Engagement Completed — This engagement is locked in read-only archive mode. Review actions cannot be performed.'
            )}
          </span>
        </div>
      ) : (
        <div className="review-decision-controls">
          <div className="review-decision-status-hint">
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              {t('review.currentStatus', 'Current Status')}:
            </span>
            <span style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)', color: 'var(--color-slate-900)', marginLeft: '4px' }}>
              {status}
            </span>
          </div>

          <div className="review-decision-buttons">
            <button
              type="button"
              className="btn btn-outline btn-md review-btn-reject"
              onClick={onReject}
              disabled={isSubmitting}
            >
              <XCircle size={16} aria-hidden="true" />
              <span>{t('review.notApprovedOption', 'Not Approved')}</span>
            </button>

            <button
              type="button"
              className="btn btn-primary btn-md review-btn-approve"
              onClick={onApprove}
              disabled={isSubmitting}
            >
              <CheckCircle2 size={16} aria-hidden="true" />
              <span>{t('review.approvedOption', 'Approved')}</span>
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
