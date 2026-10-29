import React, { useState, useEffect, useCallback } from 'react'
import { X, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { trapFocus } from '@/utils/accessibility'
import './ReviewActionModal.css'

export interface ReviewActionModalProps {
  readonly isOpen: boolean
  readonly actionType: 'APPROVE' | 'REJECT' | null
  readonly itemTitle: string
  readonly isSubmitting: boolean
  readonly onClose: () => void
  readonly onConfirm: (notes?: string) => void
}

export const ReviewActionModal: React.FC<ReviewActionModalProps> = ({
  isOpen,
  actionType,
  itemTitle,
  isSubmitting,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation()
  const [notes, setNotes] = useState('')
  const cardRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const MAX_CHAR_COUNT = 2000

  const handleClose = useCallback(() => {
    setNotes('')
    onClose()
  }, [onClose])

  const handleConfirm = () => {
    onConfirm(notes.trim() || undefined)
    setNotes('')
  }

  useEffect(() => {
    if (isOpen) {
      // Focus textarea on modal open for immediate keyboard entry
      const timer = setTimeout(() => {
        textareaRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        handleClose()
      } else if (cardRef.current) {
        trapFocus(cardRef.current, e)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting, handleClose])

  if (!isOpen || !actionType) {
    return null
  }

  const isApprove = actionType === 'APPROVE'
  const isReasonMissing = !isApprove && !notes.trim()

  return (
    <div
      className="review-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      aria-describedby="review-modal-desc"
    >
      <div className="review-modal-card" ref={cardRef}>
        <div className="review-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isApprove ? (
              <CheckCircle2 size={20} style={{ color: 'var(--color-success-600)' }} aria-hidden="true" />
            ) : (
              <XCircle size={20} style={{ color: 'var(--color-rose-600)' }} aria-hidden="true" />
            )}
            <h2 id="review-modal-title" className="review-modal-title">
              {isApprove ? t('review.approvedTitle', 'Audit Checklist and Supporting Documents — Approved') : t('review.notApprovedTitle', 'Audit Checklist and Supporting Documents — Not Approved')}
            </h2>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label={t('common.close')}
            style={{ padding: '4px' }}
          >
            <X size={16} />
          </button>
        </div>

        <p id="review-modal-desc" className="review-modal-desc">
          {isApprove
            ? t('review.approveConfirmation', { title: itemTitle })
            : t('review.notApprovedConfirmation', { defaultValue: 'Please provide the reason why this item is Not Approved.', title: itemTitle })}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-1)' }}>
          <label
            htmlFor="review-action-notes"
            style={{
              fontSize: 'var(--font-size-xs)',
              fontWeight: 600,
              color: 'var(--color-slate-700)',
              margin: 0,
            }}
          >
            {isApprove ? t('review.approvedNotesLabel', 'Approval Notes (Optional)') : t('review.reasonForNotApproved', 'Reason for Not Approved')}
            {!isApprove && <span style={{ color: 'var(--color-rose-600)', marginLeft: '4px' }}>*</span>}
          </label>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {notes.length} / {MAX_CHAR_COUNT}
          </span>
        </div>

        <textarea
          ref={textareaRef}
          id="review-action-notes"
          className="review-modal-textarea"
          maxLength={MAX_CHAR_COUNT}
          placeholder={
            isApprove
              ? t('review.notesPlaceholder')
              : t('review.notApprovedReasonPlaceholder', 'Clearly detail what calculations, schedules, or missing documents need correction...')
          }
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isSubmitting}
          required={!isApprove}
          aria-invalid={isReasonMissing}
          aria-errormessage={isReasonMissing ? 'rejection-error-msg' : undefined}
        />
        {isReasonMissing && (
          <span
            id="rejection-error-msg"
            style={{
              display: 'block',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-rose-600)',
              marginTop: '-1rem',
              marginBottom: 'var(--spacing-4)',
            }}
            role="alert"
          >
            {t('review.notApprovedReasonRequired', 'A reason is required when marking an item as Not Approved.')}
          </span>
        )}

        <div className="review-modal-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${isApprove ? 'btn-primary' : 'btn-destructive'}`}
            onClick={handleConfirm}
            disabled={isSubmitting || isReasonMissing}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="spin-animation" aria-hidden="true" />
                <span>{t('common.submitting')}</span>
              </>
            ) : (
              <span>{isApprove ? t('review.confirmApproved', 'Confirm Approved') : t('review.confirmNotApproved', 'Confirm Not Approved')}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
