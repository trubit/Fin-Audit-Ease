import React, { useState, useRef, useId, useEffect } from 'react'
import {
  UploadCloud,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Trash2,
  Upload,
  Video,
  Image as ImageIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { validateUploadFile, formatBytes } from '../../utils/validation'
import type { DocumentClassification, FileUploadQueueItem } from '../../types'
import { Badge } from '@/components/common/Badge/Badge'
import './FileUploadZone.css'

export interface FileUploadZoneProps {
  readonly engagementId: string
  readonly auditRequestId?: string
  readonly defaultClassification?: DocumentClassification
  readonly onUploadComplete?: () => void
  readonly onUpload: (
    file: File,
    meta: {
      engagementId: string
      auditRequestId?: string
      classification?: DocumentClassification
      comment?: string
    },
    options?: { signal?: AbortSignal }
  ) => Promise<unknown>
  readonly isUploading?: boolean
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  engagementId,
  auditRequestId,
  defaultClassification = 'OTHER',
  onUploadComplete,
  onUpload,
  isUploading = false,
}) => {
  const { t } = useTranslation()
  const inputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const [isDragOver, setIsDragOver] = useState(false)
  const [stagedFiles, setStagedFiles] = useState<FileUploadQueueItem[]>([])
  const [classification, setClassification] = useState<DocumentClassification>(defaultClassification)
  const [comment, setComment] = useState('')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [activeUploadIndex, setActiveUploadIndex] = useState<number | null>(null)

  // Abort pending uploads on component unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const processFiles = (files: FileList | File[]) => {
    setUploadError(null)
    setUploadSuccess(null)

    const newItems: FileUploadQueueItem[] = Array.from(files).map((file) => {
      const validation = validateUploadFile(file)
      return {
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        name: file.name,
        size: file.size,
        mimeType: file.type,
        isValid: validation.isValid,
        errorMessage: validation.errorMessage,
        status: 'READY' as const,
      }
    })

    setStagedFiles((prev) => [...prev, ...newItems])
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }

  const handleRemoveItem = (id: string) => {
    setStagedFiles((prev) => prev.filter((item) => item.id !== id))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClearAll = () => {
    setStagedFiles([])
    setUploadError(null)
    setUploadSuccess(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }

  const validFiles = stagedFiles.filter((item) => item.isValid)
  const hasInvalidFiles = stagedFiles.some((item) => !item.isValid)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validFiles.length === 0 || !engagementId || isUploading) return

    setUploadError(null)
    setUploadSuccess(null)

    const controller = new AbortController()
    abortControllerRef.current = controller

    let uploadedCount = 0

    try {
      for (let i = 0; i < validFiles.length; i++) {
        setActiveUploadIndex(i + 1)
        const currentItem = validFiles[i]

        await onUpload(
          currentItem.file,
          {
            engagementId,
            auditRequestId,
            classification,
            comment: comment.trim() || undefined,
          },
          { signal: controller.signal }
        )
        uploadedCount++
      }

      setUploadSuccess(
        uploadedCount === 1
          ? t('documents.uploadSuccess', 'Document uploaded successfully.')
          : t('documents.multipleUploadSuccess', { count: uploadedCount })
      )
      setStagedFiles([])
      setComment('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onUploadComplete?.()
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setUploadError(t('documents.uploadCancelled'))
      } else if (err instanceof Error) {
        setUploadError(err.message)
      } else {
        setUploadError(t('documents.uploadFailed'))
      }
    } finally {
      setActiveUploadIndex(null)
      abortControllerRef.current = null
    }
  }

  return (
    <div className="file-upload-zone-wrapper">
      {/* Hidden Multi-file Input */}
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        multiple
        accept=".pdf,.xlsx,.xls,.docx,.doc,.csv,.txt,.jpg,.jpeg,.png,.webp,.svg,.mp4,.mov,.webm"
        onChange={handleInputChange}
        style={{ display: 'none' }}
        disabled={isUploading}
      />

      {/* Drag & Drop Surface with Accessible Button (Section 7) */}
      <div
        className={`dropzone-surface ${isDragOver ? 'is-dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            fileInputRef.current?.click()
          }
        }}
        aria-label={t('documents.uploadAreaAria')}
      >
        <div className="dropzone-icon-container" aria-hidden="true">
          <UploadCloud size={36} />
        </div>

        <p className="dropzone-primary-text">
          <span className="dropzone-action-text">{t('documents.chooseFile', 'Choose files')}</span>{' '}
          {t('documents.orDragDrop', 'or drag and drop them here')}
        </p>

        {/* Accessible Alternative Button */}
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={(e) => {
            e.stopPropagation()
            fileInputRef.current?.click()
          }}
          disabled={isUploading}
          style={{ marginTop: 'var(--spacing-1)' }}
        >
          {t('documents.chooseFileBtn', 'Browse Files')}
        </button>

        <p className="dropzone-hint">
          {t(
            'documents.fileRequirementsHint',
            'Supported formats: PDF, Excel, Word, CSV, Images (JPEG, PNG, WEBP, SVG), and Videos (MP4, MOV, WEBM) — Maximum 25MB per file'
          )}
        </p>
      </div>

      {/* Server / Network Upload Error Banner */}
      {uploadError && (
        <div className="upload-alert upload-alert-error" role="alert">
          <AlertCircle size={16} aria-hidden="true" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Success Notification */}
      {uploadSuccess && (
        <div className="upload-alert upload-alert-success" role="status">
          <CheckCircle2 size={16} aria-hidden="true" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Staged Multiple Files List (Section 8) */}
      {stagedFiles.length > 0 && (
        <form onSubmit={handleSubmit} className="staged-files-container" noValidate>
          <div className="staged-files-header">
            <h3 className="staged-files-title">
              {t('documents.selectedFilesValid', { valid: validFiles.length, total: stagedFiles.length })}
            </h3>
            {!isUploading && (
              <button
                type="button"
                className="btn btn-outline btn-xs"
                onClick={handleClearAll}
                aria-label={t('documents.clearAllLabel')}
              >
                {t('documents.clearAll')}
              </button>
            )}
          </div>

          <div className="staged-file-list" aria-label={t('documents.stagedListLabel')}>
            {stagedFiles.map((item) => {
              const isVideo = /\.(mp4|mov|webm)$/i.test(item.name)
              const isImage = /\.(jpg|jpeg|png|webp|svg)$/i.test(item.name)

              return (
                <div
                  key={item.id}
                  className={`staged-file-item ${!item.isValid ? 'is-invalid' : ''}`}
                >
                  <div className="staged-file-meta">
                    {isVideo ? (
                      <Video size={18} className="staged-file-icon" aria-hidden="true" style={{ color: 'var(--color-primary-600)' }} />
                    ) : isImage ? (
                      <ImageIcon size={18} className="staged-file-icon" aria-hidden="true" style={{ color: 'var(--color-emerald-600)' }} />
                    ) : (
                      <FileText size={18} className="staged-file-icon" aria-hidden="true" />
                    )}
                    <span className="staged-file-name" title={item.name}>
                      {item.name}
                    </span>
                    <span className="staged-file-size">({formatBytes(item.size)})</span>
                  </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                  {item.isValid ? (
                    <Badge variant="success">{t('documents.readyBadge')}</Badge>
                  ) : (
                    <span className="staged-file-error">{item.errorMessage}</span>
                  )}

                  {!isUploading && (
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => handleRemoveItem(item.id)}
                      aria-label={t('documents.removeFile', { name: item.name })}
                      style={{ padding: '2px', color: 'var(--color-slate-400)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            )})}
          </div>

          {/* Invalid File Warning */}
          {hasInvalidFiles && (
            <div className="upload-alert upload-alert-error" role="alert">
              <AlertCircle size={14} aria-hidden="true" />
              <span>{t('documents.invalidFilesNotice')}</span>
            </div>
          )}

          {/* Metadata: Classification & Optional Comment */}
          <div className="upload-fields-grid">
            <div className="form-group">
              <label htmlFor={`${inputId}-class`} className="form-label">
                {t('documents.classificationLabel', 'Classification')}
              </label>
              <select
                id={`${inputId}-class`}
                className="form-input"
                value={classification}
                onChange={(e) => setClassification(e.target.value as DocumentClassification)}
                disabled={isUploading}
              >
                <option value="BANK_STATEMENT">{t('documents.classBankStatement', 'Bank Statement')}</option>
                <option value="TRIAL_BALANCE">{t('documents.classTrialBalance', 'Trial Balance')}</option>
                <option value="GENERAL_LEDGER">{t('documents.classGeneralLedger', 'General Ledger')}</option>
                <option value="INVOICE">{t('documents.classInvoice', 'Invoices & Receipts')}</option>
                <option value="CONTRACT">{t('documents.classContract', 'Contract / Agreement')}</option>
                <option value="TAX_RETURN">{t('documents.classTaxReturn', 'Tax Return')}</option>
                <option value="RECONCILIATION_SCHEDULE">{t('documents.classReconciliation', 'Reconciliation Schedule')}</option>
                <option value="OTHER">{t('documents.classOther', 'Other Supporting Schedule')}</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor={`${inputId}-comment`} className="form-label">
                {t('documents.commentLabel', 'Submission Comment')} ({t('common.optional', 'Optional')})
              </label>
              <input
                id={`${inputId}-comment`}
                type="text"
                className="form-input"
                placeholder={t('documents.commentPlaceholder', 'Add schedule references or contextual notes for the auditor...')}
                value={comment}
                maxLength={300}
                onChange={(e) => setComment(e.target.value)}
                disabled={isUploading}
              />
            </div>
          </div>

          {/* Actions & Progress (Section 10 & 11) */}
          <div className="upload-actions-row">
            {isUploading ? (
              <button
                type="button"
                className="btn btn-outline btn-md"
                onClick={handleCancelUpload}
              >
                <span>{t('common.cancel')}</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-outline btn-md"
                onClick={handleClearAll}
              >
                <span>{t('common.cancel')}</span>
              </button>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-md"
              disabled={validFiles.length === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="spin-animation" aria-hidden="true" />
                  <span>
                    {activeUploadIndex
                      ? t('documents.uploadingProgress', { current: activeUploadIndex, total: validFiles.length })
                      : t('documents.uploading', 'Uploading document...')}
                  </span>
                </>
              ) : (
                <>
                  <Upload size={16} aria-hidden="true" />
                  <span>
                    {validFiles.length > 1
                      ? t('documents.uploadMultipleBtn', { count: validFiles.length })
                      : t('documents.submitUpload', 'Upload Document')}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
