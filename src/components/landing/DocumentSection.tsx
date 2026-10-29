import React from 'react'
import { ArrowDown, FileCheck, FileSpreadsheet, FileText, Image as ImageIcon, MessageSquare, ShieldCheck, UploadCloud } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import './DocumentSection.css'

export const DocumentSection: React.FC = () => {
  const { t } = useLanguage()

  const docFormats = [
    { label: t('landing.document.formatPdf'), icon: FileText, ext: '.PDF' },
    { label: t('landing.document.formatExcel'), icon: FileSpreadsheet, ext: '.XLSX' },
    { label: t('landing.document.formatWord'), icon: FileCheck, ext: '.DOCX' },
    { label: t('landing.document.formatImages'), icon: ImageIcon, ext: '.PNG / .JPG' },
  ]

  const workflowSteps = [
    { num: '01', title: t('landing.document.step1'), icon: FileText },
    { num: '02', title: t('landing.document.step2'), icon: UploadCloud },
    { num: '03', title: t('landing.document.step3'), icon: MessageSquare },
    { num: '04', title: t('landing.document.step4'), icon: FileCheck },
    { num: '05', title: t('landing.document.step5'), icon: ShieldCheck },
  ]

  return (
    <section id="documents" className="landing-document-section" aria-labelledby="document-heading">
      <div className="landing-document-container">
        {/* Section Header */}
        <div className="landing-section-header reveal-on-scroll">
          <div className="landing-section-pill">
            <span>{t('landing.document.eyebrow')}</span>
          </div>
          <h2 id="document-heading" className="landing-section-title">
            {t('landing.document.heading')}
          </h2>
          <p className="landing-section-subtitle">
            {t('landing.document.subtitle')}
          </p>
        </div>

        {/* Document Flow and Supported Formats Vault Illustration */}
        <div className="landing-doc-layout-grid">
          {/* Left: Sequential Flow (Request -> Upload -> Comment -> Review -> Decision) */}
          <div className="landing-doc-flow-card reveal-on-scroll reveal-delay-1">
            <h3 className="doc-card-title">Document Workflow Progression</h3>
            <div className="doc-flow-steps-col" role="list">
              {workflowSteps.map((step, idx) => {
                const StepIcon = step.icon
                return (
                  <React.Fragment key={step.num}>
                    <div className="doc-step-row" role="listitem">
                      <div className="doc-step-icon-wrap" aria-hidden="true">
                        <StepIcon size={16} />
                      </div>
                      <span className="doc-step-title">{step.title}</span>
                      <span className="doc-step-index">{step.num}</span>
                    </div>

                    {idx < workflowSteps.length - 1 && (
                      <div className="doc-step-connector" aria-hidden="true">
                        <ArrowDown size={14} />
                      </div>
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </div>

          {/* Right: Supported Formats Vault Grid */}
          <div className="landing-doc-vault-card reveal-on-scroll reveal-delay-2">
            <h3 className="doc-card-title">Supported Evidentiary Schedules</h3>
            <p className="doc-vault-subtitle">{t('landing.document.vaultNote')}</p>

            <div className="doc-vault-grid">
              {docFormats.map((fmt) => {
                const FmtIcon = fmt.icon
                return (
                  <div key={fmt.ext} className="doc-format-box">
                    <div className="format-box-top">
                      <div className="format-icon" aria-hidden="true">
                        <FmtIcon size={20} />
                      </div>
                      <span className="format-ext-badge">{fmt.ext}</span>
                    </div>
                    <span className="format-label">{fmt.label}</span>
                  </div>
                )
              })}
            </div>

            <div className="doc-vault-footer-note">
              <ShieldCheck size={16} className="vault-shield" aria-hidden="true" />
              <span>Documents are permanently anchored to their audit request inquiry.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
