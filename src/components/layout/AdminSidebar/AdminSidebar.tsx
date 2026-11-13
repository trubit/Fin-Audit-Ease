import React, { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Building,
  UserCheck,
  Briefcase,
  CreditCard,
  History,
  ShieldAlert,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useUIStore } from '@/store/uiStore'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { formatUserRole } from '@/features/auth/utils/roleUtils'
import './AdminSidebar.css'

interface AdminNavItem {
  readonly to: string
  readonly label: string
  readonly icon: React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>
  readonly badgeCount?: number
  readonly isExternalWorkspace?: boolean
}

interface AdminNavGroup {
  readonly id: string
  readonly title: string
  readonly items: readonly AdminNavItem[]
}

export const AdminSidebar: React.FC = () => {
  const { t } = useTranslation()
  const { mobileNavOpen, closeAllDrawers, sidebarOpen, toggleSidebar } = useUIStore()
  const { user } = useAuth()

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

  const adminNavGroups: readonly AdminNavGroup[] = [
    {
      id: 'platform-overview',
      title: t('admin.nav.platformOverview', 'Platform Overview'),
      items: [
        {
          to: '/admin/dashboard',
          label: t('admin.nav.dashboard', 'Admin Dashboard'),
          icon: LayoutDashboard,
        },
      ],
    },
    {
      id: 'directory-access',
      title: t('admin.nav.directoryAndAccess', 'Directory & Access'),
      items: [
        {
          to: '/admin/users',
          label: t('admin.nav.users', 'User Management'),
          icon: Users,
        },
        {
          to: '/admin/organisations',
          label: t('admin.nav.organisations', 'Organisations'),
          icon: Building,
        },
        {
          to: '/admin/auditors',
          label: t('admin.nav.auditors', 'Auditor Directory'),
          icon: UserCheck,
        },
      ],
    },
    {
      id: 'operational-oversight',
      title: t('admin.nav.operationalOversight', 'Operational Oversight'),
      items: [
        {
          to: '/admin/engagements',
          label: t('admin.nav.engagements', 'Engagement Oversight'),
          icon: Briefcase,
        },
        {
          to: '/admin/subscriptions',
          label: t('admin.nav.subscriptions', 'Subscriptions'),
          icon: CreditCard,
        },
      ],
    },
    {
      id: 'governance-security',
      title: t('admin.nav.governanceAndSecurity', 'Governance & Security'),
      items: [
        {
          to: '/admin/audit-trail',
          label: t('admin.nav.auditTrail', 'Audit Trail'),
          icon: History,
        },
        {
          to: '/admin/security',
          label: t('admin.nav.securityCentre', 'Security Centre'),
          icon: ShieldAlert,
        },
        {
          to: '/admin/reports',
          label: t('admin.nav.reportsAndAnalytics', 'Reports & Analytics'),
          icon: BarChart3,
        },
      ],
    },
    {
      id: 'platform-system',
      title: t('admin.nav.platformSystem', 'Platform System'),
      items: [
        {
          to: '/admin/settings',
          label: t('admin.nav.settings', 'Platform Settings'),
          icon: Settings,
        },
        {
          to: '/dashboard',
          label: t('admin.nav.userWorkspace', 'User Workspace View'),
          icon: ArrowUpRight,
          isExternalWorkspace: true,
        },
      ],
    },
  ]

  return (
    <>
      {mobileNavOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={closeAllDrawers}
          aria-hidden="true"
        />
      )}

      <aside
        className={`admin-sidebar ${sidebarOpen ? 'is-expanded' : 'is-collapsed'} ${
          mobileNavOpen ? 'is-open' : ''
        }`}
        aria-label={t('admin.nav.sidebarLabel', 'Administrator Platform Navigation')}
        data-collapsed={!sidebarOpen}
      >
        <div className="admin-sidebar-content">
          {/* Admin Role Orientation Card */}
          {user && (
            <div
              className="admin-sidebar-role-card"
              title={`${formatUserRole(user.role, t)} — ${user.organizationName || user.fullName}`}
            >
              <div className="admin-sidebar-role-icon" aria-hidden="true">
                <ShieldCheck size={18} />
              </div>
              <div className="admin-sidebar-role-meta">
                <span className="admin-sidebar-role-label">
                  {formatUserRole(user.role, t)}
                </span>
                <span
                  className="admin-sidebar-role-org"
                  title={user.organizationName || 'Sabi Africa Innovations Limited'}
                >
                  {user.organizationName || 'Sabi Africa Innovations Limited'}
                </span>
              </div>
            </div>
          )}

          {/* Nav Groups */}
          <nav aria-label="Administrator Links" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {adminNavGroups.map((group) => (
              <div key={group.id} className="admin-nav-group">
                <div className="admin-nav-group-title">{group.title}</div>
                <ul className="admin-nav-list">
                  {group.items.map((item) => {
                    const IconComponent = item.icon
                    return (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            `admin-nav-link ${isActive && !item.isExternalWorkspace ? 'active' : ''}`
                          }
                          onClick={() => {
                            if (mobileNavOpen) closeAllDrawers()
                          }}
                          title={!sidebarOpen ? item.label : undefined}
                        >
                          <span className="admin-nav-icon" aria-hidden="true">
                            <IconComponent size={18} />
                          </span>
                          <span className="admin-nav-text">{item.label}</span>
                          {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                            <span className="admin-nav-badge">{item.badgeCount}</span>
                          )}
                        </NavLink>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Desktop Collapse / Expand Toggle */}
          <div className="admin-sidebar-footer">
            <button
              type="button"
              className="admin-sidebar-toggle-btn"
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? t('navigation.collapseSidebar') : t('navigation.expandSidebar')}
              title={sidebarOpen ? `${t('navigation.collapseSidebar')} (Ctrl+B)` : `${t('navigation.expandSidebar')} (Ctrl+B)`}
            >
              {sidebarOpen ? (
                <>
                  <ChevronLeft size={16} aria-hidden="true" />
                  <span>{t('navigation.collapseSidebar', 'Collapse Navigation')}</span>
                </>
              ) : (
                <ChevronRight size={16} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

