/**
 * Determines whether temporary development preview authentication is active.
 *
 * Enabled by default for local development and Vercel preview/staging environments
 * so engineering, stakeholders, and backend developers can inspect and test the UI.
 * Can be explicitly disabled by setting VITE_ENABLE_DEV_AUTH="false".
 */
export const isDevAuthEnabled = (): boolean => {
  if (import.meta.env.VITE_ENABLE_DEV_AUTH === 'false') {
    return false
  }
  return true
}
