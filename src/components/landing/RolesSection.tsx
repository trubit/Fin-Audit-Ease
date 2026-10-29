import React from 'react'
import { CheckCircle2, ShieldCheck, UserCheck2, Users } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import './RolesSection.css'

export const RolesSection: React.FC = () => {
  const { t } = useLanguage()

  const roles = [
    {
      id: 'independent-auditor',
      title: t('landing.roles.auditorTitle'),
      desc: t('landing.roles.auditorDesc'),
      icon: ShieldCheck,
      capabilities: [
        'Create and manage audit engagements',
        'Dispatch structured document requests',
        'Review evidence and record clear decisions',
        'Maintain complete engagement workpapers',
      ],
    },
    {
      id: 'accounting-team',
      title: t('landing.roles.accountingTitle'),
      desc: t('landing.roles.accountingDesc'),
      icon: Users,
      capabilities: [
        'Organize pre-audit and month-end schedules year-round',
        'Receive and respond to auditor requests directly',
        'Upload verified schedules with client-side validation',
        'Resolve missing items and track submission status',
      ],
    },
    {
      id: 'senior-oversight',
      title: t('landing.roles.oversightTitle'),
      desc: t('landing.roles.oversightDesc'),
      icon: UserCheck2,
      capabilities: [
        'Monitor overall engagement progress and milestones',
        'Review escalation alerts and unresolved inquiries',
        'Maintain compliance governance and quality assurance',
        'Retain historical inspection readiness',
      ],
    },
  ]

  return (
    <section id="roles" className="landing-roles-section" aria-labelledby="roles-heading">
      <div className="landing-roles-container">
        {/* Section Header */}
        <div className="landing-section-header reveal-on-scroll">
          <div className="landing-section-pill">
            <span>{t('landing.roles.eyebrow')}</span>
          </div>
          <h2 id="roles-heading" className="landing-section-title">
            {t('landing.roles.heading')}
          </h2>
          <p className="landing-section-subtitle">
            {t('landing.roles.subtitle')}
          </p>
        </div>

        {/* 3 Core Roles Grid */}
        <div className="landing-roles-grid">
          {roles.map((role, idx) => {
            const RoleIcon = role.icon
            return (
              <div key={role.id} className={`landing-role-card reveal-on-scroll reveal-delay-${idx + 1}`}>
                <div className="role-card-header">
                  <div className="role-icon-box" aria-hidden="true">
                    <RoleIcon size={22} />
                  </div>
                  <h3 className="role-card-title">{role.title}</h3>
                </div>

                <p className="role-card-desc">{role.desc}</p>

                <div className="role-capabilities-list">
                  <span className="capabilities-heading">Key Operational Responsibilities</span>
                  <ul className="capabilities-ul">
                    {role.capabilities.map((cap) => (
                      <li key={cap} className="capability-item">
                        <CheckCircle2 size={14} className="capability-check" aria-hidden="true" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
