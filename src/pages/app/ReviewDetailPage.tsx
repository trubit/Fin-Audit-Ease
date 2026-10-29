import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  AlertCircle,
  RefreshCw,
  Building,
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton/LoadingSkeleton'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { LifecycleTimeline } from '@/components/common/LifecycleTimeline/LifecycleTimeline'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { DocumentPreviewModal } from '@/features/documents/components/DocumentPreviewModal/DocumentPreviewModal'
import type { AuditDocument } from '@/features/documents/types'
import {
  useReview,
  useApproveReview,
  useRejectReview,
  useSubmitFeedback,
  RequestContextCard,
  DocumentReviewArea,
  PrivateAuditorNotesCard,
  AuditorDecisionCard,
  AccountingTeamRejectionNotice,
  ReviewActionModal,
} from '@/features/review'
import '@/features/review/components/ReviewWorkspace.css'

export const ReviewDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { user } = useAuth()

  const { data: response, isLoading, isError, refetch } = useReview(id)
  const item = response?.data

  const { mutate: approve, isPending: isApproving } = useApproveReview()
  const { mutate: reject, isPending: isRejecting } = useRejectReview()
  const { mutateAsync: submitFeedback, isPending: isSubmittingFeedback } = useSubmitFeedback()

  const [modalAction, setModalAction] = useState<'APPROVE' | 'REJECT' | null>(null)
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<AuditDocument | null>(null)
  const [conflictErrorMessage, setConflictErrorMessage] = useState<string | null>(null)

  const isAuditorOrManager =
    user?.role === 'AUDITOR' || user?.role === 'AUDIT_MANAGER' || user?.role === 'ADMIN'

  const isEngagementCompleted = item?.engagementStatus === 'COMPLETED'

  const handleModalConfirm = (notes?: string) => {
    if (!item) return
    setConflictErrorMessage(null)

    if (modalAction === 'APPROVE') {
      approve(
        { id: item.id, payload: { notes } },
        {
          onSuccess: () => {
            setModalAction(null)
          },
          onError: (err: unknown) => {
            setModalAction(null)
            // Handle concurrent conflict or stale state
            const errorMessage =
              err instanceof Error && err.message
                ? err.message
                : t('review.conflictError', 'Review state has changed. Refetching latest status...')
            setConflictErrorMessage(errorMessage)
            refetch()
          },
        }
      )
    } else if (modalAction === 'REJECT') {
      reject(
        { id: item.id, payload: { notes } },
        {
          onSuccess: () => {
            setModalAction(null)
          },
          onError: (err: unknown) => {
            setModalAction(null)
            const errorMessage =
              err instanceof Error && err.message
                ? err.message
                : t('review.conflictError', 'Review state has changed. Refetching latest status...')
            setConflictErrorMessage(errorMessage)
            refetch()
          },
        }
      )
    }
  }

  const handleSavePrivateNote = async (comment: string) => {
    if (!item) return
    setConflictErrorMessage(null)
    try {
      await submitFeedback({
        id: item.id,
        payload: {
          comment,
          targetType: 'DOCUMENT',
          targetId: item.documentId || item.id,
        },
      })
    } catch (err: unknown) {
      refetch()
      throw err
    }
  }



  const headerActions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
      <Link
        to="/review"
        className="btn btn-outline btn-md"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        <span>{t('common.backToQueue', 'Back to Queue')}</span>
      </Link>
      {isAuditorOrManager && item && !isEngagementCompleted && item.status !== 'APPROVED' && (
        <>
          <button
            type="button"
            className="btn btn-outline btn-md"
            onClick={() => setModalAction('REJECT')}
            disabled={isApproving || isRejecting}
            style={{
              borderColor: 'var(--color-rose-300)',
              color: 'var(--color-rose-700)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <XCircle size={16} aria-hidden="true" />
            <span>{t('review.notApprovedOption', 'Not Approved')}</span>
          </button>
          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={() => setModalAction('APPROVE')}
            disabled={isApproving || isRejecting}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>{t('review.approvedOption', 'Approved')}</span>
          </button>
        </>
      )}
      {!isAuditorOrManager && item?.status === 'REJECTED' && item.auditRequestId && (
        <Link
          to={`/audit-requests/${item.auditRequestId}`}
          className="btn btn-primary btn-md"
        >
          <span>{t('review.respondRejection', 'Respond & Resubmit Evidence')}</span>
        </Link>
      )}
    </div>
  )

  return (
    <PageContainer
      title={item?.title || t('review.detailTitle', 'Review Item Details')}
      subtitle={item ? `${t('review.engagement', 'Engagement')}: ${item.engagementName || item.engagementId}` : ''}
      actions={headerActions}
      maxWidth="lg"
    >
      {/* Navigation Breadcrumbs */}
      <div style={{ marginBottom: 'var(--spacing-6)' }}>
        <Breadcrumbs
          items={[
            { label: t('navigation.dashboard', 'Dashboard'), to: '/dashboard' },
            { label: t('auditModule.title', 'Audit Module') },
            { label: t('review.pageTitle', 'Audit Checklist and Supporting Documents'), to: '/review' },
            { label: item?.title || t('review.detailTitle', 'Review Details') },
          ]}
        />
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <LoadingSkeleton height="8rem" width="100%" />
          <LoadingSkeleton height="14rem" width="100%" />
          <LoadingSkeleton height="10rem" width="100%" />
        </div>
      )}

      {/* Error Banner with Retry */}
      {isError && (
        <div
          style={{
            padding: 'var(--spacing-6)',
            backgroundColor: 'var(--color-rose-50, #fff1f2)',
            border: '1px solid var(--color-rose-200, #fecdd3)',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--spacing-6)',
          }}
          role="alert"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <AlertCircle size={22} style={{ color: 'var(--color-rose-600)' }} />
            <div>
              <p style={{ fontWeight: 600, color: 'var(--color-rose-900)', margin: 0 }}>
                {t('review.loadError', 'Failed to load review workspace records.')}
              </p>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-rose-800)', margin: '4px 0 0 0' }}>
                {t('errors.unauthorizedOrMissing', 'The submission may be unavailable or you may lack permission for this engagement.')}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => refetch()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} aria-hidden="true" />
            <span>{t('common.retry', 'Retry')}</span>
          </button>
        </div>
      )}

      {/* Conflict / Stale State Alert */}
      {conflictErrorMessage && (
        <div
          style={{
            padding: 'var(--spacing-4) var(--spacing-6)',
            backgroundColor: 'var(--color-amber-50, #fffbeb)',
            border: '1px solid var(--color-amber-200, #fde68a)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--spacing-6)',
          }}
          role="alert"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <AlertCircle size={20} style={{ color: 'var(--color-amber-600)' }} />
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-amber-900)' }}>
              {conflictErrorMessage}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setConflictErrorMessage(null)
              refetch()
            }}
          >
            <span>{t('common.refresh', 'Refresh')}</span>
          </button>
        </div>
      )}

      {/* Main Review Workspace Content */}
      {!isLoading && !isError && item && (
        <div className="review-workspace-container">
          {/* Workspace Status Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--spacing-3) var(--spacing-6)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              flexWrap: 'wrap',
              gap: 'var(--spacing-3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
              <Building size={16} style={{ color: 'var(--color-slate-400)' }} aria-hidden="true" />
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-slate-900)' }}>
                {item.engagementName || item.engagementId}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                {t('review.status', 'Review Status')}:
              </span>
              <StatusBadge status={item.status} size="sm" />
            </div>
          </div>

          <LifecycleTimeline
            steps={[
              {
                id: 'step-request',
                label: t('auditRequests.stepCreated', 'Requested'),
                isCompleted: true,
                isActive: false,
              },
              {
                id: 'step-responded',
                label: t('auditRequests.stepSubmitted', 'Submitted'),
                isCompleted: item.status !== 'PENDING',
                isActive: item.status === 'PENDING',
              },
              {
                id: 'step-review',
                label: t('auditRequests.stepUnderReview', 'Under Review'),
                isCompleted: item.status === 'APPROVED' || item.status === 'REJECTED',
                isActive: item.status === 'IN_REVIEW',
              },
              {
                id: 'step-decision',
                label: t('auditRequests.stepDecision', 'Decision'),
                isCompleted: item.status === 'APPROVED' || item.status === 'REJECTED',
                isActive: false,
                isRejected: item.status === 'REJECTED',
              },
            ]}
          />

          {/* 1. Request Context */}
          <RequestContextCard
            title={item.title}
            referenceCode={item.referenceCode}
            description={item.description}
            category={item.category}
            assignedAccountingTeamMember={item.assignedAccountingTeamMember}
            priority={item.priority}
            submissionDate={item.submissionDate}
            dueDate={item.dueDate}
            status={item.status}
          />

          {/* 2. Accounting Team Rejection Alert (If Rejected & Viewer is Accounting Team Member) */}
          {!isAuditorOrManager && item.status === 'REJECTED' && (
            <AccountingTeamRejectionNotice
              rejectionReason={item.rejectionReason}
              auditRequestId={item.auditRequestId}
            />
          )}

          {/* 3. Document Review Area (Multiple Files, Preview, Download, Version History) */}
          <DocumentReviewArea
            documents={item.documents}
            fallbackDocumentId={item.documentId}
            fallbackDocumentName={item.documentName}
            onOpenPreview={(doc) => setSelectedPreviewDoc(doc)}
          />

          {/* 4. Auditor Decision Controls (Strictly Auditor-Only & Engagement-Protected) */}
          {isAuditorOrManager && (
            <AuditorDecisionCard
              status={item.status}
              isLocked={Boolean(isEngagementCompleted)}
              isSubmitting={isApproving || isRejecting}
              onApprove={() => setModalAction('APPROVE')}
              onReject={() => setModalAction('REJECT')}
            />
          )}

          {/* 5. Private Auditor Notes (Strictly Auditor-Only, Invisible to Accounting Team) */}
          {isAuditorOrManager && (
            <PrivateAuditorNotesCard
              feedbackNotes={item.feedbackNotes}
              isSaving={isSubmittingFeedback}
              onSaveNote={handleSavePrivateNote}
            />
          )}
        </div>
      )}

      {/* Accessible Decision Confirmation Modal */}
      <ReviewActionModal
        isOpen={Boolean(modalAction)}
        actionType={modalAction}
        itemTitle={item?.title || ''}
        isSubmitting={isApproving || isRejecting}
        onClose={() => setModalAction(null)}
        onConfirm={handleModalConfirm}
      />

      {/* Reused Phase 7 Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={Boolean(selectedPreviewDoc)}
        document={selectedPreviewDoc}
        onClose={() => setSelectedPreviewDoc(null)}
      />
    </PageContainer>
  )
}
