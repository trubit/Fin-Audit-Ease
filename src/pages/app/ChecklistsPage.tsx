import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  CalendarCheck,
  Layers,
  CalendarClock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton/LoadingSkeleton'
import { EmptyState } from '@/components/feedback/EmptyState/EmptyState'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  useWeeklyChecklist,
  usePreAuditChecklist,
  useMonthEndChecklist,
  PipelineFlowBanner,
  buildWeeklyItemsForWeek,
  type PipelineStage,
} from '@/features/checklists'
import { ChecklistTable } from '@/features/checklists/components/ChecklistTable/ChecklistTable'

type ActiveChecklistTab = 'WEEKLY_CHECKPOINTS' | 'MONTH_END_CLOSE' | 'PRE_AUDIT_READINESS'

export const ChecklistsPage: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialTabParam = searchParams.get('tab')
  const getInitialTab = (): ActiveChecklistTab => {
    if (initialTabParam === 'weekly') return 'WEEKLY_CHECKPOINTS'
    if (initialTabParam === 'month-end') return 'MONTH_END_CLOSE'
    return 'WEEKLY_CHECKPOINTS' // Start from the beginning of the continuous pipeline
  }

  const [activeTab, setActiveTab] = useState<ActiveChecklistTab>(getInitialTab)

  const isAuditorRole =
    user?.role === 'AUDITOR' || user?.role === 'AUDIT_MANAGER' || user?.role === 'ADMIN'
  const isManagerRole =
    user?.role === 'ADMIN' || user?.role === 'AUDIT_MANAGER'

  const weeklyQuery = useWeeklyChecklist()
  const preAuditQuery = usePreAuditChecklist()
  const monthEndQuery = useMonthEndChecklist()

  const handleTabChange = (tab: ActiveChecklistTab) => {
    setActiveTab(tab)
    if (tab === 'WEEKLY_CHECKPOINTS') setSearchParams({ tab: 'weekly' })
    else if (tab === 'MONTH_END_CLOSE') setSearchParams({ tab: 'month-end' })
    else setSearchParams({ tab: 'pre-audit' })
  }

  const handleStageSelectFromBanner = (stage: PipelineStage) => {
    if (stage === 'weekly') handleTabChange('WEEKLY_CHECKPOINTS')
    else if (stage === 'month-end') handleTabChange('MONTH_END_CLOSE')
    else if (stage === 'pre-audit') handleTabChange('PRE_AUDIT_READINESS')
  }
  const currentPipelineStage: PipelineStage =
    activeTab === 'WEEKLY_CHECKPOINTS'
      ? 'weekly'
      : activeTab === 'MONTH_END_CLOSE'
      ? 'month-end'
      : 'pre-audit'

  const pageActions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
      {!isAuditorRole && (
        <Link
          to="/documents"
          className="btn btn-outline btn-md"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <span>{t('documents.title', 'Upload Evidence Schedules')}</span>
        </Link>
      )}
    </div>
  )

  return (
    <PageContainer
      title={t('checklists.title', 'Continuous Preparation Pipeline')}
      subtitle={t(
        'checklists.hubSubtitle',
        'Weekly checkpoints feed Month-End Close, Month-End schedules roll into Pre-Audit Preparation, and Pre-Audit documents forward directly to Audit Requests.'
      )}
      actions={pageActions}
      maxWidth="xl"
    >
      <div style={{ marginBottom: 'var(--spacing-5)' }}>
        <Breadcrumbs
          items={[
            { label: t('navigation.dashboard'), to: '/dashboard' },
            { label: t('checklists.title') },
          ]}
        />
      </div>

      {/* Visual Pipeline Progression Banner */}
      <PipelineFlowBanner
        currentStage={currentPipelineStage}
        onSelectStage={handleStageSelectFromBanner}
      />

      {/* Checklist Type Tab Buttons */}
      <div
        role="tablist"
        aria-label="Checklist Type Selection"
        style={{
          display: 'flex',
          gap: 'var(--spacing-3)',
          marginBottom: 'var(--spacing-6)',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 'var(--spacing-3)',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'WEEKLY_CHECKPOINTS'}
          aria-controls="checklist-tab-panel"
          className={`btn btn-md ${
            activeTab === 'WEEKLY_CHECKPOINTS' ? 'btn-primary' : 'btn-outline'
          }`}
          onClick={() => handleTabChange('WEEKLY_CHECKPOINTS')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-2)' }}
        >
          <CalendarClock size={18} aria-hidden="true" />
          <span>{t('pipeline.weeklyTitle', '1. Weekly Checkpoints')}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'MONTH_END_CLOSE'}
          aria-controls="checklist-tab-panel"
          className={`btn btn-md ${
            activeTab === 'MONTH_END_CLOSE' ? 'btn-primary' : 'btn-outline'
          }`}
          onClick={() => handleTabChange('MONTH_END_CLOSE')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-2)' }}
        >
          <Layers size={18} aria-hidden="true" />
          <span>{t('checklists.monthEndTitle', '2. Month-End Close')}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'PRE_AUDIT_READINESS'}
          aria-controls="checklist-tab-panel"
          className={`btn btn-md ${
            activeTab === 'PRE_AUDIT_READINESS' ? 'btn-primary' : 'btn-outline'
          }`}
          onClick={() => handleTabChange('PRE_AUDIT_READINESS')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-2)' }}
        >
          <CalendarCheck size={18} aria-hidden="true" />
          <span>{t('checklists.preAuditTitle', '3. Pre-Audit Preparation')}</span>
        </button>
      </div>

      {/* Active Tab Panel */}
      <div id="checklist-tab-panel" role="tabpanel">
        {/* TAB 1: WEEKLY CHECKPOINTS */}
        {activeTab === 'WEEKLY_CHECKPOINTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 'var(--spacing-3)',
                padding: 'var(--spacing-4) var(--spacing-5)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-slate-900)' }}>
                  {t('checklists.weeklyTitle', 'Weekly Checklist (9 Operational Checkpoints)')}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  {t('pipeline.weeklyHubSubtitle', 'Record transactions, reconcile bank & petty cash, match invoices, and review overdue receivables.')}
                </p>
              </div>
              <Link to="/weekly" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <CalendarClock size={15} />
                <span>{t('checklists.openDedicatedWeekly', 'Open Dedicated Weekly Workspace')}</span>
              </Link>
            </div>

            {weeklyQuery.isLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                <LoadingSkeleton height="8rem" width="100%" />
                <LoadingSkeleton height="16rem" width="100%" />
              </div>
            )}

            {!weeklyQuery.isLoading && (
              <ChecklistTable
                checklist={
                  weeklyQuery.data?.data || {
                    id: 'weekly-current',
                    type: 'WEEKLY_CHECKPOINT',
                    title: t('checklists.weeklyTitle', 'Weekly Checklist'),
                    periodLabel: 'Week 43 (19 Oct – 25 Oct 2026)',
                    reportingWeek: 43,
                    items: buildWeeklyItemsForWeek('weekly-current', 43, '2026-10-25'),
                    totalItemsCount: 9,
                    completedItemsCount: 0,
                    reviewedItemsCount: 0,
                  }
                }
                readOnly={isAuditorRole}
                readOnlyReason={isAuditorRole ? 'AUDITOR' : undefined}
                isManager={isManagerRole}
                onRefresh={() => void weeklyQuery.refetch()}
              />
            )}
          </div>
        )}

        {/* TAB 2 & 3: MONTH-END CLOSE & PRE-AUDIT PREPARATION */}
        {activeTab !== 'WEEKLY_CHECKPOINTS' && (
          <>
            {(activeTab === 'PRE_AUDIT_READINESS' ? preAuditQuery : monthEndQuery).isLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                <LoadingSkeleton height="8rem" width="100%" />
                <LoadingSkeleton height="16rem" width="100%" />
              </div>
            )}

            {(activeTab === 'PRE_AUDIT_READINESS' ? preAuditQuery : monthEndQuery).isError && (
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
                  onClick={() =>
                    (activeTab === 'PRE_AUDIT_READINESS' ? preAuditQuery : monthEndQuery).refetch()
                  }
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <RefreshCw size={14} aria-hidden="true" />
                  <span>{t('common.retry')}</span>
                </button>
              </div>
            )}

            {!(activeTab === 'PRE_AUDIT_READINESS' ? preAuditQuery : monthEndQuery).isLoading &&
              !(activeTab === 'PRE_AUDIT_READINESS' ? preAuditQuery : monthEndQuery).isError &&
              !(activeTab === 'PRE_AUDIT_READINESS' ? preAuditQuery : monthEndQuery).data?.data && (
                <EmptyState
                  icon={
                    activeTab === 'PRE_AUDIT_READINESS' ? (
                      <CalendarCheck size={36} />
                    ) : (
                      <Layers size={36} />
                    )
                  }
                  title={t('checklists.emptyTitle')}
                  description={t('checklists.emptyDescription')}
                />
              )}

            {!(activeTab === 'PRE_AUDIT_READINESS' ? preAuditQuery : monthEndQuery).isLoading &&
              !(activeTab === 'PRE_AUDIT_READINESS' ? preAuditQuery : monthEndQuery).isError &&
              (activeTab === 'PRE_AUDIT_READINESS' ? preAuditQuery : monthEndQuery).data?.data && (
                <ChecklistTable
                  checklist={
                    (activeTab === 'PRE_AUDIT_READINESS' ? preAuditQuery : monthEndQuery).data!.data!
                  }
                  readOnly={isAuditorRole}
                  readOnlyReason={isAuditorRole ? 'AUDITOR' : undefined}
                />
              )}
          </>
        )}
      </div>
    </PageContainer>
  )
}
