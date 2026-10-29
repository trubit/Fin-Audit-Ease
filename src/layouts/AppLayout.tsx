import React from 'react'
import { Outlet } from 'react-router-dom'
import { AppHeader } from '@/components/layout/AppHeader/AppHeader'
import { AppSidebar } from '@/components/layout/AppSidebar/AppSidebar'
import { DevRoleSwitcher } from '@/features/dev-auth/components/DevRoleSwitcher/DevRoleSwitcher'
import { isDevAuthEnabled } from '@/features/dev-auth/utils/isDevAuthEnabled'

export const AppLayout: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader isAppView={true} />
      {isDevAuthEnabled() && <DevRoleSwitcher />}
      <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 4rem)' }}>
        <AppSidebar />
        <main
          id="main-content"
          style={{
            flex: 1,
            backgroundColor: 'var(--bg-app)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ flex: 1 }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
