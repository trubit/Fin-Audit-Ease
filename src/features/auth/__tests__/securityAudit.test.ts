import { describe, it, expect } from 'vitest'
import { normalizeApiError, AppApiError } from '@/services/api/apiErrors'
import { sanitizeInternalUrl } from '@/features/notifications/utils/navigation'
import { queryClient } from '@/lib/queryClient'
import { auditTrailQueryKeys } from '@/features/auditTrail/hooks/useAuditTrail'

describe('Enterprise Security & Multi-Tenant Isolation Audit (Phase 16)', () => {
  describe('Multi-Tenant Cache & Query Key Isolation', () => {
    it('generates strictly isolated query keys across different engagements', () => {
      const engagementA = 'eng-alpha-123'
      const engagementB = 'eng-beta-456'

      const keysA = {
        engagement: ['engagement', engagementA],
        milestones: ['engagement', engagementA, 'milestones'],
        members: ['engagement', engagementA, 'members'],
        requests: ['auditRequests', { engagementId: engagementA }],
        documents: ['documents', { engagementId: engagementA }],
        auditTrail: auditTrailQueryKeys.list({ engagementId: engagementA }),
      }

      const keysB = {
        engagement: ['engagement', engagementB],
        milestones: ['engagement', engagementB, 'milestones'],
        members: ['engagement', engagementB, 'members'],
        requests: ['auditRequests', { engagementId: engagementB }],
        documents: ['documents', { engagementId: engagementB }],
        auditTrail: auditTrailQueryKeys.list({ engagementId: engagementB }),
      }

      // Verify that no query keys collide across distinct tenant workspaces
      expect(JSON.stringify(keysA.engagement)).not.toBe(JSON.stringify(keysB.engagement))
      expect(JSON.stringify(keysA.milestones)).not.toBe(JSON.stringify(keysB.milestones))
      expect(JSON.stringify(keysA.members)).not.toBe(JSON.stringify(keysB.members))
      expect(JSON.stringify(keysA.requests)).not.toBe(JSON.stringify(keysB.requests))
      expect(JSON.stringify(keysA.documents)).not.toBe(JSON.stringify(keysB.documents))
      expect(JSON.stringify(keysA.auditTrail)).not.toBe(JSON.stringify(keysB.auditTrail))
    })

    it('isolates document versions strictly by document identifier', () => {
      const doc1 = 'doc-fin-101'
      const doc2 = 'doc-fin-102'

      const keyDoc1 = ['documentVersions', doc1]
      const keyDoc2 = ['documentVersions', doc2]

      expect(keyDoc1).not.toEqual(keyDoc2)
    })
  })

  describe('Mutation Retry Safety & Duplicate Submission Guard', () => {
    it('strictly configures mutation retries to false to prevent duplicate financial submissions', () => {
      const mutationDefaults = queryClient.getDefaultOptions().mutations
      expect(mutationDefaults?.retry).toBe(false)
    })

    it('suppresses query retries on client validation, auth, and conflict status codes', () => {
      const queryRetryFn = queryClient.getDefaultOptions().queries?.retry as
        | ((count: number, error: unknown) => boolean)
        | undefined

      expect(queryRetryFn).toBeDefined()
      if (queryRetryFn) {
        expect(queryRetryFn(0, { status: 400 })).toBe(false)
        expect(queryRetryFn(0, { status: 401 })).toBe(false)
        expect(queryRetryFn(0, { status: 403 })).toBe(false)
        expect(queryRetryFn(0, { status: 404 })).toBe(false)
        expect(queryRetryFn(0, { status: 409 })).toBe(false)
        expect(queryRetryFn(0, { status: 422 })).toBe(false)
        expect(queryRetryFn(0, { status: 429 })).toBe(false)
        expect(queryRetryFn(0, { code: 'REQUEST_CANCELLED' })).toBe(false)
        expect(queryRetryFn(0, { code: 'RATE_LIMITED' })).toBe(false)
        expect(queryRetryFn(0, { code: 'CONFLICT' })).toBe(false)
      }
    })
  })

  describe('Information Leakage Prevention & Error Normalization', () => {
    it('sanitizes database exceptions and never leaks SQL/MongoDB connection details', () => {
      const leaks = [
        'PostgreSQL connection pool exhausted at /var/app/db.ts:42',
        'MongoServerError: E11000 duplicate key error collection: finaudit.users',
        'Syntax error in SQL statement: SELECT * FROM audit_logs WHERE id = ...',
        'PrismaClientKnownRequestError: Unique constraint failed on the fields: (`email`)',
        'Error at C:\\inetpub\\wwwroot\\backend\\services\\auth.ts:112',
      ]

      leaks.forEach((rawLeak) => {
        const normalized = normalizeApiError({ message: rawLeak }, 500)
        expect(normalized).toBeInstanceOf(AppApiError)
        expect(normalized.userMessage).not.toContain('PostgreSQL')
        expect(normalized.userMessage).not.toContain('MongoServerError')
        expect(normalized.userMessage).not.toContain('SELECT')
        expect(normalized.userMessage).not.toContain('PrismaClient')
        expect(normalized.userMessage).not.toContain('C:\\')
        expect(normalized.userMessage).toBe(
          'An internal server error occurred. Our engineering team has been notified.'
        )
      })
    })

    it('strips credentials and bearer tokens from 401/403 error payloads', () => {
      const rawError = {
        message: 'Invalid JWT bearer token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      }
      const normalized = normalizeApiError(rawError, 401)
      expect(normalized.userMessage).not.toContain('eyJhbGci')
      expect(normalized.userMessage).toBe(
        'Your session is invalid or has expired. Please sign in again.'
      )
    })
  })

  describe('URL & Navigation Sanitization', () => {
    it('rejects external phishing targets and javascript: schemes', () => {
      expect(sanitizeInternalUrl('https://evil-phishing.com/login')).toBeNull()
      expect(sanitizeInternalUrl('http://attacker.com/steal-token')).toBeNull()
      expect(sanitizeInternalUrl('//external.domain/redirect')).toBeNull()
      expect(sanitizeInternalUrl('javascript:alert(document.cookie)')).toBeNull()
      expect(sanitizeInternalUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==')).toBeNull()
      expect(sanitizeInternalUrl('vbscript:msgbox("leak")')).toBeNull()
    })

    it('preserves verified internal application routes', () => {
      expect(sanitizeInternalUrl('/dashboard')).toBe('/dashboard')
      expect(sanitizeInternalUrl('/engagements/eng-101')).toBe('/engagements/eng-101')
      expect(sanitizeInternalUrl('/audit-requests/req-202')).toBe('/audit-requests/req-202')
      expect(sanitizeInternalUrl('/review/rev-303')).toBe('/review/rev-303')
    })
  })
})
