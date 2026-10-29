import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AuthLayout } from '@/features/auth/components/AuthLayout/AuthLayout'
import { PasswordInput } from '@/features/auth/components/PasswordInput/PasswordInput'
import { AuthAlert } from '@/features/auth/components/AuthAlert/AuthAlert'
import { FormField } from '@/components/forms/FormField'
import { PasswordRequirements } from '@/features/auth/components/PasswordRequirements/PasswordRequirements'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/features/auth/schemas/authSchemas'
import { authService } from '@/features/auth/services/authService'
import { AppApiError } from '@/services/api/apiErrors'

export const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [serverError, setServerError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  })

  const newPassword = useWatch({ control, name: 'newPassword' })

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setServerError('Password reset token is missing from the URL. Please request a new link.')
      return
    }

    setIsSubmitting(true)
    setServerError(null)

    try {
      await authService.resetPassword({
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })
      setIsSuccess(true)
    } catch (err: unknown) {
      if (err instanceof AppApiError) {
        setServerError(err.message)
      } else {
        setServerError(t('errors.generic'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title={t('authentication.forgotPasswordTitle')}
      subtitle={t('authentication.resetPasswordDescription')}
      footerLinks={
        <div>
          <Link to="/login">{t('authentication.returnToSignIn')}</Link>
        </div>
      }
    >
      {/* Missing Token Alert */}
      {!token && !isSuccess && (
        <AuthAlert
          variant="error"
          message="Password reset link is invalid or incomplete. Please request a new password recovery link."
        >
          <div style={{ marginTop: 'var(--spacing-3)' }}>
            <Link to="/forgot-password" className="btn btn-outline btn-sm">
              <span>{t('authentication.sendResetLinkButton')}</span>
            </Link>
          </div>
        </AuthAlert>
      )}

      {/* Server Error Alert */}
      {serverError && <AuthAlert variant="error" message={serverError} />}

      {/* Reset Success State */}
      {isSuccess ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-4) 0' }}>
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-success-50)',
              color: 'var(--color-success-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--spacing-4) auto',
            }}
          >
            <CheckCircle2 size={32} aria-hidden="true" />
          </div>
          <p
            style={{
              fontSize: 'var(--font-size-base)',
              fontWeight: 500,
              color: 'var(--color-slate-900)',
              marginBottom: 'var(--spacing-6)',
            }}
          >
            {t('authentication.resetPasswordSuccess')}
          </p>
          <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            <span>{t('authentication.signInButton')}</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      ) : (
        token && (
          <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            <FormField
              label={t('authentication.passwordLabel')}
              htmlFor="reset-password"
              required
              helperText={t('authentication.passwordPolicyHint')}
              error={errors.newPassword?.message}
            >
              <PasswordInput
                id="reset-password"
                autoComplete="new-password"
                hasError={Boolean(errors.newPassword)}
                disabled={isSubmitting}
                {...register('newPassword')}
              />
            </FormField>

            <FormField
              label={t('authentication.confirmPasswordLabel')}
              htmlFor="reset-confirm-password"
              required
              error={errors.confirmPassword?.message}
            >
              <PasswordInput
                id="reset-confirm-password"
                autoComplete="new-password"
                hasError={Boolean(errors.confirmPassword)}
                disabled={isSubmitting}
                {...register('confirmPassword')}
              />
            </FormField>

            <PasswordRequirements password={newPassword || ''} />

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
                <span>{t('authentication.resetPasswordButton')}</span>
              )}
            </button>
          </form>
        )
      )}
    </AuthLayout>
  )
}
