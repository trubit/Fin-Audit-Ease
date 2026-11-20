import React from 'react'
import { Outlet } from 'react-router-dom'
import { AdminHeader } from '@/components/layout/AdminHeader/AdminHeader'
import { AdminSidebar } from '@/components/layout/AdminSidebar/AdminSidebar'
import { DevRoleSwitcher } from '@/features/dev-auth/components/DevRoleSwitcher/DevRoleSwitcher'
import { isDevAuthEnabled } from '@/features/dev-auth/utils/isDevAuthEnabled'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary/ErrorBoundary'

export const AdminLayout: React.FC = () => {
  return (
    <div
      className="admin-layout-shell"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-body, "Plus Jakarta Sans", sans-serif)',
      }}
    >
      <AdminHeader />
      {isDevAuthEnabled() && (
        <ErrorBoundary fallback={null}>
          <DevRoleSwitcher />
        </ErrorBoundary>
      )}
      <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 4.25rem)' }}>
        <AdminSidebar />
        <main
          id="main-content"
          role="main"
          style={{
            flex: 1,
            backgroundColor: 'var(--bg-app, #fafaf7)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'var(--font-body, "Plus Jakarta Sans", sans-serif)',
          }}
        >
          <div style={{ flex: 1, paddingBottom: 'var(--spacing-12, 48px)' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

