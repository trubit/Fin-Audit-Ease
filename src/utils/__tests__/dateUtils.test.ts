import { describe, it, expect } from 'vitest'
import { formatDate, getDeadlineInfo, getYearEndInfo } from '../dateUtils'

describe('Date and Countdown Utilities', () => {
  it('formats ISO dates accurately', () => {
    const formatted = formatDate('2026-10-15T00:00:00Z')
    expect(formatted).toContain('2026')
    expect(formatted).toContain('Oct')
  })

  it('handles missing date gracefully', () => {
    expect(formatDate(undefined)).toBe('—')
    expect(formatDate('')).toBe('—')
  })

  it('calculates future on-track deadline status', () => {
    const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
    const info = getDeadlineInfo(futureDate)
    expect(info.status).toBe('on_track')
    expect(info.daysRemaining).toBeGreaterThanOrEqual(9)
    expect(info.label).toContain('days remaining')
  })

  it('calculates due soon deadline status', () => {
    const tomorrowDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
    const info = getDeadlineInfo(tomorrowDate)
    expect(info.status).toBe('due_soon')
  })

  it('calculates overdue deadline status', () => {
    const pastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    const info = getDeadlineInfo(pastDate)
    expect(info.status).toBe('overdue')
    expect(info.daysRemaining).toBeLessThan(0)
    expect(info.label).toContain('Overdue')
  })

  it('handles undefined deadline without errors', () => {
    const info = getDeadlineInfo(undefined)
    expect(info.status).toBe('none')
    expect(info.label).toContain('No deadline')
  })

  it('calculates Year-End countdown and 6-month pre-audit runway', () => {
    const now = Date.now()
    // 90 days ahead (< 180 days -> runway active)
    const activeRunwayDate = new Date(now + 90 * 24 * 60 * 60 * 1000).toISOString()
    const activeInfo = getYearEndInfo(activeRunwayDate)
    expect(activeInfo.isPassed).toBe(false)
    expect(activeInfo.isPreAuditRunwayActive).toBe(true)
    expect(activeInfo.daysRemaining).toBeGreaterThanOrEqual(89)

    // 250 days ahead (> 180 days -> runway not active yet)
    const farDate = new Date(now + 250 * 24 * 60 * 60 * 1000).toISOString()
    const farInfo = getYearEndInfo(farDate)
    expect(farInfo.isPassed).toBe(false)
    expect(farInfo.isPreAuditRunwayActive).toBe(false)

    // Past date
    const pastDate = new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString()
    const pastInfo = getYearEndInfo(pastDate)
    expect(pastInfo.isPassed).toBe(true)
    expect(pastInfo.label).toBe('Year-end passed')

    // Undefined
    const emptyInfo = getYearEndInfo(undefined)
    expect(emptyInfo.label).toBe('Not set')
  })
})

