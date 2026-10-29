import { describe, it, expect, beforeEach } from 'vitest'
import { useSessionStore } from '../sessionStore'

describe('Session Store Inactivity & Warning Logic', () => {
  beforeEach(() => {
    useSessionStore.getState().resetSessionState()
  })

  it('initializes with modal closed and expired notice false', () => {
    const state = useSessionStore.getState()
    expect(state.isWarningModalOpen).toBe(false)
    expect(state.sessionExpiredNotice).toBe(false)
    expect(state.lastActiveTimestamp).toBeGreaterThan(0)
  })

  it('updates lastActiveTimestamp and closes modal on recordUserActivity', () => {
    useSessionStore.getState().openWarningModal()
    expect(useSessionStore.getState().isWarningModalOpen).toBe(true)

    const initialTime = useSessionStore.getState().lastActiveTimestamp
    // Simulate activity later
    useSessionStore.getState().recordUserActivity()

    const state = useSessionStore.getState()
    expect(state.isWarningModalOpen).toBe(false)
    expect(state.lastActiveTimestamp).toBeGreaterThanOrEqual(initialTime)
  })

  it('manages warning modal open and close states', () => {
    useSessionStore.getState().openWarningModal()
    expect(useSessionStore.getState().isWarningModalOpen).toBe(true)

    useSessionStore.getState().closeWarningModal()
    expect(useSessionStore.getState().isWarningModalOpen).toBe(false)
  })

  it('triggers session expiration and sets expired notice', () => {
    useSessionStore.getState().openWarningModal()
    useSessionStore.getState().triggerSessionExpired()

    const state = useSessionStore.getState()
    expect(state.isWarningModalOpen).toBe(false)
    expect(state.sessionExpiredNotice).toBe(true)
  })

  it('clears session expired notice', () => {
    useSessionStore.getState().triggerSessionExpired()
    expect(useSessionStore.getState().sessionExpiredNotice).toBe(true)

    useSessionStore.getState().clearSessionExpiredNotice()
    expect(useSessionStore.getState().sessionExpiredNotice).toBe(false)
  })
})
