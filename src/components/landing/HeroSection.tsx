import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import './HeroSection.css'

export const HeroSection: React.FC = () => {
  const { t } = useLanguage()

  const handleScrollToHowItWorks = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const element = document.getElementById('how-it-works')
    if (element) {
      const headerHeight = 72
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
      window.history.pushState(null, '', '#how-it-works')
    }
  }

  return (
    <section className="landing-hero-section" aria-labelledby="hero-heading">
      <div className="landing-hero-container">
        {/* Header Branding Pill */}
        <div className="landing-hero-pill-wrapper">
          <div className="landing-hero-eyebrow">
            <span className="landing-hero-pill-dot" aria-hidden="true" />
            <span>{t('landing.hero.eyebrow')}</span>
          </div>
        </div>

        {/* Main Editorial Headline */}
        <h1 id="hero-heading" className="landing-hero-title">
          {t('landing.hero.heading')}
        </h1>

        {/* Supporting Copy */}
        <p className="landing-hero-subtitle">
          {t('landing.hero.subtitle')}
        </p>

        {/* Action Pathways */}
        <div className="landing-hero-ctas">
          <Link to="/signup" className="landing-hero-btn-primary" id="hero-primary-cta">
            <span>{t('landing.hero.primaryCta')}</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>

          <a
            href="#how-it-works"
            onClick={handleScrollToHowItWorks}
            className="landing-hero-btn-secondary"
            id="hero-secondary-cta"
          >
            <span>{t('landing.hero.secondaryCta')}</span>
            <ChevronDown size={16} aria-hidden="true" />
          </a>
        </div>

        {/* Institutional Trust & Professional Framework Strip */}
        <div className="landing-hero-trust-bar" role="list" aria-label="Key frameworks and standards">
          <div className="landing-hero-trust-tag" role="listitem">
            <span className="trust-tag-dot" aria-hidden="true" />
            <span>Statutory Audit Ready</span>
          </div>
          <div className="landing-hero-trust-tag" role="listitem">
            <span className="trust-tag-dot" aria-hidden="true" />
            <span>IFRS &amp; ISA Aligned</span>
          </div>
          <div className="landing-hero-trust-tag" role="listitem">
            <span className="trust-tag-dot" aria-hidden="true" />
            <span>TLS &amp; AES-256 Encryption</span>
          </div>
          <div className="landing-hero-trust-tag" role="listitem">
            <span className="trust-tag-dot" aria-hidden="true" />
            <span>Built for NDPA Privacy Standards</span>
          </div>
          <div className="landing-hero-trust-tag" role="listitem">
            <span className="trust-tag-dot" aria-hidden="true" />
            <span>5 Nigerian Languages</span>
          </div>
        </div>
      </div>
    </section>
  )
}
