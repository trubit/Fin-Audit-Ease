import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '@/store/authStore'
import { queryClient } from '@/lib/queryClient'
import { devAuthService } from '../services/devAuthService'
import { DEV_USERS } from '../constants'

describe('Temporary Development Authentication Service', () => {
  beforeEach(() => {
    useAuthStore.getState().setUnauthenticated()
    vi.clearAllMocks()
  })

  it('contains zero tokens, passwords, or secrets in dev user presets', () => {
    const auditor = DEV_USERS.AUDITOR as unknown as Record<string, unknown>
    const finance = DEV_USERS.FINANCE_USER as unknown as Record<string, unknown>

    expect(auditor).not.toHaveProperty('password')
    expect(auditor).not.toHaveProperty('token')
    expect(auditor).not.toHaveProperty('jwt')
    expect(auditor).not.toHaveProperty('secret')

    expect(finance).not.toHaveProperty('password')
    expect(finance).not.toHaveProperty('token')
    expect(finance).not.toHaveProperty('jwt')
    expect(finance).not.toHaveProperty('secret')
  })

  it('authenticates development user as Auditor', () => {
    const clearSpy = vi.spyOn(queryClient, 'clear')

    devAuthService.loginAsDev('AUDITOR')

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.authMode).toBe('development')
    expect(state.user?.role).toBe('AUDITOR')
    expect(state.user?.email).toBe('audit.lead@finauditease.ng')
    expect(clearSpy).toHaveBeenCalled()
  })

  it('authenticates development user as Finance User', () => {
    const clearSpy = vi.spyOn(queryClient, 'clear')

    devAuthService.loginAsDev('FINANCE_USER')

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.authMode).toBe('development')
    expect(state.user?.role).toBe('FINANCE_USER')
    expect(state.user?.email).toBe('financial.reporting@zenithenergy.ng')
    expect(clearSpy).toHaveBeenCalled()
  })

  it('switches development roles and purges query cache', () => {
    devAuthService.loginAsDev('AUDITOR')
    expect(useAuthStore.getState().user?.role).toBe('AUDITOR')

    const clearSpy = vi.spyOn(queryClient, 'clear')
    devAuthService.switchDevRole('FINANCE_USER')

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.authMode).toBe('development')
    expect(state.user?.role).toBe('FINANCE_USER')
    expect(clearSpy).toHaveBeenCalled()
  })

  it('logs out of development mode and resets auth state', () => {
    devAuthService.loginAsDev('AUDITOR')
    expect(useAuthStore.getState().isAuthenticated).toBe(true)

    const clearSpy = vi.spyOn(queryClient, 'clear')
    devAuthService.logoutDev()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.authMode).toBe('real')
    expect(state.user).toBeNull()
    expect(clearSpy).toHaveBeenCalled()
  })
})
