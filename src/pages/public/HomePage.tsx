import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '@/hooks/useLanguage'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import {
  HeroSection,
  ProblemSection,
  SolutionSection,
  PreparationSection,
  SixMonthPreAuditSection,
  HowItWorksSection,
  CapabilitiesSection,
  RequestSection,
  DocumentSection,
  ReviewSection,
  AuditTrailSection,
  LanguagesSection,
  SecuritySection,
  RolesSection,
  FinalCtaSection,
} from '@/components/landing'

export const HomePage: React.FC = () => {
  const { t } = useLanguage()
  const location = useLocation()

  // Initialize smooth scroll reveal observer
  useScrollReveal()

  // SEO & Document Metadata synchronization
  useEffect(() => {
    document.title = 'FinAuditEase — Powered by Sabi Africa Innovations Limited'

    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', t('landing.hero.subtitle'))
    }
  }, [t])

  // Handle smooth scroll when navigating directly with a hash or clicking in-page anchors
  useEffect(() => {
    const hash = location.hash || window.location.hash
    if (hash) {
      const sectionId = hash.replace('#', '')
      const element = document.getElementById(sectionId)
      if (element) {
        // Small delay to ensure DOM and layout calculation are ready
        const timer = setTimeout(() => {
          const headerHeight = 72
          const elementPosition = element.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.pageYOffset - headerHeight

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          })
        }, 80)
        return () => clearTimeout(timer)
      }
    }
  }, [location.hash])

  return (
    <main id="main-content" tabIndex={-1} style={{ outline: 'none' }}>
      {/* 1. Hero Section: Editorial Headline, CTAs, and Institutional Trust Bar */}
      <HeroSection />

      {/* 2. Story Section: The Problem - Why Preparation Fails Without Structure */}
      <ProblemSection />

      {/* 3. The Solution: Interactive Platform Walkthrough & Verification Console */}
      <SolutionSection />

      {/* 4. Preparation Section: Month-End and Pre-Audit Preparation Dual Workflows */}
      <PreparationSection />

      {/* 4. Pre-Audit Runway: 7-Stage Structured Preparation Runway */}
      <SixMonthPreAuditSection />

      {/* 5. How It Works Section: 6-Stage End-to-End Audit Workflow (Stable ID: how-it-works) */}
      <HowItWorksSection />

      {/* 6. Capabilities Section: 5 Thematic Clusters (Stable ID: capabilities) */}
      <CapabilitiesSection />

      {/* 7. Audit Request Section: Request Lifecycle & Rejection Path (Stable ID: requests) */}
      <RequestSection />

      {/* 8. Document Workflow Section: Request-Anchored Document Progression and Vault */}
      <DocumentSection />

      {/* 9. Review and Decision Section: Auditor Feedback Console and Decision Pathways */}
      <ReviewSection />

      {/* 10. Audit Trail Section: Permanent Engagement Event Timeline */}
      <AuditTrailSection />

      {/* 11. Multilingual Section: 5 Nigerian Languages Visual Selector */}
      <LanguagesSection />

      {/* 12. Security and Trust Section: Architectural Safeguards by Design */}
      <SecuritySection />

      {/* 13. Role Clarity Section: Auditor, Accounting Team, and Senior Oversight */}
      <RolesSection />

      {/* 14. Final Call-to-Action Section: Summary and Action Pathways */}
      <FinalCtaSection />
    </main>
  )
}
