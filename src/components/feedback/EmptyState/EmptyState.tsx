import React, { type ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import './EmptyState.css'

export interface EmptyStateProps {
  readonly title: string
  readonly description?: string
  readonly icon?: ReactNode
  readonly action?: ReactNode
  readonly className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  return (
    <div className={`empty-state-card ${className}`} role="region" aria-label={title}>
      <div className="empty-state-icon" aria-hidden="true">
        {icon || <Inbox size={36} />}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-desc">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  )
}
