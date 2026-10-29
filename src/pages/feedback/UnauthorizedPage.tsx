import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { useTranslation } from 'react-i18next'

export const UnauthorizedPage: React.FC = () => {
  const { t } = useTranslation()

  return (
    <PageContainer maxWidth="md">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: 'var(--spacing-12) var(--spacing-4)',
        }}
        role="alert"
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '4rem',
            height: '4rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-danger-50)',
            color: 'var(--color-danger-600)',
            marginBottom: 'var(--spacing-4)',
          }}
          aria-hidden="true"
        >
          <ShieldAlert size={36} />
        </div>

        <h1 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-slate-900)', marginBottom: 'var(--spacing-2)' }}>
          403 — {t('errors.unauthorized')}
        </h1>

        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', maxWidth: '28rem', marginBottom: 'var(--spacing-6)' }}>
          Your current account role does not have permission to view or modify this audit resource.
          Please contact your organization audit administrator if you believe this is in error.
        </p>

        <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
          <Link to="/" className="btn btn-secondary">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>{t('navigation.home')}</span>
          </Link>
          <Link to="/login" className="btn btn-primary">
            <span>{t('navigation.login')}</span>
          </Link>
        </div>
      </div>
    </PageContainer>
  )
}
