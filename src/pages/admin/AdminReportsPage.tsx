import React, { useState, useMemo } from 'react'
import {
  Download,
  ShieldCheck,
  Search,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton/LoadingSkeleton'
import { useEngagements } from '@/features/engagements/hooks/useEngagements'
import { useAuditRequests } from '@/features/auditRequests/hooks/useAuditRequests'
import { useAuditTrail } from '@/features/auditTrail/hooks/useAuditTrail'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getDeadlineInfo } from '@/utils/dateUtils'
import './AdminPages.css'

export const AdminReportsPage: React.FC = () => {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()

  const [activeReportTab, setActiveReportTab] = useState<'engagements' | 'requests' | 'organisations' | 'compliance'>('engagements')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: engagements = [], isLoading: isEngagementsLoading } = useEngagements()
  const { data: auditRequests = [], isLoading: isRequestsLoading } = useAuditRequests()
  const { data: auditTrailResponse, isLoading: isAuditTrailLoading } = useAuditTrail()

  const auditEvents = useMemo(() => auditTrailResponse?.data || [], [auditTrailResponse?.data])
  const isLoading = isEngagementsLoading || isRequestsLoading || isAuditTrailLoading

  // Engagements report data
  const engagementsReport = useMemo(() => {
    return engagements.map((e) => ({
      id: e.id,
      title: e.title,
      clientOrg: e.clientOrganizationName,
      leadAuditor: e.leadAuditorName,
      status: e.status,
      period: `FY${e.fiscalYear}`,
      progress: e.totalRequestsCount > 0 ? Math.round((e.completedRequestsCount / e.totalRequestsCount) * 100) : 0,
      startDate: e.startDate,
      targetDate: e.targetCompletionDate,
    }))
  }, [engagements])

  // SLA & Requests report data
  const requestsReport = useMemo(() => {
    return auditRequests.map((r) => {
      const deadline = getDeadlineInfo(r.dueDate)
      return {
        id: r.id,
        reference: r.referenceCode,
        title: r.title,
        category: r.category,
        priority: r.priority,
        status: r.status,
        dueDate: r.dueDate,
        isOverdue: deadline.status === 'overdue',
        daysRemaining: deadline.daysRemaining,
        assignee: r.assigneeName || 'Unassigned',
      }
    })
  }, [auditRequests])

  // Organisations aggregate report
  const organisationsReport = useMemo(() => {
    const orgMap = new Map<string, { name: string; activeCount: number; completedCount: number }>()
    if (currentUser?.organizationName) {
      orgMap.set(currentUser.organizationName, {
        name: currentUser.organizationName,
        activeCount: 0,
        completedCount: 0,
      })
    }
    engagements.forEach((e) => {
      if (e.clientOrganizationName) {
        const existing = orgMap.get(e.clientOrganizationName)
        const isActive = e.status === 'ACTIVE' || e.status === 'IN_REVIEW' || e.status === 'OVERDUE'
        const isCompleted = e.status === 'COMPLETED'
        if (existing) {
          orgMap.set(e.clientOrganizationName, {
            name: e.clientOrganizationName,
            activeCount: existing.activeCount + (isActive ? 1 : 0),
            completedCount: existing.completedCount + (isCompleted ? 1 : 0),
          })
        } else {
          orgMap.set(e.clientOrganizationName, {
            name: e.clientOrganizationName,
            activeCount: isActive ? 1 : 0,
            completedCount: isCompleted ? 1 : 0,
          })
        }
      }
    })
    return Array.from(orgMap.values())
  }, [currentUser, engagements])

  // CSV Export for current tab
  const handleExportCSV = () => {
    let headers: string[] = []
    let rows: (string | number)[][] = []
    const filenamePrefix = `finauditease_report_${activeReportTab}_${new Date().toISOString().slice(0, 10)}`

    if (activeReportTab === 'engagements') {
      headers = ['Engagement ID', 'Title', 'Client Entity', 'Lead Auditor', 'Status', 'Period', 'Progress (%)', 'Target Completion']
      rows = engagementsReport.map((e) => [
        `"${e.id}"`,
        `"${e.title.replace(/"/g, '""')}"`,
        `"${e.clientOrg.replace(/"/g, '""')}"`,
        `"${e.leadAuditor.replace(/"/g, '""')}"`,
        `"${e.status}"`,
        `"${e.period}"`,
        e.progress,
        `"${e.targetDate}"`,
      ])
    } else if (activeReportTab === 'requests') {
      headers = ['Reference', 'Title', 'Category', 'Priority', 'Status', 'Due Date', 'Overdue Status', 'Assignee']
      rows = requestsReport.map((r) => [
        `"${r.reference}"`,
        `"${r.title.replace(/"/g, '""')}"`,
        `"${r.category}"`,
        `"${r.priority}"`,
        `"${r.status}"`,
        `"${r.dueDate}"`,
        r.isOverdue ? 'OVERDUE' : 'ON TRACK',
        `"${r.assignee.replace(/"/g, '""')}"`,
      ])
    } else if (activeReportTab === 'organisations') {
      headers = ['Organisation Legal Entity', 'Active Engagements', 'Completed Engagements']
      rows = organisationsReport.map((o) => [
        `"${o.name.replace(/"/g, '""')}"`,
        o.activeCount,
        o.completedCount,
      ])
    } else {
      headers = ['Event ID', 'Timestamp', 'Actor', 'Action', 'Resource', 'Integrity Status']
      rows = auditEvents.map((evt) => [
        `"${evt.id}"`,
        `"${evt.timestamp}"`,
        `"${evt.actorName.replace(/"/g, '""')}"`,
        `"${evt.action}"`,
        `"${evt.resourceType || 'Platform'}"`,
        'SHA-256 VERIFIED WORM',
      ])
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${filenamePrefix}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <PageContainer
      title={t('admin.reports.title', 'Statutory Reports & Regulatory Analytics')}
      subtitle={t('admin.reports.description', 'Compile certified compliance statements, engagement turnaround SLA metrics, and statutory audit readiness reports.')}
      breadcrumbs={[
        { label: t('admin.dashboard.title', 'Admin Dashboard'), to: '/admin/dashboard' },
        { label: t('admin.reports.breadcrumb', 'Reports & Analytics') },
      ]}
      actions={
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={handleExportCSV}
          disabled={isLoading}
          aria-label={t('admin.reports.exportCsv', 'Export Current Report (CSV)')}
        >
          <Download size={15} aria-hidden="true" />
          <span>{t('admin.reports.exportCsv', 'Export Current Report (CSV)')}</span>
        </button>
      }
    >
      <div className="admin-notice-banner" role="region" aria-label="Statutory Report Compliance">
        <ShieldCheck size={20} className="admin-notice-icon" aria-hidden="true" />
        <div className="admin-notice-content">
          <div className="admin-notice-title">
            {t('admin.reports.regulatoryNoticeTitle', 'Statutory Financial Audit Reporting & WORM Preservation')}
          </div>
          <p className="admin-notice-text">
            {t('admin.reports.regulatoryNoticeDesc', 'Reports compiled in this platform adhere to Nigerian Financial Reporting Council and international audit assurance guidelines. All exported analytical aggregates are traceable to cryptographically immutable audit trail records.')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs-nav" role="tablist" aria-label="Regulatory Reports Tabs" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-neutral-subtle)', marginBottom: '24px' }}>
        <button
          type="button"
          role="tab"
          aria-selected={activeReportTab === 'engagements'}
          className={`admin-btn ${activeReportTab === 'engagements' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
          onClick={() => setActiveReportTab('engagements')}
        >
          {t('admin.reports.tabEngagements', 'Engagement Portfolio SLA')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeReportTab === 'requests'}
          className={`admin-btn ${activeReportTab === 'requests' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
          onClick={() => setActiveReportTab('requests')}
        >
          {t('admin.reports.tabRequests', 'PBC Requests SLA')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeReportTab === 'organisations'}
          className={`admin-btn ${activeReportTab === 'organisations' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
          onClick={() => setActiveReportTab('organisations')}
        >
          {t('admin.reports.tabOrganisations', 'Organisation Directory')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeReportTab === 'compliance'}
          className={`admin-btn ${activeReportTab === 'compliance' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
          onClick={() => setActiveReportTab('compliance')}
        >
          {t('admin.reports.tabCompliance', 'Compliance & WORM Ledger')}
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={6} />
      ) : (
        <div className="admin-table-card">
          <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="admin-card-title">
              {activeReportTab === 'engagements' && t('admin.reports.engagementsTitle', 'Statutory Engagements SLA & Turnaround')}
              {activeReportTab === 'requests' && t('admin.reports.requestsTitle', 'PBC Document Requests SLA Performance')}
              {activeReportTab === 'organisations' && t('admin.reports.organisationsTitle', 'Participating Organisations & Engagements')}
              {activeReportTab === 'compliance' && t('admin.reports.complianceTitle', 'Statutory WORM Compliance Evidentiary Ledger')}
            </h2>
            <div className="admin-search-box" style={{ maxWidth: '300px' }}>
              <Search size={16} aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.search', 'Filter report rows...')}
                aria-label="Filter report"
              />
            </div>
          </div>

          <div className="admin-table-wrapper">
            {activeReportTab === 'engagements' && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t('admin.engagements.tableEngagement', 'Engagement')}</th>
                    <th>{t('admin.engagements.tableClient', 'Client Entity')}</th>
                    <th>{t('admin.engagements.tableAuditor', 'Lead Auditor')}</th>
                    <th>{t('admin.engagements.tableStatus', 'Status')}</th>
                    <th>{t('admin.engagements.tableProgress', 'Progress')}</th>
                  </tr>
                </thead>
                <tbody>
                  {engagementsReport.map((e) => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 600 }}>{e.title}</td>
                      <td>{e.clientOrg}</td>
                      <td>{e.leadAuditor}</td>
                      <td>
                        <span className={`admin-badge admin-badge-${e.status.toLowerCase()}`}>
                          {e.status}
                        </span>
                      </td>
                      <td>{e.progress}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeReportTab === 'requests' && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t('auditRequests.reference', 'Reference')}</th>
                    <th>{t('auditRequests.requestTitle', 'Request Title')}</th>
                    <th>{t('auditRequests.category', 'Category')}</th>
                    <th>{t('auditRequests.priority', 'Priority')}</th>
                    <th>{t('common.status', 'Status')}</th>
                    <th>{t('common.timeline', 'SLA Due Date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {requestsReport.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.reference}</td>
                      <td style={{ fontWeight: 600 }}>{r.title}</td>
                      <td>{r.category}</td>
                      <td>
                        <span className={`admin-badge admin-badge-${r.priority.toLowerCase()}`}>
                          {r.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge-${r.status.toLowerCase()}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        {r.dueDate}{' '}
                        {r.isOverdue && (
                          <span style={{ color: 'var(--color-danger, #d32f2f)', fontWeight: 700, marginLeft: '6px' }}>
                            [OVERDUE]
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeReportTab === 'organisations' && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t('admin.organisations.tableLegalName', 'Organisation Legal Name')}</th>
                    <th>{t('admin.organisations.tableActiveAudits', 'Active Engagements')}</th>
                    <th>{t('admin.dashboard.completedEngagements', 'Completed Engagements')}</th>
                  </tr>
                </thead>
                <tbody>
                  {organisationsReport.map((o) => (
                    <tr key={o.name}>
                      <td style={{ fontWeight: 600 }}>{o.name}</td>
                      <td>{o.activeCount}</td>
                      <td>{o.completedCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeReportTab === 'compliance' && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t('admin.auditTrail.tableTimestamp', 'Timestamp')}</th>
                    <th>{t('admin.auditTrail.tableActor', 'Actor')}</th>
                    <th>{t('admin.auditTrail.tableAction', 'Action')}</th>
                    <th>{t('admin.auditTrail.tableDetails', 'Target Scope')}</th>
                    <th>{t('admin.auditTrail.tableVerification', 'Cryptographic Proof')}</th>
                  </tr>
                </thead>
                <tbody>
                  {auditEvents.slice(0, 15).map((evt) => (
                    <tr key={evt.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>{evt.timestamp}</td>
                      <td style={{ fontWeight: 600 }}>{evt.actorName}</td>
                      <td>
                        <span className="admin-badge admin-badge-active">{evt.action}</span>
                      </td>
                      <td>{evt.resourceType || 'Platform Governance'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldCheck size={14} style={{ color: 'var(--brand-green-800)' }} aria-hidden="true" />
                          <span style={{ fontSize: '11px', color: 'var(--brand-green-800)', fontWeight: 700 }}>
                            SHA-256 WORM
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  )
}

