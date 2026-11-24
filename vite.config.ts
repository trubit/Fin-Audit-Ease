import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin, type ViteDevServer, type PreviewServer } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Multi-Platform History Fallback Plugin
 *
 * For Main Platform (isAdmin = false):
 * - Directs root and app routes to index.html
 * - Routes /admin and /admin/* to admin.html during local development
 *
 * For Dedicated Admin Platform (isAdmin = true):
 * - Directs all document requests directly to admin.html
 * - Automatically places the compiled admin application as dist/index.html upon build completion
 */
function platformHistoryFallbackPlugin(isAdmin: boolean): Plugin {
  const handleFallback = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use((req, _res, next) => {
      if (req.method !== 'GET') {
        return next()
      }

      const rawUrl = req.url || ''
      const pathname = rawUrl.split('?')[0]
      const accept = req.headers.accept || ''

      const isHtmlNav = typeof accept === 'string' && accept.includes('text/html')
      const isStaticOrInternal =
        pathname.includes('.') ||
        pathname.startsWith('/api/') ||
        pathname.startsWith('/src/') ||
        pathname.startsWith('/@') ||
        pathname.startsWith('/node_modules/')

      if (isHtmlNav && !isStaticOrInternal) {
        if (isAdmin) {
          req.url = '/admin.html'
        } else if (pathname === '/admin' || pathname.startsWith('/admin/')) {
          req.url = '/admin.html'
        }
      }

      next()
    })
  }

  return {
    name: 'platform-history-fallback',
    configureServer(server) {
      handleFallback(server)
    },
    configurePreviewServer(server) {
      handleFallback(server)
    },
    closeBundle() {
      if (isAdmin) {
        const distAdmin = path.resolve(import.meta.dirname, 'dist', 'admin.html')
        const distIndex = path.resolve(import.meta.dirname, 'dist', 'index.html')
        try {
          if (fs.existsSync(distAdmin)) {
            fs.copyFileSync(distAdmin, distIndex)
          }
        } catch (err) {
          console.warn('Could not copy dist/admin.html to dist/index.html:', err)
        }
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isAdmin = mode === 'admin' || process.env.VITE_APP === 'admin'

  return {
    plugins: [
      react(),
      platformHistoryFallbackPlugin(isAdmin),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'favicon.svg',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-192x192.svg',
          'pwa-512x512.svg',
        ],
        manifest: {
          name: isAdmin
            ? 'FinAuditEase Admin Platform — Powered by Sabi Africa Innovations Limited'
            : 'FinAuditEase — Powered by Sabi Africa Innovations Limited',
          short_name: isAdmin ? 'FinAuditEase Admin' : 'FinAuditEase',
          description: isAdmin
            ? 'Central Administration Console — Powered by Sabi Africa Innovations Limited'
            : 'Audit Readiness & Workflow SaaS — Powered by Sabi Africa Innovations Limited',
          start_url: '/',
          scope: '/',
          theme_color: isAdmin ? '#0B132B' : '#0F5938',
          background_color: '#FAFBF9',
          display: 'standalone',
          orientation: 'portrait-primary',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/pwa-192x192.svg',
              sizes: '192x192',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api/],
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          cleanupOutdatedCaches: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        input: isAdmin
          ? { admin: path.resolve(import.meta.dirname, 'admin.html') }
          : { main: path.resolve(import.meta.dirname, 'index.html') },
      },
    },
    server: {
      port: 5173,
      strictPort: false,
    },
  }
})
