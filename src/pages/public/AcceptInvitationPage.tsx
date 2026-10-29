import React, { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowRight,
  Loader2,
  CheckCircle2,
  Building,
  ShieldCheck,
  Calendar,
  User,
  LogIn,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AuthLayout } from '@/features/auth/components/AuthLayout/AuthLayout'
import { PasswordInput } from '@/features/auth/components/PasswordInput/PasswordInput'
import { AuthAlert } from '@/features/auth/components/AuthAlert/AuthAlert'
import { PasswordRequirements } from '@/features/auth/components/PasswordRequirements/PasswordRequirements'
import { FormField } from '@/components/forms/FormField'
import {
  acceptInvitationSchema,
  type AcceptInvitationFormData,
} from '@/features/auth/schemas/authSchemas'
import { authService } from '@/features/auth/services/authService'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useSessionStore } from '@/store/sessionStore'
import type { InvitationDetails, UserProfile } from '@/features/auth/types'
import { AppApiError } from '@/services/api/apiErrors'

export const AcceptInvitationPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() || null

  const { isAuthenticated, user: currentUser, setAuthenticatedUser } = useAuth()

  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(Boolean(token))
  const [invitationDetails, setInvitationDetails] = useState<InvitationDetails | null>(null)
  const [tokenError, setTokenError] = useState<string | null>(() =>
    token ? null : t('authentication.invitationTokenInvalid')
  )
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<AcceptInvitationFormData>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      preferredLanguage: 'en',
      termsAccepted: false,
    },
  })

  const password = useWatch({ control, name: 'password' })

  // Load backend-authoritative invitation details
  useEffect(() => {
    if (!token) return

    let isMounted = true

    const fetchDetails = async () => {
      setIsLoadingDetails(true)
      setTokenError(null)

      try {
        const response = await authService.getInvitationDetails(token)
        if (isMounted) {
          setInvitationDetails(response.data)
          if (response.data.invitedEmail) {
            setValue('email', response.data.invitedEmail)
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          if (err instanceof AppApiError) {
            if (err.status === 404 || err.code === 'NOT_FOUND') {
              setTokenError(t('authentication.invitationTokenInvalid'))
            } else if (err.status === 410 || err.message.toLowerCase().includes('expired')) {
              setTokenError(t('authentication.invitationExpired'))
            } else if (err.status === 409 || err.message.toLowerCase().includes('already accepted')) {
              setTokenError(t('authentication.invitationAlreadyAccepted'))
            } else {
              setTokenError(err.message)
            }
          } else {
            setTokenError(t('authentication.invitationTokenInvalid'))
          }
        }
      } finally {
        if (isMounted) {
          setIsLoadingDetails(false)
        }
      }
    }

    void fetchDetails()

    return () => {
      isMounted = false
    }
  }, [token, setValue, t])

  // Submit acceptance for newly registered users
  const onSubmitNewUser = async (data: AcceptInvitationFormData) => {
    if (!token) {
      setServerError(t('authentication.invitationExpired'))
      return
    }

    setIsSubmitting(true)
    setServerError(null)

    try {
      const response = await authService.acceptInvitation({
        invitationToken: token,
        fullName: data.fullName.trim(),
        email: data.email?.trim() || invitationDetails?.invitedEmail,
        password: data.password,
        confirmPassword: data.confirmPassword,
        preferredLanguage: data.preferredLanguage,
        termsAccepted: data.termsAccepted,
      })

      const user =
        response.data?.user ||
        (response.data as unknown as { id?: string })?.id
          ? (response.data as unknown as UserProfile)
          : null

      if (user) {
        setAuthenticatedUser(user)
        useSessionStore.getState().recordUserActivity()
        navigate('/dashboard', { replace: true })
      } else {
        setIsSuccess(true)
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

  // Accept invitation for already logged-in user
  const onAcceptAsLoggedInUser = async () => {
    if (!token) return

    setIsSubmitting(true)
    setServerError(null)

    try {
      await authService.acceptInvitation({
        invitationToken: token,
        fullName: currentUser?.fullName || '',
        password: '',
      })
      navigate('/dashboard', { replace: true })
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
      title={t('authentication.signUpInvitationTitle')}
      subtitle={t('authentication.signUpInvitationSubtitle')}
      maxWidth="md"
      footerLinks={
        <div>
          <span>{t('authentication.haveAccount')}{' '}</span>
          <Link
            to={
              token
                ? `/login?redirect=${encodeURIComponent('/accept-invitation?token=' + token)}`
                : '/login'
            }
          >
            {t('authentication.signInLink')}
          </Link>
        </div>
      }
    >
      {/* Loading Details Skeleton */}
      {isLoadingDetails && (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-8) 0' }}>
          <Loader2
            size={32}
            className="spinner"
            style={{ color: 'var(--brand-green-700)', margin: '0 auto var(--spacing-3) auto' }}
            aria-hidden="true"
          />
          <p style={{ color: 'var(--color-slate-600)', fontSize: 'var(--font-size-sm)' }}>
            {t('authentication.verifyingInvitationDetails')}
          </p>
        </div>
      )}

      {/* Invalid / Expired / Unverifiable Invitation Alert */}
      {!isLoadingDetails && tokenError && !isSuccess && (
        <AuthAlert variant="error" message={tokenError}>
          <div style={{ marginTop: 'var(--spacing-3)' }}>
            <Link to="/login" className="btn btn-outline btn-sm">
              <span>{t('authentication.returnToSignIn')}</span>
            </Link>
          </div>
        </AuthAlert>
      )}

      {/* Server Error Alert */}
      {serverError && <AuthAlert variant="error" message={serverError} />}

      {/* Success State */}
      {isSuccess && (
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
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-slate-900)', marginBottom: 'var(--spacing-2)' }}>
            {t('authentication.invitationAcceptedSuccess')}
          </h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-slate-600)', marginBottom: 'var(--spacing-6)' }}>
            {t('authentication.invitationAcceptedDesc')}
          </p>
          <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            <span>{t('authentication.signInToWorkspace')}</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* Valid Invitation Experience */}
      {!isLoadingDetails && !tokenError && !isSuccess && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
          {/* Backend Authoritative Details Card */}
          {invitationDetails && (
            <div
              style={{
                padding: 'var(--spacing-4)',
                backgroundColor: 'var(--color-slate-50)',
                border: '1px solid var(--color-slate-200)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-2)',
                fontSize: 'var(--font-size-xs)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-slate-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t('authentication.invitationScope')}
                </span>
                <span
                  style={{
                    backgroundColor: 'var(--color-success-100)',
                    color: 'var(--color-success-800)',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {t('authentication.verifiedBadge')}
                </span>
              </div>

              {invitationDetails.organizationName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--color-slate-900)', fontWeight: 600 }}>
                  <Building size={16} aria-hidden="true" />
                  <span>{t('authentication.invitationCompany', { name: invitationDetails.organizationName })}</span>
                </div>
              )}

              {invitationDetails.inviterName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--color-slate-700)' }}>
                  <ShieldCheck size={16} aria-hidden="true" />
                  <span>{t('authentication.invitationAuditor', { name: invitationDetails.inviterName })}</span>
                </div>
              )}

              {invitationDetails.engagementTitle && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--color-slate-700)' }}>
                  <Building size={16} aria-hidden="true" />
                  <span>{t('authentication.invitationEngagement', { name: invitationDetails.engagementTitle })}</span>
                </div>
              )}

              {invitationDetails.expiresAt && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--text-muted)' }}>
                  <Calendar size={16} aria-hidden="true" />
                  <span>{t('authentication.invitationExpires', { date: new Date(invitationDetails.expiresAt).toLocaleDateString() })}</span>
                </div>
              )}
            </div>
          )}

          {/* PATH A: User is already logged in */}
          {isAuthenticated && currentUser ? (
            <div
              style={{
                padding: 'var(--spacing-4)',
                border: '1.5px solid rgba(20, 108, 67, 0.2)',
                backgroundColor: 'var(--brand-green-50, #f0fdf4)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                <User size={18} style={{ color: 'var(--brand-green-700)' }} />
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--brand-green-950)' }}>
                  {t('authentication.invitationSignedInAs', { name: currentUser.fullName, email: currentUser.email })}
                </span>
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--brand-green-900)', margin: 0 }}>
                {t('authentication.invitationConnectPrompt')}
              </p>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={onAcceptAsLoggedInUser}
                disabled={isSubmitting}
                style={{ width: '100%', marginTop: 'var(--spacing-2)' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="spinner" aria-hidden="true" />
                    <span>{t('authentication.invitationConnecting')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('authentication.invitationAcceptFor', { name: currentUser.fullName })}</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          ) : (
            /* PATH B: User is not logged in -> Registration Form */
            <form
              onSubmit={handleSubmit(onSubmitNewUser)}
              noValidate
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 'var(--spacing-2)', borderBottom: '1px solid var(--color-slate-200)' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-slate-900)' }}>
                  {t('authentication.createAccountingAccount')}
                </span>
                <Link
                  to={`/login?redirect=${encodeURIComponent('/accept-invitation?token=' + (token || ''))}`}
                  style={{ fontSize: 'var(--font-size-xs)', color: 'var(--brand-green-700)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <LogIn size={13} />
                  <span>{t('authentication.existingUserSignIn')}</span>
                </Link>
              </div>

              {/* Full Name */}
              <FormField
                label={t('authentication.fullNameLabel')}
                htmlFor="invitation-fullname"
                required
                error={errors.fullName?.message}
              >
                <input
                  id="invitation-fullname"
                  type="text"
                  autoComplete="name"
                  className={`input ${errors.fullName ? 'input-error' : ''}`}
                  placeholder="e.g. Amina Bello"
                  disabled={isSubmitting}
                  {...register('fullName')}
                />
              </FormField>

              {/* Email (from invitation) */}
              <FormField
                label={t('authentication.emailLabel')}
                htmlFor="invitation-email"
                required
                helperText={t('authentication.invitationEmailHelper')}
                error={errors.email?.message}
              >
                <input
                  id="invitation-email"
                  type="email"
                  autoComplete="email"
                  className="input"
                  disabled={Boolean(invitationDetails?.invitedEmail) || isSubmitting}
                  {...register('email')}
                />
              </FormField>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                {/* Password */}
                <FormField
                  label={t('authentication.passwordLabel')}
                  htmlFor="invitation-password"
                  required
                  error={errors.password?.message}
                >
                  <PasswordInput
                    id="invitation-password"
                    autoComplete="new-password"
                    hasError={Boolean(errors.password)}
                    disabled={isSubmitting}
                    {...register('password')}
                  />
                </FormField>

                {/* Confirm Password */}
                <FormField
                  label={t('authentication.confirmPasswordLabel')}
                  htmlFor="invitation-confirm-password"
                  required
                  error={errors.confirmPassword?.message}
                >
                  <PasswordInput
                    id="invitation-confirm-password"
                    autoComplete="new-password"
                    hasError={Boolean(errors.confirmPassword)}
                    disabled={isSubmitting}
                    {...register('confirmPassword')}
                  />
                </FormField>
              </div>

              {/* Preferred Language */}
              <FormField
                label="Preferred Language"
                htmlFor="invitation-language"
              >
                <select
                  id="invitation-language"
                  className="input"
                  disabled={isSubmitting}
                  {...register('preferredLanguage')}
                >
                  <option value="en">English</option>
                  <option value="yo">Èdè Yorùbá</option>
                  <option value="ig">Asụsụ Igbo</option>
                  <option value="ha">Harshen Hausa</option>
                  <option value="pcm">Nigerian Pidgin</option>
                </select>
              </FormField>

              {/* Password Requirements */}
              <PasswordRequirements password={password || ''} />

              {/* Terms Consent */}
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--spacing-2)',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-slate-700)',
                  }}
                >
                  <input
                    type="checkbox"
                    disabled={isSubmitting}
                    style={{ marginTop: '2px', accentColor: 'var(--brand-green-700)' }}
                    {...register('termsAccepted')}
                  />
                  <span>
                    {t('legal.termsConsentPrefix', 'I accept the')}{' '}
                    <a
                      href="/terms-and-conditions"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--brand-green-700)', textDecoration: 'underline', fontWeight: 600 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t('legal.termsConsentLink', 'Website Terms and Conditions')}
                    </a>
                  </span>
                </label>
                {errors.termsAccepted && (
                  <span
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-danger-600)',
                      display: 'block',
                      marginTop: 'var(--spacing-1)',
                    }}
                  >
                    {errors.termsAccepted.message}
                  </span>
                )}
              </div>

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
                    <span>Accept Invitation &amp; Register</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </AuthLayout>
  )
}
