import React from 'react'
import {
  Briefcase,
  FileText,
  Upload,
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  History,
  Lock,
  CalendarCheck
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import './AuditTrailSection.css'

export const AuditTrailSection: React.FC = () => {
  const { t } = useLanguage()

  const trailEvents = [
    { label: t('landing.auditTrail.event1'), icon: Briefcase, tag: 'Engagement Created', meta: 'Fiscal Year 2024 Audit Scope Defined' },
    { label: t('landing.auditTrail.event2'), icon: FileText, tag: 'Request Issued', meta: 'Assigned to Accounting Team Member' },
    { label: t('landing.auditTrail.event3'), icon: Upload, tag: 'Document Submitted', meta: '25MB Ledger Extract Attached with Note' },
    { label: t('landing.auditTrail.event4'), icon: FileCheck2, tag: 'Document Reviewed', meta: 'Auditor Inspected in Central Review Console' },
    { label: t('landing.auditTrail.event5'), icon: ShieldCheck, tag: 'Decision Recorded', meta: 'Approved / Explicit Written Reason Kept' },
    { label: t('landing.auditTrail.event6'), icon: CheckCircle2, tag: 'Engagement Completed', meta: 'All Requirements Satisfied & Signed Off' },
    { label: t('landing.auditTrail.event7'), icon: History, tag: 'Permanent Record', meta: 'Historical Record Remains Available Forever' },
  ]

  return (
    <section id="audit-trail" className="landing-trail-dark-section" aria-labelledby="trail-heading">
      <div className="landing-trail-dark-container">
        {/* Section Header with "The work stays with you." */}
        <div className="landing-trail-dark-header reveal-on-scroll">
          <div className="trail-dark-pill">
            <Lock size={13} className="pill-lock-icon" />
            <span>{t('landing.auditTrail.eyebrow')}</span>
          </div>

          <h2 id="trail-heading" className="trail-dark-title">
            {t('landing.auditTrail.statement')}
          </h2>

          <p className="trail-dark-lead">
            {t('landing.auditTrail.heading')}
          </p>

          <p className="trail-dark-subtitle">
            {t('landing.auditTrail.subtitle')}
          </p>
        </div>

        {/* Vertical Audit Trail Visualization */}
        <div className="landing-trail-card reveal-on-scroll reveal-delay-1">
          <div className="trail-card-top-bar">
            <div className="top-bar-left">
              <span className="terminal-dot green" />
              <span className="terminal-dot" />
              <span className="terminal-dot" />
              <span className="top-bar-title">Engagement Audit Trail (Read-Only)</span>
            </div>
            <div className="top-bar-right">
              <CalendarCheck size={14} />
              <span>Multi-Year Record Preserved</span>
            </div>
          </div>

          <div className="trail-timeline-list" role="list">
            {trailEvents.map((evt, idx) => {
              const EventIcon = evt.icon
              const isLast = idx === trailEvents.length - 1

              return (
                <div
                  key={evt.tag}
                  className={`trail-event-row ${isLast ? 'row-permanent' : ''} reveal-on-scroll reveal-delay-${(idx % 4) + 1}`}
                  role="listitem"
                >
                  <div className="trail-event-spine" aria-hidden="true">
                    <div className="trail-event-bullet">
                      <EventIcon size={14} />
                    </div>
                    {!isLast && <div className="trail-event-line" />}
                  </div>

                  <div className="trail-event-content">
                    <div className="trail-event-header-row">
                      <span className="trail-event-tag">{evt.tag}</span>
                      <span className="trail-event-status">{isLast ? 'Retained Forever' : 'Logged & Sealed'}</span>
                    </div>
                    <span className="trail-event-label">{evt.label}</span>
                    <span className="trail-event-meta">{evt.meta}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
