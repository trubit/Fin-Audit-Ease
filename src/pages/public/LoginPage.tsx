import React, { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AuthLayout } from '@/features/auth/components/AuthLayout/AuthLayout'
import { PasswordInput } from '@/features/auth/components/PasswordInput/PasswordInput'
import { AuthAlert } from '@/features/auth/components/AuthAlert/AuthAlert'
import { FormField } from '@/components/forms/FormField'
import { loginSchema, type LoginFormData } from '@/features/auth/schemas/authSchemas'
import { authService } from '@/features/auth/services/authService'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useSessionStore } from '@/store/sessionStore'
import { AppApiError } from '@/services/api/apiErrors'

export const LoginPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { setAuthenticatedUser } = useAuth()
  const sessionExpiredNotice = useSessionStore((state) => state.sessionExpiredNotice)
  const clearSessionExpiredNotice = useSessionStore((state) => state.clearSessionExpiredNotice)

  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isSessionExpired = searchParams.get('session_expired') === 'true' || sessionExpiredNotice
  const isSignedOut = searchParams.get('reason') === 'signed_out'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    setServerError(null)
    if (sessionExpiredNotice) {
      clearSessionExpiredNotice()
    }

    try {
      const response = await authService.login(data)

      const returnPath = (location.state as { from?: { pathname?: string } })?.from

      // 1. Two-Factor Authentication Requirement
      if (response.data?.requires2FA && response.data?.temporaryToken) {
        navigate('/2fa', {
          state: {
            temporaryToken: response.data.temporaryToken,
            email: data.email,
            channel: response.data.channel,
            maskedDestination: response.data.maskedDestination,
            from: returnPath,
          },
          replace: true,
        })
        return
      }

      // 2. Direct Successful Authentication (when 2FA is completed or disabled)
      const user =
        response.data?.user ||
        (response.data?.id ? (response.data as unknown as import('@/features/auth/types').UserProfile) : null)

      if (user) {
        setAuthenticatedUser(user)
        useSessionStore.getState().recordUserActivity()

        // Safe redirect validation: prevent open redirects by ensuring path is relative and starts with /
        const rawFrom = returnPath?.pathname
        const isSafeDestination =
          rawFrom &&
          rawFrom.startsWith('/') &&
          !rawFrom.startsWith('//') &&
          !rawFrom.includes('\\') &&
          rawFrom !== '/login' &&
          rawFrom !== '/2fa' &&
          rawFrom !== '/signed-out'

        const safeDestination = isSafeDestination ? rawFrom : '/dashboard'

        navigate(safeDestination, { replace: true })
      }
    } catch (err: unknown) {
      if (err instanceof AppApiError) {
        // Enforce generic message for credential errors to prevent account enumeration
        if (err.status === 401 || err.code === 'UNAUTHORIZED') {
          setServerError(t('authentication.invalidCredentials'))
        } else {
          setServerError(err.message)
        }
      } else {
        setServerError(t('errors.generic'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title={t('authentication.signInTitle')}
      subtitle={t('common.tagline')}
      footerLinks={
        <>
          <div>
            <span>{t('authentication.noAccount')} </span>
            <Link to="/signup">{t('authentication.signUpLink')}</Link>
          </div>
          {import.meta.env.DEV && (
            <div style={{ marginTop: 'var(--spacing-2)', paddingTop: 'var(--spacing-2)', borderTop: '1px dashed var(--color-slate-200)' }}>
              <Link
                to="/dev-login"
                style={{
                  color: 'var(--color-amber-700)',
                  fontWeight: 600,
                  fontSize: 'var(--font-size-xs)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>{t('devAuth.title')}</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          )}
        </>
      }
    >
      {/* Session Expired Inactivity Notice */}
      {isSessionExpired && (
        <AuthAlert variant="warning" message={t('authentication.sessionExpired')} />
      )}

      {/* Reassuring Sign-Out Confirmation Alert */}
      {isSignedOut && !isSessionExpired && !serverError && (
        <AuthAlert variant="success" message={t('authentication.justSignedOut')} />
      )}

      {/* Server Error Alert */}
      {serverError && <AuthAlert variant="error" message={serverError} />}

      <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        {/* Email Field */}
        <FormField
          label={t('authentication.emailLabel')}
          htmlFor="login-email"
          required
          error={errors.email?.message}
        >
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            className={`input ${errors.email ? 'input-error' : ''}`}
            placeholder="auditor@firm.com"
            disabled={isSubmitting}
            {...register('email')}
          />
        </FormField>

        {/* Password Field */}
        <FormField
          label={t('authentication.passwordLabel')}
          htmlFor="login-password"
          required
          error={errors.password?.message}
        >
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            hasError={Boolean(errors.password)}
            disabled={isSubmitting}
            {...register('password')}
          />
        </FormField>

        {/* Remember Me & Forgot Password Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--spacing-2)',
            fontSize: 'var(--font-size-xs)',
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', cursor: 'pointer', color: 'var(--color-slate-700)' }}>
            <input
              type="checkbox"
              disabled={isSubmitting}
              style={{ borderRadius: 'var(--radius-xs)', accentColor: 'var(--brand-green-700)' }}
              {...register('rememberMe')}
            />
            <span>{t('authentication.rememberMeLabel')}</span>
          </label>

          <Link
            to="/forgot-password"
            style={{ color: 'var(--brand-green-700)', textDecoration: 'none', fontWeight: 600 }}
          >
            {t('authentication.forgotPasswordLink')}
          </Link>
        </div>

        {/* Submit Button */}
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
            <>
              <span>{t('authentication.signInButton')}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  )
}
