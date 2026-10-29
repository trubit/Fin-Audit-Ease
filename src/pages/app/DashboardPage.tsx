import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase,
  Clock,
  Plus,
  ArrowRight,
  ShieldCheck,
  Building,
  CheckCircle2,
  CheckSquare,
  FileCheck,
  Eye,
  FileText,
  Layers,
  CalendarCheck,
  CalendarClock,
  Coins,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { AttentionCard } from '@/components/common/AttentionCard/AttentionCard'
import { EmptyState } from '@/components/feedback/EmptyState/EmptyState'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton/LoadingSkeleton'
import { PageError } from '@/components/feedback/PageError/PageError'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { formatUserRole } from '@/features/auth/utils/roleUtils'
import { useEngagements } from '@/features/engagements/hooks/useEngagements'
import { useAuditRequests } from '@/features/auditRequests/hooks/useAuditRequests'
import {
  useWeeklyChecklist,
  useMonthEndChecklist,
  usePreAuditChecklist,
} from '@/features/checklists'
import { Pagination } from '@/components/common/Pagination'
import { getDeadlineInfo, formatDate, getYearEndInfo, getMonthEndInfo } from '@/utils/dateUtils'
import './DashboardPage.css'

const AUDITOR_ATTENTION_PAGE_SIZE = 4
const AUDITOR_ENGAGEMENTS_PAGE_SIZE = 3
const ACCOUNTING_ATTENTION_PAGE_SIZE = 4
const ACCOUNTING_REQUESTS_PAGE_SIZE = 4

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()

  const isAuditorRole =
    user?.role === 'AUDITOR' || user?.role === 'AUDIT_MANAGER' || user?.role === 'ADMIN'

  // Server data hooks
  const {
    data: engagements = [],
    isLoading: engagementsLoading,
    isError: engagementsError,
    refetch: refetchEngagements,
  } = useEngagements()

  const {
    data: auditRequests = [],
    isLoading: requestsLoading,
    isError: requestsError,
    refetch: refetchRequests,
  } = useAuditRequests()

  const {
    data: weeklyData,
    isLoading: weeklyLoading,
    refetch: refetchWeekly,
  } = useWeeklyChecklist(undefined, { enabled: !isAuditorRole })

  const {
    data: monthEndData,
    isLoading: monthEndLoading,
    refetch: refetchMonthEnd,
  } = useMonthEndChecklist(undefined, { enabled: !isAuditorRole })

  const {
    data: preAuditData,
    isLoading: preAuditLoading,
    refetch: refetchPreAudit,
  } = usePreAuditChecklist(undefined, { enabled: !isAuditorRole })

  const isLoading =
    engagementsLoading ||
    requestsLoading ||
    (!isAuditorRole && (weeklyLoading || monthEndLoading || preAuditLoading))

  const isError = engagementsError || requestsError

  const handleRetryAll = () => {
    void refetchEngagements()
    void refetchRequests()
    if (!isAuditorRole) {
      void refetchWeekly()
      void refetchMonthEnd()
      void refetchPreAudit()
    }
  }

  // Real backend calculations
  const activeEngagements = useMemo(
    () => engagements.filter((e) => e.status === 'ACTIVE'),
    [engagements]
  )
  const completedEngagements = useMemo(
    () => engagements.filter((e) => e.status === 'COMPLETED'),
    [engagements]
  )

  // Auditor: Attention items (submitted for review, critical/high priority, overdue)
  const auditorAttentionItems = useMemo(() => {
    return auditRequests.filter((r) => {
      const isAwaitingReview = r.status === 'SUBMITTED' || r.status === 'IN_REVIEW'
      const isUrgent = r.priority === 'CRITICAL' || r.priority === 'HIGH'
      const isOverdue = getDeadlineInfo(r.dueDate).status === 'overdue' && r.status !== 'ACCEPTED'
      return isAwaitingReview || (isUrgent && r.status === 'OPEN') || isOverdue
    })
  }, [auditRequests])

  // Accounting Team: Attention items (Rejected requiring resubmission first, then overdue, then critical)
  const accountingAttentionItems = useMemo(() => {
    return auditRequests.filter((r) => {
      const isRejected = r.status === 'REJECTED'
      const isOverdue = getDeadlineInfo(r.dueDate).status === 'overdue' && r.status !== 'ACCEPTED'
      const isCriticalOpen = r.priority === 'CRITICAL' && r.status === 'OPEN'
      return isRejected || isOverdue || isCriticalOpen
    })
  }, [auditRequests])

  // Year-End & Month-End metrics for Accounting Team
  const yearEndInfo = useMemo(() => {
    return getYearEndInfo(user?.accountingYearEndDate)
  }, [user?.accountingYearEndDate])

  const monthEndInfo = useMemo(() => {
    return getMonthEndInfo()
  }, [])

  const weeklyChecklist = weeklyData?.data
  const monthEndChecklist = monthEndData?.data
  const preAuditChecklist = preAuditData?.data

  const weeklyProgressPct = useMemo(() => {
    if (!weeklyChecklist || !weeklyChecklist.totalItemsCount) return 0
    return Math.min(
      100,
      Math.round((weeklyChecklist.completedItemsCount / weeklyChecklist.totalItemsCount) * 100)
    )
  }, [weeklyChecklist])

  const monthEndProgressPct = useMemo(() => {
    if (!monthEndChecklist || !monthEndChecklist.totalItemsCount) return 0
    return Math.min(
      100,
      Math.round((monthEndChecklist.completedItemsCount / monthEndChecklist.totalItemsCount) * 100)
    )
  }, [monthEndChecklist])

  const preAuditProgressPct = useMemo(() => {
    if (!preAuditChecklist || !preAuditChecklist.totalItemsCount) return 0
    return Math.min(
      100,
      Math.round((preAuditChecklist.completedItemsCount / preAuditChecklist.totalItemsCount) * 100)
    )
  }, [preAuditChecklist])

  // Request Pipeline breakdown for Auditor
  const pipelineStats = useMemo(() => {
    const open = auditRequests.filter((r) => r.status === 'OPEN').length
    const submittedOrReview = auditRequests.filter(
      (r) => r.status === 'SUBMITTED' || r.status === 'IN_REVIEW'
    ).length
    const approved = auditRequests.filter((r) => r.status === 'ACCEPTED').length
    const rejected = auditRequests.filter((r) => r.status === 'REJECTED').length
    return { open, submittedOrReview, approved, rejected, total: auditRequests.length }
  }, [auditRequests])

  const welcomeGreeting = user?.fullName
    ? `${isAuditorRole ? t('dashboard.auditorWelcome') : t('dashboard.financeWelcome')} — ${user.fullName}`
    : isAuditorRole
    ? t('dashboard.auditorWelcome')
    : t('dashboard.financeWelcome')

  const [activeSection, setActiveSection] = useState<string>('all')

  const handleScrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    if (sectionId === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const el = document.getElementById(sectionId)
    if (el) {
      const headerOffset = 90
      const elementPosition = el.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
    }
  }

  // Pagination States for Dashboard Lists
  const [auditorAttentionPage, setAuditorAttentionPage] = useState<number>(1)
  const [auditorEngagementsPage, setAuditorEngagementsPage] = useState<number>(1)
  const [accountingAttentionPage, setAccountingAttentionPage] = useState<number>(1)
  const [accountingRequestsPage, setAccountingRequestsPage] = useState<number>(1)

  // Memoized Paged Lists
  const pagedAuditorAttentionItems = useMemo(() => {
    const startIndex = (auditorAttentionPage - 1) * AUDITOR_ATTENTION_PAGE_SIZE
    return auditorAttentionItems.slice(startIndex, startIndex + AUDITOR_ATTENTION_PAGE_SIZE)
  }, [auditorAttentionItems, auditorAttentionPage])

  const pagedActiveEngagements = useMemo(() => {
    const startIndex = (auditorEngagementsPage - 1) * AUDITOR_ENGAGEMENTS_PAGE_SIZE
    return activeEngagements.slice(startIndex, startIndex + AUDITOR_ENGAGEMENTS_PAGE_SIZE)
  }, [activeEngagements, auditorEngagementsPage])

  const pagedAccountingAttentionItems = useMemo(() => {
    const startIndex = (accountingAttentionPage - 1) * ACCOUNTING_ATTENTION_PAGE_SIZE
    return accountingAttentionItems.slice(startIndex, startIndex + ACCOUNTING_ATTENTION_PAGE_SIZE)
  }, [accountingAttentionItems, accountingAttentionPage])

  const pagedAccountingRequests = useMemo(() => {
    const startIndex = (accountingRequestsPage - 1) * ACCOUNTING_REQUESTS_PAGE_SIZE
    return auditRequests.slice(startIndex, startIndex + ACCOUNTING_REQUESTS_PAGE_SIZE)
  }, [auditRequests, accountingRequestsPage])

  return (
    <PageContainer
      title={welcomeGreeting}
      subtitle={isAuditorRole ? t('dashboard.auditorSubtitle') : t('dashboard.financeSubtitle')}
      actions={
        isAuditorRole ? (
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
            <Link to="/engagements/create" className="btn btn-primary btn-md">
              <Plus size={16} aria-hidden="true" />
              <span>{t('dashboard.createEngagement')}</span>
            </Link>
            <Link to="/audit-requests/create" className="btn btn-outline btn-md">
              <Plus size={16} aria-hidden="true" />
              <span>{t('dashboard.newRequest')}</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
            <Link to="/pre-audit" className="btn btn-primary btn-md">
              <FileCheck size={16} aria-hidden="true" />
              <span>{t('dashboard.openPreAudit')}</span>
            </Link>
            <Link to="/month-end" className="btn btn-outline btn-md">
              <CheckSquare size={16} aria-hidden="true" />
              <span>{t('dashboard.openMonthEnd')}</span>
            </Link>
          </div>
        )
      }
    >
      {/* Loading Skeleton */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          <LoadingSkeleton height="5rem" />
          <div className="dashboard-metrics-grid">
            <LoadingSkeleton height="7rem" />
            <LoadingSkeleton height="7rem" />
            <LoadingSkeleton height="7rem" />
          </div>
          <LoadingSkeleton height="14rem" />
        </div>
      )}

      {/* Error State */}
      {!isLoading && isError && (
        <PageError onRetry={handleRetryAll} message={t('errors.generic')} />
      )}

      {/* ========================================================================= */}
      {/* 1. AUDITOR WORKFLOW DASHBOARD                                             */}
      {/* ========================================================================= */}
      {!isLoading && !isError && isAuditorRole && (
        <>
          {engagements.length === 0 ? (
            <EmptyState
              icon={<Briefcase size={40} />}
              title={t('dashboard.emptyWorkspaceTitle')}
              description={t('dashboard.emptyWorkspaceDescription')}
              action={
                <Link to="/engagements/create" className="btn btn-primary btn-md">
                  <Plus size={16} aria-hidden="true" />
                  <span>{t('dashboard.createEngagement')}</span>
                </Link>
              }
            />
          ) : (
            <div className="dashboard-root">
              {/* Context Ribbon (Dark Editorial Focus Moment) */}
              <div className="dashboard-context-ribbon">
                <div className="dashboard-ribbon-left">
                  <div className="dashboard-ribbon-icon">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="dashboard-ribbon-info">
                    <p className="dashboard-ribbon-title">
                      {user?.organizationName || 'FinAuditEase Audit Firm'}
                    </p>
                    <p className="dashboard-ribbon-subtitle">
                      {formatUserRole(user?.role, t)} • {t('dashboard.title')}
                    </p>
                  </div>
                </div>

                <div className="dashboard-ribbon-metrics">
                  <div className="dashboard-ribbon-metric-item">
                    <span className="dashboard-ribbon-metric-label">
                      {t('dashboard.activeEngagements')}
                    </span>
                    <span className="dashboard-ribbon-metric-value">{activeEngagements.length}</span>
                  </div>
                  <div className="dashboard-ribbon-metric-item">
                    <span className="dashboard-ribbon-metric-label">
                      {t('dashboard.attentionTitle')}
                    </span>
                    <span className="dashboard-ribbon-metric-value" style={{ color: '#f59e0b' }}>
                      {auditorAttentionItems.length}
                    </span>
                  </div>
                  <div className="dashboard-ribbon-metric-item">
                    <span className="dashboard-ribbon-metric-label">
                      {t('dashboard.completedTitle')}
                    </span>
                    <span className="dashboard-ribbon-metric-value">
                      {completedEngagements.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* In-Page Navigation Bar */}
              <nav className="dashboard-subnav-bar" aria-label="Auditor workspace navigation">
                <button
                  type="button"
                  className={`dashboard-subnav-pill ${activeSection === 'all' ? 'is-active' : ''}`}
                  onClick={() => handleScrollToSection('all')}
                >
                  <span>{t('common.all')}</span>
                </button>
                {auditorAttentionItems.length > 0 && (
                  <button
                    type="button"
                    className={`dashboard-subnav-pill ${activeSection === 'dashboard-attention-sec' ? 'is-active' : ''}`}
                    onClick={() => handleScrollToSection('dashboard-attention-sec')}
                  >
                    <span>{t('dashboard.attentionTitle')}</span>
                    <span className="dashboard-subnav-badge badge-attention">
                      {auditorAttentionItems.length}
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  className={`dashboard-subnav-pill ${activeSection === 'dashboard-engagements-sec' ? 'is-active' : ''}`}
                  onClick={() => handleScrollToSection('dashboard-engagements-sec')}
                >
                  <span>{t('navigation.engagements')}</span>
                  <span className="dashboard-subnav-badge badge-neutral">
                    {activeEngagements.length}
                  </span>
                </button>
                <button
                  type="button"
                  className={`dashboard-subnav-pill ${activeSection === 'dashboard-pipeline-sec' ? 'is-active' : ''}`}
                  onClick={() => handleScrollToSection('dashboard-pipeline-sec')}
                >
                  <span>{t('dashboard.progressTitle')}</span>
                </button>
              </nav>

              {/* Story Step 1: What Needs Attention Today */}
              {auditorAttentionItems.length > 0 && (
                <section
                  id="dashboard-attention-sec"
                  className="dashboard-section"
                  aria-labelledby="auditor-attention-heading"
                >
                  <div className="dashboard-section-header">
                    <div className="dashboard-section-title-group">
                      <h2 id="auditor-attention-heading" className="dashboard-section-title">
                        {t('dashboard.attentionTitle')}
                      </h2>
                      <p className="dashboard-section-subtitle">
                        {t('dashboard.attentionSubtitle')}
                      </p>
                    </div>
                    <Link to="/review" className="btn btn-outline btn-sm">
                      <span>{t('navigation.review')}</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </div>

                  <div className="dashboard-attention-stack">
                    {pagedAuditorAttentionItems.map((item) => {
                      const deadline = getDeadlineInfo(item.dueDate)
                      const isSubmitted = item.status === 'SUBMITTED' || item.status === 'IN_REVIEW'
                      const isOverdue = deadline.status === 'overdue'

                      return (
                        <AttentionCard
                          key={item.id}
                          variant={isOverdue ? 'danger' : isSubmitted ? 'info' : 'warning'}
                          title={item.title}
                          badge={
                            <StatusBadge status={item.status} size="sm" />
                          }
                          description={item.description}
                          meta={
                            <>
                              <span>{item.referenceCode}</span>
                              <span>•</span>
                              <span>{item.category}</span>
                              <span>•</span>
                              <span>
                                {t('engagements.targetDate')}: {formatDate(item.dueDate)}
                              </span>
                            </>
                          }
                          action={
                            <Link
                              to={isSubmitted ? `/review/${item.id}` : `/audit-requests/${item.id}`}
                              className={`btn ${isSubmitted ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                            >
                              <Eye size={14} aria-hidden="true" />
                              <span>
                                {isSubmitted
                                   ? t('review.inspect', 'Inspect Evidence')
                                   : t('common.view', 'View Details')}
                              </span>
                            </Link>
                          }
                        />
                      )
                    })}
                  </div>

                  <Pagination
                    currentPage={auditorAttentionPage}
                    totalItems={auditorAttentionItems.length}
                    pageSize={AUDITOR_ATTENTION_PAGE_SIZE}
                    onPageChange={setAuditorAttentionPage}
                    size="sm"
                  />
                </section>
              )}

              {/* Story Step 2: Active Engagements Portfolio */}
              <section
                id="dashboard-engagements-sec"
                className="dashboard-section"
                aria-labelledby="active-engagements-heading"
              >
                <div className="dashboard-section-header">
                  <div className="dashboard-section-title-group">
                    <h2 id="active-engagements-heading" className="dashboard-section-title">
                      {t('dashboard.recentEngagements')}
                    </h2>
                    <p className="dashboard-section-subtitle">
                      Active client audit workspaces currently in progress
                    </p>
                  </div>
                  <Link to="/engagements" className="btn btn-outline btn-sm">
                    <span>{t('dashboard.viewAll')}</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>

                <div className="dashboard-engagements-grid">
                  {pagedActiveEngagements.map((engagement) => {
                    const deadlineInfo = getDeadlineInfo(engagement.targetCompletionDate)
                    const progressPct =
                      engagement.totalRequestsCount > 0
                        ? Math.round(
                            (engagement.completedRequestsCount / engagement.totalRequestsCount) *
                              100
                          )
                        : 0

                    return (
                      <Link
                        key={engagement.id}
                        to={`/engagements/${engagement.id}`}
                        className="dashboard-engagement-card"
                      >
                        <div className="dashboard-engagement-card-header">
                          <div>
                            <h3 className="dashboard-engagement-card-title">
                              {engagement.title}
                            </h3>
                            <p className="dashboard-engagement-client">
                              {engagement.clientOrganizationName} • FY{engagement.fiscalYear}
                            </p>
                          </div>
                          <StatusBadge status={engagement.status} size="sm" />
                        </div>

                        {/* Progress Bar */}
                        <div className="dashboard-progress-unit">
                          <div className="dashboard-progress-labels">
                            <span style={{ color: 'var(--text-muted)' }}>
                              {t('dashboard.progress')}
                            </span>
                            <span style={{ color: 'var(--color-primary-800)' }}>
                              {progressPct}% ({engagement.completedRequestsCount}/
                              {engagement.totalRequestsCount})
                            </span>
                          </div>
                          <div className="dashboard-progress-track">
                            <div
                              className="dashboard-progress-fill"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>

                        <div className="dashboard-engagement-footer">
                          <span>
                            {t('dashboard.leadAuditor')}: {engagement.leadAuditorName}
                          </span>
                          <span
                            style={{
                              color:
                                deadlineInfo.status === 'overdue'
                                  ? 'var(--color-danger-600)'
                                  : 'var(--text-muted)',
                              fontWeight: deadlineInfo.status === 'overdue' ? 700 : 500,
                            }}
                          >
                            {formatDate(engagement.targetCompletionDate)}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>

                <Pagination
                  currentPage={auditorEngagementsPage}
                  totalItems={activeEngagements.length}
                  pageSize={AUDITOR_ENGAGEMENTS_PAGE_SIZE}
                  onPageChange={setAuditorEngagementsPage}
                  size="sm"
                />
              </section>

              {/* Story Step 3: Request Pipeline Overview */}
              <section
                id="dashboard-pipeline-sec"
                className="dashboard-section"
                aria-labelledby="pipeline-heading"
              >
                <div className="dashboard-section-header">
                  <div className="dashboard-section-title-group">
                    <h2 id="pipeline-heading" className="dashboard-section-title">
                      {t('dashboard.progressTitle')}
                    </h2>
                    <p className="dashboard-section-subtitle">
                      Live status distribution across all client audit requests
                    </p>
                  </div>
                  <Link to="/audit-requests" className="btn btn-outline btn-sm">
                    <span>{t('dashboard.viewAll')}</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>

                <div className="dashboard-metrics-grid">
                  <div className="dashboard-metric-card">
                    <div className="dashboard-metric-icon icon-warning">
                      <Clock size={22} />
                    </div>
                    <div className="dashboard-metric-content">
                      <p className="dashboard-metric-label">{t('auditRequests.statusOpen')}</p>
                      <p className="dashboard-metric-number">{pipelineStats.open}</p>
                    </div>
                  </div>

                  <div className="dashboard-metric-card">
                    <div className="dashboard-metric-icon icon-primary">
                      <FileCheck size={22} />
                    </div>
                    <div className="dashboard-metric-content">
                      <p className="dashboard-metric-label">
                        {t('auditRequests.statusSubmitted')} / {t('auditRequests.statusInReview')}
                      </p>
                      <p className="dashboard-metric-number">{pipelineStats.submittedOrReview}</p>
                    </div>
                  </div>

                  <div className="dashboard-metric-card">
                    <div className="dashboard-metric-icon icon-success">
                      <CheckCircle2 size={22} />
                    </div>
                    <div className="dashboard-metric-content">
                      <p className="dashboard-metric-label">{t('auditRequests.statusAccepted')}</p>
                      <p className="dashboard-metric-number">{pipelineStats.approved}</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. ACCOUNTING TEAM WORKFLOW DASHBOARD                                     */}
      {/* ========================================================================= */}
      {!isLoading && !isError && !isAuditorRole && (
        <div className="dashboard-root">
          {/* Fiscal Countdown & Context Ribbon */}
          <div className="dashboard-context-ribbon">
            <div className="dashboard-ribbon-left">
              <div className="dashboard-ribbon-icon">
                <Building size={20} />
              </div>
              <div className="dashboard-ribbon-info">
                <p className="dashboard-ribbon-title">
                  {user?.organizationName || 'Corporate Accounting Entity'}
                </p>
                <p className="dashboard-ribbon-subtitle">
                  {t('dashboard.accountingYearEnd')}:{' '}
                  {yearEndInfo.yearEndDate ? formatDate(yearEndInfo.yearEndDate) : t('checklists.yearEndNotSet')}
                </p>
              </div>
            </div>

            <div className="dashboard-ribbon-metrics">
              <div className="dashboard-ribbon-metric-item">
                <span className="dashboard-ribbon-metric-label">
                  {t('dashboard.yearEndCountdown')}
                </span>
                <span className="dashboard-ribbon-metric-value" style={{ color: '#3dbe80' }}>
                  {yearEndInfo.yearEndDate
                    ? `${yearEndInfo.daysRemaining} days`
                    : 'Not set'}
                </span>
              </div>
              <div className="dashboard-ribbon-metric-item">
                <span className="dashboard-ribbon-metric-label">
                  {t('checklists.currentMonth')}
                </span>
                <span className="dashboard-ribbon-metric-value">
                  {monthEndInfo.monthYearLabel}
                </span>
              </div>
              <div className="dashboard-ribbon-metric-item">
                <span className="dashboard-ribbon-metric-label">
                  {t('dashboard.attentionTitle')}
                </span>
                <span
                  className="dashboard-ribbon-metric-value"
                  style={{ color: accountingAttentionItems.length > 0 ? '#ef4444' : '#ffffff' }}
                >
                  {accountingAttentionItems.length}
                </span>
              </div>
            </div>
          </div>

          {/* In-Page Navigation Bar */}
          <nav className="dashboard-subnav-bar" aria-label="Accounting workspace navigation">
            <button
              type="button"
              className={`dashboard-subnav-pill ${activeSection === 'all' ? 'is-active' : ''}`}
              onClick={() => handleScrollToSection('all')}
            >
              <span>{t('common.all')}</span>
            </button>
            {accountingAttentionItems.length > 0 && (
              <button
                type="button"
                className={`dashboard-subnav-pill ${activeSection === 'accounting-attention-sec' ? 'is-active' : ''}`}
                onClick={() => handleScrollToSection('accounting-attention-sec')}
              >
                <span>{t('dashboard.attentionTitle')}</span>
                <span className="dashboard-subnav-badge badge-attention">
                  {accountingAttentionItems.length}
                </span>
              </button>
            )}
            <button
              type="button"
              className={`dashboard-subnav-pill ${activeSection === 'accounting-operations-sec' ? 'is-active' : ''}`}
              onClick={() => handleScrollToSection('accounting-operations-sec')}
            >
              <span>{t('dashboard.yearRoundOperations')}</span>
            </button>
            <button
              type="button"
              className={`dashboard-subnav-pill ${activeSection === 'accounting-requests-sec' ? 'is-active' : ''}`}
              onClick={() => handleScrollToSection('accounting-requests-sec')}
            >
              <span>{t('navigation.auditRequests')}</span>
              {auditRequests.length > 0 && (
                <span className="dashboard-subnav-badge badge-neutral">
                  {auditRequests.length}
                </span>
              )}
            </button>
          </nav>

          {/* Story Step 1: Immediate Attention Stack (Rejections & Overdue) */}
          {accountingAttentionItems.length > 0 && (
            <section
              id="accounting-attention-sec"
              className="dashboard-section"
              aria-labelledby="finance-attention-heading"
            >
              <div className="dashboard-section-header">
                <div className="dashboard-section-title-group">
                  <h2 id="finance-attention-heading" className="dashboard-section-title">
                    {t('dashboard.attentionTitle')}
                  </h2>
                  <p className="dashboard-section-subtitle">
                    Submissions requiring corrections or urgent evidence responses
                  </p>
                </div>
                <Link to="/audit-requests" className="btn btn-outline btn-sm">
                  <span>{t('dashboard.viewAll')}</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>

              <div className="dashboard-attention-stack">
                {pagedAccountingAttentionItems.map((item) => {
                  const isRejected = item.status === 'REJECTED'
                  const deadline = getDeadlineInfo(item.dueDate)

                  return (
                    <AttentionCard
                      key={item.id}
                      variant={isRejected ? 'danger' : 'warning'}
                      title={item.title}
                      badge={<StatusBadge status={item.status} size="sm" />}
                      description={
                        isRejected
                          ? item.rejectionReason ||
                            item.reviewNotes ||
                            t(
                              'auditRequests.rejectionFallbackReason',
                              'The auditor requested corrections. Please inspect feedback and upload updated files.'
                            )
                          : item.description
                      }
                      meta={
                        <>
                          <span>{item.referenceCode}</span>
                          <span>•</span>
                          <span>{item.category}</span>
                          <span>•</span>
                          <span>
                            {t('engagements.targetDate')}: {formatDate(item.dueDate)} ({deadline.label})
                          </span>
                        </>
                      }
                      action={
                        <Link
                          to={`/audit-requests/${item.id}`}
                          className={`btn ${isRejected ? 'btn-danger' : 'btn-primary'} btn-sm`}
                        >
                          <FileText size={14} aria-hidden="true" />
                          <span>
                            {isRejected
                              ? t('dashboard.correctSubmission', 'Review & Re-submit')
                              : t('common.submit', 'Provide Evidence')}
                          </span>
                        </Link>
                      }
                    />
                  )
                })}
              </div>

              <Pagination
                currentPage={accountingAttentionPage}
                totalItems={accountingAttentionItems.length}
                pageSize={ACCOUNTING_ATTENTION_PAGE_SIZE}
                onPageChange={setAccountingAttentionPage}
                size="sm"
              />
            </section>
          )}

          {/* Story Step 2: Year-Round Operations (Finance Module) */}
          <section
            id="accounting-operations-sec"
            className="dashboard-section"
            aria-labelledby="year-round-heading"
          >
            <div style={{ marginBottom: 'var(--spacing-2)' }}>
              <span className="badge badge-success" style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {t('financeModule.badge', 'Finance Module')}
              </span>
            </div>
            <div className="dashboard-section-header">
              <div className="dashboard-section-title-group">
                <h2 id="year-round-heading" className="dashboard-section-title">
                  {t('financeModule.operationsTitle', 'Finance Module — Operations & Verification')}
                </h2>
                <p className="dashboard-section-subtitle">
                  {t('financeModule.operationsSubtitle', 'Year-round month-end checklists, pre-audit runways, and physical asset verification register.')}
                </p>
              </div>
            </div>

            <div className="dashboard-operations-grid">
              {/* Weekly Operational Checklist Card */}
              <div className="dashboard-operation-card">
                <div className="dashboard-operation-card-header">
                  <div className="dashboard-operation-header-left">
                    <div
                      className="dashboard-operation-icon"
                      style={{
                        backgroundColor: 'var(--color-primary-50)',
                        color: 'var(--color-primary-700)',
                      }}
                    >
                      <CalendarClock size={22} />
                    </div>
                    <div className="dashboard-operation-titles">
                      <h3 className="dashboard-operation-title">
                        {t('dashboard.weeklyQuickTitle', 'Weekly Checklist')}
                      </h3>
                      <p className="dashboard-operation-desc">
                        {t('dashboard.weeklyQuickDesc', 'Reconcile bank feeds, count petty cash & match invoices')}
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-neutral">
                    {weeklyChecklist?.completedItemsCount || 0} / {weeklyChecklist?.totalItemsCount || 9}
                  </span>
                </div>

                <div className="dashboard-progress-unit">
                  <div className="dashboard-progress-labels">
                    <span style={{ color: 'var(--text-muted)' }}>{t('common.completion', 'Completion')}</span>
                    <span style={{ color: 'var(--color-primary-800)' }}>
                      {weeklyProgressPct}%
                    </span>
                  </div>
                  <div className="dashboard-progress-track">
                    <div
                      className="dashboard-progress-fill fill-emerald"
                      style={{ width: `${weeklyProgressPct}%` }}
                    />
                  </div>
                </div>

                <Link
                  to="/weekly"
                  className="btn btn-outline btn-md"
                  style={{ alignSelf: 'flex-start', marginTop: 'auto' }}
                >
                  <CalendarClock size={16} aria-hidden="true" />
                  <span>{t('dashboard.openWeekly', 'Open Weekly Checklist')}</span>
                </Link>
              </div>

              {/* Month-End Financial Close Card */}
              <div className="dashboard-operation-card">
                <div className="dashboard-operation-card-header">
                  <div className="dashboard-operation-header-left">
                    <div className="dashboard-operation-icon icon-month-end">
                      <Layers size={22} />
                    </div>
                    <div className="dashboard-operation-titles">
                      <h3 className="dashboard-operation-title">
                        {t('dashboard.monthEndQuickTitle')}
                      </h3>
                      <p className="dashboard-operation-desc">
                        {monthEndInfo.monthYearLabel} •{' '}
                        {monthEndInfo.daysRemaining > 0
                          ? `${monthEndInfo.daysRemaining} days left`
                          : monthEndInfo.label}
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-neutral">
                    {monthEndChecklist?.completedItemsCount || 0} /{' '}
                    {monthEndChecklist?.totalItemsCount || 0}
                  </span>
                </div>

                <div className="dashboard-progress-unit">
                  <div className="dashboard-progress-labels">
                    <span style={{ color: 'var(--text-muted)' }}>{t('common.completion', 'Completion')}</span>
                    <span style={{ color: 'var(--color-primary-800)' }}>
                      {monthEndProgressPct}%
                    </span>
                  </div>
                  <div className="dashboard-progress-track">
                    <div
                      className="dashboard-progress-fill fill-emerald"
                      style={{ width: `${monthEndProgressPct}%` }}
                    />
                  </div>
                </div>

                <Link
                  to="/month-end"
                  className="btn btn-outline btn-md"
                  style={{ alignSelf: 'flex-start', marginTop: 'auto' }}
                >
                  <CheckSquare size={16} aria-hidden="true" />
                  <span>{t('dashboard.openMonthEnd')}</span>
                </Link>
              </div>

              {/* Pre-Audit Preparation Runway Card */}
              <div className="dashboard-operation-card">
                <div className="dashboard-operation-card-header">
                  <div className="dashboard-operation-header-left">
                    <div className="dashboard-operation-icon icon-pre-audit">
                      <CalendarCheck size={22} />
                    </div>
                    <div className="dashboard-operation-titles">
                      <h3 className="dashboard-operation-title">
                        {t('dashboard.preAuditQuickTitle')}
                      </h3>
                      <p className="dashboard-operation-desc">
                        {yearEndInfo.isPreAuditRunwayActive
                          ? t('dashboard.preAuditRunwayActive')
                          : yearEndInfo.yearEndDate
                          ? t('dashboard.preAuditRunwayUpcoming', {
                              months: yearEndInfo.monthsRemaining,
                            })
                          : '6-Month Runway Preparation'}
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-neutral">
                    {preAuditChecklist?.completedItemsCount || 0} /{' '}
                    {preAuditChecklist?.totalItemsCount || 0}
                  </span>
                </div>

                <div className="dashboard-progress-unit">
                  <div className="dashboard-progress-labels">
                    <span style={{ color: 'var(--text-muted)' }}>{t('common.readiness', 'Readiness')}</span>
                    <span style={{ color: 'var(--color-primary-800)' }}>
                      {preAuditProgressPct}%
                    </span>
                  </div>
                  <div className="dashboard-progress-track">
                    <div
                      className="dashboard-progress-fill"
                      style={{ width: `${preAuditProgressPct}%` }}
                    />
                  </div>
                </div>

                <Link
                  to="/pre-audit"
                  className="btn btn-primary btn-md"
                  style={{ alignSelf: 'flex-start', marginTop: 'auto' }}
                >
                  <FileCheck size={16} aria-hidden="true" />
                  <span>{t('dashboard.openPreAudit')}</span>
                </Link>
              </div>

              {/* Asset Verification Register Card */}
              <div className="dashboard-operation-card">
                <div className="dashboard-operation-card-header">
                  <div className="dashboard-operation-header-left">
                    <div className="dashboard-operation-icon icon-month-end" style={{ backgroundColor: 'var(--color-emerald-50)', color: 'var(--color-emerald-700)' }}>
                      <Coins size={22} />
                    </div>
                    <div className="dashboard-operation-titles">
                      <h3 className="dashboard-operation-title">
                        {t('assets.registerTitle', 'Asset Verification Register')}
                      </h3>
                      <p className="dashboard-operation-desc">
                        {t('assets.registerCardDesc', 'Verify fixed & current assets against physical counts')}
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 'var(--spacing-3)', marginBottom: 'var(--spacing-3)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  <span>{t('assets.registerCardDetail', 'Record physical count balances, calculate variance against general ledger, and attach verification documentation.')}</span>
                </div>

                <Link
                  to="/asset-verification"
                  className="btn btn-outline btn-md"
                  style={{ alignSelf: 'flex-start', marginTop: 'auto' }}
                >
                  <Coins size={16} aria-hidden="true" />
                  <span>{t('assets.openRegister', 'Open Register')}</span>
                </Link>
              </div>
            </div>
          </section>

          {/* Story Step 3: Assigned Audit Requests (Audit Module) */}
          <section
            id="accounting-requests-sec"
            className="dashboard-section"
            aria-labelledby="assigned-requests-heading"
          >
            <div style={{ marginBottom: 'var(--spacing-2)' }}>
              <span className="badge badge-neutral" style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {t('auditModule.badge', 'Audit Module')}
              </span>
            </div>
            <div className="dashboard-section-header">
              <div className="dashboard-section-title-group">
                <h2 id="assigned-requests-heading" className="dashboard-section-title">
                  {t('dashboard.assignedRequestsTitle')}
                </h2>
                <p className="dashboard-section-subtitle">
                  {t('dashboard.assignedRequestsSubtitle')}
                </p>
              </div>
              <Link to="/audit-requests" className="btn btn-outline btn-sm">
                <span>{t('dashboard.viewAll')}</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>

            {auditRequests.length === 0 ? (
              <div className="card" style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                  {t('dashboard.noRequests')}
                </p>
              </div>
            ) : (
              <>
                <div className="dashboard-engagements-grid">
                  {pagedAccountingRequests.map((request) => {
                    const deadlineInfo = getDeadlineInfo(request.dueDate)
                    return (
                      <Link
                        key={request.id}
                        to={`/audit-requests/${request.id}`}
                        className="dashboard-engagement-card"
                      >
                        <div className="dashboard-engagement-card-header">
                          <div>
                            <h3 className="dashboard-engagement-card-title">{request.title}</h3>
                            <p className="dashboard-engagement-client">
                              {request.referenceCode} • {request.category}
                            </p>
                          </div>
                          <StatusBadge status={request.status} size="sm" />
                        </div>

                        <p
                          style={{
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--text-muted)',
                            lineHeight: 1.5,
                            margin: 0,
                          }}
                        >
                          {request.description}
                        </p>

                        <div className="dashboard-engagement-footer">
                          <span>
                            {request.assigneeName
                              ? `${t('review.assignedAccountingTeamMember', 'Assignee')}: ${request.assigneeName}`
                              : 'Unassigned'}
                          </span>
                          <span
                            style={{
                              color:
                                deadlineInfo.status === 'overdue'
                                  ? 'var(--color-danger-600)'
                                  : 'var(--text-muted)',
                              fontWeight: deadlineInfo.status === 'overdue' ? 700 : 500,
                            }}
                          >
                            {formatDate(request.dueDate)}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>

                <Pagination
                  currentPage={accountingRequestsPage}
                  totalItems={auditRequests.length}
                  pageSize={ACCOUNTING_REQUESTS_PAGE_SIZE}
                  onPageChange={setAccountingRequestsPage}
                  size="sm"
                />
              </>
            )}
          </section>
        </div>
      )}
    </PageContainer>
  )
}
