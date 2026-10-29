import React from 'react'
import { Calendar, ChevronRight, CornerDownRight, FileText, Tag, UserCheck, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import './RequestSection.css'

export const RequestSection: React.FC = () => {
  const { t } = useLanguage()

  return (
    <section id="requests" className="landing-request-section" aria-labelledby="request-heading">
      <div className="landing-request-container">
        {/* Section Header */}
        <div className="landing-section-header reveal-on-scroll">
          <div className="landing-section-pill">
            <span>{t('landing.request.eyebrow')}</span>
          </div>
          <h2 id="request-heading" className="landing-section-title">
            {t('landing.request.heading')}
          </h2>
          <p className="landing-section-subtitle">
            {t('landing.request.subtitle')}
          </p>
        </div>

        {/* Request Visualization: Representative Structure + Exact Status Flow */}
        <div className="landing-request-visual-grid">
          {/* Left: Authentic Audit Request Structure Card */}
          <div className="request-card-preview reveal-on-scroll reveal-delay-1">
            <div className="request-card-top">
              <div className="request-card-category">
                <Tag size={12} aria-hidden="true" />
                <span>{t('landing.request.sampleCategory')}</span>
              </div>
              <span className="request-card-priority-badge">{t('landing.request.samplePriority')}</span>
            </div>

            <h3 className="request-card-item-title">
              {t('landing.request.sampleTitle')}
            </h3>

            <div className="request-card-meta-list">
              <div className="meta-item">
                <UserCheck size={14} className="meta-icon" aria-hidden="true" />
                <span>{t('landing.request.sampleAssigned')}</span>
              </div>
              <div className="meta-item">
                <Calendar size={14} className="meta-icon" aria-hidden="true" />
                <span>{t('landing.request.sampleDeadline')}</span>
              </div>
              <div className="meta-item">
                <FileText size={14} className="meta-icon" aria-hidden="true" />
                <span>Reference Schedule Template Attached</span>
              </div>
            </div>
          </div>

          {/* Right: Status Progression & Rejection Path Visual */}
          <div className="request-status-flow-box reveal-on-scroll reveal-delay-2">
            <h4 className="flow-box-heading">Status Progression</h4>
            
            {/* Primary Happy Path */}
            <div className="status-path-primary" role="list">
              <div className="status-node node-pending" role="listitem">
                <Clock size={14} aria-hidden="true" />
                <span>{t('landing.request.statusPending')}</span>
              </div>
              <ChevronRight size={16} className="path-arrow" aria-hidden="true" />

              <div className="status-node node-responded" role="listitem">
                <span>{t('landing.request.statusResponded')}</span>
              </div>
              <ChevronRight size={16} className="path-arrow" aria-hidden="true" />

              <div className="status-node node-review" role="listitem">
                <span>{t('landing.request.statusUnderReview')}</span>
              </div>
              <ChevronRight size={16} className="path-arrow" aria-hidden="true" />

              <div className="status-node node-approved" role="listitem">
                <CheckCircle2 size={14} aria-hidden="true" />
                <span>{t('landing.request.statusApproved')}</span>
              </div>
            </div>

            {/* Rejection Loop Path */}
            <div className="rejection-path-section">
              <div className="rejection-divider">
                <CornerDownRight size={14} className="rejection-down-icon" aria-hidden="true" />
                <span className="rejection-heading-text">Revision &amp; Resolution Loop</span>
              </div>

              <div className="rejection-flow-row" role="list">
                <div className="status-node node-rejected" role="listitem">
                  <AlertCircle size={14} aria-hidden="true" />
                  <span>{t('landing.request.statusRejected')}</span>
                </div>
                <ChevronRight size={16} className="path-arrow" aria-hidden="true" />

                <div className="status-node node-reason" role="listitem">
                  <span>{t('landing.request.reasonProvided')}</span>
                </div>
                <ChevronRight size={16} className="path-arrow" aria-hidden="true" />

                <div className="status-node node-returned" role="listitem">
                  <span>{t('landing.request.returnedForResponse')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
