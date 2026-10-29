import React from 'react'
import { Briefcase, UserPlus, FileQuestion, Users2, Inbox, FileCheck, CheckCheck } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import './EngagementSection.css'

export const EngagementSection: React.FC = () => {
  const { t } = useLanguage()

  const engagementSteps = [
    { num: '1', title: t('landing.engagement.step1'), icon: Briefcase },
    { num: '2', title: t('landing.engagement.step2'), icon: UserPlus },
    { num: '3', title: t('landing.engagement.step3'), icon: FileQuestion },
    { num: '4', title: t('landing.engagement.step4'), icon: Users2 },
    { num: '5', title: t('landing.engagement.step5'), icon: Inbox },
    { num: '6', title: t('landing.engagement.step6'), icon: FileCheck },
    { num: '7', title: t('landing.engagement.step7'), icon: CheckCheck },
  ]

  return (
    <section id="engagement" className="landing-engagement-section" aria-labelledby="engagement-heading">
      <div className="landing-engagement-container">
        {/* Section Header */}
        <div className="landing-section-header">
          <div className="landing-section-pill">
            <span>{t('landing.engagement.eyebrow')}</span>
          </div>
          <h2 id="engagement-heading" className="landing-section-title">
            {t('landing.engagement.heading')}
          </h2>
          <p className="landing-section-subtitle">
            {t('landing.engagement.subtitle')}
          </p>
        </div>

        {/* Engagement Workflow Diagram */}
        <div className="landing-engagement-diagram">
          <div className="engagement-diagram-grid" role="list">
            {engagementSteps.map((step) => {
              const StepIcon = step.icon
              return (
                <div key={step.num} className="engagement-step-box" role="listitem">
                  <div className="step-box-header">
                    <span className="step-box-number">Step {step.num}</span>
                    <div className="step-box-icon" aria-hidden="true">
                      <StepIcon size={18} />
                    </div>
                  </div>
                  <h3 className="step-box-title">{step.title}</h3>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
