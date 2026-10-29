import React from 'react'
import { Check, X } from 'lucide-react'
import './PasswordRequirements.css'

export interface PasswordRequirementsProps {
  readonly password?: string
  readonly title?: string
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password = '',
  title = 'Password Requirements:',
}) => {
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSymbol = /[^A-Za-z0-9]/.test(password)

  const requirements = [
    { label: 'Minimum 8 characters', met: hasMinLength },
    { label: 'At least one uppercase letter (A-Z)', met: hasUppercase },
    { label: 'At least one number (0-9)', met: hasNumber },
    { label: 'At least one symbol (e.g. !@#$%)', met: hasSymbol },
  ]

  return (
    <div className="password-requirements-box" aria-live="polite">
      <span className="password-requirements-title">{title}</span>
      <ul className="password-requirements-list" role="list">
        {requirements.map((req) => (
          <li
            key={req.label}
            className={`password-requirement-item ${req.met ? 'is-met' : 'is-unmet'}`}
            role="listitem"
          >
            <span className="requirement-icon-wrap" aria-hidden="true">
              {req.met ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={2.5} />}
            </span>
            <span className="requirement-label">{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
