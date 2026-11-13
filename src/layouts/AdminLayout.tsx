import React from 'react'
import { Outlet } from 'react-router-dom'
import { AppHeader } from '@/components/layout/AppHeader/AppHeader'
import { AdminSidebar } from '@/components/layout/AdminSidebar/AdminSidebar'
import { DevRoleSwitcher } from '@/features/dev-auth/components/DevRoleSwitcher/DevRoleSwitcher'
import { isDevAuthEnabled } from '@/features/dev-auth/utils/isDevAuthEnabled'

export const AdminLayout: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader isAppView={true} />
      {isDevAuthEnabled() && <DevRoleSwitcher />}
      <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 4rem)' }}>
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

