import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ApiClient, buildApiUrl } from '../apiClient'
import { AppApiError } from '../apiErrors'

describe('ApiClient & buildApiUrl - Architecture & URL Construction Verification', () => {
  describe('1. Development Direct URL Construction', () => {
    it('constructs correct URL when configured with a local development backend origin', () => {
      const url = buildApiUrl('http://localhost:5000', '/api/v1/auth/me')
      expect(url.toString()).toBe('http://localhost:5000/api/v1/auth/me')
      expect(url.origin).toBe('http://localhost:5000')
      expect(url.pathname).toBe('/api/v1/auth/me')
    })

    it('ApiClient instance resolves endpoints using its configured development base URL', () => {
      const client = new ApiClient('http://localhost:5000')
      const url = client.buildUrl('/api/v1/notifications')
      expect(url.toString()).toBe('http://localhost:5000/api/v1/notifications')
    })
  })

  describe('2. Production Origin URL Construction', () => {
    it('constructs correct URL when configured with a production HTTPS backend origin', () => {
      const url = buildApiUrl('https://api.finauditease.ng', '/api/v1/engagements')
      expect(url.toString()).toBe('https://api.finauditease.ng/api/v1/engagements')
      expect(url.origin).toBe('https://api.finauditease.ng')
      expect(url.pathname).toBe('/api/v1/engagements')
    })

    it('ApiClient instance resolves production endpoints cleanly', () => {
      const client = new ApiClient('https://api.finauditease.ng')
      const url = client.buildUrl('/api/v1/audit-requests')
      expect(url.toString()).toBe('https://api.finauditease.ng/api/v1/audit-requests')
    })
  })

  describe('3. Slash Handling (Trailing & Multiple Slashes)', () => {
    it('handles trailing slash on base URL without duplicating slashes', () => {
      const url = buildApiUrl('http://localhost:5000/', '/api/v1/checklists/month-end')
      expect(url.toString()).toBe('http://localhost:5000/api/v1/checklists/month-end')
    })

    it('handles multiple trailing slashes on base and leading slashes on endpoint', () => {
      const url = buildApiUrl('http://localhost:5000///', '///api/v1/checklists/pre-audit')
      expect(url.toString()).toBe('http://localhost:5000/api/v1/checklists/pre-audit')
    })

    it('handles endpoint without leading slash', () => {
      const url = buildApiUrl('http://localhost:5000', 'api/v1/auth/me')
      expect(url.toString()).toBe('http://localhost:5000/api/v1/auth/me')
    })
  })

  describe('4. API Prefix Deduplication (/api/v1 and /api)', () => {
    it('deduplicates /api/v1 when base URL already contains /api/v1', () => {
      const url = buildApiUrl('https://api.finauditease.ng/api/v1', '/api/v1/audit-requests')
      expect(url.toString()).toBe('https://api.finauditease.ng/api/v1/audit-requests')
      expect(url.pathname).toBe('/api/v1/audit-requests')
    })

    it('deduplicates /api when base URL already contains /api', () => {
      const url = buildApiUrl('https://api.finauditease.ng/api', '/api/v1/notifications')
      expect(url.toString()).toBe('https://api.finauditease.ng/api/v1/notifications')
      expect(url.pathname).toBe('/api/v1/notifications')
    })

    it('handles exact match when endpoint is simply /api/v1', () => {
      const url = buildApiUrl('https://api.finauditease.ng/api/v1', '/api/v1')
      expect(url.toString()).toBe('https://api.finauditease.ng/api/v1')
    })
  })

  describe('5. Missing Environment Configuration (Fail-Fast Verification)', () => {
    it('throws CONFIGURATION_ERROR on empty string instead of silently defaulting to localhost:5173', () => {
      expect(() => buildApiUrl('', '/api/v1/auth/me')).toThrow(AppApiError)
      try {
        buildApiUrl('', '/api/v1/auth/me')
      } catch (err) {
        expect(err).toBeInstanceOf(AppApiError)
        const apiErr = err as AppApiError
        expect(apiErr.code).toBe('CONFIGURATION_ERROR')
        expect(apiErr.status).toBe(0)
        expect(apiErr.userMessage).toContain('VITE_API_BASE_URL')
      }
    })

    it('throws CONFIGURATION_ERROR on whitespace-only string', () => {
      expect(() => buildApiUrl('   ', '/api/v1/notifications')).toThrow(AppApiError)
    })

    it('ApiClient.request fails fast with CONFIGURATION_ERROR when baseUrl is empty', async () => {
      const client = new ApiClient('')
      await expect(client.get('/api/v1/engagements')).rejects.toThrow(AppApiError)

      try {
        await client.get('/api/v1/engagements')
      } catch (err) {
        const apiErr = err as AppApiError
        expect(apiErr.code).toBe('CONFIGURATION_ERROR')
        expect(apiErr.userMessage).toContain('VITE_API_BASE_URL')
      }
    })
  })

  describe('6. Absolute Endpoint Handling', () => {
    it('preserves absolute URLs passed directly as endpoint', () => {
      const url = buildApiUrl('http://localhost:5000', 'https://auth.enterprise.com/oauth/token')
      expect(url.toString()).toBe('https://auth.enterprise.com/oauth/token')
    })
  })

  describe('7. Request Dispatch and Query Params Serialization', () => {
    const originalFetch = globalThis.fetch

    beforeEach(() => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: { id: 'test-user', email: 'test@finauditease.ng' } }),
      })
    })

    afterEach(() => {
      globalThis.fetch = originalFetch
    })

    it('appends query parameters correctly to destination URL', async () => {
      const client = new ApiClient('http://localhost:5000')
      await client.get('/api/v1/audit-requests', {
        params: { status: 'SUBMITTED', limit: 10 },
      })

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/audit-requests?status=SUBMITTED&limit=10',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      )
    })
  })
})
