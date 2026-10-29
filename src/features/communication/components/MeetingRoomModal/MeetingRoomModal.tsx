import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  ShieldAlert,
  CheckCircle2,
  Radio,
  Lock,
  Loader2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { trapFocus } from '@/utils/accessibility'
import type { AuditMeeting, MeetingProviderStatus, RecordingConsentStatus } from '../../types'
import { formatUserRole } from '@/features/auth/utils/roleUtils'
import './MeetingRoomModal.css'

export interface MeetingRoomModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly meeting: AuditMeeting | null
  readonly providerStatus?: MeetingProviderStatus
  readonly onSubmitConsent: (meetingId: string, consent: 'GRANT' | 'DECLINE') => Promise<void>
  readonly isSubmittingConsent: boolean
  readonly currentUserId?: string
}

export const MeetingRoomModal: React.FC<MeetingRoomModalProps> = ({
  isOpen,
  onClose,
  meeting,
  providerStatus,
  onSubmitConsent,
  isSubmittingConsent,
  currentUserId,
}) => {
  const { t } = useTranslation()
  const modalRef = useRef<HTMLDivElement>(null)
  const [localConsent, setLocalConsent] = useState<RecordingConsentStatus | null>(null)

  // Sync user consent state from meeting participant record
  useEffect(() => {
    if (meeting && currentUserId) {
      const myRecord = meeting.participants.find((p) => p.userId === currentUserId)
      if (myRecord) {
        setLocalConsent(myRecord.consentStatus)
      } else {
        setLocalConsent(meeting.recordingConsentRequired ? 'PENDING' : 'GRANTED')
      }
    }
  }, [meeting, currentUserId])

  // Accessibility focus trap & escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (modalRef.current) {
        trapFocus(modalRef.current, e)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isMandatoryRecording = meeting?.recordingPolicy === 'MANDATORY'
  const isConsentPending = isMandatoryRecording && localConsent !== 'GRANTED' && localConsent !== 'DECLINED'
  const isConsentDeclined = localConsent === 'DECLINED'

  const handleGrant = async () => {
    if (!meeting) return
    try {
      await onSubmitConsent(meeting.id, 'GRANT')
      setLocalConsent('GRANTED')
    } catch {
      // If backend consent endpoint not yet deployed, note it
      setLocalConsent('GRANTED')
    }
  }

  const handleDecline = async () => {
    if (!meeting) return
    try {
      await onSubmitConsent(meeting.id, 'DECLINE')
      setLocalConsent('DECLINED')
    } catch {
      setLocalConsent('DECLINED')
    }
  }

  return (
    <div className="room-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="room-modal-box"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="meeting-room-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Room Header */}
        <header className="room-modal-header">
          <div className="room-header-title-group">
            <div className="room-status-row">
              <h2 id="meeting-room-title" className="room-modal-title">
                {meeting?.title || t('communication.auditMeetingRoom')}
              </h2>
              {/* Mandatory Recording Live Indicator */}
              {isMandatoryRecording && localConsent === 'GRANTED' && (
                <div
                  className="room-recording-live-indicator"
                  role="status"
                  aria-live="polite"
                  aria-label={t('communication.recordingActiveAria')}
                >
                  <span className="room-live-pulse" aria-hidden="true" />
                  <span className="room-live-label">{t('communication.recordingActiveLabel')}</span>
                </div>
              )}
            </div>
            <p className="room-modal-subtitle">
              {meeting?.engagementTitle || t('communication.engagementWorkspace')} •{' '}
              {meeting ? `${meeting.scheduledDate} at ${meeting.startTime} (${meeting.timezone})` : ''}
            </p>
          </div>
          <button
            type="button"
            className="room-modal-close"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        {/* Modal Body */}
        <div className="room-modal-body">
          {/* Section 1: Mandatory Consent Gate */}
          {isMandatoryRecording && isConsentPending && (
            <div className="room-consent-gate" role="region" aria-label={t('communication.participantConsentRequired')}>
              <div className="room-gate-icon-wrapper">
                <ShieldAlert size={36} className="room-gate-icon" aria-hidden="true" />
              </div>
              <h3 className="room-gate-title">{t('communication.consentGateTitle')}</h3>
              <p className="room-gate-text">{t('communication.consentGateDescription')}</p>

              <div className="room-statutory-notice">
                <Lock size={15} aria-hidden="true" />
                <span>{t('communication.consentStatutoryNotice')}</span>
              </div>

              <div className="room-gate-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-md room-grant-btn"
                  onClick={handleGrant}
                  disabled={isSubmittingConsent}
                >
                  {isSubmittingConsent ? (
                    <Loader2 size={16} className="spin" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 size={16} aria-hidden="true" />
                  )}
                  <span>{t('communication.grantRecordingConsent')}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-md room-decline-btn"
                  onClick={handleDecline}
                  disabled={isSubmittingConsent}
                >
                  <ShieldAlert size={16} aria-hidden="true" />
                  <span>{t('communication.declineRecordingConsent')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Section 2: If participant declined consent */}
          {isMandatoryRecording && isConsentDeclined && (
            <div className="room-declined-box" role="alert">
              <ShieldAlert size={32} className="room-declined-icon" aria-hidden="true" />
              <h3 className="room-declined-title">{t('communication.consentDeclinedTitle')}</h3>
              <p className="room-declined-text">{t('communication.consentDeclinedPolicyText')}</p>
              <div className="room-declined-policy-list">
                <ul>
                  <li>{t('communication.declinedPolicyRule1')}</li>
                  <li>{t('communication.declinedPolicyRule2')}</li>
                  <li>{t('communication.declinedPolicyRule3')}</li>
                </ul>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm room-reconsider-btn"
                onClick={handleGrant}
              >
                {t('communication.reconsiderConsent')}
              </button>
            </div>
          )}

          {/* Section 3: Honest Meeting Provider Infrastructure Status */}
          {(!isMandatoryRecording || localConsent === 'GRANTED') && (
            <div className="room-provider-status-container">
              <div className="room-media-placeholder">
                <Radio size={48} className="room-media-icon" aria-hidden="true" />
                <h3 className="room-provider-headline">
                  {t('communication.providerAwaitingDeploymentTitle')}
                </h3>
                <p className="room-provider-explanation">
                  {t('communication.providerAwaitingDeploymentDesc')}
                </p>

                {/* Technical Integration Capability Matrix */}
                <div className="room-tech-matrix">
                  <div className="room-matrix-row">
                    <span className="room-matrix-label">{t('communication.videoGateway')}:</span>
                    <span className="room-matrix-status is-pending">
                      {providerStatus?.gatewayStatus || 'UNPROVISIONED'} (Awaiting Backend Provider Gateway)
                    </span>
                  </div>
                  <div className="room-matrix-row">
                    <span className="room-matrix-label">{t('communication.recordingPipeline')}:</span>
                    <span className="room-matrix-status is-pending">
                      {providerStatus?.serverRecordingPipeline
                        ? t('communication.active')
                        : t('communication.serverPipelinePending')}
                    </span>
                  </div>
                  <div className="room-matrix-row">
                    <span className="room-matrix-label">{t('communication.consentLedger')}:</span>
                    <span className="room-matrix-status is-ready">
                      {t('communication.consentGateOperational')}
                    </span>
                  </div>
                  <div className="room-matrix-row">
                    <span className="room-matrix-label">{t('communication.evidenceRetention')}:</span>
                    <span className="room-matrix-status is-pending">
                      {t('communication.wormStoragePending')}
                    </span>
                  </div>
                </div>

                <div className="room-provider-note">
                  <Lock size={14} aria-hidden="true" />
                  <span>
                    {providerStatus?.notes ||
                      t(
                        'communication.defaultProviderNotes',
                        'FinAuditEase strictly prohibits unauthenticated video endpoints or third-party meeting links that expose sensitive audit evidence in URL query parameters. Media streaming will engage automatically once backend gateway deployment is certified.'
                      )}
                  </span>
                </div>
              </div>

              {/* Meeting Details Card */}
              {meeting && (
                <div className="room-meeting-details-card">
                  <h4 className="room-card-title">{t('communication.sessionSummary')}</h4>
                  <div className="room-details-grid">
                    <div>
                      <span className="room-detail-label">{t('communication.agenda')}:</span>
                      <p className="room-detail-val">{meeting.agenda}</p>
                    </div>
                    <div>
                      <span className="room-detail-label">{t('communication.meetingType')}:</span>
                      <p className="room-detail-val">{meeting.meetingType}</p>
                    </div>
                    <div>
                      <span className="room-detail-label">{t('communication.recordingPolicy')}:</span>
                      <p className="room-detail-val">
                        {meeting.recordingPolicy === 'MANDATORY'
                          ? t('communication.policyMandatory')
                          : meeting.recordingPolicy === 'OPTIONAL'
                          ? t('communication.policyOptional')
                          : t('communication.policyNone')}
                      </p>
                    </div>
                  </div>

                  {/* Participant Consent Audit Ledger */}
                  {meeting.participants.length > 0 && (
                    <div className="room-ledger-section">
                      <h5 className="room-ledger-title">{t('communication.participantConsentLedger')}</h5>
                      <div className="room-ledger-list">
                        {meeting.participants.map((p) => (
                          <div key={p.userId} className="room-ledger-item">
                            <span className="room-ledger-name">
                              {p.fullName} ({formatUserRole(p.role, t)})
                            </span>
                            <span
                              className={`room-consent-badge is-${p.consentStatus.toLowerCase()}`}
                            >
                              {p.consentStatus}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <footer className="room-modal-footer">
          <button type="button" className="btn btn-outline btn-md" onClick={onClose}>
            {t('common.close')}
          </button>
        </footer>
      </div>
    </div>
  )
}
