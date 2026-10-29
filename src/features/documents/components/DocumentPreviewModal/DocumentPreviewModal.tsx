import React, { useState, useEffect, useCallback, useRef } from 'react'
import { X, Download, FileText, Lock, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { AuditDocument } from '../../types'
import { documentService } from '../../services/documentService'
import { formatBytes } from '../../utils/validation'
import { formatDateTime } from '@/utils/dateUtils'
import { Badge } from '@/components/common/Badge/Badge'
import { useToast } from '@/components/feedback/Toast'
import { trapFocus } from '@/utils/accessibility'
import './DocumentPreviewModal.css'

export interface DocumentPreviewModalProps {
  readonly isOpen: boolean
  readonly document: AuditDocument | null
  readonly onClose: () => void
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  document,
  onClose,
}) => {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  // Derive loading state during render to avoid cascading renders (React Compiler pure pattern)
  const isLoadingPreview = isOpen && Boolean(document) && !downloadUrl && !previewError

  const handleClose = useCallback(() => {
    setDownloadUrl(null)
    setPreviewError(null)
    onClose()
  }, [onClose])

  // Fetch download/preview URL securely via backend service
  const fetchSecureUrl = useCallback(async (docId: string): Promise<string | null> => {
    try {
      const response = await documentService.getDownloadUrl(docId)
      return response.data?.downloadUrl || null
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    if (!isOpen || !document) return

    let activeUrl: string | null = null

    fetchSecureUrl(document.id)
      .then((url) => {
        if (isMounted) {
          activeUrl = url
          setDownloadUrl(url)
        }
      })
      .catch(() => {
        if (isMounted) {
          setPreviewError('Unable to load preview at this time.')
        }
      })

    return () => {
      isMounted = false
      // Section 28: If blob/object URL was generated, revoke it to prevent memory leaks
      if (activeUrl && activeUrl.startsWith('blob:')) {
        URL.revokeObjectURL(activeUrl)
      }
    }
  }, [isOpen, document, fetchSecureUrl])

  // Focus close button on open for clean accessible entry
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Keyboard navigation: Escape key closes modal & focus is trapped inside
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      } else if (modalRef.current) {
        trapFocus(modalRef.current, e)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  if (!isOpen || !document) {
    return null
  }

  const isImage =
    document.mimeType?.startsWith('image/') ||
    ['.jpg', '.jpeg', '.png', '.webp', '.svg'].some((ext) =>
      (document.originalFileName || document.fileName).toLowerCase().endsWith(ext)
    )

  const isVideo =
    document.mimeType?.startsWith('video/') ||
    ['.mp4', '.mov', '.webm'].some((ext) =>
      (document.originalFileName || document.fileName).toLowerCase().endsWith(ext)
    )

  const isPdf =
    document.mimeType === 'application/pdf' ||
    (document.originalFileName || document.fileName).toLowerCase().endsWith('.pdf')

  const handleDownloadAction = async () => {
    setIsDownloading(true)
    try {
      const url = downloadUrl || (await fetchSecureUrl(document.id))
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer')
      } else {
        showToast({
          type: 'error',
          title: t('common.error', 'Error'),
          message: t('documents.downloadError', 'Unable to download file. Please try again.'),
        })
      }
    } catch {
      showToast({
        type: 'error',
        title: t('common.error', 'Error'),
        message: t('documents.downloadError', 'Unable to download file. Please try again.'),
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div
      className="doc-preview-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-preview-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div className="doc-preview-modal" ref={modalRef}>
        {/* Header */}
        <div className="doc-preview-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <FileText size={20} className="text-primary" aria-hidden="true" />
            <h2 id="doc-preview-modal-title" className="doc-preview-title">
              {document.originalFileName || document.fileName}
            </h2>
            {document.version && (
              <Badge variant="neutral">v{document.version}</Badge>
            )}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="btn btn-outline btn-xs"
            onClick={handleClose}
            aria-label={t('common.close', 'Close')}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="doc-preview-body">
          {/* Metadata Grid (Section 15) */}
          <div className="doc-preview-meta-grid" aria-label="Document Metadata">
            <div>
              <span className="doc-preview-meta-label">{t('documents.classificationLabel', 'Classification')}</span>
              <span className="doc-preview-meta-val">{document.classification}</span>
            </div>
            <div>
              <span className="doc-preview-meta-label">{t('documents.fileSize', 'File Size')}</span>
              <span className="doc-preview-meta-val">{formatBytes(document.fileSizeBytes)}</span>
            </div>
            <div>
              <span className="doc-preview-meta-label">{t('documents.uploadedBy', 'Uploaded By')}</span>
              <span className="doc-preview-meta-val">{document.uploadedByUserName || 'Accounting Member'}</span>
            </div>
            <div>
              <span className="doc-preview-meta-label">{t('documents.uploadDate', 'Upload Date')}</span>
              <span className="doc-preview-meta-val">{formatDateTime(document.createdAt)}</span>
            </div>
            {document.checksumSha256 && (
              <div style={{ gridColumn: '1 / -1' }}>
                <span className="doc-preview-meta-label">{t('documents.sha256Checksum', 'SHA-256 Checksum')}</span>
                <span className="doc-preview-meta-val" style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                  {document.checksumSha256}
                </span>
              </div>
            )}
          </div>

          {/* Document Content Viewer Container (Section 16 Safe Preview) */}
          <div className="doc-preview-viewer-container">
            {isLoadingPreview && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={28} className="spin-animation text-primary" aria-hidden="true" />
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  Loading secure document preview...
                </span>
              </div>
            )}

            {!isLoadingPreview && isImage && downloadUrl && (
              <img
                src={downloadUrl}
                alt={document.originalFileName || document.fileName}
                className="doc-preview-image"
              />
            )}

            {!isLoadingPreview && isVideo && downloadUrl && (
              <video
                controls
                className="doc-preview-video"
                style={{
                  maxWidth: '100%',
                  maxHeight: '400px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#000',
                }}
              >
                <source src={downloadUrl} type={document.mimeType || 'video/mp4'} />
                Your browser does not support HTML5 video playback.
              </video>
            )}

            {!isLoadingPreview && isPdf && downloadUrl && (
              <iframe
                src={`${downloadUrl}#toolbar=0`}
                title={document.originalFileName || document.fileName}
                className="doc-preview-iframe"
              />
            )}

            {!isLoadingPreview && (!downloadUrl || (!isImage && !isPdf && !isVideo)) && (
              <div className="doc-preview-unsupported-box">
                <FileText size={48} style={{ color: 'var(--color-slate-400)' }} aria-hidden="true" />
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-slate-800)', margin: 0 }}>
                    {previewError || 'Direct browser preview not supported for this spreadsheet or document format.'}
                  </h3>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Please use the secure download button below to inspect the original file.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="doc-preview-footer">
          {/* Section 19: Permanent Immutability Notice */}
          <div className="doc-immutability-notice">
            <Lock size={14} aria-hidden="true" />
            <span>{t('documents.permanentNotice', 'Uploaded documents remain part of the permanent engagement audit history.')}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={handleClose}>
              <span>{t('common.close', 'Close')}</span>
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleDownloadAction}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 size={14} className="spin-animation" aria-hidden="true" />
                  <span>{t('common.preparing', 'Preparing...')}</span>
                </>
              ) : (
                <>
                  <Download size={14} aria-hidden="true" />
                  <span>{t('documents.download', 'Download Document')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
