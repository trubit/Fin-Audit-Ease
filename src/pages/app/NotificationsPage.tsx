import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BellOff,
  CheckCheck,
  AlertCircle,
  RefreshCw,
  Info,
  CheckCircle,
  AlertTriangle,
  Flame,
  ArrowRight,
  Clock,
  Building,
  FileText,
  Filter,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton/LoadingSkeleton'
import { EmptyState } from '@/components/feedback/EmptyState/EmptyState'
import { Badge } from '@/components/common/Badge/Badge'
import { Pagination } from '@/components/common/Pagination'
import { formatDate, formatDateTime, formatRelativeTime } from '@/utils/dateUtils'
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllRead,
  getNotificationDestination,
  type NotificationSeverity,
  type AppNotification,
} from '@/features/notifications'
import './NotificationsPage.css'

const NOTIFICATIONS_PAGE_SIZE = 8

type FilterCategory = 'ALL' | 'UNREAD' | 'REQUESTS' | 'REVIEWS' | 'DEADLINES' | 'URGENT'

export const NotificationsPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('ALL')
  const [currentPage, setCurrentPage] = useState<number>(1)

  const { data: response, isLoading, isError, refetch } = useNotifications()
  const { mutate: markAsRead } = useMarkAsRead()
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllRead()

  const notifications: readonly AppNotification[] = useMemo(
    () => response?.data || [],
    [response?.data]
  )
  const unreadCount = notifications.filter((n) => !n.isRead).length

  // Client-side filtering over loaded notifications
  const filteredNotifications = useMemo(() => {
    switch (selectedFilter) {
      case 'UNREAD':
        return notifications.filter((n) => !n.isRead)
      case 'REQUESTS':
        return notifications.filter((n) => {
          const typeStr = n.type?.toUpperCase() || ''
          const text = `${n.title} ${n.message}`.toLowerCase()
          return typeStr.includes('REQUEST') || text.includes('request') || text.includes('schedule')
        })
      case 'REVIEWS':
        return notifications.filter((n) => {
          const typeStr = n.type?.toUpperCase() || ''
          const text = `${n.title} ${n.message}`.toLowerCase()
          return (
            typeStr.includes('REVIEW') ||
            typeStr.includes('DOCUMENT') ||
            typeStr.includes('APPROV') ||
            typeStr.includes('REJECT') ||
            text.includes('review') ||
            text.includes('document') ||
            text.includes('approval') ||
            text.includes('reject')
          )
        })
      case 'DEADLINES':
        return notifications.filter((n) => {
          const typeStr = n.type?.toUpperCase() || ''
          const text = `${n.title} ${n.message}`.toLowerCase()
          return (
            typeStr.includes('DEADLINE') ||
            typeStr.includes('OVERDUE') ||
            text.includes('deadline') ||
            text.includes('due') ||
            text.includes('overdue')
          )
        })
      case 'URGENT':
        return notifications.filter((n) => {
          const typeStr = n.type?.toUpperCase() || ''
          return n.severity === 'CRITICAL' || n.severity === 'WARNING' || typeStr.includes('ESCALAT')
        })
      case 'ALL':
      default:
        return notifications
    }
  }, [notifications, selectedFilter])

  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / NOTIFICATIONS_PAGE_SIZE))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const pagedNotifications = useMemo(() => {
    return filteredNotifications.slice(
      (safeCurrentPage - 1) * NOTIFICATIONS_PAGE_SIZE,
      safeCurrentPage * NOTIFICATIONS_PAGE_SIZE
    )
  }, [filteredNotifications, safeCurrentPage])

  const handleFilterChange = (tabId: FilterCategory) => {
    setSelectedFilter(tabId)
    setCurrentPage(1)
  }

  const getSeverityBadge = (severity: NotificationSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <Badge variant="danger">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <Flame size={12} aria-hidden="true" />
              {t('notifications.severityCritical', 'Critical')}
            </span>
          </Badge>
        )
      case 'WARNING':
        return (
          <Badge variant="warning">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <AlertTriangle size={12} aria-hidden="true" />
              {t('notifications.severityWarning', 'Warning')}
            </span>
          </Badge>
        )
      case 'SUCCESS':
        return (
          <Badge variant="success">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <CheckCircle size={12} aria-hidden="true" />
              {t('notifications.severitySuccess', 'Success')}
            </span>
          </Badge>
        )
      case 'INFO':
      default:
        return (
          <Badge variant="neutral">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <Info size={12} aria-hidden="true" />
              {t('notifications.severityInfo', 'Notice')}
            </span>
          </Badge>
        )
    }
  }

  const getActionLabel = (destination: string) => {
    if (destination.includes('/review')) {
      return t('review.inspect', 'Inspect Evidence')
    }
    if (destination.includes('/audit-requests')) {
      return t('auditRequests.viewDetails', 'View Request')
    }
    if (destination.includes('/documents')) {
      return t('documents.title', 'Documents')
    }
    if (destination.includes('/engagements')) {
      return t('engagements.detailTitle', 'View Engagement')
    }
    return t('notifications.view', 'Open')
  }

  const handleNotificationClick = (item: AppNotification) => {
    if (!item.isRead) {
      markAsRead(item.id)
    }
    const destination = getNotificationDestination(item)
    if (destination) {
      navigate(destination)
    }
  }

  const filterTabs: readonly { id: FilterCategory; label: string }[] = [
    { id: 'ALL', label: t('common.all', 'All') },
    {
      id: 'UNREAD',
      label: unreadCount > 0 ? `${t('notifications.unread', 'Unread')} (${unreadCount})` : t('notifications.unread', 'Unread'),
    },
    { id: 'REQUESTS', label: t('notifications.filterRequests', 'Requests') },
    { id: 'REVIEWS', label: t('notifications.filterReviews', 'Reviews') },
    { id: 'DEADLINES', label: t('notifications.filterDeadlines', 'Deadlines') },
    { id: 'URGENT', label: t('notifications.filterUrgent', 'Urgent / Escalations') },
  ]

  const pageActions = unreadCount > 0 ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
      <button
        type="button"
        className="btn btn-outline btn-md"
        onClick={() => markAllRead()}
        disabled={isMarkingAll}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        <CheckCheck size={16} aria-hidden="true" />
        <span>
          {isMarkingAll
            ? t('notifications.markingAll', 'Marking all as read...')
            : t('notifications.markAllRead', 'Mark All as Read')}
        </span>
      </button>
    </div>
  ) : undefined

  return (
    <PageContainer
      title={t('notifications.title', 'Notification Center')}
      subtitle={t(
        'notifications.subtitle',
        'Stay informed on audit request updates, review notes, and deadline reminders.'
      )}
      actions={pageActions}
      maxWidth="lg"
    >
      <div style={{ marginBottom: 'var(--spacing-6)' }}>
        <Breadcrumbs
          items={[
            { label: t('navigation.dashboard', 'Dashboard'), to: '/dashboard' },
            { label: t('notifications.title', 'Notification Center') },
          ]}
        />
      </div>

      {/* Control bar: Filters and Mark All Read */}
      <div className="notifications-controls-bar">
        <div className="notifications-filter-group" role="tablist" aria-label={t('common.filter', 'Filter')}>
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selectedFilter === tab.id}
              className={`btn btn-sm notification-filter-btn ${
                selectedFilter === tab.id ? 'btn-primary' : 'btn-outline'
              }`}
              onClick={() => handleFilterChange(tab.id)}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => markAllRead()}
            disabled={isMarkingAll}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <CheckCheck size={16} aria-hidden="true" />
            <span>
              {isMarkingAll
                ? t('notifications.markingAll', 'Marking all as read...')
                : t('notifications.markAllRead', 'Mark All as Read')}
            </span>
          </button>
        )}
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <LoadingSkeleton height="5rem" width="100%" />
          <LoadingSkeleton height="5rem" width="100%" />
          <LoadingSkeleton height="5rem" width="100%" />
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
              {t('notifications.loadError', 'Failed to load notifications. Please try again.')}
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

      {/* Empty State: No Notifications Available */}
      {!isLoading && !isError && notifications.length === 0 && (
        <EmptyState
          icon={<BellOff size={36} />}
          title={t('notifications.emptyTitle', 'No Notifications')}
          description={t(
            'notifications.emptyDescription',
            "You're all caught up! New activity, reminders, and important audit updates will appear here."
          )}
        />
      )}

      {/* Empty State: Filter Returned No Matches */}
      {!isLoading && !isError && notifications.length > 0 && filteredNotifications.length === 0 && (
        <EmptyState
          icon={<Filter size={36} />}
          title={t('notifications.noFilterResultsTitle', 'No Matching Notifications')}
          description={t(
            'notifications.noFilterResultsDesc',
            'No notifications match the selected category filter.'
          )}
        />
      )}

      {/* Notifications List Feed */}
      {!isLoading && !isError && filteredNotifications.length > 0 && (
        <>
          <div className="notifications-list" role="feed" aria-label={t('notifications.title', 'Notification Center')}>
            {pagedNotifications.map((item) => {
              const destination = getNotificationDestination(item)

              return (
                <article
                  key={item.id}
                  className={`notification-card ${item.isRead ? 'read' : 'unread'}`}
                >
                  <div className="notification-content">
                    <div className="notification-header-row">
                      {!item.isRead && (
                        <span className="notification-unread-pill" aria-label={t('notifications.unread', 'Unread')} />
                      )}
                      {getSeverityBadge(item.severity)}
                      <h3 className="notification-title">
                        {item.title}
                      </h3>
                      <span
                        className="notification-meta-time"
                        title={formatDateTime(item.createdAt)}
                      >
                        <Clock size={11} aria-hidden="true" />
                        {formatRelativeTime(item.createdAt)} ({formatDate(item.createdAt)})
                      </span>
                    </div>

                    <p className="notification-message">
                      {item.message}
                    </p>

                    {/* Context Metadata Tags */}
                    {(item.engagementName || item.auditRequestId) && (
                      <div className="notification-context-tags">
                        {item.engagementName && (
                          <span className="notification-context-tag" title={item.engagementName}>
                            <Building size={11} aria-hidden="true" />
                            <span>{item.engagementName}</span>
                          </span>
                        )}
                        {item.auditRequestId && (
                          <span className="notification-context-tag">
                            <FileText size={11} aria-hidden="true" />
                            <span>{t('auditRequests.title', 'Audit Request')}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="notification-actions">
                    {!item.isRead && (
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={() => markAsRead(item.id)}
                        title={t('notifications.markAsRead', 'Mark as read')}
                      >
                        {t('notifications.markRead', 'Mark read')}
                      </button>
                    )}

                    {destination && (
                      <button
                        type="button"
                        className="btn btn-primary btn-xs"
                        onClick={() => handleNotificationClick(item)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <span>{getActionLabel(destination)}</span>
                        <ArrowRight size={12} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>

          <Pagination
            currentPage={safeCurrentPage}
            totalItems={filteredNotifications.length}
            pageSize={NOTIFICATIONS_PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </PageContainer>
  )
}
