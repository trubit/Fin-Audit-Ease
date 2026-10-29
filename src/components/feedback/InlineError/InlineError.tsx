import React from 'react'
import { AlertCircle } from 'lucide-react'
import './InlineError.css'

export interface InlineErrorProps {
  readonly message?: string
  readonly id?: string
  readonly className?: string
}

export const InlineError: React.FC<InlineErrorProps> = ({ message, id, className = '' }) => {
  if (!message) return null

  return (
    <div id={id} className={`inline-error-container ${className}`} role="alert">
      <AlertCircle size={14} className="inline-error-icon" aria-hidden="true" />
      <span className="inline-error-text">{message}</span>
    </div>
  )
}
