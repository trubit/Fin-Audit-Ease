import { envConfig } from '@/config/env.config'
import type { ApiResponse, RequestOptions } from '@/types/api.types'
import { AppApiError, normalizeApiError } from './apiErrors'

/**
 * Centralized API Client.
 * All HTTP communication with backend services must route through this client.
 *
 * Direct ad-hoc fetch() calls inside UI components are strictly forbidden.
 */

/**
 * Builds and normalizes an API URL from a base URL and endpoint.
 *
 * Rules:
 * 1. If endpoint is an absolute URL (http:// or https://), return it directly.
 * 2. If baseUrl is missing or empty, fail fast with CONFIGURATION_ERROR
 *    to prevent silent fallback to window.location.origin (which caused 404s on localhost:5173).
 * 3. Normalize slashes: prevent duplicate slashes.
 * 4. Deduplicate API version prefixes: if baseUrl ends with /api/v1 and endpoint begins with /api/v1,
 *    strip the duplicated prefix to avoid /api/v1/api/v1.
 */
export function buildApiUrl(baseUrl: string, endpoint: string): URL {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return new URL(endpoint)
  }

  const trimmedBase = baseUrl?.trim() || ''
  if (!trimmedBase) {
    throw new AppApiError({
      code: 'CONFIGURATION_ERROR',
      status: 0,
      userMessage:
        'Backend API base URL is not configured. Please define VITE_API_BASE_URL in your environment configuration.',
    })
  }

  let cleanBase = trimmedBase.replace(/\/+$/, '')
  let cleanEndpoint = endpoint.trim().replace(/^\/+/, '')

  // Deduplicate /api/v1 prefix if present on both baseUrl and endpoint
  if (cleanBase.endsWith('/api/v1') && cleanEndpoint.startsWith('api/v1/')) {
    cleanEndpoint = cleanEndpoint.slice('api/v1/'.length)
  } else if (cleanBase.endsWith('/api/v1') && cleanEndpoint === 'api/v1') {
    cleanEndpoint = ''
  } else if (cleanBase.endsWith('/api') && cleanEndpoint.startsWith('api/')) {
    cleanEndpoint = cleanEndpoint.slice('api/'.length)
  }

  const combined = cleanEndpoint ? `${cleanBase}/${cleanEndpoint}` : cleanBase
  return new URL(combined, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
}

export class ApiClient {
  private readonly baseUrl: string
  private readonly defaultTimeoutMs: number = 30000 // 30s timeout

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl !== undefined ? baseUrl : envConfig.apiBaseUrl
  }

  /**
   * Resolves an endpoint to a validated URL using the configured API base.
   */
  buildUrl(endpoint: string): URL {
    return buildApiUrl(this.baseUrl, endpoint)
  }

  /**
   * Generic request dispatcher with timeout, parameter serialization, cancellation linking, and sanitized error normalization.
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { timeoutMs = this.defaultTimeoutMs, params, headers, signal: callerSignal, ...customOptions } = options

    const url = this.buildUrl(endpoint)

    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          url.searchParams.append(key, String(val))
        }
      })
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    // Link caller cancellation signal with internal timeout controller
    if (callerSignal) {
      if (callerSignal.aborted) {
        controller.abort(callerSignal.reason)
      } else {
        callerSignal.addEventListener('abort', () => {
          controller.abort(callerSignal.reason)
        })
      }
    }

    const isFormData = customOptions.body instanceof FormData
    const requestHeaders: Record<string, string> = {
      Accept: 'application/json',
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(headers as Record<string, string>),
    }

    try {
      const response = await fetch(url.toString(), {
        credentials: 'include',
        ...customOptions,
        headers: requestHeaders,
        signal: controller.signal,
      })

      clearTimeout(timer)

      // If backend returns an error HTTP status
      if (!response.ok) {
        let errorData: unknown = null
        try {
          errorData = await response.json()
        } catch {
          // Response body was not JSON
        }

        const retryAfterHeader = response.headers.get('Retry-After')
        const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined
        const normalized = normalizeApiError(errorData, response.status, {
          retryAfterSeconds: Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : undefined,
        })
        throw normalized
      }

      // 204 No Content
      if (response.status === 204) {
        return { success: true, data: undefined as unknown as T }
      }

      const json = await response.json()
      return json as ApiResponse<T>
    } catch (err: unknown) {
      clearTimeout(timer)
      if (err instanceof AppApiError) {
        throw err
      }
      const isCancelled = Boolean(callerSignal?.aborted)
      throw normalizeApiError(err, undefined, { isCancelled })
    }
  }

  get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  postForm<T>(endpoint: string, formData: FormData, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
    })
  }

  put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  /**
   * Fetch binary payload (e.g. PDF exports) as a Blob with timeout, headers, and error handling.
   */
  async getBlob(endpoint: string, options?: RequestOptions): Promise<Blob> {
    const { timeoutMs = this.defaultTimeoutMs, params, headers, signal: callerSignal } = options || {}
    const url = this.buildUrl(endpoint)

    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          url.searchParams.append(key, String(val))
        }
      })
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    if (callerSignal) {
      if (callerSignal.aborted) {
        controller.abort(callerSignal.reason)
      } else {
        callerSignal.addEventListener('abort', () => controller.abort(callerSignal.reason))
      }
    }

    try {
      const response = await fetch(url.toString(), {
        credentials: 'include',
        method: 'GET',
        headers: {
          Accept: 'application/pdf, application/octet-stream, application/json',
          ...(headers as Record<string, string>),
        },
        signal: controller.signal,
      })

      clearTimeout(timer)

      if (!response.ok) {
        let errorData: unknown = null
        try {
          errorData = await response.json()
        } catch {
          // Response body was not JSON
        }
        const retryAfterHeader = response.headers.get('Retry-After')
        const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined
        throw normalizeApiError(errorData, response.status, {
          retryAfterSeconds: Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : undefined,
        })
      }

      return await response.blob()
    } catch (err: unknown) {
      clearTimeout(timer)
      if (err instanceof AppApiError) {
        throw err
      }
      const isCancelled = Boolean(callerSignal?.aborted)
      throw normalizeApiError(err, undefined, { isCancelled })
    }
  }
}

export const apiClient = new ApiClient()
