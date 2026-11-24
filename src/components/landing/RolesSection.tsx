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
        t('landing.roles.auditorCap1', 'Create and manage audit engagements'),
        t('landing.roles.auditorCap2', 'Dispatch structured document requests'),
        t('landing.roles.auditorCap3', 'Review evidence and record clear decisions'),
        t('landing.roles.auditorCap4', 'Maintain complete engagement workpapers'),
      ],
    },
    {
      id: 'accounting-team',
      title: t('landing.roles.accountingTitle'),
      desc: t('landing.roles.accountingDesc'),
      icon: Users,
      capabilities: [
        t('landing.roles.accountingCap1', 'Organize pre-audit and month-end schedules year-round'),
        t('landing.roles.accountingCap2', 'Receive and respond to auditor requests directly'),
        t('landing.roles.accountingCap3', 'Upload verified schedules with client-side validation'),
        t('landing.roles.accountingCap4', 'Resolve missing items and track submission status'),
      ],
    },
    {
      id: 'senior-oversight',
      title: t('landing.roles.oversightTitle'),
      desc: t('landing.roles.oversightDesc'),
      icon: UserCheck2,
      capabilities: [
        t('landing.roles.oversightCap1', 'Monitor overall engagement progress and milestones'),
        t('landing.roles.oversightCap2', 'Review escalation alerts and unresolved inquiries'),
        t('landing.roles.oversightCap3', 'Maintain compliance governance and quality assurance'),
        t('landing.roles.oversightCap4', 'Retain historical inspection readiness'),
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
                  <span className="capabilities-heading">{t('landing.keyResponsibilities', 'Key Operational Responsibilities')}</span>
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
