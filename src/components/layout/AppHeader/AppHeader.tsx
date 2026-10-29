import React, { useState, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, ArrowRight, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { LanguageSwitcher } from '@/components/navigation/LanguageSwitcher/LanguageSwitcher'
import { useUIStore } from '@/store/uiStore'
import { useLanguage } from '@/hooks/useLanguage'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { formatUserRole } from '@/features/auth/utils/roleUtils'
import { NotificationBell } from '@/features/notifications/components/NotificationBell/NotificationBell'
import { SignOutConfirmModal } from '@/components/feedback/SignOutConfirmModal/SignOutConfirmModal'
import './AppHeader.css'

export interface AppHeaderProps {
  readonly isAppView?: boolean
}

export const AppHeader: React.FC<AppHeaderProps> = ({ isAppView = false }) => {
  const { t } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const { mobileNavOpen, toggleMobileNav, sidebarOpen, toggleSidebar } = useUIStore()
  const { logout, user, isAuthenticated } = useAuth()

  // Local state for public landing mobile menu
  const [publicMenuOpen, setPublicMenuOpen] = useState(false)
  const [showSignOutModal, setShowSignOutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout('/signed-out')
    } finally {
      setIsLoggingOut(false)
      setShowSignOutModal(false)
    }
  }

  // Close public mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && publicMenuOpen) {
        setPublicMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [publicMenuOpen])

  // Prevent background scroll when public mobile menu is open
  useEffect(() => {
    if (publicMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [publicMenuOpen])

  const [activeSection, setActiveSection] = useState<string>('')

  // Observe active section on landing page for navigation highlight
  useEffect(() => {
    if (isAppView || location.pathname !== '/') return

    const sectionIds = ['how-it-works', 'capabilities', 'roles', 'security', 'languages']
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-72px 0px -40% 0px',
        threshold: 0.15,
      }
    )

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [isAppView, location.pathname])

  // Scroll to section smoothly or navigate to homepage with hash
  const handleScrollToSection = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
      e.preventDefault()
      setPublicMenuOpen(false)

      if (location.pathname === '/') {
        const element = document.getElementById(sectionId)
        if (element) {
          const headerHeight = 72
          const elementPosition = element.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.pageYOffset - headerHeight

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          })
          window.history.pushState(null, '', `#${sectionId}`)
          setActiveSection(sectionId)
        }
      } else {
        navigate(`/#${sectionId}`)
      }
    },
    [location.pathname, navigate]
  )

  const userInitials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U'

  return (
    <header className="app-header" role="banner">
      <a href="#main-content" className="app-header-skip-link">
        {t('common.skipToContent')}
      </a>
      <div className="app-header-container">
        {/* Left Side: Brand and Navigation Controls */}
        <div className="app-header-left">
          {isAppView && (
            <>
              {/* Mobile Sidebar Hamburger Toggle */}
              <button
                type="button"
                className="app-header-menu-btn"
                onClick={toggleMobileNav}
                aria-expanded={mobileNavOpen}
                aria-label={mobileNavOpen ? t('navigation.closeMenu') : t('navigation.menu')}
              >
                {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {/* Desktop Sidebar Rail Toggle */}
              <button
                type="button"
                className="app-header-desktop-toggle-btn"
                onClick={toggleSidebar}
                title={sidebarOpen ? t('navigation.collapseSidebar') : t('navigation.expandSidebar')}
                aria-label={sidebarOpen ? t('navigation.collapseSidebar') : t('navigation.expandSidebar')}
              >
                {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
              </button>
            </>
          )}

          {/* Brand Lockup: Navigates to Dashboard when in Application Context, else Landing Page */}
          <Link
            to={isAppView || isAuthenticated ? '/dashboard' : '/'}
            className="app-header-brand"
            aria-label={
              isAppView || isAuthenticated
                ? `${t('navigation.dashboard')} — FinAuditEase`
                : 'FinAuditEase — Powered by Sabi Africa Innovations Limited'
            }
            onClick={() => setPublicMenuOpen(false)}
          >
            <img
              src="/images/sabi-africa-logo.jpg"
              alt="Sabi Africa Innovations Limited Logo"
              className="app-header-sabi-logo"
              width="36"
              height="36"
            />
            <div className="app-header-brand-text">
              <span className="app-header-title">FinAuditEase</span>
              <span className="app-header-subtitle">Powered by Sabi Africa Innovations Limited</span>
            </div>
          </Link>
        </div>

        {/* Right Side: Desktop Nav & Utilities */}
        <div className="app-header-right">
          {isAppView ? (
            <div className="app-header-user-section">
              <LanguageSwitcher variant="compact" />
              <NotificationBell />
              {user && (
                <Link
                  to="/profile"
                  className="app-header-user-badge"
                  title={`${user.fullName} (${formatUserRole(user.role, t)}) - ${user.email}`}
                  aria-label={`${t('profile.title')}: ${user.fullName} (${formatUserRole(user.role, t)})`}
                >
                  <span className="app-header-user-avatar" aria-hidden="true">
                    {userInitials}
                  </span>
                  <div className="app-header-user-meta">
                    <span className="app-header-user-name">{user.fullName}</span>
                    <span className="app-header-user-role">{formatUserRole(user.role, t)}</span>
                  </div>
                </Link>
              )}
              <button
                type="button"
                className="app-header-logout-btn"
                onClick={() => setShowSignOutModal(true)}
                aria-label={t('navigation.logout')}
                title={t('navigation.logout')}
              >
                <LogOut size={16} aria-hidden="true" />
                <span className="app-header-logout-text">{t('navigation.logout')}</span>
              </button>
            </div>
          ) : (
            <nav aria-label="Public Platform Navigation" className="app-header-nav-links">
              <a
                href="#how-it-works"
                className={`app-header-nav-link ${activeSection === 'how-it-works' ? 'active' : ''}`}
                onClick={(e) => handleScrollToSection(e, 'how-it-works')}
              >
                {t('navigation.howItWorks')}
              </a>
              <a
                href="#capabilities"
                className={`app-header-nav-link ${activeSection === 'capabilities' ? 'active' : ''}`}
                onClick={(e) => handleScrollToSection(e, 'capabilities')}
              >
                {t('navigation.features')}
              </a>
              <a
                href="#roles"
                className={`app-header-nav-link ${activeSection === 'roles' ? 'active' : ''}`}
                onClick={(e) => handleScrollToSection(e, 'roles')}
              >
                {t('navigation.roles')}
              </a>
              <a
                href="#security"
                className={`app-header-nav-link ${activeSection === 'security' ? 'active' : ''}`}
                onClick={(e) => handleScrollToSection(e, 'security')}
              >
                {t('navigation.security')}
              </a>
              <a
                href="#languages"
                className={`app-header-nav-link ${activeSection === 'languages' ? 'active' : ''}`}
                onClick={(e) => handleScrollToSection(e, 'languages')}
              >
                {t('navigation.languages')}
              </a>
              <span className="app-header-divider" aria-hidden="true" />
              <Link to="/login" className="app-header-nav-link">
                {t('navigation.login')}
              </Link>
              <Link to="/signup" className="btn btn-primary btn-md">
                <span>{t('navigation.signup')}</span>
              </Link>
            </nav>
          )}

          {/* Desktop Language Switcher (Public Landing Navigation) */}
          {!isAppView && (
            <div className="app-header-lang-wrapper">
              <LanguageSwitcher variant="header" />
            </div>
          )}

          {/* Mobile Menu Hamburger (for Public Landing) */}
          {!isAppView && (
            <button
              type="button"
              className="app-header-mobile-toggle"
              onClick={() => setPublicMenuOpen((prev) => !prev)}
              aria-expanded={publicMenuOpen}
              aria-controls="public-mobile-drawer"
              aria-label={publicMenuOpen ? t('navigation.closeMenu') : t('navigation.menu')}
            >
              {publicMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}
        </div>
      </div>

      {/* Public Mobile Drawer Overlay */}
      {!isAppView && publicMenuOpen && (
        <div
          className="public-mobile-backdrop"
          onClick={() => setPublicMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Public Mobile Drawer Menu */}
      {!isAppView && (
        <div
          id="public-mobile-drawer"
          className={`public-mobile-drawer ${publicMenuOpen ? 'open' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          <div className="public-mobile-header">
            <div className="app-header-brand">
              <img
                src="/images/sabi-africa-logo.jpg"
                alt="Sabi Africa Innovations Limited Logo"
                className="app-header-sabi-logo"
                width="36"
                height="36"
              />
              <div className="app-header-brand-text">
                <span className="app-header-title">FinAuditEase</span>
                <span className="app-header-subtitle">Powered by Sabi Africa Innovations Limited</span>
              </div>
            </div>
            <button
              type="button"
              className="app-header-menu-btn"
              onClick={() => setPublicMenuOpen(false)}
              aria-label={t('navigation.closeMenu')}
            >
              <X size={22} />
            </button>
          </div>

          <nav className="public-mobile-nav" aria-label="Mobile Navigation Links">
            <a
              href="#how-it-works"
              className={`public-mobile-link ${activeSection === 'how-it-works' ? 'active' : ''}`}
              onClick={(e) => handleScrollToSection(e, 'how-it-works')}
            >
              {t('navigation.howItWorks')}
            </a>
            <a
              href="#capabilities"
              className={`public-mobile-link ${activeSection === 'capabilities' ? 'active' : ''}`}
              onClick={(e) => handleScrollToSection(e, 'capabilities')}
            >
              {t('navigation.features')}
            </a>
            <a
              href="#roles"
              className={`public-mobile-link ${activeSection === 'roles' ? 'active' : ''}`}
              onClick={(e) => handleScrollToSection(e, 'roles')}
            >
              {t('navigation.roles')}
            </a>
            <a
              href="#security"
              className={`public-mobile-link ${activeSection === 'security' ? 'active' : ''}`}
              onClick={(e) => handleScrollToSection(e, 'security')}
            >
              {t('navigation.security')}
            </a>
            <a
              href="#languages"
              className={`public-mobile-link ${activeSection === 'languages' ? 'active' : ''}`}
              onClick={(e) => handleScrollToSection(e, 'languages')}
            >
              {t('navigation.languages')}
            </a>

            <div className="public-mobile-divider" />

            <div className="public-mobile-actions">
              <Link
                to="/login"
                className="btn btn-outline btn-lg"
                onClick={() => setPublicMenuOpen(false)}
              >
                {t('navigation.login')}
              </Link>
              <Link
                to="/signup"
                className="btn btn-primary btn-lg"
                onClick={() => setPublicMenuOpen(false)}
              >
                <span>{t('navigation.signup')}</span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>

            <div className="public-mobile-lang">
              <span className="public-mobile-lang-label">{t('navigation.language')}</span>
              <LanguageSwitcher variant="footer" />
            </div>
          </nav>
        </div>
      )}

      {/* Enterprise Sign-Out Confirmation Modal */}
      <SignOutConfirmModal
        isOpen={showSignOutModal}
        isSubmitting={isLoggingOut}
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowSignOutModal(false)}
      />
    </header>
  )
}
