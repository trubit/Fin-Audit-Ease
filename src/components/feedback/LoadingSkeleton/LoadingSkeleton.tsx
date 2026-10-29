import React from 'react'
import './LoadingSkeleton.css'

export interface LoadingSkeletonProps {
  readonly width?: string | number
  readonly height?: string | number
  readonly borderRadius?: string | number
  readonly count?: number
  readonly className?: string
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-md)',
  count = 1,
  className = '',
}) => {
  const items = Array.from({ length: count }, (_, i) => i)

  return (
    <div className={`skeleton-container ${className}`} aria-busy="true" aria-live="polite">
      {items.map((key) => (
        <div
          key={key}
          className="skeleton-pulse"
          style={{
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height,
            borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
          }}
        />
      ))}
    </div>
  )
}
