import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Loader2, ShieldCheck, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AuthLayout } from '@/features/auth/components/AuthLayout/AuthLayout'
import { AuthAlert } from '@/features/auth/components/AuthAlert/AuthAlert'
import { FormField } from '@/components/forms/FormField'
import { twoFactorSchema, type TwoFactorFormData } from '@/features/auth/schemas/authSchemas'
import { authService } from '@/features/auth/services/authService'
import { useAuthStore } from '@/store/authStore'
import { useSessionStore } from '@/store/sessionStore'
import { AppApiError } from '@/services/api/apiErrors'
import type { UserProfile } from '@/features/auth/types'

interface LocationState {
  readonly temporaryToken?: string
  readonly email?: string
  readonly channel?: 'email' | 'authenticator' | 'sms'
  readonly maskedDestination?: string
  readonly from?: { pathname?: string }
}

export const TwoFactorPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as LocationState) || {}
  const { temporaryToken, maskedDestination } = state

  const [serverError, setServerError] = useState<string | null>(null)
  const [successNotice, setSuccessNotice] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const setAuthenticatedUser = useAuthStore((s) => s.setAuthenticatedUser)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: '',
    },
  })

  const onSubmit = async (data: TwoFactorFormData) => {
    if (!temporaryToken) {
      setServerError(t('authentication.twoFactorMissingSession'))
      return
    }

    setIsSubmitting(true)
    setServerError(null)

    try {
      const response = await authService.verify2FA({
        code: data.code.trim(),
        temporaryToken,
      })

      // Robust extraction of authenticated user profile
      const user =
        response.data?.user ||
        (response.data?.id ? (response.data as unknown as UserProfile) : null)

      if (user) {
        setAuthenticatedUser(user)
        useSessionStore.getState().recordUserActivity()

        // Safe redirect handling: prevent loops back to /login or /2fa
        const rawFrom = state.from?.pathname
        const isSafeDestination =
          rawFrom &&
          rawFrom.startsWith('/') &&
          !rawFrom.startsWith('//') &&
          rawFrom !== '/login' &&
          rawFrom !== '/2fa'

        const safeDestination = isSafeDestination ? rawFrom : '/dashboard'

        navigate(safeDestination, { replace: true })
      } else {
        setServerError(t('errors.generic'))
      }
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

  const handleResend = async () => {
    if (!temporaryToken) {
      setServerError(t('authentication.twoFactorMissingSession'))
      return
    }

    setIsResending(true)
    setServerError(null)
    setSuccessNotice(null)

    try {
      await authService.resend2FA(temporaryToken)
      setSuccessNotice(t('authentication.twoFactorResentNotice'))
    } catch (err: unknown) {
      if (err instanceof AppApiError) {
        setServerError(err.message)
      } else {
        setServerError(t('errors.generic'))
      }
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthLayout
      title={t('authentication.twoFactorTitle')}
      subtitle={
        maskedDestination
          ? `${t('authentication.twoFactorDescription')} (${maskedDestination})`
          : t('authentication.twoFactorDescription')
      }
      footerLinks={
        <div>
          <Link to="/login">{t('authentication.returnToSignIn')}</Link>
        </div>
      }
    >
      {/* Missing Verification Session Alert */}
      {!temporaryToken && (
        <AuthAlert variant="error" message={t('authentication.twoFactorMissingSession')}>
          <div style={{ marginTop: 'var(--spacing-3)' }}>
            <Link to="/login" className="btn btn-outline btn-sm">
              <span>{t('authentication.returnToSignIn')}</span>
            </Link>
          </div>
        </AuthAlert>
      )}

      {/* Success / Resend Notification */}
      {successNotice && <AuthAlert variant="success" message={successNotice} />}

      {/* Server Error Alert */}
      {serverError && <AuthAlert variant="error" message={serverError} />}

      {temporaryToken && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
          <FormField
            label={t('authentication.twoFactorCodeLabel')}
            htmlFor="twoFactorCode"
            error={errors.code?.message}
            required
          >
            <input
              id="twoFactorCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoComplete="one-time-code"
              placeholder={t('authentication.twoFactorCodePlaceholder')}
              className={`form-input ${errors.code ? 'form-input-error' : ''}`}
              style={{
                textAlign: 'center',
                letterSpacing: '0.35em',
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 600,
                fontFamily: 'monospace',
                padding: 'var(--spacing-3) var(--spacing-4)',
              }}
              {...register('code')}
              disabled={isSubmitting}
              autoFocus
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
                <Loader2 size={18} className="spinner" aria-hidden="true" />
                <span>{t('authentication.submitting')}</span>
              </>
            ) : (
              <>
                <ShieldCheck size={18} aria-hidden="true" />
                <span>{t('authentication.verifyButton')}</span>
                <ArrowRight size={18} aria-hidden="true" />
              </>
            )}
          </button>

          <div style={{ textAlign: 'center', paddingTop: 'var(--spacing-2)' }}>
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || isSubmitting}
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-2)' }}
            >
              {isResending ? (
                <>
                  <Loader2 size={14} className="spinner" aria-hidden="true" />
                  <span>{t('authentication.submitting')}</span>
                </>
              ) : (
                <>
                  <RefreshCw size={14} aria-hidden="true" />
                  <span>{t('authentication.resendCodeButton')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}
