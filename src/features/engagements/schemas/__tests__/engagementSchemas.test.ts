import { describe, it, expect } from 'vitest'
import { createEngagementSchema } from '../engagementSchemas'

describe('createEngagementSchema', () => {
  it('validates a valid engagement payload', () => {
    const validData = {
      title: 'Statutory Financial Audit 2026',
      clientOrganizationName: 'Dangote Industries Limited',
      fiscalYear: 2026,
      startDate: '2026-10-01',
      targetCompletionDate: '2026-12-31',
    }

    const result = createEngagementSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejects short title', () => {
    const invalidData = {
      title: 'Au',
      clientOrganizationName: 'Dangote Industries Limited',
      fiscalYear: 2026,
      startDate: '2026-10-01',
      targetCompletionDate: '2026-12-31',
    }

    const result = createEngagementSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('rejects missing client organization name', () => {
    const invalidData = {
      title: 'Statutory Financial Audit 2026',
      clientOrganizationName: 'A',
      fiscalYear: 2026,
      startDate: '2026-10-01',
      targetCompletionDate: '2026-12-31',
    }

    const result = createEngagementSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('rejects target completion date earlier than start date', () => {
    const invalidData = {
      title: 'Statutory Financial Audit 2026',
      clientOrganizationName: 'Dangote Industries Limited',
      fiscalYear: 2026,
      startDate: '2026-12-31',
      targetCompletionDate: '2026-10-01',
    }

    const result = createEngagementSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Target completion date must be on or after the start date'
      )
    }
  })
})
