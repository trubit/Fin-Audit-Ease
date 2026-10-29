import { create } from 'zustand'

export interface SessionState {
  lastActiveTimestamp: number
  isWarningModalOpen: boolean
  sessionExpiredNotice: boolean
  recordUserActivity: () => void
  openWarningModal: () => void
  closeWarningModal: () => void
  triggerSessionExpired: () => void
  clearSessionExpiredNotice: () => void
  resetSessionState: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  lastActiveTimestamp: Date.now(),
  isWarningModalOpen: false,
  sessionExpiredNotice: false,
  recordUserActivity: () =>
    set({
      lastActiveTimestamp: Date.now(),
      isWarningModalOpen: false,
    }),
  openWarningModal: () => set({ isWarningModalOpen: true }),
  closeWarningModal: () => set({ isWarningModalOpen: false }),
  triggerSessionExpired: () =>
    set({
      isWarningModalOpen: false,
      sessionExpiredNotice: true,
      lastActiveTimestamp: Date.now(),
    }),
  clearSessionExpiredNotice: () => set({ sessionExpiredNotice: false }),
  resetSessionState: () =>
    set({
      lastActiveTimestamp: Date.now(),
      isWarningModalOpen: false,
      sessionExpiredNotice: false,
    }),
}))
