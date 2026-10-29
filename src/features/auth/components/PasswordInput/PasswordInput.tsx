import { forwardRef, useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './PasswordInput.css'

export interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly hasError?: boolean
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ hasError, className = '', onKeyDown, onKeyUp, onBlur, ...props }, ref) => {
    const { t } = useTranslation()
    const [showPassword, setShowPassword] = useState(false)
    const [capsLockActive, setCapsLockActive] = useState(false)

    const handleKeyChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
      setCapsLockActive(e.getModifierState('CapsLock'))
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setCapsLockActive(false)
      if (onBlur) onBlur(e)
    }

    return (
      <div className="password-input-container">
        <div className="password-input-wrapper">
          <input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={`password-input-field ${hasError ? 'input-error' : ''} ${className}`}
            onKeyDown={(e) => {
              handleKeyChange(e)
              if (onKeyDown) onKeyDown(e)
            }}
            onKeyUp={(e) => {
              handleKeyChange(e)
              if (onKeyUp) onKeyUp(e)
            }}
            onBlur={handleBlur}
            {...props}
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? t('authentication.hidePassword') : t('authentication.showPassword')}
            tabIndex={0}
          >
            {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        </div>
        {capsLockActive && (
          <div className="password-caps-lock-warning" role="status" aria-live="polite">
            <AlertTriangle size={12} aria-hidden="true" />
            <span>{t('authentication.capsLockWarning')}</span>
          </div>
        )}
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'
