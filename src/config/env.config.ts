/**
 * Safe frontend environment configuration.
 *
 * CRITICAL SECURITY INSTRUCTION:
 * Only variables prefixed with VITE_ are accessible in the browser.
 * Never export secrets, encryption keys, tokens, or server passwords from this module.
 */

export interface AppEnvConfig {
  readonly apiBaseUrl: string
  readonly appEnv: 'development' | 'production' | 'staging'
  readonly isProduction: boolean
  readonly sessionTimeoutMs: number
  readonly sessionWarningMs: number
}

const parseNumber = (val: unknown, fallback: number): number => {
  const parsed = Number(val)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const envConfig: AppEnvConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.trim() || '',
  appEnv: (import.meta.env.VITE_APP_ENV as 'development' | 'production' | 'staging') || 'development',
  isProduction: import.meta.env.PROD,
  sessionTimeoutMs: parseNumber(import.meta.env.VITE_SESSION_TIMEOUT_MS, 30 * 60 * 1000), // 30 minutes
  sessionWarningMs: parseNumber(import.meta.env.VITE_SESSION_WARNING_MS, 2 * 60 * 1000), // 2 minutes
}
