import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  CheckCheck,
  ArrowRight,
  Flame,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatRelativeTime } from '@/utils/dateUtils'
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllRead,
} from '../../hooks/useNotifications'
import { getNotificationDestination } from '../../utils/navigation'
import type { AppNotification, NotificationSeverity } from '../../types'
import './NotificationBell.css'

export const NotificationBell: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: response } = useNotifications()
  const { mutate: markAsRead } = useMarkAsRead()
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllRead()

  const notifications = response?.data || []
  const unreadCount = notifications.filter((n) => !n.isRead).length
  const recentNotifications = notifications.slice(0, 5)

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleClose()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleClose])

  const handleItemClick = (item: AppNotification) => {
    if (!item.isRead) {
      markAsRead(item.id)
    }
    const destination = getNotificationDestination(item)
    handleClose()
    if (destination) {
      navigate(destination)
    } else {
      navigate('/notifications')
    }
  }

  const handleViewAll = () => {
    handleClose()
    navigate('/notifications')
  }

  const getSeverityIcon = (severity: NotificationSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <Flame size={14} className="notif-icon-critical" aria-hidden="true" />
      case 'WARNING':
        return <AlertTriangle size={14} className="notif-icon-warning" aria-hidden="true" />
      case 'SUCCESS':
        return <CheckCircle size={14} className="notif-icon-success" aria-hidden="true" />
      case 'INFO':
      default:
        return <Info size={14} className="notif-icon-info" aria-hidden="true" />
    }
  }

  const accessibleLabel =
    unreadCount > 0
      ? `${t('notifications.title', 'Notifications')}, ${unreadCount} ${t('notifications.unread', 'unread')}`
      : `${t('notifications.title', 'Notifications')}, ${t('notifications.noUnread', 'no unread notifications')}`

  return (
    <div className="notification-bell-container" ref={containerRef}>
      <button
        type="button"
        className={`notification-bell-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={accessibleLabel}
        title={accessibleLabel}
      >
        <Bell size={18} aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="notification-bell-badge" aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="notification-dropdown"
          role="dialog"
          aria-modal="false"
          aria-label={t('notifications.title', 'Notifications')}
        >
          {/* Dropdown Header */}
          <div className="notification-dropdown-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="notification-dropdown-title">
                {t('notifications.title', 'Notifications')}
              </span>
              {unreadCount > 0 && (
                <span className="notification-dropdown-unread-pill">
                  {unreadCount} {t('notifications.unread', 'unread')}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                className="btn btn-outline btn-xs"
                onClick={() => markAllRead()}
                disabled={isMarkingAll}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                title={t('notifications.markAllRead', 'Mark All as Read')}
              >
                <CheckCheck size={12} aria-hidden="true" />
                <span>{t('notifications.markAllRead', 'Mark All Read')}</span>
              </button>
            )}
          </div>

          {/* Notifications Preview List */}
          <div className="notification-dropdown-list" role="feed" aria-label={t('notifications.title', 'Notifications')}>
            {recentNotifications.length === 0 ? (
              <div className="notification-dropdown-empty" role="status">
                <Bell size={24} style={{ color: 'var(--color-slate-400)', marginBottom: '6px' }} aria-hidden="true" />
                <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  {t('notifications.emptyDescription', 'You are all caught up! No notifications found.')}
                </p>
              </div>
            ) : (
              recentNotifications.map((item) => (
                <div
                  key={item.id}
                  role="article"
                  className={`notification-dropdown-item ${item.isRead ? 'read' : 'unread'}`}
                  onClick={() => handleItemClick(item)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleItemClick(item)
                    }
                  }}
                >
                  <div className="notification-dropdown-item-header">
                    <span className="notification-item-icon-wrapper">
                      {getSeverityIcon(item.severity)}
                    </span>
                    <span className="notification-item-title" title={item.title}>
                      {item.title}
                    </span>
                    {!item.isRead && (
                      <span className="notification-item-unread-dot" aria-label={t('notifications.unread', 'Unread')} />
                    )}
                  </div>

                  <p className="notification-item-message">
                    {item.message}
                  </p>

                  <div className="notification-item-footer">
                    <span className="notification-item-time">
                      <Clock size={11} aria-hidden="true" />
                      {formatRelativeTime(item.createdAt)}
                    </span>
                    {item.engagementName && (
                      <span className="notification-item-engagement" title={item.engagementName}>
                        {item.engagementName}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Dropdown Footer */}
          <div className="notification-dropdown-footer">
            <button
              type="button"
              className="notification-dropdown-view-all"
              onClick={handleViewAll}
            >
              <span>{t('notifications.viewAll', 'View all in Notification Center')}</span>
              <ArrowRight size={13} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
