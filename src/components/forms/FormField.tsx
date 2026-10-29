import React, { type ReactNode } from 'react'
import { InlineError } from '@/components/feedback/InlineError/InlineError'

export interface FormFieldProps {
  readonly label?: string
  readonly htmlFor?: string
  readonly required?: boolean
  readonly error?: string
  readonly helperText?: string
  readonly children: ReactNode
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required,
  error,
  helperText,
  children,
}) => {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)', width: '100%' }}>
      {label && (
        <label
          htmlFor={htmlFor}
          style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: 500,
            color: 'var(--color-slate-700)',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--color-danger-600)', marginLeft: '2px' }}>*</span>}
        </label>
      )}
      {children}
      {helperText && !error && (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
          {helperText}
        </span>
      )}
      {error && <InlineError id={errorId} message={error} />}
    </div>
  )
}
