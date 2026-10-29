import React, { type ReactNode } from 'react'
import { AlertTriangle, AlertCircle, Clock, CheckCircle2 } from 'lucide-react'
import './AttentionCard.css'

export interface AttentionCardProps {
  readonly variant?: 'danger' | 'warning' | 'info' | 'success'
  readonly title: ReactNode
  readonly description?: ReactNode
  readonly badge?: ReactNode
  readonly meta?: ReactNode
  readonly action?: ReactNode
  readonly icon?: ReactNode
  readonly className?: string
}

export const AttentionCard: React.FC<AttentionCardProps> = ({
  variant = 'warning',
  title,
  description,
  badge,
  meta,
  action,
  icon,
  className = '',
}) => {
  const getDefaultIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertCircle size={20} aria-hidden="true" />
      case 'warning':
        return <AlertTriangle size={20} aria-hidden="true" />
      case 'info':
        return <Clock size={20} aria-hidden="true" />
      case 'success':
        return <CheckCircle2 size={20} aria-hidden="true" />
    }
  }

  return (
    <article
      className={`attention-card attention-card-${variant} ${className}`}
      role="region"
      aria-label={typeof title === 'string' ? title : undefined}
    >
      <div className="attention-card-icon" aria-hidden="true">
        {icon || getDefaultIcon()}
      </div>

      <div className="attention-card-body">
        <div className="attention-card-header">
          <div className="attention-card-title-group">
            <h3 className="attention-card-title">{title}</h3>
            {badge && <div className="attention-card-badge">{badge}</div>}
          </div>
        </div>

        {description && <div className="attention-card-desc">{description}</div>}
        {meta && <div className="attention-card-meta">{meta}</div>}
      </div>

      {action && <div className="attention-card-action">{action}</div>}
    </article>
  )
}
