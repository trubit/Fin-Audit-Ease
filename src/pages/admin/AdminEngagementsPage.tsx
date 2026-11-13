import React, { useState, useMemo } from 'react'
import {
  Search,
  Download,
  Eye,
  X,
  Lock,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton/LoadingSkeleton'
import { EmptyState } from '@/components/feedback/EmptyState/EmptyState'
import { Pagination } from '@/components/common/Pagination'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { useEngagements } from '@/features/engagements/hooks/useEngagements'
import { useAuditRequests } from '@/features/auditRequests/hooks/useAuditRequests'
import type { Engagement } from '@/features/engagements/types'
import { formatDate, getDeadlineInfo } from '@/utils/dateUtils'
import './AdminPages.css'

const PAGE_SIZE = 8

export const AdminEngagementsPage: React.FC = () => {
  const { t } = useTranslation()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [inspectEngagement, setInspectEngagement] = useState<Engagement | null>(null)

  const { data: engagements = [], isLoading: isEngagementsLoading } = useEngagements()
  const { data: auditRequests = [], isLoading: isRequestsLoading } = useAuditRequests()

  const isLoading = isEngagementsLoading || isRequestsLoading

  // Calculate overdue requests per engagement
  const engagementMetricsMap = useMemo(() => {
    const map = new Map<string, { overdueCount: number; pendingReviewCount: number }>()

    auditRequests.forEach((req) => {
      const engId = req.engagementId
      const current = map.get(engId) || { overdueCount: 0, pendingReviewCount: 0 }
      const isOverdue = req.status !== 'ACCEPTED' && getDeadlineInfo(req.dueDate).status === 'overdue'
      const isPendingReview = req.status === 'SUBMITTED' || req.status === 'IN_REVIEW'

      map.set(engId, {
        overdueCount: current.overdueCount + (isOverdue ? 1 : 0),
        pendingReviewCount: current.pendingReviewCount + (isPendingReview ? 1 : 0),
      })
    })

    return map
  }, [auditRequests])

  // Filtered engagements
  const filteredEngagements = useMemo(() => {
    return engagements.filter((eng) => {
      if (selectedStatus !== 'ALL' && eng.status !== selectedStatus) {
        return false
      }
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = eng.title.toLowerCase().includes(q)
        const matchClient = eng.clientOrganizationName.toLowerCase().includes(q)
        const matchAuditor = eng.leadAuditorName.toLowerCase().includes(q)
        return matchTitle || matchClient || matchAuditor
      }
      return true
    })
  }, [engagements, selectedStatus, searchQuery])

  // Pagination
  const paginatedEngagements = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredEngagements.slice(start, start + PAGE_SIZE)
  }, [filteredEngagements, currentPage])

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Engagement Title', 'Client Entity', 'Lead Auditor', 'Fiscal Year', 'Progress %', 'Status', 'Target Completion']
    const rows = filteredEngagements.map((e) => {
      const progress = e.totalRequestsCount > 0 ? Math.round((e.completedRequestsCount / e.totalRequestsCount) * 100) : 0
      return [
        `"${e.title.replace(/"/g, '""')}"`,
        `"${e.clientOrganizationName.replace(/"/g, '""')}"`,
        `"${e.leadAuditorName.replace(/"/g, '""')}"`,
        e.fiscalYear,
        `${progress}%`,
        `"${e.status}"`,
        `"${e.targetCompletionDate}"`,
      ]
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `finauditease_engagements_oversight_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <PageContainer maxWidth="xl">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: t('common.appName', 'FinAuditEase'), to: '/admin/dashboard' },
          { label: t('admin.dashboard.breadcrumb', 'Administrator Command'), to: '/admin/dashboard' },
          { label: t('admin.engagements.breadcrumb', 'Engagement Oversight') },
        ]}
      />

      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-row">
          <div>
            <h1 className="admin-page-title">{t('admin.engagements.title', 'Audit Engagement Oversight & Telemetry')}</h1>
            <p className="admin-page-description">
              {t(
                'admin.engagements.description',
                'Monitor statutory audit progression, lead auditor assignments, document request velocity, and delivery milestones across all corporate clients.'
              )}
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline"
            onClick={handleExportCSV}
            disabled={filteredEngagements.length === 0}
          >
            <Download size={15} aria-hidden="true" />
            <span>{t('admin.engagements.exportCsv', 'Export Oversight Summary (CSV)')}</span>
          </button>
        </div>
      </div>

      {/* Confidentiality Boundary Shield */}
      <div className="admin-notice-banner compliance-banner" role="region" aria-label="Confidentiality Notice">
        <Lock size={20} className="admin-notice-icon" aria-hidden="true" />
        <div className="admin-notice-content">
          <div className="admin-notice-title">
            {t('admin.engagements.shieldTitle', 'Confidential Financial Documentation Shield')}
          </div>
          <div>
            {t(
              'admin.engagements.shieldDesc',
              'Administrative oversight does NOT grant unrestricted access to raw proprietary financial statements, trial balances, or bank confirmations. Engagement files remain strictly isolated to appointed auditors and designated client finance teams under statutory ISA / IFRS compliance rules.'
            )}
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="admin-controls-card">
        <div className="admin-controls-left">
          <div className="admin-search-wrapper">
            <Search size={16} className="admin-search-icon" aria-hidden="true" />
            <input
              type="text"
              className="admin-search-input"
              placeholder={t('admin.engagements.searchPlaceholder', 'Search by engagement, client entity, or auditor...')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              aria-label={t('admin.engagements.searchPlaceholder', 'Search engagements')}
            />
          </div>

          {/* Status Filter */}
          <select
            className="admin-filter-select"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value)
              setCurrentPage(1)
            }}
            aria-label={t('admin.engagements.filterStatus', 'Filter by Engagement Status')}
          >
            <option value="ALL">{t('admin.engagements.allStatuses', 'All Engagement Statuses')}</option>
            <option value="ACTIVE">{t('status.active', 'ACTIVE (In-Progress)')}</option>
            <option value="IN_REVIEW">{t('status.inReview', 'IN_REVIEW (Pending Final Sign-Off)')}</option>
            <option value="COMPLETED">{t('status.completed', 'COMPLETED (Archived)')}</option>
            <option value="OVERDUE">{t('status.overdue', 'OVERDUE (SLA Breach)')}</option>
          </select>
        </div>

        <div className="admin-controls-right">
          <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>
            {t('common.showingRecords', {
              start: filteredEngagements.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1,
              end: Math.min(currentPage * PAGE_SIZE, filteredEngagements.length),
              total: filteredEngagements.length,
            })}
          </span>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div style={{ padding: 'var(--spacing-4) 0' }}>
          <LoadingSkeleton height="350px" />
        </div>
      )}

      {/* ENGAGEMENTS TABLE */}
      {!isLoading && (
        <div className="admin-table-card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin.engagements.tableTitle', 'Engagement Title & Year')}</th>
                  <th>{t('admin.engagements.tableClient', 'Client Entity')}</th>
                  <th>{t('admin.engagements.tableAuditor', 'Lead Auditor & Firm')}</th>
                  <th>{t('admin.engagements.tableProgress', 'PBC Requests Progress')}</th>
                  <th>{t('admin.engagements.tableTargetDate', 'Target Completion')}</th>
                  <th>{t('admin.engagements.tableStatus', 'Status')}</th>
                  <th style={{ textAlign: 'right' }}>{t('common.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEngagements.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 'var(--spacing-8) var(--spacing-4)', textAlign: 'center' }}>
                      <EmptyState
                        title={t('admin.engagements.noEngagementsFound', 'No Audit Engagements Found')}
                        description={t('admin.engagements.noEngagementsFoundDesc', 'Try modifying your search or filter settings.')}
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedEngagements.map((eng) => {
                    const metrics = engagementMetricsMap.get(eng.id) || { overdueCount: 0, pendingReviewCount: 0 }
                    const progress =
                      eng.totalRequestsCount > 0
                        ? Math.round((eng.completedRequestsCount / eng.totalRequestsCount) * 100)
                        : 0

                    return (
                      <tr key={eng.id}>
                        <td>
                          <div>
                            <span className="admin-cell-title">{eng.title}</span>
                            <span className="admin-cell-subtitle">
                              FY{eng.fiscalYear} • Ref: {eng.id.slice(0, 8)}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--brand-charcoal)', fontSize: '13px' }}>
                            {eng.clientOrganizationName}
                          </span>
                        </td>

                        <td>
                          <div>
                            <span style={{ fontWeight: 600, color: 'var(--brand-charcoal)', fontSize: '13px', display: 'block' }}>
                              {eng.leadAuditorName}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                              {eng.auditorFirmName || 'Chartered Firm'}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '150px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--slate)' }}>
                              <span>{eng.completedRequestsCount} / {eng.totalRequestsCount} ({progress}%)</span>
                              {metrics.overdueCount > 0 && (
                                <span style={{ color: '#b91c1c', fontWeight: 700 }}>
                                  {metrics.overdueCount} {t('common.overdue', 'overdue')}
                                </span>
                              )}
                            </div>
                            <div style={{ height: '4px', width: '100%', backgroundColor: '#e2e8e4', borderRadius: '2px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  height: '100%',
                                  width: `${progress}%`,
                                  backgroundColor: metrics.overdueCount > 0 ? '#ef4444' : 'var(--brand-green-800)',
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        <td>
                          <span style={{ fontSize: '12px', color: 'var(--slate)' }}>
                            {formatDate(eng.targetCompletionDate)}
                          </span>
                        </td>

                        <td>
                          <StatusBadge status={eng.status} />
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                            onClick={() => setInspectEngagement(eng)}
                            title={t('admin.engagements.viewTelemetry', 'Inspect Engagement Telemetry')}
                          >
                            <Eye size={13} aria-hidden="true" />
                            <span>{t('admin.engagements.monitorBtn', 'Oversight')}</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredEngagements.length > PAGE_SIZE && (
            <div style={{ padding: 'var(--spacing-3) var(--spacing-4)', borderTop: '1px solid var(--brand-border)' }}>
              <Pagination
                currentPage={currentPage}
                totalItems={filteredEngagements.length}
                pageSize={PAGE_SIZE}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* ENGAGEMENT TELEMETRY MODAL */}
      {inspectEngagement && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="inspect-eng-title">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h2 id="inspect-eng-title" className="admin-modal-title">
                {t('admin.engagements.modalTitle', 'Engagement Oversight & Compliance Telemetry')}
              </h2>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '4px 8px' }}
                onClick={() => setInspectEngagement(null)}
                aria-label={t('common.close', 'Close')}
              >
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ marginBottom: 'var(--spacing-4)' }}>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-charcoal)' }}>
                  {inspectEngagement.title}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  {inspectEngagement.clientOrganizationName} (Fiscal Year {inspectEngagement.fiscalYear})
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-4)' }}>
                <div className="admin-detail-row">
                  <span className="admin-detail-label">{t('admin.engagements.detailLeadAuditor', 'Lead Auditor')}</span>
                  <span className="admin-detail-value">{inspectEngagement.leadAuditorName}</span>
                </div>

                <div className="admin-detail-row">
                  <span className="admin-detail-label">{t('admin.engagements.detailFirm', 'Audit Practice Firm')}</span>
                  <span className="admin-detail-value">{inspectEngagement.auditorFirmName || 'Chartered Firm'}</span>
                </div>

                <div className="admin-detail-row">
                  <span className="admin-detail-label">{t('admin.engagements.detailStartDate', 'Commencement Date')}</span>
                  <span className="admin-detail-value">{formatDate(inspectEngagement.startDate)}</span>
                </div>

                <div className="admin-detail-row">
                  <span className="admin-detail-label">{t('admin.engagements.detailTargetDate', 'Target Sign-Off Date')}</span>
                  <span className="admin-detail-value">{formatDate(inspectEngagement.targetCompletionDate)}</span>
                </div>

                <div className="admin-detail-row">
                  <span className="admin-detail-label">{t('admin.engagements.detailTotalRequests', 'Total PBC Requests')}</span>
                  <span className="admin-detail-value">{inspectEngagement.totalRequestsCount} Scheduled Items</span>
                </div>

                <div className="admin-detail-row">
                  <span className="admin-detail-label">{t('admin.engagements.detailCompletedRequests', 'Completed / Accepted')}</span>
                  <span className="admin-detail-value">{inspectEngagement.completedRequestsCount} Verified Documents</span>
                </div>
              </div>

              <div style={{ marginTop: 'var(--spacing-4)', padding: 'var(--spacing-3)', borderRadius: '6px', backgroundColor: 'var(--brand-gray-light)', border: '1px solid var(--brand-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--slate)' }}>
                  <Lock size={14} aria-hidden="true" />
                  <span>{t('admin.engagements.confidentialityCallout', 'Statutory Isolation Notice')}</span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--muted)', lineHeight: 1.4 }}>
                  {t(
                    'admin.engagements.confidentialityNotice',
                    'Direct inspection of client vouchers, bank confirmations, and trial balances requires formal assignment to this engagement team.'
                  )}
                </p>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setInspectEngagement(null)}
              >
                {t('common.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default AdminEngagementsPage
