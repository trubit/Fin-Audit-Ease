import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin, type ViteDevServer, type PreviewServer } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Dedicated Admin Platform Fallback Plugin
 *
 * Ensures that all HTML navigation document requests (including the root /)
 * route directly to admin.html for the FinAuditEase Administration Platform.
 * Also synchronizes dist/admin.html to dist/index.html on build completion.
 */
function adminDevHistoryFallbackPlugin(): Plugin {
  const handleAdminFallback = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use((req, _res, next) => {
      if (req.method !== 'GET') {
        return next()
      }

      const rawUrl = req.url || ''
      const pathname = rawUrl.split('?')[0]
      const accept = req.headers.accept || ''

      // Strictly target HTML navigation document requests
      const isHtmlNav = typeof accept === 'string' && accept.includes('text/html')
      const isStaticOrInternal =
        pathname.includes('.') ||
        pathname.startsWith('/api/') ||
        pathname.startsWith('/src/') ||
        pathname.startsWith('/@') ||
        pathname.startsWith('/node_modules/')

      if (isHtmlNav && !isStaticOrInternal) {
        req.url = '/admin.html'
      }

      next()
    })
  }

  return {
    name: 'admin-dev-history-fallback',
    configureServer(server) {
      handleAdminFallback(server)
    },
    configurePreviewServer(server) {
      handleAdminFallback(server)
    },
    closeBundle() {
      const distAdmin = path.resolve(import.meta.dirname, 'dist', 'admin.html')
      const distIndex = path.resolve(import.meta.dirname, 'dist', 'index.html')
      try {
        if (fs.existsSync(distAdmin)) {
          fs.copyFileSync(distAdmin, distIndex)
        }
      } catch (err) {
        console.warn('Could not copy dist/admin.html to dist/index.html:', err)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    adminDevHistoryFallbackPlugin(),
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
        name: 'FinAuditEase — Powered by Sabi Africa Innovations Limited',
        short_name: 'FinAuditEase',
        description: 'Audit Readiness & Workflow SaaS — Powered by Sabi Africa Innovations Limited',
        start_url: '/',
        scope: '/',
        theme_color: '#0F5938',
        background_color: '#FAFBF9',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // SECURITY: Never cache authenticated API calls or private documents
        navigateFallback: '/admin.html',
        navigateFallbackDenylist: [/^\/api/],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        cleanupOutdatedCaches: true
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      input:
        process.env.VITE_APP === 'admin'
          ? { admin: path.resolve(import.meta.dirname, 'admin.html') }
          : process.env.VITE_APP === 'user'
            ? { main: path.resolve(import.meta.dirname, 'index.html') }
            : {
                main: path.resolve(import.meta.dirname, 'index.html'),
                admin: path.resolve(import.meta.dirname, 'admin.html'),
              },
    },
  },
  server: {
    port: 5173,
    strictPort: false
  }
})
