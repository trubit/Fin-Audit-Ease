import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/global.css'
import { AdminApp } from '@/admin/AdminApp'

const container = document.getElementById('admin-root')

if (!container) {
  throw new Error('Fatal: Failed to locate admin-root element in DOM.')
}

createRoot(container).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>
)

