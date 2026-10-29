import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AuthLayout } from '@/features/auth/components/AuthLayout/AuthLayout'
import { AuthAlert } from '@/features/auth/components/AuthAlert/AuthAlert'
import { FormField } from '@/components/forms/FormField'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/features/auth/schemas/authSchemas'
import { authService } from '@/features/auth/services/authService'
import { AppApiError } from '@/services/api/apiErrors'

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation()

  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true)
    setServerError(null)

    try {
      await authService.forgotPassword(data)
      // Always show neutral success message to prevent user enumeration
      setIsSubmitted(true)
    } catch (err: unknown) {
      if (err instanceof AppApiError && err.status >= 500) {
        setServerError(err.message)
      } else {
        // Enforce neutral response even on client/400 errors unless server-wide outage
        setIsSubmitted(true)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title={t('authentication.forgotPasswordTitle')}
      subtitle={t('authentication.forgotPasswordDescription')}
      footerLinks={
        <div>
          <Link
            to="/login"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-1)' }}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>{t('authentication.returnToSignIn')}</span>
          </Link>
        </div>
      }
    >
      {serverError && <AuthAlert variant="error" message={serverError} />}

      {isSubmitted ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-4) 0' }}>
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-info-50)',
              color: 'var(--color-info-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--spacing-4) auto',
            }}
          >
            <MailCheck size={30} aria-hidden="true" />
          </div>
          <p
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-slate-700)',
              lineHeight: 'var(--line-height-relaxed)',
              marginBottom: 'var(--spacing-6)',
            }}
          >
            {t('authentication.forgotPasswordNeutralNotice')}
          </p>
          <Link to="/login" className="btn btn-secondary btn-lg" style={{ width: '100%' }}>
            <span>{t('authentication.returnToSignIn')}</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <FormField
            label={t('authentication.emailLabel')}
            htmlFor="forgot-email"
            required
            error={errors.email?.message}
          >
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              className={`input ${errors.email ? 'input-error' : ''}`}
              placeholder="auditor@firm.com"
              disabled={isSubmitting}
              {...register('email')}
            />
          </FormField>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: 'var(--spacing-2)' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="spin-animation" aria-hidden="true" />
                <span>{t('authentication.submitting')}</span>
              </>
            ) : (
              <span>{t('authentication.sendResetLinkButton')}</span>
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  )
}
