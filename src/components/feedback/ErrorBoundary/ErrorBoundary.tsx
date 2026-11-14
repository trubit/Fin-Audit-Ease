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
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[FinAuditEase ErrorBoundary]: Uncaught component rendering error', error, errorInfo)
  }

  private handleReset = (): void => {
    this.props.onReset?.()
    this.setState({ hasError: false, error: null })
  }

  private handleGoHome = (): void => {
    this.setState({ hasError: false, error: null })
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

            {import.meta.env.DEV && this.state.error && (
              <details
                style={{
                  textAlign: 'left',
                  margin: 'var(--spacing-4, 16px) 0',
                  padding: 'var(--spacing-3, 12px)',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #f87171',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#991b1b',
                  overflowX: 'auto',
                }}
              >
                <summary style={{ fontWeight: 600, cursor: 'pointer' }}>
                  Developer Diagnostics: {this.state.error.message}
                </summary>
                <pre style={{ marginTop: '8px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {this.state.error.stack}
                </pre>
              </details>
            )}

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
