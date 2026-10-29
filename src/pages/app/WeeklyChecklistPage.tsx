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
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  useWeeklyChecklist,
  useSubmitChecklistForReview,
  useSignOffChecklist,
  ForwardFlowModal,
  buildWeeklyItemsForWeek,
  type Checklist,
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

const AVAILABLE_WEEKS: WeekOption[] = [
  {
    weekNumber: 43,
    label: 'Week 43 (19 Oct – 25 Oct 2026)',
    startDate: '2026-10-19',
    endDate: '2026-10-25',
    isCurrent: true,
  },
  {
    weekNumber: 42,
    label: 'Week 42 (12 Oct – 18 Oct 2026)',
    startDate: '2026-10-12',
    endDate: '2026-10-18',
    isCurrent: false,
  },
  {
    weekNumber: 41,
    label: 'Week 41 (05 Oct – 11 Oct 2026)',
    startDate: '2026-10-05',
    endDate: '2026-10-11',
    isCurrent: false,
  },
  {
    weekNumber: 40,
    label: 'Week 40 (28 Sep – 04 Oct 2026)',
    startDate: '2026-10-04',
    endDate: '2026-10-04',
    isCurrent: false,
  },
]

export const WeeklyChecklistPage: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()

  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(43)
  const [forwardModalOpen, setForwardModalOpen] = useState<boolean>(false)

  const isAuditor =
    user?.role === 'AUDITOR' || user?.role === 'AUDIT_MANAGER' || user?.role === 'ADMIN'
  const isManager =
    user?.role === 'ADMIN' || user?.role === 'AUDIT_MANAGER'

  const currentWeekOption = useMemo(
    () => AVAILABLE_WEEKS.find((w) => w.weekNumber === selectedWeekNumber) || AVAILABLE_WEEKS[0],
    [selectedWeekNumber]
  )

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

  // Use real backend data if returned, otherwise fallback to canonical 9-item structure for display
  const checklist: Checklist = useMemo(() => {
    if (checklistData) return checklistData

    const items = buildWeeklyItemsForWeek(
      `weekly-${currentWeekOption.weekNumber}`,
      currentWeekOption.weekNumber,
      currentWeekOption.endDate
    )

    return {
      id: `weekly-${currentWeekOption.weekNumber}`,
      type: 'WEEKLY_CHECKPOINT',
      title: t('checklists.weeklyChecklistTitle', 'Weekly Checklist'),
      periodLabel: currentWeekOption.label,
      reportingWeek: currentWeekOption.weekNumber,
      startDate: currentWeekOption.startDate,
      endDate: currentWeekOption.endDate,
      items,
      totalItemsCount: items.length,
      completedItemsCount: 0,
      reviewedItemsCount: 0,
    }
  }, [checklistData, currentWeekOption, t])

  const completedCount = useMemo(() => {
    return checklist.items.filter(
      (i) => i.status === 'COMPLETED' || i.status === 'DONE' || i.status === 'REVIEWED'
    ).length
  }, [checklist.items])

  const missingEvidenceCount = useMemo(() => {
    return checklist.items.filter(
      (i) => i.requiresEvidence && (i.attachedDocumentCount || 0) === 0
    ).length
  }, [checklist.items])

  const awaitingReviewCount = useMemo(() => {
    return checklist.items.filter((i) => i.status === 'IN_PROGRESS').length
  }, [checklist.items])

  const handleSubmitForReview = () => {
    submitReview(checklist.id, {
      onSuccess: () => {
        void refetch()
      },
    })
  }

  const handleSignOff = () => {
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
        'Finance Module — Record weekly financial activities, reconcile bank & petty cash, match supplier invoices, and prepare postings for month-end close.'
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

          {!isAuditor && !checklist.isLocked && (
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

          {!isAuditor && !checklist.isLocked && !checklist.isSubmittedForReview && (
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

          {isManager && !checklist.isLocked && (
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
                {AVAILABLE_WEEKS.map((w) => (
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

        {/* Loading State */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            <LoadingSkeleton height="6rem" />
            <LoadingSkeleton height="16rem" />
          </div>
        )}

        {/* 9 Weekly Checklist Items Table */}
        {!isLoading && (
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
      <ForwardFlowModal
        isOpen={forwardModalOpen}
        onClose={() => setForwardModalOpen(false)}
        itemTitle={checklist.title}
        itemCategory="Weekly Operational Postings"
        sourceStage="WEEKLY"
        onForwardSuccess={handleForwardSuccess}
      />
    </PageContainer>
  )
}
