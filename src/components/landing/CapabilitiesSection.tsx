import React, { useState } from 'react'
import {
  CalendarCheck,
  FolderKanban,
  UploadCloud,
  FileCheck2,
  History,
  Check,
  ArrowRight
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import './CapabilitiesSection.css'

export const CapabilitiesSection: React.FC = () => {
  const { t } = useLanguage()
  const [activeCluster, setActiveCluster] = useState<number>(0)

  const clusters = [
    {
      id: 'prepare',
      title: t('landing.capabilities.prepareTitle'),
      subtitle: t('landing.capabilities.prepareSubtitle'),
      icon: CalendarCheck,
      color: 'green',
      items: [
        t('landing.capabilities.prepareItem1'),
        t('landing.capabilities.prepareItem2'),
        t('landing.capabilities.prepareItem3'),
      ],
      tag: 'Continuous Readiness',
      summary: 'Eliminate end-of-year rush by maintaining structured monthly closes and verified pre-audit checklists 6 months ahead.',
    },
    {
      id: 'organize',
      title: t('landing.capabilities.organizeTitle'),
      subtitle: t('landing.capabilities.organizeSubtitle'),
      icon: FolderKanban,
      color: 'dark',
      items: [
        t('landing.capabilities.organizeItem1'),
        t('landing.capabilities.organizeItem2'),
        t('landing.capabilities.organizeItem3'),
      ],
      tag: 'Engagement Clarity',
      summary: 'Centralize audit engagements, assign requests directly to specific accounting team members, and track strict deadlines.',
    },
    {
      id: 'respond',
      title: t('landing.capabilities.respondTitle'),
      subtitle: t('landing.capabilities.respondSubtitle'),
      icon: UploadCloud,
      color: 'green',
      items: [
        t('landing.capabilities.respondItem1'),
        t('landing.capabilities.respondItem2'),
        t('landing.capabilities.respondItem3'),
      ],
      tag: 'Direct Document Flow',
      summary: 'Upload evidence (up to 25MB) directly anchored to each audit request with clarifying comments and clean re-submission loops.',
    },
    {
      id: 'review',
      title: t('landing.capabilities.reviewTitle'),
      subtitle: t('landing.capabilities.reviewSubtitle'),
      icon: FileCheck2,
      color: 'dark',
      items: [
        t('landing.capabilities.reviewItem1'),
        t('landing.capabilities.reviewItem2'),
        t('landing.capabilities.reviewItem3'),
      ],
      tag: 'Transparent Decisions',
      summary: 'Auditors inspect submitted files, record approval decisions, and provide explicit written reasons when documentation needs revision.',
    },
    {
      id: 'remember',
      title: t('landing.capabilities.rememberTitle'),
      subtitle: t('landing.capabilities.rememberSubtitle'),
      icon: History,
      color: 'green',
      items: [
        t('landing.capabilities.rememberItem1'),
        t('landing.capabilities.rememberItem2'),
        t('landing.capabilities.rememberItem3'),
      ],
      tag: 'Audit Trail & Alerts',
      summary: 'Keep the complete audit history accessible forever. Approvals, rejections, timestamps, and notifications remain unalterable.',
    },
  ]

  return (
    <section id="capabilities" className="landing-cap-section" aria-labelledby="capabilities-heading">
      <div className="landing-cap-container">
        {/* Section Header */}
        <div className="landing-section-header reveal-on-scroll">
          <div className="landing-section-pill">
            <span>{t('landing.capabilities.eyebrow')}</span>
          </div>
          <h2 id="capabilities-heading" className="landing-section-title">
            {t('landing.capabilities.heading')}
          </h2>
          <p className="landing-section-subtitle">
            {t('landing.capabilities.subtitle')}
          </p>
        </div>

        {/* 5 Thematic Clusters Grid */}
        <div className="cap-clusters-grid" role="tablist" aria-label="Product Capabilities">
          {clusters.map((cluster, idx) => {
            const Icon = cluster.icon
            const isSelected = activeCluster === idx

            return (
              <button
                key={cluster.id}
                type="button"
                role="tab"
                className={`cap-cluster-card ${isSelected ? 'active' : ''} reveal-on-scroll reveal-delay-${idx + 1}`}
                onClick={() => setActiveCluster(idx)}
                aria-selected={isSelected}
                aria-controls={`cap-panel-${cluster.id}`}
                id={`cap-tab-${cluster.id}`}
              >
                <div className="cluster-card-top">
                  <div className={`cluster-icon-box ${cluster.color}`}>
                    <Icon size={20} />
                  </div>
                  <span className="cluster-tag">{cluster.tag}</span>
                </div>

                <h3 className="cluster-title">{cluster.title}</h3>
                <span className="cluster-subtitle">{cluster.subtitle}</span>

                <ul className="cluster-bullets">
                  {cluster.items.map((item, itemIdx) => (
                    <li key={itemIdx}>
                      <Check size={14} className="cluster-bullet-check" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>

        {/* Dynamic Detail Card */}
        <div
          id={`cap-panel-${clusters[activeCluster].id}`}
          role="tabpanel"
          aria-labelledby={`cap-tab-${clusters[activeCluster].id}`}
          className="cap-detail-banner reveal-on-scroll reveal-delay-2"
        >
          <div className="cap-detail-content">
            <div className="cap-detail-header">
              <span className="cap-detail-pill">{clusters[activeCluster].tag}</span>
              <h4 className="cap-detail-title">
                {clusters[activeCluster].title}: {clusters[activeCluster].subtitle}
              </h4>
            </div>
            <p className="cap-detail-desc">{clusters[activeCluster].summary}</p>
          </div>

          <div className="cap-detail-action">
            <a href="#how-it-works" className="cap-learn-more-link">
              <span>See workflow in action</span>
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
