import { describe, it, expect } from 'vitest'
import { AppApiError, normalizeApiError } from '../apiErrors'

describe('API Error Handling and Sanitization', () => {
  it('preserves an existing AppApiError instance', () => {
    const original = new AppApiError({
      code: 'FORBIDDEN',
      status: 403,
      userMessage: 'Custom forbidden message',
    })
    const normalized = normalizeApiError(original)
    expect(normalized).toBe(original)
    expect(normalized.code).toBe('FORBIDDEN')
    expect(normalized.status).toBe(403)
    expect(normalized.userMessage).toBe('Custom forbidden message')
  })

  it('normalizes 401 HTTP response to UNAUTHORIZED', () => {
    const error = normalizeApiError({ status: 401 })
    expect(error.code).toBe('UNAUTHORIZED')
    expect(error.status).toBe(401)
    expect(error.userMessage).toContain('sign in again')
  })

  it('normalizes 403 HTTP response to FORBIDDEN', () => {
    const error = normalizeApiError({ status: 403 })
    expect(error.code).toBe('FORBIDDEN')
    expect(error.status).toBe(403)
    expect(error.userMessage).toContain('permission')
  })

  it('normalizes 404 HTTP response to NOT_FOUND', () => {
    const error = normalizeApiError({ status: 404 })
    expect(error.code).toBe('NOT_FOUND')
    expect(error.status).toBe(404)
  })

  it('normalizes 429 HTTP response to RATE_LIMITED', () => {
    const error = normalizeApiError({ status: 429 })
    expect(error.code).toBe('RATE_LIMITED')
    expect(error.status).toBe(429)
  })

  it('sanitizes 500 HTTP response to SERVER_ERROR without leaking raw details', () => {
    const rawError = {
      status: 500,
      message: 'MongoError: connection pool exhausted at mongodb://internal-db:27017',
    }
    const error = normalizeApiError(rawError)
    expect(error.code).toBe('SERVER_ERROR')
    expect(error.status).toBe(500)
    // Must NOT leak database strings, paths, or connection URIs
    expect(error.userMessage).not.toContain('MongoError')
    expect(error.userMessage).not.toContain('27017')
    expect(error.userMessage).toContain('internal server error')
  })

  it('normalizes fetch network failure to NETWORK_ERROR', () => {
    const networkException = new TypeError('Failed to fetch')
    const error = normalizeApiError(networkException)
    expect(error.code).toBe('NETWORK_ERROR')
    expect(error.userMessage).toContain('internet connection')
  })
})
