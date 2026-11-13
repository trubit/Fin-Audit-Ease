import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Building,
  Briefcase,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton/LoadingSkeleton'
import { EmptyState } from '@/components/feedback/EmptyState/EmptyState'
import { PageError } from '@/components/feedback/PageError/PageError'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { useEngagements } from '@/features/engagements/hooks/useEngagements'
import { useAuditRequests } from '@/features/auditRequests/hooks/useAuditRequests'
import { useAuditTrail } from '@/features/auditTrail/hooks/useAuditTrail'
import { useNotifications } from '@/features/notifications'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getDeadlineInfo, formatDate } from '@/utils/dateUtils'
import './AdminPages.css'

export const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()

  // 1. Fetch genuine engagements
  const {
    data: engagements = [],
    isLoading: isEngagementsLoading,
    isError: isEngagementsError,
    refetch: refetchEngagements,
  } = useEngagements()

  // 2. Fetch genuine audit requests
  const {
    data: auditRequests = [],
    isLoading: isRequestsLoading,
    isError: isRequestsError,
    refetch: refetchRequests,
  } = useAuditRequests()

  // 3. Fetch genuine audit trail for recent administrative events
  const {
    data: auditTrailResponse,
    isLoading: isAuditTrailLoading,
    isError: isAuditTrailError,
    refetch: refetchAuditTrail,
  } = useAuditTrail({ limit: 8 })

  // 4. Fetch genuine platform notifications & security alerts
  const {
    data: notificationsResponse,
    isLoading: isNotificationsLoading,
    isError: isNotificationsError,
    refetch: refetchNotifications,
  } = useNotifications()

  const auditRecords = useMemo(
    () => auditTrailResponse?.data || [],
    [auditTrailResponse?.data]
  )

  const notifications = useMemo(
    () => notificationsResponse?.data || [],
    [notificationsResponse?.data]
  )

  const isLoading =
    isEngagementsLoading ||
    isRequestsLoading ||
    isAuditTrailLoading ||
    isNotificationsLoading

  const isError =
    isEngagementsError || isRequestsError || isAuditTrailError || isNotificationsError

  const handleRetryAll = () => {
    void refetchEngagements()
    void refetchRequests()
    void refetchAuditTrail()
    void refetchNotifications()
  }

  // --- DERIVE GENUINE METRICS FROM BACKEND DATA ---
  const stats = useMemo(() => {
    // Engagements metrics
    const totalEngagements = engagements.length
    const activeEngagements = engagements.filter((e) => e.status === 'ACTIVE').length
    const completedEngagements = engagements.filter((e) => e.status === 'COMPLETED').length
    const pendingEngagements = engagements.filter(
      (e) => e.status === 'IN_REVIEW' || e.status === 'DRAFT'
    ).length
    const overdueEngagements = engagements.filter((e) => e.status === 'OVERDUE').length

    // Audit Requests metrics
    const totalRequests = auditRequests.length
    const overdueRequests = auditRequests.filter(
      (r) => r.status !== 'ACCEPTED' && getDeadlineInfo(r.dueDate).status === 'overdue'
    ).length

    // Organisations metrics (client entities + audit practices)
    const orgsSet = new Set<string>()
    engagements.forEach((e) => {
      if (e.clientOrganizationName) orgsSet.add(e.clientOrganizationName)
      if (e.auditorFirmName) orgsSet.add(e.auditorFirmName)
    })
    if (user?.organizationName) {
      orgsSet.add(user.organizationName)
    }
    const totalOrganisations = Math.max(orgsSet.size, 1)

    // User registry derivation from Lead Auditors, Assignees, and Audit Trail Actors
    const userMap = new Map<string, { role: string; name: string }>()

    // Current user
    if (user) {
      userMap.set(user.id || user.email, { role: user.role, name: user.fullName })
    }

    // Lead Auditors
    engagements.forEach((e) => {
      if (e.leadAuditorId || e.leadAuditorName) {
        userMap.set(e.leadAuditorId || e.leadAuditorName, {
          role: 'AUDITOR',
          name: e.leadAuditorName,
        })
      }
    })

    // PBC Request Assignees (Accounting Team Members)
    auditRequests.forEach((r) => {
      const assigneeKey = r.assigneeId || r.assigneeName
      if (assigneeKey) {
        userMap.set(assigneeKey, {
          role: 'FINANCE_USER',
          name: r.assigneeName || 'Finance Member',
        })
      }
    })

    // Audit Trail Actors
    auditRecords.forEach((a) => {
      if (a.actorId || a.actorName) {
        const existing = userMap.get(a.actorId || a.actorName)
        if (!existing) {
          userMap.set(a.actorId || a.actorName, {
            role: a.actorRole || 'AUDITOR',
            name: a.actorName,
          })
        }
      }
    })

    const totalUsers = userMap.size
    let totalAuditors = 0
    let totalFinanceUsers = 0
    let totalAdmins = 0
    let totalAuditManagers = 0

    userMap.forEach((u) => {
      const normalizedRole = u.role.toUpperCase()
      if (normalizedRole === 'ADMIN') totalAdmins++
      else if (normalizedRole === 'AUDIT_MANAGER') totalAuditManagers++
      else if (normalizedRole === 'FINANCE_USER' || normalizedRole.includes('ACCOUNTING')) {
        totalFinanceUsers++
      } else {
        totalAuditors++
      }
    })

    // Security alerts & notifications
    const securityAlerts = notifications.filter(
      (n) => n.severity === 'CRITICAL' || n.severity === 'WARNING'
    )

    return {
      totalUsers,
      totalAuditors,
      totalFinanceUsers,
      totalAdmins,
      totalAuditManagers,
      totalOrganisations,
      totalEngagements,
      activeEngagements,
      completedEngagements,
      pendingEngagements,
      overdueEngagements,
      totalRequests,
      overdueRequests,
      securityAlertsCount: securityAlerts.length,
      notificationsCount: notifications.length,
    }
  }, [engagements, auditRequests, auditRecords, notifications, user])

  return (
    <PageContainer maxWidth="xl">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: t('common.appName', 'FinAuditEase'), to: '/admin/dashboard' },
          { label: t('admin.dashboard.breadcrumb', 'Administrator Command') },
        ]}
      />

      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-row">
          <div>
            <h1 className="admin-page-title">
              {t('admin.dashboard.title', 'Administrator Command Dashboard')}
            </h1>
            <p className="admin-page-description">
              {t(
                'admin.dashboard.description',
                'Comprehensive oversight of FinAuditEase registered users, client organizations, chartered auditors, active statutory engagements, and platform governance.'
              )}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleRetryAll}
              disabled={isLoading}
              title={t('common.refresh', 'Refresh telemetry')}
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} aria-hidden="true" />
              <span>{t('common.refresh', 'Refresh Data')}</span>
            </button>

            <Link to="/admin/reports" className="btn btn-primary">
              <span>{t('admin.dashboard.viewReports', 'Export Reports')}</span>
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      {/* Regulatory Multi-Tenant Policy Banner */}
      <div className="admin-notice-banner compliance-banner" role="region" aria-label="Governance Assurance Notice">
        <ShieldCheck size={20} className="admin-notice-icon" aria-hidden="true" />
        <div className="admin-notice-content">
          <div className="admin-notice-title">
            {t('admin.dashboard.governanceNoticeTitle', 'Statutory Platform Administration & Confidentiality Boundary')}
          </div>
          <div>
            {t(
              'admin.dashboard.governanceNoticeDesc',
              'FinAuditEase operates under strict multi-tenant isolation. Administrative oversight provides high-level telemetry and compliance monitoring without compromising confidential financial workpapers or client ledgers.'
            )}
          </div>
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          <PageError
            title={t('admin.dashboard.errorTitle', 'Failed to synchronize administrative telemetry')}
            message={t(
              'admin.dashboard.errorMessage',
              'One or more platform data sources could not be reached. Please check network connectivity or retry.'
            )}
            onRetry={handleRetryAll}
          />
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div style={{ padding: 'var(--spacing-4) 0' }}>
          <div className="admin-metrics-grid">
            <LoadingSkeleton height="110px" />
            <LoadingSkeleton height="110px" />
            <LoadingSkeleton height="110px" />
            <LoadingSkeleton height="110px" />
          </div>
          <div style={{ marginTop: 'var(--spacing-6)' }}>
            <LoadingSkeleton height="320px" />
          </div>
        </div>
      )}

      {/* SUCCESS / LOADED METRICS STATE */}
      {!isLoading && (
        <>
          {/* Top 4 KPI Metrics Grid */}
          <div className="admin-metrics-grid">
            {/* Card 1: Users */}
            <div className="admin-metric-card">
              <div className="admin-metric-header">
                <span className="admin-metric-label">{t('admin.dashboard.totalUsers', 'Registered Users')}</span>
                <div className="admin-metric-icon-box" aria-hidden="true">
                  <Users size={18} />
                </div>
              </div>
              <div className="admin-metric-value">{stats.totalUsers}</div>
              <div className="admin-metric-subtext">
                <span style={{ color: 'var(--brand-green-800)', fontWeight: 600 }}>
                  {stats.totalAuditors} {t('roles.auditorPlural', 'Auditors')} • {stats.totalFinanceUsers} {t('roles.financePlural', 'Finance')} • {stats.totalAdmins} {t('roles.adminPlural', 'Admins')}
                </span>
              </div>
            </div>

            {/* Card 2: Organisations */}
            <div className="admin-metric-card accent-emerald">
              <div className="admin-metric-header">
                <span className="admin-metric-label">{t('admin.dashboard.totalOrganisations', 'Organisations')}</span>
                <div className="admin-metric-icon-box" aria-hidden="true">
                  <Building size={18} />
                </div>
              </div>
              <div className="admin-metric-value">{stats.totalOrganisations}</div>
              <div className="admin-metric-subtext">
                <span>{t('admin.dashboard.orgsSubtext', 'Audit Practices & Corporate Client Entities')}</span>
              </div>
            </div>

            {/* Card 3: Engagements */}
            <div className="admin-metric-card accent-blue">
              <div className="admin-metric-header">
                <span className="admin-metric-label">{t('admin.dashboard.activeEngagements', 'Active Engagements')}</span>
                <div className="admin-metric-icon-box" aria-hidden="true">
                  <Briefcase size={18} />
                </div>
              </div>
              <div className="admin-metric-value">{stats.activeEngagements}</div>
              <div className="admin-metric-subtext">
                <span style={{ color: 'var(--brand-green-800)', fontWeight: 600 }}>
                  {stats.completedEngagements} {t('status.completed', 'Completed')} • {stats.pendingEngagements} {t('status.pending', 'Pending')}
                </span>
              </div>
            </div>

            {/* Card 4: Overdue & Alerts */}
            <div className="admin-metric-card accent-amber">
              <div className="admin-metric-header">
                <span className="admin-metric-label">{t('admin.dashboard.overdueRequests', 'Overdue Requests')}</span>
                <div className="admin-metric-icon-box" style={{ backgroundColor: '#fef3c7', color: '#b45309' }} aria-hidden="true">
                  <AlertTriangle size={18} />
                </div>
              </div>
              <div className="admin-metric-value">{stats.overdueRequests}</div>
              <div className="admin-metric-subtext">
                <span style={{ color: stats.overdueRequests > 0 ? '#b91c1c' : 'var(--brand-green-800)', fontWeight: 600 }}>
                  {stats.securityAlertsCount} {t('admin.dashboard.securityAlertsLabel', 'Security Notices')}
                </span>
              </div>
            </div>
          </div>

          {/* DUAL WIDGET SECTION: ENGAGEMENT OVERSIGHT & RECENT ADMIN ACTIVITIES */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
              gap: 'var(--spacing-6)',
              marginBottom: 'var(--spacing-8)',
            }}
          >
            {/* Widget 1: Live Engagements Overview */}
            <div className="admin-table-card" style={{ padding: 'var(--spacing-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-4)' }}>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--brand-charcoal)' }}>
                    {t('admin.dashboard.liveEngagementsTitle', 'Client Engagement Oversight')}
                  </h2>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {t('admin.dashboard.liveEngagementsDesc', 'Active statutory audits across participating client entities')}
                  </span>
                </div>
                <Link to="/admin/engagements" className="btn btn-outline" style={{ fontSize: '12px', padding: '4px 10px' }}>
                  {t('common.viewAll', 'View All')} →
                </Link>
              </div>

              {engagements.length === 0 ? (
                <EmptyState
                  title={t('admin.dashboard.noEngagementsTitle', 'No Engagements Found')}
                  description={t('admin.dashboard.noEngagementsDesc', 'No active or historical audit engagements have been initialized in the system yet.')}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                  {engagements.slice(0, 5).map((eng) => (
                    <div
                      key={eng.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--brand-border)',
                        backgroundColor: 'var(--brand-gray-light)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--brand-charcoal)' }}>
                          {eng.title}
                        </span>
                        <StatusBadge status={eng.status} />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--slate)' }}>
                        <span>
                          {t('engagements.client', 'Client')}: <strong>{eng.clientOrganizationName}</strong>
                        </span>
                        <span>
                          {t('engagements.leadAuditor', 'Lead')}: {eng.leadAuditorName}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      {eng.totalRequestsCount > 0 && (
                        <div style={{ marginTop: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', marginBottom: '2px' }}>
                            <span>{t('admin.dashboard.pbcProgress', 'PBC Requests Progress')}</span>
                            <span>{Math.round((eng.completedRequestsCount / eng.totalRequestsCount) * 100)}%</span>
                          </div>
                          <div style={{ height: '4px', width: '100%', backgroundColor: '#e2e8e4', borderRadius: '2px', overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${Math.min(100, Math.round((eng.completedRequestsCount / eng.totalRequestsCount) * 100))}%`,
                                backgroundColor: 'var(--brand-green-800)',
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Widget 2: Recent Administrative & Security Events Feed */}
            <div className="admin-table-card" style={{ padding: 'var(--spacing-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-4)' }}>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--brand-charcoal)' }}>
                    {t('admin.dashboard.recentAuditEventsTitle', 'Recent Administrative Activity')}
                  </h2>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {t('admin.dashboard.recentAuditEventsDesc', 'Immutable WORM audit ledger events with SHA-256 verification')}
                  </span>
                </div>
                <Link to="/admin/audit-trail" className="btn btn-outline" style={{ fontSize: '12px', padding: '4px 10px' }}>
                  {t('admin.dashboard.auditTrailLink', 'Full Audit Trail')} →
                </Link>
              </div>

              {auditRecords.length === 0 ? (
                <EmptyState
                  title={t('admin.dashboard.noEventsTitle', 'No Audit Events Logged')}
                  description={t('admin.dashboard.noEventsDesc', 'Audit records will appear as users and administrators conduct platform activities.')}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                  {auditRecords.slice(0, 6).map((record) => (
                    <div
                      key={record.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #f1f5f9',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                      }}
                    >
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--brand-green-800)',
                          marginTop: '6px',
                          flexShrink: 0,
                        }}
                        aria-hidden="true"
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-charcoal)' }}>
                            {record.action.replace(/_/g, ' ')}
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                            {formatDate(record.timestamp)}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--slate)', margin: '2px 0' }}>
                          {record.description || `${record.actorName} performed ${record.action}`}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--muted)' }}>
                          {record.actorName} ({record.actorRole || 'System'}) • Hash: {record.hash ? record.hash.substring(0, 10) + '...' : 'Verified'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Access Grid to Sub-Modules */}
          <div style={{ marginTop: 'var(--spacing-4)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-charcoal)', marginBottom: 'var(--spacing-3)' }}>
              {t('admin.dashboard.submodulesTitle', 'Administrative Operations & Governance Portals')}
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 'var(--spacing-4)',
              }}
            >
              <Link to="/admin/users" className="admin-metric-card" style={{ textDecoration: 'none' }}>
                <div style={{ fontWeight: 700, color: 'var(--brand-green-800)', marginBottom: '4px' }}>
                  👥 {t('admin.nav.users', 'User Management')}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--slate)' }}>
                  {t('admin.dashboard.usersPortalDesc', 'Manage accounts, roles, access statuses, and 2FA compliance.')}
                </div>
              </Link>

              <Link to="/admin/organisations" className="admin-metric-card" style={{ textDecoration: 'none' }}>
                <div style={{ fontWeight: 700, color: 'var(--brand-green-800)', marginBottom: '4px' }}>
                  🏢 {t('admin.nav.organisations', 'Organisation Management')}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--slate)' }}>
                  {t('admin.dashboard.orgsPortalDesc', 'Inspect participating firms, client entities, and tenant boundaries.')}
                </div>
              </Link>

              <Link to="/admin/auditors" className="admin-metric-card" style={{ textDecoration: 'none' }}>
                <div style={{ fontWeight: 700, color: 'var(--brand-green-800)', marginBottom: '4px' }}>
                  🔍 {t('admin.nav.auditors', 'Auditor Directory')}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--slate)' }}>
                  {t('admin.dashboard.auditorsPortalDesc', 'Track ICAN/ACCA/ICAEW certification and active workload.')}
                </div>
              </Link>

              <Link to="/admin/security" className="admin-metric-card" style={{ textDecoration: 'none' }}>
                <div style={{ fontWeight: 700, color: 'var(--brand-green-800)', marginBottom: '4px' }}>
                  🛡️ {t('admin.nav.securityCentre', 'Security Centre')}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--slate)' }}>
                  {t('admin.dashboard.securityPortalDesc', 'Review login audits, session integrity, and threat defense.')}
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </PageContainer>
  )
}

export default AdminDashboardPage

