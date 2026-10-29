import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  Calendar,
  Globe,
  Users,
  ShieldAlert,
  Loader2,
  AlertCircle,
  Video,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { trapFocus } from '@/utils/accessibility'
import type { MeetingType, RecordingPolicy, ScheduleMeetingPayload } from '../../types'
import type { Engagement, EngagementMember } from '@/features/engagements/types'
import { formatUserRole } from '@/features/auth/utils/roleUtils'
import { AppApiError } from '@/services/api/apiErrors'
import './ScheduleMeetingModal.css'

export interface ScheduleMeetingModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly activeEngagement?: Engagement
  readonly engagementMembers: readonly EngagementMember[]
  readonly onScheduleMeeting: (payload: ScheduleMeetingPayload) => Promise<void>
  readonly isScheduling: boolean
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  activeEngagement,
  engagementMembers,
  onScheduleMeeting,
  isScheduling,
}) => {
  const { t } = useTranslation()
  const modalRef = useRef<HTMLDivElement>(null)

  // Form State
  const [title, setTitle] = useState('')
  const [agenda, setAgenda] = useState('')
  const [meetingType, setMeetingType] = useState<MeetingType>('WALKTHROUGH')
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })
  const [startTime, setStartTime] = useState('10:00')
  const [durationMinutes, setDurationMinutes] = useState(45)
  const [timezone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Lagos'
    } catch {
      return 'Africa/Lagos'
    }
  })
  const [recordingPolicy, setRecordingPolicy] = useState<RecordingPolicy>('MANDATORY')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [serverError, setServerError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Pre-populate invited participants from active engagement members
  useEffect(() => {
    if (engagementMembers.length > 0) {
      setSelectedUserIds(engagementMembers.map((m) => m.userId))
    }
  }, [engagementMembers])

  // Focus trap & Escape listener
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

  const handleToggleParticipant = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)
    setValidationError(null)

    if (!title.trim()) {
      setValidationError(t('communication.valTitleRequired', 'Meeting title is required.'))
      return
    }
    if (!agenda.trim()) {
      setValidationError(t('communication.valAgendaRequired', 'Agenda is required.'))
      return
    }
    if (!scheduledDate) {
      setValidationError(t('communication.valDateRequired', 'Scheduled date is required.'))
      return
    }
    if (selectedUserIds.length === 0) {
      setValidationError(
        t('communication.valParticipantsRequired', 'At least one participant must be invited.')
      )
      return
    }
    if (!activeEngagement) {
      setValidationError(
        t('communication.valEngagementRequired', 'An active engagement must be selected.')
      )
      return
    }

    const payload: ScheduleMeetingPayload = {
      title: title.trim(),
      agenda: agenda.trim(),
      meetingType,
      scheduledDate,
      startTime,
      durationMinutes,
      timezone,
      engagementId: activeEngagement.id,
      participantUserIds: selectedUserIds,
      recordingPolicy,
    }

    try {
      await onScheduleMeeting(payload)
      onClose()
    } catch (err: unknown) {
      if (err instanceof AppApiError && (err.status === 404 || err.status === 501)) {
        setServerError(
          t(
            'communication.schedulingEndpointPending',
            'Backend meeting scheduling endpoint POST /api/v1/communication/meetings has not been deployed. Real meeting invitations and calendar events cannot be dispatched until backend support is completed.'
          )
        )
      } else if (err instanceof Error) {
        setServerError(err.message)
      } else {
        setServerError(t('errors.generic', 'Unable to schedule meeting.'))
      }
    }
  }

  return (
    <div className="sched-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="sched-modal-box"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sched-modal-header">
          <div className="sched-modal-title-group">
            <h2 id="schedule-modal-title" className="sched-modal-title">
              {t('communication.scheduleAuditMeeting')}
            </h2>
            <span className="sched-modal-subtitle">
              {activeEngagement
                ? `${activeEngagement.clientOrganizationName} (FY${activeEngagement.fiscalYear})`
                : t('communication.auditEngagement')}
            </span>
          </div>
          <button
            type="button"
            className="sched-modal-close"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="sched-modal-form">
          {validationError && (
            <div className="sched-error-banner" role="alert">
              <AlertCircle size={15} aria-hidden="true" />
              <span>{validationError}</span>
            </div>
          )}

          {serverError && (
            <div className="sched-warning-banner" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <div>
                <strong>{t('communication.backendPendingNotice')}</strong>
                <p>{serverError}</p>
              </div>
            </div>
          )}

          {/* Title & Meeting Type */}
          <div className="sched-form-grid">
            <div className="sched-form-field full-width">
              <label htmlFor="sched-title" className="sched-label">
                {t('communication.meetingTitle')} <span className="req">*</span>
              </label>
              <input
                id="sched-title"
                type="text"
                className="sched-input"
                placeholder={t('communication.meetingTitlePlaceholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="sched-form-field">
              <label htmlFor="sched-type" className="sched-label">
                {t('communication.meetingType')}
              </label>
              <select
                id="sched-type"
                className="sched-select"
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value as MeetingType)}
              >
                <option value="PLANNING">{t('communication.typePlanning')}</option>
                <option value="WALKTHROUGH">{t('communication.typeWalkthrough')}</option>
                <option value="INTERIM_REVIEW">{t('communication.typeInterimReview')}</option>
                <option value="EVIDENCE_INSPECTION">{t('communication.typeEvidenceInspection')}</option>
                <option value="CLOSING_MEETING">{t('communication.typeClosingMeeting')}</option>
                <option value="STATUS_UPDATE">{t('communication.typeStatusUpdate')}</option>
              </select>
            </div>

            <div className="sched-form-field">
              <label htmlFor="sched-duration" className="sched-label">
                {t('communication.duration')}
              </label>
              <select
                id="sched-duration"
                className="sched-select"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
              >
                <option value={15}>15 {t('communication.minutes')}</option>
                <option value={30}>30 {t('communication.minutes')}</option>
                <option value={45}>45 {t('communication.minutes')}</option>
                <option value={60}>60 {t('communication.minutes')}</option>
                <option value={90}>90 {t('communication.minutes')}</option>
                <option value={120}>120 {t('communication.minutes')}</option>
              </select>
            </div>

            <div className="sched-form-field">
              <label htmlFor="sched-date" className="sched-label">
                {t('communication.date')} <span className="req">*</span>
              </label>
              <input
                id="sched-date"
                type="date"
                className="sched-input"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
              />
            </div>

            <div className="sched-form-field">
              <label htmlFor="sched-time" className="sched-label">
                {t('communication.startTime')} <span className="req">*</span>
              </label>
              <input
                id="sched-time"
                type="time"
                className="sched-input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Timezone Indicator */}
          <div className="sched-tz-banner">
            <Globe size={14} aria-hidden="true" />
            <span>
              {t('communication.detectedTimezone')}: <strong>{timezone}</strong> (UTC+1)
            </span>
          </div>

          {/* Agenda */}
          <div className="sched-form-field">
            <label htmlFor="sched-agenda" className="sched-label">
              {t('communication.agenda')} <span className="req">*</span>
            </label>
            <textarea
              id="sched-agenda"
              className="sched-textarea"
              rows={3}
              placeholder={t('communication.agendaPlaceholder')}
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              required
            />
          </div>

          {/* Recording Policy Selector */}
          <div className="sched-recording-policy-section">
            <label className="sched-label">
              <Video size={14} aria-hidden="true" />
              <span>{t('communication.recordingGovernancePolicy')}</span>
            </label>
            <div className="sched-policy-options">
              <label className="sched-policy-radio">
                <input
                  type="radio"
                  name="recordingPolicy"
                  value="MANDATORY"
                  checked={recordingPolicy === 'MANDATORY'}
                  onChange={() => setRecordingPolicy('MANDATORY')}
                />
                <div className="sched-radio-text">
                  <strong>{t('communication.policyMandatory')}</strong>
                  <span>{t('communication.policyMandatoryDesc')}</span>
                </div>
              </label>

              <label className="sched-policy-radio">
                <input
                  type="radio"
                  name="recordingPolicy"
                  value="OPTIONAL"
                  checked={recordingPolicy === 'OPTIONAL'}
                  onChange={() => setRecordingPolicy('OPTIONAL')}
                />
                <div className="sched-radio-text">
                  <strong>{t('communication.policyOptional')}</strong>
                  <span>{t('communication.policyOptionalDesc')}</span>
                </div>
              </label>

              <label className="sched-policy-radio">
                <input
                  type="radio"
                  name="recordingPolicy"
                  value="NONE"
                  checked={recordingPolicy === 'NONE'}
                  onChange={() => setRecordingPolicy('NONE')}
                />
                <div className="sched-radio-text">
                  <strong>{t('communication.policyNone')}</strong>
                  <span>{t('communication.policyNoneDesc')}</span>
                </div>
              </label>
            </div>

            {/* Mandatory Recording Consent Notice */}
            {recordingPolicy === 'MANDATORY' && (
              <div className="sched-mandatory-consent-box" role="note">
                <ShieldAlert size={16} className="sched-consent-icon" aria-hidden="true" />
                <div className="sched-consent-content">
                  <strong>{t('communication.mandatoryConsentNoticeTitle')}</strong>
                  <p>{t('communication.mandatoryConsentNoticeText')}</p>
                </div>
              </div>
            )}
          </div>

          {/* Invited Participants Multi-Select */}
          <div className="sched-participants-section">
            <div className="sched-participants-header">
              <label className="sched-label">
                <Users size={14} aria-hidden="true" />
                <span>{t('communication.invitedParticipants')}</span> <span className="req">*</span>
              </label>
              <span className="sched-participants-count">
                {selectedUserIds.length} {t('communication.selected')}
              </span>
            </div>

            <div className="sched-participants-list" role="group" aria-label={t('communication.invitedParticipants')}>
              {engagementMembers.map((member) => {
                const isChecked = selectedUserIds.includes(member.userId)
                return (
                  <label key={member.id} className="sched-participant-item">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleParticipant(member.userId)}
                    />
                    <div className="sched-participant-info">
                      <span className="sched-participant-name">{member.fullName}</span>
                      <span className="sched-participant-email">
                        {member.email} • {formatUserRole(member.role, t)}
                      </span>
                    </div>
                  </label>
                )
              })}
              {engagementMembers.length === 0 && (
                <p className="sched-participants-empty">{t('communication.noMembersToInvite')}</p>
              )}
            </div>
          </div>

          {/* Modal Footer Controls */}
          <footer className="sched-modal-footer">
            <button
              type="button"
              className="btn btn-outline btn-md"
              onClick={onClose}
              disabled={isScheduling}
            >
              {t('common.close')}
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-md"
              disabled={isScheduling}
            >
              {isScheduling ? (
                <>
                  <Loader2 size={16} className="spin" aria-hidden="true" />
                  <span>{t('common.processing')}</span>
                </>
              ) : (
                <>
                  <Calendar size={16} aria-hidden="true" />
                  <span>{t('communication.confirmScheduleMeeting')}</span>
                </>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
