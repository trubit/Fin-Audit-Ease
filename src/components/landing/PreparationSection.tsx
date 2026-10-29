import React from 'react'
import { ArrowDown, CheckCircle2, FileCheck, Layers, PieChart, ShieldCheck } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import './PreparationSection.css'

export const PreparationSection: React.FC = () => {
  const { t } = useLanguage()

  const monthEndSteps = [
    t('landing.preparation.monthEndStep1'),
    t('landing.preparation.monthEndStep2'),
    t('landing.preparation.monthEndStep3'),
    t('landing.preparation.monthEndStep4'),
  ]

  const preAuditSteps = [
    t('landing.preparation.preAuditStep1'),
    t('landing.preparation.preAuditStep2'),
    t('landing.preparation.preAuditStep3'),
    t('landing.preparation.preAuditStep4'),
  ]

  return (
    <section id="preparation" className="landing-prep-section" aria-labelledby="prep-heading">
      <div className="landing-prep-container">
        {/* Section Header */}
        <div className="landing-section-header reveal-on-scroll">
          <div className="landing-section-pill">
            <span>{t('landing.preparation.eyebrow')}</span>
          </div>
          <h2 id="prep-heading" className="landing-section-title">
            {t('landing.preparation.heading')}
          </h2>
          <p className="landing-section-subtitle">
            {t('landing.preparation.subtitle')}
          </p>
        </div>

        {/* Dual Connected Preparation Tracks */}
        <div className="landing-prep-dual-grid">
          {/* Track 1: Month-End Close */}
          <div className="landing-prep-card reveal-on-scroll reveal-delay-1">
            <div className="prep-card-header">
              <div className="prep-card-badge-icon" aria-hidden="true">
                <PieChart size={20} />
              </div>
              <div>
                <h3 className="prep-card-title">{t('landing.preparation.monthEndTitle')}</h3>
                <p className="prep-card-desc">{t('landing.preparation.monthEndDesc')}</p>
              </div>
            </div>

            <div className="prep-card-flow" role="list">
              {monthEndSteps.map((stepName, idx) => (
                <React.Fragment key={`me-${idx}`}>
                  <div className="prep-flow-item" role="listitem">
                    <span className="prep-flow-num">{idx + 1}</span>
                    <span className="prep-flow-name">{stepName}</span>
                    {idx === monthEndSteps.length - 1 ? (
                      <CheckCircle2 size={16} className="prep-status-done" aria-hidden="true" />
                    ) : (
                      <span className="prep-status-dot" aria-hidden="true" />
                    )}
                  </div>

                  {idx < monthEndSteps.length - 1 && (
                    <div className="prep-flow-connector" aria-hidden="true">
                      <ArrowDown size={14} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Track 2: Pre-Audit Preparation */}
          <div className="landing-prep-card reveal-on-scroll reveal-delay-2">
            <div className="prep-card-header">
              <div className="prep-card-badge-icon" aria-hidden="true">
                <Layers size={20} />
              </div>
              <div>
                <h3 className="prep-card-title">{t('landing.preparation.preAuditTitle')}</h3>
                <p className="prep-card-desc">{t('landing.preparation.preAuditDesc')}</p>
              </div>
            </div>

            <div className="prep-card-flow" role="list">
              {preAuditSteps.map((stepName, idx) => (
                <React.Fragment key={`pa-${idx}`}>
                  <div className="prep-flow-item" role="listitem">
                    <span className="prep-flow-num">{idx + 1}</span>
                    <span className="prep-flow-name">{stepName}</span>
                    {idx === preAuditSteps.length - 1 ? (
                      <ShieldCheck size={16} className="prep-status-done" aria-hidden="true" />
                    ) : (
                      <FileCheck size={16} className="prep-status-dot-file" aria-hidden="true" />
                    )}
                  </div>

                  {idx < preAuditSteps.length - 1 && (
                    <div className="prep-flow-connector" aria-hidden="true">
                      <ArrowDown size={14} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
