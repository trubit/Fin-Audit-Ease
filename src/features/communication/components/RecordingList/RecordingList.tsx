import React, { useState } from 'react'
import {
  Video,
  ShieldCheck,
  Clock,
  Download,
  Play,
  Lock,
  FileText,
  Search,
  Loader2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { MeetingRecording } from '../../types'
import { formatDate } from '@/utils/dateUtils'
import './RecordingList.css'

export interface RecordingListProps {
  readonly recordings: readonly MeetingRecording[]
  readonly isLoading: boolean
  readonly onOpenRecordingStream?: (recording: MeetingRecording) => void
  readonly currentUserId?: string
}

export const RecordingList: React.FC<RecordingListProps> = ({
  recordings,
  isLoading,
  onOpenRecordingStream,
  currentUserId,
}) => {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecording, setSelectedRecording] = useState<MeetingRecording | null>(null)

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`
  }

  const filtered = recordings.filter((r) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      r.meetingTitle.toLowerCase().includes(q) ||
      r.engagementTitle.toLowerCase().includes(q) ||
      (r.sha256Checksum && r.sha256Checksum.toLowerCase().includes(q))
    )
  })

  return (
    <div className="rec-list-container" role="region" aria-label={t('communication.recordingsArchive')}>
      {/* Retention & Integrity Governance Banner */}
      <div className="rec-retention-banner" role="note">
        <Lock size={16} className="rec-banner-icon" aria-hidden="true" />
        <div className="rec-banner-text">
          <strong>{t('communication.recordingEvidenceTitle')}</strong>:{' '}
          {t('communication.recordingEvidenceDescription')}
        </div>
      </div>

      {/* Search Bar */}
      <div className="rec-search-header">
        <div className="rec-search-input-wrapper">
          <Search size={14} className="rec-search-icon" aria-hidden="true" />
          <input
            type="search"
            className="rec-search-input"
            placeholder={t('communication.searchRecordingsPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={t('communication.searchRecordingsPlaceholder')}
          />
        </div>
      </div>

      {/* Main Recordings Body */}
      <div className="rec-list-body">
        {isLoading ? (
          <div className="rec-empty-state">
            <Loader2 size={24} className="spin" aria-hidden="true" />
            <p>{t('common.loading')}</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="rec-cards-grid">
            {filtered.map((rec) => {
              const isAuthorized =
                !rec.authorizedParticipantUserIds ||
                rec.authorizedParticipantUserIds.length === 0 ||
                (currentUserId ? rec.authorizedParticipantUserIds.includes(currentUserId) : true)

              return (
                <article key={rec.id} className="rec-card" aria-label={rec.meetingTitle}>
                  <header className="rec-card-header">
                    <div className="rec-card-icon-col">
                      <div className="rec-card-icon-wrapper">
                        <Video size={18} aria-hidden="true" />
                      </div>
                    </div>
                    <div className="rec-card-meta-col">
                      <h3 className="rec-card-title">{rec.meetingTitle}</h3>
                      <span className="rec-card-engagement">{rec.engagementTitle}</span>
                    </div>
                    <span className={`rec-status-badge is-${rec.processingStatus.toLowerCase()}`}>
                      {rec.processingStatus}
                    </span>
                  </header>

                  <div className="rec-card-body">
                    <div className="rec-detail-row">
                      <Clock size={13} aria-hidden="true" />
                      <span>{formatDate(rec.recordedAt)}</span>
                      <span className="rec-bullet">•</span>
                      <span>{formatDuration(rec.durationSeconds)}</span>
                    </div>

                    {rec.sha256Checksum && (
                      <div className="rec-checksum-box">
                        <span className="rec-checksum-label">SHA-256 {t('communication.checksum')}:</span>
                        <code className="rec-checksum-val">{rec.sha256Checksum}</code>
                      </div>
                    )}

                    <div className="rec-retention-info">
                      <span className="rec-retention-pill">
                        {t('communication.retentionUntil')} {formatDate(rec.retentionExpiresAt)}
                      </span>
                    </div>
                  </div>

                  <footer className="rec-card-footer">
                    {isAuthorized ? (
                      <div className="rec-actions-group">
                        {rec.streamUrl && (
                          <button
                            type="button"
                            className="btn btn-primary btn-xs rec-action-btn"
                            onClick={() => onOpenRecordingStream?.(rec)}
                          >
                            <Play size={13} aria-hidden="true" />
                            <span>{t('communication.playEvidence')}</span>
                          </button>
                        )}
                        {rec.downloadUrl && (
                          <a
                            href={rec.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-xs rec-action-btn"
                          >
                            <Download size={13} aria-hidden="true" />
                            <span>{t('documents.download')}</span>
                          </a>
                        )}
                        {rec.transcriptAvailable && (
                          <button
                            type="button"
                            className="btn btn-outline btn-xs rec-action-btn"
                            onClick={() => setSelectedRecording(rec)}
                          >
                            <FileText size={13} aria-hidden="true" />
                            <span>{t('communication.transcript')}</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="rec-restricted-notice">
                        <Lock size={13} aria-hidden="true" />
                        <span>{t('communication.restrictedAccess')}</span>
                      </div>
                    )}
                  </footer>
                </article>
              )
            })}
          </div>
        ) : (
          /* Honest Empty State */
          <div className="rec-empty-state">
            <ShieldCheck size={36} className="rec-empty-icon" aria-hidden="true" />
            <h3 className="rec-empty-title">{t('communication.noRecordingsTitle')}</h3>
            <p className="rec-empty-desc">{t('communication.noRecordingsDescription')}</p>
            <div className="rec-contract-box">
              <code>GET /api/v1/communication/recordings</code>
              <span>{t('communication.recordingsBackendContract')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Transcript Modal when selected */}
      {selectedRecording && (
        <div className="rec-modal-backdrop" onClick={() => setSelectedRecording(null)} role="presentation">
          <div
            className="rec-modal-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="transcript-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="rec-modal-header">
              <h3 id="transcript-modal-title" className="rec-modal-title">
                {t('communication.transcript')}: {selectedRecording.meetingTitle}
              </h3>
              <button
                type="button"
                className="rec-modal-close"
                onClick={() => setSelectedRecording(null)}
                aria-label={t('common.close')}
              >
                ×
              </button>
            </header>
            <div className="rec-modal-body">
              <p className="rec-transcript-text">
                {selectedRecording.transcriptText || t('communication.transcriptGenerating')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
