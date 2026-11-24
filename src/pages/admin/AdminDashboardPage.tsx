import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Building,
  Briefcase,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  KeyRound,
  Activity,
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
import { useAdminAuth } from '@/features/admin-auth/hooks/useAdminAuth'
import { getDeadlineInfo, formatDate } from '@/utils/dateUtils'
import './AdminPages.css'

export const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { adminUser } = useAdminAuth()

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
  } = useAuditTrail({ limit: 10 })

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
    const acceptedRequests = auditRequests.filter((r) => r.status === 'ACCEPTED').length
    const inReviewRequests = auditRequests.filter((r) => r.status === 'IN_REVIEW' || r.status === 'SUBMITTED').length

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

    // User registry derivation across all application roles
    const userMap = new Map<string, { role: string; name: string }>()

    // Current user and admin user
    if (user) {
      userMap.set(user.id || user.email, { role: user.role, name: user.fullName })
    }
    if (adminUser) {
      userMap.set(adminUser.id || adminUser.email, { role: 'ADMIN', name: adminUser.fullName })
    }

    // Lead Auditors from engagements
    engagements.forEach((e) => {
      if (e.leadAuditorId || e.leadAuditorName) {
        userMap.set(e.leadAuditorId || e.leadAuditorName, {
          role: 'AUDITOR',
          name: e.leadAuditorName,
        })
      }
    })

    // PBC Request Assignees (Accounting Team Members & Managers)
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
    let totalAccountingManagers = 0

    userMap.forEach((u) => {
      const normalizedRole = u.role.toUpperCase()
      if (normalizedRole === 'ADMIN') {
        totalAdmins++
      } else if (normalizedRole === 'AUDIT_MANAGER') {
        totalAuditManagers++
      } else if (normalizedRole === 'ACCOUNTING_MANAGER') {
        totalAccountingManagers++
      } else if (normalizedRole === 'FINANCE_USER' || normalizedRole.includes('ACCOUNTING')) {
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
      totalAccountingManagers,
      totalOrganisations,
      totalEngagements,
      activeEngagements,
      completedEngagements,
      pendingEngagements,
      overdueEngagements,
      totalRequests,
      acceptedRequests,
      inReviewRequests,
      overdueRequests,
      securityAlertsCount: securityAlerts.length,
      notificationsCount: notifications.length,
    }
  }, [engagements, auditRequests, auditRecords, notifications, user, adminUser])

  return (
    <PageContainer maxWidth="xl">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: t('common.appName', 'FinAuditEase'), to: '/admin/dashboard' },
          { label: t('admin.dashboard.breadcrumb', 'Central Administration Platform') },
        ]}
      />

      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-row">
          <div>
            <h1 className="admin-page-title">
              {t('admin.dashboard.title', 'Central Administration Platform')}
            </h1>
            <p className="admin-page-description">
              {t(
                'admin.dashboard.description',
                'Single central administrative console providing complete visibility, monitoring, and governance across all application roles — Lead Auditors, Audit Managers, Accounting Teams, Accounting Managers, and Administrators.'
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

            <Link to="/admin/roles-permissions" className="btn btn-primary">
              <KeyRound size={15} aria-hidden="true" />
              <span>Roles & Permissions Hub</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Regulatory Multi-Tenant Policy Banner */}
      <div className="admin-notice-banner compliance-banner" role="region" aria-label="Central Platform Assurance Notice">
        <ShieldCheck size={20} className="admin-notice-icon" aria-hidden="true" />
        <div className="admin-notice-content">
          <div className="admin-notice-title">
            Unified Administrative Command with Multi-Tenant Separation
          </div>
          <div>
            As an authorized Administrator, you have complete cross-role visibility to monitor engagements, checklists, user directories, and system security from this single administration platform. Client organization ledgers and audit firm private workpapers remain cryptographically isolated at the database layer.
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
            {/* Card 1: Users Across All Roles */}
            <div className="admin-metric-card">
              <div className="admin-metric-header">
                <span className="admin-metric-label">{t('admin.dashboard.totalUsers', 'Registered Users (All Roles)')}</span>
                <div className="admin-metric-icon-box" aria-hidden="true">
                  <Users size={18} />
                </div>
              </div>
              <div className="admin-metric-value">{stats.totalUsers}</div>
              <div className="admin-metric-subtext">
                <span style={{ color: 'var(--brand-green-800)', fontWeight: 600 }}>
                  {stats.totalAuditors + stats.totalAuditManagers} Assurance • {stats.totalFinanceUsers + stats.totalAccountingManagers} Client SME • {stats.totalAdmins} Admin
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
                <span>{t('admin.dashboard.orgsSubtext', 'Audit Firms & Client Organisations')}</span>
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

          {/* CENTRAL CROSS-ROLE OPERATIONAL MONITORING CONSOLE */}
          <div className="admin-table-card" style={{ padding: 'var(--spacing-5)', marginBottom: 'var(--spacing-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-4)', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--brand-charcoal)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} style={{ color: 'var(--brand-green-800)' }} aria-hidden="true" />
                  Central Cross-Role Operational Console
                </h2>
                <span style={{ fontSize: '12px', color: 'var(--slate)' }}>
                  Monitor operations across all 6 application roles from this single administration interface without role switching.
                </span>
              </div>
              <Link to="/admin/roles-permissions" className="btn btn-outline" style={{ fontSize: '12px', padding: '4px 10px' }}>
                Open Roles & Permissions Matrix →
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
              }}
            >
              {/* Stream 1: Assurance Practice Operations */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: '#0369a1' }}>
                    🔍 Assurance Practice Stream
                  </span>
                  <span style={{ fontSize: '11px', padding: '2px 6px', background: '#e0f2fe', borderRadius: '4px', color: '#0369a1', fontWeight: 600 }}>
                    Auditors & Managers
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#475569' }}>
                  Supervising statutory audit engagements, workpaper evidence reviews, and materiality standards.
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                  <span>Active Engagements:</span>
                  <strong>{stats.activeEngagements}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>Assurance Leads Active:</span>
                  <strong>{stats.totalAuditors + stats.totalAuditManagers}</strong>
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <Link to="/admin/auditors" className="btn btn-secondary btn-xs" style={{ flex: 1, textAlign: 'center' }}>
                    Auditor Directory
                  </Link>
                  <Link to="/admin/audit-managers" className="btn btn-secondary btn-xs" style={{ flex: 1, textAlign: 'center' }}>
                    Audit Managers
                  </Link>
                </div>
              </div>

              {/* Stream 2: Client Accounting & SME Operations */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: '#15803d' }}>
                    💼 Client Accounting Stream
                  </span>
                  <span style={{ fontSize: '11px', padding: '2px 6px', background: '#f0fdf4', borderRadius: '4px', color: '#15803d', fontWeight: 600 }}>
                    Finance & SME Leads
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#475569' }}>
                  Monitoring client PBC document uploads, accounting checklists, and supervisor evidence forwardings.
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                  <span>Total PBC Requests:</span>
                  <strong>{stats.totalRequests}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>Accounting Members:</span>
                  <strong>{stats.totalFinanceUsers + stats.totalAccountingManagers}</strong>
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <Link to="/admin/accounting-managers" className="btn btn-secondary btn-xs" style={{ flex: 1, textAlign: 'center' }}>
                    Accounting Managers
                  </Link>
                  <Link to="/admin/organisations" className="btn btn-secondary btn-xs" style={{ flex: 1, textAlign: 'center' }}>
                    Organisations
                  </Link>
                </div>
              </div>

              {/* Stream 3: Platform Governance & Security Stream */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: '#6d28d9' }}>
                    🛡️ Governance & Security Stream
                  </span>
                  <span style={{ fontSize: '11px', padding: '2px 6px', background: '#ede9fe', borderRadius: '4px', color: '#6d28d9', fontWeight: 600 }}>
                    Central Platform Ops
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#475569' }}>
                  Central identity management, immutable audit trail verification, and multi-tenant boundary compliance.
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                  <span>Application Roles:</span>
                  <strong>6 Governed</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>Security Integrity:</span>
                  <strong style={{ color: '#16a34a' }}>Enforced (SHA-256)</strong>
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <Link to="/admin/users" className="btn btn-secondary btn-xs" style={{ flex: 1, textAlign: 'center' }}>
                    Manage Users
                  </Link>
                  <Link to="/admin/audit-trail" className="btn btn-secondary btn-xs" style={{ flex: 1, textAlign: 'center' }}>
                    Audit Trail
                  </Link>
                </div>
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

          {/* Central Administration Navigation Hub */}
          <div style={{ marginTop: 'var(--spacing-4)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-charcoal)', marginBottom: 'var(--spacing-3)' }}>
              Central Administration Directories & Governance Hub
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
                  👥 {t('admin.nav.users', 'User Management (All Roles)')}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--slate)' }}>
                  Manage accounts, role assignments, activation status, and 2FA across all 6 application roles.
                </div>
              </Link>

              <Link to="/admin/roles-permissions" className="admin-metric-card" style={{ textDecoration: 'none' }}>
                <div style={{ fontWeight: 700, color: 'var(--brand-green-800)', marginBottom: '4px' }}>
                  🔑 Roles & Permissions Governance
                </div>
                <div style={{ fontSize: '12px', color: 'var(--slate)' }}>
                  Authoritative RBAC matrix, capability scopes, and cross-role operational activity monitoring.
                </div>
              </Link>

              <Link to="/admin/auditors" className="admin-metric-card" style={{ textDecoration: 'none' }}>
                <div style={{ fontWeight: 700, color: 'var(--brand-green-800)', marginBottom: '4px' }}>
                  🔍 {t('admin.nav.auditors', 'Auditor Directory')}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--slate)' }}>
                  Track Lead Auditors, ICAN/ANAN credential verifications, and audit firm practicing licences.
                </div>
              </Link>

              <Link to="/admin/audit-managers" className="admin-metric-card" style={{ textDecoration: 'none' }}>
                <div style={{ fontWeight: 700, color: 'var(--brand-green-800)', marginBottom: '4px' }}>
                  👔 Audit Managers & Partners
                </div>
                <div style={{ fontSize: '12px', color: 'var(--slate)' }}>
                  Monitor assurance supervisory managers, engagement partner sign-offs, and quality control.
                </div>
              </Link>

              <Link to="/admin/accounting-managers" className="admin-metric-card" style={{ textDecoration: 'none' }}>
                <div style={{ fontWeight: 700, color: 'var(--brand-green-800)', marginBottom: '4px' }}>
                  📑 Accounting Engagement Managers
                </div>
                <div style={{ fontSize: '12px', color: 'var(--slate)' }}>
                  Oversee client SME accounting leaders, document approvals, and month-end period closes.
                </div>
              </Link>

              <Link to="/admin/security" className="admin-metric-card" style={{ textDecoration: 'none' }}>
                <div style={{ fontWeight: 700, color: 'var(--brand-green-800)', marginBottom: '4px' }}>
                  🛡️ {t('admin.nav.securityCentre', 'Security Centre')}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--slate)' }}>
                  Review login audits, session integrity, multi-tenant boundaries, and immutable audit logs.
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
