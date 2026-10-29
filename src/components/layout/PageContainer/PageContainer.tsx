import React, { useEffect, type ReactNode } from 'react'
import { PageHeader } from '../PageHeader/PageHeader'
import './PageContainer.css'

export interface PageContainerProps {
  readonly title?: string
  readonly subtitle?: string
  readonly actions?: ReactNode
  readonly children: ReactNode
  readonly maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  readonly className?: string
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  actions,
  children,
  maxWidth = 'xl',
  className = '',
}) => {
  useEffect(() => {
    if (title) {
      document.title = `${title} — FinAuditEase`
    }
  }, [title])

  return (
    <div className={`page-container page-container-${maxWidth} ${className}`.trim()}>
      {(title || subtitle || actions) && (
        <PageHeader
          title={title}
          subtitle={subtitle}
          actions={actions}
        />
      )}

      <div className="page-container-content">{children}</div>
    </div>
  )
}

