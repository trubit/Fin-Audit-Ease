/**
 * Accessibility Helpers (WCAG 2.1 AA/AAA compliance).
 */

export const generateAriaDescribedBy = (...ids: (string | undefined | null)[]): string | undefined => {
  const validIds = ids.filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
  return validIds.length > 0 ? validIds.join(' ') : undefined
}

export const trapFocus = (element: HTMLElement, event: KeyboardEvent): void => {
  if (event.key !== 'Tab') return

  const focusable = element.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )

  if (focusable.length === 0) return

  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    last.focus()
    event.preventDefault()
  } else if (!event.shiftKey && document.activeElement === last) {
    first.focus()
    event.preventDefault()
  }
}
