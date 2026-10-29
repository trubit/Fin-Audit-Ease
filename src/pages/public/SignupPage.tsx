import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowRight,
  Loader2,
  CheckCircle2,
  Check,
  ShieldCheck,
  Building,
  MailCheck,
  CalendarCheck,
  Layers,
  Clock,
  FileText,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AuthLayout } from '@/features/auth/components/AuthLayout/AuthLayout'
import { PasswordInput } from '@/features/auth/components/PasswordInput/PasswordInput'
import { AuthAlert } from '@/features/auth/components/AuthAlert/AuthAlert'
import { PasswordRequirements } from '@/features/auth/components/PasswordRequirements/PasswordRequirements'
import { FormField } from '@/components/forms/FormField'
import {
  auditorSignupSchema,
  accountingTeamSignupSchema,
  acceptInvitationSchema,
  type AuditorSignUpFormData,
  type AccountingTeamSignUpFormData,
  type AcceptInvitationFormData,
} from '@/features/auth/schemas/authSchemas'
import { authService } from '@/features/auth/services/authService'
import type { InvitationDetails } from '@/features/auth/types'
import { AppApiError } from '@/services/api/apiErrors'
import './SignupPage.css'

export type SignupMode = 'auditor' | 'accounting' | 'invitation'

export const SignupPage: React.FC = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const typeParam = searchParams.get('type')
  const tokenParam = searchParams.get('token')?.trim() || null

  const initialMode: SignupMode =
    typeParam === 'accounting'
      ? 'accounting'
      : typeParam === 'invitation' || tokenParam
      ? 'invitation'
      : 'auditor'

  const [activeMode, setActiveMode] = useState<SignupMode>(initialMode)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Invitation Verification State
  const [activeToken, setActiveToken] = useState<string | null>(tokenParam)
  const [tokenInputDraft, setTokenInputDraft] = useState<string>(tokenParam || '')
  const [invitationDetails, setInvitationDetails] = useState<InvitationDetails | null>(null)
  const [isVerifyingToken, setIsVerifyingToken] = useState<boolean>(false)
  const [invitationTokenError, setInvitationTokenError] = useState<string | null>(null)

  // 1. Auditor Form Hook
  const auditorForm = useForm<AuditorSignUpFormData>({
    resolver: zodResolver(auditorSignupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      firmName: '',
      professionalBody: 'ICAN',
      membershipNumber: '',
      preferredLanguage: 'en',
      termsAccepted: false,
    },
  })

  // 2. Accounting Team Self-Registration Form Hook
  const accountingForm = useForm<AccountingTeamSignUpFormData>({
    resolver: zodResolver(accountingTeamSignupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      companyName: '',
      jobTitle: '',
      accountingYearEndDate: '',
      commencementDate: '',
      preferredLanguage: 'en',
      termsAccepted: false,
    },
  })

  // 3. Accounting Team Invitation Acceptance Form Hook
  const invitationForm = useForm<AcceptInvitationFormData>({
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

  const auditorPassword = useWatch({ control: auditorForm.control, name: 'password' })
  const accountingPassword = useWatch({ control: accountingForm.control, name: 'password' })
  const invitationPassword = useWatch({ control: invitationForm.control, name: 'password' })

  // Verify Invitation Token when activeToken changes
  useEffect(() => {
    if (!activeToken || activeMode !== 'invitation') {
      return
    }

    let isMounted = true

    const verify = async () => {
      setIsVerifyingToken(true)
      setInvitationTokenError(null)
      try {
        const response = await authService.getInvitationDetails(activeToken)
        if (isMounted) {
          setInvitationDetails(response.data)
          if (response.data.invitedEmail) {
            invitationForm.setValue('email', response.data.invitedEmail)
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          setInvitationDetails(null)
          if (err instanceof AppApiError) {
            if (err.status === 404 || err.code === 'NOT_FOUND') {
              setInvitationTokenError(t('authentication.invitationTokenInvalid'))
            } else if (err.status === 410 || err.message.toLowerCase().includes('expired')) {
              setInvitationTokenError(t('authentication.invitationExpired'))
            } else if (err.status === 409 || err.message.toLowerCase().includes('already accepted')) {
              setInvitationTokenError(t('authentication.invitationAlreadyAccepted'))
            } else {
              setInvitationTokenError(err.message)
            }
          } else {
            setInvitationTokenError(t('authentication.invitationTokenInvalid'))
          }
        }
      } finally {
        if (isMounted) {
          setIsVerifyingToken(false)
        }
      }
    }

    void verify()

    return () => {
      isMounted = false
    }
  }, [activeToken, activeMode, t, invitationForm])

  const handleSelectMode = (mode: SignupMode) => {
    setActiveMode(mode)
    setServerError(null)
    setIsSuccess(false)

    // Update query params without full page reload
    const newParams = new URLSearchParams(searchParams)
    newParams.set('type', mode)
    if (mode !== 'invitation') {
      newParams.delete('token')
    }
    setSearchParams(newParams, { replace: true })
  }

  // Keyboard navigation for tablist
  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, mode: SignupMode) => {
    const modes: SignupMode[] = ['auditor', 'accounting', 'invitation']
    const currentIndex = modes.indexOf(mode)

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const nextIndex = (currentIndex + 1) % modes.length
      handleSelectMode(modes[nextIndex])
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const prevIndex = (currentIndex - 1 + modes.length) % modes.length
      handleSelectMode(modes[prevIndex])
    }
  }

  // Submit 1: Auditor
  const onAuditorSubmit = async (data: AuditorSignUpFormData) => {
    setIsSubmitting(true)
    setServerError(null)

    try {
      const response = await authService.signup({
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: 'AUDITOR',
        firmName: data.firmName.trim(),
        professionalBody: data.professionalBody,
        membershipNumber: data.membershipNumber.trim(),
        preferredLanguage: data.preferredLanguage,
        termsAccepted: data.termsAccepted,
      })

      if (response.success) {
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

  // Submit 2: Accounting Team Self-Registration
  const onAccountingSubmit = async (data: AccountingTeamSignUpFormData) => {
    setIsSubmitting(true)
    setServerError(null)

    try {
      const response = await authService.signup({
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: 'FINANCE_USER', // Technical backend identifier
        companyName: data.companyName.trim(),
        jobTitle: data.jobTitle.trim(),
        accountingYearEndDate: data.accountingYearEndDate,
        commencementDate: data.commencementDate ? data.commencementDate.trim() : undefined,
        preferredLanguage: data.preferredLanguage,
        termsAccepted: data.termsAccepted,
      })

      if (response.success) {
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

  // Submit 3: Invitation Token Lookup
  const handleVerifyTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanToken = tokenInputDraft.trim()
    if (!cleanToken) {
      setInvitationTokenError(t('authentication.invitationCodeLabel') + ' is required')
      return
    }
    setActiveToken(cleanToken)
    const newParams = new URLSearchParams(searchParams)
    newParams.set('type', 'invitation')
    newParams.set('token', cleanToken)
    setSearchParams(newParams, { replace: true })
  }

  // Submit 4: Accept Invitation Registration
  const onAcceptInvitationSubmit = async (data: AcceptInvitationFormData) => {
    if (!activeToken) {
      setServerError('Valid invitation token is required.')
      return
    }

    setIsSubmitting(true)
    setServerError(null)

    try {
      const response = await authService.acceptInvitation({
        invitationToken: activeToken,
        fullName: data.fullName.trim(),
        email: (data.email || invitationDetails?.invitedEmail || '').trim(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        preferredLanguage: data.preferredLanguage || 'en',
        termsAccepted: data.termsAccepted ?? true,
      })

      if (response.success) {
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

  return (
    <AuthLayout
      title={t('authentication.signUpUnifiedTitle', 'Create your FinAuditEase account')}
      subtitle={t('authentication.signUpUnifiedSubtitle', 'Choose how you want to use FinAuditEase.')}
      maxWidth="lg"
      footerLinks={
        <div>
          <span>{t('authentication.haveAccount')} </span>
          <Link to="/login">{t('authentication.signInLink')}</Link>
        </div>
      }
    >
      <div className="signup-unified-wrapper">
        {/* Top Segmented Selector / Tabs Control (Section 3 & 4) */}
        {!isSuccess && (
          <div
            className="signup-unified-selector"
            role="tablist"
            aria-label={t('authentication.signUpRoleSelectLabel', 'Choose Account Type')}
          >
            {/* Option 1: Auditor */}
            <button
              type="button"
              role="tab"
              id="tab-auditor"
              aria-selected={activeMode === 'auditor'}
              aria-controls="panel-auditor"
              tabIndex={activeMode === 'auditor' ? 0 : -1}
              className={`signup-tab-btn ${activeMode === 'auditor' ? 'active' : ''}`}
              onClick={() => handleSelectMode('auditor')}
              onKeyDown={(e) => handleTabKeyDown(e, 'auditor')}
            >
              <div className="signup-tab-header">
                <div className="signup-tab-header-left">
                  <div className="signup-tab-icon-wrap" aria-hidden="true">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="signup-tab-title-group">
                    <span className="signup-tab-title">{t('authentication.auditorCardTitle', 'Auditor')}</span>
                    <span className="signup-tab-badge">{t('authentication.auditorCardBadge', 'Audit Firm')}</span>
                  </div>
                </div>
                <div className="signup-tab-indicator" aria-hidden="true">
                  <Check size={12} strokeWidth={3} />
                </div>
              </div>
              <p className="signup-tab-desc">
                {t('authentication.auditorTabDesc', 'For auditors managing engagements and document requests.')}
              </p>
            </button>

            {/* Option 2: Accounting Team — Self Registration */}
            <button
              type="button"
              role="tab"
              id="tab-accounting"
              aria-selected={activeMode === 'accounting'}
              aria-controls="panel-accounting"
              tabIndex={activeMode === 'accounting' ? 0 : -1}
              className={`signup-tab-btn ${activeMode === 'accounting' ? 'active' : ''}`}
              onClick={() => handleSelectMode('accounting')}
              onKeyDown={(e) => handleTabKeyDown(e, 'accounting')}
            >
              <div className="signup-tab-header">
                <div className="signup-tab-header-left">
                  <div className="signup-tab-icon-wrap" aria-hidden="true">
                    <Building size={18} />
                  </div>
                  <div className="signup-tab-title-group">
                    <span className="signup-tab-title">{t('authentication.accountingTeam', 'Accounting Team')}</span>
                    <span className="signup-tab-badge">{t('authentication.selfRegistration', 'Self Registration')}</span>
                  </div>
                </div>
                <div className="signup-tab-indicator" aria-hidden="true">
                  <Check size={12} strokeWidth={3} />
                </div>
              </div>
              <p className="signup-tab-desc">
                {t('authentication.accountingTabDesc', 'Set up your accounting workspace and prepare year-round.')}
              </p>
            </button>

            {/* Option 3: Accounting Team — Auditor Invitation */}
            <button
              type="button"
              role="tab"
              id="tab-invitation"
              aria-selected={activeMode === 'invitation'}
              aria-controls="panel-invitation"
              tabIndex={activeMode === 'invitation' ? 0 : -1}
              className={`signup-tab-btn ${activeMode === 'invitation' ? 'active' : ''}`}
              onClick={() => handleSelectMode('invitation')}
              onKeyDown={(e) => handleTabKeyDown(e, 'invitation')}
            >
              <div className="signup-tab-header">
                <div className="signup-tab-header-left">
                  <div className="signup-tab-icon-wrap" aria-hidden="true">
                    <MailCheck size={18} />
                  </div>
                  <div className="signup-tab-title-group">
                    <span className="signup-tab-title">{t('authentication.accountingTeam', 'Accounting Team')}</span>
                    <span className="signup-tab-badge">{t('authentication.auditorInvitation', 'Auditor Invitation')}</span>
                  </div>
                </div>
                <div className="signup-tab-indicator" aria-hidden="true">
                  <Check size={12} strokeWidth={3} />
                </div>
              </div>
              <p className="signup-tab-desc">
                {t('authentication.invitationTabDesc', 'Join an accounting team through an auditor invitation.')}
              </p>
            </button>
          </div>
        )}

        {/* Divider Line (Section 2) */}
        {!isSuccess && <div className="signup-unified-divider" aria-hidden="true" />}

        {/* Server Error Alert */}
        {serverError && <AuthAlert variant="error" message={serverError} />}

        {/* ======================================================== */}
        {/* PANEL 1: AUDITOR SIGNUP FORM                             */}
        {/* ======================================================== */}
        {activeMode === 'auditor' && !isSuccess && (
          <div
            role="tabpanel"
            id="panel-auditor"
            aria-labelledby="tab-auditor"
            className="signup-tab-panel"
          >
            <div className="signup-panel-header">
              <h2 className="signup-panel-title">
                {t('authentication.auditorFormTitle', 'Auditor Profile & Firm Details')}
              </h2>
            </div>

            <form
              onSubmit={auditorForm.handleSubmit(onAuditorSubmit)}
              noValidate
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}
            >
              <div className="signup-form-grid">
                {/* Full Name */}
                <FormField
                  label={t('authentication.fullNameLabel')}
                  htmlFor="auditor-name"
                  required
                  error={auditorForm.formState.errors.fullName?.message}
                >
                  <input
                    id="auditor-name"
                    type="text"
                    autoComplete="name"
                    className={`input ${auditorForm.formState.errors.fullName ? 'input-error' : ''}`}
                    placeholder={t('authentication.fullNamePlaceholderAuditor', 'e.g. Olawale Adeleke')}
                    disabled={isSubmitting}
                    {...auditorForm.register('fullName')}
                  />
                </FormField>

                {/* Corporate Email */}
                <FormField
                  label={t('authentication.emailLabel')}
                  htmlFor="auditor-email"
                  required
                  error={auditorForm.formState.errors.email?.message}
                >
                  <input
                    id="auditor-email"
                    type="email"
                    autoComplete="email"
                    className={`input ${auditorForm.formState.errors.email ? 'input-error' : ''}`}
                    placeholder={t('authentication.emailPlaceholderAuditor', 'lead.auditor@firm.com')}
                    disabled={isSubmitting}
                    {...auditorForm.register('email')}
                  />
                </FormField>
              </div>

              <div className="signup-form-grid">
                {/* Firm Name */}
                <FormField
                  label={t('authentication.firmNameLabel', 'Audit Firm Name')}
                  htmlFor="auditor-firm"
                  required
                  error={auditorForm.formState.errors.firmName?.message}
                >
                  <input
                    id="auditor-firm"
                    type="text"
                    className={`input ${auditorForm.formState.errors.firmName ? 'input-error' : ''}`}
                    placeholder={t('authentication.firmNamePlaceholder', 'e.g. Apex Assurance Partners')}
                    disabled={isSubmitting}
                    {...auditorForm.register('firmName')}
                  />
                </FormField>

                {/* Professional Accounting Body */}
                <FormField
                  label={t('authentication.professionalBodyLabel', 'Professional Accounting Body')}
                  htmlFor="auditor-body"
                  required
                  error={auditorForm.formState.errors.professionalBody?.message}
                >
                  <select
                    id="auditor-body"
                    className={`input ${auditorForm.formState.errors.professionalBody ? 'input-error' : ''}`}
                    disabled={isSubmitting}
                    {...auditorForm.register('professionalBody')}
                  >
                    <option value="ICAN">ICAN (Institute of Chartered Accountants of Nigeria)</option>
                    <option value="ACCA">ACCA (Association of Chartered Certified Accountants)</option>
                    <option value="ICAEW">ICAEW (Institute of Chartered Accountants in England and Wales)</option>
                  </select>
                </FormField>
              </div>

              <div className="signup-form-grid">
                {/* Audit Firm Approved Registration Number */}
                <FormField
                  label={t('authentication.membershipNumberLabel', 'Audit Firm Approved Registration Number')}
                  htmlFor="auditor-membership"
                  required
                  error={auditorForm.formState.errors.membershipNumber?.message}
                >
                  <input
                    id="auditor-membership"
                    type="text"
                    className={`input ${auditorForm.formState.errors.membershipNumber ? 'input-error' : ''}`}
                    placeholder={t('authentication.membershipNumberPlaceholder', 'e.g. FRC/2026/00000000000 or ICAN/PAF/04918')}
                    disabled={isSubmitting}
                    {...auditorForm.register('membershipNumber')}
                  />
                </FormField>

                {/* Preferred Language */}
                <FormField
                  label={t('authentication.preferredLanguageLabel')}
                  htmlFor="auditor-language"
                  required
                  error={auditorForm.formState.errors.preferredLanguage?.message}
                >
                  <select
                    id="auditor-language"
                    className={`input ${auditorForm.formState.errors.preferredLanguage ? 'input-error' : ''}`}
                    disabled={isSubmitting}
                    {...auditorForm.register('preferredLanguage')}
                  >
                    <option value="en">English</option>
                    <option value="yo">Èdè Yorùbá</option>
                    <option value="ig">Asụsụ Igbo</option>
                    <option value="ha">Harshen Hausa</option>
                    <option value="pcm">Nigerian Pidgin</option>
                  </select>
                </FormField>
              </div>

              <div className="signup-form-grid">
                {/* Password */}
                <FormField
                  label={t('authentication.passwordLabel')}
                  htmlFor="auditor-password"
                  required
                  error={auditorForm.formState.errors.password?.message}
                >
                  <PasswordInput
                    id="auditor-password"
                    autoComplete="new-password"
                    hasError={Boolean(auditorForm.formState.errors.password)}
                    disabled={isSubmitting}
                    {...auditorForm.register('password')}
                  />
                </FormField>

                {/* Confirm Password */}
                <FormField
                  label={t('authentication.confirmPasswordLabel')}
                  htmlFor="auditor-confirm-password"
                  required
                  error={auditorForm.formState.errors.confirmPassword?.message}
                >
                  <PasswordInput
                    id="auditor-confirm-password"
                    autoComplete="new-password"
                    hasError={Boolean(auditorForm.formState.errors.confirmPassword)}
                    disabled={isSubmitting}
                    {...auditorForm.register('confirmPassword')}
                  />
                </FormField>
              </div>

              {/* Password Requirements Indicator */}
              <PasswordRequirements password={auditorPassword || ''} />

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
                    {...auditorForm.register('termsAccepted')}
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
                {auditorForm.formState.errors.termsAccepted && (
                  <span
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-danger-600)',
                      display: 'block',
                      marginTop: 'var(--spacing-1)',
                    }}
                  >
                    {auditorForm.formState.errors.termsAccepted.message}
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
                    <span>{t('authentication.createAuditorAccountButton', 'Create Auditor Account')}</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* PANEL 2: ACCOUNTING TEAM SELF-REGISTRATION FORM          */}
        {/* ======================================================== */}
        {activeMode === 'accounting' && !isSuccess && (
          <div
            role="tabpanel"
            id="panel-accounting"
            aria-labelledby="tab-accounting"
            className="signup-tab-panel"
          >
            <div className="signup-panel-header">
              <h2 className="signup-panel-title">
                {t('authentication.accountingFormTitle', 'Company & Accountant Profile Details')}
              </h2>
            </div>

            <form
              onSubmit={accountingForm.handleSubmit(onAccountingSubmit)}
              noValidate
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}
            >
              <div className="signup-form-grid">
                {/* Full Name */}
                <FormField
                  label={t('authentication.fullNameLabel')}
                  htmlFor="accounting-name"
                  required
                  error={accountingForm.formState.errors.fullName?.message}
                >
                  <input
                    id="accounting-name"
                    type="text"
                    autoComplete="name"
                    className={`input ${accountingForm.formState.errors.fullName ? 'input-error' : ''}`}
                    placeholder={t('authentication.fullNamePlaceholderAccounting', 'e.g. Ngozi Chidiebere')}
                    disabled={isSubmitting}
                    {...accountingForm.register('fullName')}
                  />
                </FormField>

                {/* Corporate Email */}
                <FormField
                  label={t('authentication.emailLabel')}
                  htmlFor="accounting-email"
                  required
                  error={accountingForm.formState.errors.email?.message}
                >
                  <input
                    id="accounting-email"
                    type="email"
                    autoComplete="email"
                    className={`input ${accountingForm.formState.errors.email ? 'input-error' : ''}`}
                    placeholder={t('authentication.emailPlaceholderAccounting', 'accountant@company.com')}
                    disabled={isSubmitting}
                    {...accountingForm.register('email')}
                  />
                </FormField>
              </div>

              <div className="signup-form-grid">
                {/* Company Name */}
                <FormField
                  label={t('authentication.companyNameLabel', 'Company Name')}
                  htmlFor="accounting-company"
                  required
                  error={accountingForm.formState.errors.companyName?.message}
                >
                  <input
                    id="accounting-company"
                    type="text"
                    className={`input ${accountingForm.formState.errors.companyName ? 'input-error' : ''}`}
                    placeholder={t('authentication.companyNamePlaceholder', 'e.g. Savannah Logistics Ltd')}
                    disabled={isSubmitting}
                    {...accountingForm.register('companyName')}
                  />
                </FormField>

                {/* Job Title */}
                <FormField
                  label={t('authentication.jobTitleLabel')}
                  htmlFor="accounting-job-title"
                  required
                  error={accountingForm.formState.errors.jobTitle?.message}
                >
                  <input
                    id="accounting-job-title"
                    type="text"
                    className={`input ${accountingForm.formState.errors.jobTitle ? 'input-error' : ''}`}
                    placeholder={t('authentication.jobTitlePlaceholder')}
                    disabled={isSubmitting}
                    {...accountingForm.register('jobTitle')}
                  />
                </FormField>
              </div>

              <div className="signup-form-grid">
                {/* Accounting Year-End Date */}
                <FormField
                  label={t('authentication.accountingYearEndDateLabel')}
                  htmlFor="accounting-year-end"
                  required
                  helperText={t('authentication.accountingYearEndDateHelper')}
                  error={accountingForm.formState.errors.accountingYearEndDate?.message}
                >
                  <input
                    id="accounting-year-end"
                    type="text"
                    className={`input ${accountingForm.formState.errors.accountingYearEndDate ? 'input-error' : ''}`}
                    placeholder={t('authentication.accountingYearEndDatePlaceholder')}
                    disabled={isSubmitting}
                    {...accountingForm.register('accountingYearEndDate')}
                  />
                </FormField>

                {/* Commencement Date */}
                <FormField
                  label={t('authentication.commencementDateLabel', 'Commencement Date')}
                  htmlFor="accounting-commencement-date"
                  helperText={t('authentication.commencementDateHelper', 'Date operations or financial period commenced')}
                  error={accountingForm.formState.errors.commencementDate?.message}
                >
                  <input
                    id="accounting-commencement-date"
                    type="date"
                    className={`input ${accountingForm.formState.errors.commencementDate ? 'input-error' : ''}`}
                    disabled={isSubmitting}
                    {...accountingForm.register('commencementDate')}
                  />
                </FormField>
              </div>

              <div className="signup-form-grid">
                {/* Preferred Language */}
                <FormField
                  label={t('authentication.preferredLanguageLabel')}
                  htmlFor="accounting-language"
                  required
                  error={accountingForm.formState.errors.preferredLanguage?.message}
                >
                  <select
                    id="accounting-language"
                    className={`input ${accountingForm.formState.errors.preferredLanguage ? 'input-error' : ''}`}
                    disabled={isSubmitting}
                    {...accountingForm.register('preferredLanguage')}
                  >
                    <option value="en">English</option>
                    <option value="yo">Èdè Yorùbá</option>
                    <option value="ig">Asụsụ Igbo</option>
                    <option value="ha">Harshen Hausa</option>
                    <option value="pcm">Nigerian Pidgin</option>
                  </select>
                </FormField>
              </div>

              <div className="signup-form-grid">
                {/* Password */}
                <FormField
                  label={t('authentication.passwordLabel')}
                  htmlFor="accounting-password"
                  required
                  error={accountingForm.formState.errors.password?.message}
                >
                  <PasswordInput
                    id="accounting-password"
                    autoComplete="new-password"
                    hasError={Boolean(accountingForm.formState.errors.password)}
                    disabled={isSubmitting}
                    {...accountingForm.register('password')}
                  />
                </FormField>

                {/* Confirm Password */}
                <FormField
                  label={t('authentication.confirmPasswordLabel')}
                  htmlFor="accounting-confirm-password"
                  required
                  error={accountingForm.formState.errors.confirmPassword?.message}
                >
                  <PasswordInput
                    id="accounting-confirm-password"
                    autoComplete="new-password"
                    hasError={Boolean(accountingForm.formState.errors.confirmPassword)}
                    disabled={isSubmitting}
                    {...accountingForm.register('confirmPassword')}
                  />
                </FormField>
              </div>

              {/* Password Requirements Indicator */}
              <PasswordRequirements password={accountingPassword || ''} />

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
                    {...accountingForm.register('termsAccepted')}
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
                {accountingForm.formState.errors.termsAccepted && (
                  <span
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-danger-600)',
                      display: 'block',
                      marginTop: 'var(--spacing-1)',
                    }}
                  >
                    {accountingForm.formState.errors.termsAccepted.message}
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
                    <span>{t('authentication.registerAccountingAccount')}</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* PANEL 3: ACCOUNTING TEAM AUDITOR INVITATION ACCESS       */}
        {/* ======================================================== */}
        {activeMode === 'invitation' && !isSuccess && (
          <div
            role="tabpanel"
            id="panel-invitation"
            aria-labelledby="tab-invitation"
            className="signup-tab-panel"
          >
            <div className="signup-panel-header">
              <h2 className="signup-panel-title">
                {t('authentication.invitationFormTitle', 'Authorized Auditor Invitation')}
              </h2>
            </div>

            {/* If verifying token from query param */}
            {isVerifyingToken && (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-8) 0' }}>
                <Loader2 size={32} className="spinner" style={{ color: 'var(--brand-green-700)', margin: '0 auto var(--spacing-3) auto' }} />
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-slate-600)' }}>
                  {t('authentication.verifyingInvitationDetails', 'Verifying invitation details with server...')}
                </p>
              </div>
            )}

            {/* Error verifying invitation token */}
            {!isVerifyingToken && invitationTokenError && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                <AuthAlert variant="error" message={invitationTokenError} />
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setActiveToken(null)
                    setInvitationTokenError(null)
                    setTokenInputDraft('')
                  }}
                  style={{ alignSelf: 'flex-start' }}
                >
                  <span>{t('authentication.enterDifferentToken', 'Enter a different invitation token')}</span>
                </button>
              </div>
            )}

            {/* Step A: No active token yet - prompt for code */}
            {!isVerifyingToken && !invitationDetails && !invitationTokenError && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-slate-600)', lineHeight: 'var(--line-height-relaxed)', margin: 0 }}>
                  {t('authentication.invitationHelpText')}
                </p>

                <form onSubmit={handleVerifyTokenSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                  <FormField
                    label={t('authentication.invitationCodeLabel')}
                    htmlFor="invitation-token-input"
                    required
                    helperText={t('authentication.invitationTokenHelper')}
                  >
                    <input
                      id="invitation-token-input"
                      type="text"
                      className="input"
                      placeholder={t('authentication.invitationCodePlaceholder')}
                      value={tokenInputDraft}
                      onChange={(e) => setTokenInputDraft(e.target.value)}
                    />
                  </FormField>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', marginTop: 'var(--spacing-2)' }}
                  >
                    <span>{t('authentication.invitationCodeSubmit')}</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </form>

                <div
                  style={{
                    padding: 'var(--spacing-3) var(--spacing-4)',
                    backgroundColor: 'var(--color-slate-50)',
                    border: '1px solid var(--color-slate-200)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <strong>{t('authentication.invitationNoTokenPrompt')}</strong>{' '}
                  <button
                    type="button"
                    onClick={() => handleSelectMode('accounting')}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: 'var(--brand-green-700)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    {t('authentication.accountingCardTitle', 'Accounting Team — Self Registration')}
                  </button>
                  .
                </div>
              </div>
            )}

            {/* Step B: Invitation Verified - render verified invitation scope & acceptance form */}
            {!isVerifyingToken && invitationDetails && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                {/* Verified Invitation Scope Box */}
                <div className="signup-invitation-scope-card">
                  <div className="signup-invitation-scope-header">
                    <span className="signup-invitation-scope-title">
                      {t('authentication.invitationScope', 'Invitation Scope')}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: 'var(--brand-green-100)',
                        color: 'var(--brand-green-800)',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCircle2 size={12} />
                      <span>{t('authentication.verifiedBadge', 'Verified')}</span>
                    </span>
                  </div>

                  <div className="signup-invitation-scope-grid">
                    <div className="signup-invitation-scope-item">
                      <Building size={14} style={{ color: 'var(--color-slate-400)' }} />
                      <span><strong>{t('authentication.scopeCompany', 'Company')}:</strong> {invitationDetails.organizationName}</span>
                    </div>
                    {invitationDetails.inviterName && (
                      <div className="signup-invitation-scope-item">
                        <ShieldCheck size={14} style={{ color: 'var(--color-slate-400)' }} />
                        <span><strong>{t('authentication.scopeAuditor', 'Auditor')}:</strong> {invitationDetails.inviterName}</span>
                      </div>
                    )}
                    {invitationDetails.engagementTitle && (
                      <div className="signup-invitation-scope-item">
                        <FileText size={14} style={{ color: 'var(--color-slate-400)' }} />
                        <span><strong>{t('authentication.scopeEngagement', 'Engagement')}:</strong> {invitationDetails.engagementTitle}</span>
                      </div>
                    )}
                    {invitationDetails.expiresAt && (
                      <div className="signup-invitation-scope-item">
                        <Clock size={14} style={{ color: 'var(--color-slate-400)' }} />
                        <span><strong>{t('authentication.scopeExpires', 'Expires')}:</strong> {invitationDetails.expiresAt}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form to complete profile & accept */}
                <form
                  onSubmit={invitationForm.handleSubmit(onAcceptInvitationSubmit)}
                  noValidate
                  style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}
                >
                  <div className="signup-form-grid">
                    {/* Full Name */}
                    <FormField
                      label={t('authentication.fullNameLabel')}
                      htmlFor="invitation-fullname"
                      required
                      error={invitationForm.formState.errors.fullName?.message}
                    >
                      <input
                        id="invitation-fullname"
                        type="text"
                        autoComplete="name"
                        className={`input ${invitationForm.formState.errors.fullName ? 'input-error' : ''}`}
                        placeholder={t('authentication.fullNamePlaceholderInvitation', 'e.g. Adebayo Ogunlesi')}
                        disabled={isSubmitting}
                        {...invitationForm.register('fullName')}
                      />
                    </FormField>

                    {/* Email */}
                    <FormField
                      label={t('authentication.emailLabel')}
                      htmlFor="invitation-email"
                      required
                      helperText={t('authentication.invitationEmailHelper', 'Authorized email address')}
                      error={invitationForm.formState.errors.email?.message}
                    >
                      <input
                        id="invitation-email"
                        type="email"
                        autoComplete="email"
                        className="input"
                        disabled
                        value={invitationDetails.invitedEmail || ''}
                      />
                    </FormField>
                  </div>

                  <div className="signup-form-grid">
                    {/* Password */}
                    <FormField
                      label={t('authentication.passwordLabel')}
                      htmlFor="invitation-password"
                      required
                      error={invitationForm.formState.errors.password?.message}
                    >
                      <PasswordInput
                        id="invitation-password"
                        autoComplete="new-password"
                        hasError={Boolean(invitationForm.formState.errors.password)}
                        disabled={isSubmitting}
                        {...invitationForm.register('password')}
                      />
                    </FormField>

                    {/* Confirm Password */}
                    <FormField
                      label={t('authentication.confirmPasswordLabel')}
                      htmlFor="invitation-confirm-password"
                      required
                      error={invitationForm.formState.errors.confirmPassword?.message}
                    >
                      <PasswordInput
                        id="invitation-confirm-password"
                        autoComplete="new-password"
                        hasError={Boolean(invitationForm.formState.errors.confirmPassword)}
                        disabled={isSubmitting}
                        {...invitationForm.register('confirmPassword')}
                      />
                    </FormField>
                  </div>

                  {/* Password Requirements */}
                  <PasswordRequirements password={invitationPassword || ''} />

                  {/* Preferred Language */}
                  <FormField
                    label={t('authentication.preferredLanguageLabel')}
                    htmlFor="invitation-language"
                  >
                    <select
                      id="invitation-language"
                      className="input"
                      disabled={isSubmitting}
                      {...invitationForm.register('preferredLanguage')}
                    >
                      <option value="en">English</option>
                      <option value="yo">Èdè Yorùbá</option>
                      <option value="ig">Asụsụ Igbo</option>
                      <option value="ha">Harshen Hausa</option>
                      <option value="pcm">Nigerian Pidgin</option>
                    </select>
                  </FormField>

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
                        {...invitationForm.register('termsAccepted')}
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
                    {invitationForm.formState.errors.termsAccepted && (
                      <span
                        style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-danger-600)',
                          display: 'block',
                          marginTop: 'var(--spacing-1)',
                        }}
                      >
                        {invitationForm.formState.errors.termsAccepted.message}
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
                        <span>{t('authentication.acceptInvitationButton')}</span>
                        <ArrowRight size={18} aria-hidden="true" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* SUCCESS CONFIRMATION FOR AUDITOR                         */}
        {/* ======================================================== */}
        {isSuccess && activeMode === 'auditor' && (
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
              {t('authentication.signUpAuditorSuccessTitle')}
            </h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-slate-600)', marginBottom: 'var(--spacing-6)' }}>
              {t('authentication.signUpAuditorSuccessDesc')}
            </p>
            <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              <span>{t('authentication.signInButton')}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        )}

        {/* ======================================================== */}
        {/* SUCCESS CONFIRMATION FOR ACCOUNTING TEAM SELF-REG        */}
        {/* ======================================================== */}
        {isSuccess && activeMode === 'accounting' && (
          <div className="signup-prep-success-box">
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2)' }}>
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
                  margin: '0 auto var(--spacing-3) auto',
                }}
              >
                <CheckCircle2 size={32} aria-hidden="true" />
              </div>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-slate-900)', margin: '0 0 var(--spacing-1) 0' }}>
                {t('authentication.signUpAccountingSuccessTitle')}
              </h2>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-slate-600)', margin: 0 }}>
                {t('authentication.signUpAccountingSuccessDesc')}
              </p>
            </div>

            <div className="signup-prep-steps">
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-slate-800)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('authentication.readinessWorkflowHeading')}
              </span>

              <div className="signup-prep-step">
                <div className="prep-step-icon-wrap" aria-hidden="true">
                  <Layers size={14} />
                </div>
                <div className="prep-step-content">
                  <h4>{t('authentication.readinessStep1Title')}</h4>
                  <p>{t('authentication.readinessStep1Desc')}</p>
                </div>
              </div>

              <div className="signup-prep-step">
                <div className="prep-step-icon-wrap" aria-hidden="true">
                  <Clock size={14} />
                </div>
                <div className="prep-step-content">
                  <h4>{t('authentication.readinessStep2Title')}</h4>
                  <p>{t('authentication.readinessStep2Desc')}</p>
                </div>
              </div>

              <div className="signup-prep-step">
                <div className="prep-step-icon-wrap" aria-hidden="true">
                  <CalendarCheck size={14} />
                </div>
                <div className="prep-step-content">
                  <h4>{t('authentication.readinessStep3Title')}</h4>
                  <p>{t('authentication.readinessStep3Desc')}</p>
                </div>
              </div>
            </div>

            <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 'var(--spacing-2)' }}>
              <span>{t('authentication.signInToWorkspace')}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        )}

        {/* ======================================================== */}
        {/* SUCCESS CONFIRMATION FOR INVITATION ACCEPTANCE           */}
        {/* ======================================================== */}
        {isSuccess && activeMode === 'invitation' && (
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
              {t('authentication.invitationAcceptedSuccess', 'Invitation Accepted Successfully')}
            </h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-slate-600)', marginBottom: 'var(--spacing-6)' }}>
              {t('authentication.invitationAcceptedDesc', 'You are now connected to the audit engagement. Sign in to access your request dashboard and submit evidentiary schedules.')}
            </p>
            <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              <span>{t('authentication.signInButton')}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}
