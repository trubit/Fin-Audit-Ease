import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { envConfig } from '@/config/env.config'
import { useSessionStore } from '@/store/sessionStore'
import { useAuthStore } from '@/store/authStore'
import { queryClient } from '@/lib/queryClient'

/**
 * 30-Minute Inactivity Session Hook.
 *
 * Tracks user activity (mouse moves, clicks, keyboard events, touch events, tab visibility).
 * Opens an inactivity warning modal when approaching the timeout,
 * and coordinates graceful expiration and redirection to /login.
 *
 * NOTE: The frontend timer is NOT the security authority.
 * The backend service remains authoritative for JWT/cookie validity.
 */
export const useSessionTimeout = (isAuthenticated = false) => {
  const navigate = useNavigate()
  const throttleRef = useRef<number>(0)

  useEffect(() => {
    if (!isAuthenticated) return

    const {
      recordUserActivity,
      openWarningModal,
      closeWarningModal,
      triggerSessionExpired,
    } = useSessionStore.getState()

    // Evaluates elapsed time against timeout threshold
    const evaluateSessionStatus = () => {
      const { lastActiveTimestamp } = useSessionStore.getState()
      const elapsed = Date.now() - lastActiveTimestamp
      const timeRemaining = envConfig.sessionTimeoutMs - elapsed

      if (timeRemaining <= 0) {
        // Session Expired: clear query cache, clear auth state, trigger expired notice, and route to login
        const currentAuthMode = useAuthStore.getState().authMode
        queryClient.clear()
        useAuthStore.getState().setUnauthenticated()
        triggerSessionExpired()
        if (import.meta.env.DEV && currentAuthMode === 'development') {
          navigate('/dev-login?session_expired=true', { replace: true })
        } else {
          navigate('/login?session_expired=true', { replace: true })
        }
      } else if (timeRemaining <= envConfig.sessionWarningMs) {
        // Warning threshold reached
        openWarningModal()
      } else {
        closeWarningModal()
      }
    }

    // Throttle user activity events to run at most once every 5 seconds
    const handleActivity = () => {
      const now = Date.now()
      if (now - throttleRef.current > 5000) {
        throttleRef.current = now
        recordUserActivity()
      }
    }

    // Handle tab visibility change immediately when user returns to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        evaluateSessionStatus()
      }
    }

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart']
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Periodic check every 10 seconds
    const interval = setInterval(evaluateSessionStatus, 10000)

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(interval)
    }
  }, [isAuthenticated, navigate])
}
