import React, { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Send, Paperclip } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { FormField } from '@/components/forms/FormField'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useEngagements, useEngagementMembers } from '@/features/engagements/hooks/useEngagements'
import { useCreateAuditRequest } from '@/features/auditRequests/hooks/useAuditRequests'
import {
  createAuditRequestSchema,
  type CreateAuditRequestFormData,
} from '@/features/auditRequests/schemas/auditRequestSchemas'
import { AppApiError } from '@/services/api/apiErrors'

const getTodayDateString = () => new Date().toISOString().split('T')[0]

export const CreateAuditRequestPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialEngagementId = searchParams.get('engagementId') || ''
  const { user } = useAuth()

  const isAuditor =
    user?.role === 'AUDITOR' || user?.role === 'AUDIT_MANAGER' || user?.role === 'ADMIN'

  const [serverError, setServerError] = useState<string | null>(null)

  const { data: engagements = [], isLoading: engagementsLoading } = useEngagements()
  const createMutation = useCreateAuditRequest()

  const [todayStr] = useState(getTodayDateString)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateAuditRequestFormData>({
    resolver: zodResolver(createAuditRequestSchema),
    defaultValues: {
      engagementId: initialEngagementId,
      title: '',
      category: 'Bank Documents',
      priority: 'MEDIUM',
      dueDate: '',
      description: '',
      assigneeId: '',
    },
  })

  // Watch selected engagement to dynamically fetch its real Accounting Team Members (Section 15)
  const selectedEngagementId = useWatch({ control, name: 'engagementId' })
  const {
    data: members = [],
    isLoading: membersLoading,
    isError: membersError,
  } = useEngagementMembers(selectedEngagementId)

  if (!isAuditor) {
    return (
      <PageContainer title={t('auditRequests.createTitle')}>
        <div className="card" style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>
          <p
            style={{
              color: 'var(--color-danger-700)',
              fontWeight: 600,
              marginBottom: 'var(--spacing-4)',
            }}
          >
            {t('errors.unauthorized')}
          </p>
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-6)' }}>
            Only certified auditors and engagement managers can create formal client audit requests.
          </p>
          <Link to="/audit-requests" className="btn btn-primary btn-sm">
            <span>{t('common.backToQueue', 'Return to Audit Requests')}</span>
          </Link>
        </div>
      </PageContainer>
    )
  }

  const onSubmit = async (data: CreateAuditRequestFormData) => {
    setServerError(null)

    try {
      const response = await createMutation.mutateAsync({
        engagementId: data.engagementId,
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category,
        priority: data.priority,
        dueDate: data.dueDate,
        assigneeId: data.assigneeId ? data.assigneeId : undefined,
      })

      if (response?.data?.id) {
        navigate(`/audit-requests/${response.data.id}`)
      } else {
        navigate(`/engagements/${data.engagementId}`)
      }
    } catch (err: unknown) {
      if (err instanceof AppApiError) {
        setServerError(err.message)
      } else {
        setServerError(t('errors.generic'))
      }
    }
  }

  return (
    <PageContainer
      title={t('auditRequests.createTitle')}
      subtitle={t('auditRequests.createSubtitle')}
      maxWidth="md"
      actions={
        <Link to="/audit-requests" className="btn btn-outline btn-md">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>{t('common.cancel')}</span>
        </Link>
      }
    >
      <Breadcrumbs
        items={[
          { label: t('navigation.dashboard'), to: '/dashboard' },
          { label: t('auditRequests.title'), to: '/audit-requests' },
          { label: t('auditRequests.createTitle') },
        ]}
      />

      <div className="card" style={{ padding: 'var(--spacing-6)' }}>
        {serverError && (
          <div
            style={{
              padding: 'var(--spacing-3) var(--spacing-4)',
              backgroundColor: 'var(--color-danger-50)',
              color: 'var(--color-danger-700)',
              border: '1px solid var(--color-danger-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
              marginBottom: 'var(--spacing-4)',
            }}
            role="alert"
          >
            {serverError}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}
        >
          {/* Engagement Select */}
          <FormField
            label={t('auditRequests.selectEngagement')}
            htmlFor="request-engagement"
            error={errors.engagementId?.message}
            required
          >
            <select
              id="request-engagement"
              className={`form-input ${errors.engagementId ? 'form-input-error' : ''}`}
              disabled={isSubmitting || engagementsLoading}
              {...register('engagementId')}
            >
              <option value="">-- {t('auditRequests.selectEngagement')} --</option>
              {engagements.map((eng) => (
                <option key={eng.id} value={eng.id}>
                  {eng.title} ({eng.clientOrganizationName})
                </option>
              ))}
            </select>
          </FormField>

          {/* Request Title */}
          <FormField
            label={t('auditRequests.requestTitle')}
            htmlFor="request-title"
            error={errors.title?.message}
            required
          >
            <input
              id="request-title"
              type="text"
              className={`form-input ${errors.title ? 'form-input-error' : ''}`}
              placeholder={t('auditRequests.titlePlaceholder')}
              disabled={isSubmitting}
              {...register('title')}
            />
          </FormField>

          {/* Category & Priority Grid (PRD Categories) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--spacing-3)',
            }}
          >
            <FormField
              label={t('auditRequests.category')}
              htmlFor="request-category"
              error={errors.category?.message}
              required
            >
              <select
                id="request-category"
                className="form-input"
                disabled={isSubmitting}
                {...register('category')}
              >
                <option value="Bank Documents">{t('auditRequests.catBankDocs')}</option>
                <option value="Tax Documents">{t('auditRequests.catTaxDocs')}</option>
                <option value="Payroll">{t('auditRequests.catPayroll')}</option>
                <option value="Invoices & Receipts">{t('auditRequests.catInvoices')}</option>
                <option value="Board Resolutions">{t('auditRequests.catResolutions')}</option>
                <option value="Management Accounts">{t('auditRequests.catManagementAccounts')}</option>
                <option value="Others">{t('auditRequests.catOthers')}</option>
                <option value="Cash & Equivalents">{t('auditRequests.catCash')}</option>
                <option value="Accounts Receivable">{t('auditRequests.catReceivables')}</option>
                <option value="Inventory">{t('auditRequests.catInventory')}</option>
                <option value="Property, Plant & Equipment">{t('auditRequests.catFixedAssets')}</option>
                <option value="Accounts Payable">{t('auditRequests.catPayables')}</option>
                <option value="Taxation">{t('auditRequests.catTax')}</option>
                <option value="Equity & Capital">{t('auditRequests.catEquity')}</option>
              </select>
            </FormField>

            <FormField
              label={t('auditRequests.priority')}
              htmlFor="request-priority"
              error={errors.priority?.message}
              required
            >
              <select
                id="request-priority"
                className="form-input"
                disabled={isSubmitting}
                {...register('priority')}
              >
                <option value="LOW">{t('auditRequests.prioLow')}</option>
                <option value="MEDIUM">{t('auditRequests.prioMedium')}</option>
                <option value="HIGH">{t('auditRequests.prioHigh')}</option>
                <option value="CRITICAL">{t('auditRequests.prioCritical')}</option>
              </select>
            </FormField>
          </div>

          {/* Assignee & Due Date Grid (Section 15 & 17) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--spacing-3)',
            }}
          >
            {/* Assign to Accounting Team Member (Section 15: real members from backend) */}
            <FormField
              label={t('auditRequests.assignee')}
              htmlFor="request-assignee"
              error={errors.assigneeId?.message}
            >
              <select
                id="request-assignee"
                className="form-input"
                disabled={isSubmitting || !selectedEngagementId || membersLoading}
                {...register('assigneeId')}
              >
                {!selectedEngagementId && (
                  <option value="">{t('auditRequests.selectEngagementFirst')}</option>
                )}
                {selectedEngagementId && membersLoading && (
                  <option value="">{t('auditRequests.loadingMembers')}</option>
                )}
                {selectedEngagementId && !membersLoading && membersError && (
                  <option value="">{t('auditRequests.unableToLoadMembers')}</option>
                )}
                {selectedEngagementId && !membersLoading && !membersError && members.length === 0 && (
                  <option value="">{t('auditRequests.noMembersAvailable')}</option>
                )}
                {selectedEngagementId && !membersLoading && !membersError && (
                  <>
                    <option value="">{t('auditRequests.unassigned')}</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.fullName} ({member.email})
                      </option>
                    ))}
                  </>
                )}
              </select>
            </FormField>

            {/* Deadline (Section 17: Date cannot be in the past) */}
            <FormField
              label={t('auditRequests.dueDate')}
              htmlFor="request-dueDate"
              error={errors.dueDate?.message}
              required
            >
              <input
                id="request-dueDate"
                type="date"
                min={todayStr}
                className={`form-input ${errors.dueDate ? 'form-input-error' : ''}`}
                disabled={isSubmitting}
                {...register('dueDate')}
              />
            </FormField>
          </div>

          {/* Description */}
          <FormField
            label={t('auditRequests.description')}
            htmlFor="request-description"
            error={errors.description?.message}
            required
          >
            <textarea
              id="request-description"
              rows={5}
              className={`form-input ${errors.description ? 'form-input-error' : ''}`}
              placeholder={t('auditRequests.descriptionPlaceholder')}
              disabled={isSubmitting}
              {...register('description')}
            />
          </FormField>

          {/* Section 16: Reference Attachment Transparent Notice */}
          <div
            style={{
              padding: 'var(--spacing-3) var(--spacing-4)',
              backgroundColor: 'var(--color-slate-50)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-muted)',
            }}
          >
            <Paperclip size={16} aria-hidden="true" style={{ flexShrink: 0 }} />
            <span>{t('auditRequests.refAttachmentNotice')}</span>
          </div>

          {/* Form Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--spacing-3)',
              marginTop: 'var(--spacing-4)',
              paddingTop: 'var(--spacing-4)',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <Link to="/audit-requests" className="btn btn-outline btn-md">
              <ArrowLeft size={16} aria-hidden="true" />
              <span>{t('common.cancel')}</span>
            </Link>
            <button type="submit" className="btn btn-primary btn-md" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spinner" aria-hidden="true" />
                  <span>{t('authentication.submitting')}</span>
                </>
              ) : (
                <>
                  <Send size={16} aria-hidden="true" />
                  <span>{t('auditRequests.submitBtn')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  )
}
