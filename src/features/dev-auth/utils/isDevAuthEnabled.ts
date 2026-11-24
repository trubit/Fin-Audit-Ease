/**
 * Determines whether temporary development preview authentication is active.
 *
 * Enabled by default for local development, staging, and deployed preview environments
 * so engineering, stakeholders, and reviewers can preview and test all roles before final hosting.
 * Can be explicitly disabled for final production hosting by setting VITE_ENABLE_DEV_AUTH="false".
 */
export const isDevAuthEnabled = (): boolean => {
  if (import.meta.env.VITE_ENABLE_DEV_AUTH === 'false') {
    return false
  }
  return true
}
