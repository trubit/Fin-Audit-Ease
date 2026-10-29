import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '../authStore'
import type { UserProfile } from '@/features/auth/types'

describe('Auth Store State Transitions', () => {
  beforeEach(() => {
    useAuthStore.getState().setUnauthenticated()
  })

  it('initializes in an unauthenticated state with null user', () => {
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.status).toBe('unauthenticated')
  })

  it('updates state correctly on setAuthenticatedUser', () => {
    const mockUser: UserProfile = {
      id: 'usr_001',
      email: 'lead.auditor@firm.ng',
      fullName: 'Adebayo Ogunlesi',
      role: 'AUDITOR',
      organizationId: 'org_001',
      organizationName: 'Global Audit Partners',
      isTwoFactorEnabled: true,
      membershipNumber: 'ICAN/2026/001',
      createdAt: '2026-10-01T00:00:00Z',
    }

    useAuthStore.getState().setAuthenticatedUser(mockUser)

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toEqual(mockUser)
    expect(state.status).toBe('authenticated')
  })

  it('clears user profile and authentic state on setUnauthenticated', () => {
    const mockUser: UserProfile = {
      id: 'usr_002',
      email: 'finance.lead@corp.ng',
      fullName: 'Chinua Achebe',
      role: 'FINANCE_USER',
      organizationId: 'org_002',
      organizationName: 'Corporate Treasury PLC',
      isTwoFactorEnabled: false,
      createdAt: '2026-10-01T00:00:00Z',
    }

    useAuthStore.getState().setAuthenticatedUser(mockUser)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)

    useAuthStore.getState().setUnauthenticated()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.status).toBe('unauthenticated')
  })

  it('updates loading status via setLoading', () => {
    useAuthStore.getState().setLoading(true)
    expect(useAuthStore.getState().status).toBe('loading')

    useAuthStore.getState().setLoading(false)
    expect(useAuthStore.getState().status).toBe('unauthenticated')
  })
})
