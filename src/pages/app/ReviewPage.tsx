import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  UserCheck,
  AlertCircle,
  RefreshCw,
  Calendar,
  ArrowRight,
  MessageSquare,
  Search,
  Building,
  User,
  Clock,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton/LoadingSkeleton'
import { EmptyState } from '@/components/feedback/EmptyState/EmptyState'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { AttentionCard } from '@/components/common/AttentionCard/AttentionCard'
import { Pagination } from '@/components/common/Pagination'
import { formatDate, getDeadlineInfo } from '@/utils/dateUtils'
import { useReviews } from '@/features/review'
import type { ReviewStatus, ReviewItem } from '@/features/review'
import './ReviewPage.css'

const REVIEW_PAGE_SIZE = 8

export const ReviewPage: React.FC = () => {
  const { t } = useTranslation()
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState<number>(1)

  const { data: response, isLoading, isError, refetch } = useReviews(
    selectedStatus !== 'ALL' ? { status: selectedStatus as ReviewStatus } : undefined
  )

  const rawItems = response?.data
  const reviewItems: readonly ReviewItem[] = useMemo(() => rawItems || [], [rawItems])

  // Real data calculations for counts
  const pendingCount = useMemo(
    () => reviewItems.filter((i) => i.status === 'PENDING').length,
    [reviewItems]
  )
  const overdueCount = useMemo(
    () =>
      reviewItems.filter(
        (i) => i.dueDate && getDeadlineInfo(i.dueDate).status === 'overdue' && i.status !== 'APPROVED'
      ).length,
    [reviewItems]
  )

  // Client-side search filter over loaded data
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return reviewItems

    return reviewItems.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(query)
      const matchEngagement = item.engagementName?.toLowerCase().includes(query)
      const matchRef = item.referenceCode?.toLowerCase().includes(query)
      const matchSubmitter = item.submittedByUserName.toLowerCase().includes(query)
      const matchAssignee = item.assignedAccountingTeamMember?.toLowerCase().includes(query)
      return matchTitle || matchEngagement || matchRef || matchSubmitter || matchAssignee
    })
  }, [reviewItems, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / REVIEW_PAGE_SIZE))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const pagedItems = useMemo(() => {
    return filteredItems.slice(
      (safeCurrentPage - 1) * REVIEW_PAGE_SIZE,
      safeCurrentPage * REVIEW_PAGE_SIZE
    )
  }, [filteredItems, safeCurrentPage])

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status)
    setCurrentPage(1)
  }

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  const getStatusFilterLabel = (status: 'ALL' | ReviewStatus): string => {
    switch (status) {
      case 'ALL':
        return t('common.all', 'All')
      case 'PENDING':
        return t('review.statusPending', 'Pending')
      case 'IN_REVIEW':
        return t('review.statusInReview', 'In Review')
      case 'APPROVED':
        return t('review.statusApproved', 'Approved')
      case 'REJECTED':
        return t('review.statusRejected', 'Rejected')
      default: {
        const _exhaustiveCheck: never = status
        return _exhaustiveCheck
      }
    }
  }

  const statuses = ['ALL', 'PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED'] as const

  return (
    <PageContainer
      title={t('review.pageTitle', 'Audit Checklist and Supporting Documents')}
      subtitle={t(
        'review.pageSubtitle',
        'Inspect checklist schedules and supporting documents, record review determinations, and sign off.'
      )}
      maxWidth="xl"
      actions={
        <button
          type="button"
          className="btn btn-outline btn-md"
          onClick={() => void refetch()}
          disabled={isLoading}
          aria-label={t('common.refresh', 'Refresh queue')}
        >
          <RefreshCw size={16} className={isLoading ? 'spin-animation' : ''} aria-hidden="true" />
          <span>{t('common.refresh', 'Refresh Queue')}</span>
        </button>
      }
    >
      <div style={{ marginBottom: 'var(--spacing-6)' }}>
        <Breadcrumbs
          items={[
            { label: t('navigation.dashboard', 'Dashboard'), to: '/dashboard' },
            { label: t('auditModule.title', 'Audit Module') },
            { label: t('review.pageTitle', 'Audit Checklist and Supporting Documents') },
          ]}
        />
      </div>

      {/* Attention Required Banner (Real Data Only) */}
      {pendingCount > 0 && (
        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          <AttentionCard
            variant={overdueCount > 0 ? 'warning' : 'info'}
            title={
              overdueCount > 0
                ? `${overdueCount} ${t('review.overdueAttention', 'Submissions Overdue for Auditor Determination')}`
                : `${pendingCount} ${t('review.pendingAttention', 'Submissions Waiting for Auditor Determination')}`
            }
            description={t(
              'review.attentionDesc',
              'Review documentary evidence promptly to keep accounting teams unblocked.'
            )}
            action={
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleStatusChange('PENDING')}
              >
                {t('review.filterPendingOnly', 'Focus on Pending')}
              </button>
            }
          />
        </div>
      )}

      {/* Filter Tabs and Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--spacing-4)',
          marginBottom: 'var(--spacing-6)',
          paddingBottom: 'var(--spacing-4)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-2)',
            overflowX: 'auto',
          }}
          role="tablist"
          aria-label={t('review.filterStatus', 'Filter by Status')}
        >
          {statuses.map((status) => {
            const count =
              status === 'ALL'
                ? reviewItems.length
                : reviewItems.filter((i) => i.status === status).length
            return (
              <button
                key={status}
                type="button"
                role="tab"
                aria-selected={selectedStatus === status}
                className={`btn btn-sm ${selectedStatus === status ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handleStatusChange(status)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <span>{getStatusFilterLabel(status)}</span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor:
                      selectedStatus === status
                        ? 'rgba(255, 255, 255, 0.25)'
                        : 'var(--color-slate-100)',
                    color:
                      selectedStatus === status ? '#ffffff' : 'var(--color-slate-600)',
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '20rem' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 'var(--spacing-3)',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          />
          <input
            type="search"
            className="input input-sm"
            style={{ paddingLeft: 'var(--spacing-8)', width: '100%' }}
            placeholder={t('review.searchPlaceholder', 'Search by title, reference, or client...')}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            aria-label={t('review.searchPlaceholder', 'Search submissions')}
          />
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <LoadingSkeleton height="3rem" width="100%" />
          <LoadingSkeleton height="16rem" width="100%" />
        </div>
      )}

      {/* Error Banner with Retry */}
      {isError && (
        <div
          style={{
            padding: 'var(--spacing-6)',
            backgroundColor: 'var(--color-rose-50, #fff1f2)',
            border: '1px solid var(--color-rose-200, #fecdd3)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--spacing-6)',
          }}
          role="alert"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <AlertCircle size={20} style={{ color: 'var(--color-rose-600)' }} />
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-rose-900)' }}>
              {t('review.loadError', 'Failed to load review workspace records. Please try again.')}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => refetch()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <RefreshCw size={14} aria-hidden="true" />
            <span>{t('common.retry', 'Retry')}</span>
          </button>
        </div>
      )}

      {/* Empty State: No Submissions Available */}
      {!isLoading && !isError && reviewItems.length === 0 && (
        <EmptyState
          icon={<UserCheck size={36} />}
          title={t('review.emptyTitle', 'No Submissions Waiting for Review')}
          description={t(
            'review.emptyDescription',
            'All client document submissions have been processed or no reviews have been assigned yet.'
          )}
        />
      )}

      {/* Empty State: Search yielded no matches */}
      {!isLoading && !isError && reviewItems.length > 0 && filteredItems.length === 0 && (
        <EmptyState
          icon={<Search size={36} />}
          title={t('common.noSearchResults', 'No Matching Submissions')}
          description={t(
            'common.noSearchResultsDesc',
            'No reviews match your current search query. Try modifying your search terms.'
          )}
        />
      )}

      {/* Review Queue: Desktop Table & Mobile Cards */}
      {!isLoading && !isError && filteredItems.length > 0 && (
        <>
          {/* Desktop Table View */}
          <div className="review-table-desktop">
            <div style={{ overflowX: 'auto' }}>
              <table className="checklist-table" aria-label={t('review.title', 'Auditor Review Workspace')}>
                <thead>
                  <tr>
                    <th style={{ width: '30%' }}>{t('review.itemTitle', 'Submission Title')}</th>
                    <th>{t('review.engagement', 'Engagement / Entity')}</th>
                    <th>{t('review.status', 'Status')}</th>
                    <th>{t('review.assignedAccountingTeamMember', 'Assignee')}</th>
                    <th>{t('review.submissionDate', 'Submitted')}</th>
                    <th>{t('review.dueDate', 'Due Date')}</th>
                    <th>{t('review.feedbackNotes', 'Notes')}</th>
                    <th style={{ textAlign: 'right' }}>{t('common.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedItems.map((item) => {
                    const deadlineInfo = getDeadlineInfo(item.dueDate)
                    const isOverdue = item.dueDate && deadlineInfo.status === 'overdue' && item.status !== 'APPROVED'

                    return (
                      <tr key={item.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                            <p style={{ fontWeight: 600, color: 'var(--color-slate-900)', margin: 0 }}>
                              {item.title}
                            </p>
                            {item.priority && <StatusBadge status={item.priority} size="sm" />}
                          </div>
                          {item.referenceCode && (
                            <span
                              style={{
                                fontFamily: 'monospace',
                                fontSize: '11px',
                                color: 'var(--text-muted)',
                                marginTop: '2px',
                                display: 'inline-block',
                              }}
                            >
                              {item.referenceCode}
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-size-xs)' }}>
                            <Building size={13} style={{ color: 'var(--color-slate-400)' }} aria-hidden="true" />
                            <span style={{ fontWeight: 500, color: 'var(--color-slate-800)' }}>
                              {item.engagementName || item.engagementId}
                            </span>
                          </div>
                        </td>
                        <td>
                          <StatusBadge status={item.status} size="sm" />
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-size-xs)', color: 'var(--color-slate-700)' }}>
                            <User size={13} style={{ color: 'var(--color-slate-400)' }} aria-hidden="true" />
                            {item.assignedAccountingTeamMember || item.submittedByUserName}
                          </span>
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-size-xs)' }}>
                            <Calendar size={13} aria-hidden="true" style={{ color: 'var(--color-slate-400)' }} />
                            {formatDate(item.submissionDate)}
                          </span>
                        </td>
                        <td>
                          {item.dueDate ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-size-xs)' }}>
                              <Clock
                                size={12}
                                aria-hidden="true"
                                style={{
                                  color: isOverdue ? 'var(--color-rose-600)' : 'var(--text-muted)',
                                }}
                              />
                              <span style={{ color: isOverdue ? 'var(--color-rose-700)' : 'var(--color-slate-700)', fontWeight: isOverdue ? 600 : 400 }}>
                                {formatDate(item.dueDate)}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>—</span>
                          )}
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-size-xs)' }}>
                            <MessageSquare size={13} aria-hidden="true" style={{ color: 'var(--color-slate-400)' }} />
                            {item.feedbackNotes.length}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Link
                            to={`/review/${item.id}`}
                            className="btn btn-outline btn-md"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <span>{t('review.inspect', 'Inspect Evidence')}</span>
                            <ArrowRight size={14} aria-hidden="true" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Stacked Card View (Section 39) */}
          <div className="review-cards-mobile" aria-label="Review Queue Mobile View">
            {pagedItems.map((item) => {
              const deadlineInfo = getDeadlineInfo(item.dueDate)
              const isOverdue = item.dueDate && deadlineInfo.status === 'overdue' && item.status !== 'APPROVED'

              return (
                <div key={item.id} className="review-mobile-card">
                  <div className="review-mobile-header">
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-primary-700)',
                      }}
                    >
                      {item.referenceCode || item.id.substring(0, 8)}
                    </span>
                    <div className="review-mobile-badges">
                      {item.priority && <StatusBadge status={item.priority} size="sm" />}
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                  </div>

                  <h3 className="review-mobile-title">{item.title}</h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    <Building size={12} aria-hidden="true" />
                    <span>{item.engagementName || item.engagementId}</span>
                  </div>

                  <div className="review-mobile-meta">
                    <div>
                      <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px' }}>
                        {t('review.assignedAccountingTeamMember', 'Assignee')}
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--color-slate-800)' }}>
                        {item.assignedAccountingTeamMember || item.submittedByUserName}
                      </span>
                    </div>
                    <div>
                      <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px' }}>
                        {t('review.dueDate', 'Due Date')}
                      </span>
                      <span
                        style={{
                          fontWeight: 600,
                          color: isOverdue ? 'var(--color-danger-700)' : 'var(--color-slate-800)',
                        }}
                      >
                        {item.dueDate ? formatDate(item.dueDate) : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="review-mobile-actions">
                    <Link
                      to={`/review/${item.id}`}
                      className="btn btn-outline btn-md"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <span>{t('review.inspect', 'Inspect Evidence')}</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          <Pagination
            currentPage={safeCurrentPage}
            totalItems={filteredItems.length}
            pageSize={REVIEW_PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </PageContainer>
  )
}
