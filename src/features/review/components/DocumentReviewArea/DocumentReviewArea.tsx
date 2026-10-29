import React, { useState } from 'react'
import {
  FileText,
  Eye,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  AlertCircle,
  Clock,
  User,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatBytes } from '@/features/documents/utils/validation'
import { formatDate } from '@/utils/dateUtils'
import { documentService } from '@/features/documents/services/documentService'
import { useDocumentVersions } from '@/features/documents/hooks/useDocuments'
import { DocumentVersionHistory } from '@/features/documents/components/DocumentVersionHistory/DocumentVersionHistory'
import type { AuditDocument } from '@/features/documents/types'

export interface DocumentReviewAreaProps {
  readonly documents?: readonly AuditDocument[]
  readonly fallbackDocumentId?: string
  readonly fallbackDocumentName?: string
  readonly onOpenPreview: (doc: AuditDocument) => void
}

export const DocumentReviewArea: React.FC<DocumentReviewAreaProps> = ({
  documents = [],
  fallbackDocumentId,
  fallbackDocumentName,
  onOpenPreview,
}) => {
  const { t } = useTranslation()
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [activeDocIndex, setActiveDocIndex] = useState(0)

  // Consolidate documents list: either explicit documents array or fallback single document
  const effectiveDocs: readonly AuditDocument[] = React.useMemo(() => {
    if (documents && documents.length > 0) {
      return documents
    }
    if (fallbackDocumentId) {
      return [
        {
          id: fallbackDocumentId,
          engagementId: '',
          fileName: fallbackDocumentName || 'attached_evidence.pdf',
          originalFileName: fallbackDocumentName || 'attached_evidence.pdf',
          fileSizeBytes: 0,
          mimeType: 'application/pdf',
          uploadedByUserId: 'usr-client',
          uploadedByUserName: 'Accounting Team Member',
          createdAt: '',
          version: 1,
          status: 'ACTIVE',
          classification: 'OTHER',
        },
      ]
    }
    return []
  }, [documents, fallbackDocumentId, fallbackDocumentName])

  const activeDoc = effectiveDocs[activeDocIndex]
  const { data: documentVersions = [] } = useDocumentVersions(activeDoc?.id)

  const versionDocs: readonly AuditDocument[] = React.useMemo(() => {
    if (documentVersions && documentVersions.length > 0) {
      return documentVersions.map((v) => ({
        id: v.id,
        engagementId: activeDoc?.engagementId || '',
        fileName: v.fileName,
        originalFileName: v.originalFileName,
        fileSizeBytes: v.fileSizeBytes,
        mimeType: v.mimeType,
        classification: v.classification,
        uploadedByUserId: '',
        uploadedByUserName: v.uploadedByUserName,
        createdAt: v.uploadedAt,
        version: v.version,
        status: v.status,
        rejectionReason: v.rejectionReason,
        reviewNotes: v.reviewNotes,
        reviewerName: v.reviewerName,
        reviewedAt: v.reviewedAt,
        comment: v.comment,
      }))
    }
    return activeDoc ? [activeDoc] : []
  }, [documentVersions, activeDoc])


  const handleDownload = async (docId: string) => {
    try {
      setDownloadLoading(true)
      setDownloadError(null)
      const res = await documentService.getDownloadUrl(docId)
      if (res.data?.downloadUrl) {
        window.open(res.data.downloadUrl, '_blank', 'noopener,noreferrer')
      } else {
        setDownloadError(t('documents.downloadError', 'Unable to retrieve authorized download link.'))
      }
    } catch {
      setDownloadError(t('documents.downloadError', 'Failed to initialize download. Please try again.'))
    } finally {
      setDownloadLoading(false)
    }
  }

  const handleNextDoc = () => {
    if (activeDocIndex < effectiveDocs.length - 1) {
      setActiveDocIndex((prev) => prev + 1)
    }
  }

  const handlePrevDoc = () => {
    if (activeDocIndex > 0) {
      setActiveDocIndex((prev) => prev - 1)
    }
  }

  if (effectiveDocs.length === 0) {
    return (
      <section className="review-section-card" aria-labelledby="documents-review-heading">
        <div className="review-section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <FileText size={18} style={{ color: 'var(--color-primary-600)' }} aria-hidden="true" />
            <h2 id="documents-review-heading" className="review-section-title">
              {t('review.documentsUnderReview', 'Documents Under Review')}
            </h2>
          </div>
        </div>
        <div className="review-empty-docs" role="status">
          <FileText size={32} style={{ color: 'var(--color-slate-400)', marginBottom: 'var(--spacing-2)' }} aria-hidden="true" />
          <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            {t('review.noDocumentsSubmitted', 'No documents have been submitted for this request yet.')}
          </p>
        </div>
      </section>
    )
  }

  const fileExtension = activeDoc.fileName.split('.').pop()?.toUpperCase() || 'FILE'

  return (
    <section className="review-section-card" aria-labelledby="documents-review-heading">
      <div className="review-section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <FileCheck size={18} style={{ color: 'var(--color-primary-600)' }} aria-hidden="true" />
          <h2 id="documents-review-heading" className="review-section-title">
            {t('review.documentsUnderReview', 'Documents Under Review')}
          </h2>
          <span className="review-badge-count">
            {effectiveDocs.length}
          </span>
        </div>

        {effectiveDocs.length > 1 && (
          <div className="review-file-nav" aria-label={t('review.fileNavigation', 'File Navigation')}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginRight: 'var(--spacing-2)' }}>
              {t('review.fileOf', 'File {{current}} of {{total}}', {
                current: activeDocIndex + 1,
                total: effectiveDocs.length,
              })}
            </span>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handlePrevDoc}
              disabled={activeDocIndex === 0}
              aria-label={t('review.prevFile', 'Previous File')}
              style={{ padding: '4px' }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleNextDoc}
              disabled={activeDocIndex === effectiveDocs.length - 1}
              aria-label={t('review.nextFile', 'Next File')}
              style={{ padding: '4px' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Multi-file selector tabs */}
      {effectiveDocs.length > 1 && (
        <div className="review-file-tabs" role="tablist" aria-label={t('review.submittedFiles', 'Submitted Files')}>
          {effectiveDocs.map((doc, idx) => (
            <button
              key={doc.id || idx}
              type="button"
              role="tab"
              aria-selected={idx === activeDocIndex}
              className={`review-file-tab ${idx === activeDocIndex ? 'active' : ''}`}
              onClick={() => setActiveDocIndex(idx)}
            >
              <FileText size={14} aria-hidden="true" />
              <span className="review-file-tab-name" title={doc.fileName}>{doc.fileName}</span>
            </button>
          ))}
        </div>
      )}

      {/* Active Document Card */}
      <div className="review-active-doc-card">
        <div className="review-doc-info">
          <div className="review-doc-icon-wrapper" aria-hidden="true">
            <span className="review-doc-ext-pill">{fileExtension}</span>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
              <h3 className="review-doc-title" title={activeDoc.fileName}>
                {activeDoc.fileName}
              </h3>
              <span className="review-version-pill">
                {t('review.currentVersionBadge', 'Current submission under review')}
              </span>
            </div>

            <div className="review-doc-meta-row">
              {activeDoc.fileSizeBytes > 0 && (
                <span>{formatBytes(activeDoc.fileSizeBytes)}</span>
              )}
              {activeDoc.uploadedByUserName && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <User size={12} aria-hidden="true" style={{ color: 'var(--color-slate-400)' }} />
                  {activeDoc.uploadedByUserName}
                </span>
              )}
              {activeDoc.createdAt && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} aria-hidden="true" style={{ color: 'var(--color-slate-400)' }} />
                  {formatDate(activeDoc.createdAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="review-doc-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onOpenPreview(activeDoc)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Eye size={14} aria-hidden="true" />
            <span>{t('documents.preview', 'Preview')}</span>
          </button>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => handleDownload(activeDoc.id)}
            disabled={downloadLoading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            {downloadLoading ? (
              <Loader2 size={14} className="spin-animation" aria-hidden="true" />
            ) : (
              <Download size={14} aria-hidden="true" />
            )}
            <span>{t('documents.download', 'Download')}</span>
          </button>
        </div>
      </div>

      {downloadError && (
        <div className="review-error-banner" role="alert">
          <AlertCircle size={16} />
          <span>{downloadError}</span>
        </div>
      )}

      {/* Embedded Document Version History */}
      {activeDoc.id && (
        <div style={{ marginTop: 'var(--spacing-6)' }}>
          <h4 style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 'var(--spacing-3)' }}>
            {t('documents.versionHistoryTitle', 'Permanent Document Version History')}
          </h4>
          <DocumentVersionHistory
            documents={versionDocs}
            onPreviewDocument={onOpenPreview}
          />
        </div>
      )}
    </section>
  )
}
