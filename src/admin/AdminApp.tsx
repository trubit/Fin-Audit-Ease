import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { adminRoutes } from './router/adminRoutes'
import { AppProviders } from '@/app/providers/AppProviders'

const router = createBrowserRouter(adminRoutes)

export const AdminApp: React.FC = () => {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
}

export default AdminApp

