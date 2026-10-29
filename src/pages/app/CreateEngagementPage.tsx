import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Briefcase } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { FormField } from '@/components/forms/FormField'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCreateEngagement } from '@/features/engagements/hooks/useEngagements'
import {
  createEngagementSchema,
  type CreateEngagementFormData,
} from '@/features/engagements/schemas/engagementSchemas'
import { AppApiError } from '@/services/api/apiErrors'

// Pure initial defaults generator defined outside render scope
const getInitialEngagementDates = () => {
  const now = new Date()
  return {
    currentYear: now.getFullYear(),
    todayStr: now.toISOString().split('T')[0],
  }
}

export const CreateEngagementPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const isAuditor =
    user?.role === 'AUDITOR' || user?.role === 'AUDIT_MANAGER' || user?.role === 'ADMIN'

  const [serverError, setServerError] = useState<string | null>(null)
  const createMutation = useCreateEngagement()

  const [defaultDates] = useState(getInitialEngagementDates)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateEngagementFormData>({
    resolver: zodResolver(createEngagementSchema),
    defaultValues: {
      title: '',
      clientOrganizationName: '',
      fiscalYear: defaultDates.currentYear,
      startDate: defaultDates.todayStr,
      targetCompletionDate: '',
    },
  })

  if (!isAuditor) {
    return (
      <PageContainer title={t('engagements.createTitle')}>
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
            Only certified auditors and audit managers are authorized to establish new audit engagements.
          </p>
          <Link to="/engagements" className="btn btn-primary btn-sm">
            <span>{t('engagements.title')}</span>
          </Link>
        </div>
      </PageContainer>
    )
  }

  const onSubmit = async (data: CreateEngagementFormData) => {
    setServerError(null)

    try {
      const response = await createMutation.mutateAsync({
        title: data.title.trim(),
        clientOrganizationName: data.clientOrganizationName.trim(),
        fiscalYear: Number(data.fiscalYear),
        startDate: data.startDate,
        targetCompletionDate: data.targetCompletionDate,
      })

      if (response?.data?.id) {
        navigate(`/engagements/${response.data.id}`)
      } else {
        navigate('/engagements')
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
      title={t('engagements.createTitle')}
      subtitle={t('engagements.createSubtitle')}
      maxWidth="md"
      actions={
        <Link to="/engagements" className="btn btn-outline btn-md">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>{t('common.cancel')}</span>
        </Link>
      }
    >
      <Breadcrumbs
        items={[
          { label: t('navigation.dashboard'), to: '/dashboard' },
          { label: t('engagements.title'), to: '/engagements' },
          { label: t('engagements.createTitle') },
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
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}
        >
          {/* Section 1: Engagement Identity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            <h3
              style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 700,
                color: 'var(--color-slate-900)',
                paddingBottom: 'var(--spacing-2)',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              Engagement Identification
            </h3>

            {/* Engagement Title */}
            <FormField
              label={t('engagements.engagementTitleLabel')}
              htmlFor="engagement-title"
              error={errors.title?.message}
              required
            >
              <input
                id="engagement-title"
                type="text"
                className={`form-input ${errors.title ? 'form-input-error' : ''}`}
                placeholder={t('engagements.engagementTitlePlaceholder')}
                disabled={isSubmitting}
                {...register('title')}
              />
            </FormField>

            {/* Client Organization / Company Name */}
            <FormField
              label={t('engagements.clientOrgLabel')}
              htmlFor="engagement-client-org"
              error={errors.clientOrganizationName?.message}
              required
            >
              <input
                id="engagement-client-org"
                type="text"
                className={`form-input ${errors.clientOrganizationName ? 'form-input-error' : ''}`}
                placeholder={t('engagements.clientOrgPlaceholder')}
                disabled={isSubmitting}
                {...register('clientOrganizationName')}
              />
            </FormField>
          </div>

          {/* Section 2: Financial Year & Key Dates */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            <h3
              style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 700,
                color: 'var(--color-slate-900)',
                paddingBottom: 'var(--spacing-2)',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              Audit Period & Timelines
            </h3>

            {/* Fiscal Year */}
            <FormField
              label={t('engagements.fiscalYearLabel')}
              htmlFor="engagement-fiscal-year"
              error={errors.fiscalYear?.message}
              required
            >
              <input
                id="engagement-fiscal-year"
                type="number"
                min="2000"
                max="2100"
                className={`form-input ${errors.fiscalYear ? 'form-input-error' : ''}`}
                disabled={isSubmitting}
                {...register('fiscalYear')}
              />
            </FormField>

            {/* Dates Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--spacing-3)',
              }}
            >
              <FormField
                label={t('engagements.startDateLabel')}
                htmlFor="engagement-start-date"
                error={errors.startDate?.message}
                required
              >
                <input
                  id="engagement-start-date"
                  type="date"
                  className={`form-input ${errors.startDate ? 'form-input-error' : ''}`}
                  disabled={isSubmitting}
                  {...register('startDate')}
                />
              </FormField>

              <FormField
                label={t('engagements.targetDateLabel')}
                htmlFor="engagement-target-date"
                error={errors.targetCompletionDate?.message}
                required
              >
                <input
                  id="engagement-target-date"
                  type="date"
                  className={`form-input ${errors.targetCompletionDate ? 'form-input-error' : ''}`}
                  disabled={isSubmitting}
                  {...register('targetCompletionDate')}
                />
              </FormField>
            </div>
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
            <Link to="/engagements" className="btn btn-outline btn-md">
              <ArrowLeft size={16} aria-hidden="true" />
              <span>{t('common.cancel')}</span>
            </Link>
            <button
              type="submit"
              className="btn btn-primary btn-md"
              disabled={isSubmitting || createMutation.isPending}
            >
              {isSubmitting || createMutation.isPending ? (
                <>
                  <Loader2 size={16} className="spinner" aria-hidden="true" />
                  <span>{t('authentication.submitting')}</span>
                </>
              ) : (
                <>
                  <Briefcase size={16} aria-hidden="true" />
                  <span>{t('engagements.createBtn')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  )
}
