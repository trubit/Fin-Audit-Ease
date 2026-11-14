import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { appRoutes } from '@/app/router/routes'
import { AppProviders } from '@/app/providers/AppProviders'

describe('Full App Router /signup Render Test', () => {
  it('renders /signup route through AppProviders and RootLayout without throwing', () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ['/signup'],
    })

    let html = ''
    expect(() => {
      html = renderToString(
        <AppProviders>
          <RouterProvider router={router} />
        </AppProviders>
      )
    }).not.toThrow()

    expect(html).toBeDefined()
    expect(html).toContain('offline-banner-container')
  })
})
