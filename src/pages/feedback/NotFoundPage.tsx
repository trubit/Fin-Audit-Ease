import React from 'react'
import { Link } from 'react-router-dom'
import { FileQuestion, Home } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { useTranslation } from 'react-i18next'

export const NotFoundPage: React.FC = () => {
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
        role="region"
        aria-label="404 Not Found"
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '4rem',
            height: '4rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-slate-100)',
            color: 'var(--color-slate-600)',
            marginBottom: 'var(--spacing-4)',
          }}
          aria-hidden="true"
        >
          <FileQuestion size={36} />
        </div>

        <h1 style={{ fontSize: 'var(--font-size-3xl)', color: 'var(--color-slate-900)', marginBottom: 'var(--spacing-2)' }}>
          404 — {t('errors.notFound')}
        </h1>

        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', maxWidth: '28rem', marginBottom: 'var(--spacing-6)' }}>
          {t('errors.notFoundMessage')}
        </p>

        <Link to="/" className="btn btn-primary">
          <Home size={16} aria-hidden="true" />
          <span>{t('navigation.home')}</span>
        </Link>
      </div>
    </PageContainer>
  )
}
