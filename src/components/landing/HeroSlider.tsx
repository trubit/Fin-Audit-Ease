import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  CalendarCheck2,
  FileQuestion,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  History,
  ArrowRight,
  ShieldCheck,
  Clock,
  UserCheck,
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import './HeroSlider.css'

interface SlideData {
  id: string
  tagKey: string
  titleKey: string
  descKey: string
  visualType: 'prepare' | 'requests' | 'documents' | 'review' | 'trail'
}

const SLIDES: SlideData[] = [
  {
    id: 'slide-prepare',
    tagKey: 'landing.slider.slide1Tag',
    titleKey: 'landing.slider.slide1Title',
    descKey: 'landing.slider.slide1Desc',
    visualType: 'prepare',
  },
  {
    id: 'slide-requests',
    tagKey: 'landing.slider.slide2Tag',
    titleKey: 'landing.slider.slide2Title',
    descKey: 'landing.slider.slide2Desc',
    visualType: 'requests',
  },
  {
    id: 'slide-documents',
    tagKey: 'landing.slider.slide3Tag',
    titleKey: 'landing.slider.slide3Title',
    descKey: 'landing.slider.slide3Desc',
    visualType: 'documents',
  },
  {
    id: 'slide-review',
    tagKey: 'landing.slider.slide4Tag',
    titleKey: 'landing.slider.slide4Title',
    descKey: 'landing.slider.slide4Desc',
    visualType: 'review',
  },
  {
    id: 'slide-trail',
    tagKey: 'landing.slider.slide5Tag',
    titleKey: 'landing.slider.slide5Title',
    descKey: 'landing.slider.slide5Desc',
    visualType: 'trail',
  },
]

export const HeroSlider: React.FC = () => {
  const { t } = useLanguage()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  const totalSlides = SLIDES.length

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }, [totalSlides])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
  }, [])

  // Auto-advance every 5.5 seconds unless paused or reduced motion is preferred
  useEffect(() => {
    if (isPaused) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const interval = setInterval(nextSlide, 5500)
    return () => clearInterval(interval)
  }, [isPaused, nextSlide])

  // Keyboard navigation when slider container is focused
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      prevSlide()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      nextSlide()
    }
  }

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide()
      } else {
        prevSlide()
      }
    }
    touchStartX.current = null
  }

  const activeSlide = SLIDES[currentSlide]

  return (
    <div
      ref={sliderRef}
      className="hero-slider"
      role="region"
      aria-roledescription="carousel"
      aria-label="FinAuditEase Core Story Slides"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="hero-slider-inner">
        {/* Left Side: Editorial Story Typography */}
        <div className="hero-slider-content" aria-live="polite">
          <div className="hero-slider-badge">
            <span className="hero-slider-badge-dot" />
            <span>{t(activeSlide.tagKey)}</span>
          </div>

          <h3 className="hero-slider-title">{t(activeSlide.titleKey)}</h3>

          <p className="hero-slider-desc">{t(activeSlide.descKey)}</p>

          {/* Slide Navigation Controls */}
          <div className="hero-slider-controls">
            <div className="hero-slider-arrows">
              <button
                type="button"
                className="hero-slider-btn prev"
                onClick={prevSlide}
                aria-label={t('landing.slider.prevSlide')}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="hero-slider-btn next"
                onClick={nextSlide}
                aria-label={t('landing.slider.nextSlide')}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Pagination Indicators */}
            <div className="hero-slider-indicators" role="tablist" aria-label="Slider navigation dots">
              {SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  className={`hero-slider-dot ${idx === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(idx)}
                  aria-selected={idx === currentSlide}
                  aria-label={t('landing.slider.goToSlide', { number: idx + 1 })}
                >
                  <span className="sr-only">Slide {idx + 1}</span>
                </button>
              ))}
            </div>

            <span className="hero-slider-counter" aria-hidden="true">
              0{currentSlide + 1} / 0{totalSlides}
            </span>
          </div>
        </div>

        {/* Right Side: Purposeful Story Visual Diagrams (Zero Human Photography) */}
        <div className="hero-slider-visual-wrapper">
          {activeSlide.visualType === 'prepare' && (
            <div className="hero-visual-card prepare-visual" aria-hidden="true">
              <div className="visual-header">
                <div className="visual-header-left">
                  <CalendarCheck2 size={18} className="visual-icon-green" />
                  <span className="visual-title">Continuous Preparation Runway</span>
                </div>
                <span className="visual-pill green">Weekly to Pre-Audit</span>
              </div>
              <div className="visual-timeline-steps">
                <div className="timeline-item done">
                  <div className="t-icon done"><CheckCircle2 size={14} /></div>
                  <div className="t-text">
                    <strong>Weekly Checkpoints</strong>
                    <span>Transactions, postings &amp; cash balances verified</span>
                  </div>
                </div>
                <div className="timeline-item done">
                  <div className="t-icon done"><CheckCircle2 size={14} /></div>
                  <div className="t-text">
                    <strong>Month-End Closing</strong>
                    <span>Reconciliations &amp; statutory schedules signed off</span>
                  </div>
                </div>
                <div className="timeline-item current">
                  <div className="t-icon active"><Clock size={14} /></div>
                  <div className="t-text">
                    <strong>Pre-Audit Preparation</strong>
                    <span>Lead schedules &amp; evidentiary vault 6 months prior</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSlide.visualType === 'requests' && (
            <div className="hero-visual-card request-visual" aria-hidden="true">
              <div className="visual-header">
                <div className="visual-header-left">
                  <FileQuestion size={18} className="visual-icon-green" />
                  <span className="visual-title">Request #REQ-042</span>
                </div>
                <span className="visual-pill priority">High Priority</span>
              </div>
              <div className="request-body">
                <h4 className="req-heading">Fixed Asset Register & Additions Schedule</h4>
                <div className="req-meta-row">
                  <span className="meta-chip"><UserCheck size={13} /> Amina Bello (Accounting Team)</span>
                  <span className="meta-chip"><Clock size={13} /> Due in 3 days</span>
                </div>
                <div className="req-status-progression">
                  <span className="prog-step passed">Pending</span>
                  <span className="prog-arrow">→</span>
                  <span className="prog-step passed">Responded</span>
                  <span className="prog-arrow">→</span>
                  <span className="prog-step active">Under Review</span>
                  <span className="prog-arrow">→</span>
                  <span className="prog-step">Approved</span>
                </div>
              </div>
            </div>
          )}

          {activeSlide.visualType === 'documents' && (
            <div className="hero-visual-card doc-visual" aria-hidden="true">
              <div className="visual-header">
                <div className="visual-header-left">
                  <FileSpreadsheet size={18} className="visual-icon-green" />
                  <span className="visual-title">Direct Document Vault</span>
                </div>
                <span className="visual-pill green">25MB Max</span>
              </div>
              <div className="doc-item-row">
                <div className="doc-icon-box"><FileSpreadsheet size={20} /></div>
                <div className="doc-details">
                  <span className="doc-name">Fixed_Assets_Ledger_2024.xlsx</span>
                  <span className="doc-sub">3.8 MB · Uploaded by Accounting Team</span>
                </div>
                <span className="doc-badge">Anchored</span>
              </div>
              <div className="doc-context-note">
                <strong>Accounting Team Note:</strong> Depreciation recalculated per Section 14 statutory guidelines. Supporting vendor invoices attached in Appendix B.
              </div>
            </div>
          )}

          {activeSlide.visualType === 'review' && (
            <div className="hero-visual-card review-visual" aria-hidden="true">
              <div className="visual-header">
                <div className="visual-header-left">
                  <ShieldCheck size={18} className="visual-icon-green" />
                  <span className="visual-title">Audit Checklist and Supporting Documents</span>
                </div>
                <span className="visual-pill blue">Audit Inspection</span>
              </div>
              <div className="decision-split">
                <div className="decision-card approve">
                  <div className="dec-icon green"><CheckCircle2 size={16} /></div>
                  <div className="dec-text">
                    <strong>Audit Checklist and Supporting Documents — Approved</strong>
                    <span>Document meets compliance requirements</span>
                  </div>
                </div>
                <div className="decision-card reject">
                  <div className="dec-icon red"><XCircle size={16} /></div>
                  <div className="dec-text">
                    <strong>Not Approved with Reason</strong>
                    <span>"Bank stamp missing on page 2. Please re-upload."</span>
                  </div>
                </div>
              </div>
              <div className="resubmit-notice">
                <ArrowRight size={14} /> Returned to Accounting Team queue for response
              </div>
            </div>
          )}

          {activeSlide.visualType === 'trail' && (
            <div className="hero-visual-card trail-visual" aria-hidden="true">
              <div className="visual-header">
                <div className="visual-header-left">
                  <History size={18} className="visual-icon-green" />
                  <span className="visual-title">Permanent Engagement Record</span>
                </div>
                <span className="visual-pill green">Permanent Trail</span>
              </div>
              <div className="trail-timeline">
                <div className="trail-node">
                  <span className="trail-dot green" />
                  <div className="trail-info">
                    <strong>Fiscal Year 2024 Engagement Finalized</strong>
                    <span>All 64 requests approved and archived</span>
                  </div>
                </div>
                <div className="trail-node">
                  <span className="trail-dot blue" />
                  <div className="trail-info">
                    <strong>Multi-Year History Retained</strong>
                    <span>Available for subsequent year audit benchmarking</span>
                  </div>
                </div>
                <div className="trail-node">
                  <span className="trail-dot dark" />
                  <div className="trail-info">
                    <strong>Tamper-Evident Chronology</strong>
                    <span>Complete timestamps & user accountability</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
