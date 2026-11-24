import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarClock,
  RefreshCw,
  Send,
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  FileCheck,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton/LoadingSkeleton'
import { EmptyState } from '@/components/feedback/EmptyState/EmptyState'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  useWeeklyChecklist,
  useSubmitChecklistForReview,
  useSignOffChecklist,
  ForwardFlowModal,
  type ForwardTargetStage,
} from '@/features/checklists'
import { ChecklistTable } from '@/features/checklists/components/ChecklistTable/ChecklistTable'
import './WeeklyChecklistPage.css'

interface WeekOption {
  readonly weekNumber: number
  readonly label: string
  readonly startDate: string
  readonly endDate: string
  readonly isCurrent: boolean
}

const generateAvailableWeeks = (): WeekOption[] => {
  const weeks: WeekOption[] = []
  const now = new Date()

  for (let i = 0; i < 4; i++) {
    const target = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)

    // Calculate week number
    const startOfYear = new Date(target.getFullYear(), 0, 1)
    const pastDaysOfYear = (target.getTime() - startOfYear.getTime()) / 86400000
    const weekNum = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7)

    // Calculate Monday and Sunday of this week
    const day = target.getDay()
    const diffToMonday = target.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(target.getFullYear(), target.getMonth(), diffToMonday)
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6)

    const monStr = monday.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })
    const sunStr = sunday.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
    const label =
      i === 0
        ? `Week ${weekNum} (${monStr} – ${sunStr})`
        : `Week ${weekNum} (${monStr} – ${sunStr})`

    weeks.push({
      weekNumber: weekNum,
      label,
      startDate: monday.toISOString().split('T')[0],
      endDate: sunday.toISOString().split('T')[0],
      isCurrent: i === 0,
    })
  }
  return weeks
}

export const WeeklyChecklistPage: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()

  const availableWeeks = useMemo(() => generateAvailableWeeks(), [])
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(() => availableWeeks[0]?.weekNumber || 1)
  const [forwardModalOpen, setForwardModalOpen] = useState<boolean>(false)

  const isAuditor =
    user?.role === 'AUDITOR' || user?.role === 'AUDIT_MANAGER' || user?.role === 'ADMIN'
  const isManager =
    user?.role === 'ADMIN' ||
    user?.role === 'ACCOUNTING_MANAGER' ||
    user?.role === 'AUDIT_MANAGER'

  const {
    data: response,
    isLoading,
    refetch,
  } = useWeeklyChecklist({
    weekNumber: selectedWeekNumber,
  })

  const { mutate: submitReview, isPending: isSubmittingReview } = useSubmitChecklistForReview()
  const { mutate: signOff, isPending: isSigningOff } = useSignOffChecklist()

  const checklistData = response?.data

  // Use real backend data only (strictly no fake synthesized items)
  const checklist = checklistData

  const completedCount = useMemo(() => {
    if (!checklist?.items) return 0
    return checklist.items.filter(
      (i) => i.status === 'COMPLETED' || i.status === 'DONE' || i.status === 'REVIEWED'
    ).length
  }, [checklist?.items])

  const missingEvidenceCount = useMemo(() => {
    if (!checklist?.items) return 0
    return checklist.items.filter(
      (i) => i.requiresEvidence && (i.attachedDocumentCount || 0) === 0
    ).length
  }, [checklist?.items])

  const awaitingReviewCount = useMemo(() => {
    if (!checklist?.items) return 0
    return checklist.items.filter((i) => i.status === 'IN_PROGRESS').length
  }, [checklist?.items])

  const handleSubmitForReview = () => {
    if (!checklist) return
    submitReview(checklist.id, {
      onSuccess: () => {
        void refetch()
      },
    })
  }

  const handleSignOff = () => {
    if (!checklist) return
    signOff(
      {
        checklistId: checklist.id,
        payload: { lockPeriod: true },
      },
      {
        onSuccess: () => {
          void refetch()
        },
      }
    )
  }

  const handleForwardSuccess = (_targetStage: ForwardTargetStage) => {
    void refetch()
  }

  return (
    <PageContainer
      title={t('checklists.weeklyTitle', 'Weekly Checklist')}
      subtitle={t(
        'checklists.weeklySubtitle',
        'Finance Module: Record weekly financial activities, reconcile bank & petty cash, match supplier invoices, and prepare postings for month-end close.'
      )}
      maxWidth="xl"
      actions={
        <div style={{ display: 'flex', gap: 'var(--spacing-3)', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline btn-md"
            onClick={() => void refetch()}
            disabled={isLoading}
            aria-label={t('common.refresh', 'Refresh')}
          >
            <RefreshCw size={15} className={isLoading ? 'spin-animation' : ''} aria-hidden="true" />
            <span>{t('common.refresh', 'Refresh')}</span>
          </button>

          {!isAuditor && checklist && !checklist.isLocked && (
            <button
              type="button"
              className="btn btn-outline btn-md"
              onClick={() => setForwardModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Send size={15} />
              <span>{t('pipeline.forwardToMonthEndBtn', 'Forward to Month-End')}</span>
            </button>
          )}

          {!isAuditor && checklist && !checklist.isLocked && !checklist.isSubmittedForReview && (
            <button
              type="button"
              className="btn btn-primary btn-md"
              onClick={handleSubmitForReview}
              disabled={isSubmittingReview}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <FileCheck size={16} />
              <span>{t('checklists.submitWeeklyForReview', 'Submit for Review')}</span>
            </button>
          )}

          {isManager && checklist && !checklist.isLocked && (
            <button
              type="button"
              className="btn btn-success btn-md"
              onClick={handleSignOff}
              disabled={isSigningOff}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--color-emerald-700)',
                color: '#ffffff',
              }}
            >
              <ShieldCheck size={16} />
              <span>{t('checklists.signOffAndLock', 'Supervisor Sign-Off & Lock')}</span>
            </button>
          )}
        </div>
      }
    >
      <div style={{ marginBottom: 'var(--spacing-5)' }}>
        <Breadcrumbs
          items={[
            { label: t('navigation.dashboard', 'Dashboard'), to: '/dashboard' },
            { label: t('financeModule.title', 'Finance Module') },
            { label: t('checklists.weeklyTitle', 'Weekly Checklist') },
          ]}
        />
      </div>

      <div className="weekly-page-root">
        {/* Module Identity Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-success" style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {t('financeModule.badge', 'Finance Module')}
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            {t('checklists.accountingTeamOnly', 'Accounting Team Operational Register')}
          </span>
        </div>

        {/* Reporting Week Context Selector Bar */}
        <div className="weekly-context-bar">
          <div className="weekly-period-selector">
            <CalendarClock size={20} style={{ color: 'var(--color-primary-700)' }} />
            <div>
              <label htmlFor="reporting-week-select" className="sr-only">
                {t('checklists.selectReportingWeek', 'Select Reporting Week')}
              </label>
              <select
                id="reporting-week-select"
                className="checklist-select"
                value={selectedWeekNumber}
                onChange={(e) => setSelectedWeekNumber(Number(e.target.value))}
                style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}
              >
                {availableWeeks.map((w) => (
                  <option key={w.weekNumber} value={w.weekNumber}>
                    {w.label} {w.isCurrent ? `(${t('checklists.currentWeek', 'Current')})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <Link to="/month-end" className="btn btn-outline btn-sm">
              <Layers size={14} />
              <span>{t('checklists.monthEndTitle', 'Month-End Close Checklist')}</span>
            </Link>
          </div>
        </div>

        {/* Operational Metrics Cards (Section 5) */}
        {checklist && (
          <div className="weekly-metrics-grid">
            <div className="weekly-metric-card">
              <div className="weekly-metric-icon icon-emerald">
                <CheckCircle2 size={22} />
              </div>
              <div className="weekly-metric-content">
                <p className="weekly-metric-label">{t('checklists.completedItems', 'Completed Items')}</p>
                <p className="weekly-metric-number">
                  {completedCount} / {checklist.totalItemsCount}
                </p>
              </div>
            </div>

            <div className="weekly-metric-card">
              <div className="weekly-metric-icon icon-amber">
                <Clock size={22} />
              </div>
              <div className="weekly-metric-content">
                <p className="weekly-metric-label">{t('checklists.inProgressItems', 'Awaiting Verification')}</p>
                <p className="weekly-metric-number">{awaitingReviewCount}</p>
              </div>
            </div>

            <div className="weekly-metric-card">
              <div className="weekly-metric-icon icon-rose">
                <AlertTriangle size={22} />
              </div>
              <div className="weekly-metric-content">
                <p className="weekly-metric-label">{t('checklists.missingEvidence', 'Missing Evidence')}</p>
                <p className="weekly-metric-number">{missingEvidenceCount}</p>
              </div>
            </div>

            <div className="weekly-metric-card">
              <div className="weekly-metric-icon icon-slate">
                <ShieldCheck size={22} />
              </div>
              <div className="weekly-metric-content">
                <p className="weekly-metric-label">{t('checklists.signOffStatus', 'Supervisor Status')}</p>
                <p className="weekly-metric-number" style={{ fontSize: '0.875rem' }}>
                  {checklist.isLocked
                    ? t('checklists.statusSignedOff', 'Signed Off & Locked')
                    : checklist.isSubmittedForReview
                    ? t('checklists.statusUnderReview', 'Under Review')
                    : t('checklists.statusPendingSubmission', 'Open Postings')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            <LoadingSkeleton height="6rem" />
            <LoadingSkeleton height="16rem" />
          </div>
        )}

        {/* Empty State when no real backend checklist exists for this week */}
        {!isLoading && !checklist && (
          <EmptyState
            icon={<CalendarClock size={36} />}
            title={t('checklists.emptyWeeklyTitle', 'No Weekly Checklist Available')}
            description={t(
              'checklists.emptyWeeklyDesc',
              'No weekly checkpoint checklist records exist for this period yet. Checklists are provisioned for active audit engagements.'
            )}
          />
        )}

        {/* Weekly Checklist Items Table */}
        {!isLoading && checklist && (
          <ChecklistTable
            checklist={checklist}
            readOnly={isAuditor || !!checklist.isLocked}
            readOnlyReason={checklist.isLocked ? 'LOCKED' : isAuditor ? 'AUDITOR' : undefined}
            isManager={isManager}
            onRefresh={() => void refetch()}
          />
        )}
      </div>

      {/* Forwarding Modal */}
      {checklist && (
        <ForwardFlowModal
          isOpen={forwardModalOpen}
          onClose={() => setForwardModalOpen(false)}
          itemTitle={checklist.title}
          itemCategory="Weekly Operational Postings"
          sourceStage="WEEKLY"
          onForwardSuccess={handleForwardSuccess}
        />
      )}
    </PageContainer>
  )
}
