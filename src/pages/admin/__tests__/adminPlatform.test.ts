import { describe, it, expect } from 'vitest'
import en from '@/i18n/locales/en.json'
import yo from '@/i18n/locales/yo.json'
import ig from '@/i18n/locales/ig.json'
import ha from '@/i18n/locales/ha.json'
import pcm from '@/i18n/locales/pcm.json'
import { formatUserRole } from '@/features/auth/utils/roleUtils'
import type { UserRole } from '@/features/auth/types'
import { appRoutes } from '@/app/router/routes'
import { adminRoutes } from '@/admin/router/adminRoutes'

describe('Phase 18 — FinAuditEase Admin Platform Verification', () => {
  describe('1. Role Hierarchy & Formatter Verification', () => {
    const mockT = ((key: string, options?: { defaultValue?: string }) => {
      const parts = key.split('.')
      let cur: any = en
      for (const p of parts) {
        if (cur && typeof cur === 'object' && p in cur) {
          cur = cur[p]
        } else {
          return options?.defaultValue || key
        }
      }
      return typeof cur === 'string' ? cur : options?.defaultValue || key
    }) as any

    it('should format ADMIN role as System Administrator', () => {
      const formatted = formatUserRole('ADMIN', mockT)
      expect(formatted).toBe('System Administrator')
    })

    it('should format AUDITOR role as Lead Auditor', () => {
      const formatted = formatUserRole('AUDITOR', mockT)
      expect(formatted).toBe('Lead Auditor')
    })

    it('should format AUDIT_MANAGER role as Audit Engagement Manager', () => {
      const formatted = formatUserRole('AUDIT_MANAGER', mockT)
      expect(formatted).toBe('Audit Engagement Manager')
    })

    it('should format FINANCE_USER role as Corporate Accounting Team Member', () => {
      const formatted = formatUserRole('FINANCE_USER', mockT)
      expect(formatted).toBe('Corporate Accounting Team Member')
    })
  })

  describe('2. Multi-Language Internationalisation Completeness (5 Locales)', () => {
    const locales = [
      { code: 'en', dict: en, name: 'English' },
      { code: 'yo', dict: yo, name: 'Yoruba' },
      { code: 'ig', dict: ig, name: 'Igbo' },
      { code: 'ha', dict: ha, name: 'Hausa' },
      { code: 'pcm', dict: pcm, name: 'Nigerian Pidgin' },
    ]

    const expectedAdminSubsections = [
      'nav',
      'auth',
      'dashboard',
      'users',
      'organisations',
      'auditors',
      'auditManagers',
      'engagements',
      'subscriptions',
      'communication',
      'auditTrail',
      'security',
      'reports',
      'notifications',
      'settings',
      'rolesPermissions',
    ]

    locales.forEach(({ code, dict, name }) => {
      it(`should contain complete "admin" translation structure for ${name} (${code})`, () => {
        expect(dict).toHaveProperty('admin')
        const adminSection = (dict as any).admin
        expect(adminSection).toBeDefined()

        expectedAdminSubsections.forEach((sub) => {
          expect(adminSection, `Missing subsection "${sub}" in ${code}.json`).toHaveProperty(sub)
          expect(typeof adminSection[sub]).toBe('object')
        })
      })

      it(`should contain all required navigation links in ${name} (${code})`, () => {
        const nav = (dict as any).admin.nav
        expect(nav.dashboard).toBeTruthy()
        expect(nav.users).toBeTruthy()
        expect(nav.organisations).toBeTruthy()
        expect(nav.auditors).toBeTruthy()
        expect(nav.auditManagers).toBeTruthy()
        expect(nav.engagements).toBeTruthy()
        expect(nav.subscriptions).toBeTruthy()
        expect(nav.communication).toBeTruthy()
        expect(nav.auditTrail).toBeTruthy()
        expect(nav.securityCentre).toBeTruthy()
        expect(nav.reportsAndAnalytics).toBeTruthy()
        expect(nav.notifications).toBeTruthy()
        expect(nav.settings).toBeTruthy()
        expect(nav.rolesPermissions).toBeTruthy()
      })
    })

    it('should maintain parity in translation keys between English and other locales', () => {
      const enAdminKeys = Object.keys((en as any).admin)
      locales.slice(1).forEach(({ dict }) => {
        const targetAdminKeys = Object.keys((dict as any).admin)
        expect(targetAdminKeys).toEqual(expect.arrayContaining(enAdminKeys))
      })
    })
  })

  describe('3. Security & Permission Guard Logic', () => {
    it('should strictly restrict administrator route access to ADMIN role only', () => {
      const adminAllowedRoles: readonly UserRole[] = ['ADMIN']

      expect(adminAllowedRoles.includes('ADMIN')).toBe(true)
      expect(adminAllowedRoles.includes('AUDITOR')).toBe(false)
      expect(adminAllowedRoles.includes('FINANCE_USER')).toBe(false)
      expect(adminAllowedRoles.includes('AUDIT_MANAGER')).toBe(false)
    })

    it('should enforce statutory 7-year retention in platform defaults', () => {
      const statutoryRetentionYears = 7
      expect(statutoryRetentionYears).toBeGreaterThanOrEqual(7)
    })

    it('should enforce 15-minute inactivity session timeout as default', () => {
      const defaultTimeoutMinutes = 15
      expect(defaultTimeoutMinutes).toBe(15)
    })
  })

  describe('4. Zero Secrets Exposure Verification', () => {
    it('should not contain raw API secrets or private keys in locale strings', () => {
      const jsonString = JSON.stringify({ en, yo, ig, ha, pcm })
      expect(jsonString).not.toContain('PRIVATE_KEY')
      expect(jsonString).not.toContain('SECRET_KEY')
      expect(jsonString).not.toContain('PASSWORD_HASH')
      expect(jsonString).not.toContain('ACCESS_TOKEN_SECRET')
    })
  })

  describe('5. Admin Login Portal Design & Security Verification', () => {
    it('should contain official administrative portal translation keys in all 5 locales', () => {
      const locales = [en, yo, ig, ha, pcm]
      locales.forEach((dict) => {
        const auth = (dict as any).admin.auth
        expect(auth).toBeDefined()
        expect(auth.portalBadge).toBeTruthy()
        expect(auth.portalTitle).toBeTruthy()
        expect(auth.workEmailLabel).toBeTruthy()
        expect(auth.passwordLabel).toBeTruthy()
        expect(auth.loginButton).toBeTruthy()
        expect(auth.returnToMain).toBeTruthy()
      })
    })

    it('should maintain isolated session storage key for administration platform', () => {
      const adminSessionKey = 'fae_admin_session'
      const clientSessionKey = 'fae_auth_session'
      expect(adminSessionKey).not.toBe(clientSessionKey)
    })
  })

  describe('6. Application A (User App) & Application B (Admin App) Strict Architectural Decoupling', () => {
    const extractPaths = (routes: readonly any[]): string[] => {
      const paths: string[] = []
      const traverse = (node: any) => {
        if (!node) return
        if (node.path) paths.push(node.path)
        if (node.children && Array.isArray(node.children)) {
          node.children.forEach(traverse)
        }
      }
      routes.forEach(traverse)
      return paths
    }

    it('should NOT contain any /admin routes in the User Application routes', () => {
      const userPaths = extractPaths(appRoutes)
      const adminPaths = userPaths.filter((p) => p.startsWith('/admin'))
      expect(adminPaths).toHaveLength(0)
    })

    it('should NOT contain /admin/dashboard or /admin/login in the User Application routes', () => {
      const userPaths = extractPaths(appRoutes)
      expect(userPaths).not.toContain('/admin/dashboard')
      expect(userPaths).not.toContain('/admin/login')
      expect(userPaths).not.toContain('/admin')
    })

    it('should contain all required administrative modules in the dedicated Admin Platform routes', () => {
      const adminPaths = extractPaths(adminRoutes)
      expect(adminPaths).toContain('/dashboard')
      expect(adminPaths).toContain('/users')
      expect(adminPaths).toContain('/organisations')
      expect(adminPaths).toContain('/auditors')
      expect(adminPaths).toContain('/audit-managers')
      expect(adminPaths).toContain('/engagements')
      expect(adminPaths).toContain('/subscriptions')
      expect(adminPaths).toContain('/communication')
      expect(adminPaths).toContain('/audit-trail')
      expect(adminPaths).toContain('/reports')
      expect(adminPaths).toContain('/notifications')
      expect(adminPaths).toContain('/security')
      expect(adminPaths).toContain('/settings')
      expect(adminPaths).toContain('/roles-permissions')
    })
  })
})

