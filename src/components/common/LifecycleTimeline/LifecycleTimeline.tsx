import React from 'react'
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react'
import './LifecycleTimeline.css'

export interface LifecycleStep {
  readonly id: string
  readonly label: string
  readonly detail?: string
  readonly isCompleted: boolean
  readonly isActive: boolean
  readonly isRejected?: boolean
}

export interface LifecycleTimelineProps {
  readonly steps: readonly LifecycleStep[]
  readonly className?: string
}

export const LifecycleTimeline: React.FC<LifecycleTimelineProps> = ({
  steps,
  className = '',
}) => {
  return (
    <nav className={`lifecycle-timeline-root ${className}`} aria-label="Workflow progress lifecycle">
      <ol className="lifecycle-timeline-list">
        {steps.map((step, idx) => {
          let stateClass = 'state-pending'
          if (step.isRejected) {
            stateClass = 'state-rejected'
          } else if (step.isCompleted) {
            stateClass = 'state-completed'
          } else if (step.isActive) {
            stateClass = 'state-active'
          }

          return (
            <li key={step.id} className={`lifecycle-timeline-item ${stateClass}`}>
              {idx > 0 && <div className="lifecycle-timeline-connector" aria-hidden="true" />}

              <div className="lifecycle-timeline-node">
                <div className="lifecycle-timeline-icon" aria-hidden="true">
                  {step.isRejected ? (
                    <AlertCircle size={16} />
                  ) : step.isCompleted ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <Circle size={14} />
                  )}
                </div>

                <div className="lifecycle-timeline-content">
                  <span className="lifecycle-timeline-label">{step.label}</span>
                  {step.detail && <span className="lifecycle-timeline-detail">{step.detail}</span>}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
