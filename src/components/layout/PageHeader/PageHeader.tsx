import React, { type ReactNode } from 'react'
import { Breadcrumbs, type BreadcrumbItem } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import './PageHeader.css'

export interface PageHeaderProps {
  readonly title: ReactNode
  readonly subtitle?: ReactNode
  readonly badge?: ReactNode
  readonly actions?: ReactNode
  readonly breadcrumbs?: readonly BreadcrumbItem[]
  readonly className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
  breadcrumbs,
  className = '',
}) => {
  return (
    <header className={`page-header-root ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="page-header-breadcrumbs">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}

      <div className="page-header-main">
        <div className="page-header-titles">
          <div className="page-header-title-row">
            <h1 className="page-header-title">{title}</h1>
            {badge && <div className="page-header-badge">{badge}</div>}
          </div>
          {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>

        {actions && <div className="page-header-actions">{actions}</div>}
      </div>
    </header>
  )
}
