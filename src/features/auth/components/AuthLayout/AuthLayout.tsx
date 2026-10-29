import React, { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/components/navigation/LanguageSwitcher/LanguageSwitcher'
import './AuthLayout.css'

export interface AuthLayoutProps {
  readonly title: string
  readonly subtitle?: string
  readonly children: ReactNode
  readonly footerLinks?: ReactNode
  readonly maxWidth?: 'sm' | 'md' | 'lg'
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  footerLinks,
  maxWidth = 'sm',
}) => {
  const { t } = useTranslation()

  useEffect(() => {
    if (title) {
      document.title = `${title} — FinAuditEase`
    }
  }, [title])

  return (
    <div className="auth-page-wrapper">
      {/* Top Navigation Bar: Official Brand Lockup & Clean Language Switcher */}
      <header className="auth-page-header" role="banner">
        <div className="auth-header-container">
          {/* Left Brand Lockup */}
          <Link
            to="/"
            className="auth-header-brand"
            aria-label="FinAuditEase — Powered by Sabi Africa Innovations Limited"
          >
            <img
              src="/images/sabi-africa-logo.jpg"
              alt="Sabi Africa Innovations Limited Logo"
              className="auth-header-sabi-logo"
              width="38"
              height="38"
            />
            <div className="auth-header-brand-text">
              <span className="auth-header-title">FinAuditEase</span>
              <span className="auth-header-subtitle">Powered by Sabi Africa Innovations Limited</span>
            </div>
          </Link>

          {/* Right: Language Selector */}
          <div className="auth-header-nav-actions">
            <div className="auth-header-lang-wrapper">
              <LanguageSwitcher variant="header" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Authentication Surface */}
      <main className="auth-main-content">
        {/* Prominent Sabi Africa Innovations Limited Official Brand Element */}
        <div className="auth-brand-prominent">
          <Link
            to="/"
            className="auth-brand-prominent-link"
            aria-label="FinAuditEase, powered by Sabi Africa Innovations Limited"
          >
            <div className="auth-brand-prominent-logo-wrap">
              <img
                src="/images/sabi-africa-logo.jpg"
                alt="Sabi Africa Innovations Limited Logo"
                className="auth-brand-prominent-logo"
                width="64"
                height="64"
              />
            </div>
            <div className="auth-brand-prominent-meta">
              <span className="auth-brand-prominent-company">Sabi Africa Innovations Limited</span>
              <span className="auth-brand-prominent-product">
                FinAuditEase, powered by Sabi Africa Innovations Limited
              </span>
            </div>
          </Link>
        </div>

        <div className={`auth-card-container auth-card-${maxWidth}`}>
          {/* Eyebrow Pill */}
          <div className="auth-card-eyebrow-wrapper">
            <span className="auth-card-eyebrow">
              <span className="auth-card-pill-dot" aria-hidden="true" />
              <span>{t('landing.hero.pill', 'SECURE AUDIT WORKSPACE')}</span>
            </span>
          </div>

          <div className="auth-card-header">
            <h1 className="auth-card-title">{title}</h1>
            {subtitle && <p className="auth-card-subtitle">{subtitle}</p>}
          </div>

          <div className="auth-card-body">{children}</div>

          {footerLinks && <div className="auth-card-footer">{footerLinks}</div>}
        </div>
      </main>
    </div>
  )
}
