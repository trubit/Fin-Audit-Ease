import React from 'react'
import { CalendarCheck2, Clock4, FileSpreadsheet, ShieldCheck, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import './ProblemSection.css'

export const ProblemSection: React.FC = () => {
  const { t } = useLanguage()

  const timelineSteps = [
    {
      num: '01',
      title: t('landing.storyProblem.step1Title'),
      desc: t('landing.storyProblem.step1Desc'),
      icon: CalendarCheck2,
    },
    {
      num: '02',
      title: t('landing.storyProblem.step2Title'),
      desc: t('landing.storyProblem.step2Desc'),
      icon: FileSpreadsheet,
    },
    {
      num: '03',
      title: t('landing.storyProblem.step3Title'),
      desc: t('landing.storyProblem.step3Desc'),
      icon: Clock4,
    },
    {
      num: '04',
      title: t('landing.storyProblem.step4Title'),
      desc: t('landing.storyProblem.step4Desc'),
      icon: ShieldCheck,
    },
  ]

  return (
    <section id="the-problem" className="landing-story-section" aria-labelledby="story-problem-heading">
      <div className="landing-story-container">
        {/* Section Header with Natural Transition */}
        <div className="landing-section-header reveal-on-scroll">
          <div className="landing-section-pill">
            <span>{t('landing.storyProblem.eyebrow')}</span>
          </div>
          <h2 id="story-problem-heading" className="landing-section-title">
            {t('landing.storyProblem.heading')}
          </h2>
          <p className="landing-section-subtitle">
            {t('landing.storyProblem.subtitle')}
          </p>
        </div>

        {/* Visual Timeline Diagram (Zero People Photography) */}
        <div className="landing-problem-timeline-wrap reveal-on-scroll reveal-delay-1" aria-label="Audit Preparation Timeline">
          <div className="landing-problem-timeline-grid">
            {timelineSteps.map((step, idx) => {
              const StepIcon = step.icon
              return (
                <div key={step.num} className={`landing-timeline-card reveal-on-scroll reveal-delay-${idx + 1}`}>
                  <div className="timeline-card-header">
                    <span className="timeline-card-step">{step.num}</span>
                    <div className="timeline-icon-box" aria-hidden="true">
                      <StepIcon size={20} />
                    </div>
                  </div>
                  <h3 className="timeline-card-title">{step.title}</h3>
                  <p className="timeline-card-desc">{step.desc}</p>

                  {idx < timelineSteps.length - 1 && (
                    <div className="timeline-card-connector" aria-hidden="true">
                      <ArrowRight size={14} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Storytelling Transition to Preparation */}
        <div className="problem-bridge-text reveal-on-scroll reveal-delay-2">
          <span>{t('landing.storyProblem.bridgeText')}</span>
        </div>
      </div>
    </section>
  )
}
