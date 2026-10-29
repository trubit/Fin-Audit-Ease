import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Plus, Building, User, Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/feedback/EmptyState/EmptyState'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton/LoadingSkeleton'
import { PageError } from '@/components/feedback/PageError/PageError'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useEngagements } from '@/features/engagements/hooks/useEngagements'
import type { EngagementStatus } from '@/features/engagements/types'
import { getDeadlineInfo, formatDate } from '@/utils/dateUtils'
import './EngagementsPage.css'

const ENGAGEMENTS_PAGE_SIZE = 6

export const EngagementsPage: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const isAuditor =
    user?.role === 'AUDITOR' || user?.role === 'AUDIT_MANAGER' || user?.role === 'ADMIN'

  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)

  const {
    data: engagements = [],
    isLoading,
    isError,
    refetch,
  } = useEngagements()

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filteredEngagements = engagements.filter((e) => {
    if (selectedStatus === 'OVERDUE') {
      const deadline = getDeadlineInfo(e.targetCompletionDate)
      const isOverdue = e.status !== 'COMPLETED' && (e.status === 'OVERDUE' || deadline.status === 'overdue')
      if (!isOverdue) return false
    } else if (selectedStatus !== 'ALL') {
      if (e.status !== (selectedStatus as EngagementStatus)) return false
    }

    if (normalizedQuery) {
      const matchesTitle = e.title.toLowerCase().includes(normalizedQuery)
      const matchesClient = e.clientOrganizationName.toLowerCase().includes(normalizedQuery)
      const matchesYear = String(e.fiscalYear).includes(normalizedQuery)
      if (!matchesTitle && !matchesClient && !matchesYear) return false
    }

    return true
  })

  const totalPages = Math.max(1, Math.ceil(filteredEngagements.length / ENGAGEMENTS_PAGE_SIZE))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const pagedEngagements = filteredEngagements.slice(
    (safeCurrentPage - 1) * ENGAGEMENTS_PAGE_SIZE,
    safeCurrentPage * ENGAGEMENTS_PAGE_SIZE
  )

  const handleStatusChange = (statusKey: string) => {
    setSelectedStatus(statusKey)
    setCurrentPage(1)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setCurrentPage(1)
  }

  const statusFilters = [
    { key: 'ALL', label: t('engagements.all'), count: engagements.length },
    { key: 'ACTIVE', label: t('engagements.active'), count: engagements.filter((e) => e.status === 'ACTIVE').length },
    {
      key: 'OVERDUE',
      label: t('engagements.overdue'),
      count: engagements.filter((e) => {
        const deadline = getDeadlineInfo(e.targetCompletionDate)
        return e.status !== 'COMPLETED' && (e.status === 'OVERDUE' || deadline.status === 'overdue')
      }).length,
    },
    { key: 'IN_REVIEW', label: t('engagements.inReview'), count: engagements.filter((e) => e.status === 'IN_REVIEW').length },
    { key: 'COMPLETED', label: t('engagements.completed'), count: engagements.filter((e) => e.status === 'COMPLETED').length },
    { key: 'ARCHIVED', label: t('engagements.archived'), count: engagements.filter((e) => e.status === 'ARCHIVED').length },
  ]

  return (
    <PageContainer
      title={t('engagements.title')}
      subtitle={t('engagements.subtitle')}
      actions={
        isAuditor && (
          <Link to="/engagements/create" className="btn btn-primary btn-md">
            <Plus size={16} aria-hidden="true" />
            <span>{t('engagements.createTitle')}</span>
          </Link>
        )
      }
    >
      <Breadcrumbs
        items={[
          { label: t('navigation.dashboard'), to: '/dashboard' },
          { label: t('engagements.title') },
        ]}
      />

      {/* Toolbar: Search & Filter Tabs */}
      <div className="engagements-toolbar">
        <div className="engagements-search-wrapper">
          <Search size={16} className="engagements-search-icon" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={t('common.search') || 'Search engagements...'}
            aria-label={t('common.search') || 'Search engagements'}
            className="engagements-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="engagements-clear-search"
              aria-label="Clear search"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        <div
          className="engagements-status-tabs"
          role="tablist"
          aria-label="Filter engagements by status"
        >
          {statusFilters.map((tab) => {
            const isActive = selectedStatus === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleStatusChange(tab.key)}
                className={`engagements-status-pill ${isActive ? 'is-active' : ''}`}
              >
                <span>{tab.label}</span>
                <span className="engagements-count-bubble">
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <LoadingSkeleton height="4rem" />
          <LoadingSkeleton height="4rem" />
          <LoadingSkeleton height="4rem" />
        </div>
      )}

      {/* Recoverable Error */}
      {!isLoading && isError && (
        <PageError onRetry={() => void refetch()} message={t('errors.generic')} />
      )}

      {/* Honest Empty State */}
      {!isLoading && !isError && filteredEngagements.length === 0 && (
        <EmptyState
          title={t('engagements.emptyTitle')}
          description={t('engagements.emptyDescription')}
          action={
            isAuditor ? (
              <Link to="/engagements/create" className="btn btn-primary btn-md">
                <Plus size={16} aria-hidden="true" />
                <span>{t('engagements.createTitle')}</span>
              </Link>
            ) : undefined
          }
        />
      )}

      {/* Engagements Grid & Pagination */}
      {!isLoading && !isError && filteredEngagements.length > 0 && (
        <>
          <div className="engagements-grid">
            {pagedEngagements.map((engagement) => {
              const deadline = getDeadlineInfo(engagement.targetCompletionDate)
              const isCompleted = engagement.status === 'COMPLETED'
              const isOverdue =
                !isCompleted && (engagement.status === 'OVERDUE' || deadline.status === 'overdue')
              const progressPct =
                engagement.totalRequestsCount > 0
                  ? Math.round((engagement.completedRequestsCount / engagement.totalRequestsCount) * 100)
                  : 0

              return (
                <div
                  key={engagement.id}
                  className={`engagement-item-card ${isCompleted ? 'is-completed' : ''}`}
                >
                  {/* Card Header */}
                  <div className="engagement-card-header">
                    <div>
                      <h3 className="engagement-card-title">
                        {engagement.title}
                      </h3>
                      <p className="engagement-card-client">
                        <Building size={12} aria-hidden="true" />
                        <span>{engagement.clientOrganizationName}</span>
                      </p>
                    </div>
                    <StatusBadge
                      status={isCompleted ? 'COMPLETED' : isOverdue ? 'OVERDUE' : engagement.status}
                      size="sm"
                    />
                  </div>

                  {/* Engagement Metadata */}
                  <div className="engagement-metadata-list">
                    <div className="engagement-metadata-row">
                      <span>{t('engagements.period')}:</span>
                      <span style={{ fontWeight: 600 }}>FY {engagement.fiscalYear}</span>
                    </div>

                    {engagement.leadAuditorName && (
                      <div className="engagement-metadata-row">
                        <span>{t('dashboard.leadAuditor')}:</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={12} aria-hidden="true" />
                          <span>{engagement.leadAuditorName}</span>
                        </span>
                      </div>
                    )}

                    {engagement.createdAt && (
                      <div className="engagement-metadata-row">
                        <span>{t('common.createdLabel', 'Created:')}</span>
                        <span>{formatDate(engagement.createdAt)}</span>
                      </div>
                    )}

                    <div className="engagement-metadata-row">
                      <span>{t('engagements.targetDate')}:</span>
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--spacing-1)',
                          color: isOverdue ? 'var(--color-danger-700)' : 'inherit',
                          fontWeight: isOverdue ? 600 : 400,
                        }}
                      >
                        <Clock size={12} aria-hidden="true" />
                        <span>
                          {formatDate(engagement.targetCompletionDate)} ({deadline.label})
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 'var(--font-size-xs)',
                        marginBottom: 'var(--spacing-1)',
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)' }}>{t('dashboard.progress')}</span>
                      <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                        {engagement.totalRequestsCount > 0
                          ? `${progressPct}% (${engagement.completedRequestsCount}/${engagement.totalRequestsCount})`
                          : 'No requests yet'}
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '6px',
                        backgroundColor: 'var(--color-slate-100)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${progressPct}%`,
                          height: '100%',
                          backgroundColor: isCompleted
                            ? 'var(--color-slate-400)'
                            : 'var(--color-primary-600)',
                          borderRadius: 'var(--radius-full)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="engagement-action-row">
                    <Link
                      to={`/engagements/${engagement.id}`}
                      className="btn btn-outline btn-md"
                      style={{ width: '100%' }}
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
            totalItems={filteredEngagements.length}
            pageSize={ENGAGEMENTS_PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </PageContainer>
  )
}
