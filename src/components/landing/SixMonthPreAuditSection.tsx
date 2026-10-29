import React from 'react'
import { CheckCircle2, ChevronRight, Clock, Forward, ListTodo, Search, Users } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import './SixMonthPreAuditSection.css'

export const SixMonthPreAuditSection: React.FC = () => {
  const { t } = useLanguage()

  const runwayStages = [
    { id: 't-6-months', label: t('landing.sixMonth.step1'), icon: Clock, tag: 'T-6 Months' },
    { id: 'runway-step-1', label: t('landing.sixMonth.step2'), icon: ListTodo, tag: 'Step 1' },
    { id: 'runway-step-2', label: t('landing.sixMonth.step3'), icon: Users, tag: 'Step 2' },
    { id: 'runway-step-3', label: t('landing.sixMonth.step4'), icon: Search, tag: 'Step 3' },
    { id: 'runway-step-4', label: t('landing.sixMonth.step5'), icon: CheckCircle2, tag: 'Step 4' },
    { id: 'runway-step-5', label: t('landing.sixMonth.step6'), icon: Forward, tag: 'Step 5' },
    { id: 'runway-ready', label: t('landing.sixMonth.step7'), icon: CheckCircle2, tag: 'Ready' },
  ]

  return (
    <section id="pre-audit-runway" className="landing-runway-section" aria-labelledby="runway-heading">
      <div className="landing-runway-container">
        {/* Section Header */}
        <div className="landing-section-header reveal-on-scroll">
          <div className="landing-section-pill">
            <span>{t('landing.sixMonth.eyebrow')}</span>
          </div>
          <h2 id="runway-heading" className="landing-section-title">
            {t('landing.sixMonth.heading')}
          </h2>
          <p className="landing-section-subtitle">
            {t('landing.sixMonth.subtitle')}
          </p>
        </div>

        {/* 7-Step Horizontal Runway Track */}
        <div className="landing-runway-track reveal-on-scroll reveal-delay-1" role="list">
          {runwayStages.map((stage, idx) => {
            const StageIcon = stage.icon
            const isFirst = idx === 0
            const isLast = idx === runwayStages.length - 1
            return (
              <React.Fragment key={stage.id}>
                <div
                  className={`landing-runway-node ${isFirst ? 'node-start' : ''} ${isLast ? 'node-end' : ''} reveal-on-scroll reveal-delay-${(idx % 4) + 1}`}
                  role="listitem"
                >
                  <span className="runway-node-tag">{stage.tag}</span>
                  <div className="runway-node-icon" aria-hidden="true">
                    <StageIcon size={20} />
                  </div>
                  <span className="runway-node-label">{stage.label}</span>
                </div>

                {!isLast && (
                  <div className="landing-runway-arrow" aria-hidden="true">
                    <ChevronRight size={18} />
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </section>
  )
}
