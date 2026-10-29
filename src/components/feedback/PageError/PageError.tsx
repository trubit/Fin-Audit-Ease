import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './PageError.css'

export interface PageErrorProps {
  readonly title?: string
  readonly message?: string
  readonly onRetry?: () => void
  readonly className?: string
}

export const PageError: React.FC<PageErrorProps> = ({
  title = 'Unable to Load Data',
  message = 'An error occurred while fetching information from the service. Please try again.',
  onRetry,
  className = '',
}) => {
  const { t } = useTranslation()

  return (
    <div className={`page-error-card ${className}`} role="alert" aria-live="polite">
      <div className="page-error-icon" aria-hidden="true">
        <AlertCircle size={32} />
      </div>
      <h3 className="page-error-title">{title}</h3>
      <p className="page-error-message">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn btn-secondary btn-sm"
          aria-label={t('common.tryAgain', 'Retry loading data')}
        >
          <RefreshCw size={14} aria-hidden="true" />
          <span>{t('common.tryAgain', 'Try Again')}</span>
        </button>
      )}
    </div>
  )
}
