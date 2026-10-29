/**
 * Standardized API Error Handling.
 * Converts raw HTTP responses & network exceptions into sanitized, user-friendly messages.
 *
 * CRITICAL SECURITY INSTRUCTION:
 * Never expose raw backend exceptions, stack traces, database schemas, or server paths to users.
 */

export type ApiErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'REQUEST_CANCELLED'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNPROCESSABLE_ENTITY'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'BAD_GATEWAY'
  | 'SERVICE_UNAVAILABLE'
  | 'CONFIGURATION_ERROR'
  | 'CONTRACT_ERROR'
  | 'UNKNOWN_ERROR'

export interface NormalizeErrorOptions {
  readonly retryAfterSeconds?: number
  readonly isCancelled?: boolean
}

export class AppApiError extends Error {
  readonly code: ApiErrorCode
  readonly status: number
  readonly userMessage: string
  readonly fieldErrors?: Record<string, string[]>
  readonly retryAfterSeconds?: number

  constructor(params: {
    code: ApiErrorCode
    status: number
    userMessage: string
    fieldErrors?: Record<string, string[]>
    retryAfterSeconds?: number
  }) {
    super(params.userMessage)
    this.name = 'AppApiError'
    this.code = params.code
    this.status = params.status
    this.userMessage = params.userMessage
    this.fieldErrors = params.fieldErrors
    this.retryAfterSeconds = params.retryAfterSeconds
  }

  get isAuthError(): boolean {
    return this.status === 401 || this.code === 'UNAUTHORIZED'
  }

  get isForbidden(): boolean {
    return this.status === 403 || this.code === 'FORBIDDEN'
  }

  get isNotFound(): boolean {
    return this.status === 404 || this.code === 'NOT_FOUND'
  }

  get isConflict(): boolean {
    return this.status === 409 || this.code === 'CONFLICT'
  }

  get isValidationError(): boolean {
    return this.status === 422 || this.code === 'UNPROCESSABLE_ENTITY'
  }

  get isRateLimited(): boolean {
    return this.status === 429 || this.code === 'RATE_LIMITED'
  }

  get isServerError(): boolean {
    return this.status >= 500
  }
}

/**
 * Detects sensitive technical strings that must NEVER leak to end users.
 */
function isSensitiveServerMessage(msg: string): boolean {
  const lower = msg.toLowerCase()
  return (
    lower.includes('mongo') ||
    lower.includes('postgres') ||
    lower.includes('mysql') ||
    lower.includes('sqlite') ||
    lower.includes('prisma') ||
    lower.includes('sequelize') ||
    lower.includes('query') ||
    lower.includes('syntax') ||
    lower.includes('exception') ||
    lower.includes('stack') ||
    lower.includes('at /') ||
    lower.includes('at c:\\') ||
    lower.includes('node_modules') ||
    lower.includes('connection pool') ||
    lower.includes('27017') ||
    lower.includes('5432') ||
    lower.includes('3306') ||
    lower.includes('jwt') ||
    lower.includes('secret') ||
    lower.includes('bearer')
  )
}

/**
 * Extracts backend error message and field details safely from varied server response envelopes.
 */
function extractServerPayload(errorData: unknown): {
  message?: string
  fieldErrors?: Record<string, string[]>
  code?: string
} {
  if (typeof errorData !== 'object' || errorData === null) {
    return {}
  }

  const payload = errorData as Record<string, unknown>

  // 1. Check nested RFC 7807 or FinAuditEase error envelope: { error: { message, details, code } }
  if (typeof payload.error === 'object' && payload.error !== null) {
    const nested = payload.error as Record<string, unknown>
    const msg = typeof nested.message === 'string' ? nested.message.trim() : undefined
    const code = typeof nested.code === 'string' ? nested.code.trim() : undefined
    const details =
      typeof nested.details === 'object' && nested.details !== null
        ? (nested.details as Record<string, string[]>)
        : undefined
    return { message: msg, fieldErrors: details, code }
  }

  // 2. Direct message string: { message: "..." }
  const directMsg = typeof payload.message === 'string' ? payload.message.trim() : undefined

  // 3. String error: { error: "..." }
  const stringErr = typeof payload.error === 'string' ? payload.error.trim() : undefined

  // 4. Field validation errors: { errors: { ... } } or { details: { ... } }
  let fieldErrors: Record<string, string[]> | undefined
  if (typeof payload.errors === 'object' && payload.errors !== null) {
    fieldErrors = payload.errors as Record<string, string[]>
  } else if (typeof payload.details === 'object' && payload.details !== null) {
    fieldErrors = payload.details as Record<string, string[]>
  }

  return {
    message: directMsg || stringErr,
    fieldErrors,
    code: typeof payload.code === 'string' ? payload.code.trim() : undefined,
  }
}

export const normalizeApiError = (
  error: unknown,
  status?: number,
  options?: NormalizeErrorOptions
): AppApiError => {
  // If already an AppApiError, preserve it
  if (error instanceof AppApiError) {
    return error
  }

  // Caller cancellation takes precedence over network/timeout
  if (options?.isCancelled) {
    return new AppApiError({
      code: 'REQUEST_CANCELLED',
      status: 499,
      userMessage: 'The request was cancelled.',
    })
  }

  // Network or timeout abort
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new AppApiError({
      code: 'TIMEOUT_ERROR',
      status: 408,
      userMessage: 'The request took too long to complete. Please check your connection and try again.',
    })
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new AppApiError({
      code: 'NETWORK_ERROR',
      status: 0,
      userMessage: 'Unable to connect to the server. Please verify your internet connection.',
    })
  }

  const httpStatus =
    status ??
    (typeof error === 'object' && error !== null && 'status' in error
      ? Number((error as { status: unknown }).status)
      : 0)

  const serverPayload = extractServerPayload(error)
  const rawMessage = serverPayload.message
  const isMessageSafe = rawMessage && !isSensitiveServerMessage(rawMessage)
  const safeMessage = isMessageSafe ? rawMessage : undefined

  switch (httpStatus) {
    case 400:
      return new AppApiError({
        code: 'BAD_REQUEST',
        status: 400,
        userMessage: safeMessage || 'The request was invalid. Please check your inputs.',
        fieldErrors: serverPayload.fieldErrors,
      })

    case 401:
      return new AppApiError({
        code: 'UNAUTHORIZED',
        status: 401,
        userMessage: safeMessage || 'Your session is invalid or has expired. Please sign in again.',
      })

    case 403:
      return new AppApiError({
        code: 'FORBIDDEN',
        status: 403,
        userMessage:
          safeMessage ||
          'You do not have permission to perform this action or view this resource.',
      })

    case 404:
      return new AppApiError({
        code: 'NOT_FOUND',
        status: 404,
        userMessage: safeMessage || 'The requested resource could not be found.',
      })

    case 409:
      return new AppApiError({
        code: 'CONFLICT',
        status: 409,
        userMessage: safeMessage || 'A conflicting record already exists in the system.',
        fieldErrors: serverPayload.fieldErrors,
      })

    case 422:
      return new AppApiError({
        code: 'UNPROCESSABLE_ENTITY',
        status: 422,
        userMessage:
          safeMessage ||
          'The submitted data failed validation. Please review the highlighted fields.',
        fieldErrors: serverPayload.fieldErrors,
      })

    case 429: {
      const retryNotice = options?.retryAfterSeconds
        ? ` Please retry in ${options.retryAfterSeconds} seconds.`
        : ' Please wait a moment before trying again.'
      return new AppApiError({
        code: 'RATE_LIMITED',
        status: 429,
        userMessage: safeMessage || `Too many requests were sent.${retryNotice}`,
        retryAfterSeconds: options?.retryAfterSeconds,
      })
    }

    case 500:
      // Never leak server details for 500
      return new AppApiError({
        code: 'SERVER_ERROR',
        status: 500,
        userMessage: 'An internal server error occurred. Our engineering team has been notified.',
      })

    case 502:
      return new AppApiError({
        code: 'BAD_GATEWAY',
        status: 502,
        userMessage: 'The service gateway is temporarily unavailable. Please retry shortly.',
      })

    case 503:
      return new AppApiError({
        code: 'SERVICE_UNAVAILABLE',
        status: 503,
        userMessage:
          'The service is currently undergoing scheduled maintenance. Please check back soon.',
      })

    case 504:
      return new AppApiError({
        code: 'TIMEOUT_ERROR',
        status: 504,
        userMessage: 'The server timed out waiting for an upstream response. Please retry.',
      })

    default:
      return new AppApiError({
        code: httpStatus >= 500 ? 'SERVER_ERROR' : 'UNKNOWN_ERROR',
        status: httpStatus || 500,
        userMessage:
          httpStatus >= 500
            ? 'An internal server error occurred. Our engineering team has been notified.'
            : safeMessage || 'An unexpected error occurred. Please try again later.',
      })
  }
}
