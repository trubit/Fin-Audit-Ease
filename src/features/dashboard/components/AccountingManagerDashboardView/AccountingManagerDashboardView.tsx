import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  Layers,
  FileCheck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { AuditRequest } from '@/features/auditRequests/types'
import type { Engagement } from '@/features/engagements/types'
import type { UserProfile } from '@/features/auth/types'
import type { Checklist } from '@/features/checklists/types'
import { formatUserRole } from '@/features/auth/utils/roleUtils'
import { formatDate, getYearEndInfo } from '@/utils/dateUtils'
import './AccountingManagerDashboardView.css'

export interface AccountingManagerDashboardViewProps {
  readonly auditRequests: readonly AuditRequest[]
  readonly engagements?: readonly Engagement[]
  readonly user: UserProfile | null
  readonly weeklyChecklist?: Checklist
  readonly monthEndChecklist?: Checklist
  readonly preAuditChecklist?: Checklist
  readonly onRefresh?: () => void
}

export const AccountingManagerDashboardView: React.FC<AccountingManagerDashboardViewProps> = ({
  auditRequests,
  user,
  weeklyChecklist,
  monthEndChecklist,
  preAuditChecklist,
}) => {
  const { t } = useTranslation()

  // Year End Info
  const yearEndInfo = useMemo(() => {
    return getYearEndInfo(user?.accountingYearEndDate)
  }, [user?.accountingYearEndDate])

  // Progress metrics
  const weeklyPct = useMemo(() => {
    if (!weeklyChecklist || !weeklyChecklist.totalItemsCount) return 0
    return Math.round((weeklyChecklist.completedItemsCount / weeklyChecklist.totalItemsCount) * 100)
  }, [weeklyChecklist])

  const monthEndPct = useMemo(() => {
    if (!monthEndChecklist || !monthEndChecklist.totalItemsCount) return 0
    return Math.round((monthEndChecklist.completedItemsCount / monthEndChecklist.totalItemsCount) * 100)
  }, [monthEndChecklist])

  // Outstanding external requests from auditors
  const outstandingRequests = useMemo(
    () => auditRequests.filter((r) => r.status !== 'ACCEPTED'),
    [auditRequests]
  )

  const unassignedRequests = useMemo(
    () => outstandingRequests.filter((r) => !r.assigneeId && !r.assigneeName),
    [outstandingRequests]
  )

  // Statutory Tax Deadlines (Nigerian Finance Act / CITA / PITA)
  const taxSchedules = useMemo(() => {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    // PAYE due 10th of next month
    const payeDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 10)
    // VAT due 21st of next month
    const vatDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 21)
    // WHT due 21st of next month
    const whtDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 21)

    return [
      {
        name: 'Monthly PAYE Remittance',
        statutoryDate: payeDate.toISOString().split('T')[0],
        rule: 'Due 10th of subsequent month',
        status: 'CURRENT',
      },
      {
        name: 'VAT Monthly Return',
        statutoryDate: vatDate.toISOString().split('T')[0],
        rule: 'Due 21st of subsequent month',
        status: 'CURRENT',
      },
      {
        name: 'Withholding Tax (WHT)',
        statutoryDate: whtDate.toISOString().split('T')[0],
        rule: 'Due 21st of subsequent month',
        status: 'CURRENT',
      },
    ]
  }, [])

  return (
    <div className="acc-manager-dash">
      {/* Editorial Ribbon */}
      <div className="acc-manager-ribbon">
        <div className="acc-manager-ribbon-left">
          <div className="acc-manager-ribbon-icon" aria-hidden="true">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="acc-manager-ribbon-title">
              {formatUserRole(user?.role, t)} • {user?.fullName || t('roles.accountingManager', 'Corporate Accounting Manager')}
            </h1>
            <p className="acc-manager-ribbon-subtitle">
              {user?.organizationName || 'Corporate Accounting Department'} • {t('accManager.ribbonSubtitle', 'Internal Controls & Audit Readiness')}
            </p>
          </div>
        </div>

        <div className="acc-manager-ribbon-metrics">
          <div className="acc-manager-metric-card">
            <span className="acc-manager-metric-val">{monthEndPct}%</span>
            <span className="acc-manager-metric-lbl">{t('accManager.monthEndClose', 'Month-End Close')}</span>
          </div>
          <div className="acc-manager-metric-card">
            <span className="acc-manager-metric-val">{weeklyPct}%</span>
            <span className="acc-manager-metric-lbl">{t('accManager.weeklyControls', 'Weekly Controls')}</span>
          </div>
          <div className="acc-manager-metric-card">
            <span
              className="acc-manager-metric-val"
              style={{ color: unassignedRequests.length > 0 ? '#fde047' : '#ffffff' }}
            >
              {unassignedRequests.length}
            </span>
            <span className="acc-manager-metric-lbl">{t('accManager.unassignedPbcs', 'Unassigned PBCs')}</span>
          </div>
          <div className="acc-manager-metric-card">
            <span className="acc-manager-metric-val">{yearEndInfo.daysRemaining ?? '-'}</span>
            <span className="acc-manager-metric-lbl">{t('accManager.daysToYearEnd', 'Days to Year-End')}</span>
          </div>
        </div>
      </div>

      {/* Statutory Tax Compliance Radar */}
      <div className="acc-manager-card">
        <div className="acc-manager-card-header">
          <h2 className="acc-manager-card-title">
            <ShieldCheck size={18} color="#2563eb" aria-hidden="true" />
            <span>{t('accManager.taxRadarTitle', 'Statutory Tax & Regulatory Compliance Radar')}</span>
          </h2>
          <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            {t('accManager.taxRadarSubtitle', 'NRS / FIRS Statutory Timelines')}
          </span>
        </div>

        <div className="acc-manager-tax-grid">
          {taxSchedules.map((tax, idx) => (
            <div key={idx} className="acc-manager-tax-item">
              <span className="acc-manager-tax-name">{tax.name}</span>
              <span className="acc-manager-tax-meta">{tax.rule}</span>
              <div className="acc-manager-tax-status">
                <CheckCircle2 size={13} color="#059669" aria-hidden="true" />
                <span style={{ color: '#047857' }}>{t('accManager.statutoryDue', { date: formatDate(tax.statutoryDate), defaultValue: `Statutory Due: ${formatDate(tax.statutoryDate)}` })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Split: Internal Financial Controls vs External Auditor Requests */}
      <div className="acc-manager-grid-2col">
        {/* Left: Financial Controls & Close Oversight */}
        <div className="acc-manager-card">
          <div className="acc-manager-card-header">
            <h2 className="acc-manager-card-title">
              <Layers size={18} aria-hidden="true" />
              <span>{t('accManager.internalControlsTitle', 'Internal Financial Controls & Close')}</span>
            </h2>
            <Link to="/month-end" className="acc-manager-card-action">
              <span>{t('accManager.monthEndSignOff', 'Month-End Sign-Off')}</span>
              <ArrowRight size={14} style={{ display: 'inline', marginLeft: 4 }} aria-hidden="true" />
            </Link>
          </div>

          <div>
            <div className="acc-manager-checklist-row">
              <div>
                <div className="acc-manager-checklist-title">{t('accManager.weeklyControlsTitle', 'Weekly Reconciliation Controls')}</div>
                <div className="acc-manager-checklist-desc">
                  {t('accManager.weeklyControlsDesc', {
                    completed: weeklyChecklist?.completedItemsCount || 0,
                    total: weeklyChecklist?.totalItemsCount || 9,
                    defaultValue: `Bank, POS, petty cash & supplier invoices (${weeklyChecklist?.completedItemsCount || 0} / ${weeklyChecklist?.totalItemsCount || 9} completed)`
                  })}
                </div>
              </div>
              <Link to="/weekly" className="btn btn-outline btn-xs">
                {t('accManager.reviewWeek', 'Review Week')}
              </Link>
            </div>

            <div className="acc-manager-checklist-row">
              <div>
                <div className="acc-manager-checklist-title">{t('accManager.monthEndChecklistTitle', 'Month-End Close Checklist')}</div>
                <div className="acc-manager-checklist-desc">
                  {t('accManager.monthEndChecklistDesc', {
                    completed: monthEndChecklist?.completedItemsCount || 0,
                    total: monthEndChecklist?.totalItemsCount || 22,
                    defaultValue: `22 statutory close items across 6 accounting categories (${monthEndChecklist?.completedItemsCount || 0} / ${monthEndChecklist?.totalItemsCount || 22} completed)`
                  })}
                </div>
              </div>
              <Link to="/month-end" className="btn btn-primary btn-xs">
                {t('accManager.lockSignOff', 'Lock & Sign-Off')}
              </Link>
            </div>

            <div className="acc-manager-checklist-row">
              <div>
                <div className="acc-manager-checklist-title">{t('accManager.preAuditTitle', 'Pre-Audit Preparation Runway')}</div>
                <div className="acc-manager-checklist-desc">
                  {t('accManager.preAuditDesc', {
                    completed: preAuditChecklist?.completedItemsCount || 0,
                    defaultValue: `Year-end audit readiness package (${preAuditChecklist?.completedItemsCount || 0} items complete)`
                  })}
                </div>
              </div>
              <Link to="/pre-audit" className="btn btn-outline btn-xs">
                {t('accManager.openRunway', 'Open Runway')}
              </Link>
            </div>

            <div className="acc-manager-checklist-row">
              <div>
                <div className="acc-manager-checklist-title">{t('accManager.assetRegisterTitle', 'Asset Verification Register')}</div>
                <div className="acc-manager-checklist-desc">
                  {t('accManager.assetRegisterDesc', 'Fixed asset physical tagging, depreciation & custodian verification')}
                </div>
              </div>
              <Link to="/asset-verification" className="btn btn-outline btn-xs">
                {t('accManager.viewRegister', 'View Register')}
              </Link>
            </div>
          </div>
        </div>

        {/* Right: External Auditor Requests & SME Assignment */}
        <div className="acc-manager-card">
          <div className="acc-manager-card-header">
            <h2 className="acc-manager-card-title">
              <FileCheck size={18} aria-hidden="true" />
              <span>{t('accManager.auditorRequestsTitle', 'Auditor Requests & SME Assignments')}</span>
            </h2>
            <Link to="/audit-requests" className="acc-manager-card-action">
              <span>{t('common.viewAll', 'View All')} ({auditRequests.length})</span>
              <ArrowRight size={14} style={{ display: 'inline', marginLeft: 4 }} aria-hidden="true" />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {outstandingRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                <CheckCircle2 size={32} color="#059669" style={{ margin: '0 auto 6px auto' }} />
                <p style={{ margin: 0, fontWeight: 600 }}>{t('accManager.zeroOutstandingRequests', 'Zero outstanding auditor requests.')}</p>
              </div>
            ) : (
              outstandingRequests.slice(0, 4).map((req) => (
                <div
                  key={req.id}
                  style={{
                    padding: '0.75rem',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                      {req.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                      {req.referenceCode} • {t('auditRequests.dueDate', 'Due')}: {formatDate(req.dueDate)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: req.assigneeName ? '#047857' : '#b45309', marginTop: 2 }}>
                      <UserCheck size={12} style={{ display: 'inline', marginRight: 3 }} aria-hidden="true" />
                      {t('auditRequests.assignee', 'Assignee')}: {req.assigneeName || t('accManager.unassignedNeedsAssignment', 'Unassigned: Needs Assignment')}
                    </div>
                  </div>
                  <Link to={`/audit-requests/${req.id}`} className="btn btn-outline btn-xs">
                    {t('accManager.respond', 'Respond')}
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
