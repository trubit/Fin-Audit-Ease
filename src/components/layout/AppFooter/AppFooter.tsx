import React, { useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { LanguageSwitcher } from '@/components/navigation/LanguageSwitcher/LanguageSwitcher'
import { useLanguage } from '@/hooks/useLanguage'
import './AppFooter.css'

const CURRENT_YEAR = new Date().getFullYear()

export const AppFooter: React.FC = () => {
  const { t } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()

  const handleScrollToSection = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
      e.preventDefault()
      if (location.pathname === '/') {
        const element = document.getElementById(sectionId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      } else {
        navigate(`/#${sectionId}`)
      }
    },
    [location.pathname, navigate]
  )

  return (
    <footer className="app-footer" role="contentinfo">
      <div className="app-footer-container">
        <div className="app-footer-grid">
          {/* Brand & Company Relationship Column */}
          <div className="app-footer-brand-col">
            <Link to="/" className="app-footer-brand" aria-label="FinAuditEase — Powered by Sabi Africa Innovations Limited">
              <img
                src="/images/sabi-africa-logo.jpg"
                alt="Sabi Africa Innovations Limited Logo"
                className="app-footer-sabi-logo"
                width="140"
                height="44"
              />
              <div className="app-footer-brand-text">
                <span className="app-footer-brand-title">FinAuditEase</span>
                <span className="app-footer-brand-powered">Powered by Sabi Africa Innovations Limited</span>
              </div>
            </Link>
            <p className="app-footer-desc">
              {t('landing.footer.description')}
            </p>
          </div>

          {/* Navigation Column */}
          <div className="app-footer-col">
            <h4 className="app-footer-col-title">{t('landing.footer.navigationHeading')}</h4>
            <ul className="app-footer-links">
              <li>
                <a
                  href="#how-it-works"
                  className="app-footer-link"
                  onClick={(e) => handleScrollToSection(e, 'how-it-works')}
                >
                  {t('navigation.howItWorks')}
                </a>
              </li>
              <li>
                <a
                  href="#capabilities"
                  className="app-footer-link"
                  onClick={(e) => handleScrollToSection(e, 'capabilities')}
                >
                  {t('navigation.features')}
                </a>
              </li>
              <li>
                <a
                  href="#roles"
                  className="app-footer-link"
                  onClick={(e) => handleScrollToSection(e, 'roles')}
                >
                  {t('navigation.roles')}
                </a>
              </li>
              <li>
                <a
                  href="#security"
                  className="app-footer-link"
                  onClick={(e) => handleScrollToSection(e, 'security')}
                >
                  {t('navigation.security')}
                </a>
              </li>
              <li>
                <a
                  href="#languages"
                  className="app-footer-link"
                  onClick={(e) => handleScrollToSection(e, 'languages')}
                >
                  {t('navigation.languages')}
                </a>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="app-footer-link">
                  {t('legal.termsAndConditions', 'Terms and Conditions')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Access Column */}
          <div className="app-footer-col">
            <h4 className="app-footer-col-title">{t('landing.footer.authHeading')}</h4>
            <ul className="app-footer-links">
              <li>
                <Link to="/login" className="app-footer-link">
                  {t('navigation.login')}
                </Link>
              </li>
              <li>
                <Link to="/signup" className="app-footer-link">
                  {t('navigation.signup')}
                </Link>
              </li>
              <li>
                <Link to="/forgot-password" className="app-footer-link">
                  {t('authentication.forgotPasswordTitle')}
                </Link>
              </li>
              <li>
                <Link to="/accept-invitation" className="app-footer-link">
                  {t('authentication.acceptInvitationTitle')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Language Column */}
          <div className="app-footer-col">
            <h4 className="app-footer-col-title">{t('landing.footer.securityHeading')}</h4>
            <div className="app-footer-security-note">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-1)', color: 'var(--color-primary-300)' }}>
                <Lock size={14} aria-hidden="true" />
                <span style={{ fontWeight: 600 }}>Privacy by Design</span>
              </div>
              <p style={{ margin: 0 }}>
                Zero unencrypted credential storage in browser local storage. Inactivity protection active.
              </p>
            </div>
            <div style={{ marginTop: 'var(--spacing-3)' }}>
              <LanguageSwitcher variant="footer" />
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="app-footer-bottom">
          <p className="app-footer-copyright">
            © {CURRENT_YEAR} Sabi Africa Innovations Limited. FinAuditEase — Powered by Sabi Africa Innovations Limited. {t('landing.footer.rights')}
          </p>
          <div className="app-footer-legal-links" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <Link to="/terms-and-conditions" className="app-footer-link" style={{ fontSize: 'var(--font-size-xs)' }}>
              {t('legal.termsAndConditions', 'Website Terms and Conditions')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
