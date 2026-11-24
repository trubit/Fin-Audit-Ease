import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase,
  Users,
  FileCheck2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Plus,
  CheckCircle2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Engagement } from '@/features/engagements/types'
import type { AuditRequest } from '@/features/auditRequests/types'
import type { UserProfile } from '@/features/auth/types'
import { formatUserRole } from '@/features/auth/utils/roleUtils'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { formatDate, getDeadlineInfo } from '@/utils/dateUtils'
import './AuditManagerDashboardView.css'

export interface AuditManagerDashboardViewProps {
  readonly engagements: readonly Engagement[]
  readonly auditRequests: readonly AuditRequest[]
  readonly user: UserProfile | null
  readonly onRefresh?: () => void
}

export const AuditManagerDashboardView: React.FC<AuditManagerDashboardViewProps> = ({
  engagements,
  auditRequests,
  user,
}) => {
  const { t } = useTranslation()

  // Portfolio Metrics
  const activeEngagements = useMemo(
    () => engagements.filter((e) => e.status === 'ACTIVE'),
    [engagements]
  )

  const overdueEngagements = useMemo(
    () =>
      engagements.filter((e) => {
        const deadline = getDeadlineInfo(e.targetCompletionDate)
        return e.status !== 'COMPLETED' && (e.status === 'OVERDUE' || deadline.status === 'overdue')
      }),
    [engagements]
  )

  // Manager Review Queue: Requests requiring quality control sign-off
  const managerReviewQueue = useMemo(
    () =>
      auditRequests.filter(
        (r) =>
          r.status === 'SUBMITTED' ||
          r.status === 'IN_REVIEW' ||
          (r.priority === 'CRITICAL' && r.status === 'OPEN')
      ),
    [auditRequests]
  )

  const acceptedRequestsCount = useMemo(
    () => auditRequests.filter((r) => r.status === 'ACCEPTED').length,
    [auditRequests]
  )

  const qualitySignOffRate = useMemo(() => {
    if (auditRequests.length === 0) return 0
    return Math.round((acceptedRequestsCount / auditRequests.length) * 100)
  }, [acceptedRequestsCount, auditRequests.length])

  // Auditor Workload Distribution (grouping requests and engagements by lead auditor)
  const auditorWorkload = useMemo(() => {
    const map = new Map<string, { auditorName: string; engagementCount: number; requestCount: number }>()

    engagements.forEach((eng) => {
      const name = eng.leadAuditorName || t('auditRequests.unassigned', 'Unassigned')
      const existing = map.get(name) || { auditorName: name, engagementCount: 0, requestCount: 0 }
      existing.engagementCount += 1
      map.set(name, existing)
    })

    auditRequests.forEach((req) => {
      // Find engagement auditor
      const eng = engagements.find((e) => e.id === req.engagementId)
      const name = eng?.leadAuditorName || t('auditRequests.unassigned', 'Unassigned')
      const existing = map.get(name)
      if (existing) {
        existing.requestCount += 1
      }
    })

    return Array.from(map.values())
  }, [engagements, auditRequests, t])

  return (
    <div className="audit-manager-dash">
      {/* Editorial Ribbon */}
      <div className="audit-manager-ribbon">
        <div className="audit-manager-ribbon-left">
          <div className="audit-manager-ribbon-icon" aria-hidden="true">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="audit-manager-ribbon-title">
              {formatUserRole(user?.role, t)} • {user?.fullName || t('roles.auditManager')}
            </h1>
            <p className="audit-manager-ribbon-subtitle">
              {user?.organizationName || 'FinAuditEase Audit Firm'} • {t('dashboard.title', 'Assurance Portfolio Oversight')}
            </p>
          </div>
        </div>

        <div className="audit-manager-ribbon-metrics">
          <div className="audit-manager-metric-card">
            <span className="audit-manager-metric-val">{activeEngagements.length}</span>
            <span className="audit-manager-metric-lbl">{t('dashboard.activeEngagements', 'Active Engagements')}</span>
          </div>
          <div className="audit-manager-metric-card">
            <span
              className="audit-manager-metric-val"
              style={{ color: overdueEngagements.length > 0 ? '#fca5a5' : '#ffffff' }}
            >
              {overdueEngagements.length}
            </span>
            <span className="audit-manager-metric-lbl">{t('engagements.overdue', 'Overdue Risk')}</span>
          </div>
          <div className="audit-manager-metric-card">
            <span className="audit-manager-metric-val" style={{ color: '#fde047' }}>
              {managerReviewQueue.length}
            </span>
            <span className="audit-manager-metric-lbl">{t('dashboard.attentionTitle', 'QC Review Queue')}</span>
          </div>
          <div className="audit-manager-metric-card">
            <span className="audit-manager-metric-val">{qualitySignOffRate}%</span>
            <span className="audit-manager-metric-lbl">{t('auditManager.acceptanceRate', 'Acceptance Rate')}</span>
          </div>
        </div>
      </div>

      {/* Grid: Portfolio Oversight & Auditor Workload */}
      <div className="audit-manager-grid-2col">
        {/* Left: Active Portfolio Engagements */}
        <div className="audit-manager-card">
          <div className="audit-manager-card-header">
            <h2 className="audit-manager-card-title">
              <Briefcase size={18} aria-hidden="true" />
              <span>{t('auditManager.portfolioTitle', 'Assurance Engagements Portfolio')}</span>
            </h2>
            <Link to="/engagements" className="audit-manager-card-action">
              <span>{t('common.viewAll', 'View All')} ({engagements.length})</span>
              <ArrowRight size={14} style={{ display: 'inline', marginLeft: 4 }} aria-hidden="true" />
            </Link>
          </div>

          {engagements.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              {t('auditManager.noEngagements', 'No client audit engagements currently in your portfolio.')}
            </p>
          ) : (
            <div className="audit-manager-portfolio-list">
              {engagements.slice(0, 5).map((eng) => {
                const progress =
                  eng.totalRequestsCount > 0
                    ? Math.round((eng.completedRequestsCount / eng.totalRequestsCount) * 100)
                    : 0
                const deadline = getDeadlineInfo(eng.targetCompletionDate)

                return (
                  <div key={eng.id} className="audit-manager-portfolio-item">
                    <div className="audit-manager-item-row">
                      <div>
                        <Link to={`/engagements/${eng.id}`} className="audit-manager-item-title">
                          {eng.title}
                        </Link>
                        <div className="audit-manager-item-client">
                          {eng.clientOrganizationName} • FY {eng.fiscalYear}
                        </div>
                      </div>
                      <StatusBadge status={eng.status} />
                    </div>

                    <div className="audit-manager-progress-wrap">
                      <div className="audit-manager-progress-bar">
                        <div
                          className="audit-manager-progress-fill"
                          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                        />
                      </div>
                      <span className="audit-manager-progress-text">{progress}%</span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.75rem',
                        color: '#64748b',
                        marginTop: 4,
                      }}
                    >
                      <span className="audit-manager-auditor-badge">
                        <Users size={12} aria-hidden="true" />
                        <span>{t('auditManager.leadAuditor', { name: eng.leadAuditorName || t('auditRequests.unassigned', 'Unassigned'), defaultValue: `Lead: ${eng.leadAuditorName || 'Unassigned'}` })}</span>
                      </span>
                      <span style={{ color: deadline.status === 'overdue' ? '#dc2626' : 'inherit' }}>
                        <Clock size={12} style={{ display: 'inline', marginRight: 3 }} aria-hidden="true" />
                        {t('auditManager.targetDate', { date: formatDate(eng.targetCompletionDate), defaultValue: `Target: ${formatDate(eng.targetCompletionDate)}` })}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right: Auditor Staff Workload */}
        <div className="audit-manager-card">
          <div className="audit-manager-card-header">
            <h2 className="audit-manager-card-title">
              <Users size={18} aria-hidden="true" />
              <span>{t('auditManager.staffWorkloadTitle', 'Auditor Staff Workload')}</span>
            </h2>
            <Link to="/engagements/create" className="btn btn-primary btn-sm">
              <Plus size={14} aria-hidden="true" />
              <span>{t('auditManager.newEngagement', 'New Engagement')}</span>
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {auditorWorkload.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{t('auditManager.noAuditorData', 'No auditor assignment data recorded.')}</p>
            ) : (
              auditorWorkload.map((staff, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                      {staff.auditorName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                      {staff.engagementCount} {t('engagements.title', 'Engagements')} • {staff.requestCount} {t('auditRequests.title', 'Audit Requests')}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: staff.engagementCount > 2 ? '#b45309' : '#047857',
                      background: staff.engagementCount > 2 ? '#fef3c7' : '#ecfdf5',
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}
                  >
                    {staff.engagementCount > 2 ? t('auditManager.highWorkload', 'High Workload') : t('auditManager.available', 'Available')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quality Review & Evidence Queue */}
      <div className="audit-manager-card">
        <div className="audit-manager-card-header">
          <h2 className="audit-manager-card-title">
            <FileCheck2 size={18} aria-hidden="true" />
            <span>{t('auditManager.managerReviewQueue', 'Managerial Review Queue (Quality Control)')}</span>
          </h2>
          <Link to="/review" className="audit-manager-card-action">
            <span>{t('auditManager.openReviewCentre', 'Open Review Centre')}</span>
            <ArrowRight size={14} style={{ display: 'inline', marginLeft: 4 }} aria-hidden="true" />
          </Link>
        </div>

        {managerReviewQueue.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
            <CheckCircle2 size={36} color="#059669" style={{ margin: '0 auto 8px auto' }} />
            <p style={{ fontWeight: 600, margin: 0 }}>{t('auditManager.allEvidenceReviewed', 'All submitted client evidence has been reviewed.')}</p>
            <p style={{ fontSize: '0.8125rem', marginTop: 4 }}>
              {t('auditManager.zeroPendingQualityControl', 'Zero pending quality control approvals in the manager queue.')}
            </p>
          </div>
        ) : (
          <div className="audit-manager-table-wrapper">
            <table className="audit-manager-table">
              <thead>
                <tr>
                  <th>{t('auditManager.tableRef', 'Reference')}</th>
                  <th>{t('auditManager.tableRequestTitle', 'Request Title')}</th>
                  <th>{t('auditManager.tableEngagement', 'Engagement')}</th>
                  <th>{t('auditManager.tableStatus', 'Status')}</th>
                  <th>{t('auditManager.tableDueDate', 'Due Date')}</th>
                  <th>{t('auditManager.tableAction', 'Action')}</th>
                </tr>
              </thead>
              <tbody>
                {managerReviewQueue.slice(0, 6).map((req) => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{req.referenceCode}</td>
                    <td>{req.title}</td>
                    <td>{req.engagementId ? `Engagement #${req.engagementId.slice(0, 8)}` : 'Audit Engagement'}</td>
                    <td>
                      <StatusBadge status={req.status} />
                    </td>
                    <td>{formatDate(req.dueDate)}</td>
                    <td>
                      <Link
                        to={`/review/${req.id}`}
                        className="btn btn-outline btn-xs"
                        style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                      >
                        {t('auditManager.review', 'Review')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
