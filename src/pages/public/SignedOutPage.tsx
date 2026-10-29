import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, ShieldCheck, ArrowRight, Home, Pause, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AuthLayout } from '@/features/auth/components/AuthLayout/AuthLayout'
import './SignedOutPage.css'

export const SignedOutPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [secondsRemaining, setSecondsRemaining] = useState(30)
  const [isPaused, setIsPaused] = useState(false)

  // Countdown timer redirecting to /login
  useEffect(() => {
    if (isPaused) return

    if (secondsRemaining <= 0) {
      navigate('/login?reason=signed_out', { replace: true })
      return
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [secondsRemaining, isPaused, navigate])

  return (
    <AuthLayout
      title={t('signOut.signedOutTitle')}
      subtitle={t('signOut.signedOutSubtitle')}
      maxWidth="sm"
      footerLinks={
        <div className="signed-out-footer-links">
          <span>FinAuditEase Enterprise Security &middot; IFRS &amp; ISA Aligned &middot; NDPA Architecture</span>
        </div>
      }
    >
      <div className="signed-out-container">
        {/* Visual Assurance Badge */}
        <div className="signed-out-icon-wrapper" aria-hidden="true">
          <div className="signed-out-icon-inner">
            <ShieldCheck size={36} className="signed-out-icon-shield" />
          </div>
        </div>

        {/* Security Checklist Card */}
        <div className="signed-out-checklist-card" role="region" aria-label="Session Security Status">
          <div className="signed-out-checklist-item">
            <CheckCircle2 size={18} className="signed-out-check-icon" aria-hidden="true" />
            <div>
              <div className="signed-out-check-title">{t('signOut.tokenRevoked')}</div>
              <div className="signed-out-check-desc">{t('signOut.bulletSessionInvalidated', 'Server-side HTTP session invalidated')}</div>
            </div>
          </div>

          <div className="signed-out-checklist-item">
            <CheckCircle2 size={18} className="signed-out-check-icon" aria-hidden="true" />
            <div>
              <div className="signed-out-check-title">{t('signOut.cachePurged')}</div>
              <div className="signed-out-check-desc">{t('signOut.bulletCacheWiped', 'React Query and workpaper state wiped')}</div>
            </div>
          </div>

          <div className="signed-out-checklist-item">
            <CheckCircle2 size={18} className="signed-out-check-icon" aria-hidden="true" />
            <div>
              <div className="signed-out-check-title">{t('signOut.workstationSafe')}</div>
              <div className="signed-out-check-desc">{t('signOut.bulletZeroCached', 'Zero sensitive evidentiary files remain cached')}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="signed-out-actions">
          <Link
            to="/login?reason=signed_out"
            className="btn btn-primary btn-lg signed-out-btn-primary"
          >
            <span>{t('signOut.signInAgain')}</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>

          <Link
            to="/"
            className="btn btn-outline signed-out-btn-home"
          >
            <Home size={16} aria-hidden="true" />
            <span>{t('signOut.backToHome')}</span>
          </Link>
        </div>

        {/* Safe Countdown Bar */}
        <div className="signed-out-countdown-bar" role="status" aria-live="polite">
          <span className="signed-out-countdown-text">
            {t('signOut.countdownPrefix', { seconds: secondsRemaining })}
          </span>
          <button
            type="button"
            className="signed-out-countdown-toggle"
            onClick={() => setIsPaused((prev) => !prev)}
            aria-label={isPaused ? t('signOut.resumeCountdown') : t('signOut.pauseCountdown')}
          >
            {isPaused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
            <span>{isPaused ? t('signOut.resumeCountdown') : t('signOut.pauseCountdown')}</span>
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}
