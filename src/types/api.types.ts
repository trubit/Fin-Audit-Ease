/**
 * Central API contract and envelope types.
 *
 * NOTE: These types establish the frontend boundary.
 * Authoritative responses will be provided by backend services.
 */

export interface ApiResponse<T> {
  readonly success: boolean
  readonly data: T
  readonly message?: string
  readonly meta?: ResponseMeta
}

export interface ApiErrorResponse {
  readonly success: false
  readonly error: {
    readonly code: string
    readonly message: string
    readonly details?: Record<string, string[]>
  }
}

export interface ResponseMeta {
  readonly page?: number
  readonly limit?: number
  readonly total?: number
  readonly totalPages?: number
}

export interface RequestOptions extends RequestInit {
  readonly timeoutMs?: number
  readonly params?: Record<string, unknown> | object
}
