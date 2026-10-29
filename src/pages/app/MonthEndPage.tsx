import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  RefreshCw,
  Layers,
  Calendar,
  Clock,
  History,
  BellRing,
  ShieldCheck,
  Send,
  Lock,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton/LoadingSkeleton'
import { EmptyState } from '@/components/feedback/EmptyState/EmptyState'
import { Badge } from '@/components/common/Badge/Badge'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  useMonthEndChecklist,
  useSubmitChecklistForReview,
  useSignOffChecklist,
  PipelineFlowBanner,
  ForwardFlowModal,
  buildMonthEndItemsForPeriod,
  type Checklist,
} from '@/features/checklists'
import { ChecklistTable } from '@/features/checklists/components/ChecklistTable/ChecklistTable'
import { getMonthEndInfo } from '@/utils/dateUtils'

const generateAvailablePeriods = (currentMonthText: string, baseTimestamp: number) => {
  const list: Array<{ value: string; label: string; isCurrent: boolean }> = []
  const now = new Date(baseTimestamp)
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const periodKey = `${year}-${month}`
    const monthName = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    list.push({
      value: periodKey,
      label: i === 0 ? `${monthName} (${currentMonthText})` : monthName,
      isCurrent: i === 0,
    })
  }
  return list
}

export const MonthEndPage: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [initialTimestamp] = useState(() => Date.now())
  const [forwardModalOpen, setForwardModalOpen] = useState(false)

  const isAuditorRole =
    user?.role === 'AUDITOR' || user?.role === 'AUDIT_MANAGER' || user?.role === 'ADMIN'
  const isManagerRole =
    user?.role === 'ADMIN' || user?.role === 'AUDIT_MANAGER'

  const currentMonthText = t('checklists.currentMonth', 'Current')

  // Generate historical periods safely (Current month + previous 5 months)
  const availablePeriods = useMemo(() => {
    return generateAvailablePeriods(currentMonthText, initialTimestamp)
  }, [currentMonthText, initialTimestamp])

  const [selectedPeriod, setSelectedPeriod] = useState<string>(availablePeriods[0].value)

  const isCurrentPeriod = selectedPeriod === availablePeriods[0].value
  const isHistoricalPeriod = !isCurrentPeriod

  // Fetch month-end checklist for the selected period
  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useMonthEndChecklist(
    isCurrentPeriod ? undefined : { period: selectedPeriod }
  )

  const { mutate: submitReview, isPending: isSubmittingReview } = useSubmitChecklistForReview()
  const { mutate: signOff, isPending: isSigningOff } = useSignOffChecklist()

  const rawChecklist = response?.data

  // Real backend checklist or canonical 21-item Month-End Close structure
  const checklist: Checklist | undefined = useMemo(() => {
    if (rawChecklist) return rawChecklist
    if (isCurrentPeriod) {
      const now = new Date(initialTimestamp)
      const year = now.getFullYear()
      const month = now.getMonth()
      const items = buildMonthEndItemsForPeriod(`month-end-${selectedPeriod}`, year, month)
      return {
        id: `month-end-${selectedPeriod}`,
        type: 'MONTH_END_CLOSE',
        title: t('checklists.monthEndTitle', 'Month-End Close Checklist'),
        periodLabel: availablePeriods[0].label,
        items,
        totalItemsCount: items.length,
        completedItemsCount: 0,
        reviewedItemsCount: 0,
      }
    }
    return undefined
  }, [rawChecklist, isCurrentPeriod, initialTimestamp, selectedPeriod, availablePeriods, t])

  // Calculate real Month-End countdown
  const monthEndInfo = useMemo(() => {
    return getMonthEndInfo(initialTimestamp)
  }, [initialTimestamp])

  const readOnly = isAuditorRole || isHistoricalPeriod || !!checklist?.isArchived || !!checklist?.isLocked
  const readOnlyReason = isAuditorRole ? 'AUDITOR' : checklist?.isLocked ? 'LOCKED' : 'ARCHIVED'

  const handleSubmitReview = () => {
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

  const pageActions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
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

      {!isAuditorRole && !checklist?.isLocked && (
        <button
          type="button"
          className="btn btn-primary btn-md"
          onClick={() => setForwardModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Send size={15} />
          <span>{t('pipeline.forwardToPreAuditBtn', 'Forward to Pre-Audit')}</span>
        </button>
      )}

      {!isAuditorRole && !checklist?.isLocked && !checklist?.isSubmittedForReview && (
        <button
          type="button"
          className="btn btn-primary btn-md"
          onClick={handleSubmitReview}
          disabled={isSubmittingReview}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ShieldCheck size={16} />
          <span>{t('checklists.submitForReview', 'Submit for Review')}</span>
        </button>
      )}

      {isManagerRole && !checklist?.isLocked && (
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
          <Lock size={15} />
          <span>{t('checklists.signOffAndLock', 'Supervisor Sign-Off & Lock')}</span>
        </button>
      )}

      <Link
        to="/pre-audit"
        className="btn btn-outline btn-md"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        <span>{t('checklists.preAuditTitle', 'Pre-Audit Preparation')}</span>
      </Link>
    </div>
  )

  return (
    <PageContainer
      title={t('checklists.monthEndTitle')}
      subtitle={t('checklists.monthEndSubtitle')}
      actions={pageActions}
      maxWidth="xl"
    >
      <div style={{ marginBottom: 'var(--spacing-5)' }}>
        <Breadcrumbs
          items={[
            { label: t('navigation.dashboard'), to: '/dashboard' },
            { label: t('navigation.checklists'), to: '/checklists' },
            { label: t('checklists.monthEndTitle') },
          ]}
        />
      </div>

      {/* Visual Pipeline Progression Banner */}
      <PipelineFlowBanner currentStage="month-end" />

      {/* Month-End Operational Context & History Bar */}
      <div
        className="card"
        style={{
          padding: 'var(--spacing-4) var(--spacing-5)',
          marginBottom: 'var(--spacing-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--spacing-4)',
          backgroundColor: isHistoricalPeriod ? 'var(--color-slate-50)' : 'var(--bg-surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              color: 'var(--color-slate-900)',
            }}
          >
            <Calendar size={18} className="text-primary" aria-hidden="true" />
            <span>
              {checklist?.periodLabel || monthEndInfo.monthYearLabel}
            </span>
          </div>

          {/* Month-End Countdown Pill (Section 26) */}
          {isCurrentPeriod && (
            <Badge
              variant={
                monthEndInfo.isPassed
                  ? 'neutral'
                  : monthEndInfo.isToday
                  ? 'danger'
                  : monthEndInfo.daysRemaining <= 5
                  ? 'warning'
                  : 'info'
              }
            >
              <Clock size={12} aria-hidden="true" style={{ marginRight: '4px' }} />
              <span>{monthEndInfo.label}</span>
            </Badge>
          )}

          {/* Historical Archive Indicator (Section 37 & 39) */}
          {isHistoricalPeriod && (
            <Badge variant="neutral">
              <History size={12} aria-hidden="true" style={{ marginRight: '4px' }} />
              <span>{t('checklists.historicalArchive')}</span>
            </Badge>
          )}

          {/* Auditor Inspection Indicator (Section 40) */}
          {isAuditorRole && (
            <Badge variant="info">
              <ShieldCheck size={12} aria-hidden="true" style={{ marginRight: '4px' }} />
              <span>{t('checklists.auditorReadOnlyNotice', 'Auditor Read-Only')}</span>
            </Badge>
          )}
        </div>

        {/* History Period Selector (Section 38) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <label
            htmlFor="month-end-period-selector"
            style={{
              fontSize: 'var(--font-size-xs)',
              fontWeight: 500,
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            {t('checklists.selectPeriod')}:
          </label>
          <select
            id="month-end-period-selector"
            className="form-input"
            style={{
              padding: '0.25rem 0.75rem',
              fontSize: 'var(--font-size-xs)',
              borderRadius: 'var(--radius-md)',
              minWidth: '180px',
            }}
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            aria-label={t('checklists.selectPeriod')}
          >
            {availablePeriods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Backend Reminders Presentation Notice (Section 34) */}
      {isCurrentPeriod && !isAuditorRole && (
        <div
          style={{
            padding: 'var(--spacing-3) var(--spacing-4)',
            backgroundColor: 'var(--color-blue-50, #eff6ff)',
            border: '1px solid var(--color-blue-200, #bfdbfe)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-6)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-3)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-blue-900, #1e3a8a)',
          }}
          role="note"
        >
          <BellRing size={16} aria-hidden="true" style={{ flexShrink: 0, color: 'var(--color-blue-600)' }} />
          <span>
            {t(
              'checklists.remindersNotice',
              'Reminders are automatically dispatched on weekdays (12pm, 3pm, 5pm) starting from the third week until completion.'
            )}
          </span>
        </div>
      )}

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <LoadingSkeleton height="8rem" width="100%" />
          <LoadingSkeleton height="16rem" width="100%" />
        </div>
      )}

      {isError && (
        <div
          style={{
            padding: 'var(--spacing-6)',
            backgroundColor: 'var(--color-rose-50, #fff1f2)',
            border: '1px solid var(--color-rose-200, #fecdd3)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          role="alert"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <AlertCircle size={20} style={{ color: 'var(--color-rose-600)' }} />
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-rose-900)' }}>
              {t('checklists.loadError')}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => refetch()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <RefreshCw size={14} aria-hidden="true" />
            <span>{t('common.retry')}</span>
          </button>
        </div>
      )}

      {!isLoading && !isError && !checklist && (
        <EmptyState
          icon={<Layers size={36} />}
          title={isHistoricalPeriod ? t('checklists.noHistoryRecords') : t('checklists.emptyTitle')}
          description={
            isHistoricalPeriod
              ? t('checklists.emptyDescription')
              : t('checklists.emptyDescription')
          }
        />
      )}

      {!isLoading && !isError && checklist && (
        <ChecklistTable
          checklist={checklist}
          readOnly={readOnly}
          readOnlyReason={readOnlyReason}
          isManager={isManagerRole}
          onRefresh={() => void refetch()}
        />
      )}

      {/* Forward Month-End to Pre-Audit Modal */}
      <ForwardFlowModal
        isOpen={forwardModalOpen}
        onClose={() => setForwardModalOpen(false)}
        itemTitle={`Month-End Close Package (${selectedPeriod})`}
        itemCategory="Property, Plant & Equipment"
        sourceStage="MONTH_END"
      />
    </PageContainer>
  )
}
