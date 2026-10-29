import React from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, UploadCloud, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface AccountingTeamRejectionNoticeProps {
  readonly rejectionReason?: string
  readonly auditRequestId?: string
}

export const AccountingTeamRejectionNotice: React.FC<AccountingTeamRejectionNoticeProps> = ({
  rejectionReason,
  auditRequestId,
}) => {
  const { t } = useTranslation()

  return (
    <section
      className="review-rejection-notice-card"
      role="alert"
      aria-labelledby="accounting-rejection-heading"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)' }}>
        <div className="review-rejection-icon-wrapper" aria-hidden="true">
          <AlertCircle size={22} style={{ color: 'var(--color-rose-600)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 id="accounting-rejection-heading" className="review-rejection-title">
            {t('review.rejectionNoticeTitle', 'Submission Rejected — Revisions Required')}
          </h2>
          <p className="review-rejection-desc">
            {t(
              'review.rejectionNoticeDesc',
              'The auditor has requested revisions. Please inspect the rejection reason below and upload corrected schedules or supporting files.'
            )}
          </p>

          {rejectionReason && (
            <div className="review-rejection-reason-box">
              <span className="review-rejection-reason-label">
                {t('review.rejectionReasonLabel', 'Auditor Rejection Reason')}:
              </span>
              <p className="review-rejection-reason-text">{rejectionReason}</p>
            </div>
          )}

          <div style={{ marginTop: 'var(--spacing-4)' }}>
            <Link
              to={auditRequestId ? `/audit-requests/${auditRequestId}` : '/documents'}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <UploadCloud size={15} aria-hidden="true" />
              <span>{t('review.resubmitDocumentAction', 'Upload Corrected Document')}</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
