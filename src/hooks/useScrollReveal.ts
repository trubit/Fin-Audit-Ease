import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * useScrollReveal
 * Lightweight, performant IntersectionObserver that progressively reveals elements
 * as the user scrolls down the page without causing React re-renders.
 * Automatically respects prefers-reduced-motion and re-synchronizes when the active
 * application language changes.
 */
export function useScrollReveal() {
  const { i18n } = useTranslation()
  const currentLang = i18n.language

  useEffect(() => {
    // If user prefers reduced motion, make everything visible immediately
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
        el.classList.add('is-visible')
      })
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            // Unobserve once revealed to keep memory footprint minimal
            observer.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.1,
      }
    )

    // Schedule query after DOM layout flush to account for any language-driven re-renders
    const timer = requestAnimationFrame(() => {
      const elements = document.querySelectorAll('.reveal-on-scroll')
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect()
        // If element is already in or above the visible viewport, mark visible immediately
        if (rect.top <= viewportHeight) {
          el.classList.add('is-visible')
        } else {
          observer.observe(el)
        }
      })
    })

    return () => {
      cancelAnimationFrame(timer)
      observer.disconnect()
    }
  }, [currentLang])
}

