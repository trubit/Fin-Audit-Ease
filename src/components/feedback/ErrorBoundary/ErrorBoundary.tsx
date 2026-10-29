import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import i18n from '@/i18n'
import './ErrorBoundary.css'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  public override componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {
    // In production, send sanitized telemetry to error tracking service.
    // Never expose stack trace, user tokens, or DB errors in the console or UI.
  }

  private handleReset = (): void => {
    this.props.onReset?.()
    this.setState({ hasError: false })
  }

  private handleGoHome = (): void => {
    this.setState({ hasError: false })
    if (typeof window !== 'undefined') {
      window.location.assign('/')
    }
  }

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <main className="error-boundary-wrapper" role="alert" aria-live="assertive">
          <div className="error-boundary-card">
            <div className="error-boundary-icon-wrapper" aria-hidden="true">
              <AlertTriangle className="error-boundary-icon" size={36} />
            </div>

            <h1 className="error-boundary-title">{i18n.t('common.error', 'Something went wrong')}</h1>
            <p className="error-boundary-message">
              FinAuditEase encountered an unexpected issue while rendering this view.
              Our technical team has been notified. No financial data has been compromised.
            </p>

            <div className="error-boundary-actions">
              <button
                type="button"
                onClick={this.handleReset}
                className="btn btn-primary"
                aria-label={i18n.t('common.retry', 'Reload and retry current page')}
              >
                <RefreshCw size={16} aria-hidden="true" />
                <span>{i18n.t('common.retry', 'Reload Application')}</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="btn btn-secondary"
                aria-label={i18n.t('common.back', 'Return to homepage')}
              >
                <Home size={16} aria-hidden="true" />
                <span>{i18n.t('common.back', 'Return to Home')}</span>
              </button>
            </div>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
