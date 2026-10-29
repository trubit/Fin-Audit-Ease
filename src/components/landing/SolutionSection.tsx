import React from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { HeroSlider } from './HeroSlider'
import './SolutionSection.css'

export const SolutionSection: React.FC = () => {
  const { t } = useLanguage()

  return (
    <section id="solution" className="landing-solution-section" aria-labelledby="solution-heading">
      <div className="landing-solution-container">
        {/* Section Header */}
        <div className="landing-section-header reveal-on-scroll">
          <div className="landing-section-pill">
            <span>{t('landing.solution.eyebrow')}</span>
          </div>
          <h2 id="solution-heading" className="landing-section-title">
            {t('landing.solution.heading')}
          </h2>
          <p className="landing-section-subtitle">
            {t('landing.solution.subtitle')}
          </p>
        </div>

        {/* Interactive Storytelling Slider (The Solution) */}
        <div className="landing-solution-slider-wrapper reveal-on-scroll reveal-delay-1">
          <HeroSlider />
        </div>
      </div>
    </section>
  )
}
