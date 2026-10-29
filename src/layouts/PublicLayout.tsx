import React from 'react'
import { Outlet } from 'react-router-dom'
import { AppHeader } from '@/components/layout/AppHeader/AppHeader'
import { AppFooter } from '@/components/layout/AppFooter/AppFooter'

export const PublicLayout: React.FC = () => {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      <AppHeader isAppView={false} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '100%' }}>
        <Outlet />
      </div>
      <AppFooter />
    </div>
  )
}
