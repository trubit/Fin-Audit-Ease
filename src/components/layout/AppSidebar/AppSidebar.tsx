import React, { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Briefcase,
  FileCheck,
  FolderLock,
  UserCheck,
  CalendarCheck,
  Layers,
  Bell,
  History,
  User,
  ShieldCheck,
  Building,
  ChevronLeft,
  ChevronRight,
  Coins,
  CalendarClock,
  MessagesSquare,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useUIStore } from '@/store/uiStore'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { formatUserRole } from '@/features/auth/utils/roleUtils'
import { useNotifications } from '@/features/notifications'
import './AppSidebar.css'

interface NavItem {
  readonly to: string
  readonly label: string
  readonly icon: React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>
  readonly badgeCount?: number
}

interface NavGroup {
  readonly id: string
  readonly title: string
  readonly moduleBadge?: string
  readonly moduleType?: 'finance' | 'audit' | 'general'
  readonly items: readonly NavItem[]
}

export const AppSidebar: React.FC = () => {
  const { t } = useTranslation()
  const { mobileNavOpen, closeAllDrawers, sidebarOpen, toggleSidebar } = useUIStore()
  const { user } = useAuth()
  const { data: notificationsResponse } = useNotifications()

  const notifications = notificationsResponse?.data || []
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const isAuditor =
    user?.role === 'AUDITOR' || user?.role === 'AUDIT_MANAGER' || user?.role === 'ADMIN'

  // Handle Escape key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileNavOpen) {
        closeAllDrawers()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileNavOpen, closeAllDrawers])

  // Desktop keyboard shortcut (Ctrl+B / Cmd+B) to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        const target = e.target as HTMLElement | null
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
          return
        }
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleSidebar])

  const navGroups: readonly NavGroup[] = isAuditor
    ? [
        {
          id: 'workspace',
          title: t('navigation.groupWorkspace', 'Workspace'),
          moduleType: 'general',
          items: [
            { to: '/dashboard', label: t('navigation.dashboard', 'Dashboard'), icon: LayoutDashboard },
          ],
        },
        {
          id: 'audit-module',
          title: t('auditModule.title', 'Audit Module'),
          moduleBadge: t('auditModule.badge', 'Audit'),
          moduleType: 'audit',
          items: [
            { to: '/engagements', label: t('navigation.engagements', 'Engagements'), icon: Briefcase },
            { to: '/audit-requests', label: t('navigation.auditRequests', 'Audit Requests'), icon: FileCheck },
            { to: '/review', label: t('navigation.auditChecklistAndDocuments', 'Audit Checklist and Supporting Documents'), icon: UserCheck },
            { to: '/documents', label: t('navigation.documents', 'Documents'), icon: FolderLock },
            { to: '/communication', label: t('navigation.communication', 'Audit Communication & Meetings'), icon: MessagesSquare },
            { to: '/audit-trail', label: t('navigation.auditTrail', 'Audit Trail'), icon: History },
          ],
        },
        {
          id: 'finance-module',
          title: t('financeModule.title', 'Finance Module'),
          moduleBadge: t('financeModule.badge', 'Finance'),
          moduleType: 'finance',
          items: [
            { to: '/asset-verification', label: t('assets.registerTitle', 'Asset Verification Register'), icon: Coins },
          ],
        },
        {
          id: 'governance',
          title: t('navigation.groupGovernance', 'Account & Notifications'),
          moduleType: 'general',
          items: [
            {
              to: '/notifications',
              label: t('navigation.notifications', 'Notifications'),
              icon: Bell,
              badgeCount: unreadCount,
            },
            { to: '/profile', label: t('profile.title', 'Profile'), icon: User },
          ],
        },
      ]
    : [
        {
          id: 'workspace',
          title: t('navigation.groupWorkspace', 'Workspace'),
          moduleType: 'general',
          items: [
            { to: '/dashboard', label: t('navigation.dashboard', 'Dashboard'), icon: LayoutDashboard },
          ],
        },
        {
          id: 'finance-module',
          title: t('financeModule.title', 'Finance Module'),
          moduleBadge: t('financeModule.badge', 'Finance'),
          moduleType: 'finance',
          items: [
            { to: '/weekly', label: t('navigation.weekly', 'Weekly Checklist'), icon: CalendarClock },
            { to: '/month-end', label: t('navigation.monthEndClose', 'Month-End Close Checklist'), icon: Layers },
            { to: '/pre-audit', label: t('navigation.preAudit', 'Pre-Audit Preparation'), icon: CalendarCheck },
            { to: '/asset-verification', label: t('assets.registerTitle', 'Asset Verification Register'), icon: Coins },
          ],
        },
        {
          id: 'audit-module',
          title: t('auditModule.title', 'Audit Module'),
          moduleBadge: t('auditModule.badge', 'Audit'),
          moduleType: 'audit',
          items: [
            { to: '/engagements', label: t('navigation.engagements', 'Engagements'), icon: Briefcase },
            { to: '/audit-requests', label: t('navigation.auditRequests', 'Audit Requests'), icon: FileCheck },
            { to: '/documents', label: t('navigation.documents', 'Documents'), icon: FolderLock },
            { to: '/communication', label: t('navigation.communication', 'Audit Communication & Meetings'), icon: MessagesSquare },
          ],
        },
        {
          id: 'account',
          title: t('navigation.groupAccount', 'Account & Notifications'),
          moduleType: 'general',
          items: [
            {
              to: '/notifications',
              label: t('navigation.notifications', 'Notifications'),
              icon: Bell,
              badgeCount: unreadCount,
            },
            { to: '/profile', label: t('profile.title', 'Profile'), icon: User },
          ],
        },
      ]

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)

  return (
    <>
      {mobileNavOpen && (
        <div
          className="app-sidebar-backdrop"
          onClick={closeAllDrawers}
          aria-hidden="true"
        />
      )}

      <aside
        className={`app-sidebar ${sidebarOpen ? 'is-expanded' : 'is-collapsed'} ${
          mobileNavOpen ? 'is-open' : ''
        }`}
        aria-label={t('navigation.sidebarLabel')}
        data-collapsed={!sidebarOpen}
      >
        <div className="app-sidebar-content">
          {/* Role Orientation Card */}
          {user && (
            <div
              className="app-sidebar-role-card"
              title={`${formatUserRole(user.role, t)} — ${user.organizationName || user.fullName}`}
            >
              <div className="app-sidebar-role-icon" aria-hidden="true">
                {isAuditor ? <ShieldCheck size={18} /> : <Building size={18} />}
              </div>
              <div className="app-sidebar-role-meta">
                <span className="app-sidebar-role-label">
                  {formatUserRole(user.role, t)}
                </span>
                <span
                  className="app-sidebar-org-name"
                  title={user.organizationName || user.fullName}
                >
                  {user.organizationName || user.fullName}
                </span>
              </div>
            </div>
          )}

          {/* Grouped Application Navigation */}
          <nav className="app-sidebar-nav" aria-label={t('navigation.sectionsLabel')}>
            {navGroups.map((group) => (
              <div key={group.id} className="app-sidebar-group">
                <div className="app-sidebar-group-header" aria-hidden={!sidebarOpen}>
                  <span className={`app-sidebar-group-title ${group.moduleType ? `group-title--${group.moduleType}` : ''}`}>
                    {group.title}
                  </span>
                  {group.moduleBadge && sidebarOpen && (
                    <span className={`app-sidebar-module-badge module-badge--${group.moduleType}`}>
                      {group.moduleBadge}
                    </span>
                  )}
                  <div className="app-sidebar-group-line" aria-hidden="true" />
                </div>
                <div className="app-sidebar-group-items">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={closeAllDrawers}
                        title={!sidebarOpen ? item.label : undefined}
                        className={({ isActive }) =>
                          `app-sidebar-link ${isActive ? 'is-active' : ''}`
                        }
                      >
                        <div className="app-sidebar-icon-wrapper" aria-hidden="true">
                          <Icon size={18} className="app-sidebar-icon" />
                        </div>
                        <span className="app-sidebar-text">{item.label}</span>
                        {item.badgeCount !== undefined && item.badgeCount > 0 && (
                          <span
                            className="app-sidebar-badge"
                            aria-label={`${item.badgeCount} unread`}
                          >
                            {item.badgeCount > 99 ? '99+' : item.badgeCount}
                          </span>
                        )}
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Desktop Sidebar Collapse Toggle Footer */}
        <div className="app-sidebar-footer">
          <button
            type="button"
            className="app-sidebar-collapse-btn"
            onClick={toggleSidebar}
            title={sidebarOpen ? t('navigation.collapseSidebar') : t('navigation.expandSidebar')}
            aria-label={sidebarOpen ? t('navigation.collapseSidebar') : t('navigation.expandSidebar')}
          >
            <div className="app-sidebar-collapse-icon" aria-hidden="true">
              {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </div>
            {sidebarOpen && (
              <span className="app-sidebar-collapse-label">
                {t('navigation.collapseSidebar')}
              </span>
            )}
            {sidebarOpen && (
              <kbd className="app-sidebar-shortcut" aria-hidden="true">
                {isMac ? '⌘B' : 'Ctrl+B'}
              </kbd>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
