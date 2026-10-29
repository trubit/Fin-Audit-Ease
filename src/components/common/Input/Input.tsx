import { forwardRef, type InputHTMLAttributes } from 'react'
import { InlineError } from '@/components/feedback/InlineError/InlineError'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label?: string
  readonly error?: string
  readonly helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, className = '', ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    const errorId = inputId && error ? `${inputId}-error` : undefined
    const helperId = inputId && helperText ? `${inputId}-helper` : undefined

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)', width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: 'var(--font-size-xs)',
              fontWeight: 500,
              color: 'var(--color-slate-700)',
            }}
          >
            {label}
            {props.required && <span style={{ color: 'var(--color-danger-600)', marginLeft: '2px' }}>*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
          className={`input ${error ? 'input-error' : ''} ${className}`}
          {...props}
        />
        {helperText && !error && (
          <span id={helperId} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            {helperText}
          </span>
        )}
        {error && <InlineError id={errorId} message={error} />}
      </div>
    )
  }
)

Input.displayName = 'Input'
