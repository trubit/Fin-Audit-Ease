import React from 'react'
import { History, ShieldCheck, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuditTrail } from '@/features/auditTrail/hooks/useAuditTrail'
import { formatDate } from '@/utils/dateUtils'
import './CommunicationAuditEvents.css'

export interface CommunicationAuditEventsProps {
  readonly engagementId?: string
}

export const CommunicationAuditEvents: React.FC<CommunicationAuditEventsProps> = ({
  engagementId,
}) => {
  const { t } = useTranslation()
  const { data: auditResponse, isLoading } = useAuditTrail(
    engagementId ? { engagementId } : undefined
  )

  const records = auditResponse?.data || []

  // Filter for communication, meeting, and recording events
  const communicationEvents = records.filter((r) => {
    const act = (r.action || '').toUpperCase()
    return (
      act.includes('MEETING') ||
      act.includes('RECORDING') ||
      act.includes('CONSENT') ||
      act.includes('COMMUNICATION') ||
      act.includes('CHAT') ||
      act.includes('MESSAGE')
    )
  })

  return (
    <div className="comm-audit-container" role="region" aria-label={t('communication.auditEventsTrail')}>
      {/* Audit Integration Notice Header */}
      <div className="comm-audit-banner">
        <ShieldCheck size={18} className="comm-audit-shield" aria-hidden="true" />
        <div className="comm-audit-banner-text">
          <strong>{t('communication.auditTrailIntegrationTitle')}</strong>
          <p>{t('communication.auditTrailIntegrationDesc')}</p>
        </div>
      </div>

      <div className="comm-audit-body">
        {isLoading ? (
          <div className="comm-audit-loading">
            <span>{t('common.processing')}</span>
          </div>
        ) : communicationEvents.length > 0 ? (
          <div className="comm-audit-list">
            {communicationEvents.map((event) => (
              <div key={event.id} className="comm-audit-item">
                <div className="comm-audit-icon-col">
                  <div className="comm-audit-icon-wrapper">
                    <History size={14} aria-hidden="true" />
                  </div>
                </div>
                <div className="comm-audit-content">
                  <div className="comm-audit-header-row">
                    <span className="comm-audit-action">{event.action}</span>
                    <time className="comm-audit-time" dateTime={event.timestamp}>
                      {formatDate(event.timestamp)}
                    </time>
                  </div>
                  <p className="comm-audit-desc">{event.description || event.action}</p>
                  <div className="comm-audit-meta">
                    <span className="comm-audit-actor">
                      <User size={12} aria-hidden="true" />
                      {event.actorName} {event.actorRole ? `(${event.actorRole})` : ''}
                    </span>
                    {event.hash && (
                      <span className="comm-audit-hash">
                        Hash: {event.hash.substring(0, 10)}...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Honest Empty State */
          <div className="comm-audit-empty">
            <History size={32} className="comm-audit-empty-icon" aria-hidden="true" />
            <h3 className="comm-audit-empty-title">{t('communication.noAuditEventsYet')}</h3>
            <p className="comm-audit-empty-desc">
              {t('communication.noAuditEventsDesc')}
            </p>
            <div className="comm-audit-contract-spec">
              <strong>{t('communication.registeredAuditContracts')}:</strong>
              <ul>
                <li><code>MEETING_SCHEDULED</code> • <code>MEETING_RESCHEDULED</code> • <code>MEETING_CANCELLED</code></li>
                <li><code>RECORDING_CONSENT_GRANTED</code> • <code>RECORDING_CONSENT_DECLINED</code></li>
                <li><code>RECORDING_STARTED</code> • <code>RECORDING_PROCESSING_COMPLETED</code></li>
                <li><code>RECORDING_ACCESSED</code> • <code>RECORDING_DOWNLOADED</code></li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
