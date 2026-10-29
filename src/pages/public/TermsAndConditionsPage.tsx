import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  FileText,
  Printer,
  ChevronRight,
  Search,
  ArrowUp,
  Link2,
  Check,
  AlertCircle,
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { TERMS_SECTIONS } from './termsData'
import './TermsAndConditionsPage.css'

export const TermsAndConditionsPage: React.FC = () => {
  const { t } = useLanguage()
  const location = useLocation()
  const [filterQuery, setFilterQuery] = useState('')
  const [copiedSectionId, setCopiedSectionId] = useState<string | null>(null)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [activeSectionId, setActiveSectionId] = useState<string>('section-1')

  // SEO Page Title & Meta synchronization
  useEffect(() => {
    document.title = 'Website Terms and Conditions — Sabi Africa Innovations Limited | FinAuditEase'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Website Terms and Conditions governing access to and use of the website operated by Sabi Africa Innovations Limited and FinAuditEase.'
      )
    }
  }, [])

  // Handle hash scrolling when navigated directly or clicked
  useEffect(() => {
    const hash = location.hash || window.location.hash
    if (hash) {
      const sectionId = hash.replace('#', '')
      const element = document.getElementById(sectionId)
      if (element) {
        const timer = setTimeout(() => {
          const headerOffset = 90
          const elementPosition = element.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          })
          setActiveSectionId(sectionId)
        }, 100)
        return () => clearTimeout(timer)
      }
    }
  }, [location.hash])

  // Track active section and show back-to-top button on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true)
      } else {
        setShowBackToTop(false)
      }

      // Determine active section
      const scrollPosition = window.scrollY + 140
      for (let i = TERMS_SECTIONS.length - 1; i >= 0; i--) {
        const item = TERMS_SECTIONS[i]
        const el = document.getElementById(item.id)
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSectionId(item.id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Filter Table of Contents
  const filteredSections = useMemo(() => {
    if (!filterQuery.trim()) return TERMS_SECTIONS
    const q = filterQuery.toLowerCase()
    return TERMS_SECTIONS.filter(
      (sec) =>
        sec.title.toLowerCase().includes(q) ||
        sec.number.toString().includes(q)
    )
  }, [filterQuery])

  // Handle section link copy
  const handleCopyLink = useCallback((sectionId: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${sectionId}`
    if (navigator?.clipboard?.writeText) {
      void navigator.clipboard.writeText(url)
      setCopiedSectionId(sectionId)
      setTimeout(() => setCopiedSectionId(null), 2500)
    }
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="terms-page-wrapper">
      {/* 1. Header Hero Banner */}
      <header className="terms-hero">
        <div className="terms-hero-container">
          <nav className="terms-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">
              {t('navigation.home', 'Home')}
            </Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">
              {t('legal.termsAndConditions', 'Website Terms and Conditions')}
            </span>
          </nav>

          <div className="terms-badge-row">
            <div className="terms-brand-pill">
              <span className="terms-pill-dot" aria-hidden="true" />
              <span>{t('legal.poweredBy', 'FinAuditEase, powered by Sabi Africa Innovations Limited')}</span>
            </div>
            <span className="terms-official-seal">Official Corporate Document</span>
          </div>

          <h1 className="terms-page-title">
            {t('legal.termsTitle', 'Website Terms and Conditions')}
          </h1>
          <p className="terms-page-subtitle">
            {t('legal.companyName', 'Sabi Africa Innovations Limited')} — {t('common.tagline', 'Audit & Accounting Workflow Technology')}
          </p>

          <div className="terms-meta-grid">
            <div className="terms-meta-chip">
              <span className="terms-meta-chip-label">{t('legal.lastUpdated', 'Last Updated')}:</span>
              <span className="terms-meta-chip-value">10th October, 2026</span>
            </div>
            <div className="terms-meta-divider" aria-hidden="true" />
            <div className="terms-meta-chip">
              <span className="terms-meta-chip-label">{t('legal.effectiveDate', 'Effective Date')}:</span>
              <span className="terms-meta-chip-value">10th October, 2026</span>
            </div>
            <div className="terms-meta-divider" aria-hidden="true" />
            <div className="terms-meta-chip">
              <span className="terms-meta-chip-label">{t('legal.jurisdictionLabel', 'Jurisdiction')}:</span>
              <span className="terms-meta-chip-value">Federal Republic of Nigeria</span>
            </div>
            <div className="terms-meta-divider" aria-hidden="true" />
            <div className="terms-meta-chip">
              <span className="terms-meta-chip-label">{t('legal.corporateStatusLabel', 'Corporate Status')}:</span>
              <span className="terms-meta-chip-value">CAMA 2020 (RC: 9926908)</span>
            </div>

            <button
              type="button"
              className="terms-print-btn"
              onClick={handlePrint}
              aria-label="Print or save Terms and Conditions"
            >
              <Printer size={14} aria-hidden="true" />
              <span>{t('common.print', 'Print / PDF')}</span>
            </button>
          </div>

          {/* Bilingual / Authoritative Disclaimer Notice */}
          <div className="terms-notice-banner" role="region" aria-label="Legal Notice">
            <AlertCircle size={20} className="terms-notice-icon" aria-hidden="true" />
            <div>
              <h2 className="terms-notice-title">
                {t('legal.authoritativeNoticeTitle', 'Authoritative Legal Notice & Software Classification')}
              </h2>
              <p className="terms-notice-text">
                {t(
                  'legal.authoritativeNoticeBody',
                  'Sabi Africa Innovations Limited provides software workflow technology only and does not provide accounting, audit, tax, legal, or investment advice. The English version of these Terms is the authoritative legal document under Nigerian law. In the event of any discrepancies or differences in translation, the English text shall prevail.'
                )}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Content Layout (Table of Contents + Document Body) */}
      <div className="terms-layout">
        {/* Sticky Table of Contents Sidebar */}
        <aside className="terms-sidebar" aria-label="Table of Contents">
          <div className="terms-sidebar-header">
            <div className="terms-sidebar-title">
              <FileText size={16} aria-hidden="true" />
              <span>{t('legal.tableOfContents', 'Table of Contents')}</span>
            </div>
            <div className="terms-search-wrapper">
              <input
                type="search"
                className="terms-filter-input"
                placeholder={t('legal.searchTerms', 'Search sections...')}
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                aria-label="Filter terms sections"
              />
              <Search size={14} className="terms-search-icon" aria-hidden="true" />
            </div>
          </div>

          <nav className="terms-toc-nav" aria-label="Document Sections">
            <ol className="terms-toc-list">
              {filteredSections.map((sec) => {
                const isActive = activeSectionId === sec.id
                return (
                  <li key={sec.id}>
                    <a
                      href={`#${sec.id}`}
                      className={`terms-toc-link ${isActive ? 'active' : ''}`}
                      aria-current={isActive ? 'location' : undefined}
                      onClick={() => setActiveSectionId(sec.id)}
                    >
                      <span className="terms-toc-number">{sec.number}.</span>
                      <span className="terms-toc-title">{sec.title}</span>
                    </a>
                  </li>
                )
              })}
            </ol>
          </nav>

          <div className="terms-sidebar-footer">
            <div className="terms-sidebar-info">
              <span className="terms-sidebar-count">{t('legal.totalSections', '38 Total Sections')}</span>
              <span className="terms-sidebar-badge">{t('legal.enforceableAgreement', 'Enforceable Agreement')}</span>
            </div>
            <Link to="/" className="terms-return-link">
              {t('legal.returnHome', '← Return to FinAuditEase')}
            </Link>
          </div>
        </aside>

        {/* Complete Legal Document Body */}
        <main className="terms-body" id="main-legal-content" tabIndex={-1}>
          {TERMS_SECTIONS.map((sec) => (
            <section
              key={sec.id}
              id={sec.id}
              className="terms-section"
              aria-labelledby={`${sec.id}-title`}
            >
              <div className="terms-section-header">
                <h2 id={`${sec.id}-title`} className="terms-section-title">
                  <span className="terms-section-num">{sec.number}.</span> {sec.title}
                </h2>
                <button
                  type="button"
                  className="terms-copy-anchor-btn"
                  onClick={() => handleCopyLink(sec.id)}
                  aria-label={`Copy link to section ${sec.number}: ${sec.title}`}
                  title="Copy permanent link to section"
                >
                  {copiedSectionId === sec.id ? (
                    <Check size={16} aria-hidden="true" color="#1a6b4a" />
                  ) : (
                    <Link2 size={16} aria-hidden="true" />
                  )}
                </button>
              </div>

              {/* Primary Paragraphs */}
              {sec.paragraphs?.map((p, idx) => (
                <p key={`p-${idx}`} className="terms-paragraph">
                  {p}
                </p>
              ))}

              {/* Definitions in Section 2 */}
              {sec.definitions && (
                <div className="terms-definitions-container">
                  {sec.definitions.map((def) => (
                    <div key={def.num} className="terms-def-item">
                      <div className="terms-def-term">
                        <strong>{def.num} {def.term}</strong>
                      </div>
                      <p className="terms-def-desc">{def.definition}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Primary List (alpha or decimal) */}
              {sec.listItems && (
                <ol className={sec.listType === 'decimal' ? 'terms-list-decimal' : 'terms-list-alpha'}>
                  {sec.listItems.map((item, idx) => (
                    <li key={`item-${idx}`}>{item}</li>
                  ))}
                </ol>
              )}

              {/* Secondary Paragraphs */}
              {sec.secondaryParagraphs?.map((p, idx) => (
                <p key={`sp-${idx}`} className="terms-paragraph">
                  {p}
                </p>
              ))}

              {/* Secondary List */}
              {sec.secondaryListItems && (
                <ol className={sec.secondaryListType === 'decimal' ? 'terms-list-decimal' : 'terms-list-alpha'}>
                  {sec.secondaryListItems.map((item, idx) => (
                    <li key={`sitem-${idx}`}>{item}</li>
                  ))}
                </ol>
              )}

              {/* Tertiary Paragraphs */}
              {sec.tertiaryParagraphs?.map((p, idx) => (
                <p key={`tp-${idx}`} className="terms-paragraph">
                  {p}
                </p>
              ))}

              {/* Section 37 Contact Card */}
              {sec.contactCard && (
                <div className="terms-contact-card">
                  <div className="terms-contact-company">{sec.contactCard.company}</div>
                  <div className="terms-contact-line">
                    <strong>Registered Office:</strong>
                    <span>{sec.contactCard.registeredOffice}</span>
                  </div>
                  <div className="terms-contact-line">
                    <strong>General Email:</strong>
                    <a href={`mailto:${sec.contactCard.generalEmail}`}>
                      {sec.contactCard.generalEmail}
                    </a>
                  </div>
                  <div className="terms-contact-line">
                    <strong>Security Email:</strong>
                    <a href={`mailto:${sec.contactCard.securityEmail}`}>
                      {sec.contactCard.securityEmail}
                    </a>
                  </div>
                </div>
              )}

              {/* Section 38 Prominent Acknowledgement Callout */}
              {sec.calloutText && (
                <div className="terms-callout" role="note">
                  {sec.calloutText.map((text, idx) => (
                    <p key={`callout-${idx}`} className="terms-callout-text">
                      {text}
                    </p>
                  ))}
                </div>
              )}
            </section>
          ))}
        </main>
      </div>

      {/* 3. Floating Back-to-Top Button */}
      {showBackToTop && (
        <button
          type="button"
          className="terms-back-to-top"
          onClick={handleScrollToTop}
          aria-label="Scroll back to top of document"
          title="Back to top"
        >
          <ArrowUp size={20} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

export default TermsAndConditionsPage
