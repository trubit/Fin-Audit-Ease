import React from 'react'
import './Spinner.css'

export interface SpinnerProps {
  readonly size?: 'sm' | 'md' | 'lg'
  readonly color?: 'primary' | 'white' | 'muted'
  readonly className?: string
  readonly label?: string
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  label = 'Loading',
}) => {
  return (
    <div
      role="status"
      aria-label={label}
      className={`app-spinner app-spinner--${size} app-spinner--${color} ${className}`}
    >
      <span className="sr-only">{label}</span>
    </div>
  )
}
