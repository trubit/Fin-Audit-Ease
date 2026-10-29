import React, { useEffect, useRef } from 'react'
import { Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSessionStore } from '@/store/sessionStore'
import { trapFocus } from '@/utils/accessibility'
import './SessionTimeoutModal.css'

export interface SessionTimeoutModalProps {
  readonly onLogout?: () => void
}

export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({ onLogout }) => {
  const { t } = useTranslation()
  const { isWarningModalOpen, recordUserActivity, triggerSessionExpired } = useSessionStore()
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isWarningModalOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        recordUserActivity()
      } else if (modalRef.current) {
        trapFocus(modalRef.current, e)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isWarningModalOpen, recordUserActivity])

  if (!isWarningModalOpen) return null

  const handleStayLoggedIn = () => {
    recordUserActivity()
  }

  const handleLogout = () => {
    triggerSessionExpired()
    if (onLogout) {
      onLogout()
    }
  }

  return (
    <div
      className="session-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-timeout-title"
    >
      <div className="session-modal-card" ref={modalRef}>
        <div className="session-modal-icon-wrapper" aria-hidden="true">
          <Clock size={32} />
        </div>

        <h2 id="session-timeout-title" className="session-modal-title">
          {t('common.sessionWarning')}
        </h2>

        <p className="session-modal-desc">
          {t('common.sessionWarningMessage')}
        </p>

        <div className="session-modal-actions">
          <button
            type="button"
            onClick={handleStayLoggedIn}
            className="btn btn-primary"
            autoFocus
          >
            {t('common.stayLoggedIn')}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-secondary"
          >
            {t('common.logOut')}
          </button>
        </div>
      </div>
    </div>
  )
}
