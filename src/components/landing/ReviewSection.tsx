import React from 'react'
import { Check, CheckCircle2, ChevronRight, FileCheck, FileX2, MessageSquareQuote, ShieldAlert, X } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import './ReviewSection.css'

export const ReviewSection: React.FC = () => {
  const { t } = useLanguage()

  return (
    <section id="review" className="landing-review-section" aria-labelledby="review-heading">
      <div className="landing-review-container">
        {/* Section Header */}
        <div className="landing-section-header reveal-on-scroll">
          <div className="landing-section-pill">
            <span>{t('landing.review.eyebrow')}</span>
          </div>
          <h2 id="review-heading" className="landing-section-title">
            {t('landing.review.heading')}
          </h2>
          <p className="landing-section-subtitle">
            {t('landing.review.subtitle')}
          </p>
        </div>

        {/* Visual Review & Decision Console Illustration */}
        <div className="landing-review-console-card reveal-on-scroll reveal-delay-1">
          <div className="console-header">
            <span className="console-title">{t('landing.review.panelTitle')}</span>
            <div className="console-status-pill">
              <span className="pulse-indicator" aria-hidden="true" />
              <span>Active Review Boundary</span>
            </div>
          </div>

          <div className="console-decision-grid">
            {/* Action 1: Approval */}
            <div className="console-decision-box box-approved">
              <div className="decision-box-top">
                <div className="decision-icon-wrap icon-approved" aria-hidden="true">
                  <Check size={18} />
                </div>
                <h3 className="decision-box-title">{t('landing.review.actionApprove')}</h3>
              </div>
              <p className="decision-box-desc">{t('landing.review.actionApproveDesc')}</p>
              <div className="decision-box-tag tag-approved">
                <CheckCircle2 size={13} aria-hidden="true" />
                <span>Marked Complete &amp; Locked</span>
              </div>
            </div>

            {/* Action 2: Rejection With Clear Reason */}
            <div className="console-decision-box box-rejected">
              <div className="decision-box-top">
                <div className="decision-icon-wrap icon-rejected" aria-hidden="true">
                  <X size={18} />
                </div>
                <h3 className="decision-box-title">{t('landing.review.actionReject')}</h3>
              </div>
              <p className="decision-box-desc">{t('landing.review.actionRejectDesc')}</p>
              <div className="decision-box-tag tag-rejected">
                <ShieldAlert size={13} aria-hidden="true" />
                <span>Returned for Response</span>
              </div>
            </div>
          </div>

          {/* Sequential Decision Pathway Diagram */}
          <div className="console-pathway-bar" role="list">
            <div className="pathway-step" role="listitem">
              <FileCheck size={14} aria-hidden="true" />
              <span>{t('landing.review.flowDoc')}</span>
            </div>
            <ChevronRight size={16} className="pathway-arrow" aria-hidden="true" />

            <div className="pathway-step" role="listitem">
              <MessageSquareQuote size={14} aria-hidden="true" />
              <span>{t('landing.review.flowReview')}</span>
            </div>
            <ChevronRight size={16} className="pathway-arrow" aria-hidden="true" />

            <div className="pathway-step step-split" role="listitem">
              <span className="split-badge split-approved">{t('landing.review.flowApproved')}</span>
              <span className="split-divider">/</span>
              <span className="split-badge split-rejected">{t('landing.review.flowRejected')}</span>
            </div>
            <ChevronRight size={16} className="pathway-arrow" aria-hidden="true" />

            <div className="pathway-step" role="listitem">
              <FileX2 size={14} aria-hidden="true" />
              <span>{t('landing.review.flowReason')}</span>
            </div>
            <ChevronRight size={16} className="pathway-arrow" aria-hidden="true" />

            <div className="pathway-step step-return" role="listitem">
              <span>{t('landing.review.flowAccountingResponds')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
