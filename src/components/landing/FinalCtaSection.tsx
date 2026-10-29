import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import './FinalCtaSection.css'

export const FinalCtaSection: React.FC = () => {
  const { t } = useLanguage()

  return (
    <section className="landing-final-cta-section" aria-labelledby="final-cta-heading">
      <div className="landing-final-cta-container">
        {/* Editorial Climax Statement */}
        <div className="final-climax-statement-wrapper reveal-on-scroll">
          <p className="climax-phrase phrase-1">{t('landing.finalCta.phrase1')}</p>
          <p className="climax-phrase phrase-2">{t('landing.finalCta.phrase2')}</p>
          <p className="climax-phrase phrase-3">{t('landing.finalCta.phrase3')}</p>
        </div>

        {/* Action Destination Card */}
        <div className="final-cta-card reveal-on-scroll reveal-delay-2">
          <div className="final-cta-badge" aria-hidden="true">
            <ShieldCheck size={18} />
            <span>FinAuditEase</span>
          </div>

          <h2 id="final-cta-heading" className="final-cta-title">
            {t('landing.finalCta.heading')}
          </h2>

          <p className="final-cta-subtitle">
            {t('landing.finalCta.subtitle')}
          </p>

          <div className="final-cta-actions">
            <Link to="/signup" className="final-cta-btn-primary" id="final-primary-cta">
              <span>{t('landing.finalCta.primaryBtn')}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/login" className="final-cta-btn-secondary" id="final-secondary-cta">
              <span>{t('landing.finalCta.secondaryBtn')}</span>
            </Link>
          </div>

          <div className="final-cta-attribution">
            <span>FinAuditEase — Powered by Sabi Africa Innovations Limited</span>
          </div>
        </div>
      </div>
    </section>
  )
}
