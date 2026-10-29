import React, { type HTMLAttributes, type ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  readonly title?: string
  readonly subtitle?: string
  readonly headerAction?: ReactNode
  readonly footer?: ReactNode
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  headerAction,
  footer,
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`card ${className}`} {...props}>
      {(title || subtitle || headerAction) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-4)' }}>
          <div>
            {title && <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-slate-900)' }}>{title}</h3>}
            {subtitle && <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
      {footer && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-3)' }}>
          {footer}
        </div>
      )}
    </div>
  )
}
