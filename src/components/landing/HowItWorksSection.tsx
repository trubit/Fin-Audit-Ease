import React, { useState } from 'react'
import {
  Briefcase,
  FileQuestion,
  UserCheck,
  UploadCloud,
  FileCheck2,
  CheckCircle2,
  FolderArchive,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import './HowItWorksSection.css'

export const HowItWorksSection: React.FC = () => {
  const { t } = useLanguage()
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      num: '01',
      title: t('landing.howItWorks.step1Title'),
      desc: t('landing.howItWorks.step1Desc'),
      icon: Briefcase,
      actor: 'Auditor',
      output: 'Engagement Scope & Terms Established',
    },
    {
      num: '02',
      title: t('landing.howItWorks.step2Title'),
      desc: t('landing.howItWorks.step2Desc'),
      icon: FileQuestion,
      actor: 'Auditor',
      output: 'Structured Requests with Priorities & Due Dates',
    },
    {
      num: '03',
      title: t('landing.howItWorks.step3Title'),
      desc: t('landing.howItWorks.step3Desc'),
      icon: UserCheck,
      actor: 'Auditor & Accounting Team',
      output: 'Dedicated Accounting Team Member Responsibility',
    },
    {
      num: '04',
      title: t('landing.howItWorks.step4Title'),
      desc: t('landing.howItWorks.step4Desc'),
      icon: UploadCloud,
      actor: 'Accounting Team Member',
      output: 'Evidentiary Files Uploaded Against Specific Request',
    },
    {
      num: '05',
      title: t('landing.howItWorks.step5Title'),
      desc: t('landing.howItWorks.step5Desc'),
      icon: FileCheck2,
      actor: 'Auditor',
      output: 'Evidence Inspected in Review Workspace',
    },
    {
      num: '06',
      title: t('landing.howItWorks.step6Title'),
      desc: t('landing.howItWorks.step6Desc'),
      icon: CheckCircle2,
      actor: 'Auditor',
      output: 'Approved Evidence or Rejection with Explicit Reason',
    },
    {
      num: '07',
      title: t('landing.howItWorks.step7Title'),
      desc: t('landing.howItWorks.step7Desc'),
      icon: FolderArchive,
      actor: 'All Stakeholders',
      output: 'Finalized Engagement & Permanent Audit History',
    },
  ]

  return (
    <section id="how-it-works" className="landing-how-dark-section" aria-labelledby="how-it-works-heading">
      <div className="landing-how-dark-container">
        {/* Dark Story Transition Eyebrow & Statement */}
        <div className="landing-dark-header reveal-on-scroll">
          <div className="landing-dark-pill">
            <Sparkles size={13} className="pill-sparkle" />
            <span>{t('landing.howItWorks.eyebrow')}</span>
          </div>
          <h2 id="how-it-works-heading" className="landing-dark-title">
            {t('landing.howItWorks.heading')}
          </h2>
          <p className="landing-dark-lead">
            {t('landing.howItWorks.lead')}
          </p>
          <p className="landing-dark-subtitle">
            {t('landing.howItWorks.subtitle')}
          </p>
        </div>

        {/* 7-Step Continuous Connected Workflow Line */}
        <div className="how-connected-track-wrapper reveal-on-scroll reveal-delay-1" role="region" aria-label="Connected Audit Workflow Stages">
          <div className="how-track-line" aria-hidden="true" />

          <div className="how-steps-scroll" role="list">
            {steps.map((step, idx) => {
              const Icon = step.icon
              const isSelected = activeStep === idx

              return (
                <div
                  key={step.num}
                  role="listitem"
                  className={`how-track-node ${isSelected ? 'active' : ''}`}
                  onClick={() => setActiveStep(idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setActiveStep(idx)
                    }
                  }}
                  tabIndex={0}
                  aria-current={isSelected ? 'step' : undefined}
                  aria-label={`Step ${step.num}: ${step.title}`}
                >
                  <div className="how-node-circle">
                    <Icon size={18} />
                    <span className="how-node-index">{step.num}</span>
                  </div>

                  <span className="how-node-title">{step.title}</span>
                  <span className="how-node-actor">{step.actor}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Active Stage Deep-Dive Card */}
        <div className="how-dark-detail-card reveal-on-scroll reveal-delay-2" aria-live="polite">
          <div className="dark-card-left">
            <div className="dark-card-tag-row">
              <span className="dark-card-step-badge">Stage {steps[activeStep].num}</span>
              <span className="dark-card-actor-badge">{steps[activeStep].actor}</span>
            </div>
            <h3 className="dark-card-heading">{steps[activeStep].title}</h3>
            <p className="dark-card-desc">{steps[activeStep].desc}</p>
          </div>

          <div className="dark-card-right">
            <span className="dark-result-label">Stage Milestone & Output:</span>
            <div className="dark-result-box">
              <ShieldCheck size={18} className="dark-result-icon" />
              <span>{steps[activeStep].output}</span>
            </div>
            {activeStep < steps.length - 1 ? (
              <button
                type="button"
                className="dark-next-step-btn"
                onClick={() => setActiveStep((prev) => prev + 1)}
              >
                <span>Next Stage</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <span className="dark-complete-badge">Workflow Complete & Preserved</span>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
