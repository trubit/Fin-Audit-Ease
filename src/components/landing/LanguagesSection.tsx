import React from 'react'
import { Globe, Check } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { LANGUAGE_OPTIONS } from '@/i18n'
import type { SupportedLocale } from '@/config/app.config'
import './LanguagesSection.css'

interface LanguageDetail {
  readonly fullName: string
  readonly nativeTitle: string
  readonly glyphFeatures: string
}

const LANGUAGE_DETAILS: Record<SupportedLocale, LanguageDetail> = {
  en: {
    fullName: 'English',
    nativeTitle: 'English',
    glyphFeatures: 'Standard International Accounting',
  },
  yo: {
    fullName: 'Yoruba',
    nativeTitle: 'Èdè Yorùbá',
    glyphFeatures: 'ẹ, ọ, ṣ • àmì ohùn',
  },
  ig: {
    fullName: 'Igbo',
    nativeTitle: 'Asụsụ Igbo',
    glyphFeatures: 'ị, ụ, ọ, ṅ • ụdaolu',
  },
  ha: {
    fullName: 'Hausa',
    nativeTitle: 'Harshen Hausa',
    glyphFeatures: 'ɓ, ɗ, ƙ • rubutun Boko',
  },
  pcm: {
    fullName: 'Nigerian Pidgin',
    nativeTitle: 'Naijá Pidgin',
    glyphFeatures: 'Clear colloquial phrasing',
  },
}

export const LanguagesSection: React.FC = () => {
  const { currentLocale, changeLanguage, t } = useLanguage()

  return (
    <section id="languages" className="landing-lang-section" aria-labelledby="languages-heading">
      <div className="landing-lang-container">
        {/* Section Header */}
        <div className="landing-section-header reveal-on-scroll">
          <div className="landing-section-pill">
            <span>{t('landing.multilingual.eyebrow')}</span>
          </div>
          <h2 id="languages-heading" className="landing-section-title">
            {t('landing.multilingual.heading')}
          </h2>
          <p className="landing-section-subtitle">
            {t('landing.multilingual.subtitle')}
          </p>
        </div>

        {/* Visual Language Selector Showcase */}
        <div className="landing-lang-grid reveal-on-scroll reveal-delay-1" role="group" aria-label="Visual Language Selector">
          {LANGUAGE_OPTIONS.map((opt) => {
            const isSelected = currentLocale === opt.code
            const detail = LANGUAGE_DETAILS[opt.code]

            return (
              <button
                key={opt.code}
                type="button"
                className={`landing-lang-card ${isSelected ? 'active-lang' : ''}`}
                onClick={() => changeLanguage(opt.code)}
                aria-pressed={isSelected}
                aria-label={`Select language: ${detail.fullName}`}
              >
                <div className="lang-card-top">
                  <span className="lang-flag" aria-hidden="true">{opt.flag}</span>
                  {isSelected && (
                    <span className="lang-check-badge" aria-hidden="true">
                      <Check size={14} />
                    </span>
                  )}
                </div>

                <div className="lang-card-body">
                  <span className="lang-full-name">{detail.fullName}</span>
                  <span className="lang-native-title">{detail.nativeTitle}</span>
                  <span className="lang-glyph-note">{detail.glyphFeatures}</span>
                </div>
              </button>
            )
          })}
        </div>

        <div className="landing-lang-prompt-box">
          <Globe size={18} className="lang-globe-icon" aria-hidden="true" />
          <span>{t('landing.multilingual.selectPrompt')}</span>
        </div>
      </div>
    </section>
  )
}
