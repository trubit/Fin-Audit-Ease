import React, { type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import './AuthAlert.css'

export type AuthAlertVariant = 'error' | 'success' | 'warning' | 'info'

export interface AuthAlertProps {
  readonly variant: AuthAlertVariant
  readonly message?: string
  readonly children?: ReactNode
  readonly id?: string
}

export const AuthAlert: React.FC<AuthAlertProps> = ({ variant, message, children, id }) => {
  if (!message && !children) return null

  const icons: Record<AuthAlertVariant, React.ComponentType<{ size: number; className?: string }>> = {
    error: AlertCircle,
    success: CheckCircle2,
    warning: AlertTriangle,
    info: Info,
  }

  const IconComponent = icons[variant]

  return (
    <div id={id} className={`auth-alert auth-alert-${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
      <IconComponent size={18} className="auth-alert-icon" />
      <div className="auth-alert-content">
        {message && <p style={{ margin: 0 }}>{message}</p>}
        {children}
      </div>
    </div>
  )
}
