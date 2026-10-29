import React from 'react'
import { History, Download, AlertTriangle, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { AuditDocument } from '../../types'
import { formatBytes } from '../../utils/validation'
import { formatDateTime } from '@/utils/dateUtils'
import { Badge } from '@/components/common/Badge/Badge'
import { useToast } from '@/components/feedback/Toast'
import { documentService } from '../../services/documentService'
import './DocumentVersionHistory.css'

export interface DocumentVersionHistoryProps {
  readonly documents: readonly AuditDocument[]
  readonly onPreviewDocument?: (doc: AuditDocument) => void
}

export const DocumentVersionHistory: React.FC<DocumentVersionHistoryProps> = ({
  documents,
  onPreviewDocument,
}) => {
  const { t } = useTranslation()
  const { showToast } = useToast()

  if (documents.length === 0) {
    return (
      <div className="version-history-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
          <History size={16} />
          <span>{t('documents.noVersions', 'No version history is available yet.')}</span>
        </div>
      </div>
    )
  }

  // Sort versions descending: latest version first, historical versions preserved below (Section 22)
  const sortedDocuments = [...documents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const handleDownload = async (docId: string, fileName: string) => {
    try {
      const response = await documentService.getDownloadUrl(docId)
      if (response.data?.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank', 'noopener,noreferrer')
      }
    } catch {
      showToast({
        type: 'error',
        title: t('common.error', 'Error'),
        message: t('documents.downloadError', `Unable to download ${fileName} at this time.`),
      })
    }
  }

  return (
    <div className="version-history-container" aria-label="Document Version History">
      <div className="version-history-card">
        <div className="version-history-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <History size={18} className="text-primary" aria-hidden="true" />
            <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-slate-900)', margin: 0 }}>
              {t('documents.versionHistoryTitle', 'Permanent Document Version History')} ({documents.length})
            </h3>
          </div>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Immutable Audit Trail
          </span>
        </div>

        <div className="version-timeline-list" role="feed" aria-label="Version history timeline">
          {sortedDocuments.map((doc, idx) => {
            const versionNumber = doc.version || sortedDocuments.length - idx
            const isLatest = idx === 0
            const isRejected = doc.status === 'REJECTED' || Boolean(doc.rejectionReason)
            const isApproved = doc.status === 'APPROVED'

            return (
              <article
                key={doc.id}
                className={`version-timeline-item ${isLatest ? 'is-current' : ''} ${isRejected ? 'is-rejected' : ''}`}
                aria-labelledby={`version-title-${doc.id}`}
              >
                <div
                  className={`version-timeline-dot ${isRejected ? 'is-rejected' : isApproved ? 'is-approved' : ''}`}
                  aria-hidden="true"
                />

                <div className="version-item-header">
                  <div className="version-item-title" id={`version-title-${doc.id}`}>
                    <FileText size={16} aria-hidden="true" />
                    <span>Version {versionNumber}</span>
                    {isLatest && <Badge variant="info">{t('documents.currentSubmission', 'Current Submission')}</Badge>}
                    {isRejected && <Badge variant="danger">{t('documents.statusRejected', 'Rejected')}</Badge>}
                    {isApproved && <Badge variant="success">{t('documents.statusApproved', 'Approved')}</Badge>}
                    {!isRejected && !isApproved && <Badge variant="neutral">{doc.classification}</Badge>}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                    {onPreviewDocument && (
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={() => onPreviewDocument(doc)}
                      >
                        <span>{t('common.preview', 'Preview')}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-outline btn-xs"
                      onClick={() => void handleDownload(doc.id, doc.originalFileName || doc.fileName)}
                      aria-label={`Download Version ${versionNumber}`}
                    >
                      <Download size={12} aria-hidden="true" />
                      <span>{t('documents.download', 'Download')}</span>
                    </button>
                  </div>
                </div>

                <div className="version-item-meta">
                  <div>
                    <span>{t('documents.fileLabel', 'File:')} </span>
                    <strong style={{ color: 'var(--color-slate-900)' }}>{doc.originalFileName || doc.fileName}</strong>
                  </div>
                  <div>
                    <span>{t('documents.sizeLabel', 'Size:')} </span>
                    <strong>{formatBytes(doc.fileSizeBytes)}</strong>
                  </div>
                  <div>
                    <span>{t('documents.uploadedByLabel', 'Uploaded By:')} </span>
                    <strong>{doc.uploadedByUserName || 'Accounting Team'}</strong>
                  </div>
                  <div>
                    <span>{t('documents.dateLabel', 'Date:')} </span>
                    <strong>{formatDateTime(doc.createdAt)}</strong>
                  </div>
                </div>

                {/* Rejection Details & Reason (Section 20 & 22) */}
                {isRejected && (
                  <div className="version-rejection-box" role="note">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, marginBottom: '2px' }}>
                      <AlertTriangle size={14} style={{ color: 'var(--color-rose-600)' }} />
                      <span>{t('documents.rejectionReasonLabel', 'Auditor Rejection Reason:')}</span>
                    </div>
                    <p style={{ margin: 0 }}>
                      {doc.rejectionReason || doc.reviewNotes || 'Corrections were requested for this submission version.'}
                    </p>
                    {doc.reviewerName && (
                      <span style={{ display: 'block', marginTop: '4px', color: 'var(--color-rose-700)', fontSize: '11px' }}>
                        Reviewed by {doc.reviewerName}
                      </span>
                    )}
                  </div>
                )}

                {/* Submitter Comment if provided */}
                {doc.comment && (
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-slate-700)', fontStyle: 'italic', marginTop: '2px' }}>
                    Notes: "{doc.comment}"
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
