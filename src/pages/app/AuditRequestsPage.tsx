import React, { useState, useId } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Clock, Search, Filter, RotateCcw, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/feedback/EmptyState/EmptyState'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton/LoadingSkeleton'
import { PageError } from '@/components/feedback/PageError/PageError'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAuditRequests } from '@/features/auditRequests/hooks/useAuditRequests'
import type { AuditRequestStatus, AuditRequestPriority } from '@/features/auditRequests/types'
import { getDeadlineInfo, formatDate } from '@/utils/dateUtils'
import './AuditRequestsPage.css'

const AUDIT_REQUESTS_PAGE_SIZE = 8

export const AuditRequestsPage: React.FC = () => {
  const { t } = useTranslation()
  const searchInputId = useId()
  const statusSelectId = useId()
  const prioritySelectId = useId()
  const { user } = useAuth()

  const isAuditor = user?.role === 'AUDITOR' || user?.role === 'AUDIT_MANAGER' || user?.role === 'ADMIN'

  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState<number>(1)

  const {
    data: requests = [],
    isLoading,
    isError,
    refetch,
  } = useAuditRequests()

  const isFiltered = selectedStatus !== 'ALL' || selectedPriority !== 'ALL' || searchQuery.trim().length > 0

  const resetFilters = () => {
    setSelectedStatus('ALL')
    setSelectedPriority('ALL')
    setSearchQuery('')
    setCurrentPage(1)
  }

  const handleStatusChange = (val: string) => {
    setSelectedStatus(val)
    setCurrentPage(1)
  }

  const handlePriorityChange = (val: string) => {
    setSelectedPriority(val)
    setCurrentPage(1)
  }

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  const filteredRequests = requests.filter((req) => {
    if (selectedStatus !== 'ALL' && req.status !== (selectedStatus as AuditRequestStatus)) {
      return false
    }
    if (selectedPriority !== 'ALL' && req.priority !== (selectedPriority as AuditRequestPriority)) {
      return false
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const titleMatch = req.title.toLowerCase().includes(q)
      const refMatch = req.referenceCode.toLowerCase().includes(q)
      const catMatch = req.category.toLowerCase().includes(q)
      return titleMatch || refMatch || catMatch
    }
    return true
  })

  // Section 17 Canonical Ordering:
  // 1. Overdue active requests
  // 2. Rejected requests requiring corrective action
  // 3. Pending/Open/Submitted requests ordered by nearest deadline
  // 4. Accepted/Completed requests last
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const aOverdue = getDeadlineInfo(a.dueDate).status === 'overdue' && a.status !== 'ACCEPTED'
    const bOverdue = getDeadlineInfo(b.dueDate).status === 'overdue' && b.status !== 'ACCEPTED'
    if (aOverdue && !bOverdue) return -1
    if (!aOverdue && bOverdue) return 1

    const aRejected = a.status === 'REJECTED'
    const bRejected = b.status === 'REJECTED'
    if (aRejected && !bRejected) return -1
    if (!aRejected && bRejected) return 1

    const aAccepted = a.status === 'ACCEPTED'
    const bAccepted = b.status === 'ACCEPTED'
    if (aAccepted && !bAccepted) return 1
    if (!aAccepted && bAccepted) return -1

    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  const totalPages = Math.max(1, Math.ceil(sortedRequests.length / AUDIT_REQUESTS_PAGE_SIZE))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const pagedRequests = sortedRequests.slice(
    (safeCurrentPage - 1) * AUDIT_REQUESTS_PAGE_SIZE,
    safeCurrentPage * AUDIT_REQUESTS_PAGE_SIZE
  )

  return (
    <PageContainer
      title={t('auditRequests.title')}
      subtitle={t('auditRequests.subtitle')}
      actions={
        isAuditor ? (
          <Link to="/audit-requests/create" className="btn btn-primary btn-md">
            <Plus size={16} aria-hidden="true" />
            <span>{t('auditRequests.newRequestBtn')}</span>
          </Link>
        ) : (
          <Link to="/documents" className="btn btn-outline btn-md">
            <Upload size={16} aria-hidden="true" />
            <span>{t('documents.submitUpload', 'Upload Documents')}</span>
          </Link>
        )
      }
    >
      <Breadcrumbs
        items={[
          { label: t('navigation.dashboard'), to: '/dashboard' },
          { label: t('auditRequests.title') },
        ]}
      />

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--spacing-3)',
          alignItems: 'center',
          marginBottom: 'var(--spacing-6)',
          padding: 'var(--spacing-4)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        {/* Search */}
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
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
            {t('common.search')} {t('auditRequests.title')}
          </label>
          <Search
            size={16}
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
            placeholder={`${t('common.search')} ${t('auditRequests.title')}...`}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 'var(--spacing-8)' }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <Filter size={16} className="text-muted" aria-hidden="true" />
          <label
            htmlFor={statusSelectId}
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
            {t('auditRequests.status')}
          </label>
          <select
            id={statusSelectId}
            className="form-input"
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            style={{ minWidth: '150px' }}
          >
            <option value="ALL">{t('engagements.all')} Statuses</option>
            <option value="OPEN">{t('auditRequests.statusOpen')}</option>
            <option value="SUBMITTED">{t('auditRequests.statusSubmitted')}</option>
            <option value="IN_REVIEW">{t('auditRequests.statusInReview')}</option>
            <option value="ADDITIONAL_INFO_REQUIRED">{t('auditRequests.statusAdditionalInfo')}</option>
            <option value="ACCEPTED">{t('auditRequests.statusAccepted')}</option>
            <option value="REJECTED">{t('auditRequests.statusRejected')}</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label
            htmlFor={prioritySelectId}
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
            {t('auditRequests.priority')}
          </label>
          <select
            id={prioritySelectId}
            className="form-input"
            value={selectedPriority}
            onChange={(e) => handlePriorityChange(e.target.value)}
            style={{ minWidth: '130px' }}
          >
            <option value="ALL">{t('engagements.all')} Priorities</option>
            <option value="LOW">{t('auditRequests.prioLow')}</option>
            <option value="MEDIUM">{t('auditRequests.prioMedium')}</option>
            <option value="HIGH">{t('auditRequests.prioHigh')}</option>
            <option value="CRITICAL">{t('auditRequests.prioCritical')}</option>
          </select>
        </div>

        {/* Reset Filter Button */}
        {isFiltered && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={resetFilters}
            aria-label={t('auditRequests.resetFilters', 'Reset Filters')}
          >
            <RotateCcw size={14} aria-hidden="true" />
            <span>{t('auditRequests.resetFilters', 'Reset Filters')}</span>
          </button>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <LoadingSkeleton height="3rem" />
          <LoadingSkeleton height="3rem" />
          <LoadingSkeleton height="3rem" />
        </div>
      )}

      {/* Error State */}
      {!isLoading && isError && (
        <PageError onRetry={() => void refetch()} message={t('errors.generic')} />
      )}

      {/* Empty State */}
      {!isLoading && !isError && sortedRequests.length === 0 && (
        <EmptyState
          title={t('auditRequests.emptyTitle')}
          description={
            isFiltered
              ? t('auditRequests.emptyDescription')
              : 'There are currently no audit requests in this engagement.'
          }
          action={
            isFiltered ? (
              <button type="button" className="btn btn-outline btn-sm" onClick={resetFilters}>
                <RotateCcw size={14} aria-hidden="true" />
                <span>{t('auditRequests.resetFilters', 'Reset Filters')}</span>
              </button>
            ) : isAuditor ? (
              <Link to="/audit-requests/create" className="btn btn-primary btn-sm">
                <Plus size={14} aria-hidden="true" />
                <span>{t('auditRequests.newRequestBtn')}</span>
              </Link>
            ) : undefined
          }
        />
      )}

      {/* Section 39: Responsive Layout — Desktop Table and Mobile Cards */}
      {!isLoading && !isError && sortedRequests.length > 0 && (
        <>
          {/* Desktop Table View */}
          <div className="card audit-requests-table-desktop" style={{ overflowX: 'auto' }}>
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
                    {t('auditRequests.reference')}
                  </th>
                  <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>
                    {t('auditRequests.requestTitle')}
                  </th>
                  <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>
                    {t('auditRequests.category')}
                  </th>
                  <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>
                    {t('auditRequests.priority')}
                  </th>
                  <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>
                    {t('auditRequests.status')}
                  </th>
                  <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>
                    {t('auditRequests.dueDate')}
                  </th>
                  <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedRequests.map((req) => {
                  const deadline = getDeadlineInfo(req.dueDate)
                  return (
                    <tr key={req.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td
                        style={{
                          padding: 'var(--spacing-3) var(--spacing-4)',
                          fontFamily: 'monospace',
                          fontWeight: 600,
                        }}
                      >
                        {req.referenceCode}
                      </td>
                      <td
                        style={{
                          padding: 'var(--spacing-3) var(--spacing-4)',
                          fontWeight: 600,
                          color: 'var(--color-slate-900)',
                        }}
                      >
                        {req.title}
                      </td>
                      <td
                        style={{
                          padding: 'var(--spacing-3) var(--spacing-4)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {req.category}
                      </td>
                      <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
                        <StatusBadge status={req.priority} size="sm" />
                      </td>
                      <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
                        <StatusBadge status={req.status} size="sm" />
                      </td>
                      <td
                        style={{
                          padding: 'var(--spacing-3) var(--spacing-4)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 'var(--font-size-xs)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-1)',
                            color:
                              deadline.status === 'overdue' && req.status !== 'ACCEPTED'
                                ? 'var(--color-danger-700)'
                                : 'var(--text-muted)',
                          }}
                        >
                          <Clock size={12} aria-hidden="true" />
                          <span>{formatDate(req.dueDate)}</span>
                        </span>
                      </td>
                      <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
                        <Link to={`/audit-requests/${req.id}`} className="btn btn-outline btn-sm">
                          <span>{t('engagements.viewDetails')}</span>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View (Section 39) */}
          <div className="audit-requests-cards-mobile" aria-label="Audit Requests Mobile View">
            {pagedRequests.map((req) => {
              const deadline = getDeadlineInfo(req.dueDate)
              return (
                <div key={req.id} className="audit-request-mobile-card">
                  <div className="audit-request-mobile-header">
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-primary-700)',
                      }}
                    >
                      {req.referenceCode}
                    </span>
                    <div className="audit-request-mobile-badges">
                      <StatusBadge status={req.priority} size="sm" />
                      <StatusBadge status={req.status} size="sm" />
                    </div>
                  </div>

                  <h3 className="audit-request-mobile-title">{req.title}</h3>

                  <div className="audit-request-mobile-meta">
                    <div>
                      <span style={{ display: 'block', color: 'var(--text-muted)' }}>
                        {t('auditRequests.category')}
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--color-slate-800)' }}>
                        {req.category}
                      </span>
                    </div>
                    <div>
                      <span style={{ display: 'block', color: 'var(--text-muted)' }}>
                        {t('auditRequests.dueDate')}
                      </span>
                      <span
                        style={{
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color:
                            deadline.status === 'overdue' && req.status !== 'ACCEPTED'
                              ? 'var(--color-danger-700)'
                              : 'var(--color-slate-800)',
                        }}
                      >
                        <Clock size={12} aria-hidden="true" />
                        {formatDate(req.dueDate)}
                      </span>
                    </div>
                  </div>

                  <div className="audit-request-mobile-actions">
                    <Link
                      to={`/audit-requests/${req.id}`}
                      className="btn btn-outline btn-md"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <span>{t('engagements.viewDetails')}</span>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          <Pagination
            currentPage={safeCurrentPage}
            totalItems={sortedRequests.length}
            pageSize={AUDIT_REQUESTS_PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </PageContainer>
  )
}
