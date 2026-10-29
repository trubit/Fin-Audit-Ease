import React from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, Layers, CalendarCheck, FileCheck, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './PipelineFlowBanner.css'

export type PipelineStage = 'weekly' | 'month-end' | 'pre-audit' | 'audit-requests'

export interface PipelineFlowBannerProps {
  readonly currentStage: PipelineStage
  readonly onSelectStage?: (stage: PipelineStage) => void
}

export const PipelineFlowBanner: React.FC<PipelineFlowBannerProps> = ({
  currentStage,
  onSelectStage,
}) => {
  const { t } = useTranslation()

  const stages: Array<{
    id: PipelineStage
    stepNumber: string
    title: string
    subtitle: string
    icon: React.ComponentType<{ size?: number; className?: string }>
    linkTo?: string
  }> = [
    {
      id: 'weekly',
      stepNumber: '01',
      title: t('pipeline.weeklyTitle', 'Weekly Checkpoints'),
      subtitle: t('pipeline.weeklySubtitle', 'Transactions, postings & cash verified'),
      icon: CalendarClock,
      linkTo: '/checklists?tab=weekly',
    },
    {
      id: 'month-end',
      stepNumber: '02',
      title: t('pipeline.monthEndTitle', 'Month-End Close'),
      subtitle: t('pipeline.monthEndSubtitle', 'Reconciliations & statutory schedules signed off'),
      icon: Layers,
      linkTo: '/month-end',
    },
    {
      id: 'pre-audit',
      stepNumber: '03',
      title: t('pipeline.preAuditTitle', 'Pre-Audit Preparation'),
      subtitle: t('pipeline.preAuditSubtitle', 'Lead schedules & evidentiary vault 6 months prior'),
      icon: CalendarCheck,
      linkTo: '/pre-audit',
    },
    {
      id: 'audit-requests',
      stepNumber: '04',
      title: t('pipeline.auditRequestTitle', 'Audit Requests'),
      subtitle: t('pipeline.auditRequestSubtitle', 'Auditor inspection & formal evidence approval'),
      icon: FileCheck,
      linkTo: '/audit-requests',
    },
  ]

  return (
    <div className="pipeline-flow-banner" role="region" aria-label="Continuous Preparation Pipeline">
      <div className="pipeline-flow-header">
        <div className="pipeline-flow-badge">
          <span className="pipeline-pulse-dot" />
          <span>{t('pipeline.continuousFlowTitle', 'Continuous Preparation Pipeline')}</span>
        </div>
        <p className="pipeline-flow-desc">
          {t(
            'pipeline.flowDescription',
            'Weekly checkpoints make up Month-End Close, Month-End reconciliations roll into Pre-Audit Preparation, and Pre-Audit documentation forwards straight into formal Audit Requests.'
          )}
        </p>
      </div>

      <div className="pipeline-flow-track">
        {stages.map((stage, idx) => {
          const Icon = stage.icon
          const isActive = currentStage === stage.id
          const isPassed =
            (currentStage === 'month-end' && idx < 1) ||
            (currentStage === 'pre-audit' && idx < 2) ||
            (currentStage === 'audit-requests' && idx < 3)

          return (
            <React.Fragment key={stage.id}>
              <div
                className={`pipeline-stage-card ${isActive ? 'is-active' : ''} ${
                  isPassed ? 'is-passed' : ''
                }`}
                onClick={() => onSelectStage && onSelectStage(stage.id)}
              >
                <div className="pipeline-stage-top">
                  <span className="pipeline-stage-step">{stage.stepNumber}</span>
                  <div className="pipeline-stage-icon-box">
                    <Icon size={16} />
                  </div>
                </div>
                <h4 className="pipeline-stage-title">{stage.title}</h4>
                <p className="pipeline-stage-subtitle">{stage.subtitle}</p>
                {stage.linkTo && !isActive && (
                  <Link to={stage.linkTo} className="pipeline-stage-jump-btn">
                    <span>{t('common.view', 'View')}</span>
                    <ArrowRight size={12} />
                  </Link>
                )}
                {isActive && (
                  <span className="pipeline-active-indicator">
                    {t('pipeline.activeStage', 'Active Stage')}
                  </span>
                )}
              </div>
              {idx < stages.length - 1 && (
                <div className="pipeline-connector-arrow" aria-hidden="true">
                  <ArrowRight size={16} />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
