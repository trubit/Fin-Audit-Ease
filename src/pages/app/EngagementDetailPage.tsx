import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Plus,
  Download,
  Clock,
  CheckCircle2,
  Circle,
  Users,
  UserPlus,
  History,
  Lock,
  Loader2,
  Copy,
  Check,
  User as UserIcon,
  FileText,
  Upload,
  MessagesSquare,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { Badge } from '@/components/common/Badge/Badge'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { EmptyState } from '@/components/feedback/EmptyState/EmptyState'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton/LoadingSkeleton'
import { PageError } from '@/components/feedback/PageError/PageError'
import { useToast } from '@/components/feedback/Toast'
import { FormField } from '@/components/forms/FormField'
import { trapFocus } from '@/utils/accessibility'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { formatUserRole } from '@/features/auth/utils/roleUtils'
import {
  useEngagement,
  useEngagementMilestones,
  useEngagementMembers,
  useInviteEngagementMember,
} from '@/features/engagements/hooks/useEngagements'
import { useAuditRequests } from '@/features/auditRequests/hooks/useAuditRequests'
import { useDocuments } from '@/features/documents/hooks/useDocuments'
import { documentService } from '@/features/documents/services/documentService'
import { formatBytes } from '@/features/documents/utils/validation'
import { getDeadlineInfo, formatDate } from '@/utils/dateUtils'
import { AppApiError } from '@/services/api/apiErrors'

export const EngagementDetailPage: React.FC = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { showToast } = useToast()

  const isAuditor =
    user?.role === 'AUDITOR' || user?.role === 'AUDIT_MANAGER' || user?.role === 'ADMIN'

  // Invitation Form State
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('ACCOUNTING_MEMBER')
  const [inviteServerError, setInviteServerError] = useState<string | null>(null)
  const [inviteSuccessToken, setInviteSuccessToken] = useState<string | null>(null)
  const [tokenCopied, setTokenCopied] = useState(false)
  const inviteModalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!inviteModalOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInviteModalOpen(false)
        setInviteServerError(null)
        setInviteSuccessToken(null)
      } else if (inviteModalRef.current) {
        trapFocus(inviteModalRef.current, e)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [inviteModalOpen])

  const {
    data: engagement,
    isLoading: engagementLoading,
    isError: engagementError,
    refetch: refetchEngagement,
  } = useEngagement(id)

  const { data: milestones = [] } = useEngagementMilestones(id)
  const { data: requests = [] } = useAuditRequests(id ? { engagementId: id } : undefined)
  const { data: documents = [] } = useDocuments(id ? { engagementId: id } : undefined)
  const {
    data: members = [],
    isLoading: membersLoading,
    isError: membersError,
  } = useEngagementMembers(id)

  const inviteMutation = useInviteEngagementMember(id)

  if (engagementLoading) {
    return (
      <PageContainer title={t('engagements.detailTitle')}>
        <LoadingSkeleton height="3rem" width="60%" />
        <div style={{ marginTop: 'var(--spacing-4)' }}>
          <LoadingSkeleton height="14rem" />
        </div>
      </PageContainer>
    )
  }

  // Section 11: Engagement Isolation - Safe feedback without revealing sensitive internals
  if (engagementError || !engagement) {
    return (
      <PageContainer title={t('engagements.detailTitle')}>
        <PageError
          onRetry={() => void refetchEngagement()}
          message="Engagement workspace not found or you do not have permission to view it."
        />
      </PageContainer>
    )
  }

  const isCompleted = engagement.status === 'COMPLETED'
  const deadline = getDeadlineInfo(engagement.targetCompletionDate)
  const isOverdue =
    !isCompleted && (engagement.status === 'OVERDUE' || deadline.status === 'overdue')
  const progressPct =
    engagement.totalRequestsCount > 0
      ? Math.round((engagement.completedRequestsCount / engagement.totalRequestsCount) * 100)
      : 0

  const handleDownload = async (docId: string, fileName: string) => {
    try {
      const response = await documentService.getDownloadUrl(docId)
      if (response.data?.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank', 'noopener,noreferrer')
      }
    } catch {
      showToast({
        type: 'error',
        title: t('common.error', 'Error'),
        message: t('documents.downloadError', `Unable to download ${fileName} at this time.`),
      })
    }
  }

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviteServerError(null)
    setInviteSuccessToken(null)

    if (!inviteEmail.trim()) {
      setInviteServerError('Please enter a valid corporate email address.')
      return
    }

    try {
      const response = await inviteMutation.mutateAsync({
        email: inviteEmail.trim(),
        role: inviteRole,
      })

      const token = response.data?.invitationToken || response.data?.invitationLink
      if (token) {
        setInviteSuccessToken(token)
      } else {
        setInviteEmail('')
        setInviteModalOpen(false)
      }
    } catch (err: unknown) {
      if (err instanceof AppApiError) {
        setInviteServerError(err.message)
      } else {
        setInviteServerError(t('errors.generic'))
      }
    }
  }

  const handleCopyToken = () => {
    if (inviteSuccessToken) {
      void navigator.clipboard.writeText(inviteSuccessToken)
      setTokenCopied(true)
      setTimeout(() => setTokenCopied(false), 2500)
    }
  }

  return (
    <PageContainer
      title={engagement.title}
      subtitle={`${engagement.clientOrganizationName} — Fiscal Year ${engagement.fiscalYear}`}
      actions={
        isAuditor && !isCompleted ? (
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
            <Link
              to={`/audit-requests/create?engagementId=${engagement.id}`}
              className="btn btn-primary btn-md"
            >
              <Plus size={16} aria-hidden="true" />
              <span>{t('engagements.createRequestForEngagement')}</span>
            </Link>
            <Link
              to={`/communication?engagementId=${engagement.id}`}
              className="btn btn-outline btn-md"
            >
              <MessagesSquare size={16} aria-hidden="true" />
              <span>{t('navigation.communication', 'Communication & Meetings')}</span>
            </Link>
            <button
              type="button"
              className="btn btn-outline btn-md"
              onClick={() => {
                setInviteModalOpen(true)
                setInviteServerError(null)
                setInviteSuccessToken(null)
              }}
            >
              <UserPlus size={16} aria-hidden="true" />
              <span>{t('engagements.inviteMemberBtn')}</span>
            </button>
          </div>
        ) : !isAuditor && !isCompleted ? (
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
            <a
              href="#requests-heading"
              className="btn btn-primary btn-md"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('requests-heading')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <FileText size={16} aria-hidden="true" />
              <span>{t('navigation.auditRequests')}</span>
            </a>
            <Link
              to={`/communication?engagementId=${engagement.id}`}
              className="btn btn-outline btn-md"
            >
              <MessagesSquare size={16} aria-hidden="true" />
              <span>{t('navigation.communication', 'Communication & Meetings')}</span>
            </Link>
            <Link to="/documents" className="btn btn-outline btn-md">
              <Upload size={16} aria-hidden="true" />
              <span>{t('documents.submitUpload', 'Upload Documents')}</span>
            </Link>
          </div>
        ) : undefined
      }
    >
      <Breadcrumbs
        items={[
          { label: t('navigation.dashboard'), to: '/dashboard' },
          { label: t('engagements.title'), to: '/engagements' },
          { label: engagement.title },
        ]}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
        {/* Section 23: Completed Engagements are Permanent Read-Only */}
        {isCompleted && (
          <div
            style={{
              padding: 'var(--spacing-4) var(--spacing-5)',
              backgroundColor: 'var(--color-slate-100)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-3)',
            }}
            role="status"
          >
            <Lock size={20} style={{ color: 'var(--color-slate-700)' }} aria-hidden="true" />
            <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-slate-800)', fontWeight: 500 }}>
              {t('engagements.readOnlyBanner')}
            </p>
          </div>
        )}

        {/* Engagement Overview Card */}
        <div className="card" style={{ padding: 'var(--spacing-6)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 'var(--spacing-3)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-slate-900)' }}>
                  {engagement.title}
                </h2>
                <StatusBadge
                  status={isCompleted ? 'COMPLETED' : isOverdue ? 'OVERDUE' : engagement.status}
                  size="sm"
                />
              </div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: 'var(--spacing-1)' }}>
                {t('engagements.clientOrg')}: <strong>{engagement.clientOrganizationName}</strong>
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{t('engagements.targetDate')}</p>
              <p
                style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  color: isOverdue ? 'var(--color-danger-700)' : 'var(--color-slate-900)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-1)',
                  justifyContent: 'flex-end',
                }}
              >
                <Clock size={14} aria-hidden="true" />
                <span>
                  {formatDate(engagement.targetCompletionDate)} ({deadline.label})
                </span>
              </p>
            </div>
          </div>

          {/* Details Metadata Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--spacing-4)',
              marginTop: 'var(--spacing-6)',
              paddingTop: 'var(--spacing-4)',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 'var(--font-size-xs)' }}>
                {t('dashboard.fiscalYear')}
              </span>
              <span style={{ fontWeight: 600 }}>FY {engagement.fiscalYear}</span>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 'var(--font-size-xs)' }}>
                {t('dashboard.leadAuditor')}
              </span>
              <span style={{ fontWeight: 600 }}>{engagement.leadAuditorName || 'Lead Auditor'}</span>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 'var(--font-size-xs)' }}>
                {t('dashboard.progress')}
              </span>
              <span style={{ fontWeight: 600 }}>
                {engagement.totalRequestsCount > 0
                  ? `${progressPct}% (${engagement.completedRequestsCount} / ${engagement.totalRequestsCount})`
                  : 'No requests yet'}
              </span>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 'var(--font-size-xs)' }}>
                {t('engagements.startDate')}
              </span>
              <span style={{ fontWeight: 600 }}>{formatDate(engagement.startDate)}</span>
            </div>
          </div>
        </div>

        {/* Section: Connected Accounting Team Members (PRD Sections 20, 21, 22) */}
        <section aria-labelledby="members-heading">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--spacing-4)',
            }}
          >
            <div>
              <h2
                id="members-heading"
                style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-slate-900)' }}
              >
                {t('engagements.membersTitle')}
              </h2>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                {t('engagements.membersSubtitle')}
              </p>
            </div>
            {isAuditor && !isCompleted && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setInviteModalOpen(true)
                  setInviteServerError(null)
                  setInviteSuccessToken(null)
                }}
              >
                <UserPlus size={14} aria-hidden="true" />
                <span>{t('engagements.inviteMemberBtn')}</span>
              </button>
            )}
          </div>

          {membersLoading && <LoadingSkeleton height="5rem" />}

          {!membersLoading && membersError && (
            <div className="card" style={{ padding: 'var(--spacing-4)', color: 'var(--color-slate-600)' }}>
              <p style={{ fontSize: 'var(--font-size-sm)', margin: 0 }}>
                Unable to load member roster at this time.
              </p>
            </div>
          )}

          {!membersLoading && !membersError && members.length === 0 && (
            <EmptyState
              icon={<Users size={36} />}
              title={t('engagements.noMembers')}
              description={t('engagements.noMembersDesc')}
              action={
                isAuditor && !isCompleted ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setInviteModalOpen(true)
                      setInviteServerError(null)
                      setInviteSuccessToken(null)
                    }}
                  >
                    <UserPlus size={14} aria-hidden="true" />
                    <span>{t('engagements.inviteMemberBtn')}</span>
                  </button>
                ) : undefined
              }
            />
          )}

          {!membersLoading && !membersError && members.length > 0 && (
            <div className="card" style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--color-slate-50)',
                    }}
                  >
                    <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>{t('engagements.memberName', 'Member Name')}</th>
                    <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>{t('engagements.corporateEmail', 'Corporate Email')}</th>
                    <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>{t('engagements.role', 'Role')}</th>
                    <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>{t('common.status', 'Status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                          <UserIcon size={14} style={{ color: 'var(--color-slate-400)' }} />
                          <span>{member.fullName}</span>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', color: 'var(--text-muted)' }}>
                        {member.email}
                      </td>
                      <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
                        <Badge variant="neutral">
                          {formatUserRole(member.role, t)}
                        </Badge>
                      </td>
                      <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
                        <StatusBadge status={member.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING'} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Section: Associated Audit Requests */}
        <section aria-labelledby="requests-heading">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--spacing-4)',
            }}
          >
            <h2
              id="requests-heading"
              style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-slate-900)' }}
            >
              {t('engagements.relatedRequests')} ({requests.length})
            </h2>
            {isAuditor && !isCompleted && (
              <Link to={`/audit-requests/create?engagementId=${engagement.id}`} className="btn btn-outline btn-sm">
                <Plus size={14} aria-hidden="true" />
                <span>{t('auditRequests.newRequestBtn')}</span>
              </Link>
            )}
          </div>

          {requests.length === 0 ? (
            <EmptyState
              title={t('auditRequests.emptyTitle')}
              description={t('auditRequests.emptyDescription')}
              action={
                isAuditor && !isCompleted ? (
                  <Link
                    to={`/audit-requests/create?engagementId=${engagement.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    <Plus size={14} aria-hidden="true" />
                    <span>{t('auditRequests.newRequestBtn')}</span>
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <div className="card" style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--color-slate-50)',
                    }}
                  >
                    <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>
                      {t('auditRequests.reference')}
                    </th>
                    <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>
                      {t('auditRequests.requestTitle')}
                    </th>
                    <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>
                      {t('auditRequests.priority')}
                    </th>
                    <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>
                      {t('auditRequests.status')}
                    </th>
                    <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>
                      {t('auditRequests.dueDate')}
                    </th>
                    <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>
                      {t('common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td
                        style={{
                          padding: 'var(--spacing-3) var(--spacing-4)',
                          fontFamily: 'monospace',
                          fontWeight: 600,
                        }}
                      >
                        {req.referenceCode}
                      </td>
                      <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 500 }}>
                        {req.title}
                      </td>
                      <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
                        <StatusBadge status={req.priority} size="sm" />
                      </td>
                      <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
                        <StatusBadge status={req.status} size="sm" />
                      </td>
                      <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>{formatDate(req.dueDate)}</td>
                      <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
                        <Link to={`/audit-requests/${req.id}`} className="btn btn-outline btn-sm">
                          <span>{t('engagements.viewDetails')}</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Section: Milestones (if scheduled) */}
        {milestones.length > 0 && (
          <section aria-labelledby="milestones-heading">
            <h2
              id="milestones-heading"
              style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-slate-900)', marginBottom: 'var(--spacing-4)' }}
            >
              {t('engagements.milestones')}
            </h2>
            <div className="card" style={{ padding: 'var(--spacing-4)' }}>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--spacing-3)',
                }}
              >
                {milestones.map((milestone) => (
                  <li
                    key={milestone.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--spacing-2) 0',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                      {milestone.isCompleted ? (
                        <CheckCircle2 size={18} style={{ color: 'var(--color-success-600)' }} aria-hidden="true" />
                      ) : (
                        <Circle size={18} style={{ color: 'var(--color-slate-400)' }} aria-hidden="true" />
                      )}
                      <span
                        style={{
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 500,
                          textDecoration: milestone.isCompleted ? 'line-through' : 'none',
                          color: milestone.isCompleted ? 'var(--text-muted)' : 'inherit',
                        }}
                      >
                        {milestone.title}
                      </span>
                    </div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                      {formatDate(milestone.dueDate)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Section: Engagement Documents */}
        <section aria-labelledby="documents-heading">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--spacing-4)',
            }}
          >
            <h2
              id="documents-heading"
              style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-slate-900)' }}
            >
              {t('engagements.relatedDocuments')} ({documents.length})
            </h2>
            {!isCompleted && (
              <Link to={`/documents?engagementId=${engagement.id}`} className="btn btn-outline btn-sm">
                <span>{t('documents.submitUpload')}</span>
              </Link>
            )}
          </div>

          {documents.length === 0 ? (
            <EmptyState
              title={t('documents.emptyTitle')}
              description={t('documents.emptyDescription')}
            />
          ) : (
            <div className="card" style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--color-slate-50)',
                    }}
                  >
                    <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>{t('documents.fileName')}</th>
                    <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>{t('documents.classificationLabel')}</th>
                    <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>{t('documents.fileSize')}</th>
                    <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>{t('documents.uploadedBy')}</th>
                    <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>{t('documents.uploadDate')}</th>
                    <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 500 }}>
                        {doc.originalFileName || doc.fileName}
                      </td>
                      <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
                        <Badge variant="neutral">{doc.classification}</Badge>
                      </td>
                      <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', color: 'var(--text-muted)' }}>
                        {formatBytes(doc.fileSizeBytes)}
                      </td>
                      <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', color: 'var(--text-muted)' }}>
                        {doc.uploadedByUserName}
                      </td>
                      <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', color: 'var(--text-muted)' }}>
                        {formatDate(doc.createdAt)}
                      </td>
                      <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => void handleDownload(doc.id, doc.originalFileName || doc.fileName)}
                          aria-label={`Download ${doc.originalFileName || doc.fileName}`}
                        >
                          <Download size={14} aria-hidden="true" />
                          <span>{t('documents.download')}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Section 26: Permanent Audit Trail Entry Point */}
        <section aria-labelledby="audit-trail-heading">
          <div
            className="card"
            style={{
              padding: 'var(--spacing-6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--spacing-4)',
              flexWrap: 'wrap',
              backgroundColor: 'var(--color-slate-50)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-4)' }}>
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-50)',
                  color: 'var(--color-primary-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                <History size={24} />
              </div>
              <div>
                <h3
                  id="audit-trail-heading"
                  style={{
                    fontSize: 'var(--font-size-base)',
                    fontWeight: 700,
                    color: 'var(--color-slate-900)',
                    marginBottom: 'var(--spacing-1)',
                  }}
                >
                  {t('engagements.auditTrailTitle')}
                </h3>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', maxWidth: '600px', margin: 0 }}>
                  {t('engagements.auditTrailDesc')}
                </p>
              </div>
            </div>

            <Link to={`/audit-trail?engagementId=${engagement.id}`} className="btn btn-outline btn-md">
              <History size={16} aria-hidden="true" />
              <span>{t('engagements.viewAuditTrail')}</span>
            </Link>
          </div>
        </section>
      </div>

      {/* Invite Accounting Team Member Modal (PRD Sections 20, 21, 22) */}
      {inviteModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-4)',
            zIndex: 1000,
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-modal-title"
        >
          <div
            ref={inviteModalRef}
            className="card"
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: 'var(--spacing-6)',
              backgroundColor: 'var(--bg-surface)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <h3
              id="invite-modal-title"
              style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-slate-900)' }}
            >
              {t('engagements.inviteModalTitle')}
            </h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 'var(--spacing-1)', marginBottom: 'var(--spacing-4)' }}>
              {t('engagements.inviteModalDesc')}
            </p>

            {inviteServerError && (
              <div
                style={{
                  padding: 'var(--spacing-3)',
                  backgroundColor: 'var(--color-danger-50)',
                  color: 'var(--color-danger-700)',
                  border: '1px solid var(--color-danger-200)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-xs)',
                  marginBottom: 'var(--spacing-4)',
                }}
                role="alert"
              >
                {inviteServerError}
              </div>
            )}

            {inviteSuccessToken ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                <div
                  style={{
                    padding: 'var(--spacing-3)',
                    backgroundColor: 'var(--color-success-50)',
                    color: 'var(--color-success-700)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 500,
                  }}
                >
                  {t('engagements.inviteSuccess')}
                </div>

                <div>
                  <label
                    style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: 'var(--spacing-1)' }}
                  >
                    {t('engagements.invitationTokenLabel')}
                  </label>
                  <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                    <input
                      type="text"
                      readOnly
                      value={inviteSuccessToken}
                      className="form-input"
                      style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)' }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={handleCopyToken}
                    >
                      {tokenCopied ? (
                        <>
                          <Check size={14} aria-hidden="true" />
                          <span>{t('engagements.tokenCopied')}</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} aria-hidden="true" />
                          <span>{t('engagements.copyTokenBtn')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-2)' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setInviteModalOpen(false)
                      setInviteSuccessToken(null)
                      setInviteEmail('')
                    }}
                  >
                    <span>{t('common.close')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInviteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                <FormField
                  label={t('engagements.memberEmailLabel')}
                  htmlFor="invite-member-email"
                  required
                >
                  <input
                    id="invite-member-email"
                    type="email"
                    placeholder="accountant@clientcompany.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="form-input"
                    disabled={inviteMutation.isPending}
                    required
                  />
                </FormField>

                <FormField
                  label={t('engagements.memberRoleLabel')}
                  htmlFor="invite-member-role"
                  required
                >
                  <select
                    id="invite-member-role"
                    className="form-input"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    disabled={inviteMutation.isPending}
                  >
                    <option value="ACCOUNTING_MEMBER">{t('roles.accountingMember', 'Corporate Accounting Team Member')}</option>
                    <option value="ACCOUNTING_TEAM_LEAD">{t('roles.accountingLead', 'Accounting Team Lead')}</option>
                    <option value="FINANCE_USER">{t('roles.accountingMember', 'Corporate Accounting Team Member')}</option>
                  </select>
                </FormField>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-2)' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setInviteModalOpen(false)}
                    disabled={inviteMutation.isPending}
                  >
                    <span>{t('common.cancel')}</span>
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={inviteMutation.isPending}
                  >
                    {inviteMutation.isPending ? (
                      <>
                        <Loader2 size={14} className="spinner" aria-hidden="true" />
                        <span>{t('engagements.sendingInvite')}</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={14} aria-hidden="true" />
                        <span>{t('engagements.sendInviteBtn')}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  )
}
