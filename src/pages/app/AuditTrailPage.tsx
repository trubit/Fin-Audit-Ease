import React, { useState, useMemo } from 'react'
import { useSearchParams, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Briefcase,
  History,
  Lock,
  Calendar,
  UserCheck,
  FileDown,
} from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs, type BreadcrumbItem } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton/LoadingSkeleton'
import { EmptyState } from '@/components/feedback/EmptyState/EmptyState'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { Pagination } from '@/components/common/Pagination'
import { useEngagement, useEngagements } from '@/features/engagements/hooks/useEngagements'
import {
  useAuditTrail,
  useExportAuditTrail,
  AuditTrailTimeline,
  AuditTrailFilters,
  type AuditTrailFilterParams,
  type AuditTrailRecord,
} from '@/features/auditTrail'
import './AuditTrailPage.css'

const AUDIT_TRAIL_PAGE_SIZE = 10

export const AuditTrailPage: React.FC = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const routeParams = useParams<{ engagementId?: string }>()

  // Resolve engagementId from route param or query param
  const engagementIdFromRoute = routeParams.engagementId
  const engagementIdFromQuery = searchParams.get('engagementId') || undefined
  const effectiveEngagementId = engagementIdFromRoute || engagementIdFromQuery

  // State for active filters
  const [filters, setFilters] = useState<AuditTrailFilterParams>({
    engagementId: effectiveEngagementId,
    startDate: undefined,
    endDate: undefined,
    action: undefined,
    search: undefined,
  })

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [exportError, setExportError] = useState<string | null>(null)

  // Fetch engagement detail if engagementId is known
  const {
    data: engagement,
    isLoading: isEngagementLoading,
    isError: isEngagementError,
  } = useEngagement(effectiveEngagementId)

  // Fetch engagement list for fallback selector when no engagementId is provided
  const { data: allEngagements = [], isLoading: isEngagementsListLoading } =
    useEngagements()

  // Fetch audit trail records
  const queryParams: AuditTrailFilterParams = useMemo(
    () => ({
      ...filters,
      engagementId: effectiveEngagementId,
    }),
    [filters, effectiveEngagementId]
  )

  const {
    data: auditTrailResponse,
    isLoading: isAuditTrailLoading,
    isError: isAuditTrailError,
    refetch,
  } = useAuditTrail(effectiveEngagementId ? queryParams : undefined)

  const exportMutation = useExportAuditTrail()

  const rawRecords: readonly AuditTrailRecord[] = useMemo(
    () => auditTrailResponse?.data || [],
    [auditTrailResponse?.data]
  )

  // Client-side filtering pass (defensive in case backend returns all items for engagement)
  const filteredRecords = useMemo(() => {
    return rawRecords.filter((record) => {
      // Action filter
      if (filters.action && record.action !== filters.action) {
        return false
      }
      // Start date filter
      if (filters.startDate && record.timestamp < `${filters.startDate}T00:00:00Z`) {
        return false
      }
      // End date filter
      if (filters.endDate && record.timestamp > `${filters.endDate}T23:59:59Z`) {
        return false
      }
      // Keyword search
      if (filters.search) {
        const query = filters.search.toLowerCase()
        const matchActor = record.actorName.toLowerCase().includes(query)
        const matchAction = record.action.toLowerCase().includes(query)
        const matchDesc = (record.description || '').toLowerCase().includes(query)
        const matchId = record.id.toLowerCase().includes(query)
        if (!matchActor && !matchAction && !matchDesc && !matchId) {
          return false
        }
      }
      return true
    })
  }, [rawRecords, filters.action, filters.startDate, filters.endDate, filters.search])

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / AUDIT_TRAIL_PAGE_SIZE))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const pagedRecords = useMemo(() => {
    return filteredRecords.slice(
      (safeCurrentPage - 1) * AUDIT_TRAIL_PAGE_SIZE,
      safeCurrentPage * AUDIT_TRAIL_PAGE_SIZE
    )
  }, [filteredRecords, safeCurrentPage])

  const isLockedEngagement =
    engagement?.status === 'COMPLETED' || engagement?.status === 'ARCHIVED'

  const handleEngagementSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value
    setCurrentPage(1)
    if (selectedId) {
      setSearchParams({ engagementId: selectedId })
      setFilters((prev) => ({ ...prev, engagementId: selectedId }))
    } else {
      setSearchParams({})
      setFilters((prev) => ({ ...prev, engagementId: undefined }))
    }
  }

  const handleFilterChange = (updated: AuditTrailFilterParams) => {
    setCurrentPage(1)
    setFilters((prev) => ({
      ...prev,
      ...updated,
      engagementId: effectiveEngagementId,
    }))
  }

  const handleResetFilters = () => {
    setCurrentPage(1)
    setFilters({
      engagementId: effectiveEngagementId,
      startDate: undefined,
      endDate: undefined,
      action: undefined,
      search: undefined,
    })
  }

  const handleExport = async () => {
    if (!effectiveEngagementId) return
    setExportError(null)

    let downloadUrl: string | null = null
    try {
      const blob = await exportMutation.mutateAsync({
        engagementId: effectiveEngagementId,
        startDate: filters.startDate,
        endDate: filters.endDate,
        format: 'pdf',
      })

      downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      const sanitizedName = engagement?.title
        ? engagement.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : effectiveEngagementId
      link.download = `audit-trail-${sanitizedName}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch {
      setExportError(
        t(
          'auditTrail.exportFailed',
          'Failed to generate audit trail PDF export from server. Please retry.'
        )
      )
    } finally {
      if (downloadUrl) {
        const urlToRevoke = downloadUrl
        setTimeout(() => window.URL.revokeObjectURL(urlToRevoke), 1000)
      }
    }
  }

  const breadcrumbItems = useMemo(() => {
    const items: BreadcrumbItem[] = [
      { label: t('navigation.dashboard', 'Dashboard'), to: '/dashboard' },
      { label: t('navigation.engagements', 'Engagements'), to: '/engagements' },
    ]

    if (engagement) {
      items.push({
        label: engagement.title,
        to: `/engagements/${engagement.id}`,
      })
    }

    items.push({ label: t('auditTrail.title', 'Permanent Audit Trail') })
    return items
  }, [engagement, t])

  const pageActions = effectiveEngagementId && engagement ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
      <button
        type="button"
        className="btn btn-primary btn-md"
        onClick={handleExport}
        disabled={exportMutation.isPending || isAuditTrailLoading}
        aria-label={t('auditTrail.exportPdf', 'Export audit trail as PDF')}
      >
        <FileDown size={16} aria-hidden="true" />
        <span>
          {exportMutation.isPending
            ? t('auditTrail.exporting', 'Exporting PDF...')
            : t('auditTrail.exportPdf', 'Export Audit Trail (PDF)')}
        </span>
      </button>
    </div>
  ) : undefined

  return (
    <PageContainer
      title={t('auditTrail.title', 'Permanent Audit Trail')}
      subtitle={
        engagement
          ? `${engagement.title} — ${t(
              'auditTrail.provenanceSubtitle',
              'Permanent, immutable historical record of all actions, uploads, and review determinations.'
            )}`
          : t(
              'auditTrail.subtitle',
              'Cryptographically verifiable, permanent audit history of engagement activity.'
            )
      }
      actions={pageActions}
      maxWidth="lg"
    >
      <div style={{ marginBottom: 'var(--spacing-6)' }}>
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* Engagement Selector when no engagement is specified */}
      {!effectiveEngagementId && (
        <div className="audit-engagement-select-card">
          <div className="audit-select-prompt-row">
            <div className="audit-select-icon">
              <Briefcase size={24} />
            </div>
            <div>
              <h3 className="audit-select-title">
                {t('auditTrail.selectEngagementTitle', 'Select an Audit Engagement')}
              </h3>
              <p className="audit-select-desc">
                {t(
                  'auditTrail.selectEngagementDesc',
                  'Select an active or archived audit engagement to inspect its authoritative audit trail.'
                )}
              </p>
            </div>
          </div>

          <div style={{ marginTop: 'var(--spacing-4)', maxWidth: '420px' }}>
            {isEngagementsListLoading ? (
              <LoadingSkeleton height="2.5rem" width="100%" />
            ) : (
              <select
                className="input input-md"
                aria-label={t('auditTrail.selectEngagementLabel', 'Select Engagement')}
                onChange={handleEngagementSelect}
                defaultValue=""
              >
                <option value="" disabled>
                  {t('auditTrail.chooseEngagementPrompt', '-- Choose an Engagement --')}
                </option>
                {allEngagements.map((eng) => (
                  <option key={eng.id} value={eng.id}>
                    {eng.title} (FY{eng.fiscalYear}) — {eng.clientOrganizationName}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {/* Engagement Context Header Card */}
      {effectiveEngagementId && engagement && (
        <div className="audit-engagement-header-card">
          <div className="audit-header-main">
            <div className="audit-header-details">
              <div className="audit-header-badges">
                <StatusBadge status={engagement.status} size="sm" />
                <span className="audit-fiscal-pill">FY{engagement.fiscalYear}</span>
              </div>
              <h2 className="audit-engagement-name">{engagement.title}</h2>
              <div className="audit-header-meta-row">
                <span className="audit-meta-item">
                  <Briefcase size={14} aria-hidden="true" />
                  <span>{engagement.clientOrganizationName}</span>
                </span>
                <span className="audit-meta-item">
                  <UserCheck size={14} aria-hidden="true" />
                  <span>
                    {t('auditTrail.leadAuditor', 'Lead Auditor')}: {engagement.leadAuditorName}
                  </span>
                </span>
                <span className="audit-meta-item">
                  <Calendar size={14} aria-hidden="true" />
                  <span>
                    {t('auditTrail.started', 'Started')}: {engagement.startDate}
                  </span>
                </span>
              </div>
            </div>

            <div className="audit-header-actions">
              <button
                type="button"
                className="btn btn-outline btn-md audit-export-btn"
                onClick={handleExport}
                disabled={exportMutation.isPending || isAuditTrailLoading}
                aria-label={t('auditTrail.exportPdf', 'Export audit trail as PDF')}
              >
                <FileDown size={16} aria-hidden="true" />
                <span>
                  {exportMutation.isPending
                    ? t('auditTrail.exporting', 'Exporting PDF...')
                    : t('auditTrail.exportPdf', 'Export PDF')}
                </span>
              </button>
            </div>
          </div>

          {/* Locked Engagement Compliance Indicator */}
          {isLockedEngagement && (
            <div className="audit-locked-notice">
              <Lock size={16} aria-hidden="true" />
              <span>
                {t(
                  'auditTrail.lockedNotice',
                  'This audit engagement is officially completed and locked. All audit trail records and decisions are permanently preserved in read-only format.'
                )}
              </span>
            </div>
          )}

          {/* Tamper-Evident Integrity Banner */}
          <div className="audit-integrity-strip">
            <div className="audit-integrity-badge">
              <ShieldCheck size={16} className="audit-shield-icon" aria-hidden="true" />
              <span className="audit-integrity-text">
                {t(
                  'auditTrail.tamperEvidentNotice',
                  'Tamper-Evident Provenance: Every entry is timestamped, authenticated, and cryptographically anchored.'
                )}
              </span>
            </div>
            <span className="audit-records-count">
              {filteredRecords.length}{' '}
              {filteredRecords.length === 1
                ? t('auditTrail.eventSingular', 'Recorded Event')
                : t('auditTrail.eventPlural', 'Recorded Events')}
            </span>
          </div>
        </div>
      )}

      {/* Export Error Alert */}
      {exportError && (
        <div className="audit-error-card" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <div style={{ flex: 1 }}>
            <p className="audit-error-text">{exportError}</p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setExportError(null)}
          >
            {t('common.close', 'Dismiss')}
          </button>
        </div>
      )}

      {/* Audit Filters Bar */}
      {effectiveEngagementId && (
        <AuditTrailFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      )}

      {/* Loading Skeletons */}
      {effectiveEngagementId && (isEngagementLoading || isAuditTrailLoading) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <LoadingSkeleton height="4rem" width="100%" />
          <LoadingSkeleton height="6rem" width="100%" />
          <LoadingSkeleton height="6rem" width="100%" />
          <LoadingSkeleton height="6rem" width="100%" />
        </div>
      )}

      {/* Error State with Retry */}
      {effectiveEngagementId && (isEngagementError || isAuditTrailError) && (
        <div className="audit-error-card" role="alert">
          <AlertCircle size={24} style={{ color: 'var(--color-rose-600)' }} aria-hidden="true" />
          <div style={{ flex: 1 }}>
            <h4 className="audit-error-heading">
              {t('auditTrail.errorTitle', 'Unable to Load Audit Trail')}
            </h4>
            <p className="audit-error-text">
              {t(
                'auditTrail.errorMessage',
                'A network or server error occurred while retrieving engagement history. Please check your credentials or retry.'
              )}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => refetch()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} aria-hidden="true" />
            <span>{t('common.retry', 'Retry')}</span>
          </button>
        </div>
      )}

      {/* Empty State when zero audit entries exist */}
      {effectiveEngagementId &&
        !isAuditTrailLoading &&
        !isAuditTrailError &&
        rawRecords.length === 0 && (
          <EmptyState
            title={t('auditTrail.emptyTitle', 'No Audit Activity Recorded')}
            description={t(
              'auditTrail.emptyDescription',
              'There are no historical audit events logged for this engagement yet. Events will be automatically recorded as activities occur.'
            )}
            icon={<History size={32} />}
          />
        )}

      {/* Empty State when filters yield 0 records */}
      {effectiveEngagementId &&
        !isAuditTrailLoading &&
        !isAuditTrailError &&
        rawRecords.length > 0 &&
        filteredRecords.length === 0 && (
          <EmptyState
            title={t('auditTrail.noFilterResultsTitle', 'No Matching Events Found')}
            description={t(
              'auditTrail.noFilterResultsDesc',
              'No audit records match your selected action type, date range, or search criteria.'
            )}
            icon={<History size={32} />}
            action={
              <button type="button" className="btn btn-outline btn-sm" onClick={handleResetFilters}>
                {t('auditTrail.clearFilters', 'Clear Filters')}
              </button>
            }
          />
        )}

      {/* Authoritative Timeline */}
      {effectiveEngagementId &&
        !isAuditTrailLoading &&
        !isAuditTrailError &&
        filteredRecords.length > 0 && (
          <>
            <AuditTrailTimeline records={pagedRecords} />
            <Pagination
              currentPage={safeCurrentPage}
              totalItems={filteredRecords.length}
              pageSize={AUDIT_TRAIL_PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
    </PageContainer>
  )
}
