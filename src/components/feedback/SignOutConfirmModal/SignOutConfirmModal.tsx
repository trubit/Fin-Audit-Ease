import React, { useEffect, useRef } from 'react'
import { LogOut, ShieldAlert, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { trapFocus } from '@/utils/accessibility'
import './SignOutConfirmModal.css'

export interface SignOutConfirmModalProps {
  readonly isOpen: boolean
  readonly isSubmitting?: boolean
  readonly onConfirm: () => void
  readonly onCancel: () => void
}

/**
 * Enterprise Sign-Out Confirmation Guard.
 *
 * Prevents accidental session termination during active audit review
 * or workpaper drafting. Provides clear security audit assurances.
 */
export const SignOutConfirmModal: React.FC<SignOutConfirmModalProps> = ({
  isOpen,
  isSubmitting = false,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation()
  const modalRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    // Focus cancel button by default for non-destructive keyboard preference
    const timer = setTimeout(() => {
      cancelButtonRef.current?.focus()
    }, 50)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onCancel()
      } else if (modalRef.current) {
        trapFocus(modalRef.current, e)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isSubmitting, onCancel])

  if (!isOpen) return null

  return (
    <div
      className="sign-out-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sign-out-modal-title"
      aria-describedby="sign-out-modal-desc"
    >
      <div
        className="sign-out-modal-backdrop"
        onClick={!isSubmitting ? onCancel : undefined}
        aria-hidden="true"
      />

      <div className="sign-out-modal-card" ref={modalRef} tabIndex={-1}>
        {/* Close Button */}
        <button
          type="button"
          className="sign-out-modal-close"
          onClick={onCancel}
          disabled={isSubmitting}
          aria-label={t('common.close')}
        >
          <X size={18} aria-hidden="true" />
        </button>

        {/* Brand/Security Icon */}
        <div className="sign-out-modal-icon-badge" aria-hidden="true">
          <div className="sign-out-modal-icon-inner">
            <ShieldAlert size={28} className="sign-out-icon-shield" />
          </div>
        </div>

        {/* Modal Header */}
        <h2 id="sign-out-modal-title" className="sign-out-modal-title">
          {t('signOut.confirmTitle')}
        </h2>

        {/* Modal Description */}
        <p id="sign-out-modal-desc" className="sign-out-modal-description">
          {t('signOut.confirmMessage')}
        </p>

        {/* Security Assurance Checklist */}
        <div className="sign-out-modal-security-list" role="list">
          <div className="sign-out-security-item" role="listitem">
            <span className="sign-out-check-bullet" aria-hidden="true">✓</span>
            <span>{t('signOut.tokenRevoked')}</span>
          </div>
          <div className="sign-out-security-item" role="listitem">
            <span className="sign-out-check-bullet" aria-hidden="true">✓</span>
            <span>{t('signOut.cachePurged')}</span>
          </div>
          <div className="sign-out-security-item" role="listitem">
            <span className="sign-out-check-bullet" aria-hidden="true">✓</span>
            <span>{t('signOut.workstationSafe')}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sign-out-modal-actions">
          <button
            ref={cancelButtonRef}
            type="button"
            className="btn btn-secondary sign-out-btn-cancel"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t('signOut.cancel')}
          </button>

          <button
            type="button"
            className="btn btn-danger sign-out-btn-confirm"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            <LogOut size={16} aria-hidden="true" />
            <span>{isSubmitting ? t('authentication.submitting') : t('signOut.confirm')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
