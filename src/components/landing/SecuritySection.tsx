import React from 'react'
import { FileLock2, History, KeyRound, Lock, ShieldCheck, UserCheck } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import './SecuritySection.css'

export const SecuritySection: React.FC = () => {
  const { t } = useLanguage()

  const securityPillars = [
    {
      id: 'zero-credentials',
      title: t('landing.security.item1Title'),
      desc: t('landing.security.item1Desc'),
      icon: KeyRound,
    },
    {
      id: 'role-enforcement',
      title: t('landing.security.item2Title'),
      desc: t('landing.security.item2Desc'),
      icon: UserCheck,
    },
    {
      id: 'hash-vault',
      title: t('landing.security.item3Title'),
      desc: t('landing.security.item3Desc'),
      icon: FileLock2,
    },
    {
      id: 'transit-encryption',
      title: t('landing.security.item4Title'),
      desc: t('landing.security.item4Desc'),
      icon: Lock,
    },
    {
      id: 'session-isolation',
      title: t('landing.security.item5Title'),
      desc: t('landing.security.item5Desc'),
      icon: ShieldCheck,
    },
    {
      id: 'audit-trail',
      title: t('landing.security.item6Title'),
      desc: t('landing.security.item6Desc'),
      icon: History,
    },
  ]

  return (
    <section id="security" className="landing-sec-section" aria-labelledby="security-heading">
      <div className="landing-sec-container">
        {/* Section Header */}
        <div className="landing-section-header reveal-on-scroll">
          <div className="landing-section-pill">
            <span>{t('landing.security.eyebrow')}</span>
          </div>
          <h2 id="security-heading" className="landing-section-title">
            {t('landing.security.heading')}
          </h2>
          <p className="landing-section-subtitle">
            {t('landing.security.subtitle')}
          </p>
        </div>

        {/* Security Architecture Grid (No Fake Badges, Real PRD Architectural Safeguards) */}
        <div className="landing-sec-grid">
          {securityPillars.map((pillar, idx) => {
            const PillarIcon = pillar.icon
            return (
              <div key={pillar.id} className={`landing-sec-card reveal-on-scroll reveal-delay-${(idx % 3) + 1}`}>
                <div className="sec-card-icon-wrap" aria-hidden="true">
                  <PillarIcon size={20} />
                </div>
                <h3 className="sec-card-title">{pillar.title}</h3>
                <p className="sec-card-desc">{pillar.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
