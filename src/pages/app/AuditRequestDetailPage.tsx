import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Download,
  Clock,
  FolderLock,
  User,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Lock,
  Send,
  Loader2,
  Eye,
  Globe,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '@/hooks/useLanguage'
import { LanguageSwitcher } from '@/components/navigation/LanguageSwitcher/LanguageSwitcher'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { Badge } from '@/components/common/Badge/Badge'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { AttentionCard } from '@/components/common/AttentionCard/AttentionCard'
import { LifecycleTimeline } from '@/components/common/LifecycleTimeline/LifecycleTimeline'
import { EmptyState } from '@/components/feedback/EmptyState/EmptyState'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton/LoadingSkeleton'
import { PageError } from '@/components/feedback/PageError/PageError'
import { useToast } from '@/components/feedback/Toast'
import { FileUploadZone } from '@/features/documents/components/FileUploadZone/FileUploadZone'
import { DocumentPreviewModal } from '@/features/documents/components/DocumentPreviewModal/DocumentPreviewModal'
import { DocumentVersionHistory } from '@/features/documents/components/DocumentVersionHistory/DocumentVersionHistory'
import { ReviewActionModal } from '@/features/review/components/ReviewActionModal/ReviewActionModal'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  useAuditRequest,
  useUpdateAuditRequestStatus,
  useAddAuditRequestComment,
} from '@/features/auditRequests/hooks/useAuditRequests'
import { useDocuments, useUploadDocument } from '@/features/documents/hooks/useDocuments'
import { useEngagement } from '@/features/engagements/hooks/useEngagements'
import { documentService } from '@/features/documents/services/documentService'
import { formatBytes } from '@/features/documents/utils/validation'
import { getDeadlineInfo, formatDate, formatDateTime } from '@/utils/dateUtils'
import type { AuditDocument } from '@/features/documents/types'

export const AuditRequestDetailPage: React.FC = () => {
  const { t } = useTranslation()
  const { currentOption } = useLanguage()
  const { showToast } = useToast()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const isAuditor =
    user?.role === 'AUDITOR' || user?.role === 'AUDIT_MANAGER' || user?.role === 'ADMIN'

  const [modalAction, setModalAction] = useState<'APPROVE' | 'REJECT' | null>(null)
  const [responseComment, setResponseComment] = useState('')
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null)
  const [previewDoc, setPreviewDoc] = useState<AuditDocument | null>(null)

  const {
    data: request,
    isLoading: requestLoading,
    isError: requestError,
    refetch: refetchRequest,
  } = useAuditRequest(id)

  const {
    data: documents = [],
    refetch: refetchDocuments,
  } = useDocuments(id ? { auditRequestId: id } : undefined)

  const { data: engagement } = useEngagement(request?.engagementId)
  const uploadMutation = useUploadDocument()
  const updateStatusMutation = useUpdateAuditRequestStatus()
  const addCommentMutation = useAddAuditRequestComment()

  if (requestLoading) {
    return (
      <PageContainer title={t('auditRequests.detailTitle')}>
        <LoadingSkeleton height="3rem" width="50%" />
        <div style={{ marginTop: 'var(--spacing-4)' }}>
          <LoadingSkeleton height="14rem" />
        </div>
      </PageContainer>
    )
  }

  if (requestError || !request) {
    return (
      <PageContainer title={t('auditRequests.detailTitle')}>
        <PageError onRetry={() => void refetchRequest()} message={t('errors.notFoundMessage')} />
      </PageContainer>
    )
  }

  const isCompletedEngagement = engagement?.status === 'COMPLETED'
  const deadline = getDeadlineInfo(request.dueDate)


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

  // Handle Accounting Team response submission / resubmission (Sections 24, 25, 28)
  const handleAccountingSubmit = async () => {
    setActionSuccessMessage(null)
    try {
      const trimmedComment = responseComment.trim()
      await updateStatusMutation.mutateAsync({
        id: request.id,
        payload: {
          status: 'SUBMITTED',
          reviewNotes: trimmedComment || undefined,
        },
      })

      if (trimmedComment) {
        try {
          await addCommentMutation.mutateAsync({
            id: request.id,
            content: trimmedComment,
          })
        } catch {
          // Comment payload already sent with status update
        }
      }

      setResponseComment('')
      setActionSuccessMessage(
        t('auditRequests.responseSubmittedSuccess', 'Response submitted successfully and sent for auditor review.')
      )
      void refetchRequest()
      void refetchDocuments()
    } catch {
      // Handled by react-query mutation error state
    }
  }

  // Handle Auditor Approval / Rejection (Sections 26, 29)
  const handleAuditorDecision = async (notes?: string) => {
    if (!modalAction) return
    const isApprove = modalAction === 'APPROVE'

    try {
      await updateStatusMutation.mutateAsync({
        id: request.id,
        payload: {
          status: isApprove ? 'ACCEPTED' : 'REJECTED',
          ...(isApprove ? { reviewNotes: notes } : { rejectionReason: notes }),
        },
      })
      setModalAction(null)
      setActionSuccessMessage(
        isApprove
          ? 'Audit request approved and evidentiary requirements verified.'
          : 'Submission rejected with mandatory correction instructions.'
      )
      void refetchRequest()
    } catch {
      // Handled by react-query
    }
  }

  // Section 22: Connected Workflow Progress Timeline
  // Created → Assigned → Response received → Review → Decision
  const lifecycleSteps = [
    {
      id: 'step-created',
      label: t('auditRequests.stepCreated'),
      detail: formatDate(request.createdAt),
      isCompleted: true,
      isActive: false,
    },
    {
      id: 'step-assigned',
      label: t('auditRequests.stepAssigned'),
      detail: request.assigneeName || t('auditRequests.unassigned'),
      isCompleted: Boolean(request.assigneeId || request.assigneeName),
      isActive: request.status === 'OPEN' && !request.assigneeId,
    },
    {
      id: 'step-submitted',
      label: t('auditRequests.stepSubmitted'),
      detail:
        documents.length > 0
          ? `${documents.length} evidentiary files`
          : request.status !== 'OPEN'
          ? 'Evidence submitted'
          : 'Awaiting submission',
      isCompleted:
        documents.length > 0 ||
        request.status === 'SUBMITTED' ||
        request.status === 'IN_REVIEW' ||
        request.status === 'ACCEPTED' ||
        request.status === 'REJECTED',
      isActive: request.status === 'OPEN',
    },
    {
      id: 'step-review',
      label: t('auditRequests.stepUnderReview'),
      detail:
        request.status === 'IN_REVIEW'
          ? 'Under auditor review'
          : request.status === 'ADDITIONAL_INFO_REQUIRED'
          ? 'Additional info requested'
          : request.status === 'ACCEPTED' || request.status === 'REJECTED'
          ? 'Review concluded'
          : 'Pending review',
      isCompleted: request.status === 'ACCEPTED' || request.status === 'REJECTED',
      isActive:
        request.status === 'SUBMITTED' ||
        request.status === 'IN_REVIEW' ||
        request.status === 'ADDITIONAL_INFO_REQUIRED',
    },
    {
      id: 'step-decision',
      label: t('auditRequests.stepDecision'),
      detail:
        request.status === 'ACCEPTED'
          ? t('auditRequests.statusAccepted')
          : request.status === 'REJECTED'
          ? t('auditRequests.statusRejected')
          : 'Awaiting determination',
      isCompleted: request.status === 'ACCEPTED' || request.status === 'REJECTED',
      isActive: false,
      isRejected: request.status === 'REJECTED',
    },
  ]

  return (
    <PageContainer
      title={request.title}
      subtitle={`${request.referenceCode} — ${request.category}`}
      actions={
        isAuditor && !isCompletedEngagement ? (
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
            {request.status !== 'ACCEPTED' && (
              <>
                <button
                  type="button"
                  className="btn btn-primary btn-md"
                  onClick={() => setModalAction('APPROVE')}
                  disabled={updateStatusMutation.isPending}
                >
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>{t('auditRequests.approveRequestBtn', 'Approve Request')}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-md"
                  onClick={() => setModalAction('REJECT')}
                  disabled={updateStatusMutation.isPending}
                  style={{ color: 'var(--color-rose-700)', borderColor: 'var(--color-rose-300)' }}
                >
                  <XCircle size={16} aria-hidden="true" />
                  <span>{t('auditRequests.rejectRequestBtn', 'Reject / Request Corrections')}</span>
                </button>
              </>
            )}
            <Link to="/review" className="btn btn-outline btn-md">
              <span>{t('review.title', 'Review Workspace')}</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        ) : !isAuditor && !isCompletedEngagement ? (
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
            {request.status !== 'ACCEPTED' && (
              <a
                href="#accounting-response-comment"
                className="btn btn-primary btn-md"
                onClick={(e) => {
                  e.preventDefault()
                  const el = document.getElementById('accounting-response-comment')
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' })
                    el.focus()
                  }
                }}
              >
                <Send size={16} aria-hidden="true" />
                <span>
                  {request.status === 'REJECTED'
                    ? t('auditRequests.resubmitEvidenceBtn', 'Resubmit Corrected Evidence')
                    : t('auditRequests.submitEvidenceBtn', 'Submit Evidence')}
                </span>
              </a>
            )}
          </div>
        ) : undefined
      }
    >
      <Breadcrumbs
        items={[
          { label: t('navigation.dashboard'), to: '/dashboard' },
          { label: t('auditRequests.title'), to: '/audit-requests' },
          { label: request.referenceCode },
        ]}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        {/* Multilingual Adaptation Bar (Auditor <-> Recipient Language Flexibility) */}
        <div
          style={{
            padding: 'var(--spacing-3) var(--spacing-4)',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--spacing-3)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', flex: '1 1 auto' }}>
            <Globe size={18} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-slate-700)', lineHeight: 1.4 }}>
              <strong style={{ color: 'var(--color-slate-900)' }}>
                {t('auditRequests.multilingualTitle', 'Multilingual Audit Interface')}:
              </strong>{' '}
              {t(
                'auditRequests.multilingualDesc',
                'Viewing in {{language}}. Request milestones, workflow statuses, categories, and evidence prompts automatically adapt to your chosen language.',
                { language: currentOption.nativeName }
              )}
            </span>
          </div>
          <div style={{ flexShrink: 0 }}>
            <LanguageSwitcher variant="compact" />
          </div>
        </div>

        {/* Read-Only Notice if parent engagement is completed */}
        {isCompletedEngagement && (
          <div
            style={{
              padding: 'var(--spacing-3) var(--spacing-4)',
              backgroundColor: 'var(--color-slate-100)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-slate-800)',
            }}
          >
            <Lock size={16} aria-hidden="true" />
            <span>{t('auditRequests.completedEngagementNotice', 'This request is part of a completed engagement and is now permanent read-only.')}</span>
          </div>
        )}

        {/* Success Action Notification Banner */}
        {actionSuccessMessage && (
          <div
            style={{
              padding: 'var(--spacing-3) var(--spacing-4)',
              backgroundColor: 'var(--color-success-50, #f0fdf4)',
              border: '1px solid var(--color-success-300, #86efac)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-success-800)',
              fontSize: 'var(--font-size-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
            }}
            role="status"
          >
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* Attention Banner for Rejection */}
        {request.status === 'REJECTED' && (
          <AttentionCard
            variant="danger"
            title={t('auditRequests.rejectionAlertTitle', 'Submission Requires Correction')}
            description={
              <div>
                <p style={{ fontWeight: 600, marginBottom: '4px' }}>
                  {t('auditRequests.rejectionReasonTitle', 'Auditor Rejection Reason')}:
                </p>
                <p style={{ margin: 0, lineHeight: 1.5 }}>
                  {request.rejectionReason ||
                    request.reviewNotes ||
                    t(
                      'auditRequests.rejectionFallbackReason',
                      'The auditor has requested corrections on the submitted evidence. Please review the instructions and upload a replacement document below.'
                    )}
                </p>
                <p style={{ fontSize: 'var(--font-size-xs)', marginTop: '8px', opacity: 0.9 }}>
                  {t(
                    'auditRequests.rejectionCorrectionNotice',
                    'Please upload a corrected replacement schedule or evidentiary file using the upload area below.'
                  )}
                </p>
              </div>
            }
          />
        )}

        {/* Informational Attention Banner for Accepted Status */}
        {!isAuditor && request.status === 'ACCEPTED' && (
          <AttentionCard
            variant="success"
            title={t('auditRequests.acceptedBannerTitle', 'Request Accepted & Approved')}
            description={t(
              'auditRequests.acceptedBannerDesc',
              'The evidentiary documents for this request have been verified and approved by the audit team.'
            )}
          />
        )}

        {/* Informational Attention Banner for Submitted/In-Review Status */}
        {!isAuditor && (request.status === 'SUBMITTED' || request.status === 'IN_REVIEW') && (
          <AttentionCard
            variant="info"
            title={t(
              'auditRequests.responseSubmittedBannerTitle',
              'Evidence Submitted — Under Auditor Review'
            )}
            description={t(
              'auditRequests.responseSubmittedBannerDesc',
              'Your evidentiary documents and responses have been received. An auditor will inspect and sign off on this item.'
            )}
          />
        )}

        {/* Connected Workflow Progress Timeline */}
        <LifecycleTimeline steps={lifecycleSteps} />

        {/* Request Overview Card */}
        <div className="card" style={{ padding: 'var(--spacing-6)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 'var(--spacing-4)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: 'var(--font-size-base)',
                    color: 'var(--color-primary-700)',
                  }}
                >
                  {request.referenceCode}
                </span>
                <StatusBadge status={request.priority} />
                <StatusBadge status={request.status} />
              </div>

              <h2
                style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 700,
                  color: 'var(--color-slate-900)',
                  marginTop: 'var(--spacing-2)',
                }}
              >
                {request.title}
              </h2>

              {engagement && (
                <p
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-muted)',
                    marginTop: 'var(--spacing-1)',
                  }}
                >
                  Engagement:{' '}
                  <Link
                    to={`/engagements/${engagement.id}`}
                    style={{ color: 'var(--color-primary-600)', fontWeight: 500 }}
                  >
                    {engagement.title} ({engagement.clientOrganizationName})
                  </Link>
                </p>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                {t('auditRequests.dueDate')}
              </p>
              <p
                style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  color: deadline.status === 'overdue' && request.status !== 'ACCEPTED' ? 'var(--color-danger-700)' : 'var(--color-slate-900)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-1)',
                  justifyContent: 'flex-end',
                }}
              >
                <Clock size={14} aria-hidden="true" />
                <span>
                  {formatDate(request.dueDate)} ({deadline.label})
                </span>
              </p>
            </div>
          </div>

          {/* Metadata Row */}
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
                {t('auditRequests.category')}
              </span>
              <span style={{ fontWeight: 600 }}>{request.category}</span>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 'var(--font-size-xs)' }}>
                {t('auditRequests.assignee')}
              </span>
              <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={14} aria-hidden="true" />
                <span>{request.assigneeName || t('auditRequests.unassigned')}</span>
              </span>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 'var(--font-size-xs)' }}>
                Created Date
              </span>
              <span style={{ fontWeight: 600 }}>{formatDate(request.createdAt)}</span>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 'var(--font-size-xs)' }}>
                Attached Files
              </span>
              <span style={{ fontWeight: 600 }}>{documents.length} evidentiary files</span>
            </div>
          </div>

          {/* Description / Instructions */}
          <div
            style={{
              marginTop: 'var(--spacing-6)',
              paddingTop: 'var(--spacing-4)',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <h3
              style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-slate-800)',
                marginBottom: 'var(--spacing-2)',
              }}
            >
              {t('auditRequests.description')}
            </h3>
            <p
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-slate-700)',
                lineHeight: 'var(--line-height-normal)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {request.description}
            </p>
          </div>

          {/* Audit Notes / Review Feedback Display if available */}
          {(request.reviewNotes || request.rejectionReason) && request.status !== 'REJECTED' && (
            <div
              style={{
                marginTop: 'var(--spacing-4)',
                padding: 'var(--spacing-3) var(--spacing-4)',
                backgroundColor: 'var(--color-slate-50)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', fontSize: 'var(--font-size-xs)', marginBottom: '2px' }}>
                Auditor Review Notes:
              </span>
              <span style={{ color: 'var(--color-slate-800)', whiteSpace: 'pre-wrap' }}>
                {request.reviewNotes || request.rejectionReason}
              </span>
            </div>
          )}

          {/* Section 21 & 29: Auditor Determination Controls (Auditors Only) */}
          {isAuditor && !isCompletedEngagement && (
            <div
              style={{
                marginTop: 'var(--spacing-6)',
                paddingTop: 'var(--spacing-4)',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--spacing-3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                <ShieldCheck size={18} className="text-primary" />
                <div>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-slate-800)', display: 'block' }}>
                    {t('review.auditorDecisionTitle', 'Auditor Determination')}
                  </span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    {request.status === 'ACCEPTED'
                      ? 'This request has been formally accepted and approved.'
                      : 'Evaluate submitted documentary evidence and mark as approved or request corrections.'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
                {request.status !== 'ACCEPTED' && (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline btn-md"
                      onClick={() => setModalAction('REJECT')}
                      disabled={updateStatusMutation.isPending}
                      style={{ color: 'var(--color-rose-700)', borderColor: 'var(--color-rose-300)' }}
                    >
                      <XCircle size={16} aria-hidden="true" />
                      <span>{t('auditRequests.rejectRequestBtn', 'Reject / Request Corrections')}</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-md"
                      onClick={() => setModalAction('APPROVE')}
                      disabled={updateStatusMutation.isPending}
                    >
                      <CheckCircle2 size={16} aria-hidden="true" />
                      <span>{t('auditRequests.approveRequestBtn', 'Approve Request')}</span>
                    </button>
                  </>
                )}
                <Link to="/review" className="btn btn-outline btn-md">
                  <span>{t('auditRequests.goToReview', 'Go to Review Workspace')}</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Attached Evidentiary Documents Section */}
        <section aria-labelledby="attached-docs-heading">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--spacing-4)',
            }}
          >
            <h2
              id="attached-docs-heading"
              style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-slate-900)' }}
            >
              {t('auditRequests.attachedDocuments')} ({documents.length})
            </h2>
          </div>

          {documents.length === 0 ? (
            <EmptyState
              title={t('documents.emptyTitle')}
              description="No evidentiary documents or financial schedules have been attached to this request yet."
              icon={<FolderLock size={36} />}
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
                      {t('documents.fileName')}
                    </th>
                    <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>
                      {t('documents.classificationLabel')}
                    </th>
                    <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>
                      {t('documents.fileSize')}
                    </th>
                    <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>
                      {t('documents.uploadedBy')}
                    </th>
                    <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>
                      {t('documents.uploadDate')}
                    </th>
                    <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>
                      {t('common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>
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
                        {formatDateTime(doc.createdAt)}
                      </td>
                      <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => setPreviewDoc(doc)}
                            aria-label={`Preview ${doc.originalFileName || doc.fileName}`}
                          >
                            <Eye size={14} aria-hidden="true" />
                            <span>{t('common.preview', 'Preview')}</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => void handleDownload(doc.id, doc.originalFileName || doc.fileName)}
                            aria-label={`Download ${doc.originalFileName || doc.fileName}`}
                          >
                            <Download size={14} aria-hidden="true" />
                            <span>{t('documents.download')}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Section 22 & 23: Permanent Version History Timeline */}
          {documents.length > 0 && (
            <div style={{ marginTop: 'var(--spacing-4)' }}>
              <DocumentVersionHistory
                documents={documents}
                onPreviewDocument={(d) => setPreviewDoc(d)}
              />
            </div>
          )}
        </section>

        {/* Section 21, 24, 25, 27, 28: Accounting Team Response Area (Visible only to Accounting Team when open or rejected) */}
        {!isAuditor && !isCompletedEngagement && (request.status === 'OPEN' || request.status === 'REJECTED') && (
          <section aria-labelledby="upload-response-heading">
            <h2
              id="upload-response-heading"
              style={{
                fontSize: 'var(--font-size-lg)',
                fontWeight: 700,
                color: 'var(--color-slate-900)',
                marginBottom: 'var(--spacing-4)',
              }}
            >
              {request.status === 'REJECTED'
                ? t('auditRequests.resubmitEvidenceBtn', 'Resubmit Corrected Evidence')
                : t('auditRequests.uploadResponse')}
            </h2>
            <div className="card" style={{ padding: 'var(--spacing-6)' }}>
              <FileUploadZone
                engagementId={request.engagementId}
                auditRequestId={request.id}
                onUploadComplete={() => {
                  void refetchDocuments()
                  void refetchRequest()
                }}
                onUpload={async (file, meta, options) => {
                  await uploadMutation.mutateAsync({ file, meta, options })
                }}
                isUploading={uploadMutation.isPending}
              />

              {/* Section 25: Optional Response Context / Comment */}
              <div style={{ marginTop: 'var(--spacing-5)' }}>
                <label
                  htmlFor="accounting-response-comment"
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    color: 'var(--color-slate-700)',
                    marginBottom: 'var(--spacing-1)',
                  }}
                >
                  {t('auditRequests.responseCommentLabel', 'Response Notes / Comments (Optional)')}
                </label>
                <textarea
                  id="accounting-response-comment"
                  className="form-input"
                  rows={3}
                  placeholder={t(
                    'auditRequests.responseCommentPlaceholder',
                    'Provide additional context, schedule references, or reconciliation details for the auditor...'
                  )}
                  value={responseComment}
                  onChange={(e) => setResponseComment(e.target.value)}
                  disabled={updateStatusMutation.isPending}
                />
              </div>

              {/* Submission Button */}
              <div
                style={{
                  marginTop: 'var(--spacing-4)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  type="button"
                  className="btn btn-primary btn-md"
                  disabled={
                    documents.length === 0 ||
                    updateStatusMutation.isPending ||
                    uploadMutation.isPending
                  }
                  onClick={() => void handleAccountingSubmit()}
                >
                  {updateStatusMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="spin-animation" aria-hidden="true" />
                      <span>{t('common.submitting')}</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} aria-hidden="true" />
                      <span>
                        {request.status === 'REJECTED'
                          ? t('auditRequests.resubmitEvidenceBtn', 'Resubmit Corrected Evidence')
                          : t('auditRequests.submitEvidenceBtn', 'Submit Evidence for Review')}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Auditor Approval / Rejection Modal */}
      <ReviewActionModal
        isOpen={modalAction !== null}
        actionType={modalAction}
        itemTitle={request.title}
        isSubmitting={updateStatusMutation.isPending}
        onClose={() => setModalAction(null)}
        onConfirm={(notes) => void handleAuditorDecision(notes)}
      />

      {/* Document Safe Preview Modal */}
      <DocumentPreviewModal
        isOpen={previewDoc !== null}
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </PageContainer>
  )
}
