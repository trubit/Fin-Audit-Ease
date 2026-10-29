import React, { useState, useId } from 'react'
import { Download, Search, Eye, Lock, RotateCcw, Upload, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { Badge } from '@/components/common/Badge/Badge'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/feedback/EmptyState/EmptyState'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton/LoadingSkeleton'
import { PageError } from '@/components/feedback/PageError/PageError'
import { FileUploadZone } from '@/features/documents/components/FileUploadZone/FileUploadZone'
import { DocumentPreviewModal } from '@/features/documents/components/DocumentPreviewModal/DocumentPreviewModal'
import { ForwardFlowModal } from '@/features/checklists'
import { useEngagements } from '@/features/engagements/hooks/useEngagements'
import { useDocuments, useUploadDocument } from '@/features/documents/hooks/useDocuments'
import { documentService } from '@/features/documents/services/documentService'
import { useToast } from '@/components/feedback/Toast'
import { formatBytes } from '@/features/documents/utils/validation'
import { formatDate } from '@/utils/dateUtils'
import type { AuditDocument } from '@/features/documents/types'
import './DocumentsPage.css'

const DOCUMENTS_PAGE_SIZE = 10

export const DocumentsPage: React.FC = () => {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const engagementFilterId = useId()
  const classificationFilterId = useId()
  const searchInputId = useId()
  const uploadEngagementId = useId()

  const [filterEngagementId, setFilterEngagementId] = useState<string>('')
  const [filterClassification, setFilterClassification] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [selectedUploadEngagement, setSelectedUploadEngagement] = useState<string>('')
  const [previewDoc, setPreviewDoc] = useState<AuditDocument | null>(null)
  const [forwardDoc, setForwardDoc] = useState<AuditDocument | null>(null)

  const { data: engagements = [] } = useEngagements()

  const {
    data: documents = [],
    isLoading,
    isError,
    refetch,
  } = useDocuments(filterEngagementId ? { engagementId: filterEngagementId } : undefined)

  const uploadMutation = useUploadDocument()

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

  // Filtered documents
  const filteredDocuments = documents.filter((doc) => {
    if (filterClassification !== 'ALL' && doc.classification !== filterClassification) {
      return false
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const nameMatch = (doc.originalFileName || doc.fileName).toLowerCase().includes(q)
      const uploaderMatch = (doc.uploadedByUserName || '').toLowerCase().includes(q)
      return nameMatch || uploaderMatch
    }
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / DOCUMENTS_PAGE_SIZE))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const pagedDocuments = filteredDocuments.slice(
    (safeCurrentPage - 1) * DOCUMENTS_PAGE_SIZE,
    safeCurrentPage * DOCUMENTS_PAGE_SIZE
  )

  const isFiltered =
    filterEngagementId !== '' || filterClassification !== 'ALL' || searchQuery.trim().length > 0

  const resetFilters = () => {
    setFilterEngagementId('')
    setFilterClassification('ALL')
    setSearchQuery('')
    setCurrentPage(1)
  }

  const handleFilterEngagementChange = (val: string) => {
    setFilterEngagementId(val)
    setCurrentPage(1)
  }

  const handleFilterClassificationChange = (val: string) => {
    setFilterClassification(val)
    setCurrentPage(1)
  }

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  // Pre-select first engagement for upload if only one exists
  const effectiveUploadEngagement =
    selectedUploadEngagement || (engagements.length === 1 ? engagements[0].id : '')

  return (
    <PageContainer
      title={t('documents.title')}
      subtitle={t('documents.subtitle')}
      actions={
        <a
          href={`#${uploadEngagementId}`}
          className="btn btn-primary btn-md"
          onClick={(e) => {
            e.preventDefault()
            const el = document.getElementById(uploadEngagementId)
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' })
              el.focus()
            }
          }}
        >
          <Upload size={16} aria-hidden="true" />
          <span>{t('documents.submitUpload', 'Upload Evidentiary Schedules')}</span>
        </a>
      }
    >
      <Breadcrumbs
        items={[
          { label: t('navigation.dashboard'), to: '/dashboard' },
          { label: t('documents.title') },
        ]}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
        {/* Section 19: Permanent Immutability Policy Banner */}
        <div
          style={{
            padding: 'var(--spacing-3) var(--spacing-4)',
            backgroundColor: 'var(--color-slate-50)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-2)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-slate-700)',
          }}
        >
          <Lock size={15} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} aria-hidden="true" />
          <span>
            {t(
              'documents.immutabilityNotice',
              'Permanent Audit Record: All uploaded schedules, ledgers, and evidentiary files become part of the immutable engagement history.'
            )}
          </span>
        </div>

        {/* Upload Evidentiary Schedule Section */}
        <section aria-labelledby="upload-section-heading">
          <div className="card" style={{ padding: 'var(--spacing-6)' }}>
            <h2
              id="upload-section-heading"
              style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 700,
                color: 'var(--color-slate-900)',
                marginBottom: 'var(--spacing-4)',
              }}
            >
              {t('documents.submitUpload', 'Upload Evidentiary Schedules')}
            </h2>

            {/* Engagement Selection for Upload */}
            <div style={{ marginBottom: 'var(--spacing-4)', maxWidth: '420px' }}>
              <label
                htmlFor={uploadEngagementId}
                style={{
                  display: 'block',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                  color: 'var(--color-slate-700)',
                  marginBottom: 'var(--spacing-1)',
                }}
              >
                {t('auditRequests.selectEngagement')} *
              </label>
              <select
                id={uploadEngagementId}
                className="form-input"
                value={effectiveUploadEngagement}
                onChange={(e) => setSelectedUploadEngagement(e.target.value)}
              >
                <option value="">-- {t('auditRequests.selectEngagement')} --</option>
                {engagements.map((eng) => (
                  <option key={eng.id} value={eng.id}>
                    {eng.title} ({eng.clientOrganizationName})
                  </option>
                ))}
              </select>
            </div>

            {effectiveUploadEngagement ? (
              <FileUploadZone
                engagementId={effectiveUploadEngagement}
                onUploadComplete={() => {
                  void refetch()
                }}
                onUpload={async (file, meta, options) => {
                  await uploadMutation.mutateAsync({ file, meta, options })
                }}
                isUploading={uploadMutation.isPending}
              />
            ) : (
              <p
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--text-muted)',
                  padding: 'var(--spacing-4)',
                  backgroundColor: 'var(--color-slate-50)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {t('documents.selectEngagementToUpload')}
              </p>
            )}
          </div>
        </section>

        {/* Repository Documents List Section */}
        <section aria-labelledby="repo-heading">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--spacing-3)',
              marginBottom: 'var(--spacing-4)',
            }}
          >
            <h2
              id="repo-heading"
              style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-slate-900)' }}
            >
              {t('documents.title')} ({filteredDocuments.length})
            </h2>

            {/* Filters Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
              {/* Search */}
              <div style={{ position: 'relative', minWidth: '200px' }}>
                <label
                  htmlFor={searchInputId}
                  style={{
                    position: 'absolute',
                    width: '1px',
                    height: '1px',
                    padding: 0,
                    margin: '-1px',
                    overflow: 'hidden',
                    clip: 'rect(0, 0, 0, 0)',
                    whiteSpace: 'nowrap',
                    border: 0,
                  }}
                >
                  {t('common.search')}
                </label>
                <Search
                  size={14}
                  style={{
                    position: 'absolute',
                    left: 'var(--spacing-3)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-slate-400)',
                  }}
                  aria-hidden="true"
                />
                <input
                  id={searchInputId}
                  type="search"
                  placeholder={t('documents.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: 'var(--spacing-8)', fontSize: 'var(--font-size-xs)' }}
                />
              </div>

              {/* Engagement Filter */}
              <select
                id={engagementFilterId}
                className="form-input"
                value={filterEngagementId}
                onChange={(e) => handleFilterEngagementChange(e.target.value)}
                style={{ minWidth: '180px', fontSize: 'var(--font-size-xs)' }}
              >
                <option value="">{t('documents.allEngagements')}</option>
                {engagements.map((eng) => (
                  <option key={eng.id} value={eng.id}>
                    {eng.title}
                  </option>
                ))}
              </select>

              {/* Classification Filter */}
              <select
                id={classificationFilterId}
                className="form-input"
                value={filterClassification}
                onChange={(e) => handleFilterClassificationChange(e.target.value)}
                style={{ minWidth: '160px', fontSize: 'var(--font-size-xs)' }}
              >
                <option value="ALL">{t('documents.allClassifications')}</option>
                <option value="BANK_STATEMENT">{t('documents.classBankStatement')}</option>
                <option value="TRIAL_BALANCE">{t('documents.classTrialBalance')}</option>
                <option value="GENERAL_LEDGER">{t('documents.classGeneralLedger')}</option>
                <option value="INVOICE">{t('documents.classInvoice')}</option>
                <option value="CONTRACT">{t('documents.classContract')}</option>
                <option value="TAX_RETURN">{t('documents.classTaxReturn')}</option>
                <option value="RECONCILIATION_SCHEDULE">{t('documents.classReconciliation')}</option>
                <option value="OTHER">{t('documents.classOther')}</option>
              </select>

              {isFiltered && (
                <button
                  type="button"
                  className="btn btn-outline btn-xs"
                  onClick={resetFilters}
                  aria-label={t('auditRequests.resetFilters')}
                >
                  <RotateCcw size={12} />
                  <span>{t('common.reset')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Loading Skeleton */}
          {isLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
              <LoadingSkeleton height="3.5rem" />
              <LoadingSkeleton height="3.5rem" />
              <LoadingSkeleton height="3.5rem" />
            </div>
          )}

          {/* Error State */}
          {!isLoading && isError && (
            <PageError onRetry={() => void refetch()} message={t('errors.generic')} />
          )}

          {/* Empty State */}
          {!isLoading && !isError && filteredDocuments.length === 0 && (
            <EmptyState
              title={t('documents.emptyTitle')}
              description={
                isFiltered
                  ? 'No documents match your active filters or search terms.'
                  : t('documents.emptyDescription')
              }
              action={
                isFiltered ? (
                  <button type="button" className="btn btn-outline btn-sm" onClick={resetFilters}>
                    <RotateCcw size={14} aria-hidden="true" />
                    <span>{t('common.resetFilters', 'Reset Filters')}</span>
                  </button>
                ) : undefined
              }
            />
          )}

          {/* Documents View: Desktop Table & Mobile Stacked Cards (Section 31) */}
          {!isLoading && !isError && filteredDocuments.length > 0 && (
            <>
              {/* Desktop Table View */}
              <div className="card documents-table-desktop" style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--color-slate-50)',
                      }}
                    >
                      <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>
                        {t('documents.fileName')}
                      </th>
                      <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>
                        {t('documents.classificationLabel')}
                      </th>
                      <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>
                        {t('documents.fileSize')}
                      </th>
                      <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>
                        {t('documents.uploadedBy')}
                      </th>
                      <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>
                        {t('documents.uploadDate')}
                      </th>
                      <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>
                        {t('common.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedDocuments.map((doc) => (
                      <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td
                          style={{
                            padding: 'var(--spacing-3) var(--spacing-4)',
                            fontWeight: 600,
                            color: 'var(--color-slate-900)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{doc.originalFileName || doc.fileName}</span>
                            {doc.version && <Badge variant="neutral">v{doc.version}</Badge>}
                          </div>
                        </td>
                        <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
                          <Badge variant="neutral">{doc.classification}</Badge>
                        </td>
                        <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', color: 'var(--text-muted)' }}>
                          {formatBytes(doc.fileSizeBytes)}
                        </td>
                        <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', color: 'var(--text-muted)' }}>
                          {doc.uploadedByUserName}
                        </td>
                        <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', color: 'var(--text-muted)' }}>
                          {formatDate(doc.createdAt)}
                        </td>
                        <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => setPreviewDoc(doc)}
                              aria-label={`Preview ${doc.originalFileName || doc.fileName}`}
                            >
                              <Eye size={14} aria-hidden="true" />
                              <span>{t('common.preview', 'Preview')}</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => setForwardDoc(doc)}
                              title="Forward document to Month-End, Pre-Audit, or Audit Request"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Send size={13} aria-hidden="true" />
                              <span>{t('common.forward', 'Forward')}</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => void handleDownload(doc.id, doc.originalFileName || doc.fileName)}
                              aria-label={`${t('documents.download')} ${doc.originalFileName || doc.fileName}`}
                            >
                              <Download size={14} aria-hidden="true" />
                              <span>{t('documents.download')}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Card View */}
              <div className="documents-cards-mobile" aria-label={t('documents.mobileListLabel')}>
                {pagedDocuments.map((doc) => (
                  <div key={doc.id} className="document-mobile-card">
                    <div className="document-mobile-header">
                      <h3 className="document-mobile-title">{doc.originalFileName || doc.fileName}</h3>
                      <Badge variant="neutral">{doc.classification}</Badge>
                    </div>

                    <div className="document-mobile-meta">
                      <div>
                        <span>{t('documents.fileSize')}: </span>
                        <strong>{formatBytes(doc.fileSizeBytes)}</strong>
                      </div>
                      <div>
                        <span>{t('documents.uploadedBy')}: </span>
                        <strong>{doc.uploadedByUserName}</strong>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <span>{t('documents.uploadDate')}: </span>
                        <strong>{formatDate(doc.createdAt)}</strong>
                      </div>
                    </div>

                    <div className="document-mobile-actions">
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setPreviewDoc(doc)}
                      >
                        <Eye size={14} aria-hidden="true" />
                        <span>{t('common.preview', 'Preview')}</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setForwardDoc(doc)}
                      >
                        <Send size={13} aria-hidden="true" />
                        <span>{t('common.forward', 'Forward')}</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => void handleDownload(doc.id, doc.originalFileName || doc.fileName)}
                      >
                        <Download size={14} aria-hidden="true" />
                        <span>{t('documents.download')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={safeCurrentPage}
                totalItems={filteredDocuments.length}
                pageSize={DOCUMENTS_PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </section>
      </div>

      {/* Document Safe Preview & Metadata Modal */}
      <DocumentPreviewModal
        isOpen={previewDoc !== null}
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />

      {/* Forward Document Modal */}
      {forwardDoc && (
        <ForwardFlowModal
          isOpen={forwardDoc !== null}
          onClose={() => setForwardDoc(null)}
          itemTitle={forwardDoc.originalFileName || forwardDoc.fileName}
          documentId={forwardDoc.id}
          documentName={forwardDoc.originalFileName || forwardDoc.fileName}
          sourceStage="DOCUMENT"
        />
      )}
    </PageContainer>
  )
}
