import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  RefreshCw,
  CalendarCheck,
  ShieldCheck,
  BellRing,
  Send,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton/LoadingSkeleton'
import { EmptyState } from '@/components/feedback/EmptyState/EmptyState'
import { Badge } from '@/components/common/Badge/Badge'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { usePreAuditChecklist, PipelineFlowBanner, ForwardFlowModal } from '@/features/checklists'
import { ChecklistTable } from '@/features/checklists/components/ChecklistTable/ChecklistTable'
import { getYearEndInfo, formatDate } from '@/utils/dateUtils'

export const PreAuditPage: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [forwardModalOpen, setForwardModalOpen] = useState(false)

  const isAuditorRole =
    user?.role === 'AUDITOR' || user?.role === 'AUDIT_MANAGER' || user?.role === 'ADMIN'

  const { data: response, isLoading, isError, refetch } = usePreAuditChecklist()
  const checklist = response?.data

  // Calculate real 6-month pre-audit runway from user's accountingYearEndDate
  const yearEndInfo = useMemo(() => {
    return getYearEndInfo(user?.accountingYearEndDate)
  }, [user?.accountingYearEndDate])

  const readOnly = isAuditorRole || !!checklist?.isArchived
  const readOnlyReason = isAuditorRole ? 'AUDITOR' : 'ARCHIVED'

  const pageActions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
      {!isAuditorRole && (
        <button
          type="button"
          className="btn btn-primary btn-md"
          onClick={() => setForwardModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Send size={15} />
          <span>{t('pipeline.forwardToRequestBtn', 'Forward to Audit Request')}</span>
        </button>
      )}
      <Link
        to="/month-end"
        className="btn btn-outline btn-md"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        <span>{t('checklists.monthEndTitle', 'Month-End Close')}</span>
      </Link>
    </div>
  )

  return (
    <PageContainer
      title={t('checklists.preAuditTitle')}
      subtitle={t('checklists.preAuditSubtitle')}
      actions={pageActions}
      maxWidth="xl"
    >
      <div style={{ marginBottom: 'var(--spacing-5)' }}>
        <Breadcrumbs
          items={[
            { label: t('navigation.dashboard'), to: '/dashboard' },
            { label: t('navigation.checklists'), to: '/checklists' },
            { label: t('checklists.preAuditTitle') },
          ]}
        />
      </div>

      {/* Visual Pipeline Progression Banner */}
      <PipelineFlowBanner currentStage="pre-audit" />

      {/* Runway Timeline Card (Section 9, 10, 11) */}
      <div
        className="card"
        style={{
          padding: 'var(--spacing-5)',
          marginBottom: 'var(--spacing-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--spacing-4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-emerald-50, #ecfdf5)',
              color: 'var(--color-emerald-700, #047857)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-hidden="true"
          >
            <CalendarCheck size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
              <h2
                style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 700,
                  color: 'var(--color-slate-900)',
                  margin: 0,
                }}
              >
                {t('dashboard.accountingYearEnd')}:{' '}
                {yearEndInfo.yearEndDate ? formatDate(yearEndInfo.yearEndDate) : t('checklists.yearEndNotSet')}
              </h2>
              {yearEndInfo.isPassed ? (
                <Badge variant="neutral">{t('checklists.yearEndPassed')}</Badge>
              ) : yearEndInfo.isPreAuditRunwayActive ? (
                <Badge variant="warning">{t('dashboard.preAuditRunwayActive')}</Badge>
              ) : yearEndInfo.yearEndDate ? (
                <Badge variant="info">
                  {t('checklists.countdownPreAudit', { count: yearEndInfo.daysUntilPreAudit })}
                </Badge>
              ) : (
                <Badge variant="neutral">{t('checklists.yearEndNotSet')}</Badge>
              )}
            </div>
            <p
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-muted)',
                margin: '2px 0 0 0',
              }}
            >
              {yearEndInfo.isPassed
                ? 'Accounting period has concluded. Final audit schedules should be locked.'
                : yearEndInfo.isPreAuditRunwayActive
                ? `6-month pre-audit preparation runway active. ${yearEndInfo.daysRemaining} days until fiscal year end.`
                : yearEndInfo.yearEndDate
                ? `Pre-audit checklist activates 6 months prior to fiscal close (in ${yearEndInfo.daysUntilPreAudit} days).`
                : 'Configure your company fiscal year end in settings to initialize exact timeline countdowns.'}
            </p>
          </div>
        </div>

        {/* Auditor Role Inspection Badge */}
        {isAuditorRole && (
          <Badge variant="info">
            <ShieldCheck size={12} aria-hidden="true" style={{ marginRight: '4px' }} />
            <span>{t('checklists.auditorReadOnlyNotice', 'Auditor Read-Only Inspection')}</span>
          </Badge>
        )}
      </div>

      {/* 6-Month Visual Journey Progression (Section 33) */}
      <div
        className="card"
        style={{
          padding: 'var(--spacing-4) var(--spacing-5)',
          marginBottom: 'var(--spacing-6)',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: 600,
            color: 'var(--text-muted)',
            marginBottom: 'var(--spacing-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {t('checklists.journeyTitle', 'Pre-Audit Preparation Journey (6-Month Runway)')}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 'var(--spacing-3)',
          }}
        >
          {[
            { step: '01', title: t('checklists.stepRunway', '6-Month Countdown'), desc: t('checklists.stepRunwayDesc', 'Runway initialized') },
            { step: '02', title: t('checklists.stepSchedules', 'Lead Schedules'), desc: t('checklists.stepSchedulesDesc', 'Drafting core balances') },
            { step: '03', title: t('checklists.stepSupporting', 'Supporting Records'), desc: t('checklists.stepSupportingDesc', 'Bank, FA, inventory docs') },
            { step: '04', title: t('checklists.stepTax', 'Tax & Statutory'), desc: t('checklists.stepTaxDesc', 'Returns & compliance filings') },
            { step: '05', title: t('checklists.stepReadiness', 'Audit Readiness'), desc: t('checklists.stepReadinessDesc', 'Final review & sign-off') },
          ].map((item) => (
            <div
              key={item.step}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: 'var(--spacing-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-slate-50)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary-700)' }}>
                  {item.step}
                </span>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary-500)',
                  }}
                />
              </div>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-slate-900)' }}>
                {item.title}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Backend Reminders Presentation Notice (Section 35) */}
      {!isAuditorRole && yearEndInfo.isPreAuditRunwayActive && (
        <div
          style={{
            padding: 'var(--spacing-3) var(--spacing-4)',
            backgroundColor: 'var(--color-emerald-50, #ecfdf5)',
            border: '1px solid var(--color-emerald-200, #a7f3d0)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-6)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-3)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-emerald-900, #064e3b)',
          }}
          role="note"
        >
          <BellRing size={16} aria-hidden="true" style={{ flexShrink: 0, color: 'var(--color-emerald-700)' }} />
          <span>
            {t(
              'checklists.preAuditRemindersNotice',
              'Pre-Audit reminders are dispatched every Monday, Wednesday, and Friday at 12pm, 3pm, and 5pm to assignees until completed.'
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
          icon={<CalendarCheck size={36} />}
          title={t('checklists.emptyTitle')}
          description={t('checklists.emptyDescription')}
        />
      )}

      {!isLoading && !isError && checklist && (
        <ChecklistTable
          checklist={checklist}
          readOnly={readOnly}
          readOnlyReason={readOnlyReason}
        />
      )}

      {/* Forward Pre-Audit to Audit Request Modal */}
      <ForwardFlowModal
        isOpen={forwardModalOpen}
        onClose={() => setForwardModalOpen(false)}
        itemTitle="Pre-Audit Evidentiary Package"
        itemCategory="Property, Plant & Equipment"
        sourceStage="PRE_AUDIT"
      />
    </PageContainer>
  )
}
